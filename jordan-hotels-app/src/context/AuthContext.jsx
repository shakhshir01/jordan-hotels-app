import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import { Auth } from 'aws-amplify';
import { UserPool } from '../authConfig';
import { setAuthToken, hotelAPI } from '../services/api';
import { showSuccess, showError } from '../services/toastService';
import { deriveNameFromEmail, loadSavedProfile, saveProfile } from '../utils/userProfile';

const AuthContext = createContext(null);

export { AuthContext };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mfaChallenge, setMfaChallenge] = useState(null);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaMethod, setMfaMethod] = useState(null);
  const [pendingSecondaryEmail, setPendingSecondaryEmail] = useState(null);
  const cognitoUserRef = useRef(null);
  const forgotPasswordUserRef = useRef(null);

  const setUserAndProfileFromEmail = useCallback(async (emailOrUser) => {
    // Handle both email string and Amplify user object
    let email, attributes = {};
    
    if (typeof emailOrUser === 'string') {
      email = emailOrUser;
    } else {
      // It's an Amplify user object
      const amplifyUser = emailOrUser;
      attributes = amplifyUser.attributes || {};
      // For OAuth users, prioritize email from attributes over username
      email = attributes.email || amplifyUser.username;
    }
    
    // Debug: Log all attributes to see what's available
    console.log('User attributes received:', attributes);
    console.log('Username:', email);
    
    // For OAuth users, try to get name from attributes
    // Check multiple possible attribute names that different providers might use
    const givenName = attributes.given_name || attributes['custom:firstName'] || attributes.firstName || attributes.firstname;
    const familyName = attributes.family_name || attributes['custom:lastName'] || attributes.lastName || attributes.lastname;
    let fullName = attributes.name || attributes.fullName || attributes.displayName;
    
    // Also check for Google-specific attributes
    const googleName = attributes['identities'] ? 
      attributes.identities.find(id => id.providerName === 'Google')?.name : null;
    
    // For Google OAuth, if we don't have name attributes, try to extract from email
    let hasOAuthName = givenName || familyName || fullName || googleName;
    
    // Special handling for Google OAuth - if username looks like a Google ID, don't use it
    const isGoogleId = email && email.startsWith('Google ') && email.match(/^\w+ \d+$/);
    if (isGoogleId && !hasOAuthName) {
      // For Google users without name attributes, derive from email if possible
      const emailPart = attributes.email || '';
      if (emailPart.includes('@')) {
        const localPart = emailPart.split('@')[0];
        // Try to make a display name from email local part
        const displayFromEmail = localPart.replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        hasOAuthName = true;
        fullName = displayFromEmail;
      }
    }
    
    if (hasOAuthName) {
      // Use OAuth-provided names
      const firstName = givenName || (fullName ? fullName.split(' ')[0] : '') || (googleName ? googleName.split(' ')[0] : '');
      const lastName = familyName || (fullName && fullName.split(' ').length > 1 ? fullName.split(' ').slice(1).join(' ') : '') || (googleName && googleName.split(' ').length > 1 ? googleName.split(' ').slice(1).join(' ') : '');
      const displayName = [firstName, lastName].filter(Boolean).join(' ') || fullName || googleName || email.split('@')[0];
      
      const profile = {
        email,
        firstName,
        lastName,
        displayName,
        hasCustomName: true, // Mark as having OAuth-provided name
      };
      
      // Save to localStorage for persistence
      saveProfile(email, profile);
      
      // Also save to database if we have names to save
      try {
        await hotelAPI.updateUserProfile({
          firstName: profile.firstName,
          lastName: profile.lastName,
        });
      } catch (error) {
        console.warn('Failed to save OAuth profile to database:', error);
        // Continue anyway - localStorage will preserve the name
      }
      
      setUser({ email });
      setUserProfile(profile);
    } else {
      // Fall back to email-derived names
      const derived = deriveNameFromEmail(email);
      const saved = loadSavedProfile(email);

      // Check if saved profile has a Google ID as display name and try to fix it
      if (saved?.displayName && saved.displayName.match(/^Google \d+$/)) {
        console.log('Detected Google ID as display name, attempting to fix');
        // Try to derive a better name from email
        const emailPart = attributes.email || email;
        if (emailPart.includes('@')) {
          const localPart = emailPart.split('@')[0];
          const displayFromEmail = localPart.replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          saved.displayName = displayFromEmail;
          saved.firstName = displayFromEmail.split(' ')[0] || displayFromEmail;
          saved.lastName = displayFromEmail.split(' ').slice(1).join(' ') || '';
          saveProfile(email, saved);
        }
      }

      const nextProfile = {
        email: derived.email,
        firstName: saved?.firstName || derived.firstName,
        lastName: saved?.lastName || derived.lastName,
        displayName:
          (saved?.firstName || saved?.lastName)
            ? [saved?.firstName, saved?.lastName].filter(Boolean).join(' ')
            : derived.displayName,
        hasCustomName: Boolean(saved?.hasCustomName),
      };

      setUser({ email: derived.email });
      setUserProfile(nextProfile);
    }
  }, []);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Wait for Amplify to be configured
        if (typeof window !== 'undefined' && !window.amplifyConfigured) {
          console.log('Amplify not configured yet, skipping auth check. Flag value:', window.amplifyConfigured);
          setLoading(false);
          return;
        }

        // First check Amplify OAuth authentication
        try {
          const amplifyUser = await Auth.currentAuthenticatedUser();
          if (amplifyUser) {
            console.log('Found existing Amplify user on mount:', amplifyUser);
            await setUserAndProfileFromEmail(amplifyUser);
            // Set auth token from Amplify session
            const session = await Auth.currentSession();
            const idToken = session.getIdToken().getJwtToken();
            setAuthToken(idToken);
            setLoading(false);
            return;
          }
        } catch (authError) {
          if (authError.message && authError.message.includes('Amplify has not been configured')) {
            console.log('Amplify not configured, skipping OAuth check');
            // Continue to Cognito check
          } else {
            console.log('No Amplify user found on mount:', authError.message);
          }
        }

        // Then check traditional Cognito authentication
        if (!UserPool) {
          setLoading(false);
          return;
        }
        const cognitoUser = UserPool.getCurrentUser();
        if (cognitoUser) {
          cognitoUserRef.current = cognitoUser; // Set the ref for MFA operations
          cognitoUser.getSession((err, session) => {
            if (err) {
              setError(err.message);
              setLoading(false);
            } else if (session.isValid()) {
              // Get user attributes to retrieve the actual email
              cognitoUser.getUserAttributes((err, attributes) => {
                if (err) {
                  console.error('Error fetching user attributes:', err);
                  setUser({ email: cognitoUser.getUsername() });
                } else {
                  const emailAttr = attributes?.find(attr => attr.Name === 'email');
                  const email = emailAttr?.Value || cognitoUser.getUsername();
                      setUserAndProfileFromEmail(email);
                      
                      // Load MFA status from database and localStorage
                      (async () => {
                        try {
                          // First check localStorage for immediate UI update
                          const stored = localStorage.getItem(`visit-jo.mfaEnabled.${email}`);
                          if (stored === '1') {
                            setMfaEnabled(true);
                            setMfaMethod('TOTP'); // Assume TOTP if we don't know
                          }
                          
                          // Then check database for authoritative status
                          const profile = await hotelAPI.getUserProfile();
                          if (profile?.mfaEnabled) {
                            // Persist MFA status for UI, but DO NOT force a verification
                            // flow on page refresh. Only require MFA at login or when
                            // explicitly triggered (logout flow, new session, etc.).
                            setMfaEnabled(true);
                            setMfaMethod(profile.mfaMethod || 'TOTP');
                            localStorage.setItem(`visit-jo.mfaEnabled.${email}`, '1');
                          } else if (stored === '1' && !profile?.mfaEnabled) {
                            // Database says disabled, update localStorage
                            localStorage.removeItem(`visit-jo.mfaEnabled.${email}`);
                            setMfaEnabled(false);
                            setMfaMethod(null);
                          }
                        } catch (_e) {
                          console.warn('Failed reading MFA status', _e);
                          // Fallback to localStorage only
                          const stored = localStorage.getItem(`visit-jo.mfaEnabled.${email}`);
                          if (stored === '1') {
                            setMfaEnabled(true);
                            setMfaMethod('TOTP'); // Assume TOTP if we don't know
                          } else {
                            setMfaEnabled(false);
                            setMfaMethod(null);
                          }
                        }
                      })();
                }
                try {
                  const idToken = session.getIdToken().getJwtToken();
                  setAuthToken(idToken);
                } catch (e) {
                  console.warn('Failed to set auth token from session', e);
                }
                setLoading(false);
              });
            } else {
              setLoading(false);
            }
          });
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error checking session:', err);
        setLoading(false);
      }
    };

    // Delay to ensure Amplify is configured
    const timer = setTimeout(checkAuth, 3000);
    return () => clearTimeout(timer);
  }, [setUserAndProfileFromEmail]);

  // Listen for Amplify authentication state changes (for OAuth)
  useEffect(() => {
    let isMounted = true;

    const checkAmplifyAuth = async () => {
      try {
        // Check if Amplify is configured by trying to access the config
        const config = await Auth.configure();
        if (!config || !config.userPoolId) {
          console.log('Amplify not yet configured, skipping auth check');
          return;
        }

        const user = await Auth.currentAuthenticatedUser();
        if (user && isMounted) {
          console.log('Amplify user found:', user);
          const email = user.attributes?.email || user.username;
          if (email) {
            setUserAndProfileFromEmail(email);
            // Set auth token from Amplify session
            const session = await Auth.currentSession();
            const idToken = session.getIdToken().getJwtToken();
            setAuthToken(idToken);
          }
        }
      } catch (error) {
        // User not authenticated with Amplify, or Amplify not configured yet
        if (error.name === 'NoUserPoolError' || error.message?.includes('not been configured')) {
          console.log('Amplify not configured yet, will retry later');
        } else {
          console.log('No Amplify user session found');
        }
      }
    };

    // Check initial auth state with a delay to ensure Amplify is configured
    const timer = setTimeout(() => {
      checkAmplifyAuth();
    }, 1000);

    // Listen for auth events
    const authListener = (data) => {
      console.log('Amplify auth event:', data.payload.event);
      switch (data.payload.event) {
        case 'signIn':
          console.log('User signed in via Amplify');
          // Small delay to ensure tokens are processed
          setTimeout(() => checkAmplifyAuth(), 500);
          break;
        case 'signOut':
          console.log('User signed out via Amplify');
          setUser(null);
          setUserProfile(null);
          setAuthToken(null);
          break;
        case 'tokenRefresh':
          console.log('Token refreshed');
          checkAmplifyAuth();
          break;
        case 'configured':
          console.log('Amplify configured, checking auth');
          checkAmplifyAuth();
          break;
      }
    };

    // Import Hub dynamically to avoid issues
    import('aws-amplify').then(({ Hub }) => {
      Hub.listen('auth', authListener);
    });

    return () => {
      clearTimeout(timer);
      isMounted = false;
    };
  }, [setUserAndProfileFromEmail]);

  const signUp = useCallback(async (email, password, fullName) => {
    return new Promise((resolve, reject) => {
      if (!UserPool) {
        const error = new Error('Authentication service unavailable');
        setError(error.message);
        showError('Unable to create account. Please try again later.');
        reject(error);
        return;
      }

      // Create user attributes array with the required 'name' attribute for Cognito schema
      const userAttributes = [
        {
          Name: 'email',
          Value: email,
        },
        {
          Name: 'name',
          Value: fullName || email.split('@')[0],
        }
      ];

      UserPool.signUp(email, password, userAttributes, null, (err, data) => {
        if (err) {
          console.error('Cognito signup failed:', err);
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }, []);

  const login = useCallback(async (email, password) => {
    return new Promise((resolve, reject) => {
      if (!UserPool) {
        const error = new Error('Authentication service unavailable');
        setError(error.message);
        showError('Unable to sign in. Please try again later.');
        reject(error);
        return;
      }

      console.log('Attempting login for:', email);
      console.log('UserPool config:', {
        userPoolId: UserPool.getUserPoolId(),
        clientId: UserPool.getClientId()
      });

      // Always authenticate first, then check MFA status from database
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: UserPool,
      });
      cognitoUserRef.current = cognitoUser;

      const authDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });

      // Temporarily suppress console.error to hide Cognito network errors
      const originalConsoleError = console.error;
      console.error = () => {}; // Suppress errors

      cognitoUser.authenticateUser(authDetails, {
        onSuccess: async (session) => {
          console.error = originalConsoleError; // Restore

          // Set auth token first so we can fetch user profile
          try {
            const idToken = session.getIdToken().getJwtToken();
            setAuthToken(idToken);
          } catch (e) {
            console.warn('Failed to set auth token on login', e);
          }

          // Load user profile to check MFA status
          let profile = null;
          try {
            profile = await hotelAPI.getUserProfile();
          } catch (_e) {
            console.warn('Failed to load profile on login', _e);
          }

          const mfaEnabled = profile?.mfaEnabled;
          const mfaMethod = profile?.mfaMethod;

          if (mfaEnabled) {
            setMfaEnabled(true);
            setMfaMethod(mfaMethod || 'TOTP');
            localStorage.setItem(`visit-jo.mfaEnabled.${email}`, '1');
            localStorage.setItem(`visit-jo.mfaMethod.${email}`, mfaMethod || 'TOTP');

            if (mfaMethod === 'EMAIL') {
              // For email MFA, send a verification code to the secondary email
              if (!profile.mfaSecondaryEmail) {
                console.error('Email MFA enabled but no secondary email found in profile');
                showError('Email MFA is enabled but no secondary email is configured. Please disable and re-enable MFA.');
                // Fall back to TOTP
                setMfaChallenge({ type: 'TOTP_MFA', message: 'Enter your authenticator code', email });
              } else {
                try {
                  console.log('Sending login MFA code to:', profile.mfaSecondaryEmail);
                  await hotelAPI.sendLoginMfaCode(profile.mfaSecondaryEmail, profile.userId);
                  setMfaChallenge({ 
                    type: 'EMAIL_MFA', 
                    message: 'Enter the code sent to your email', 
                    email: profile.mfaSecondaryEmail 
                  });
                } catch (emailError) {
                  console.error('Failed to send login MFA code:', emailError);
                  showError('Failed to send email verification code. Please try again or use authenticator app.');
                  // Fall back to TOTP if email fails
                  setMfaChallenge({ type: 'TOTP_MFA', message: 'Enter your authenticator code', email });
                }
              }
            } else {
              // Default to TOTP MFA challenge
              setMfaChallenge({ type: 'TOTP_MFA', message: 'Enter your authenticator code', email });
            }

            resolve({ mfaRequired: true });
          } else {
            // No MFA, complete login
            setUserAndProfileFromEmail(email);

            setMfaEnabled(false);
            setMfaMethod(null);
            localStorage.removeItem(`visit-jo.mfaEnabled.${email}`);
            localStorage.removeItem(`visit-jo.mfaMethod.${email}`);
            setError(null);
            showSuccess(`Welcome back, ${email}!`);
            resolve({ success: true });
          }
        },
        onFailure: (err) => {
          console.error = originalConsoleError; // Restore
          console.error('Cognito authentication failed:', err);
          console.error('Error code:', err.code);
          console.error('Error message:', err.message);

          setError(err.message);
          showError('Invalid email or password');
          reject(new Error('Invalid email or password'));
        },
        // Handle possible Cognito challenges by exposing them to the UI
        mfaRequired: (challengeName, challengeParameters) => {
          console.error = originalConsoleError; // Restore
          setMfaChallenge({ type: 'SMS_MFA', challengeName, challengeParameters });
          resolve({ mfaRequired: true });
        },
        selectMFAType: (challengeName, challengeParameters) => {
          console.error = originalConsoleError; // Restore
          setMfaChallenge({ type: 'SELECT_MFA_TYPE', challengeName, challengeParameters });
          resolve({ mfaRequired: true });
        },
        mfaSetup: (challengeName, challengeParameters) => {
          console.error = originalConsoleError; // Restore
          setMfaChallenge({ type: 'MFA_SETUP', challengeName, challengeParameters });
          resolve({ mfaRequired: true });
        },
        totpRequired: (challengeName, challengeParameters) => {
          console.error = originalConsoleError; // Restore
          setMfaChallenge({ type: 'SOFTWARE_TOKEN_MFA', challengeName, challengeParameters });
          resolve({ mfaRequired: true });
        },
        customChallenge: (challengeParameters) => {
          console.error = originalConsoleError; // Restore
          setMfaChallenge({ type: 'CUSTOM_CHALLENGE', challengeParameters });
          resolve({ mfaRequired: true });
        },
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          console.error = originalConsoleError; // Restore
          setMfaChallenge({ type: 'NEW_PASSWORD_REQUIRED', userAttributes, requiredAttributes });
          resolve({ mfaRequired: true });
        },
      });
    });
  }, [setUserAndProfileFromEmail]);

  const performLogout = useCallback(() => {
    try {
      if (UserPool) {
        const cognitoUser = UserPool.getCurrentUser();
        if (cognitoUser) cognitoUser.signOut();
      }
    } catch (e) {
      console.warn('Error during Cognito signOut', e);
    }

    setUser(null);
    setUserProfile(null);
    setAuthToken(null);
    setError(null);
    try {
      const email = cognitoUserRef.current?.getUsername?.() || null;
      if (email) localStorage.removeItem(`visit-jo.mfaEnabled.${email}`);
    } catch (_e) {
      console.warn('Ignored during logout cleanup', _e);
    }
    cognitoUserRef.current = null;
    showSuccess('Logged out successfully');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setUser, setUserProfile, setAuthToken, setError, cognitoUserRef, showSuccess]);

  // Logout entrypoint: if MFA is enabled, trigger a verification flow instead
  // of immediately signing the user out. Returns an object when MFA is required.
  const logout = useCallback(async () => {
    // Do not require MFA to sign out — immediately perform logout.
    // MFA will be required on subsequent sign-in (login flow handles it).
    performLogout();
    return { success: true };
  }, [performLogout]);

  const completePreAuthLogin = useCallback((email) => {
    setUserAndProfileFromEmail(email);
    setMfaEnabled(true);
    setMfaMethod('EMAIL');
    localStorage.setItem(`visit-jo.mfaEnabled.${email}`, '1');
    localStorage.setItem(`visit-jo.mfaMethod.${email}`, 'EMAIL');
    setError(null);
    // Success message handled by caller
  }, [setUserAndProfileFromEmail, setMfaEnabled, setMfaMethod, setError]);

  const clearMfaChallenge = useCallback(() => {
    setMfaChallenge(null);
  }, []);

  const completeMfa = useCallback((session) => {
    const email = cognitoUserRef.current?.getUsername();
    if (email) {
      setUserAndProfileFromEmail(email);
    }
    try {
      const idToken = session.getIdToken().getJwtToken();
      setAuthToken(idToken);
    } catch (e) {
      console.warn('Failed to set auth token on MFA', e);
    }
    setError(null);
    showSuccess(`Welcome back!`);
    clearMfaChallenge();
    setLoading(false); // Complete loading when MFA is verified
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cognitoUserRef, setUserAndProfileFromEmail, setAuthToken, setError, showSuccess, clearMfaChallenge, setLoading]);

  const openEmailSetup = useCallback(() => {
    setMfaChallenge({ type: 'EMAIL_SETUP' });
  }, []);

  const submitMfaCode = useCallback((code, mfaType) => {
    const cognitoUser = cognitoUserRef.current;
    if (!cognitoUser) return Promise.reject(new Error('No active Cognito user for MFA'));
    return new Promise((resolve, reject) => {
      cognitoUser.sendMFACode(code, {
        onSuccess: (session) => {
          try {
            const idToken = session.getIdToken().getJwtToken();
            setAuthToken(idToken);
          } catch (_e) { console.warn('Ignored during login token set', _e); }
          setUserAndProfileFromEmail(cognitoUser.getUsername());
          try {
            const email = cognitoUser.getUsername();
            localStorage.setItem(`visit-jo.mfaEnabled.${email}`, '1');
          } catch (_e) { console.warn('Ignored during login token set', _e); }
          setMfaEnabled(true);
          // Set the correct MFA method based on the type used
          const method = mfaType === 'SOFTWARE_TOKEN_MFA' ? 'TOTP' : mfaType === 'SMS_MFA' ? 'SMS' : 'TOTP';
          setMfaMethod(method);
          // persist server-side if possible
          try {
            hotelAPI.updateUserProfile({ mfaEnabled: true, mfaMethod: method }).catch(() => {});
          } catch (_e) { console.warn('Ignored during session refresh', _e); }
          clearMfaChallenge();
          showSuccess('MFA verified');
          // If this MFA verification was requested as part of a logout flow,
          // complete the logout after verification.
          if (mfaChallenge?.pendingLogout) {
            try {
              clearMfaChallenge();
              performLogout();
            } catch (_e) { console.warn('performLogout failed after MFA', _e); }
            resolve({ loggedOut: true });
            return;
          }

          resolve(session);
        },
        onFailure: (err) => {
          setError(err.message || String(err));
          reject(err);
        },
      }, mfaType || undefined);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cognitoUserRef, setAuthToken, setUserAndProfileFromEmail, setMfaEnabled, setMfaMethod, clearMfaChallenge, showSuccess, mfaChallenge, performLogout, setError]);

  const setupTotp = useCallback(async () => {
    try {
      const response = await hotelAPI.post('/user/mfa/totp/setup');
      const { secret, qrCode, otpauthUrl } = response;
      console.log('TOTP setup response:', { secret: secret.substring(0, 10) + '...', qrCode: qrCode.substring(0, 50) + '...', otpauthUrl });
      setMfaChallenge((prev) => ({ ...(prev || {}), type: 'MFA_SETUP_TOTP', secret, qrCode, otpauthUrl }));
      return { secret, qrCode, otpauthUrl };
    } catch (error) {
      console.error('TOTP setup failed:', error);
      setError(error.message || 'Failed to setup TOTP');
      throw error;
    }
  }, [setError, setMfaChallenge]);

  const verifyTotp = useCallback(async (userCode) => {
    try {
      const response = await hotelAPI.post('/user/mfa/totp/verify', { code: userCode });
      if (response.verified) {
        showSuccess('Two-factor authentication enabled');
        try {
          const email = cognitoUserRef.current?.getUsername?.() || user?.email;
          if (email) localStorage.setItem(`visit-jo.mfaEnabled.${email}`, '1');
        } catch (_e) { console.warn('Ignored while persisting MFA state', _e); }
        setMfaEnabled(true);
        setMfaMethod('TOTP');

        // persist server-side
        try {
          await hotelAPI.updateUserProfile({ mfaEnabled: true, mfaMethod: 'TOTP' });
          console.log('MFA status saved to database');
        } catch (e) {
          console.error('Failed to save MFA status to database:', e);
          showError('2FA enabled but failed to save status. Please try again.');
        }

        clearMfaChallenge();
        return response;
      } else {
        throw new Error('Invalid code');
      }
    } catch (error) {
      console.error('TOTP verification failed:', error);
      let userFriendlyMessage = 'Failed to verify TOTP code';

      if (error.message?.includes('Invalid code')) {
        userFriendlyMessage = 'Code mismatch. Please check that:\n• Your device time is correct\n• You entered the code correctly\n• You scanned the QR code properly\n• Try generating a new code if the previous one expired';

        // For retry, we can re-setup TOTP
        try {
          await setupTotp();
          showError('TOTP code mismatch — a new QR/secret was generated. Please re-scan and try again.');
        } catch (_e) {
          console.warn('Failed to re-setup TOTP after failure', _e);
        }
      }

      setError(userFriendlyMessage);
      throw error;
    }
  }, [setMfaEnabled, setMfaMethod, clearMfaChallenge, setError, setupTotp, user]);

  const verifyLoginTotp = useCallback(async (userCode) => {
    try {
      const response = await hotelAPI.verifyLoginTotpMfa(userCode);
      if (response.verified) {
        clearMfaChallenge();
        return response;
      } else {
        throw new Error('Invalid code');
      }
    } catch (error) {
      console.error('Login TOTP verification failed:', error);
      setError('Invalid authenticator code');
      throw error;
    }
  }, [clearMfaChallenge, setError]);

  // Email MFA flows (secondary address)
  const setupEmailMfa = useCallback(async (secondaryEmail) => {
    if (!secondaryEmail) throw new Error('Secondary email required');
    // Disallow using primary/registered email as secondary
    const primary = user?.email || cognitoUserRef.current?.getUsername?.();
    if (primary && String(primary).trim().toLowerCase() === String(secondaryEmail).trim().toLowerCase()) {
      const msg = 'Secondary email must be different from your primary account email';
      setError(msg);
      showError(msg);
      throw new Error(msg);
    }
    try {
      setPendingSecondaryEmail(secondaryEmail);
      const res = await hotelAPI.setupEmailMfa(secondaryEmail);
      showSuccess('Verification email sent to secondary address');
      // Set challenge for code verification
      setMfaChallenge({ type: 'EMAIL_VERIFY', email: secondaryEmail });
      return res;
    } catch (e) {
      setError(e?.message || String(e));
      showError(e?.message || 'Failed to send verification email');
      throw e;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, cognitoUserRef, setError, showError, setPendingSecondaryEmail, showSuccess]);

  const setupTotpMfa = useCallback(async () => {
    try {
      const res = await hotelAPI.setupTotpMfa();
      // Set up the challenge for TOTP setup
      setMfaChallenge({ type: 'TOTP_SETUP', secret: res.secret, qrCode: res.qrCode, otpauthUrl: res.otpauthUrl });
      return res;
    } catch (e) {
      setError(e?.message || String(e));
      showError(e?.message || 'Failed to setup TOTP MFA');
      throw e;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelAPI, setMfaChallenge, setError, showError]);

  const verifyTotpMfa = useCallback(async (code) => {
    try {
      const res = await hotelAPI.verifyTotpMfa(code);
      // on success, persist state
      const cognitoUser = cognitoUserRef.current || UserPool?.getCurrentUser();
      try {
        const email = cognitoUser?.getUsername?.() || user?.email;
        if (email) localStorage.setItem(`visit-jo.mfaEnabled.${email}`, '1');
      } catch (_e) { console.warn('Ignored while persisting local MFA flag', _e); }
      setMfaEnabled(true);
      setMfaMethod('TOTP');
      // persist server-side profile with method
      try {
        await hotelAPI.updateUserProfile({ mfaEnabled: true, mfaMethod: 'TOTP' });
        console.log('TOTP MFA status saved to database');
      } catch (e) {
        console.error('Failed to save TOTP MFA status to database:', e);
        showError('TOTP MFA enabled but failed to save status. Please try again.');
      }
      showSuccess('TOTP MFA enabled');
      return res;
    } catch (e) {
      setError(e?.message || String(e));
      showError(e?.message || 'Failed to verify TOTP code');
      throw e;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelAPI, cognitoUserRef, UserPool, user, setMfaEnabled, setMfaMethod, showSuccess, setError, showError]);

  const verifyEmailMfa = useCallback(async (code) => {
    try {
      const res = await hotelAPI.verifyEmailMfa(code);
      // on success, persist state
      const cognitoUser = cognitoUserRef.current || UserPool?.getCurrentUser();
      try {
        const email = cognitoUser?.getUsername?.() || user?.email;
        if (email) localStorage.setItem(`visit-jo.mfaEnabled.${email}`, '1');
      } catch (_e) { console.warn('Ignored while persisting local MFA flag', _e); }
      setMfaEnabled(true);
      setMfaMethod('EMAIL');
      // persist server-side profile with method and secondary email
      try {
        await hotelAPI.updateUserProfile({ mfaEnabled: true, mfaMethod: 'EMAIL', mfaSecondaryEmail: pendingSecondaryEmail });
        console.log('Email MFA status saved to database');
      } catch (e) {
        console.error('Failed to save email MFA status to database:', e);
        showError('Email MFA enabled but failed to save status. Please try again.');
      }
      showSuccess('Email MFA enabled');
      clearMfaChallenge();
      return res;
    } catch (e) {
      setError(e?.message || String(e));
      showError(e?.message || 'Failed to verify code');
      throw e;
    } finally {
      setPendingSecondaryEmail(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelAPI, cognitoUserRef, UserPool, user, setMfaEnabled, setMfaMethod, pendingSecondaryEmail, showSuccess, setError, showError, setPendingSecondaryEmail]);

  const verifyLoginEmailMfa = useCallback(async (code) => {
    try {
      const res = await hotelAPI.verifyLoginMfaCode(code);
      // Complete the login process
      const cognitoUser = cognitoUserRef.current;
      if (cognitoUser) {
        cognitoUser.getSession((err, session) => {
          if (err) {
            console.error('Failed to get session after email MFA verification:', err);
            showError('Login failed after MFA verification');
            return;
          }
          completeMfa(session);
        });
      }
      clearMfaChallenge();
      return res;
    } catch (e) {
      setError(e?.message || String(e));
      showError(e?.message || 'Failed to verify login code');
      throw e;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelAPI, cognitoUserRef, completeMfa, showError, setError, clearMfaChallenge]);

  const verifyLoginTotpMfa = useCallback(async (code) => {
    try {
      const res = await hotelAPI.verifyLoginTotpMfa(code);
      // If this was a logout-initiated verification, perform logout now
      if (mfaChallenge?.pendingLogout) {
        try {
          clearMfaChallenge();
          performLogout();
        } catch (_e) { console.warn('performLogout failed after TOTP login verification', _e); }
        return { loggedOut: true };
      }
      return res;
    } catch (e) {
      setError(e?.message || String(e));
      showError(e?.message || 'Failed to verify TOTP code');
      throw e;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mfaChallenge, clearMfaChallenge, performLogout, setError, showError]);

  const disableMfa = useCallback(async () => {
    try {
      const cognitoUser = cognitoUserRef.current || UserPool?.getCurrentUser();
      if (!cognitoUser) {
        throw new Error('No active user session to disable MFA');
      }

      // Check if user has a valid session before trying to disable MFA in Cognito
      const hasValidSession = await new Promise((resolve) => {
        cognitoUser.getSession((err, session) => {
          if (err || !session || !session.isValid()) {
            resolve(false);
          } else {
            resolve(true);
          }
        });
      });

      if (hasValidSession) {
        // Check current MFA preferences before disabling
        try {
          await new Promise((resolve) => {
            cognitoUser.getUserMfaPreference((err, smsSettings, totpSettings) => {
              if (err) {
                console.warn('Could not get current MFA preferences:', err);
                resolve(null);
              } else {
                console.log('Current MFA preferences - SMS:', smsSettings, 'TOTP:', totpSettings);
                resolve({ sms: smsSettings, totp: totpSettings });
              }
            });
          });
        } catch (e) {
          console.warn('Failed to check current MFA preferences:', e);
        }

        // Try to disable MFA in Cognito for both SMS and TOTP
        await new Promise((resolve, _reject) => {
          cognitoUser.setUserMfaPreference(
            null, // SMS MFA - set to null to disable
            null, // TOTP MFA - set to null to disable
            (err, result) => {
              if (err) {
                console.error('Failed to disable MFA in Cognito:', err);
                // Continue anyway - this is not critical for our custom MFA
                console.warn('Continuing with database update despite Cognito MFA disable failure');
                resolve(null);
              } else {
                console.log('MFA disabled in Cognito successfully');
                resolve(result);
              }
            }
          );
        });
      } else {
        console.warn('No valid session for Cognito MFA disable, skipping Cognito update');
      }

      // Always update the database
      await hotelAPI.disableMfa();

      // Update local state
      const email = cognitoUser.getUsername?.() || user?.email;
      if (email) {
        localStorage.removeItem(`visit-jo.mfaEnabled.${email}`);
      }
      setMfaEnabled(false);
      setMfaMethod(null);
      showSuccess('MFA disabled');
    } catch (e) {
      console.error('disableMfa error:', e);
      showError(e?.message || 'Failed to disable MFA');
      throw e;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cognitoUserRef, UserPool, user, setMfaEnabled, setMfaMethod, showSuccess, showError]);

  const updateUserProfileName = useCallback((patch) => {
    const email = user?.email;
    if (!email) return;

    const safeFirst = String(patch?.firstName || '').trim();
    const safeLast = String(patch?.lastName || '').trim();
    const hasCustomName = Boolean(safeFirst || safeLast);

    const derived = deriveNameFromEmail(email);
    const next = {
      email,
      firstName: safeFirst || derived.firstName,
      lastName: safeLast || derived.lastName,
      displayName: hasCustomName ? [safeFirst, safeLast].filter(Boolean).join(' ') : derived.displayName,
      hasCustomName,
    };

    setUserProfile(next);
    saveProfile(email, next);
  }, [user?.email, setUserProfile]);

  const verifyEmail = useCallback(async (email, code) => {
    return new Promise((resolve, reject) => {
      if (!UserPool) {
        reject(new Error('Authentication service not available'));
        return;
      }
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: UserPool,
      });

      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          setError(err.message);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }, []);

  const resendConfirmation = useCallback(async (email) => {
    return new Promise((resolve, reject) => {
      if (!UserPool) {
        reject(new Error('Authentication service not available'));
        return;
      }
      const cognitoUser = new CognitoUser({ Username: email, Pool: UserPool });
      cognitoUser.resendConfirmationCode((err, result) => {
        if (err) {
          setError(err.message || err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }, []);

  const forgotPassword = useCallback(async (email) => {
    return new Promise((resolve, reject) => {
      if (!UserPool) {
        reject(new Error('Authentication service not available'));
        return;
      }
      const cognitoUser = new CognitoUser({ Username: email, Pool: UserPool });
      forgotPasswordUserRef.current = cognitoUser;
      cognitoUser.forgotPassword({
        onSuccess: function (data) {
          resolve(data);
        },
        onFailure: function (err) {
          setError(err.message || err);
          reject(err);
        },
        // inputVerificationCode can be handled on the client side flow
      });
    });
  }, []);

  const confirmNewPassword = useCallback(async (email, code, newPassword) => {
    return new Promise((resolve, reject) => {
      if (!UserPool) {
        reject(new Error('Authentication service not available'));
        return;
      }
      const cognitoUser = forgotPasswordUserRef.current || new CognitoUser({ Username: email, Pool: UserPool });
      cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: async function (data) {
          try {
            // After successful password reset, disable MFA
            await hotelAPI.disableMfaByEmail(email);
            console.log('MFA disabled after password reset for:', email);
          } catch (mfaError) {
            console.warn('Failed to disable MFA after password reset:', mfaError);
            // Don't fail the password reset if MFA disable fails
          }
          // Clear the ref after successful password reset
          forgotPasswordUserRef.current = null;
          resolve(data);
        },
        onFailure: function (err) {
          setError(err.message || err);
          reject(err);
        },
      });
    });
  }, []);

  const memoizedUser = useMemo(() => user, [user]);
  const memoizedUserProfile = useMemo(() => userProfile, [userProfile]);

  // Handle tokens returned from Cognito Hosted UI (implicit flow)
  const handleHostedUiToken = useCallback(async (idToken) => {
    if (!idToken) return;
    try {
      setAuthToken(idToken);
    } catch (e) {
      console.warn('Failed to set auth token from Hosted UI', e);
    }

    // Decode token to extract email (client-side only, no verification)
    try {
      const payload = JSON.parse(atob(idToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      const email = payload?.email || payload?.username || payload?.['cognito:username'] || payload?.sub;
      if (email) {
        setUserAndProfileFromEmail(email);

        // Ensure user exists in database for OAuth users
        const derived = deriveNameFromEmail(email);
        const profileData = {
          email: derived.email,
          firstName: derived.firstName,
          lastName: derived.lastName,
          name: derived.displayName,
        };

        try {
          await hotelAPI.updateUserProfile(profileData);
        } catch (e) {
          console.warn('Failed to create/update user profile in database:', e);
        }
      }
    } catch (e) {
      console.warn('Failed to decode Hosted UI id_token', e);
    }
  }, [setUserAndProfileFromEmail]);

  const value = useMemo(() => ({
    user: memoizedUser,
    userProfile: memoizedUserProfile,
    loading,
    error,
    signUp,
    login,
    logout,
    verifyEmail,
    forgotPassword,
    confirmNewPassword,
    resendConfirmation,
    updateUserProfileName,
    // MFA helpers and state
    mfaChallenge,
    submitMfaCode,
    setupTotp,
    verifyTotp,
    verifyLoginTotp,
    clearMfaChallenge,
    completeMfa,
    completePreAuthLogin,
    openEmailSetup,
    mfaEnabled,
    mfaMethod,
    setupEmailMfa,
    verifyEmailMfa,
    verifyLoginEmailMfa,
    setupTotpMfa,
    verifyTotpMfa,
    verifyLoginTotpMfa,
    disableMfa,
    cognitoUserRef,
    isAuthenticated: !!user,
    handleHostedUiToken,
  }), [
    memoizedUser,
    memoizedUserProfile,
    loading,
    error,
    signUp,
    login,
    logout,
    verifyEmail,
    forgotPassword,
    confirmNewPassword,
    resendConfirmation,
    updateUserProfileName,
    mfaChallenge,
    submitMfaCode,
    setupTotp,
    verifyTotp,
    verifyLoginTotp,
    clearMfaChallenge,
    completeMfa,
    completePreAuthLogin,
    openEmailSetup,
    mfaEnabled,
    mfaMethod,
    setupEmailMfa,
    verifyEmailMfa,
    verifyLoginEmailMfa,
    setupTotpMfa,
    verifyTotpMfa,
    verifyLoginTotpMfa,
    disableMfa,
    cognitoUserRef,
    user,
    handleHostedUiToken,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
