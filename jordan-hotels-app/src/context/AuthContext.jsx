import React, { createContext, useContext, useState, useEffect } from 'react';
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import { UserPool } from '../authConfig';
import { setAuthToken } from '../services/api';
import { showSuccess, showError } from '../services/toastService';
import { deriveNameFromEmail, loadSavedProfile, saveProfile } from '../utils/userProfile';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    showSuccess('Logged out successfully');
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
