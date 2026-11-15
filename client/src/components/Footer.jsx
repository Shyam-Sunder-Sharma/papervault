import React from 'react';
import { Heart, BookOpen, GraduationCap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-[#070b12] mt-auto py-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        {/* Brand */}
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-200">PaperVault</span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-400">Previous Year Exam Repository</span>
        </div>

        {/* Institution Info */}
        <div className="flex items-center justify-center space-x-1.5 text-slate-400 text-[11px] sm:text-xs">
          <GraduationCap className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span>UPTTI Kanpur (Uttar Pradesh Textile Technology Institute)</span>
        </div>

        {/* Community tag */}
        <div className="flex items-center justify-center space-x-1 text-[11px]">
          <span>Student Community Initiative</span>
          <span className="text-slate-600">•</span>
          <Heart className="w-3 h-3 text-emerald-400 fill-emerald-400 inline" />
        </div>
      </div>
    </footer>
  );
}
