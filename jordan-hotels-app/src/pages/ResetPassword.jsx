import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { showError, showSuccess } from '../services/toastService';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { confirmNewPassword, forgotPassword } = useAuth();
  const { t } = useTranslation();

  const checkStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    setPasswordStrength(score);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      showError(t('pages.resetPassword.missingEmail'));
      return;
    }
    if (!code.trim()) {
      showError(t('pages.resetPassword.codeRequired'));
      return;
    }
    if (newPassword !== confirmPassword) {
      showError(t('auth.validation.passwordsDontMatch'));
      return;
    }
    if (passwordStrength < 3) {
      showError(t('auth.validation.passwordTooWeak'));
      return;
    }

    setLoading(true);
    try {
      await confirmNewPassword(email, code, newPassword);
      showSuccess(t('pages.resetPassword.success'));
      navigate('/login');
    } catch (err) {
      showError(err.message || t('pages.resetPassword.failed'));
    } finally {
      setLoading(false);
    }
  };

  // Resend code handler
  const handleResendCode = async () => {
    setResendLoading(true);
    try {
      await forgotPassword(email);
      showSuccess(t('auth.verificationCodeSent'));
    } catch (err) {
      showError(err.message || t('pages.forgotPassword.failed'));
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-4">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black mb-2 text-slate-900 dark:text-slate-100">{t('auth.resetPassword')}</h2>
          <p className="text-slate-600 dark:text-slate-400">
            {t('pages.resetPassword.subtitle', { email })}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Verification Code Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              {t('pages.resetPassword.codePlaceholder')}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                maxLength={6}
                className="w-full p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-center text-3xl tracking-widest font-bold text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all"
                required
              />
              {code.length === 6 && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              {t('auth.checkEmail')}
            </p>
          </div>

          {/* New Password Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              {t('auth.newPassword')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t('auth.password')}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  checkStrength(e.target.value);
                }}
                className="w-full p-4 pr-12 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            <div className="mt-3">
              <div className="h-2 rounded bg-slate-200 dark:bg-slate-600 overflow-hidden">
                <div
                  className={`h-2 rounded transition-all duration-300 ${
                    passwordStrength === 0 ? 'bg-red-300 w-0' :
                    passwordStrength === 1 ? 'bg-red-500 w-1/4' :
                    passwordStrength === 2 ? 'bg-yellow-500 w-2/4' :
                    passwordStrength === 3 ? 'bg-blue-500 w-3/4' :
                    'bg-green-600 w-full'
                  }`}
                />
              </div>
              <div className="text-xs mt-1 text-slate-500 dark:text-slate-400" aria-live="polite">
                {passwordStrength === 0 && t('auth.strength.veryWeak')}
                {passwordStrength === 1 && t('auth.strength.weak')}
                {passwordStrength === 2 && t('auth.strength.medium')}
                {passwordStrength === 3 && t('auth.strength.strong')}
                {passwordStrength === 4 && t('auth.strength.veryStrong')}
              </div>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              {t('auth.confirmPassword')}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t('auth.confirmPassword')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-4 pr-12 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {confirmPassword && newPassword && (
              <div className="mt-2 flex items-center text-sm">
                {confirmPassword === newPassword ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-green-600 dark:text-green-400">{t('pages.signup.passwordsMatch')}</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                    <span className="text-red-600 dark:text-red-400">{t('auth.validation.passwordsDontMatch')}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || code.length !== 6 || passwordStrength < 3 || newPassword !== confirmPassword}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-slate-400 disabled:to-slate-500 text-white p-4 rounded-lg font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-slate-400 disabled:hover:to-slate-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:hover:translate-y-0"
          >
            <span className="flex items-center justify-center">
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('pages.resetPassword.resetting')}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('auth.resetPassword')}
                </>
              )}
            </span>
          </button>

          {/* Resend Code Button */}
          <div className="text-center">
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
              {t('pages.verify.noCode')}
            </p>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendLoading}
              className="inline-flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {resendLoading ? t('pages.forgotPassword.sending') : t('auth.resendCode')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
