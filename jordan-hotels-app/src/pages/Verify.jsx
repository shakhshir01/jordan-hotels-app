import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { showError, showSuccess } from '../services/toastService';

const Verify = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { verifyEmail, resendConfirmation } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (!resendCooldown) return;
    const t = setInterval(() => setResendCooldown(prev => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
          <AlertCircle className="mx-auto text-red-600 mb-4" size={48} />
          <h2 className="text-2xl font-black mb-4">{t('pages.verify.invalidAccessTitle')}</h2>
          <p className="text-slate-600 mb-6">{t('pages.verify.invalidAccessBody')}</p>
          <button 
            onClick={() => navigate('/signup')}
            className="w-full bg-blue-900 text-white p-3 rounded-lg font-bold hover:bg-blue-800 transition-all"
          >
            {t('pages.verify.goToSignup')}
          </button>
        </div>
      </div>
    );
  }

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!code.trim()) {
      showError(t('pages.verify.codeRequired'));
      return;
    }

    setLoading(true);

    try {
      await verifyEmail(email, code);
      showSuccess(t('pages.verify.verifiedTitle'));
      navigate('/login');
    } catch (err) {
      showError(err.message || t('pages.verify.invalidCode'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      showError(t('pages.verify.missingEmail'));
      return;
    }
    try {
      await resendConfirmation(email);
      showSuccess(t('pages.verify.resent'));
      setResendCooldown(60); // 60-second cooldown
    } catch (err) {
      showError(err.message || t('pages.verify.resendFailed'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <form onSubmit={handleVerify} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-black mb-2 text-center">{t('pages.verify.title')}</h2>
        <p className="text-center text-slate-600 mb-8">
          {t('pages.verify.subtitle')}<br />
          <span className="font-bold text-blue-900">{email}</span>
        </p>

        {/* Code Input */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-700 mb-3">{t('auth.verifyCode')}</label>
          <input 
            type="text"
            placeholder="000000" 
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
            maxLength="6"
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-3xl tracking-widest font-bold text-slate-900 placeholder-slate-400 outline-none focus:border-blue-900 transition"
          />
          <p className="text-xs text-slate-500 mt-2">{t('auth.checkEmail')}</p>
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800">
              <strong>Can't find the email?</strong> Check your spam/junk folder. If it's still not there, you can resend the verification code using the link below.
            </p>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t('pages.verify.verifying') : t('pages.verify.verifyCta')}
        </button>

        <p className="text-center text-slate-600 mt-6 text-sm">
          {t('pages.verify.noCode')}
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="text-blue-900 font-bold hover:underline disabled:opacity-50 ml-1"
          >
            {resendCooldown > 0
              ? t('pages.verify.resendIn', { seconds: resendCooldown })
              : t('pages.verify.resend')}
          </button>
        </p>
      </form>
    </div>
  );
};

export default Verify;