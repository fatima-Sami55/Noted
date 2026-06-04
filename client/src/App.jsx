import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';
import ServerError from './pages/ServerError';
import { Sparkles, ShieldAlert } from 'lucide-react';

export function App() {
  // Session & Authentication State
  const [user, setUser] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [serverError, setServerError] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  // Check login session on mount
  useEffect(() => {
    checkSession();
  }, []);

  // Helper to trigger toast alerts
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const checkSession = async () => {
    try {
      const res = await fetch('/api/me');
      if (res.status >= 500) {
        setServerError(true);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setServerError(false);
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error("Session check failed:", e);
      setServerError(true);
      setUser(null);
    } finally {
      loadingSession && setLoadingSession(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/logout');
      if (res.ok) {
        setUser(null);
        showToast('Successfully logged out!');
      } else {
        showToast('Logout failed', 'error');
      }
    } catch (e) {
      console.error("Logout failed:", e);
      showToast('Logout failed', 'error');
    }
  };

  // Handle Server Error (500) view
  if (serverError) {
    return (
      <ServerError 
        onRetry={() => {
          setServerError(false);
          setLoadingSession(true);
          checkSession();
        }} 
      />
    );
  }

  // Loading indicator for checking session
  if (loadingSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9f8f5]">
        <div className="w-10 h-10 border-[3px] border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium text-sm mt-4 animate-pulse">Connecting...</p>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Public auth pages */}
        <Route 
          path="/login" 
          element={
            user ? <Navigate to="/" replace /> : (
              <Login 
                onAuthSuccess={(userData) => {
                  setUser(userData);
                  showToast(`Welcome back, ${userData.username}!`);
                }} 
                showToast={showToast}
              />
            )
          } 
        />
        <Route 
          path="/register" 
          element={
            user ? <Navigate to="/" replace /> : (
              <Register 
                onAuthSuccess={(userData) => {
                  setUser(userData);
                  showToast(`Account created! Welcome, ${userData.username}`);
                }} 
                showToast={showToast}
              />
            )
          } 
        />
        <Route path="/verify-email" element={<VerifyEmail showToast={showToast} />} />
        <Route path="/forgot-password" element={<ForgotPassword showToast={showToast} />} />
        <Route path="/reset-password" element={<ResetPassword showToast={showToast} />} />

        {/* Protected Dashboard Route */}
        <Route 
          path="/" 
          element={
            !user ? <Navigate to="/login" replace /> : (
              <Dashboard
                user={user}
                onLogout={handleLogout}
                onUpdateUser={(updated) => setUser(updated)}
                showToast={showToast}
                setServerError={setServerError}
              />
            )
          } 
        />

        {/* Error and Not Found pages */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>

      {/* Toast Notifications */}
      {toast && (
        <div className={`fixed bottom-20 lg:bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border backdrop-blur-md transition-all duration-300 animate-slide-in ${
          toast.type === 'error'
            ? 'bg-rose-50/95 text-rose-700 border-rose-100/60 shadow-rose-100/10'
            : 'bg-emerald-50/95 text-emerald-700 border-emerald-100/60 shadow-emerald-100/10'
        }`}>
          {toast.type === 'error' ? (
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-500" />
          ) : (
            <Sparkles className="w-5 h-5 flex-shrink-0 text-emerald-500" />
          )}
          <span className="text-sm font-bold tracking-tight">{toast.message}</span>
        </div>
      )}
    </>
  );
}

export default App;
