import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Verify = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const { verifyEmail, resendConfirmation } = useAuth();

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
          <AlertCircle className="mx-auto text-red-600 mb-4" size={48} />
          <h2 className="text-2xl font-black mb-4">Invalid Access</h2>
          <p className="text-slate-600 mb-6">Please complete the sign-up process first.</p>
          <button 
            onClick={() => navigate('/signup')}
            className="w-full bg-blue-900 text-white p-3 rounded-lg font-bold hover:bg-black transition-all"
          >
            Go to Sign Up
          </button>
        </div>
      </div>
    );
  }

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!code.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await verifyEmail(email, code);
      setVerified(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
          <CheckCircle className="mx-auto text-green-600 mb-4" size={48} />
          <h2 className="text-2xl font-black mb-2">Email Verified!</h2>
          <p className="text-slate-600 mb-6">Your account has been successfully verified.</p>
          <p className="text-sm text-slate-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!resendCooldown) return;
    const t = setInterval(() => setResendCooldown(prev => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (!email) return setError('Missing email address.');
    try {
      setError('');
      setSuccessMsg('');
      await resendConfirmation(email);
      setSuccessMsg('Verification code resent. Check your email.');
      setResendCooldown(60); // 60-second cooldown
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <form onSubmit={handleVerify} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-black mb-2 text-center">Verify Email</h2>
        <p className="text-center text-slate-600 mb-8">
          We sent a verification code to<br />
          <span className="font-bold text-blue-900">{email}</span>
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-900 font-bold text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-900 font-bold text-sm">{successMsg}</p>
          </div>
        )}

        {/* Code Input */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-700 mb-3">Verification Code</label>
          <input 
            type="text"
            placeholder="000000" 
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
            maxLength="6"
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-3xl tracking-widest font-bold text-slate-900 placeholder-slate-400 outline-none focus:border-blue-900 transition"
          />
          <p className="text-xs text-slate-500 mt-2">Check your email for the code</p>
        </div>

        <button 
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Verifying...' : 'VERIFY EMAIL'}
        </button>

        <p className="text-center text-slate-600 mt-6 text-sm">
          Didn't receive a code? 
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="text-blue-900 font-bold hover:underline disabled:opacity-50 ml-1"
          >
            {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend'}
          </button>
        </p>
      </form>
    </div>
  );
};

export default Verify;