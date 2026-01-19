/// <reference path="../types/globals.d.ts" />

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validateLogin } from '../utils/validators';
import { useTranslation } from 'react-i18next';
import { showError } from '../services/toastService';
import { Auth } from 'aws-amplify';
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';

// Runtime config available at window.__VISITJO_RUNTIME_CONFIG__
const _runtime = typeof window !== 'undefined' ? window.__VISITJO_RUNTIME_CONFIG__ || {} : {};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState(/** @type {any} */ ({}));
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();

  const handleGoogleLogin = async () => {
    try {
      console.log('Starting Google OAuth login');
      await Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Google });
    } catch (error) {
      console.error('Google login error:', error);
      showError('Failed to start Google login');
    }
  };

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
          <label htmlFor="email" className="label-premium">{t('auth.email')}</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            aria-describedby={errors.email ? "email-error" : undefined}
            aria-invalid={!!errors.email}
            className={`input-premium ${
              errors.email
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50'
                : ''
            }`}
          />
          {errors.email && <p id="email-error" className="text-red-600 text-sm mt-1" role="alert">{renderError(errors.email)}</p>}
        </div>

        {/* Password Input */}
        <div className="mb-6">
          <label htmlFor="password" className="label-premium">{t('auth.password')}</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder={t('pages.login.passwordPlaceholder')}
              value={password}
              onChange={e => setPassword(e.target.value)}
              aria-describedby={errors.password ? "password-error" : undefined}
              aria-invalid={!!errors.password}
              className={`input-premium pr-10 ${
                errors.password
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50'
                  : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-3 text-slate-600 hover:text-slate-900 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && <p id="password-error" className="text-red-600 text-sm mt-1" role="alert">{renderError(errors.password)}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          aria-describedby={loading ? "login-status" : undefined}
          className="btn-primary w-full disabled:opacity-50"
        >
          {loading ? t('pages.login.signingIn') : t('auth.login')}
        </button>
        {loading && <div id="login-status" className="sr-only" aria-live="polite">{t('pages.login.signingIn')}</div>}

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

        <div className="mt-6">
          <div className="text-center text-sm text-slate-500 mb-3">{t('pages.login.orContinueWith') || 'Or continue with'}</div>
          <div className="flex justify-center">
            <button onClick={handleGoogleLogin} className="btn-outline text-center flex items-center justify-center gap-2 w-full sm:w-auto" disabled={loading}>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {t('pages.login.continueWithGoogle') || 'Continue with Google'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;