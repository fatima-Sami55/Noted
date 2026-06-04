import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Mail, ShieldAlert, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';
import { SecurityIllustration } from '../components/SecurityIllustration';

export function Login({ onAuthSuccess, showToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Unverified block state
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const [resendCooldownTime, setResendCooldownTime] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUnverifiedEmail('');
    setResendSuccess('');
    setResendCooldownTime('');

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await response.json();

      if (response.status === 403) {
        // Blocked because email is unverified
        setUnverifiedEmail(data.email || email.trim());
        setError(data.message || "Please verify your email before logging in.");
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Invalid email or password');
      }

      onAuthSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!unverifiedEmail) return;

    setResendLoading(true);
    setResendSuccess('');
    setResendCooldownTime('');
    setError('');

    try {
      const response = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: unverifiedEmail })
      });

      const data = await response.json();

      if (response.status === 429) {
        setResendCooldownTime(data.resend_available_at);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend verification link');
      }

      showToast(data.message || "Verification email sent successfully!");
      setResendSuccess("Verification link sent! Check your inbox.");
    } catch (err) {
      setError(err.message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f9f8f5] relative overflow-hidden font-sans">
      <div className="w-full max-w-md p-5 sm:p-8 bg-white rounded-3xl shadow-sm border border-slate-200/50">
        <div className="text-center mb-8">
          <SecurityIllustration />
          <h2 className="text-2xl font-bold text-slate-800 font-serif">Welcome Back</h2>
          <p className="text-slate-500 text-sm mt-1">Log in to manage your digital workspace</p>
        </div>

        {error && (
          <div className="mb-8">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 text-rose-600 text-sm border border-rose-200/60 shadow-sm">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
              <span className="font-semibold leading-relaxed">{error}</span>
            </div>
          </div>
        )}

        {unverifiedEmail && (
          <div className="p-4 mb-6 bg-amber-50/60 border border-amber-200/50 rounded-2xl space-y-3">
            <div className="flex items-start gap-2 text-amber-850 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>Your email isn't verified yet.</span>
            </div>
            
            <button
              onClick={handleResend}
              disabled={resendLoading || !!resendCooldownTime}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100/50 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendLoading ? (
                <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              ) : 'Resend verification email'}
            </button>

            {resendCooldownTime && (
              <div className="text-[10px] text-amber-800 font-medium bg-amber-50 p-2.5 rounded-lg border border-amber-100/50">
                A verification email was already sent. Request again after {resendCooldownTime}.
              </div>
            )}

            {resendSuccess && (
              <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{resendSuccess}</span>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/30 transition-all font-medium text-sm text-slate-700"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-600">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs font-bold text-indigo-600 hover:underline hover:text-indigo-700"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/30 transition-all font-medium text-sm text-slate-700"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Login</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-400 font-medium">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-bold text-indigo-600 hover:underline hover:text-indigo-700"
          >
            Sign up here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
