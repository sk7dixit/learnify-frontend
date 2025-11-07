// src/pages/Notes.jsx

// We no longer need the complex local data/logic if we use BrowseNotesPage's self-contained logic
// import { debounce } from 'lodash';
// import { useAuth } from '../context/AuthContext';
// import api from '../services/api';
// The contentData structure is no longer needed here.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Import the component you want to use for the filtering interface
import BrowseNotesPage from './BrowseNotesModal';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { debounce } from 'lodash';

// We'll keep the NoteCard component for displaying search results
// But we remove all the complex state and getNextStepAndOptions logic.

// Helper components remain here for rendering notes and favorites logic
// (The full logic for NoteCard and related functions are retained from your original Notes.jsx)

const NoteCard = ({ note, user, navigate, isFavourite, onToggleFavourite }) => {
    const isSubscribed = user.subscription_expiry && new Date(user.subscription_expiry) > new Date();
    const hasAccess = note.is_free || isSubscribed || user.role === 'admin';
    const canUseFreeViews = !isSubscribed && user.free_views < 2;

    const handleViewClick = () => {
        // Corrected route for viewing notes
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


function Notes() {
  // We keep only the state required for search results and favorites
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [favouriteIds, setFavouriteIds] = useState(new Set());

  const navigate = useNavigate();
  const { user } = useAuth();

  // --- Search Handler that will be passed to BrowseNotesPage ---
  const handleNewSearch = (newFilters) => {
    // This is the function called when the user clicks 'GET NOTES'
    fetchNotes(newFilters);
  };

  // --- Debounced API fetch logic (retained) ---
  const fetchNotes = (currentFilters) => {
    setLoading(true);
    setError('');
    // Ensure debounce is set up correctly in your environment
    // For this example, we skip the debounce wrapper since the caller (BrowseNotesPage) controls the submission.

    // API call with selected filters from BrowseNotesPage
    const fetchApi = async () => {
        try {
            const params = { ...currentFilters };
            const res = await api.get('/notes/filtered', { params });
            setNotes(res.data);
        } catch (err) {
            setError("Failed to fetch notes. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    fetchApi();
  };

  // Fetch initial data (favourites)
  React.useEffect(() => {
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


  return (
    <div className="w-full">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <h1 className="text-4xl font-bold text-cyan-400">Browse Notes</h1>
            {/* Keeping the general search bar separate if needed for global search */}
            <div className="relative w-full sm:w-1/2 md:w-1/3">
                <input type="text" placeholder="Search notes by title..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
        </div>

        {/* --- INTEGRATE THE CASCADING DROPDOWNS --- */}
        {/* We use the BrowseNotesPage component and pass the search handler to it */}
        <BrowseNotesPage onSearch={handleNewSearch} />
        {/* ------------------------------------------- */}


        {/* --- DISPLAY NOTES RESULTS --- */}
        <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-300 mb-4">Search Results</h2>
            {loading ? <p className="text-center text-gray-400">Loading...</p> : (
                error ? <p className="text-red-500">{error}</p> :
                notes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {notes.map(note => <NoteCard key={note.id} note={note} user={user} navigate={navigate} isFavourite={favouriteIds.has(note.id)} onToggleFavourite={handleToggleFavourite} />)}
                    </div>
                ) : <p className="text-gray-400">No notes found for the current criteria. Use the search tool above.</p>
            )}
        </div>
        {/* ----------------------------- */}
    </div>
  );
}

export default Notes;