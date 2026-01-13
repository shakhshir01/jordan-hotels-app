import React, { createContext, useContext, useState, useEffect } from 'react';
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import { UserPool } from '../authConfig';
import { setAuthToken, hotelAPI } from '../services/api';
import { showSuccess, showError } from '../services/toastService';
import { deriveNameFromEmail, loadSavedProfile, saveProfile } from '../utils/userProfile';

const AuthContext = (typeof window !== 'undefined' && window.AuthContext) || createContext();

if (typeof window !== 'undefined') {
  window.AuthContext = AuthContext;
}

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
  const cognitoUserRef = React.useRef(null);

  const setUserAndProfileFromEmail = (email) => {
    const derived = deriveNameFromEmail(email);
    const saved = loadSavedProfile(email);

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
  };

  // Check if user is already logged in on mount
  useEffect(() => {
    try {
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
                        const stored = localStorage.getItem(`visitjo.mfaEnabled.${email}`);
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
                          localStorage.setItem(`visitjo.mfaEnabled.${email}`, '1');
                        } else if (stored === '1' && !profile?.mfaEnabled) {
                          // Database says disabled, update localStorage
                          localStorage.removeItem(`visitjo.mfaEnabled.${email}`);
                          setMfaEnabled(false);
                          setMfaMethod(null);
                        }
                      } catch (_e) {
                        console.warn('Failed reading MFA status', _e);
                        // Fallback to localStorage only
                        const stored = localStorage.getItem(`visitjo.mfaEnabled.${email}`);
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
  }, []);

  const signUp = async (email, password, fullName) => {
    return new Promise((resolve, reject) => {
      if (!UserPool) {
        reject(new Error('Authentication service not available'));
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
          setError(err.message);
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  };

  const login = async (email, password) => {
    return new Promise((resolve, reject) => {
      if (!UserPool) {
        reject(new Error('Authentication service not available'));
        return;
      }
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
            // MFA is enabled, request MFA challenge
            setUserAndProfileFromEmail(email);
            try {
              const idToken = session.getIdToken().getJwtToken();
              setAuthToken(idToken);
            } catch (e) {
              console.warn('Failed to set auth token on login', e);
            }

            setMfaEnabled(true);
            setMfaMethod(mfaMethod || 'TOTP');
            localStorage.setItem(`visitjo.mfaEnabled.${email}`, '1');

            // Request MFA challenge based on method
            try {
              if (mfaMethod === 'EMAIL') {
                await hotelAPI.requestEmailMfaChallenge();
                setMfaChallenge({ type: 'EMAIL_MFA', message: 'Check your email for the verification code' });
              } else if (mfaMethod === 'TOTP') {
                setMfaChallenge({ type: 'TOTP_MFA', message: 'Enter your TOTP code' });
              } else {
                setMfaChallenge({ type: 'TOTP_MFA', message: 'Enter your TOTP code' }); // Default to TOTP
              }
            } catch (challengeErr) {
              console.error('Failed to request MFA challenge', challengeErr);
              setMfaChallenge({ type: 'TOTP_MFA', message: 'Enter your TOTP code' }); // Fallback
            }

            resolve({ mfaRequired: true });
          } else {
            // No MFA, complete login
            setUserAndProfileFromEmail(email);
            try {
              const idToken = session.getIdToken().getJwtToken();
              setAuthToken(idToken);
            } catch (e) {
              console.warn('Failed to set auth token on login', e);
            }

            setMfaEnabled(false);
            setMfaMethod(null);
            localStorage.removeItem(`visitjo.mfaEnabled.${email}`);
            setError(null);
            showSuccess(`Welcome back, ${email}!`);
            resolve({ success: true });
          }
        },
        onFailure: (err) => {
          console.error = originalConsoleError; // Restore
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
  };

  const performLogout = () => {
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
      if (email) localStorage.removeItem(`visitjo.mfaEnabled.${email}`);
    } catch (_e) {
      console.warn('Ignored during logout cleanup', _e);
    }
    cognitoUserRef.current = null;
    showSuccess('Logged out successfully');
  };

  // Logout entrypoint: if MFA is enabled, trigger a verification flow instead
  // of immediately signing the user out. Returns an object when MFA is required.
  const logout = async () => {
    // Do not require MFA to sign out — immediately perform logout.
    // MFA will be required on subsequent sign-in (login flow handles it).
    performLogout();
    return { success: true };
  };

  const completeMfa = (session) => {
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
  };

  const clearMfaChallenge = () => {
    setMfaChallenge(null);
  };

  const openEmailSetup = () => {
    setMfaChallenge({ type: 'EMAIL_SETUP' });
  };

  const submitMfaCode = (code, mfaType) => {
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
            localStorage.setItem(`visitjo.mfaEnabled.${email}`, '1');
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
  };

  const setupTotp = () => {
    const cognitoUser = cognitoUserRef.current || UserPool?.getCurrentUser();
    console.log('setupTotp: cognitoUser =', cognitoUser);
    if (!cognitoUser) return Promise.reject(new Error('No active user to setup TOTP'));

    return new Promise((resolve, reject) => {
      // Check if user has a valid session
      cognitoUser.getSession((err, session) => {
        if (err) {
          console.error('No valid session for TOTP setup:', err);
          setError('Please sign in again to setup 2FA');
          reject(new Error('Session error'));
          return;
        }

        console.log('Session valid, enabling TOTP MFA first...');
        // First enable TOTP MFA for the user
        cognitoUser.setUserMfaPreference(null, { Enabled: true }, (mfaErr, mfaResult) => {
          if (mfaErr) {
            console.error('Failed to enable TOTP MFA:', mfaErr);
            setError('Failed to enable TOTP MFA');
            reject(mfaErr);
            return;
          }

          console.log('TOTP MFA enabled, now associating software token...');
          cognitoUser.associateSoftwareToken({
            associateSecretCode: (secretCode) => {
              console.log('TOTP secret received:', secretCode);
              setMfaChallenge((prev) => ({ ...(prev || {}), type: 'MFA_SETUP_TOTP', secretCode }));
              resolve(secretCode);
            },
            onFailure: (e) => {
              console.error('TOTP association failed:', e);
              setError(e.message || String(e));
              reject(e);
            },
          });
        });
      });
    });
  };

  const verifyTotp = (userCode, friendlyName = 'My device') => {
    const cognitoUser = cognitoUserRef.current || UserPool?.getCurrentUser();
    console.log('verifyTotp called with userCode:', userCode, 'cognitoUser:', cognitoUser);
    if (!cognitoUser) return Promise.reject(new Error('No active user to verify TOTP'));
    return new Promise((resolve, reject) => {
      cognitoUser.verifySoftwareToken(userCode, friendlyName, {
        onSuccess: async (res) => {
          try {
            showSuccess('Two-factor authentication enabled');
            try {
              const email = cognitoUser.getUsername();
              localStorage.setItem(`visitjo.mfaEnabled.${email}`, '1');
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
              resolve(res);
          } catch (e) {
            console.error('Unexpected error after TOTP verify:', e);
            clearMfaChallenge();
            reject(e);
          }
        },
        onFailure: async (err) => {
          console.error('TOTP verification failed:', err);
          let userFriendlyMessage = 'Failed to verify TOTP code';

          // Provide specific guidance for common errors
          if (err.code === 'EnableSoftwareTokenMFAException' || err.message?.includes('Code mismatch')) {
            userFriendlyMessage = 'Code mismatch. Please check that:\n• Your device time is correct\n• You entered the code correctly\n• You scanned the QR code properly\n• Try generating a new code if the previous one expired';

            // Try to re-associate a new secret so user can re-scan the QR code
            try {
              cognitoUser.associateSoftwareToken({
                associateSecretCode: (secretCode) => {
                  console.log('Re-associated TOTP secret for retry:', secretCode);
                  setMfaChallenge((prev) => ({ ...(prev || {}), type: 'MFA_SETUP_TOTP', secretCode }));
                  showError('TOTP code mismatch — a new QR/secret was generated. Please re-scan and try again.');
                },
                onFailure: (assocErr) => {
                  console.error('Failed to re-associate TOTP secret:', assocErr);
                },
              });
            } catch (_e) {
              console.warn('Failed to initiate re-association after TOTP failure', _e);
            }
          } else if (err.message?.includes('InvalidParameterException')) {
            userFriendlyMessage = 'Invalid code format. Please enter a 6-digit number.';
          } else if (err.message?.includes('NotAuthorizedException')) {
            userFriendlyMessage = 'Session expired. Please sign in again to setup 2FA.';
          }

          setError(userFriendlyMessage);
          reject(err);
        },
      });
    });
  };

  // Email MFA flows (secondary address)
  const setupEmailMfa = async (secondaryEmail) => {
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
      return res;
    } catch (e) {
      setError(e?.message || String(e));
      showError(e?.message || 'Failed to send verification email');
      throw e;
    }
  };

  const setupTotpMfa = async () => {
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
  };

  const verifyTotpMfa = async (code) => {
    try {
      const res = await hotelAPI.verifyTotpMfa(code);
      // on success, persist state
      const cognitoUser = cognitoUserRef.current || UserPool?.getCurrentUser();
      try {
        const email = cognitoUser?.getUsername?.() || user?.email;
        if (email) localStorage.setItem(`visitjo.mfaEnabled.${email}`, '1');
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
  };

  const verifyEmailMfa = async (code) => {
    try {
      const res = await hotelAPI.verifyEmailMfa(code);
      // on success, persist state
      const cognitoUser = cognitoUserRef.current || UserPool?.getCurrentUser();
      try {
        const email = cognitoUser?.getUsername?.() || user?.email;
        if (email) localStorage.setItem(`visitjo.mfaEnabled.${email}`, '1');
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
      return res;
    } catch (e) {
      setError(e?.message || String(e));
      showError(e?.message || 'Failed to verify code');
      throw e;
    } finally {
      setPendingSecondaryEmail(null);
    }
  };

  const verifyLoginEmailMfa = async (code) => {
    try {
      const res = await hotelAPI.verifyLoginEmailMfa(code);
      showSuccess('Login verified');
      // If this was a logout-initiated verification, perform logout now
      if (mfaChallenge?.pendingLogout) {
        try {
          clearMfaChallenge();
          performLogout();
        } catch (_e) { console.warn('performLogout failed after email login verification', _e); }
        return { loggedOut: true };
      }
      return res;
    } catch (e) {
      setError(e?.message || String(e));
      showError(e?.message || 'Failed to verify login code');
      throw e;
    }
  };

  const verifyLoginTotpMfa = async (code) => {
    try {
      const res = await hotelAPI.verifyLoginTotpMfa(code);
      showSuccess('Login verified');
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
  };

  const requestEmailMfaChallenge = async () => {
    try {
      return await hotelAPI.requestEmailMfaChallenge();
    } catch (e) {
      setError(e?.message || String(e));
      throw e;
    }
  };

  const disableMfa = async () => {
    try {
      const cognitoUser = cognitoUserRef.current || UserPool?.getCurrentUser();
      if (!cognitoUser) {
        throw new Error('No active user session to disable MFA');
      }

      // First disable MFA in Cognito
      await new Promise((resolve, reject) => {
        cognitoUser.setUserMfaPreference({ Enabled: false }, { Enabled: false }, (err, result) => {
          if (err) {
            console.error('Failed to disable MFA in Cognito:', err);
            reject(new Error('Failed to disable MFA in Cognito: ' + err.message));
          } else {
            console.log('MFA disabled in Cognito successfully');
            resolve(result);
          }
        });
      });

      // Then update the database
      await hotelAPI.disableMfa();

      // Update local state
      const email = cognitoUser.getUsername?.() || user?.email;
      if (email) {
        localStorage.removeItem(`visitjo.mfaEnabled.${email}`);
      }
      setMfaEnabled(false);
      setMfaMethod(null);
      showSuccess('MFA disabled');
    } catch (e) {
      console.error('disableMfa error:', e);
      showError(e?.message || 'Failed to disable MFA');
      throw e;
    }
  };

  const updateUserProfileName = (patch) => {
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
  };

  const verifyEmail = async (email, code) => {
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
  };

  const resendConfirmation = async (email) => {
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
  };

  const forgotPassword = async (email) => {
    return new Promise((resolve, reject) => {
      if (!UserPool) {
        reject(new Error('Authentication service not available'));
        return;
      }
      const cognitoUser = new CognitoUser({ Username: email, Pool: UserPool });
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
  };

  const confirmNewPassword = async (email, code, newPassword) => {
    return new Promise((resolve, reject) => {
      if (!UserPool) {
        reject(new Error('Authentication service not available'));
        return;
      }
      const cognitoUser = new CognitoUser({ Username: email, Pool: UserPool });
      cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: function (data) {
          resolve(data);
        },
        onFailure: function (err) {
          setError(err.message || err);
          reject(err);
        },
      });
    });
  };

  const value = {
    user,
    userProfile,
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
    clearMfaChallenge,
    completeMfa,
    openEmailSetup,
    mfaEnabled,
    mfaMethod,
    setupEmailMfa,
    verifyEmailMfa,
    setupTotpMfa,
    verifyTotpMfa,
    requestEmailMfaChallenge,
    verifyLoginEmailMfa,
    verifyLoginTotpMfa,
    disableMfa,
    cognitoUserRef,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
