import React, { createContext, useContext, useState, useEffect } from 'react';
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import { UserPool } from '../authConfig';
import { setAuthToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          } else if (session.isValid()) {
            setUser({ email: cognitoUser.getUsername() });
            try {
              const idToken = session.getIdToken().getJwtToken();
              setAuthToken(idToken);
            } catch (e) {
              console.warn('Failed to set auth token from session', e);
            }
          }
          setLoading(false);
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
            setUser({ email });
            try {
              const idToken = session.getIdToken().getJwtToken();
              setAuthToken(idToken);
            } catch (e) {
              console.warn('Failed to set auth token on login', e);
            }
          setError(null);
          resolve(session);
        },
        onFailure: (err) => {
          setError(err.message);
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
    setAuthToken(null);
    setError(null);
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
    loading,
    error,
    signUp,
    login,
    logout,
    verifyEmail,
    forgotPassword,
    confirmNewPassword,
    resendConfirmation,
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
