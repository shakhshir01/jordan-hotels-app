import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useAuth } from '../context/AuthContext';
import { showError, showSuccess } from '../services/toastService';

export default function MfaModal() {
  const {
    mfaChallenge,
    submitMfaCode,
    setupTotp,
    verifyTotp,
    clearMfaChallenge,
    setupEmailMfa,
    verifyEmailMfa,
  } = useAuth();

  const [code, setCode] = useState('');
  const [secret, setSecret] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const [secondaryEmail, setSecondaryEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (!mfaChallenge) {
      setCode('');
      setSecret('');
      setQrDataUrl('');
      setLoading(false);
      setErrorMessage('');
      setSuccess(false);
      setSecondaryEmail('');
      setEmailSent(false);
      return;
    }
    if (mfaChallenge?.secretCode) setSecret(mfaChallenge.secretCode);
  }, [mfaChallenge]);

  useEffect(() => {
    if (!secret) {
      setQrDataUrl('');
      return;
    }
    const otpauth = `otpauth://totp/VisitJo?secret=${encodeURIComponent(secret)}&issuer=VisitJo`;
    QRCode.toDataURL(otpauth)
      .then((url) => setQrDataUrl(url))
      .catch(() => setQrDataUrl(''));
  }, [secret]);

  if (!mfaChallenge) return null;

  const onSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      if (mfaChallenge.type === 'MFA_SETUP') {
        const s = await setupTotp();
        setSecret(s);
      } else if (mfaChallenge.type === 'MFA_SETUP_TOTP') {
        await verifyTotp(code);
        setSuccess(true);
        showSuccess('Two-factor authentication enabled');
        setTimeout(() => clearMfaChallenge(), 1400);
      } else if (mfaChallenge.type === 'SMS_MFA' || mfaChallenge.type === 'SOFTWARE_TOKEN_MFA') {
        await submitMfaCode(code, mfaChallenge.type === 'SOFTWARE_TOKEN_MFA' ? 'SOFTWARE_TOKEN_MFA' : undefined);
        setSuccess(true);
        showSuccess('MFA verified');
        setTimeout(() => clearMfaChallenge(), 1200);
      }
    } catch (_err) {
      const codeErr = _err?.code || '';
      const msg = String(_err?.message || _err || 'Failed to verify code');
      if (/mismatch|invalid/i.test(msg) || /CodeMismatchException/i.test(codeErr)) {
        setErrorMessage('Invalid code — please try again');
        showError('Invalid code. Please try again.');
      } else if (/expired/i.test(msg) || /ExpiredCodeException/i.test(codeErr)) {
        setErrorMessage('Code expired — request a new code and try again');
        showError('Code expired. Request a new code.');
      } else if (/SessionExpired|Session error|Invalid Access Token/i.test(msg)) {
        setErrorMessage('Session expired — please sign out and sign back in');
        showError('Session expired. Please sign out and sign back in.');
      } else {
        setErrorMessage(msg);
        showError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const onSendEmail = async (e) => {
    e?.preventDefault?.();
    if (!secondaryEmail) return setErrorMessage('Please enter a secondary email');
    setLoading(true);
    setErrorMessage('');
    try {
      await setupEmailMfa(secondaryEmail);
      setEmailSent(true);
      showSuccess('Verification email sent to secondary address');
    } catch (_err) {
      const msg = String(_err?.message || _err || 'Failed to send verification email');
      setErrorMessage(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  const onVerifyEmail = async (e) => {
    e?.preventDefault?.();
    if (!code) return setErrorMessage('Enter verification code');
    setLoading(true);
    setErrorMessage('');
    try {
      await verifyEmailMfa(code);
      showSuccess('Email MFA enabled');
      setTimeout(() => clearMfaChallenge(), 900);
    } catch (_err) {
      const msg = String(_err?.message || _err || 'Failed to verify code');
      setErrorMessage(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md">
        <h3 className="font-bold text-lg mb-4">Multi-factor Authentication</h3>

        {mfaChallenge.type === 'MFA_SETUP' && (
          <div>
            <p className="mb-3">Set up an authenticator app (TOTP) or use SMS verification.</p>
            <div className="flex gap-3">
              <button onClick={onSubmit} className="btn-primary">Set up Authenticator App</button>
              <button onClick={() => { clearMfaChallenge(); }} className="ml-3 btn-ghost">Cancel</button>
            </div>
          </div>
        )}

        {mfaChallenge.type === 'MFA_SETUP_TOTP' && (
          <form onSubmit={onSubmit} className="space-y-3">
            <p>Scan this secret into your authenticator app:</p>
            <div className="p-3 bg-slate-100 rounded">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="TOTP QR code" className="mx-auto" />
              ) : (
                <div className="break-words">{secret}</div>
              )}
            </div>
            <p className="text-sm text-slate-500">Then enter the 6-digit code from your app to verify.</p>
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" className="input-premium w-full" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => clearMfaChallenge()} className="btn-ghost">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary">Verify</button>
            </div>
          </form>
        )}

        {mfaChallenge.type === 'SMS_MFA' && (
          <form onSubmit={onSubmit} className="space-y-3">
            <p>Enter the SMS code sent to your phone.</p>
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" className="input-premium w-full" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => clearMfaChallenge()} className="btn-ghost">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary">Verify</button>
            </div>
          </form>
        )}

        {mfaChallenge.type === 'SOFTWARE_TOKEN_MFA' && (
          <form onSubmit={onSubmit} className="space-y-3">
            <p>Enter the code from your authenticator app.</p>
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" className="input-premium w-full" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => clearMfaChallenge()} className="btn-ghost">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary">Verify</button>
            </div>
          </form>
        )}

        {mfaChallenge.type === 'EMAIL_SETUP' && (
          <div>
            {!emailSent ? (
              <form onSubmit={onSendEmail} className="space-y-3">
                <p>Enter an alternate email address to receive a verification code.</p>
                <input value={secondaryEmail} onChange={(e) => setSecondaryEmail(e.target.value)} placeholder="alternate@example.com" className="input-premium w-full" />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => clearMfaChallenge()} className="btn-ghost">Close</button>
                  <button type="submit" disabled={loading} className="btn-primary">Send verification email</button>
                </div>
              </form>
            ) : (
              <form onSubmit={onVerifyEmail} className="space-y-3">
                <p>Enter the verification code sent to {secondaryEmail || 'your secondary email'}.</p>
                <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" className="input-premium w-full" />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => clearMfaChallenge()} className="btn-ghost">Close</button>
                  <button type="submit" disabled={loading} className="btn-primary">Verify</button>
                </div>
              </form>
            )}
          </div>
        )}

        {errorMessage && <p className="text-sm text-red-600 mt-2">{errorMessage}</p>}
        {success && <p className="text-sm text-green-600 mt-2">Two-factor authentication enabled.</p>}

      </div>
    </div>
  );
}
