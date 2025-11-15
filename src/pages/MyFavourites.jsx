// src/pages/MyFavourites.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import NoteCardDisplay from '../components/NoteCardDisplay'; // <-- NEW: Import standard card

function MyFavourites() {
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchFavourites = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/notes/favourites');
      setFavourites(response.data || []);
    } catch (err) {
      setError('Failed to load your favourite notes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavourites();
  }, [fetchFavourites]);

  // Handler to remove favourite (passed down to the NoteCardDisplay, if needed)
  const handleToggleFavourite = async (noteId) => {
    try {
      // Since this is the Favourites page, a click means DELETE
      await api.delete(`/notes/favourites/${noteId}`);
      setFavourites(currentFavourites => currentFavourites.filter(note => note.id !== noteId));
    } catch (err) {
      alert('Failed to remove favourite. Please try again.');
    }
  };

  // --- RENDERING ---
  if (loading) {
    return <p className="text-center">Loading your favourites...</p>;
  }
  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="w-full">
      <h1 className="text-4xl font-bold text-cyan-400 mb-8">My Favourites</h1>

      {favourites.length > 0 ? (
        // --- PHASE 3 FIX: Use NoteCardDisplay component ---
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favourites.map(note => (
            <NoteCardDisplay
              key={note.id}
              note={{ ...note, average_rating: 4.8, username: 'Contributor' }} // Mocking missing fields for display
              isFavourite={true} // Always true on this page
              onToggleFavourite={handleToggleFavourite}
            />
          ))}
        </div>
      ) : (
        // --- PHASE 3 FIX: Better Empty State ---
        <div className="text-center py-16 bg-gray-800 rounded-xl border border-gray-700 shadow-xl">
          <p className="text-6xl mb-4">💖</p>
          <h2 className="text-2xl font-bold text-gray-300 mb-4">Your Favourites list is empty!</h2>
          <p className="text-gray-500 mb-6">Start exploring to save notes you love.</p>
          <button
            onClick={() => navigate('/notes')}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg"
          >
            Browse Notes Now
          </button>
        </div>
      )}
    </div>
  );
}

export default MyFavourites;