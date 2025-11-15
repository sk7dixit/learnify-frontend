// src/pages/SharedWithMe.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import NoteCardDisplay from '../components/NoteCardDisplay'; // <-- NEW: Import standard card

// --- Empty State Component (New) ---
const EmptyState = ({ onNavigate }) => (
    <div className="text-center py-16 bg-gray-800 rounded-xl border border-gray-700 shadow-xl">
        <p className="text-6xl mb-4">🤝</p>
        <h2 className="text-2xl font-bold text-gray-300 mb-4">No Notes Shared With You Yet!</h2>
        <p className="text-gray-500 mb-6">Ask a friend to share a resource, or explore the public library yourself.</p>
        <button
            onClick={() => onNavigate('/notes')}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg"
        >
            Browse Public Notes
        </button>
    </div>
);


function SharedWithMe() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchSharedNotes = useCallback(async () => {
    try {
      setLoading(true);
      // NOTE: We assume the backend returns a rich note object, including owner_username, view_count, etc.
      const response = await api.get('/notes/shared-with-me');
      setNotes(response.data || []);
    } catch (err) {
      setError('Failed to load notes shared with you.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSharedNotes();
  }, [fetchSharedNotes]);

  // Handle unfavorite action if the card supports it, although shared notes typically can't be unfavorited easily
  const handleToggleFavourite = (noteId) => {
    // Shared notes typically aren't toggled as a favorite here. Placeholder to prevent error.
    console.log(`Note ID ${noteId} favorite toggle attempted.`);
  };


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
        // --- PHASE 3 FIX: Use NoteCardDisplay component ---
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map(note => (
            <NoteCardDisplay
              key={note.id}
              note={{
                ...note,
                // Mocking missing fields for the card display if the backend /shared-with-me doesn't provide them
                username: note.owner_username,
                average_rating: note.average_rating || 5.0 // Shared notes often imply high value
              }}
              isFavourite={false} // Assume shared notes are not initially marked favourite
              onToggleFavourite={handleToggleFavourite}
            />
          ))}
        </div>
      ) : (
        // --- PHASE 3 FIX: Better Empty State ---
        <EmptyState onNavigate={navigate} />
      )}
    </div>
  );
}

export default SharedWithMe;