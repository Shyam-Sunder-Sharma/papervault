import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Upload, MessageSquareQuote, Shield, ExternalLink } from 'lucide-react';

export default function Navbar({ onOpenUpload, onOpenSuggestion }) {
  const location = useLocation();
  const isRepo = location.pathname === '/repository';
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & College Badge */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
                  PaperVault
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  UPTTI Kanpur
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Find. Contribute. Learn.</p>
            </div>
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {isRepo && (
            <>
              <button
                onClick={onOpenSuggestion}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
                title="Send Feedback or Request Papers"
              >
                <MessageSquareQuote className="w-3.5 h-3.5 text-indigo-400" />
                <span>Feedback / Request</span>
              </button>

              <button
                onClick={onOpenUpload}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 shadow-md shadow-indigo-600/30 transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Paper</span>
              </button>
            </>
          )}

          {!isAdmin && !isRepo && (
            <Link
              to="/repository"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
            >
              Browse Repository
            </Link>
          )}

          {!isAdmin ? (
            <Link
              to="/admin/login"
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
              title="Admin Portal"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          ) : (
            <Link
              to="/repository"
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Student View</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
