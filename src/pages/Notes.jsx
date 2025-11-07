// src/pages/Notes.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { debounce } from 'lodash';
// Import the dedicated component for University search
import BrowseNotesPage from './BrowseNotesPage';


// =========================================================================
// 1. NOTES GROUPING & DISPLAY LOGIC
// =========================================================================

// --- NEW HELPER: Group notes by Institution Name ---
const groupNotesByInstitution = (notes) => {
    if (!notes) return {};
    return notes.reduce((acc, note) => {
        // Use the university_name from your notes structure for grouping
        const institution = note.university_name || note.institution_name || 'Personal/Unclassified';
        if (!acc[institution]) {
            acc[institution] = [];
        }
        acc[institution].push(note);
        return acc;
    }, {});
};

const NoteCard = ({ note, user, navigate, isFavourite, onToggleFavourite }) => {
    const isSubscribed = user.subscription_expiry && new Date(user.subscription_expiry) > new Date();
    const hasAccess = note.is_free || isSubscribed || user.role === 'admin';
    const canUseFreeViews = !isSubscribed && user.free_views < 2;

    const handleViewClick = () => {
        navigate(`/notes/view/${note.id}`);
    };

    return (
        <div className={`p-4 bg-gray-800 rounded-lg border ${hasAccess || canUseFreeViews ? 'border-gray-700' : 'border-red-500/50'} flex flex-col justify-between`}>
            <div>
                <h3 className="text-xl font-bold truncate">{note.title}</h3>
                <p className="text-gray-400 text-sm mb-4">Views: {note.view_count}</p>
            </div>
            <div className="flex items-center space-x-2 mt-2">
                {(hasAccess || canUseFreeViews) ? (
                    <button
                      onClick={handleViewClick}
                      className="flex-grow bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                      {canUseFreeViews && !hasAccess ? `🔓 View (Free ${user.free_views}/2)` : '🔓 View Note'}
                    </button>
                ) : (
                    user?.is_subscription_enabled ?
                    <button onClick={() => navigate('/subscribe')} className="flex-grow bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors">🔒 Subscribe</button>
                    : <p className="text-sm text-yellow-400">Subscriptions disabled</p>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleFavourite(note.id); }}
                  className={`p-2 rounded ${isFavourite ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}
                  title={isFavourite ? "Remove from Favourites" : "Add to Favourites"}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isFavourite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
                </button>
            </div>
        </div>
    );
};


// =========================================================================
// 2. MAIN COMPONENT LOGIC
// =========================================================================
function Notes() {
  // Simplified state for the new flow
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [favouriteIds, setFavouriteIds] = useState(new Set());
  const [showResults, setShowResults] = useState(false); // State to control result visibility

  const navigate = useNavigate();
  const { user } = useAuth();

  // Grouping happens immediately when notes state changes
  const groupedNotes = groupNotesByInstitution(notes);

  // --- Fetch Notes Logic ---
  const fetchNotes = useCallback(async (currentFilters) => {
    setLoading(true);
    setError('');
    setShowResults(true); // Show the results area immediately after search begins

    try {
      // Send simplified filters to the backend
      const res = await api.get('/notes/filtered', { params: currentFilters });
      setNotes(res.data); // Backend must return a flat list of notes
    } catch (err) {
      setError("Failed to fetch notes. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetch = useCallback(debounce(fetchNotes, 500), [fetchNotes]);

  // Handle updates from the general search bar
  useEffect(() => {
    if (searchQuery.length > 2) {
      debouncedFetch({ q: searchQuery, material_type: 'all' }); // Search across all types
      setShowResults(true);
    } else if (searchQuery.length === 0) {
      // Clear search results if query is empty and no filters are active
      setNotes([]);
      setShowResults(false);
    }
  }, [searchQuery, debouncedFetch]);

  // Fetch favourites on load
  useEffect(() => {
    const fetchInitialData = async () => {
        try {
            const res = await api.get('/notes/favourites/ids');
            setFavouriteIds(new Set(res.data));
        } catch (err) {
            console.error("Could not fetch favourite IDs");
        }
    };
    fetchInitialData();
  }, []);

  const handleToggleFavourite = async (noteId) => {
      // ... (Favorite toggle logic remains the same)
      const isFavourite = favouriteIds.has(noteId);
      const newFavouriteIds = new Set(favouriteIds);
      try {
          if (isFavourite) {
              await api.delete(`/notes/favourites/${noteId}`);
              newFavouriteIds.delete(noteId);
          } else {
              await api.post(`/notes/favourites/${noteId}`);
              newFavouriteIds.add(noteId);
          }
          setFavouriteIds(newFavouriteIds);
      } catch (err) {
          alert("Failed to update favourites.");
      }
  };

  const resetFlow = () => {
      setNotes([]);
      setSearchQuery('');
      setShowResults(false);
  };

  // Function to be passed to BrowseNotesPage for the university flow search
  const handleUniversitySearch = (filters) => {
      // Note: We force material_type to 'university' for this flow's API call
      fetchNotes({ ...filters, material_type: 'university' });
  };


  return (
    <div className="w-full">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <h1 className="text-4xl font-bold text-cyan-400">Browse Notes</h1>
            {/* General search always available */}
            <div className="relative w-full sm:w-1/2 md:w-1/3">
                <input type="text" placeholder="Search notes by title..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
        </div>

        {/* Start Over button remains visible if any search state exists */}
        <button onClick={resetFlow} className="mb-8 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg">&larr; Start Over</button>

        {/* --- DYNAMIC UNIVERSITY MATERIAL SEARCH COMPONENT --- */}
        {/* We assume the user is only searching university material on this page */}
        <BrowseNotesPage onSearch={handleUniversitySearch} />

        {/* --- RESULTS LIST (Appears only after a search is executed) --- */}
        {showResults && (
            <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-300 mb-4">
                    Available Notes {notes.length > 0 ? `(${notes.length} found)` : ''}
                </h2>
                {loading ? (
                    <p className="text-center text-gray-400">Loading...</p>
                ) : (
                    error ? (
                        <p className="text-red-500">{error}</p>
                    ) :
                    notes.length > 0 ? (
                        <div className="space-y-8">
                            {Object.entries(groupedNotes).map(([institution, institutionNotes]) => (
                                <div key={institution}>
                                    <h3 className="text-xl font-bold text-cyan-400 mb-4 border-b border-gray-700 pb-2">
                                        {institution}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {institutionNotes.map(note => (
                                            <NoteCard
                                                key={note.id}
                                                note={note}
                                                user={user}
                                                navigate={navigate}
                                                isFavourite={favouriteIds.has(note.id)}
                                                onToggleFavourite={handleToggleFavourite}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400">No notes found for your selection.</p>
                    )
                )}
            </div>
        )}
    </div>
  );
}

export default Notes;