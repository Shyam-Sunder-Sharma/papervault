import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Clock,
  CheckCircle,
  FileSpreadsheet,
  MessageSquare,
  LogOut,
  Eye,
  Check,
  X,
  Trash2,
  Edit,
  ExternalLink,
  Loader2,
  AlertCircle,
  Search,
  BookOpen,
} from 'lucide-react';
import {
  getAdminMe,
  getAdminStats,
  getAdminPapers,
  updateAdminPaper,
  deleteAdminPaper,
  getAdminSuggestions,
  updateAdminSuggestion,
  deleteAdminSuggestion,
  adminLogout,
  fetchMeta,
} from '../api';
import PdfModal from '../components/PdfModal';

export default function AdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | requests | manage | suggestions
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Stats
  const [stats, setStats] = useState(null);

  // Meta
  const [meta, setMeta] = useState({ branches: [], semesters: [] });

  // Papers
  const [papers, setPapers] = useState([]);
  const [paperFilter, setPaperFilter] = useState('all');
  const [paperSearch, setPaperSearch] = useState('');

  // Suggestions (active suggestions only - resolved auto-disappear)
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionFilter, setSuggestionFilter] = useState('all');

  // Preview & Edit states
  const [previewPaper, setPreviewPaper] = useState(null);
  const [editingPaper, setEditingPaper] = useState(null);

  const navigate = useNavigate();

  // Check Auth & load initial data
  useEffect(() => {
    getAdminMe()
      .then((res) => {
        setAdmin(res.admin);
        fetchMeta().then((m) => setMeta(m)).catch(console.error);
        loadStats();
      })
      .catch(() => {
        navigate('/admin/login');
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const loadStats = async () => {
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (err) {
      console.error('Stats error:', err);
    }
  };

  const loadPapers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (paperFilter !== 'all') params.status = paperFilter;
      if (paperSearch.trim()) params.search = paperSearch.trim();
      const data = await getAdminPapers(params);
      setPapers(data);
    } catch (err) {
      console.error('Papers error:', err);
      setError('Failed to load papers');
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (suggestionFilter !== 'all') params.status = suggestionFilter;
      const data = await getAdminSuggestions(params);
      setSuggestions(data);
    } catch (err) {
      console.error('Suggestions error:', err);
      setError('Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadStats();
    } else if (activeTab === 'requests') {
      setPaperFilter('pending');
      loadPapersWithStatus('pending');
    } else if (activeTab === 'manage') {
      loadPapers();
    } else if (activeTab === 'suggestions') {
      loadSuggestions();
    }
  }, [activeTab]);

  const loadPapersWithStatus = async (status) => {
    try {
      setLoading(true);
      const data = await getAdminPapers({ status });
      setPapers(data);
    } catch (err) {
      console.error('Papers error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await adminLogout();
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/admin/login');
    }
  };

  const handleUpdatePaperStatus = async (paperId, newStatus) => {
    try {
      setActionSuccess('');
      setError('');
      await updateAdminPaper(paperId, { status: newStatus });
      setActionSuccess(`Paper marked as ${newStatus}`);
      if (activeTab === 'requests') {
        loadPapersWithStatus('pending');
      } else {
        loadPapers();
      }
      loadStats();
    } catch (err) {
      console.error('Status update error:', err);
      setError('Failed to update paper status');
    }
  };

  const handleDeletePaper = async (paperId) => {
    if (!window.confirm('Are you sure you want to permanently delete this paper and its PDF file?')) {
      return;
    }
    try {
      setActionSuccess('');
      setError('');
      await deleteAdminPaper(paperId);
      setActionSuccess('Paper and PDF file deleted successfully');
      loadPapers();
      loadStats();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete paper');
    }
  };

  const handleSaveEditPaper = async (e) => {
    e.preventDefault();
    if (!editingPaper) return;
    try {
      await updateAdminPaper(editingPaper.id, {
        subject_name: editingPaper.subject_name,
        subject_code: editingPaper.subject_code,
        academic_year: editingPaper.academic_year,
        exam_type: editingPaper.exam_type,
        branch_id: parseInt(editingPaper.branch_id),
        semester_id: parseInt(editingPaper.semester_id),
        status: editingPaper.status,
      });
      setEditingPaper(null);
      setActionSuccess('Paper metadata updated successfully');
      if (activeTab === 'requests') {
        loadPapersWithStatus('pending');
      } else {
        loadPapers();
      }
    } catch (err) {
      console.error('Save edit error:', err);
      setError('Failed to save paper changes');
    }
  };

  // Suggestion Status Update: When marked as "resolved", it automatically disappears/deletes
  const handleUpdateSuggestion = async (id, newStatus) => {
    try {
      setActionSuccess('');
      setError('');
      if (newStatus === 'resolved') {
        // Automatically disappears / deleted from dashboard
        await updateAdminSuggestion(id, { status: 'resolved' });
        setSuggestions((prev) => prev.filter((s) => s.id !== id));
        setActionSuccess('Suggestion marked as resolved and automatically cleared from the dashboard.');
      } else {
        await updateAdminSuggestion(id, { status: newStatus });
        setActionSuccess(`Suggestion status updated to ${newStatus}`);
        loadSuggestions();
      }
      loadStats();
    } catch (err) {
      console.error('Update suggestion error:', err);
      setError('Failed to update suggestion status');
    }
  };

  const handleDeleteSuggestion = async (id) => {
    if (!window.confirm('Delete this suggestion entry permanently?')) return;
    try {
      await deleteAdminSuggestion(id);
      setSuggestions((prev) => prev.filter((s) => s.id !== id));
      setActionSuccess('Suggestion deleted successfully');
      loadStats();
    } catch (err) {
      console.error('Delete suggestion error:', err);
      setError('Failed to delete suggestion');
    }
  };

  if (loading && !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e17] text-slate-100">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0e17] text-slate-100">
      {/* Admin Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#0a0e17]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm sm:text-base text-white">PaperVault CMS</span>
                <span className="ml-1.5 text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold uppercase">
                  Admin
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 text-xs">
            <Link
              to="/repository"
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Student View</span>
            </Link>

            <span className="hidden md:inline text-slate-400">
              Admin: <strong className="text-white">{admin?.username}</strong>
            </span>

            <button
              onClick={handleLogout}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation with smooth mobile touch-scrolling */}
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 flex space-x-1 overflow-x-auto border-t border-slate-900 text-xs scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-3 px-3.5 font-semibold flex items-center space-x-1.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`py-3 px-3.5 font-semibold flex items-center space-x-1.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'requests'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Upload Requests</span>
            {stats?.papers?.pending_count > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] border border-amber-500/30">
                {stats.papers.pending_count}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('manage')}
            className={`py-3 px-3.5 font-semibold flex items-center space-x-1.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'manage'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Manage Papers</span>
          </button>

          <button
            onClick={() => setActiveTab('suggestions')}
            className={`py-3 px-3.5 font-semibold flex items-center space-x-1.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'suggestions'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Feedback & Requests</span>
            {stats?.suggestions?.new_count > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] border border-emerald-500/30">
                {stats.suggestions.new_count}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8">
        {/* Alerts */}
        {actionSuccess && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
            <span>{actionSuccess}</span>
            <button onClick={() => setActionSuccess('')} className="text-emerald-400 hover:text-emerald-200 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-rose-400 hover:text-rose-200 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TAB 1: OVERVIEW / DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Stat Cards in 2x2 grid on mobile */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-[#0d131f] border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Approved</span>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="mt-2 text-2xl font-black text-white">
                  {stats?.papers?.approved_count || 0}
                </div>
                <div className="mt-0.5 text-[10px] sm:text-[11px] text-slate-500">Live in repository</div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-[#0d131f] border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Pending</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="mt-2 text-2xl font-black text-white">
                  {stats?.papers?.pending_count || 0}
                </div>
                <div className="mt-0.5 text-[10px] sm:text-[11px] text-slate-500">Awaiting review</div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-[#0d131f] border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Active Requests</span>
                  <MessageSquare className="w-4 h-4 text-teal-400" />
                </div>
                <div className="mt-2 text-2xl font-black text-white">
                  {stats?.suggestions?.total_count || 0}
                </div>
                <div className="mt-0.5 text-[10px] sm:text-[11px] text-slate-500">Pending feedback</div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-[#0d131f] border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Unpublished/Reject</span>
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                </div>
                <div className="mt-2 text-2xl font-black text-white">
                  {(parseInt(stats?.papers?.rejected_count || 0) + parseInt(stats?.papers?.unpublished_count || 0))}
                </div>
                <div className="mt-0.5 text-[10px] sm:text-[11px] text-slate-500">Hidden from students</div>
              </div>
            </div>

            {/* Quick Action Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
              {/* Recent Pending Uploads */}
              <div className="p-4 sm:p-6 rounded-2xl bg-[#0d131f] border border-slate-800">
                <div className="flex items-center justify-between mb-3.5">
                  <h3 className="text-xs sm:text-sm font-bold text-white flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Recent Paper Submissions</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('requests')}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    View Queue
                  </button>
                </div>

                {stats?.recentPapers?.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4">No recent upload activity.</p>
                ) : (
                  <div className="space-y-2.5">
                    {stats?.recentPapers?.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="truncate pr-2">
                          <p className="font-semibold text-white truncate">{p.subject_name}</p>
                          <p className="text-[11px] text-slate-400">
                            {p.subject_code} • {p.branch_code} Sem {p.semester_number} ({p.academic_year})
                          </p>
                        </div>
                        <div className="flex items-center space-x-1.5 flex-shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              p.status === 'approved'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : p.status === 'pending'
                                ? 'bg-amber-500/15 text-amber-400'
                                : 'bg-rose-500/15 text-rose-400'
                            }`}
                          >
                            {p.status}
                          </span>
                          <button
                            onClick={() => setPreviewPaper(p)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300"
                            title="Preview PDF"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Active Feedback */}
              <div className="p-4 sm:p-6 rounded-2xl bg-[#0d131f] border border-slate-800">
                <div className="flex items-center justify-between mb-3.5">
                  <h3 className="text-xs sm:text-sm font-bold text-white flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>Active Student Requests</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('suggestions')}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    View All
                  </button>
                </div>

                {stats?.recentSuggestions?.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4">No active suggestions or feedback.</p>
                ) : (
                  <div className="space-y-2.5">
                    {stats?.recentSuggestions?.map((s) => (
                      <div
                        key={s.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-emerald-300 text-[11px]">{s.category}</span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(s.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-300 line-clamp-2 text-[11px]">{s.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: UPLOAD REQUESTS (PENDING QUEUE) */}
        {activeTab === 'requests' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">Pending Upload Queue</h2>
                <p className="text-xs text-slate-400">
                  Review student uploads, correct typos, verify PDF scans, and approve or reject.
                </p>
              </div>
              <button
                onClick={() => loadPapersWithStatus('pending')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 transition-colors"
              >
                Refresh
              </button>
            </div>

            {papers.length === 0 ? (
              <div className="py-14 sm:py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-[#0d131f]/40 p-6">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-white">Queue is Clear!</h3>
                <p className="text-xs text-slate-400 mt-1">There are no pending papers awaiting moderation.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {papers.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 sm:p-5 rounded-2xl bg-[#0d131f] border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3.5"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          {p.subject_code}
                        </span>
                        <span className="text-sm font-bold text-white">{p.subject_name}</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {p.branch_name || p.branch_code} • Semester {p.semester_number || p.semester_id} • Year {p.academic_year} • {p.exam_type}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Submitted: {new Date(p.submitted_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="w-full lg:w-auto flex items-center justify-end space-x-2 flex-wrap gap-y-2">
                      <button
                        onClick={() => setPreviewPaper(p)}
                        className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Preview</span>
                      </button>

                      <button
                        onClick={() => setEditingPaper(p)}
                        className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5 text-slate-400" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleUpdatePaperStatus(p.id, 'rejected')}
                        className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-600/15 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => handleUpdatePaperStatus(p.id, 'approved')}
                        className="inline-flex items-center space-x-1 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MANAGE PUBLISHED PAPERS */}
        {activeTab === 'manage' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">Repository Management</h2>
                <p className="text-xs text-slate-400">Search, edit metadata, unpublish, or delete papers.</p>
              </div>

              {/* Status and Search filter */}
              <div className="flex items-center space-x-2 text-xs flex-wrap gap-y-2">
                <select
                  value={paperFilter}
                  onChange={(e) => setPaperFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="approved">Approved</option>
                  <option value="unpublished">Unpublished</option>
                  <option value="rejected">Rejected</option>
                  <option value="pending">Pending</option>
                </select>

                <div className="relative flex-1 sm:flex-none">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search code / subject..."
                    value={paperSearch}
                    onChange={(e) => setPaperSearch(e.target.value)}
                    className="pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 w-full sm:w-44"
                  />
                </div>

                <button
                  onClick={loadPapers}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                >
                  Search
                </button>
              </div>
            </div>

            {papers.length === 0 ? (
              <div className="py-14 text-center border border-dashed border-slate-800 rounded-2xl bg-[#0d131f]/40 text-xs text-slate-400">
                No papers found matching the filter.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#0d131f]">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#0a0e17] text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Code</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Branch & Sem</th>
                      <th className="px-4 py-3">Year / Type</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {papers.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-emerald-400">{p.subject_code}</td>
                        <td className="px-4 py-3 font-semibold text-white max-w-xs truncate">{p.subject_name}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {p.branch_code} • Sem {p.semester_number || p.semester_id}
                        </td>
                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                          {p.academic_year} ({p.exam_type})
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                              p.status === 'approved'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : p.status === 'unpublished'
                                ? 'bg-slate-800 text-slate-400'
                                : p.status === 'pending'
                                ? 'bg-amber-500/15 text-amber-400'
                                : 'bg-rose-500/15 text-rose-400'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => setPreviewPaper(p)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300"
                            title="Preview PDF"
                          >
                            <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          </button>

                          <button
                            onClick={() => setEditingPaper(p)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300"
                            title="Edit metadata"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {p.status === 'approved' ? (
                            <button
                              onClick={() => handleUpdatePaperStatus(p.id, 'unpublished')}
                              className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[10px] font-medium"
                            >
                              Unpublish
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdatePaperStatus(p.id, 'approved')}
                              className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[10px] font-medium"
                            >
                              Publish
                            </button>
                          )}

                          <button
                            onClick={() => handleDeletePaper(p.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                            title="Delete paper"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SUGGESTIONS & FEEDBACK (RESOLVED DISAPPEARS, NO ARCHIVED) */}
        {activeTab === 'suggestions' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">Student Feedback & Requests</h2>
                <p className="text-xs text-slate-400">
                  Review student requests. Marking as <strong className="text-emerald-400">Resolved</strong> automatically clears the item.
                </p>
              </div>

              {/* Status filter (No Archive Option) */}
              <select
                value={suggestionFilter}
                onChange={(e) => {
                  setSuggestionFilter(e.target.value);
                  getAdminSuggestions(e.target.value === 'all' ? {} : { status: e.target.value }).then(setSuggestions);
                }}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
              >
                <option value="all">All Active Feedback</option>
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
              </select>
            </div>

            {suggestions.length === 0 ? (
              <div className="py-14 text-center border border-dashed border-slate-800 rounded-2xl bg-[#0d131f]/40 text-xs text-slate-400">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="font-semibold text-white">No active feedback or requests!</p>
                <p className="mt-1">All student suggestions are clear.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                {suggestions.map((s) => (
                  <div key={s.id} className="p-4 sm:p-5 rounded-2xl bg-[#0d131f] border border-slate-800 text-xs space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-emerald-300 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px]">
                        {s.category}
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] text-slate-500">
                          {new Date(s.created_at).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => handleDeleteSuggestion(s.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete suggestion"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{s.message}</p>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400 font-medium">Update Status:</span>
                      {/* Status Selector strictly New, In Progress, Resolved (No Archive) */}
                      <div className="flex items-center space-x-1.5">
                        <select
                          value={s.status}
                          onChange={(e) => handleUpdateSuggestion(s.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            s.status === 'new'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                          } border bg-slate-950`}
                        >
                          <option value="new">New</option>
                          <option value="in_progress">In Progress</option>
                        </select>

                        <button
                          onClick={() => handleUpdateSuggestion(s.id, 'resolved')}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
                          title="Mark resolved and remove from dashboard"
                        >
                          Mark Resolved
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Edit Paper Modal (Exam Type strictly End Sem & Mid Sem) */}
      {editingPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[#0d131f] border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 text-xs max-h-[92dvh] overflow-y-auto">
            <h3 className="text-base font-bold text-white mb-3.5">Edit Paper Metadata</h3>
            <form onSubmit={handleSaveEditPaper} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Subject Name</label>
                <input
                  type="text"
                  value={editingPaper.subject_name}
                  onChange={(e) => setEditingPaper({ ...editingPaper, subject_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Subject Code</label>
                  <input
                    type="text"
                    value={editingPaper.subject_code}
                    onChange={(e) => setEditingPaper({ ...editingPaper, subject_code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={editingPaper.academic_year}
                    onChange={(e) => setEditingPaper({ ...editingPaper, academic_year: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    required
                  />
                </div>
              </div>

              {/* Exam Type: strictly End Semester & Mid Semester (Back paper removed) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Exam Type</label>
                  <select
                    value={editingPaper.exam_type}
                    onChange={(e) => setEditingPaper({ ...editingPaper, exam_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="End Semester">End Semester</option>
                    <option value="Mid Semester">Mid Semester</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Status</label>
                  <select
                    value={editingPaper.status}
                    onChange={(e) => setEditingPaper({ ...editingPaper, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="unpublished">Unpublished</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="pt-3.5 flex items-center justify-end space-x-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPaper(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-600/25"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {previewPaper && (
        <PdfModal paper={previewPaper} onClose={() => setPreviewPaper(null)} />
      )}
    </div>
  );
}
