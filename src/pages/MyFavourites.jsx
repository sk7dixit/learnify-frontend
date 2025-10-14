// src/pages/MyFavourites.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function MyFavourites() {
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavourites = async () => {
      try {
        setLoading(true);
        const response = await api.get('/notes/favourites');
        setFavourites(response.data);
      } catch (err) {
        setError('Failed to load your favourite notes.');
      } finally {
        setLoading(false);
      }
    };
    fetchFavourites();
  }, []);

  const handleRemoveFavourite = async (noteId) => {
    try {
      await api.delete(`/notes/favourites/${noteId}`);
      setFavourites(currentFavourites => currentFavourites.filter(note => note.id !== noteId));
    } catch (err) {
      alert('Failed to remove favourite. Please try again.');
    }
  };

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favourites.map(note => (
            <div key={note.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold truncate mb-2">{note.title}</h3>
                <p className="text-gray-400 text-sm mb-4">Views: {note.view_count}</p>
              </div>
              <div className="flex space-x-2 mt-2">
                {/* --- THIS IS THE FIX --- */}
                {/* The path now correctly points to "/notes/view/:noteId" */}
                <button
                  onClick={() => navigate(`/notes/view/${note.id}`)}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  View Note
                </button>
                <button
                  onClick={() => handleRemoveFavourite(note.id)}
                  title="Remove from Favourites"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">You haven't added any notes to your favourites yet.</p>
      )}
    </div>
  );
}

export default MyFavourites;