import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validateSignUp, getPasswordErrors } from '../utils/validators';
import { showSuccess, showError } from '../services/toastService';

const SignUp = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    // Validate full name
    if (!fullName.trim()) {
      setErrors(prev => ({ ...prev, fullName: 'Full name is required' }));
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
      showSuccess('Account created! Check your email to verify.');
      navigate('/verify', { state: { email } });
    } catch (err) {
      const errorMsg = err.message || 'Failed to sign up. Please try again.';
      showError(errorMsg);
      setErrors({ submit: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const passwordErrors = getPasswordErrors(password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <form onSubmit={handleSignUp} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-black mb-2 text-center">Join VisitJo</h2>
        <p className="text-center text-slate-600 mb-8">Create your account to book amazing stays</p>

        {/* Submit Error */}
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-900 font-bold text-sm">{errors.submit}</p>
            </div>
          </div>
        )}

        {/* Full Name Input */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
          <input 
            type="text"
            placeholder="John Doe" 
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className={`w-full p-3 bg-slate-50 border rounded-lg outline-none transition text-slate-900 placeholder-slate-400 ${
              errors.fullName ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:border-blue-900'
            }`}
          />
          {errors.fullName && <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>}
        </div>

        {/* Email Input */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
          <input 
            type="email"
            placeholder="you@example.com" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={`w-full p-3 bg-slate-50 border rounded-lg outline-none transition text-slate-900 placeholder-slate-400 ${
              errors.email ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:border-blue-900'
            }`}
          />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Password Input */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
          <div className="relative">
            <input 
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 chars, 1 uppercase, 1 number" 
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
          {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
          {password && passwordErrors.length > 0 && (
            <div className="mt-2 text-sm text-slate-600">
              {passwordErrors.map((err, idx) => (
                <p key={idx} className="flex items-center gap-2">
                  <span className={password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password) ? 'text-green-600' : 'text-slate-400'}>✓</span>
                  {err}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Confirm Password Input */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password</label>
          <div className="relative">
            <input 
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter password" 
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className={`w-full p-3 bg-slate-50 border rounded-lg outline-none transition text-slate-900 placeholder-slate-400 pr-10 ${
                errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:border-blue-900'
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
          {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
          {password && confirmPassword && password === confirmPassword && (
            <p className="text-green-600 text-sm mt-1">✓ Passwords match</p>
          )}
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-blue-900 text-white p-3 rounded-lg font-bold hover:bg-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Account...' : 'CREATE ACCOUNT'}
        </button>

        <p className="text-center text-slate-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-jordan-blue font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;