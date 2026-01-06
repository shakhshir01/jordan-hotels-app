import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validateLogin } from '../utils/validators';
import { useTranslation } from 'react-i18next';

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
      await login(email, password);
      navigate('/');
    } catch (err) {
      setErrors({ submit: err.message || 'pages.login.invalidCredentials' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-black mb-2 text-center">{t('pages.login.title')}</h2>
        <p className="text-center text-slate-600 mb-8">{t('pages.login.subtitle')}</p>

        {/* Submit Error */}
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-900 font-bold text-sm">{typeof errors.submit === 'string' && errors.submit.startsWith('pages.') ? t(errors.submit) : errors.submit}</p>
            </div>
          </div>
        )}

        {/* Email Input */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-700 mb-2">{t('auth.email')}</label>
          <input 
            type="email"
            placeholder="you@example.com" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={`w-full p-3 bg-slate-50 border rounded-lg outline-none transition text-slate-900 placeholder-slate-400 ${
              errors.email ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:border-blue-900'
            }`}
          />
          {errors.email && <p className="text-red-600 text-sm mt-1">{renderError(errors.email)}</p>}
        </div>

        {/* Password Input */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-700 mb-2">{t('auth.password')}</label>
          <div className="relative">
            <input 
              type={showPassword ? 'text' : 'password'}
              placeholder={t('pages.login.passwordPlaceholder')}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={`w-full p-3 bg-slate-50 border rounded-lg outline-none transition text-slate-900 placeholder-slate-400 pr-10 ${
                errors.password ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:border-blue-900'
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
          className="w-full bg-blue-900 text-white p-3 rounded-lg font-bold hover:bg-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t('pages.login.signingIn') : t('auth.login')}
        </button>

        <p className="text-center text-slate-600 mt-6">
          {t('auth.dontHaveAccount')}{' '}
          <Link to="/signup" className="text-jordan-blue font-bold hover:underline">
            {t('auth.signup')}
          </Link>
        </p>
        <p className="text-center text-slate-600 mt-2">
          <Link to="/forgot-password" className="text-sm text-jordan-blue hover:underline">
            {t('auth.forgotPassword')}
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;