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
  Layers,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0e17] text-slate-100 selection:bg-emerald-500 selection:text-white">
      <Navbar />

      <main className="flex-1 flex flex-col justify-center relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] max-w-full h-[320px] bg-emerald-500/15 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[300px] h-[250px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 z-10 w-full">
          {/* UPTTI Kanpur Badge */}
          <div className="flex justify-center mb-5 sm:mb-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#111827] border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-inner">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>UPTTI Kanpur Academic Archive</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-slate-400 font-normal">Est. 1958</span>
            </div>
          </div>

          {/* Hero Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Welcome to <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">PaperVault</span>
            </h1>
            <p className="text-base sm:text-2xl font-medium text-emerald-300/90 tracking-wide">
              "Find. Contribute. Learn."
            </p>
            <p className="text-xs sm:text-sm md:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
              The centralized question paper archive for Uttar Pradesh Textile Technology Institute. 
              Search past semester exams across all branches with instant mobile PDF previews.
            </p>
          </div>

          {/* Two Main Entry Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto mt-8 sm:mt-12">
            {/* Student Portal Card */}
            <Link
              to="/repository"
              className="group relative p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#111827]/90 to-[#0d131f]/60 border border-slate-800 hover:border-emerald-500/60 shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white mt-4 sm:mt-5 flex items-center justify-between">
                  <span>Continue as Student</span>
                  <ArrowRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1.5 transition-transform" />
                </h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Search & download verified exam papers across CSE, Textile Technology, Chemistry, MMFT, and TE.
                  Upload papers directly from your phone.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">
                <span>Enter Question Repository</span>
              </div>
            </Link>

            {/* Admin CMS Card */}
            <Link
              to="/admin/login"
              className="group relative p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#111827]/90 to-[#0d131f]/60 border border-slate-800 hover:border-teal-500/60 shadow-xl hover:shadow-teal-500/10 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center border border-teal-500/30 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white mt-4 sm:mt-5 flex items-center justify-between">
                  <span>Continue as Admin</span>
                  <ArrowRight className="w-5 h-5 text-teal-400 group-hover:translate-x-1.5 transition-transform" />
                </h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Access the administrative moderation portal. Review student upload requests, correct typos,
                  approve or reject submissions, and manage feedback.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center text-xs font-semibold text-teal-400 group-hover:text-teal-300">
                <span>Admin CMS Login</span>
              </div>
            </Link>
          </div>

          {/* Highlights Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-slate-800/60 text-center">
            <div className="p-3.5 sm:p-4 rounded-xl bg-[#0d131f]/70 border border-slate-800/60">
              <Search className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
              <div className="text-xs sm:text-sm font-bold text-white">Live Search</div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">By Subject Name or Code</div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-[#0d131f]/70 border border-slate-800/60">
              <FileCheck2 className="w-5 h-5 text-teal-400 mx-auto mb-1.5" />
              <div className="text-xs sm:text-sm font-bold text-white">Verified Papers</div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Moderator approved</div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-[#0d131f]/70 border border-slate-800/60">
              <UploadCloud className="w-5 h-5 text-cyan-400 mx-auto mb-1.5" />
              <div className="text-xs sm:text-sm font-bold text-white">Direct Uploads</div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Up to 15MB PDFs</div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-[#0d131f]/70 border border-slate-800/60">
              <Layers className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
              <div className="text-xs sm:text-sm font-bold text-white">5 Branches</div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">CSE, TT, TC, MMFT, TE</div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
