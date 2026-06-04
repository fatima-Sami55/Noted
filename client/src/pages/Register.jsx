import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Mail, User, ShieldAlert, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';
import { SecurityIllustration } from '../components/SecurityIllustration';

export function Register({ onAuthSuccess, showToast }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successEmail, setSuccessEmail] = useState('');
  
  // Resend state variables
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendCooldownTime, setResendCooldownTime] = useState('');

  const cleanUsername = username.trim();
  const cleanEmail = email.trim();

  // Username validation: 3-20 characters, alphanumeric or underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  const isUsernameValid = usernameRegex.test(cleanUsername);

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(cleanEmail);

  // Password components check
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[@$!%*?&#]/.test(password);
  const isLengthValid = password.length >= 8;

  const getPasswordStrength = () => {
    let score = 0;
    if (isLengthValid) score++;
    if (hasLower && hasUpper) score++;
    if (hasDigit) score++;
    if (hasSpecial) score++;
    return score;
  };

  const getPasswordStrengthLabel = () => {
    const score = getPasswordStrength();
    if (score === 1) return "Weak";
    if (score === 2) return "Fair";
    if (score === 3) return "Good";
    if (score === 4) return "Strong";
    return "Very Weak";
  };

  const getPasswordStrengthColor = () => {
    const score = getPasswordStrength();
    if (score === 1) return "bg-rose-500";
    if (score === 2) return "bg-amber-500";
    if (score === 3) return "bg-amber-500";
    if (score === 4) return "bg-emerald-500";
    return "bg-slate-300";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isUsernameValid) {
      setError("Username must be 3-20 characters, alphanumeric or underscores only.");
      return;
    }

    if (!isEmailValid) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!isLengthValid || !hasLower || !hasUpper || !hasDigit || !hasSpecial) {
      setError("Password does not meet the strong password requirements.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername, email: cleanEmail, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      showToast(data.message || "Registration successful! Verification email sent.");
      setSuccessEmail(cleanEmail);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendMessage('');
    setResendCooldownTime('');

    try {
      const response = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: successEmail })
      });

      const data = await response.json();

      if (response.status === 429) {
        setResendCooldownTime(data.resend_available_at);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend verification email');
      }

      showToast(data.message || "Verification email resent successfully!");
      setResendMessage("Verification email resent successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setResendLoading(false);
    }
  };

  // Render registration success card
  if (successEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#f9f8f5] relative overflow-hidden font-sans">
        <div className="w-full max-w-md p-6 sm:p-8 bg-white rounded-3xl shadow-sm border border-slate-200/50 text-center space-y-6">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <Mail className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-800 font-serif">Check your inbox!</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              We sent a verification email to <span className="font-semibold text-slate-700">{successEmail}</span>.
              Please click the confirmation link to activate your account.
            </p>
          </div>

          {resendCooldownTime && (
            <div className="p-4 bg-amber-50/60 border-l-4 border-amber-500 rounded-xl text-left text-xs text-amber-800 space-y-1">
              <div className="font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Rate limit check</span>
              </div>
              <p>A verification email was already sent. You can request a new one after {resendCooldownTime}.</p>
            </div>
          )}

          {resendMessage && (
            <div className="p-4 bg-emerald-50/60 border-l-4 border-emerald-500 rounded-xl text-left text-xs text-emerald-800 flex items-center gap-1.5 font-semibold">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{resendMessage}</span>
            </div>
          )}

          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              {resendLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : 'Resend Verification Email'}
            </button>

            <Link
              to="/login"
              className="text-xs font-semibold text-indigo-600 hover:underline hover:text-indigo-700 block py-1.5"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f9f8f5] relative overflow-hidden font-sans">
      <div className="w-full max-w-md p-5 sm:p-8 bg-white rounded-3xl shadow-sm border border-slate-200/50">
        <div className="text-center mb-8">
          <SecurityIllustration />
          <h2 className="text-2xl font-bold text-slate-800 font-serif">Create Account</h2>
          <p className="text-slate-500 text-sm mt-1">Get started by setting up your notes dashboard</p>
        </div>

        {error && (
          <div className="mb-8">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 text-rose-600 text-sm border border-rose-200/60 shadow-sm">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
              <span className="font-semibold leading-relaxed">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/30 transition-all font-medium text-sm text-slate-700"
                placeholder="Choose a username"
              />
            </div>
            {username && !isUsernameValid && (
              <p className="text-[11px] text-rose-500 mt-1.5 font-medium">Must be 3-20 alphanumeric characters or underscores.</p>
            )}
          </div>

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
            {email && !isEmailValid && (
              <p className="text-[11px] text-rose-500 mt-1.5 font-medium">Please enter a valid email address.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/30 transition-all font-medium text-sm text-slate-700"
                placeholder="Choose a strong password"
              />
            </div>

            {/* Dynamic Password Strength Indicator */}
            {password && (
              <div className="mt-3 space-y-2 p-3 bg-slate-50 border border-slate-200/50 rounded-2xl transition-all duration-300">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-slate-400">Strength</span>
                  <span className={
                    getPasswordStrength() === 1 ? "text-rose-600" :
                    getPasswordStrength() === 2 ? "text-amber-600" :
                    getPasswordStrength() === 3 ? "text-amber-600" :
                    getPasswordStrength() === 4 ? "text-emerald-600" : "text-slate-400"
                  }>
                    {getPasswordStrengthLabel()}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 h-1 w-full bg-slate-200/60 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${getPasswordStrength() >= 1 ? getPasswordStrengthColor() : 'bg-slate-200'}`} />
                  <div className={`h-full rounded-full transition-all duration-300 ${getPasswordStrength() >= 2 ? getPasswordStrengthColor() : 'bg-slate-200'}`} />
                  <div className={`h-full rounded-full transition-all duration-300 ${getPasswordStrength() >= 3 ? getPasswordStrengthColor() : 'bg-slate-200'}`} />
                  <div className={`h-full rounded-full transition-all duration-300 ${getPasswordStrength() >= 4 ? getPasswordStrengthColor() : 'bg-slate-200'}`} />
                </div>
                
                {/* Requirements Checklist */}
                <ul className="text-[11px] font-medium text-slate-400 space-y-1 pt-1">
                  <li className={`flex items-center gap-1.5 transition-colors duration-200 ${isLengthValid ? 'text-emerald-600 font-semibold' : ''}`}>
                    <span className={`w-1 h-1 rounded-full ${isLengthValid ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    At least 8 characters
                  </li>
                  <li className={`flex items-center gap-1.5 transition-colors duration-200 ${(hasLower && hasUpper) ? 'text-emerald-600 font-semibold' : ''}`}>
                    <span className={`w-1 h-1 rounded-full ${(hasLower && hasUpper) ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    Uppercase & lowercase letters
                  </li>
                  <li className={`flex items-center gap-1.5 transition-colors duration-200 ${hasDigit ? 'text-emerald-600 font-semibold' : ''}`}>
                    <span className={`w-1 h-1 rounded-full ${hasDigit ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    At least one number (0-9)
                  </li>
                  <li className={`flex items-center gap-1.5 transition-colors duration-200 ${hasSpecial ? 'text-emerald-600 font-semibold' : ''}`}>
                    <span className={`w-1 h-1 rounded-full ${hasSpecial ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    Special character (@$!%*?&#)
                  </li>
                </ul>
              </div>
            )}
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
                <span>Register</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-400 font-medium">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-indigo-600 hover:underline hover:text-indigo-700"
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
