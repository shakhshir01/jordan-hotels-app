import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { showError, showSuccess } from '../services/toastService';
import QRCode from 'qrcode';
import { Shield, Smartphone, Mail, X, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export default function MfaModal() {
  const { mfaChallenge, clearMfaChallenge, completeMfa, cognitoUserRef, verifyTotp, setupTotp, setupEmailMfa, verifyEmailMfa, requestEmailMfaChallenge, verifyLoginEmailMfa, submitMfaCode, setupTotpMfa, verifyTotpMfa, login, completePreAuthLogin } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [secret, setSecret] = useState('');
  const [email, setEmail] = useState('');
  const [emailStep, setEmailStep] = useState('entry'); // 'entry' | 'verify'

  // When challenge has QR code or secret for TOTP setup, render QR code
  useEffect(() => {
    let mounted = true;
    if ((mfaChallenge?.type === 'MFA_SETUP_TOTP' && mfaChallenge.secretCode) || (mfaChallenge?.type === 'TOTP_SETUP' && mfaChallenge.qrCode)) {
      if (mfaChallenge.type === 'MFA_SETUP_TOTP') {
        const secretCode = mfaChallenge.secretCode;
        setSecret(secretCode);
        const username = cognitoUserRef.current?.getUsername?.() || 'user';
        const label = encodeURIComponent(`${username}`);
        const issuer = encodeURIComponent('VisitJo');
        const otpauth = `otpauth://totp/${label}?secret=${secretCode}&issuer=${issuer}`;
        QRCode.toDataURL(otpauth)
          .then((url) => {
            if (mounted) {
              setQrDataUrl(url);
            }
          })
          .catch((err) => {
            console.error('Failed to generate QR code', err);
            setQrDataUrl(null);
          });
      } else if (mfaChallenge.type === 'TOTP_SETUP') {
        setQrDataUrl(mfaChallenge.qrCode);
        setSecret(mfaChallenge.secret || '');
      }
    }
    return () => { mounted = false; };
  }, [mfaChallenge, cognitoUserRef]);

  // When an email login challenge is set, request email MFA code
  useEffect(() => {
    if (mfaChallenge?.type === 'CUSTOM_CHALLENGE' || mfaChallenge?.type === 'EMAIL_LOGIN_CHALLENGE') {
      setLoading(true);
      requestEmailMfaChallenge()
        .then(() => {
          showSuccess('Verification code sent to your email');
        })
        .catch((err) => {
          showError('Failed to send verification code');
          console.error('Failed to request email MFA', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [mfaChallenge, requestEmailMfaChallenge]);

  // Keyboard support for modal (keep hooks in stable order by placing before early return)
  useEffect(() => {
    if (!mfaChallenge) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        clearMfaChallenge();
      }
    };
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mfaChallenge, clearMfaChallenge]);

  if (!mfaChallenge) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    try {
      if (mfaChallenge.type === 'CUSTOM_CHALLENGE' || mfaChallenge.type === 'EMAIL_LOGIN_CHALLENGE' || mfaChallenge.type === 'EMAIL_MFA') {
        if (mfaChallenge.preAuth) {
          // Pre-auth MFA: try to authenticate normally first
          try {
            const result = await login(mfaChallenge.email, mfaChallenge.password);
            if (result.success) {
              // Login succeeded without MFA
              clearMfaChallenge();
              setCode('');
              showSuccess('Login successful!');
            } else if (result.mfaRequired && !result.preAuth) {
              // MFA is actually required, the modal will show again with proper MFA challenge
              clearMfaChallenge();
              setCode('');
            }
          } catch (_loginErr) {
            showError('Login failed. Please check your credentials.');
            clearMfaChallenge();
            setCode('');
          }
        } else {
          // Post-auth MFA: verify code for already authenticated user
          const res = await verifyLoginEmailMfa(code);
          // If verifyLoginEmailMfa performed logout, stop here
          if (res && res.loggedOut) {
            clearMfaChallenge();
            setCode('');
            return;
          }
          // Login completed via backend - complete the authentication
          const _email = mfaChallenge.email || cognitoUserRef.current?.getUsername();
          setCode('');
          return;
        }
        // Login completed via backend
        const _email = mfaChallenge.email || cognitoUserRef.current?.getUsername();
        if (email) {
          completePreAuthLogin(email);
        }
        clearMfaChallenge();
        setCode('');
        showSuccess('Login successful!');
        navigate('/');
      } else {
        // TOTP or other Cognito MFA: use submitMfaCode wrapper to honor pendingLogout
        let mfaType;
        if (mfaChallenge.type === 'SOFTWARE_TOKEN_MFA') {
          mfaType = 'SOFTWARE_TOKEN_MFA';
        } else if (mfaChallenge.type === 'SMS_MFA') {
          mfaType = 'SMS_MFA';
        }
        try {
          const result = await submitMfaCode(code, mfaType);
          if (result && result.loggedOut) {
            // logout already performed by context
            clearMfaChallenge();
            setCode('');
            return;
          }
          // If result is a Cognito session, finalize login
          if (result && result.getIdToken) {
            completeMfa(result);
          }
          setCode('');
        } catch (_err) {
          showError('Invalid MFA code');
          setCode('');
        }
      }
    } catch (_err) {
      showError('MFA verification failed');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTotp = async (e) => {
    e?.preventDefault();
    if (!code || !/^\d{6}$/.test(code)) return showError('Enter a valid 6-digit code from your authenticator app');
    setLoading(true);
    try {
      if (mfaChallenge.type === 'TOTP_SETUP') {
        await verifyTotpMfa(code);
      } else {
        await verifyTotp(code);
      }
      setCode('');
      showSuccess('TOTP enabled');
      navigate('/');
    } catch (err) {
      showError(err?.message || 'Failed to verify TOTP');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateTotp = async () => {
    setLoading(true);
    try {
      if (mfaChallenge.type === 'TOTP_SETUP') {
        await setupTotpMfa();
      } else {
        await setupTotp();
      }
      setCode('');
      showSuccess('New QR code generated');
    } catch (err) {
      showError(err?.message || 'Failed to regenerate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupEmail = async (e) => {
    e?.preventDefault();
    if (!email || !email.includes('@')) return showError('Enter a valid email');
    setLoading(true);
    try {
      await setupEmailMfa(email);
      setEmailStep('verify');
      showSuccess('Verification email sent');
    } catch (err) {
      showError(err?.message || 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e?.preventDefault();
    if (!code || code.length < 4) return showError('Enter the verification code');
    setLoading(true);
    try {
      await verifyEmailMfa(code);
      setCode('');
      setEmail('');
      setEmailStep('entry');
      clearMfaChallenge();
      navigate('/');
    } catch (err) {
      showError(err?.message || 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mfaChallenge.type) {
      case 'SOFTWARE_TOKEN_MFA':
      case 'TOTP_MFA':
        return t('mfa.totpTitle', 'Enter Authenticator Code');
      case 'SMS_MFA':
        return t('mfa.smsTitle', 'Enter SMS Code');
      case 'CUSTOM_CHALLENGE':
      case 'EMAIL_LOGIN_CHALLENGE':
      case 'EMAIL_MFA':
        return t('mfa.emailTitle', 'Enter Email Code');
      case 'MFA_SETUP_TOTP':
      case 'TOTP_SETUP':
        return t('mfa.setupTotpTitle', 'Setup Authenticator App');
      case 'EMAIL_SETUP':
        return t('mfa.emailSetupTitle', 'Setup Email Verification');
      default:
        return t('mfa.title', 'Two-Factor Authentication');
    }
  };

  const getDescription = () => {
    switch (mfaChallenge.type) {
      case 'SOFTWARE_TOKEN_MFA':
      case 'TOTP_MFA':
        return t('mfa.totpDescription', 'Enter the 6-digit code from your authenticator app');
      case 'SMS_MFA':
        return t('mfa.smsDescription', 'Enter the 6-digit code sent to your phone');
      case 'CUSTOM_CHALLENGE':
      case 'EMAIL_LOGIN_CHALLENGE':
      case 'EMAIL_MFA':
        return t('mfa.emailDescription', 'Enter the 6-digit code sent to your email');
      case 'MFA_SETUP_TOTP':
      case 'TOTP_SETUP':
        return t('mfa.setupTotpDescription', 'Scan the QR code with your authenticator app, then enter the verification code');
      case 'EMAIL_SETUP':
        return t('mfa.emailSetupDescription', 'Enter a secondary email to receive verification codes');
      default:
        return t('mfa.description', 'Enter the 6-digit code');
    }
  };

  const getIcon = () => {
    switch (mfaChallenge.type) {
      case 'SOFTWARE_TOKEN_MFA':
      case 'MFA_SETUP_TOTP':
      case 'TOTP_MFA':
      case 'TOTP_SETUP':
        return <Smartphone className="w-8 h-8 text-blue-600" />;
      case 'CUSTOM_CHALLENGE':
      case 'EMAIL_LOGIN_CHALLENGE':
      case 'EMAIL_SETUP':
      case 'EMAIL_MFA':
        return <Mail className="w-8 h-8 text-green-600" />;
      default:
        return <Shield className="w-8 h-8 text-purple-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="surface max-w-lg w-full mx-4 animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header */}
        <div className="relative p-8 pb-6">
          <button
            onClick={() => {
              clearMfaChallenge();
              setCode('');
              setQrDataUrl(null);
              setSecret('');
              setEmail('');
              setEmailStep('entry');
            }}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              {getIcon()}
            </div>
            <h2 className="page-title text-center text-slate-900 dark:text-slate-50 mb-2">
              {getTitle()}
            </h2>
            <p className="page-subtitle text-center">
              {getDescription()}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-8">
          {mfaChallenge.type === 'MFA_SETUP_TOTP' || mfaChallenge.type === 'TOTP_SETUP' ? (
            <form onSubmit={handleVerifyTotp} className="space-y-6">
              {/* QR Code Section */}
              <div className="text-center">
                {qrDataUrl ? (
                  <div className="inline-block p-4 bg-white rounded-2xl shadow-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                    <img
                      src={qrDataUrl}
                      alt="TOTP QR Code"
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 mx-auto bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
                  </div>
                )}

                {secret && (
                  <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Manual entry code:</p>
                    <p className="font-mono text-sm text-slate-900 dark:text-slate-100 break-all">{secret}</p>
                  </div>
                )}
              </div>

              {/* Code Input */}
              <div>
                <label className="label-premium">Verification Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="input-premium text-center text-2xl font-mono tracking-widest"
                  maxLength={6}
                  required
                  disabled={loading}
                />
                <p className="helper-text mt-2">Enter the 6-digit code from your authenticator app</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    clearMfaChallenge();
                    setCode('');
                    setQrDataUrl(null);
                    setSecret('');
                  }}
                  className="btn-secondary flex-1"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRegenerateTotp}
                  className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-2xl transition-all duration-300 disabled:opacity-50"
                  disabled={loading}
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={loading || code.length !== 6}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Verifying...
                    </div>
                  ) : (
                    'Enable 2FA'
                  )}
                </button>
              </div>
            </form>
          ) : mfaChallenge.type === 'EMAIL_SETUP' ? (
            <form onSubmit={emailStep === 'entry' ? handleSetupEmail : handleVerifyEmail} className="space-y-6">
              {emailStep === 'entry' ? (
                <>
                  <div>
                    <label className="label-premium">Secondary Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="backup@example.com"
                      className="input-premium"
                      required
                      disabled={loading}
                    />
                    <p className="helper-text mt-2">We'll send verification codes to this email</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        clearMfaChallenge();
                        setEmail('');
                        setEmailStep('entry');
                      }}
                      className="btn-secondary flex-1"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary flex-1"
                      disabled={loading || !email}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Sending...
                        </div>
                      ) : (
                        'Send Code'
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Verification code sent to <strong>{email}</strong>
                    </p>
                  </div>

                  <div>
                    <label className="label-premium">Verification Code</label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                      placeholder="Enter code"
                      className="input-premium text-center text-xl font-mono tracking-widest"
                      required
                      disabled={loading}
                    />
                    <p className="helper-text mt-2">Enter the code from your email</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEmailStep('entry');
                        setCode('');
                      }}
                      className="btn-secondary"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="btn-primary flex-1"
                      disabled={loading || !code}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Verifying...
                        </div>
                      ) : (
                        'Enable Email 2FA'
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Status Indicator */}
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                <AlertCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {mfaChallenge.type === 'SOFTWARE_TOKEN_MFA' || mfaChallenge.type === 'TOTP_MFA'
                    ? 'Enter your authenticator app code to continue'
                    : 'Check your email for the verification code'
                  }
                </p>
              </div>

              {/* Code Input */}
              <div>
                <label className="label-premium">
                  {mfaChallenge.type === 'SOFTWARE_TOKEN_MFA' || mfaChallenge.type === 'TOTP_MFA' ? 'Authenticator Code' : 'Email Code'}
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="input-premium text-center text-2xl font-mono tracking-widest"
                  maxLength={6}
                  required
                  disabled={loading}
                />
                <p className="helper-text mt-2">
                  {mfaChallenge.type === 'SOFTWARE_TOKEN_MFA' || mfaChallenge.type === 'TOTP_MFA'
                    ? 'Enter the 6-digit code from your authenticator app'
                    : 'Enter the 6-digit code sent to your email'
                  }
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    clearMfaChallenge();
                    setCode('');
                  }}
                  className="btn-secondary flex-1"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={loading || code.length !== 6}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Verifying...
                    </div>
                  ) : (
                    'Verify & Continue'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
