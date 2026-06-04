import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ShieldAlert, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { SecurityIllustration } from '../components/SecurityIllustration';

export function ForgotPassword({ showToast }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cooldownTime, setCooldownTime] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setCooldownTime('');
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json();

      if (response.status === 429) {
        setCooldownTime(data.resend_available_at);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      showToast(data.message || 'If that email exists, a reset link has been sent.');
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f9f8f5] relative overflow-hidden font-sans">
      <div className="w-full max-w-md p-5 sm:p-8 bg-white rounded-3xl shadow-sm border border-slate-200/50">
        <div className="text-center mb-8">
          <SecurityIllustration />
          <h2 className="text-2xl font-bold text-slate-800 font-serif">Forgot Password</h2>
          <p className="text-slate-500 text-sm mt-1">Enter your email to receive a password reset link</p>
        </div>

        {error && (
          <div className="mb-8">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 text-rose-600 text-sm border border-rose-200/60 shadow-sm">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
              <span className="font-semibold leading-relaxed">{error}</span>
            </div>
          </div>
        )}

        {cooldownTime && (
          <div className="p-4 mb-6 bg-amber-50/60 border-l-4 border-amber-500 rounded-2xl text-left text-xs text-amber-800 space-y-1">
            <div className="font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>A password reset email was already sent</span>
            </div>
            <p>You can request a new one after <span className="font-bold">{cooldownTime}</span>.</p>
          </div>
        )}

        {success && (
          <div className="mb-6">
            <div className="p-4 bg-emerald-50/60 border-l-4 border-emerald-500 rounded-2xl text-left text-xs text-emerald-800 space-y-1 font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>If that email is registered, a reset link has been sent.</span>
            </div>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Send Reset Link</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-400 font-medium">
          Remembered your password?{' '}
          <Link
            to="/login"
            className="font-bold text-indigo-600 hover:underline hover:text-indigo-700"
          >
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
