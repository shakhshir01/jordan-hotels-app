import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setSuccess('Verification code sent to your email.');
      // Navigate to reset page with email in state
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      setError(err.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-black mb-4 text-center">Forgot Password</h2>
        <p className="text-sm text-slate-600 mb-6 text-center">Enter your email to receive a verification code.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <AlertCircle className="text-red-600 inline-block mr-2" size={16} />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
            <span className="text-green-700">{success}</span>
          </div>
        )}

        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border border-slate-200 bg-slate-50 rounded-lg outline-none text-slate-900 placeholder-slate-400 focus:border-blue-900 transition"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-900 text-white p-3 rounded-lg font-bold hover:bg-blue-800 transition-all disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Verification Code'}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
