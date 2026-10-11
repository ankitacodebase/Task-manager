import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Building, 
  User, 
  Mail, 
  Lock, 
  UserPlus, 
  AlertCircle, 
  ArrowLeft, 
  KeyRound, 
  CheckCircle2, 
  RefreshCw,
  Sparkles
} from 'lucide-react';

export const RegisterPage = ({ onNavigate }) => {
  const { register, verifyOtp, sendOtp } = useAuth();
  const navigate = useNavigate();

  // Wizard state: 'form' | 'otp'
  const [step, setStep] = useState('form');

  // Step 1: Form state
  const [tenantName, setTenantName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Step 2: OTP state
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Common state
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cooldown timer effect
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleNav = (path, viewId) => {
    if (navigate) navigate(path);
    else if (onNavigate) onNavigate(viewId);
  };

  // Step 1: Submit Registration & Request OTP
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setIsSubmitting(true);

    try {
      await register(tenantName, fullName, email, password);
      setStep('otp');
      setResendCooldown(30);
      setInfoMessage(`Verification code sent to ${email}. Please check your inbox.`);
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.detail || 'Registration failed.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify 6-digit OTP & Log In
  const handleOtpVerify = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit numeric verification code.');
      return;
    }

    setError('');
    setInfoMessage('');
    setIsSubmitting(true);

    try {
      await verifyOtp(email, otpCode.trim());
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.detail || 'Invalid or expired verification code.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setInfoMessage('');
    setIsSubmitting(true);

    try {
      await sendOtp(email, 'REGISTRATION_VERIFICATION');
      setResendCooldown(30);
      setInfoMessage(`A fresh verification code has been dispatched to ${email}.`);
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

        {/* STEP 1: Registration Form */}
        {step === 'form' && (
          <div className="animate-in fade-in duration-200">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl text-white shadow-xl shadow-indigo-500/25 mb-4 ring-1 ring-white/20">
                <UserPlus className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Create Workspace</h1>
              <p className="text-sm text-slate-400 mt-1">Register your organization & admin account</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 text-rose-300 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Organization Name
                </label>
                <div className="relative">
                  <Building className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    placeholder="Acme Technologies"
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Admin Full Name
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alice Admin"
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Admin Work Email
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

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Password (Min 8 Characters)
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
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
                  <>
                    <UserPlus className="w-4 h-4" />
                    Continue to Email Verification
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-400">
              Already registered?{' '}
              <button
                onClick={() => handleNav('/login', 'login')}
                className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer transition"
              >
                Sign In here
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: 6-Digit Email OTP Verification */}
        {step === 'otp' && (
          <div className="animate-in fade-in duration-200">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-emerald-500 to-indigo-600 rounded-2xl text-white shadow-xl shadow-emerald-500/25 mb-4 ring-1 ring-white/20">
                <KeyRound className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Verify Your Email</h1>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                We sent a 6-digit verification code to <span className="font-semibold text-white">{email}</span>.
              </p>
            </div>

            {infoMessage && (
              <div className="mb-4 p-3 bg-indigo-500/15 border border-indigo-500/30 rounded-xl flex items-start gap-2.5 text-xs text-indigo-300">
                <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>{infoMessage}</div>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleOtpVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 text-center">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="w-full py-3.5 bg-slate-900/90 border border-white/15 rounded-xl text-white font-mono text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || otpCode.length !== 6}
                className="w-full py-3 liquid-button text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Verify & Launch Workspace
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setError('');
                }}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                Edit Details
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || isSubmitting}
                className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
