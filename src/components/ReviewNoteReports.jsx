// src/pages/ReviewNoteReports.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Flag, Loader2, Trash2, Check, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formatDate = (dateString) => new Date(dateString).toLocaleString();

// Component to handle the admin action modal (reject/unapprove)
function ActionModal({ report, onClose, onActionSuccess }) {
  const [action, setAction] = useState('mark_reviewed'); // mark_reviewed | reject_note | unapprove_note
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAction = async () => {
    setLoading(true);
    setError('');

    const payload = {
      action: action,
      noteId: report.note_id,
      reason: (action !== 'mark_reviewed' && reason.trim() === '') ? 'Admin action taken based on user report.' : reason,
    };

    if (action !== 'mark_reviewed' && payload.reason.trim() === 'Admin action taken based on user report.' && !reason) {
        setError("A specific reason is recommended when rejecting or unapproving a note.");
        setLoading(false);
        return;
    }

    try {
      // Endpoint: PUT /api/admin/note-reports/review/:reportId
      await api.put(`/admin/note-reports/review/${report.report_id}`, payload);
      onActionSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process action.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-70 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg p-6">
        <h3 className="text-2xl font-bold mb-4 text-cyan-400">Action Report: #{report.report_id}</h3>
        <p className="text-gray-400 mb-4">Note: <span className="font-semibold text-white">{report.note_title}</span> (Owner: {report.owner_username})</p>

        {error && <div className="p-2 mb-4 bg-red-900/50 text-red-300 rounded text-sm">{error}</div>}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Action to Take</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full p-2 bg-gray-700 rounded"
              disabled={loading}
            >
              <option value="mark_reviewed">Mark Report as Reviewed (No action on Note)</option>
              <option value="unapprove_note">Move Note to Pending Approval (Further review)</option>
              <option value="reject_note">Reject Note Permanently (Delete access)</option>
            </select>
          </div>

          {(action === 'reject_note' || action === 'unapprove_note') && (
            <div>
              <label className="block text-sm font-semibold mb-1">Reason for Note Action (Visible to Uploader)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter specific reason for rejecting or moving to pending..."
                rows="3"
                className="w-full p-2 bg-gray-700 rounded"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500" disabled={loading}>
            Cancel
          </button>
          <button onClick={handleAction} className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-2" disabled={loading}>
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Confirm Action'}
          </button>
        </div>
      </div>
    </div>
  );
}


export default function ReviewNoteReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const navigate = useNavigate();

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      // Endpoint: GET /api/admin/note-reports/pending
      const res = await api.get('/admin/note-reports/pending');
      setReports(res.data);
    } catch (err) {
      setError('Failed to load pending note reports.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Handler passed to the modal for success callback
  const handleActionSuccess = () => {
    fetchReports(); // Refresh the list
  };


  if (loading) return <p className="text-center text-gray-400">Loading pending reports...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="w-full">
      <h1 className="text-4xl font-bold text-red-400 mb-8 flex items-center gap-3">
        <Flag className="w-8 h-8" /> Community Reports Review
      </h1>

      {reports.length === 0 && (
        <div className="p-8 text-center bg-gray-800 rounded-xl border border-green-600/50">
          <p className="text-2xl text-white font-semibold">✅ No pending reports found. The community is happy!</p>
        </div>
      )}

      <div className="space-y-6">
        {reports.map((report) => (
          <div key={report.report_id} className="bg-gray-800 p-5 rounded-lg border border-red-600/50 shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-red-400 font-semibold mb-1">REPORT ID: {report.report_id}</p>
                <h3 className="text-xl font-bold text-white mb-2 truncate">
                  Note: {report.note_title}
                </h3>
                <p className="text-gray-300 mb-1">
                  **Reason:** {report.reason}
                </p>
                {report.comment && (
                   <p className="text-gray-400 text-sm italic border-l-4 border-gray-600 pl-2 mt-2">
                       Comment: {report.comment}
                   </p>
                )}
                <p className="text-xs text-gray-500 mt-3">
                  Reported by: {report.reporter_username} on {formatDate(report.created_at)}
                </p>
                <p className="text-xs text-gray-500">
                  Note Owner: {report.owner_username}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => navigate(`/notes/view/${report.note_id}`)}
                  className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
                >
                  View Note <ExternalLink className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setSelectedReport(report)}
                  className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                >
                  <Check className="w-4 h-4" /> Take Action
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Modal */}
      {selectedReport && (
        <ActionModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onActionSuccess={handleActionSuccess}
        />
      )}
    </div>
  );
}