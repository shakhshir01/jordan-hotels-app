import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function MfaModal() {
  const { mfaChallenge, submitMfaCode, setupTotp, verifyTotp, clearMfaChallenge } = useAuth();
  const [code, setCode] = useState('');
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!mfaChallenge) {
      setCode('');
      setSecret('');
      setLoading(false);
    }
    if (mfaChallenge?.secretCode) setSecret(mfaChallenge.secretCode);
  }, [mfaChallenge]);

  if (!mfaChallenge) return null;

  const onSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      if (mfaChallenge.type === 'MFA_SETUP') {
        // begin TOTP setup
        const s = await setupTotp();
        setSecret(s);
      } else if (mfaChallenge.type === 'MFA_SETUP_TOTP') {
        await verifyTotp(code);
      } else {
        await submitMfaCode(code, mfaChallenge.type === 'SOFTWARE_TOKEN_MFA' ? 'SOFTWARE_TOKEN_MFA' : undefined);
      }
    } catch (err) {
      // error handled in context
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
            <button onClick={onSubmit} className="btn-primary">Set up Authenticator App</button>
            <button onClick={() => { clearMfaChallenge(); }} className="ml-3 btn-ghost">Cancel</button>
          </div>
        )}

        {mfaChallenge.type === 'MFA_SETUP_TOTP' && (
          <form onSubmit={onSubmit} className="space-y-3">
            <p>Scan this secret into your authenticator app:</p>
            <div className="p-3 bg-slate-100 rounded">{secret}</div>
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

      </div>
    </div>
  );
}
