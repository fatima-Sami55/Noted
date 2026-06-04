import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export function ServerError({ onRetry }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f9f8f5] font-sans">
      <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-sm border border-slate-200/50 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shadow-inner">
            <AlertTriangle className="w-12 h-12 stroke-[1.5] animate-pulse" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-slate-800 font-serif">Oops! Something went wrong</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            We are experiencing technical difficulties on our end. The server is offline or returned an internal error. Please try again.
          </p>
        </div>

        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-full font-semibold shadow-sm hover:shadow transition-all duration-200 text-sm cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Connection</span>
        </button>
      </div>
    </div>
  );
}

export default ServerError;
