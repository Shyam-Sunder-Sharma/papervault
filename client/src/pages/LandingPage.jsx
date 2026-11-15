import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Search,
  UploadCloud,
  FileCheck2,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 flex flex-col justify-center relative overflow-hidden">
        {/* Glow ambient backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[300px] h-[250px] bg-violet-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 z-10">
          {/* UPTTI Kanpur Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-inner">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>UPTTI Kanpur Academic Repository</span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
              <span className="text-slate-400 font-normal">Est. 1958</span>
            </div>
          </div>

          {/* Hero Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
              Welcome to <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200 bg-clip-text text-transparent">PaperVault</span>
            </h1>
            <p className="text-lg sm:text-2xl font-medium text-indigo-200 tracking-wide">
              "Find. Contribute. Learn."
            </p>
            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
              The centralized question paper archive for Uttar Pradesh Textile Technology Institute. 
              Search previous year end-sem, mid-sem, and carry-over papers with instant PDF previews.
            </p>
          </div>

          {/* Two Main Entry Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mt-12">
            {/* Student Card */}
            <Link
              to="/repository"
              className="group relative p-8 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 hover:border-indigo-500/60 shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-white mt-5 flex items-center justify-between">
                  <span>Continue as Student</span>
                  <ArrowRight className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                </h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Search & download verified exam papers across CSE, Textile Technology, Chemistry, MMFT, and TE.
                  Contribute your own papers to the student community.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                <span>Enter Question Repository</span>
              </div>
            </Link>

            {/* Admin Card */}
            <Link
              to="/admin/login"
              className="group relative p-8 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 hover:border-indigo-500/60 shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-violet-600/10 text-violet-400 flex items-center justify-center border border-violet-500/20 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-white mt-5 flex items-center justify-between">
                  <span>Continue as Admin</span>
                  <ArrowRight className="w-5 h-5 text-violet-400 group-hover:translate-x-1 transition-transform" />
                </h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Access the administrative moderation portal. Review student upload requests, correct metadata,
                  approve or reject submissions, and manage feedback.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center text-xs font-semibold text-violet-400 group-hover:text-violet-300">
                <span>Admin CMS Login</span>
              </div>
            </Link>
          </div>

          {/* Highlights Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-16 pt-12 border-t border-slate-800/60 text-center">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/50">
              <Search className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
              <div className="text-sm font-bold text-white">Live Search</div>
              <div className="text-[11px] text-slate-400 mt-0.5">By Subject Name or AKTU Code</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/50">
              <FileCheck2 className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <div className="text-sm font-bold text-white">Verified Papers</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Reviewed by admin moderators</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/50">
              <UploadCloud className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
              <div className="text-sm font-bold text-white">Direct PDF Upload</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Up to 15MB with instant signed URL</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/50">
              <Sparkles className="w-5 h-5 text-amber-400 mx-auto mb-2" />
              <div className="text-sm font-bold text-white">5 Engineering Branches</div>
              <div className="text-[11px] text-slate-400 mt-0.5">CSE, TT, TC, MMFT & TE</div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
