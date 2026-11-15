import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Upload,
  MessageSquareQuote,
  Shield,
  ExternalLink,
  Menu,
  X,
  GraduationCap,
} from 'lucide-react';

export default function Navbar({ onOpenUpload, onOpenSuggestion }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isRepo = location.pathname === '/repository';
  const isAdmin = location.pathname.startsWith('/admin');

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0a0e17]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & College Badge */}
        <div className="flex items-center space-x-2.5">
          <Link to="/" onClick={closeMenu} className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-200 bg-clip-text text-transparent">
                  PaperVault
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  UPTTI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">Find. Contribute. Learn.</p>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Actions */}
        <div className="hidden md:flex items-center space-x-2.5">
          {isRepo ? (
            <>
              <button
                onClick={onOpenSuggestion}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors"
                title="Send Feedback or Request Papers"
              >
                <MessageSquareQuote className="w-4 h-4 text-emerald-400" />
                <span>Feedback / Request</span>
              </button>

              <button
                onClick={onOpenUpload}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 shadow-md shadow-emerald-600/30 transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Paper</span>
              </button>
            </>
          ) : !isAdmin ? (
            <Link
              to="/repository"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all"
            >
              Browse Repository
            </Link>
          ) : (
            <Link
              to="/repository"
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Student View</span>
            </Link>
          )}

          {!isAdmin && (
            <Link
              to="/admin/login"
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent hover:border-slate-800 transition-colors"
              title="Admin Portal"
            >
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span>Admin</span>
            </Link>
          )}
        </div>

        {/* Mobile Header Quick Buttons & Menu Toggle */}
        <div className="flex md:hidden items-center space-x-1.5">
          {isRepo && (
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 shadow-sm transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload</span>
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-emerald-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#0d131f] px-4 pt-3 pb-5 space-y-2.5 shadow-2xl animate-fade-in">
          <div className="pb-2 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center space-x-1">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
              <span>UPTTI Kanpur Portal</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
              PYQ Archive
            </span>
          </div>

          <Link
            to="/repository"
            onClick={closeMenu}
            className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              isRepo ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/30' : 'text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Browse Question Papers</span>
          </Link>

          {isRepo && (
            <>
              <button
                onClick={() => {
                  closeMenu();
                  if (onOpenUpload) onOpenUpload();
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white shadow-md transition-colors text-left"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Question Paper (PDF)</span>
              </button>

              <button
                onClick={() => {
                  closeMenu();
                  if (onOpenSuggestion) onOpenSuggestion();
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-900 border border-slate-800/80 transition-colors text-left"
              >
                <MessageSquareQuote className="w-4 h-4 text-teal-400" />
                <span>Request Missing Paper / Feedback</span>
              </button>
            </>
          )}

          <Link
            to={isAdmin ? "/repository" : "/admin/login"}
            onClick={closeMenu}
            className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-900 border border-slate-800/60 transition-colors"
          >
            <Shield className="w-4 h-4 text-amber-400" />
            <span>{isAdmin ? "Switch to Student View" : "Admin Moderation Portal"}</span>
          </Link>
        </div>
      )}
    </header>
  );
}
