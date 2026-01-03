import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Missing email. Please start from the Forgot Password flow.');
      return;
    }
    if (!code.trim()) {
      setError('Please enter the verification code.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await confirmNewPassword(email, code, newPassword);
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-black mb-2 text-center">Reset Password</h2>
        <p className="text-sm text-slate-600 mb-6 text-center">Enter the code sent to <span className="font-bold">{email}</span></p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <AlertCircle className="text-red-600 inline-block mr-2" size={16} />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        <input
          placeholder="Verification code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full p-3 mb-4 border border-slate-200 bg-slate-50 rounded-lg outline-none text-center text-slate-900 placeholder-slate-400 focus:border-blue-900 transition"
          required
        />

        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-3 mb-4 border border-slate-200 bg-slate-50 rounded-lg outline-none text-slate-900 placeholder-slate-400 focus:border-blue-900 transition"
          required
        />

        <input
          type="password"
          placeholder="Confirm password"
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
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
