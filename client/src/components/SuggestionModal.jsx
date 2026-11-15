import React, { useState } from 'react';
import { X, MessageSquareQuote, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { submitSuggestion } from '../api';

const CATEGORIES = [
  'Missing Paper Request',
  'General Feedback',
  'Bug Report',
  'Content Correction',
  'Other',
];

export default function SuggestionModal({ isOpen, onClose }) {
  const [category, setCategory] = useState('Missing Paper Request');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please write your request or message before submitting.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await submitSuggestion({ category, message: message.trim() });
      setSuccess(true);
    } catch (err) {
      console.error('Suggestion submit error:', err);
      setError(err.response?.data?.error || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    setError('');
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <MessageSquareQuote className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Feedback & Paper Request</h2>
              <p className="text-xs text-slate-400">Request specific question papers or share suggestions.</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">Feedback Received!</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Thank you for helping us improve PaperVault. Our admin team will review your submission.
            </p>
            <div className="pt-2">
              <button
                onClick={handleClose}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/30"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block font-medium text-slate-300 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Your Message or Request *</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Specify the branch, semester, subject name, subject code, or academic year of the paper you are looking for..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                required
              />
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 disabled:opacity-60 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Feedback</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
