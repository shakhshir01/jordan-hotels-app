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
      <div className="min-h-screen flex items-center justify-center bg-light-premium dark:bg-dark-premium p-4">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
          <AlertCircle className="mx-auto text-red-600 dark:text-red-400 mb-4" size={48} />
          <h2 className="text-2xl font-black mb-4">{t('pages.verify.invalidAccessTitle')}</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{t('pages.verify.invalidAccessBody')}</p>
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
    <div className="min-h-screen flex items-center justify-center bg-light-premium dark:bg-dark-premium p-4">
      <form onSubmit={handleVerify} className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black mb-2 text-slate-900 dark:text-slate-100">{t('pages.verify.title')}</h2>
          <p className="text-slate-600 dark:text-slate-400">
            {t('pages.verify.subtitle')}<br />
            <span className="font-semibold text-blue-600 dark:text-blue-400">{email}</span>
          </p>
        </div>

        {/* Code Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            {t('auth.verifyCode')}
          </label>
          <div className="relative">
            <input 
              type="text"
              placeholder="000000" 
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
              maxLength={6}
              className="w-full p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-center text-3xl tracking-widest font-bold text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all"
            />
            {code.length === 6 && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            {t('auth.checkEmail')}
          </p>
          <div className="mt-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">
                  Didn't receive the email?
                </h4>
                <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                  <li>• Check your <strong>spam</strong> or <strong>junk</strong> folder</li>
                  <li>• Some email providers (like Outlook) filter verification emails</li>
                  <li>• Wait a few minutes and try refreshing your inbox</li>
                  <li>• Use the "Resend Code" button below if needed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-slate-400 disabled:to-slate-500 text-white p-4 rounded-lg font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-slate-400 disabled:hover:to-slate-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:hover:translate-y-0"
        >
          <span className="flex items-center justify-center">
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('pages.verify.verifying')}
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('pages.verify.verifyCta')}
              </>
            )}
          </span>
        </button>

        <div className="mt-6 text-center">
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
            {t('pages.verify.noCode')}
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="inline-flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-50 dark:disabled:hover:bg-blue-900/20"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {resendCooldown > 0
              ? t('pages.verify.resendIn', { seconds: resendCooldown })
              : t('pages.verify.resend')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Verify;