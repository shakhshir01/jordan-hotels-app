import React, { createContext, useContext, useState, useEffect } from 'react';
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import { UserPool } from '../authConfig';
import { setAuthToken, hotelAPI } from '../services/api';
import { showSuccess, showError } from '../services/toastService';
import { deriveNameFromEmail, loadSavedProfile, saveProfile } from '../utils/userProfile';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mfaChallenge, setMfaChallenge] = useState(null);
  const [mfaEnabled, setMfaEnabled] = useState(false);
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
                    try {
                      const stored = localStorage.getItem(`visitjo.mfaEnabled.${email}`);
                      if (stored === '1') setMfaEnabled(true);
                    } catch (_e) {
                      console.warn('Failed reading stored MFA flag', _e);
                    }
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

      cognitoUser.authenticateUser(authDetails, {
        onSuccess: (session) => {
          setUserAndProfileFromEmail(email);
          try {
            const idToken = session.getIdToken().getJwtToken();
            setAuthToken(idToken);
          } catch (e) {
            console.warn('Failed to set auth token on login', e);
          }
          setError(null);
          showSuccess(`Welcome back, ${email}!`);
          resolve(session);
        },
        onFailure: (err) => {
          setError(err.message);
          showError(err.message || 'Login failed');
          reject(err);
        },
        // Handle possible Cognito challenges by exposing them to the UI
        mfaRequired: (challengeName, challengeParameters) => {
          setMfaChallenge({ type: 'SMS_MFA', challengeName, challengeParameters });
        },
        selectMFAType: (challengeName, challengeParameters) => {
          setMfaChallenge({ type: 'SELECT_MFA_TYPE', challengeName, challengeParameters });
        },
        mfaSetup: (challengeName, challengeParameters) => {
          setMfaChallenge({ type: 'MFA_SETUP', challengeName, challengeParameters });
        },
        totpRequired: (challengeName, challengeParameters) => {
          setMfaChallenge({ type: 'SOFTWARE_TOKEN_MFA', challengeName, challengeParameters });
        },
        customChallenge: (challengeParameters) => {
          setMfaChallenge({ type: 'CUSTOM_CHALLENGE', challengeParameters });
        },
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          setMfaChallenge({ type: 'NEW_PASSWORD_REQUIRED', userAttributes, requiredAttributes });
        },
      });
    });
  };

  const logout = () => {
    if (UserPool) {
      const cognitoUser = UserPool.getCurrentUser();
      if (cognitoUser) {
        cognitoUser.signOut();
      }
    }
    setUser(null);
    setUserProfile(null);
    setAuthToken(null);
    setError(null);
    try {
      const email = cognitoUserRef.current?.getUsername?.() || null;
      if (email) localStorage.removeItem(`visitjo.mfaEnabled.${email}`);
    } catch (_e) { console.warn('Ignored during logout cleanup', _e); }
    showSuccess('Logged out successfully');
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
          // persist server-side if possible
          try {
            hotelAPI.updateUserProfile({ mfaEnabled: true, mfaMethod: 'TOTP' }).catch(() => {});
          } catch (_e) { console.warn('Ignored during session refresh', _e); }
          clearMfaChallenge();
          showSuccess('MFA verified');
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
    if (!cognitoUser) return Promise.reject(new Error('No active user to setup TOTP'));

    return new Promise((resolve, reject) => {
      // Ensure we have a valid session before attempting TOTP association
      cognitoUser.getSession((err, session) => {
        if (err) {
          setError('Session error. Please sign in again.');
          reject(new Error('Session error'));
          return;
        }

        const proceedWithAssociate = () => {
          cognitoUser.associateSoftwareToken({
            associateSecretCode: (secretCode) => {
              setMfaChallenge((prev) => ({ ...(prev || {}), type: 'MFA_SETUP_TOTP', secretCode }));
              resolve(secretCode);
            },
            onFailure: (e) => {
              setError(e.message || String(e));
              reject(e);
            },
          });
        };

        if (session && session.isValid && session.isValid()) {
          proceedWithAssociate();
          return;
        }

        // Try to refresh session if a refresh token exists
        try {
          const refreshToken = session && session.getRefreshToken && session.getRefreshToken();
          if (refreshToken) {
            cognitoUser.refreshSession(refreshToken, (rErr, newSession) => {
              if (rErr) {
                setError('Session refresh failed. Please sign in again.');
                reject(new Error('Session refresh failed'));
                return;
              }
              try {
                const idToken = newSession.getIdToken().getJwtToken();
                setAuthToken(idToken);
                  } catch (_e) {
                    console.warn('Failed to set auth token from refreshed session', _e);
                  }
              proceedWithAssociate();
            });
            return;
          }
        } catch (_e) {
          console.warn('Session refresh check failed', _e);
          // continue to reject below
        }

        setError('Session expired. Please sign in again to setup 2FA.');
        reject(new Error('Session expired'));
      });
    });
  };

  const verifyTotp = (userCode, friendlyName = 'My device') => {
    const cognitoUser = cognitoUserRef.current || UserPool?.getCurrentUser();
    if (!cognitoUser) return Promise.reject(new Error('No active user to verify TOTP'));
    return new Promise((resolve, reject) => {
      cognitoUser.verifySoftwareToken(userCode, friendlyName, {
        onSuccess: (res) => {
          showSuccess('Two-factor authentication enabled');
          try {
            const email = cognitoUser.getUsername();
            localStorage.setItem(`visitjo.mfaEnabled.${email}`, '1');
          } catch (_e) { console.warn('Ignored while persisting MFA state', _e); }
          setMfaEnabled(true);
          // persist server-side (best-effort)
          try {
            hotelAPI.updateUserProfile({ mfaEnabled: true, mfaMethod: 'TOTP' }).catch(() => {});
          } catch (_e) { console.warn('Ignored while persisting MFA state', _e); }
          clearMfaChallenge();
          resolve(res);
        },
        onFailure: (err) => {
          setError(err.message || String(err));
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
      // persist server-side profile with method and secondary email
      try {
        await hotelAPI.updateUserProfile({ mfaEnabled: true, mfaMethod: 'EMAIL', mfaSecondaryEmail: pendingSecondaryEmail });
      } catch (_e) { console.warn('Ignored while persisting MFA profile', _e); }
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

  const disableMfa = async () => {
    try {
      await hotelAPI.disableMfa();
      const email = cognitoUserRef.current?.getUsername?.() || user?.email;
      if (email) {
        localStorage.removeItem(`visitjo.mfaEnabled.${email}`);
      }
      setMfaEnabled(false);
      showSuccess('MFA disabled');
    } catch (e) {
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
    openEmailSetup,
    mfaEnabled,
    setupEmailMfa,
    verifyEmailMfa,
    disableMfa,
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
