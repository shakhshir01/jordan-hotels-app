import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { showError, showSuccess } from '../services/toastService';
import QRCode from 'qrcode';

export default function MfaModal() {
  const { mfaChallenge, clearMfaChallenge, completeMfa, cognitoUserRef, verifyTotp, setupTotp, setupEmailMfa, verifyEmailMfa, requestEmailMfaChallenge, verifyLoginEmailMfa, submitMfaCode } = useAuth();
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [secret, setSecret] = useState('');
  const [email, setEmail] = useState('');
  const [emailStep, setEmailStep] = useState('entry'); // 'entry' | 'verify'

  // When Cognito returns a secret for TOTP setup, render QR code
  useEffect(() => {
    let mounted = true;
    console.log('MfaModal useEffect triggered, challenge:', mfaChallenge);
    if (mfaChallenge?.type === 'MFA_SETUP_TOTP' && mfaChallenge.secretCode) {
      const secretCode = mfaChallenge.secretCode;
      setSecret(secretCode);
      const username = cognitoUserRef.current?.getUsername?.() || 'user';
      const label = encodeURIComponent(`${username}`);
      const issuer = encodeURIComponent('VisitJo');
      const otpauth = `otpauth://totp/${label}?secret=${secretCode}&issuer=${issuer}`;
      console.log('Generating QR code for:', otpauth);
      QRCode.toDataURL(otpauth)
        .then((url) => {
          if (mounted) {
            console.log('QR code generated successfully');
            setQrDataUrl(url);
          }
        })
        .catch((err) => {
          console.error('Failed to generate QR code', err);
          setQrDataUrl(null);
        });
    }
    return () => { mounted = false; };
  }, [mfaChallenge, cognitoUserRef]);

  // When CUSTOM_CHALLENGE is set, request email MFA code
  useEffect(() => {
    if (mfaChallenge?.type === 'CUSTOM_CHALLENGE') {
      console.log('Requesting email MFA code for login');
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
  }, [mfaChallenge]);

  if (!mfaChallenge) {
    console.log('MfaModal: No challenge, not rendering');
    return null;
  }

  console.log('MfaModal: Rendering with challenge:', mfaChallenge);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    try {
      if (mfaChallenge.type === 'CUSTOM_CHALLENGE') {
        // Email MFA verification (could be login or logout verification)
        const res = await verifyLoginEmailMfa(code);
        // If verifyLoginEmailMfa performed logout, stop here
        if (res && res.loggedOut) {
          clearMfaChallenge();
          setCode('');
          return;
        }
        // Login completed via backend
        clearMfaChallenge();
        setCode('');
        showSuccess('Login successful!');
      } else {
        // TOTP or other Cognito MFA: use submitMfaCode wrapper to honor pendingLogout
        try {
          const result = await submitMfaCode(code);
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
        } catch (err) {
          showError('Invalid MFA code');
          setCode('');
        }
      }
    } catch (err) {
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
      await verifyTotp(code);
      setCode('');
      showSuccess('TOTP enabled');
    } catch (err) {
      showError(err?.message || 'Failed to verify TOTP');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateTotp = async () => {
    setLoading(true);
    try {
      await setupTotp();
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
      showSuccess('Email MFA enabled');
    } catch (err) {
      showError(err?.message || 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mfaChallenge.type) {
      case 'SOFTWARE_TOKEN_MFA':
        return t('mfa.totpTitle', 'Enter TOTP Code');
      case 'SMS_MFA':
        return t('mfa.smsTitle', 'Enter SMS Code');
      case 'CUSTOM_CHALLENGE':
        return t('mfa.emailTitle', 'Enter Email Code');
      case 'MFA_SETUP_TOTP':
        return t('mfa.setupTotpTitle', 'Setup Authenticator App');
      case 'EMAIL_SETUP':
        return t('mfa.emailSetupTitle', 'Setup Secondary Email');
      default:
        return t('mfa.title', 'Two-Factor Authentication');
    }
  };

  const getDescription = () => {
    switch (mfaChallenge.type) {
      case 'SOFTWARE_TOKEN_MFA':
        return t('mfa.totpDescription', 'Enter the 6-digit code from your authenticator app');
      case 'SMS_MFA':
        return t('mfa.smsDescription', 'Enter the 6-digit code sent to your phone');
      case 'CUSTOM_CHALLENGE':
        return t('mfa.emailDescription', 'Enter the 6-digit code sent to your email');
      case 'MFA_SETUP_TOTP':
        return t('mfa.setupTotpDescription', 'Scan the QR code or enter the secret into your authenticator app, then verify the generated code');
      case 'EMAIL_SETUP':
        return t('mfa.emailSetupDescription', 'Enter a secondary email to receive verification codes');
      default:
        return t('mfa.description', 'Enter the 6-digit code');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-jordan-blue/10 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-jordan-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            {getTitle()}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {getDescription()}
          </p>
        </div>

        {mfaChallenge.type === 'MFA_SETUP_TOTP' ? (
          <form onSubmit={handleVerifyTotp}>
            <div className="mb-4">
              {qrDataUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <img src={qrDataUrl} alt="TOTP QR" className="w-48 h-48 bg-white p-2 rounded-md" />
                  <div className="text-xs text-slate-500 break-words">Secret: <strong className="font-mono">{secret}</strong></div>
                </div>
              ) : (
                <div className="text-sm text-slate-600">Scan the secret in your authenticator app</div>
              )}
            </div>

            <div className="mb-6">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full text-center text-2xl font-mono tracking-widest px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-jordan-blue dark:bg-slate-700 dark:text-slate-100"
                maxLength={6}
                required
                disabled={loading}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  clearMfaChallenge();
                  setCode('');
                  setQrDataUrl(null);
                  setSecret('');
                }}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRegenerateTotp}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Generating...' : 'New QR Code'}
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-jordan-blue text-white rounded-lg hover:bg-jordan-blue/90 disabled:opacity-50"
                disabled={loading || code.length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </form>
        ) : mfaChallenge.type === 'EMAIL_SETUP' ? (
          <form onSubmit={emailStep === 'entry' ? handleSetupEmail : handleVerifyEmail}>
            {emailStep === 'entry' ? (
              <>
                <div className="mb-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="secondary@example.com"
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { clearMfaChallenge(); setEmail(''); setEmailStep('entry'); }}
                    className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-jordan-blue text-white rounded-lg" disabled={loading}>
                    {loading ? 'Sending...' : 'Send verification'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    placeholder="Enter code"
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => { setEmailStep('entry'); setCode(''); }} className="flex-1 px-4 py-2 bg-slate-200 rounded-lg">Back</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-jordan-blue text-white rounded-lg" disabled={loading || !code}>Verify</button>
                </div>
              </>
            )}
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full text-center text-2xl font-mono tracking-widest px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-jordan-blue dark:bg-slate-700 dark:text-slate-100"
                maxLength={6}
                required
                disabled={loading}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  clearMfaChallenge();
                  setCode('');
                }}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-jordan-blue text-white rounded-lg hover:bg-jordan-blue/90 disabled:opacity-50"
                disabled={loading || code.length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
