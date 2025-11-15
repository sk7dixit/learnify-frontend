// src/components/ReportNote.jsx
import React, { useState } from 'react';
import api from '../services/api';
import { Flag, X } from 'lucide-react';

const REPORT_REASONS = [
    'Incorrect Information / Factual Errors',
    'Incomplete or Missing Sections',
    'Low Quality / Poor Formatting',
    'Off-Topic or Misleading Title',
    'Copyright Infringement / Plagiarism',
    'Other (Please Specify in Comments)',
];

export default function ReportNote({ noteId, noteTitle, onClose }) {
    const [reason, setReason] = useState('');
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState({ message: '', error: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFeedback({ message: '', error: '' });

        if (!reason) {
            setFeedback({ error: 'Please select a reason for reporting.' });
            setLoading(false);
            return;
        }

        try {
            // NOTE: We assume a new backend endpoint /notes/:noteId/report exists.
            const res = await api.post(`/notes/${noteId}/report`, {
                reason,
                comment
            });

            setFeedback({ message: res.data.message || '✅ Note reported successfully! Thank you for your feedback.', error: '' });

            // Automatically close the modal after a short delay upon success
            setTimeout(onClose, 2500);

        } catch (err) {
            const errorMsg = err.response?.data?.error || '❌ Failed to submit report. You may have already reported this note.';
            setFeedback({ error: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-70 p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg p-6 animate-fadeIn">

                {/* Header */}
                <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
                    <h2 className="text-2xl font-bold text-red-400 flex items-center gap-2">
                        <Flag className="w-6 h-6" /> Report Note
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-gray-300 mb-4">
                    Reporting: <span className="font-semibold text-white">"{noteTitle}"</span>
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Reason Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">1. Select Reason <span className="text-red-400">*</span></label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                            required
                        >
                            <option value="">-- Choose a reason --</option>
                            {REPORT_REASONS.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    {/* Comment Area */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">2. Detailed Comment (Optional)</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Provide specific details to help us review this note quickly (e.g., 'Error on page 5, line 12')."
                            rows="4"
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>

                    {/* Feedback */}
                    {feedback.error && <p className="text-sm text-red-400 font-medium">{feedback.error}</p>}
                    {feedback.message && <p className="text-sm text-green-400 font-medium">{feedback.message}</p>}


                    <button
                        type="submit"
                        disabled={loading || !reason}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Submitting...' : 'Submit Report'}
                    </button>
                </form>
            </div>
        </div>
    );
}