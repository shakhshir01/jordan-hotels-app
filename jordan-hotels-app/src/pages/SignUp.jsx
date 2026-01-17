import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validateSignUp, getPasswordErrors } from '../utils/validators';
import { showSuccess, showError } from '../services/toastService';
import { useTranslation } from 'react-i18next';
import { Auth } from 'aws-amplify';

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
      await Auth.federatedSignIn({ provider: 'Google' });
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
        <div className="mb-6">
          <label className="label-premium">{t('auth.fullName')}</label>
          <input 
            type="text"
            placeholder="John Doe" 
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className={`input-premium ${
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
            <button onClick={handleGoogleSignUp} className="btn-outline text-center" disabled={loading}>
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