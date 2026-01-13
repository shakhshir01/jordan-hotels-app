import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validateLogin } from '../utils/validators';
import { useTranslation } from 'react-i18next';
import { showError } from '../services/toastService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();

  const renderError = (value) => {
    if (!value) return '';
    return typeof value === 'string' && value.startsWith('auth.validation.') ? t(value) : value;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const validationErrors = validateLogin(email, password);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/');
      }
      // If mfaRequired, the modal will show
    } catch (err) {
      showError(err.message || t('pages.login.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <form onSubmit={handleLogin} className="surface p-8 sm:p-10">
        <h2 className="page-title text-center text-slate-900 dark:text-slate-50">{t('pages.login.title')}</h2>
        <p className="page-subtitle text-center mt-2 mb-8">{t('pages.login.subtitle')}</p>

        {/* Submit Error */}
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-900 font-bold text-sm">{typeof errors.submit === 'string' && errors.submit.startsWith('pages.') ? t(errors.submit) : errors.submit}</p>
            </div>
          </div>
        )}

        {/* Email Input */}
        <div className="mb-6">
          <label className="label-premium">{t('auth.email')}</label>
          <input 
            type="email"
            placeholder="you@example.com" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={`input-premium ${
              errors.email
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50'
                : ''
            }`}
          />
          {errors.email && <p className="text-red-600 text-sm mt-1">{renderError(errors.email)}</p>}
        </div>

        {/* Password Input */}
        <div className="mb-6">
          <label className="label-premium">{t('auth.password')}</label>
          <div className="relative">
            <input 
              type={showPassword ? 'text' : 'password'}
              placeholder={t('pages.login.passwordPlaceholder')}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={`input-premium pr-10 ${
                errors.password
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50'
                  : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-600 hover:text-slate-900"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && <p className="text-red-600 text-sm mt-1">{renderError(errors.password)}</p>}
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50"
        >
          {loading ? t('pages.login.signingIn') : t('auth.login')}
        </button>

        <p className="text-center text-slate-600 dark:text-slate-300 mt-6">
          {t('auth.dontHaveAccount')}{' '}
          <Link to="/signup" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
            {t('auth.signup')}
          </Link>
        </p>
        <p className="text-center text-slate-600 dark:text-slate-300 mt-2">
          <Link to="/forgot-password" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            {t('auth.forgotPassword')}
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;