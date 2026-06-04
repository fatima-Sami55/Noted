import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f9f8f5] font-sans">
      <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-sm border border-slate-200/50 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-inner">
            <HelpCircle className="w-12 h-12 stroke-[1.5] animate-bounce" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-slate-800 font-serif">Oops! Nothing found</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            The page you are looking for doesn't exist or has been moved to a new destination.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-650 hover:bg-indigo-700 text-white rounded-full font-semibold shadow-sm hover:shadow transition-all duration-200 text-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
