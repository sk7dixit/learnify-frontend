// src/pages/Notes.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { debounce } from 'lodash';
import BrowseNotesPage from './BrowseNotesPage'; // The advanced filter component
import { Filter, X, Search } from 'lucide-react'; // Lucide icons for UI

// --- Configuration ---
const INITIAL_SORT = 'newest';
const DEBOUNCE_DELAY = 500;

// Group notes by institution (keeps existing grouping behavior)
const groupNotesByInstitution = (notes) => {
  if (!notes) return {};
  return notes.reduce((acc, note) => {
    const institution = note.university_name || note.institution_name || 'Personal / Unclassified';
    if (!acc[institution]) acc[institution] = [];
    acc[institution].push(note);
    return acc;
  }, {});
};

// --- NoteCard Component (Simplified/Placeholdered) ---
// NOTE: This component needs full Phase 3 update later, but its logic is fine for now.
const NoteCard = ({ note, user, navigate, isFavourite, onToggleFavourite }) => {
  const isSubscribed = user?.subscription_expiry && new Date(user.subscription_expiry) > new Date();
  const hasAccess = note.is_free || isSubscribed || user?.role === 'admin';
  const canUseFreeViews = !isSubscribed && user && typeof user.free_views === 'number' && user.free_views > 0;

  const handleViewClick = () => {
    navigate(`/notes/view/${note.id}`);
  };

  // PHASE 3 UX: Placeholder for Average Rating and Date
  const averageRating = note.average_rating ? note.average_rating.toFixed(1) : '—';
  const uploadedDate = note.created_at ? new Date(note.created_at).toLocaleDateString() : 'N/A';

  return (
    <div className={`p-4 bg-gray-800 rounded-lg border ${hasAccess || canUseFreeViews ? 'border-gray-700' : 'border-red-500/50'} flex flex-col justify-between`}>
      <div>
        <h3 className="text-xl font-bold truncate">{note.title}</h3>
        <p className="text-gray-400 text-sm mb-1">By: {note.username || note.uploader || 'Unknown'}</p>
        {/* PHASE 3 UX: Added rating/date to card */}
        <p className="text-gray-500 text-xs">Rating: {averageRating} ★ | Views: {note.view_count ?? 0} | Date: {uploadedDate}</p>
        <p className="text-gray-400 text-sm mt-2">{note.course ? `${note.course} — ${note.subject || ''}` : note.subject}</p>
      </div>

      <div className="flex items-center space-x-2 mt-4">
        {(hasAccess || canUseFreeViews) ? (
          <button
            onClick={handleViewClick}
            className="flex-grow bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            {canUseFreeViews && !hasAccess ? `🔓 View (Free ${user.free_views}/2)` : '🔓 View Note'}
          </button>
        ) : (
          user?.is_subscription_enabled ? (
            <button onClick={() => navigate('/subscribe')} className="flex-grow bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors flex items-center justify-center">
              🔒 <span className="ml-1">OriPro</span>
            </button>
          ) : (
            <p className="text-sm text-yellow-400">Subscriptions disabled</p>
          )
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavourite(note.id); }}
          className={`p-2 rounded ${isFavourite ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}
          title={isFavourite ? "Remove from Favourites" : "Add to Favourites"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isFavourite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
          </svg>
        </button>
      </div>
    </div>
  );
};


// --- Main Notes Page Component ---
export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [favouriteIds, setFavouriteIds] = useState(new Set());

  // PHASE 3 FIX: State to manage filter visibility and currently applied filters
  const [showFilters, setShowFilters] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({ sort: INITIAL_SORT });

  const navigate = useNavigate();
  const { user } = useAuth();

  const groupedNotes = groupNotesByInstitution(notes);

  // Checks if any filters other than the default sort are active
  const isFilterActive = Object.keys(currentFilters).some(key => key !== 'sort' && currentFilters[key]);

  // Fetch notes based on current filters/sort
  const fetchNotes = useCallback(async (filters) => {
    setLoading(true);
    setError('');
    setCurrentFilters(filters); // Save the applied filters

    // Convert object filters to URL params, excluding null/undefined
    const params = Object.keys(filters).reduce((acc, key) => {
      if (filters[key]) acc[key] = filters[key];
      return acc;
    }, {});

    try {
      const res = await api.get('/notes/filtered', { params });
      setNotes(res.data || []);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError('Failed to fetch notes. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetch = useCallback(debounce((q) => {
    fetchNotes({ ...currentFilters, q });
  }, DEBOUNCE_DELAY), [currentFilters, fetchNotes]);

  // PHASE 3 FIX: 1. Initial Load (Hybrid Browsing)
  useEffect(() => {
    // Only fetch default notes on initial mount
    if (notes.length === 0 && !loading && !searchQuery) {
        fetchNotes({ sort: INITIAL_SORT });
    }
  }, [fetchNotes, notes.length, loading, searchQuery]);

  // Handle Search Query changes (debounced)
  useEffect(() => {
    if (searchQuery.length > 2) {
      debouncedFetch(searchQuery);
    } else if (searchQuery.length === 0 && isFilterActive) {
        // If search is cleared but filters are active, re-fetch based on filters
        fetchNotes(currentFilters);
    } else if (searchQuery.length === 0 && !isFilterActive && notes.length > 0) {
        // If search is cleared and no filters active, do nothing (maintain default view)
    }
  }, [searchQuery, debouncedFetch, isFilterActive]);

  // Fetch Favourites IDs
  useEffect(() => {
    const fetchFavourites = async () => {
      try {
        const res = await api.get('/notes/favourites/ids');
        setFavouriteIds(new Set(res.data || []));
      } catch (err) {
        console.error('Could not fetch favourites');
      }
    };
    fetchFavourites();
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
      alert('Failed to update favourites.');
    }
  };

  // Called by BrowseNotesPage when using the university flow
  const handleAdvancedSearch = (filters) => {
    setShowFilters(false); // Close filters after applying
    // Merge advanced filters with current state, overwriting sort if provided
    const newFilters = { ...currentFilters, ...filters, material_type: 'university' };
    // Remove empty strings from filters
    Object.keys(newFilters).forEach(key => {
        if (newFilters[key] === '' || newFilters[key] === null) {
            delete newFilters[key];
        }
    });
    fetchNotes(newFilters);
  };

  const handleResetFlow = () => {
    setShowFilters(false);
    setSearchQuery('');
    fetchNotes({ sort: INITIAL_SORT });
  };

  // Helper to construct filter status display
  const filterCount = Object.keys(currentFilters).filter(key => key !== 'sort' && currentFilters[key]).length;


  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-4xl font-bold text-cyan-400">Browse Notes</h1>

        {/* Search Input */}
        <div className="relative w-full sm:w-1/2 md:w-1/3">
          <input
            type="text"
            placeholder="Quick search by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Control Bar: Advanced Filters & Reset */}
      <div className="flex gap-4 mb-8">

        {/* Advanced Filters Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2
             ${showFilters ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
        >
          <Filter className="w-5 h-5" />
          {showFilters ? 'Hide Filters' : `Advanced Filters ${filterCount > 0 ? `(${filterCount} active)` : ''}`}
        </button>

        {/* Start Over Button (Visible when filters or search are active) */}
        {(isFilterActive || searchQuery.length > 0) && (
            <button onClick={handleResetFlow} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                <X className="w-5 h-5" /> Start Over
            </button>
        )}
      </div>

      {/* PHASE 3 FIX: Advanced filter collapse/expand */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showFilters ? 'max-h-[800px] opacity-100 mb-8' : 'max-h-0 opacity-0 mb-0'}`}>
         <BrowseNotesPage onSearch={handleAdvancedSearch} />
      </div>


      {/* Results Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-300 mb-4">
            {isFilterActive || searchQuery ? 'Search Results' : (currentFilters.sort === 'newest' ? 'Newest Notes' : 'Most Popular')}
             {notes.length > 0 ? ` (${notes.length} found)` : ''}
        </h2>

        {loading ? (
          <p className="text-center text-gray-400">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : notes.length > 0 ? (
          <div className="space-y-8">
            {Object.entries(groupedNotes).map(([institution, institutionNotes]) => (
              <div key={institution}>
                <h3 className="text-xl font-bold text-cyan-400 mb-4 border-b border-gray-700 pb-2">{institution}</h3>
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
          <p className="text-gray-400 p-6 bg-gray-800 rounded-lg">
            No notes found for your current search or filter criteria. Try expanding your search or using the Advanced Filters.
          </p>
        )}
      </div>
    </div>
  );
}