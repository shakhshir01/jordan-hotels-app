import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-black mb-2 text-center">{t('auth.resetPassword')}</h2>
        <p className="text-sm text-slate-600 mb-6 text-center">{t('pages.resetPassword.subtitle', { email })}</p>

        {/* Error display removed: error variable is not defined. Toasts are used for errors. */}

        <input
          placeholder={t('pages.resetPassword.codePlaceholder')}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full p-3 mb-4 border border-slate-200 bg-slate-50 rounded-lg outline-none text-center text-slate-900 placeholder-slate-400 focus:border-blue-900 transition"
          required
        />

        <input
          type="password"
          placeholder={t('auth.newPassword')}
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            checkStrength(e.target.value);
          }}
          aria-label={t('auth.newPassword')}
          className="w-full p-3 mb-2 border border-slate-200 bg-slate-50 rounded-lg outline-none text-slate-900 placeholder-slate-400 focus:border-blue-900 transition"
          required
        />
        {/* Password strength meter */}
        <div className="mb-4">
          <div className="h-2 rounded bg-slate-200 overflow-hidden">
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
          <div className="text-xs mt-1 text-slate-500" aria-live="polite">
            {passwordStrength === 0 && t('auth.strength.veryWeak')}
            {passwordStrength === 1 && t('auth.strength.weak')}
            {passwordStrength === 2 && t('auth.strength.medium')}
            {passwordStrength === 3 && t('auth.strength.strong')}
            {passwordStrength === 4 && t('auth.strength.veryStrong')}
          </div>
        </div>

        <input
          type="password"
          placeholder={t('auth.confirmPassword')}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-3 mb-6 border border-slate-200 bg-slate-50 rounded-lg outline-none text-slate-900 placeholder-slate-400 focus:border-blue-900 transition"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 transition-all disabled:opacity-50"
          aria-busy={loading}
        >
          {loading ? t('pages.resetPassword.resetting') : t('auth.resetPassword')}
        </button>
        <button
          type="button"
          onClick={handleResendCode}
          disabled={resendLoading}
          className="w-full mt-3 bg-blue-500 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
          aria-busy={resendLoading}
        >
          {resendLoading ? t('pages.forgotPassword.sending') : t('auth.resendCode')}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
