import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { confirmNewPassword } = useAuth();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError(t('pages.resetPassword.missingEmail'));
      return;
    }
    if (!code.trim()) {
      setError(t('pages.resetPassword.codeRequired'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('auth.validation.passwordsDontMatch'));
      return;
    }

    setLoading(true);
    try {
      await confirmNewPassword(email, code, newPassword);
      navigate('/login');
    } catch (err) {
      setError(err.message || t('pages.resetPassword.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-black mb-2 text-center">{t('auth.resetPassword')}</h2>
        <p className="text-sm text-slate-600 mb-6 text-center">{t('pages.resetPassword.subtitle', { email })}</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <AlertCircle className="text-red-600 inline-block mr-2" size={16} />
            <span className="text-red-700">{error}</span>
          </div>
        )}

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
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-3 mb-4 border border-slate-200 bg-slate-50 rounded-lg outline-none text-slate-900 placeholder-slate-400 focus:border-blue-900 transition"
          required
        />

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
        >
          {loading ? t('pages.resetPassword.resetting') : t('auth.resetPassword')}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
