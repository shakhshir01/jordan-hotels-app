import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { showError, showSuccess } from '../services/toastService';
import QRCode from 'qrcode';
import { Shield, Smartphone, Mail, X, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export default function MfaModal() {
  const { mfaChallenge, clearMfaChallenge, completeMfa, cognitoUserRef, verifyTotp, setupTotp, submitMfaCode, setupTotpMfa, verifyTotpMfa, login, completePreAuthLogin, setupEmailMfa, verifyEmailMfa, verifyLoginEmailMfa } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [secret, setSecret] = useState('');
  const [email, setEmail] = useState('');

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
      // Handle EMAIL_MFA separately
      if (mfaChallenge.type === 'EMAIL_MFA') {
        await verifyLoginEmailMfa(code);
        setCode('');
        return;
      }

      // TOTP or other Cognito MFA: use submitMfaCode wrapper to honor pendingLogout
      let mfaType;
      if (mfaChallenge.type === 'SOFTWARE_TOKEN_MFA' || mfaChallenge.type === 'TOTP_MFA') {
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
      // Modal will close automatically due to clearMfaChallenge() in verifyTotp
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
    if (!email || !email.includes('@')) return showError('Enter a valid email address');
    setLoading(true);
    try {
      await setupEmailMfa(email);
      setEmail('');
      // The challenge will be updated by setupEmailMfa to show verification input
    } catch (err) {
      showError(err?.message || 'Failed to setup email MFA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e?.preventDefault();
    if (!code || !/^\d{6}$/.test(code)) return showError('Enter a valid 6-digit code');
    setLoading(true);
    try {
      await verifyEmailMfa(code);
      setCode('');
      // Modal will close automatically due to clearMfaChallenge() in verifyEmailMfa
    } catch (err) {
      showError(err?.message || 'Failed to verify email code');
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
      case 'EMAIL_MFA':
        return t('mfa.emailTitle', 'Enter Email Code');
      case 'MFA_SETUP_TOTP':
      case 'TOTP_SETUP':
        return t('mfa.setupTotpTitle', 'Setup Authenticator App');
      case 'EMAIL_SETUP':
        return t('mfa.setupEmailTitle', 'Setup Email Verification');
      case 'EMAIL_VERIFY':
        return t('mfa.verifyEmailTitle', 'Verify Email Code');
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
      case 'EMAIL_MFA':
        return t('mfa.emailDescription', 'Enter the 6-digit code sent to your email');
      case 'MFA_SETUP_TOTP':
      case 'TOTP_SETUP':
        return t('mfa.setupTotpDescription', 'Scan the QR code with your authenticator app, then enter the verification code');
      case 'EMAIL_SETUP':
        return t('mfa.setupEmailDescription', 'Enter a secondary email address to receive verification codes');
      case 'EMAIL_VERIFY':
        return t('mfa.verifyEmailDescription', 'Enter the 6-digit code sent to your email');
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
      case 'EMAIL_SETUP':
      case 'EMAIL_VERIFY':
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
            <form onSubmit={handleSetupEmail} className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="label-premium">Secondary Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  className="input-premium"
                  required
                  disabled={loading}
                />
                <p className="helper-text mt-2">Enter a different email address than your account email for receiving verification codes.</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    clearMfaChallenge();
                    setEmail('');
                  }}
                  className="btn-secondary flex-1"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={loading || !email || !email.includes('@')}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Sending...
                    </div>
                  ) : (
                    'Send Verification Code'
                  )}
                </button>
              </div>
            </form>
          ) : mfaChallenge.type === 'EMAIL_VERIFY' ? (
            <form onSubmit={handleVerifyEmail} className="space-y-6">
              {/* Email Info */}
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                <Mail className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-green-800 dark:text-green-200">
                  Code sent to: <strong>{mfaChallenge.email}</strong>
                </p>
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
                <p className="helper-text mt-2">Enter the 6-digit code from your email</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    clearMfaChallenge();
                    setCode('');
                    setEmail('');
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
                    'Enable Email 2FA'
                  )}
                </button>
              </div>
            </form>
          ) : mfaChallenge.type === 'EMAIL_MFA' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Info */}
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                <Mail className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-green-800 dark:text-green-200">
                  Code sent to: <strong>{mfaChallenge.email}</strong>
                </p>
              </div>

              {/* Code Input */}
              <div>
                <label className="label-premium">Email Code</label>
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
                <p className="helper-text mt-2">Enter the 6-digit code sent to your email</p>
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
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Status Indicator */}
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                <AlertCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Enter your authenticator app code to continue
                </p>
              </div>

              {/* Code Input */}
              <div>
                <label className="label-premium">Authenticator Code</label>
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
