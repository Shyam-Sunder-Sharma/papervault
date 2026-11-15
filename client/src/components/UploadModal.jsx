import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { getUploadUrl, uploadPdfToSignedUrl, submitPaper } from '../api';

const ACADEMIC_YEARS = [
  '2024-25',
  '2023-24',
  '2022-23',
  '2021-22',
  '2020-21',
  '2019-20',
  '2018-19',
];

const EXAM_TYPES = ['End Semester', 'Mid Semester', 'Carry Over / Back Paper'];

export default function UploadModal({ meta, isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    branch_id: '',
    semester_id: '',
    subject_name: '',
    subject_code: '',
    academic_year: '2023-24',
    exam_type: 'End Semester',
  });

  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Filter subjects based on branch & semester
  const filteredSubjects = meta?.subjects?.filter((s) => {
    const matchBranch = formData.branch_id ? s.branch_id === parseInt(formData.branch_id) : true;
    const matchSem = formData.semester_id ? s.semester_id === parseInt(formData.semester_id) : true;
    return matchBranch && matchSem;
  }) || [];

  const handleSubjectSelect = (e) => {
    const selectedSubName = e.target.value;
    const found = filteredSubjects.find((s) => s.name === selectedSubName);
    setFormData((prev) => ({
      ...prev,
      subject_name: selectedSubName,
      subject_code: found ? found.code : prev.subject_code,
    }));
  };

  const handleFileChange = (selectedFile) => {
    setError('');
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a valid PDF file (.pdf)');
      return;
    }

    if (selectedFile.size > 15 * 1024 * 1024) {
      setError('File size exceeds the 15MB limit. Please compress the PDF before uploading.');
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.branch_id || !formData.semester_id) {
      setError('Please select both Branch and Semester.');
      return;
    }

    if (!formData.subject_name.trim() || !formData.subject_code.trim()) {
      setError('Please provide Subject Name and Subject Code.');
      return;
    }

    if (!file) {
      setError('Please upload a PDF question paper.');
      return;
    }

    try {
      setLoading(true);
      setProgressMsg('Requesting secure direct upload authorization...');

      // 1. Get signed upload URL
      const { signedUrl, filePath, fileUrl } = await getUploadUrl(file.name, file.type || 'application/pdf');

      // 2. Upload file directly to Supabase Storage bucket
      setProgressMsg('Uploading PDF directly to secure Supabase storage...');
      await uploadPdfToSignedUrl(signedUrl, file);

      // 3. Register paper in database
      setProgressMsg('Submitting question paper for admin verification...');
      await submitPaper({
        branch_id: parseInt(formData.branch_id),
        semester_id: parseInt(formData.semester_id),
        subject_name: formData.subject_name.trim(),
        subject_code: formData.subject_code.trim().toUpperCase(),
        academic_year: formData.academic_year,
        exam_type: formData.exam_type,
        file_url: fileUrl,
        file_path: filePath,
      });

      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to complete paper upload');
    } finally {
      setLoading(false);
      setProgressMsg('');
    }
  };

  const resetAndClose = () => {
    setFormData({
      branch_id: '',
      semester_id: '',
      subject_name: '',
      subject_code: '',
      academic_year: '2023-24',
      exam_type: 'End Semester',
    });
    setFile(null);
    setError('');
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <UploadCloud className="w-5 h-5 text-indigo-400" />
              <span>Contribute Question Paper</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Help your fellow UPTTI Kanpur students by uploading previous year papers.
            </p>
          </div>
          <button
            onClick={resetAndClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Paper Submitted Successfully!</h3>
              <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">
                Thank you for contributing! Your upload has been queued for admin verification and will be published once approved.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={resetAndClose}
                className="px-6 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
              >
                Close & Return to Repository
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Branch and Semester */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Branch *</label>
                <select
                  value={formData.branch_id}
                  onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                >
                  <option value="">Select Branch</option>
                  {meta?.branches?.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Semester *</label>
                <select
                  value={formData.semester_id}
                  onChange={(e) => setFormData({ ...formData, semester_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                >
                  <option value="">Select Semester</option>
                  {meta?.semesters?.map((s) => (
                    <option key={s.id} value={s.id}>
                      Semester {s.number}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subject Selection / Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-medium text-slate-300">Subject Name *</label>
                {filteredSubjects.length > 0 && (
                  <span className="text-[10px] text-indigo-400">Auto-suggest available</span>
                )}
              </div>
              <input
                type="text"
                list="subjects-datalist"
                placeholder="e.g. Data Structures or Yarn Manufacture-I"
                value={formData.subject_name}
                onChange={handleSubjectSelect}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
              <datalist id="subjects-datalist">
                {filteredSubjects.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.code}
                  </option>
                ))}
              </datalist>
            </div>

            {/* Subject Code, Year, Exam Type */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Subject Code *</label>
                <input
                  type="text"
                  placeholder="e.g. BCS-301"
                  value={formData.subject_code}
                  onChange={(e) => setFormData({ ...formData, subject_code: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 uppercase font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Academic Year *</label>
                <select
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                >
                  {ACADEMIC_YEARS.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Exam Type *</label>
                <select
                  value={formData.exam_type}
                  onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                >
                  {EXAM_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* PDF File Dropzone */}
            <div>
              <label className="block font-medium text-slate-300 mb-1">Question Paper PDF (Max 15MB) *</label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : file
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleFileChange(e.target.files[0])}
                  className="hidden"
                />

                {file ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white text-xs truncate max-w-xs">{file.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • Click or drag to replace
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-10 h-10 mx-auto rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-200">
                      Click to browse or drag and drop your PDF here
                    </p>
                    <p className="text-[10px] text-slate-500">Only .pdf documents up to 15MB are supported</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-800">
              <button
                type="button"
                onClick={resetAndClose}
                disabled={loading}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center space-x-2 px-6 py-2 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 disabled:opacity-60 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{progressMsg || 'Processing...'}</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Submit for Approval</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
