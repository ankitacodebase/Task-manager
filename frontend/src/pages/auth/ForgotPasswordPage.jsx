import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { KeyRound, Mail, ArrowLeft, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

export const ForgotPasswordPage = ({ onNavigate, setPrefilledToken }) => {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNav = (path, viewId) => {
    if (navigate) navigate(path);
    else if (onNavigate) onNavigate(viewId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const data = await forgotPassword(email);
      setResult(data);
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.detail || 'Request failed.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProceedToReset = () => {
    if (result?.reset_token && setPrefilledToken) {
      setPrefilledToken(result.reset_token);
    }
    handleNav('/reset-password', 'reset-password');
  };

  return (
    <div className="min-h-screen bg-slate-950 relative flex items-center justify-center p-4 overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      <div className="liquid-glow-orb w-96 h-96 bg-indigo-600/25 -top-20 -left-20" />
      <div className="liquid-glow-orb w-96 h-96 bg-purple-600/25 -bottom-20 -right-20" />

      <div className="max-w-md w-full liquid-glass rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 border border-white/10 text-slate-100 relative z-10 backdrop-blur-2xl">
        <button
          onClick={() => handleNav('/login', 'login')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl text-white shadow-xl shadow-indigo-500/25 mb-4 ring-1 ring-white/20">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Forgot Password</h1>
          <p className="text-sm text-slate-400 mt-1">Enter your email to receive recovery instructions</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
            <div>{error}</div>
          </div>
        )}

        {result ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-sm flex items-start gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400" />
              <div>
                <p className="font-semibold text-white">Reset Token Generated</p>
                <p className="mt-1 text-slate-300 text-xs">{result.message}</p>
              </div>
            </div>

            {result.reset_token && (
              <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Your Recovery Token:
                </label>
                <div className="font-mono text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-indigo-300 break-all select-all">
                  {result.reset_token}
                </div>
              </div>
            )}

            <button
              onClick={handleProceedToReset}
              className="w-full py-3 liquid-button text-white font-medium rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Set New Password Now
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alice@acme.com"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 liquid-button text-white font-medium rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                'Generate Recovery Token'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
