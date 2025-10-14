import React, { useState, useEffect } from 'react';
import api from '../services/api';

function NoteRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notes/access/requests');
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (requestId, action) => {
    try {
      await api.put(`/notes/access/respond/${requestId}`, { action });
      // Refresh the list
      fetchRequests();
    } catch (err) {
      alert(`Failed to ${action} request.`);
    }
  };

  if (loading) return <p>Loading access requests...</p>;

  return (
    <div>
      <h1 className="text-4xl font-bold text-cyan-400 mb-8">Note Access Requests</h1>
      {requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req.id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center">
              <p>
                <span className="font-bold text-cyan-400">{req.requester_username}</span> wants to access your note: <span className="font-semibold">"{req.note_title}"</span>
              </p>
              <div className="flex space-x-2">
                <button onClick={() => handleResponse(req.id, 'grant')} className="bg-green-600 text-white font-semibold py-1 px-3 rounded">Grant</button>
                <button onClick={() => handleResponse(req.id, 'deny')} className="bg-red-600 text-white font-semibold py-1 px-3 rounded">Deny</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">You have no pending access requests.</p>
      )}
    </div>
  );
}

export default NoteRequests;