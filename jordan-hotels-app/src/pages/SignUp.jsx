import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validateSignUp, getPasswordErrors } from '../utils/validators';
import { showSuccess, showError } from '../services/toastService';
import { useTranslation } from 'react-i18next';
import { Auth } from 'aws-amplify';
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';

const SignUp = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState(/** @type {any} */ ({}));
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { t } = useTranslation();

  const handleGoogleSignUp = async () => {
    try {
      await Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Google});
    } catch (_error) {
      showError('Failed to start Google sign up');
    }
  };

  const renderError = (value) => {
    if (!value) return '';
    return typeof value === 'string' && value.startsWith('auth.validation.') ? t(value) : value;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    // Validate full name
    if (!fullName.trim()) {
      setErrors(prev => ({ ...prev, fullName: 'auth.validation.fullNameRequired' }));
      return;
    }

    const validationErrors = validateSignUp(email, password, confirmPassword);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await signUp(email, password, fullName);
      showSuccess(t('pages.signup.accountCreatedToast'));
      navigate('/verify', { state: { email } });
    } catch (err) {
      const errorMsg = err.message || t('pages.signup.failed');
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const passwordErrors = getPasswordErrors(password);

  return (
    <div className="mx-auto w-full max-w-md">
      <form onSubmit={handleSignUp} className="surface p-8 sm:p-10">
        <h2 className="page-title text-center text-slate-900 dark:text-slate-50">{t('pages.signup.title')}</h2>
        <p className="page-subtitle text-center mt-2 mb-8">{t('pages.signup.subtitle')}</p>

        {/* Submit Error */}
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-900 font-bold text-sm">{errors.submit}</p>
            </div>
          </div>
        )}

        {/* Full Name Input */}
        <div className="mb-4 sm:mb-6">
          <label className="label-premium block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('auth.fullName')}</label>
          <input
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className={`input-premium w-full px-4 py-3 sm:py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-slate-100 font-medium text-sm sm:text-base touch-manipulation min-h-[44px] ${
              errors.fullName
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50'
                : ''
            }`}
          />
          {errors.fullName && <p className="text-red-600 text-sm mt-1">{renderError(errors.fullName)}</p>}
        </div>

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
              placeholder={t('pages.signup.passwordPlaceholder')}
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
          {password && passwordErrors.length > 0 && (
            <div className="mt-2 text-sm text-slate-600">
              {passwordErrors.map((err, idx) => (
                <p key={idx} className="flex items-center gap-2">
                  <span className={password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password) ? 'text-green-600' : 'text-slate-400'}>✓</span>
                  {t(err)}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Confirm Password Input */}
        <div className="mb-6">
          <label className="label-premium">{t('auth.confirmPassword')}</label>
          <div className="relative">
            <input 
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder={t('pages.signup.confirmPasswordPlaceholder')}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className={`input-premium pr-10 ${
                errors.confirmPassword
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50'
                  : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-slate-600 hover:text-slate-900"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{renderError(errors.confirmPassword)}</p>}
          {password && confirmPassword && password === confirmPassword && (
            <p className="text-green-600 text-sm mt-1">✓ {t('pages.signup.passwordsMatch')}</p>
          )}
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50"
        >
          {loading ? t('pages.signup.creatingAccount') : t('auth.signup')}
        </button>

        <div className="mt-6">
          <div className="text-center text-sm text-slate-500 mb-3">{t('pages.signup.orContinueWith')}</div>
          <div className="flex justify-center">
            <button onClick={handleGoogleSignUp} className="btn-outline text-center flex items-center justify-center gap-2 w-full sm:w-auto" disabled={loading}>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {t('pages.signup.continueWithGoogle')}
            </button>
          </div>
        </div>

        <p className="text-center text-slate-600 dark:text-slate-300 mt-6">
          {t('auth.haveAccount')}{' '}
          <Link to="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
            {t('auth.login')}
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;