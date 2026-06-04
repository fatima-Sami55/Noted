import React, { useState } from 'react';
import { Lock, Mail, User, ShieldAlert } from 'lucide-react';

export function SecurityIllustration() {
  return (
    <div className="w-full flex justify-center mb-6 select-none">
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-44 h-44 drop-shadow-xl group/illust"
      >
        <defs>
          {/* Main Circle Gradient */}
          <linearGradient id="bgGrad" x1="15" y1="15" x2="175" y2="175" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          {/* Yellow Accent Circle Gradient */}
          <linearGradient id="yellowCircleGrad" x1="102" y1="97" x2="178" y2="173" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          {/* Avatar Clip Path */}
          <clipPath id="avatarClip">
            <circle cx="95" cy="95" r="80" />
          </clipPath>
        </defs>

        {/* 1. Main Background Circle and Clipped Avatar */}
        <g clipPath="url(#avatarClip)">
          {/* Background Solid Gradient */}
          <circle cx="95" cy="95" r="80" fill="url(#bgGrad)" />

          {/* Neck */}
          <rect x="79" y="110" width="32" height="35" fill="#cf9e7e" />
          {/* Inner Collar Neck Skin */}
          <path d="M 80 135 L 95 151 L 110 135 Z" fill="#cf9e7e" />
          
          {/* Left Collar Flap */}
          <path d="M 78 135 L 95 156 L 86 156 Z" fill="#ffffff" />
          {/* Right Collar Flap */}
          <path d="M 112 135 L 95 156 L 104 156 Z" fill="#e2e8f0" />

          {/* Shirt Left (Shaded) */}
          <path d="M 20 175 C 35 142, 65 135, 95 135 L 95 190 L 20 190 Z" fill="#be185d" />
          {/* Shirt Right (Bright) */}
          <path d="M 95 135 C 125 135, 155 142, 170 175 L 170 190 L 95 190 Z" fill="#db2777" />

          {/* Left Ear */}
          <rect x="58" y="70" width="8" height="18" rx="4" fill="#e8be9e" />
          {/* Right Ear */}
          <rect x="124" y="70" width="8" height="18" rx="4" fill="#e8be9e" />

          {/* Head (Cheeks/Chin) */}
          <path d="M 65 55 H 125 V 85 C 125 108, 112 121, 95 121 C 78 121, 65 108, 65 85 Z" fill="#e8be9e" />

          {/* Hair (Comb-over styled quiff) */}
          <path
            d="M 63 78 L 63 50 C 63 28, 75 16, 88 16 C 105 16, 127 25, 127 50 L 127 78 L 122 78 L 122 55 L 68 55 L 68 78 Z"
            fill="#0d2a4a"
          />
        </g>

        {/* 2. Outer White Border Ring */}
        <circle cx="95" cy="95" r="80" stroke="#ffffff" strokeWidth="4" fill="none" />

        {/* 3. Interactive Floating Yellow Circle & Padlock Section */}
        <g className="transition-all duration-500 origin-[140px_135px] group-hover/illust:scale-108 group-hover/illust:rotate-3">
          {/* Yellow Accent Circle */}
          <circle
            cx="140"
            cy="135"
            r="38"
            fill="url(#yellowCircleGrad)"
            stroke="#ffffff"
            strokeWidth="4"
            className="drop-shadow-lg"
          />

          {/* Flat Lock Shadow (shifted slightly down/right) */}
          <rect x="125" y="127" width="34" height="26" rx="5" fill="#d97706" opacity="0.6" />

          {/* Shackle (Arch) */}
          <path
            d="M 129 125 V 115 A 11 11 0 0 1 151 115 V 125"
            stroke="#ffffff"
            strokeWidth="5.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Lock Body */}
          <rect x="123" y="124" width="34" height="26" rx="5" fill="#1e293b" />

          {/* Keyhole Details */}
          <circle cx="140" cy="133" r="3" fill="#0f172a" />
          <path d="M 138.5 135 L 141.5 135 L 143 143 L 137 143 Z" fill="#0f172a" />
        </g>
      </svg>
    </div>
  );
}

export function Login({ onAuthSuccess, onSwitchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error('Invalid username or password');
      }

      onAuthSuccess(data.user);
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-5 sm:p-8 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-blue-50/50">
      <div className="text-center mb-8">
        <SecurityIllustration />
        <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
        <p className="text-slate-500 mt-1">Log in to manage your premium digital cards</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 mb-6 rounded-2xl bg-rose-50 text-rose-600 text-sm border border-rose-100">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-2">Username</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 transition-all font-medium"
              placeholder="Your username"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 transition-all font-medium"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold shadow-md shadow-blue-500/10 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? 'Logging in...' : 'Sign In'}
        </button>
      </form>

      <div className="text-center mt-6 text-sm text-slate-500">
        Don't have an account?{' '}
        <button
          onClick={onSwitchToRegister}
          className="font-semibold text-blue-600 hover:underline hover:text-blue-700 focus:outline-none"
        >
          Register here
        </button>
      </div>
    </div>
  );
}

export function Register({ onAuthSuccess, onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const cleanUsername = username.trim();
  const cleanEmail = email.trim();

  // Username validation
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
    return "bg-slate-350";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Force Name / Username Credentials
    if (!isUsernameValid) {
      setError("Username must be 3-20 characters, alphanumeric or underscores only.");
      return;
    }

    // Force Email Credentials
    if (!isEmailValid) {
      setError("Please enter a valid email address.");
      return;
    }

    // Force Strong Password Credentials
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

      onAuthSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-5 sm:p-8 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-blue-50/50">
      <div className="text-center mb-8">
        <SecurityIllustration />
        <h2 className="text-2xl font-bold text-slate-800">Create Account</h2>
        <p className="text-slate-500 mt-1">Get started by setting up your notes dashboard</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 mb-6 rounded-2xl bg-rose-50 text-rose-600 text-sm border border-rose-100">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-2">Username</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 transition-all font-medium"
              placeholder="Choose a username"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 transition-all font-medium"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 transition-all font-medium"
              placeholder="Choose a strong password"
            />
          </div>

          {/* Dynamic Password Strength Indicator */}
          {password && (
            <div className="mt-3 space-y-2 p-3 bg-slate-50 border border-slate-200/50 rounded-2xl transition-all duration-300">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">Password Strength:</span>
                <span className={
                  getPasswordStrength() === 1 ? "text-rose-600" :
                  getPasswordStrength() === 2 ? "text-amber-600" :
                  getPasswordStrength() === 3 ? "text-amber-600" :
                  getPasswordStrength() === 4 ? "text-emerald-600" : "text-slate-400"
                }>
                  {getPasswordStrengthLabel()}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full bg-slate-200/60 rounded-full overflow-hidden">
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
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold shadow-md shadow-blue-500/10 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? 'Creating...' : 'Register'}
        </button>
      </form>

      <div className="text-center mt-6 text-sm text-slate-500">
        Already have an account?{' '}
        <button
          onClick={onSwitchToLogin}
          className="font-semibold text-blue-600 hover:underline hover:text-blue-700 focus:outline-none"
        >
          Sign in here
        </button>
      </div>
    </div>
  );
}
