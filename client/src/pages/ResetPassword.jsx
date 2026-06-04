import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { SecurityIllustration } from '../components/SecurityIllustration';

export function ResetPassword({ showToast }) {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Password validations
  const isLengthValid = password.length >= 8;
  const hasNumber = /[0-9]/.test(password);

  useEffect(() => {
    if (!token) {
      setError('Password reset token is missing from the link.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Password reset token is missing from the link.');
      return;
    }

    if (!isLengthValid || !hasNumber) {
      setError('Password must be at least 8 characters long and contain at least one number.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      showToast(data.message || 'Password reset successfully!');
      setSuccess(true);

      // 3s delay then redirect to login
      setTimeout(() => {
        navigate('/login');
      }, 3000);
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
          <h2 className="text-2xl font-bold text-slate-800 font-serif">Reset Password</h2>
          <p className="text-slate-500 text-sm mt-1">Please enter your new strong password below</p>
        </div>

        {error && (
          <div className="mb-8">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 text-rose-600 text-sm border border-rose-200/60 shadow-sm">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
              <span className="font-semibold leading-relaxed">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="p-4 mb-6 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-semibold space-y-2 border border-emerald-100/50 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p>Password changed! Redirecting to login...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                required
                disabled={success}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/30 transition-all font-medium text-sm text-slate-700"
                placeholder="Choose a new password"
              />
            </div>
            
            {password && (
              <div className="mt-2 space-y-1 text-[11px] font-medium text-slate-400">
                <p className={isLengthValid ? 'text-emerald-600 font-bold' : ''}>
                  • At least 8 characters
                </p>
                <p className={hasNumber ? 'text-emerald-600 font-bold' : ''}>
                  • At least 1 number
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                required
                disabled={success}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/30 transition-all font-medium text-sm text-slate-700"
                placeholder="Re-type your password"
              />
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">Passwords do not match.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Update Password</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-400 font-medium">
          <Link
            to="/login"
            className="font-bold text-indigo-600 hover:underline hover:text-indigo-700"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
