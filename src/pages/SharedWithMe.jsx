// src/pages/SharedWithMe.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function SharedWithMe() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSharedNotes = async () => {
      try {
        setLoading(true);
        const response = await api.get('/notes/shared-with-me');
        setNotes(response.data);
      } catch (err) {
        setError('Failed to load notes shared with you.');
      } finally {
        setLoading(false);
      }
    };
    fetchSharedNotes();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-400">Loading shared notes...</p>;
  }
  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="w-full">
      <h1 className="text-4xl font-bold text-cyan-400 mb-8">Shared With Me</h1>
      {notes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map(note => (
            <div key={note.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold truncate mb-2">{note.title}</h3>
                <p className="text-gray-400 text-sm">Shared by: <span className="text-cyan-400">{note.owner_username}</span></p>
                <p className="text-gray-400 text-sm mb-4">Views: {note.view_count}</p>
              </div>
              <button
                onClick={() => navigate(`/notes/view/${note.id}`)}
                className="w-full mt-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                View Note
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No notes have been shared with you yet.</p>
      )}
    </div>
  );
}

export default SharedWithMe;