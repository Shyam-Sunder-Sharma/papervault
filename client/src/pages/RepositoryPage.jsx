import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  RotateCcw,
  FileText,
  Eye,
  Download,
  Upload,
  MessageSquareQuote,
  Loader2,
  AlertCircle,
  GraduationCap,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PdfModal from '../components/PdfModal';
import UploadModal from '../components/UploadModal';
import SuggestionModal from '../components/SuggestionModal';
import { fetchMeta, fetchPapers } from '../api';

const ACADEMIC_YEARS = ['2024-25', '2023-24', '2022-23', '2021-22', '2020-21', '2019-20'];

export default function RepositoryPage() {
  const [meta, setMeta] = useState({ branches: [], semesters: [], subjects: [] });
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [branchId, setBranchId] = useState('');
  const [semesterId, setSemesterId] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [mobileFiltersExpanded, setMobileFiltersExpanded] = useState(false);

  // Modals
  const [previewPaper, setPreviewPaper] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);

  // Count active filters
  const activeFilterCount = [branchId, semesterId, academicYear].filter(Boolean).length;

  // Load Metadata
  useEffect(() => {
    fetchMeta()
      .then((data) => setMeta(data))
      .catch((err) => {
        console.error('Meta load error:', err);
        setError('Failed to load branches and semesters metadata.');
      });
  }, []);

  // Load Papers when filters change
  const loadPapers = () => {
    setLoading(true);
    setError('');

    const params = {};
    if (search.trim()) params.search = search.trim();
    if (branchId) params.branch_id = branchId;
    if (semesterId) params.semester_id = semesterId;
    if (academicYear) params.academic_year = academicYear;

    fetchPapers(params)
      .then((data) => setPapers(data))
      .catch((err) => {
        console.error('Papers load error:', err);
        setError('Could not retrieve question papers. Please check your connection.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadPapers();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [search, branchId, semesterId, academicYear]);

  const handleResetFilters = () => {
    setSearch('');
    setBranchId('');
    setSemesterId('');
    setAcademicYear('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0e17] text-slate-100">
      <Navbar
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenSuggestion={() => setIsSuggestionOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8">
        {/* Banner */}
        <div className="mb-6 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-[#0d131f] to-[#0d131f] border border-emerald-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-1.5 text-emerald-400 text-[11px] font-semibold uppercase tracking-wider mb-1">
              <GraduationCap className="w-4 h-4" />
              <span>UPTTI Kanpur Repository</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Previous Year Question Papers
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
              Find and download authentic past semester question papers across all engineering departments.
            </p>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={() => setIsSuggestionOpen(true)}
              className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors flex items-center justify-center space-x-1.5"
            >
              <MessageSquareQuote className="w-4 h-4 text-emerald-400" />
              <span>Request Paper</span>
            </button>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/25 active:scale-95 transition-all flex items-center justify-center space-x-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Paper</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[#0d131f] border border-slate-800/80 p-3.5 sm:p-4 rounded-2xl shadow-lg mb-6 space-y-3">
          {/* Search bar + Mobile filter toggle */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search subject or code (e.g. Data Structures, BCS-301)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs px-1"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setMobileFiltersExpanded(!mobileFiltersExpanded)}
              className="lg:hidden inline-flex items-center space-x-1.5 px-3 py-2.5 rounded-xl text-xs font-medium bg-slate-900 border border-slate-800 text-slate-200"
              aria-label="Toggle filter options"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xs:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              {mobileFiltersExpanded ? <ChevronUp className="w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
            </button>
          </div>

          {/* Filter Dropdowns (Desktop visible, mobile collapsible) */}
          <div className={`${mobileFiltersExpanded ? 'block' : 'hidden'} lg:block pt-1 lg:pt-0`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
              {/* Branch */}
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="">All Branches (CSE, TT, TC...)</option>
                {meta?.branches?.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code} - {b.name}
                  </option>
                ))}
              </select>

              {/* Semester */}
              <select
                value={semesterId}
                onChange={(e) => setSemesterId(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="">All Semesters (1 - 8)</option>
                {meta?.semesters?.map((s) => (
                  <option key={s.id} value={s.id}>
                    Semester {s.number}
                  </option>
                ))}
              </select>

              {/* Academic Year */}
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="">All Academic Years</option>
                {ACADEMIC_YEARS.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>

              {/* Reset Filters */}
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 bg-slate-950 hover:bg-slate-900 border border-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Reset Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Papers Grid */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            <p className="text-xs text-slate-400">Loading verified question papers...</p>
          </div>
        ) : papers.length === 0 ? (
          <div className="py-14 sm:py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-[#0d131f]/50 p-6 sm:p-8 max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-900 text-slate-400 flex items-center justify-center border border-slate-800">
              <FileText className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No Question Papers Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                No approved question papers match your filters. If you have this paper, please upload it to help your peers!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
              <button
                onClick={handleResetFilters}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 transition-colors"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/25"
              >
                Upload This Paper
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4 text-xs text-slate-400 px-1">
              <span>
                Showing <strong className="text-white">{papers.length}</strong> verified paper{papers.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {papers.map((p) => (
                <div
                  key={p.id}
                  className="group relative p-4 sm:p-5 rounded-2xl bg-[#0d131f] border border-slate-800 hover:border-emerald-500/50 shadow-md hover:shadow-emerald-500/10 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {p.subject_code}
                      </span>
                      <div className="flex items-center space-x-1.5 flex-wrap justify-end">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
                          {p.branch_code || 'Branch'}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
                          Sem {p.semester_number || p.semester_id}
                        </span>
                      </div>
                    </div>

                    {/* Subject Name */}
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-200 transition-colors line-clamp-2">
                      {p.subject_name}
                    </h3>

                    {/* Meta info */}
                    <div className="mt-3 text-xs text-slate-400 space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Academic Year:</span>
                        <span className="text-slate-200 font-medium">{p.academic_year}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Exam Type:</span>
                        <span className="px-2 py-0.5 rounded text-[11px] bg-slate-900 text-teal-300 font-medium border border-slate-800/80">
                          {p.exam_type}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3.5 border-t border-slate-800/80 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPreviewPaper(p)}
                      className="inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Preview</span>
                    </button>
                    <a
                      href={p.file_url}
                      download={`${p.subject_code}_${p.academic_year}_${p.exam_type}.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* PDF Modal */}
      {previewPaper && (
        <PdfModal paper={previewPaper} onClose={() => setPreviewPaper(null)} />
      )}

      {/* Upload Paper Modal */}
      <UploadModal
        meta={meta}
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          loadPapers();
        }}
      />

      {/* Suggestion Modal */}
      <SuggestionModal
        isOpen={isSuggestionOpen}
        onClose={() => setIsSuggestionOpen(false)}
      />

      <Footer />
    </div>
  );
}
