// src/pages/ApprovalRequests.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function ApprovalRequests() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingNotes();
  }, []);

  const fetchPendingNotes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notes/pending-approval');
      setNotes(response.data);
    } catch (err) {
      setError('Failed to load approval requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (noteId, action) => {
    let reason = '';
    if (action === 'reject') {
        reason = prompt("Please provide a reason for rejecting this note:");
        if (!reason) {
            alert("Rejection requires a reason.");
            return;
        }
    }

    try {
        await api.put(`/notes/review/${noteId}`, { action, reason });
        // Refresh the list after reviewing
        fetchPendingNotes();
    } catch (err) {
        alert(`Failed to ${action} the note.`);
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  if (loading) return <p>Loading requests...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="w-full">
      <h1 className="text-4xl font-bold text-cyan-400 mb-8">Approval Requests</h1>

      {notes.length > 0 ? (
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left font-semibold">Title</th>
                <th className="py-3 px-4 text-left font-semibold">Uploaded by</th>
                <th className="py-3 px-4 text-left font-semibold">Date</th>
                <th className="py-3 px-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {notes.map(note => (
                <tr key={note.id} className="hover:bg-gray-700/50">
                  <td className="py-3 px-4">{note.title}</td>
                  <td className="py-3 px-4 text-gray-400">{note.username}</td>
                  <td className="py-3 px-4 text-gray-400">{formatDate(note.created_at)}</td>
                  <td className="py-3 px-4 flex space-x-2">
                    {/* --- THIS IS THE FIX --- */}
                    {/* The path is now correctly pointing to "/notes/view/:noteId" */}
                    <button onClick={() => navigate(`/notes/view/${note.id}`)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded">View</button>
                    <button onClick={() => handleReview(note.id, 'approve')} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded">Approve</button>
                    <button onClick={() => handleReview(note.id, 'reject')} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded">Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-400">There are no pending approval requests.</p>
      )}
    </div>
  );
}

export default ApprovalRequests;