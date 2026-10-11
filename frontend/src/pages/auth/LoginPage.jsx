import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import { LogIn, Building, Lock, Mail, AlertCircle, ShieldCheck, KeyRound, ArrowLeft } from 'lucide-react';

export const LoginPage = ({ onNavigate }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNav = (path, viewId) => {
    if (navigate) navigate(path);
    else if (onNavigate) onNavigate(viewId);
  };

  // Optional 2FA OTP Mode
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSentMessage, setOtpSentMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (isOtpMode) {
        // Verify OTP (backend sets HttpOnly cookie)
        await apiClient.post('/auth/otp/verify', { email, otp_code: otpCode });
        window.location.reload();
      } else {
        // Standard Password Login
        await login(email, password);
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.detail || 'Invalid email or password.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await apiClient.post('/auth/otp/send', { email, purpose: 'LOGIN_2FA' });
      setIsOtpMode(true);
      setOtpSentMessage(`Verification code sent to ${email}. Please check your inbox.`);
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to dispatch verification code.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 relative flex items-center justify-center p-4 overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      <div className="liquid-glow-orb w-96 h-96 bg-indigo-600/25 -top-20 -left-20" />
      <div className="liquid-glow-orb w-96 h-96 bg-purple-600/25 -bottom-20 -right-20" />

      <div className="max-w-md w-full liquid-glass rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 border border-white/10 text-slate-100 relative z-10 backdrop-blur-2xl">
        <button
          type="button"
          onClick={() => handleNav('/', 'home')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Platform Overview
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl text-white shadow-xl shadow-indigo-500/25 mb-4 ring-1 ring-white/20">
            <Building className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">TaskFlow Enterprise</h1>
          <p className="text-sm text-slate-400 mt-1">Sign in with your workspace credentials</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
            <div>{error}</div>
          </div>
        )}

        {otpSentMessage && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 text-emerald-300 text-sm">
            <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400" />
            <div>{otpSentMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-11 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>

          {!isOtpMode ? (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => handleNav('/forgot-password', 'forgot-password')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer transition"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                6-Digit Verification Code
              </label>
              <div className="relative">
                <KeyRound className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white tracking-widest font-mono text-center text-lg placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {isSubmitting ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                {isOtpMode ? 'Verify Code & Sign In' : 'Sign In'}
              </>
            )}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          {!isOtpMode ? (
            <button
              type="button"
              onClick={handleSendOtp}
              className="text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer transition flex items-center gap-1"
            >
              <KeyRound className="w-3.5 h-3.5" /> Sign in with OTP Code instead
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsOtpMode(false)}
              className="text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer transition"
            >
              ← Back to Password Login
            </button>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-sm text-slate-400">
          Don't have an organization workspace?{' '}
          <button
            onClick={() => handleNav('/register', 'register')}
            className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer transition"
          >
            Register Organization
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
