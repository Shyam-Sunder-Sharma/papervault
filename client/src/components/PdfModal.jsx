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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-5xl h-[88vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3 truncate">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-white text-sm sm:text-base truncate">
                  {paper.subject_name}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono border border-slate-700">
                  {paper.subject_code}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {paper.branch_name || paper.branch_code} • Semester {paper.semester_number || paper.semester_id} • {paper.academic_year} ({paper.exam_type})
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <a
              href={paper.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Open in new window"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href={paper.file_url}
              download={`${paper.subject_code}_${paper.academic_year}_${paper.exam_type}.pdf`}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow transition-colors"
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Iframe Viewer */}
        <div className="flex-1 bg-slate-950 relative">
          <iframe
            src={`${paper.file_url}#toolbar=1`}
            title={`Preview of ${paper.subject_name}`}
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
}
