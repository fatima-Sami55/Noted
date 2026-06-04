import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Mail, AlertTriangle, Sparkles } from 'lucide-react';

export function VerifyEmail({ showToast }) {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('idle'); // 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  
  // Resend state inside verification error container
  const [emailInput, setEmailInput] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const [resendCooldownTime, setResendCooldownTime] = useState('');
  const [resendError, setResendError] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Verification token is missing.');
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(`/api/verify-email?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Verification failed');
        }

        setStatus('success');
        showToast(data.message || 'Email verified successfully!');
      } catch (err) {
        setStatus('error');
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleRequestNewLink = async (e) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setResendError('Email is required');
      return;
    }

    setResendLoading(true);
    setResendSuccess('');
    setResendCooldownTime('');
    setResendError('');

    try {
      const response = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.trim() })
      });

      const data = await response.json();

      if (response.status === 429) {
        setResendCooldownTime(data.resend_available_at);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend verification email');
      }

      showToast(data.message || 'Verification email resent successfully!');
      setResendSuccess('New verification link sent! Please check your inbox.');
    } catch (err) {
      setResendError(err.message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f9f8f5] relative overflow-hidden font-sans">
      <div className="w-full max-w-md p-6 sm:p-8 bg-white rounded-3xl shadow-sm border border-slate-200/50 text-center space-y-6">
        
        {loading && (
          <div className="space-y-4 py-8">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 text-sm font-semibold">Verifying your email address...</p>
          </div>
        )}

        {!loading && status === 'success' && (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-800 font-serif">Email verified!</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Thank you. Your email address has been verified. You can now log in to access your notes dashboard.
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/login"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold shadow-sm hover:shadow transition-all duration-200 block text-sm"
              >
                Log In
              </Link>
            </div>
          </div>
        )}

        {!loading && status === 'error' && (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <XCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-800 font-serif">Verification failed</h2>
              <p className="text-rose-600 text-sm font-medium">{errorMessage}</p>
            </div>

            {/* Request a new link inline form */}
            <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200/50 rounded-2xl text-left space-y-4">
              <div className="flex items-center gap-2 text-slate-700 text-xs font-bold uppercase tracking-wide">
                <Mail className="w-4 h-4 text-indigo-500" />
                <span>Request a new link</span>
              </div>

              {resendError && (
                <p className="text-[11px] text-rose-500 font-semibold">{resendError}</p>
              )}

              {resendCooldownTime && (
                <div className="p-3 bg-amber-50 text-amber-800 rounded-xl text-[11px] space-y-1 border-l-4 border-amber-500">
                  <div className="font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Rate limit check</span>
                  </div>
                  <p>A verification email was already sent. You can request a new one after {resendCooldownTime}.</p>
                </div>
              )}

              {resendSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-[11px] flex items-center gap-1.5 border-l-4 border-emerald-500 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{resendSuccess}</span>
                </div>
              )}

              <form onSubmit={handleRequestNewLink} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter email address"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white font-medium text-slate-700"
                />
                <button
                  type="submit"
                  disabled={resendLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center min-w-[70px]"
                >
                  {resendLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : 'Send'}
                </button>
              </form>
            </div>

            <div className="pt-2">
              <Link
                to="/login"
                className="text-xs font-semibold text-indigo-600 hover:underline hover:text-indigo-700 block"
              >
                Back to login
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default VerifyEmail;
