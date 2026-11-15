import React, { useEffect } from 'react';
import { X, ExternalLink, Download, FileText } from 'lucide-react';

export default function PdfModal({ paper, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!paper) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-5xl h-[92dvh] bg-[#0d131f] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-3 sm:px-5 py-3 border-b border-slate-800 bg-[#0a0e17]">
          <div className="flex items-center space-x-2.5 truncate pr-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 flex-shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center space-x-2 truncate">
                <span className="font-bold text-white text-xs sm:text-sm truncate">
                  {paper.subject_name}
                </span>
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-md bg-slate-900 text-emerald-300 font-mono border border-slate-800 flex-shrink-0">
                  {paper.subject_code}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                {paper.branch_code || paper.branch_name} • Sem {paper.semester_number || paper.semester_id} • {paper.academic_year} ({paper.exam_type})
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-1.5 flex-shrink-0">
            <a
              href={paper.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Open full PDF in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href={paper.file_url}
              download={`${paper.subject_code}_${paper.academic_year}_${paper.exam_type}.pdf`}
              className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
              title="Download PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PDF Viewer with Mobile Fallback Banner */}
        <div className="flex-1 bg-slate-950 relative flex flex-col">
          <div className="sm:hidden px-3 py-1.5 bg-slate-900/90 border-b border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Viewing PDF preview</span>
            <a
              href={paper.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 underline font-medium"
            >
              Tap here if blank
            </a>
          </div>
          <iframe
            src={`${paper.file_url}#toolbar=1`}
            title={`Preview of ${paper.subject_name}`}
            className="w-full flex-1 border-0"
          />
        </div>
      </div>
    </div>
  );
}
