// src/pages/Notes.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { debounce } from 'lodash';

const contentData = {
  institutionTypes: ["School", "College", "Competitive Exam"],
  fields: {
    College: ["Engineering", "Medical", "Arts", "Commerce"],
    School: ["Class 12", "Class 11", "Class 10"],
    "Competitive Exam": ["UPSC", "SSC", "Banking", "Railways"]
  },
  courses: {
    Engineering: ["B.Tech", "M.Tech", "Diploma"],
    Medical: ["MBBS", "BDS", "BAMS"],
  },
  subjects: {
    "B.Tech": ["Computer Science", "Mechanical", "Civil", "Electronics"],
    "MBBS": ["Anatomy", "Physiology", "Biochemistry"],
    "Class 12": ["Physics", "Chemistry", "Maths", "Biology", "Computer Science"],
  }
};

function Notes() {
  const [materialType, setMaterialType] = useState(null);
  const [filters, setFilters] = useState({});
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [universities, setUniversities] = useState([]);
  const [favouriteIds, setFavouriteIds] = useState(new Set());

  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchNotes = useCallback(async (currentFilters) => {
    setLoading(true);
    setError('');
    try {
      const params = { ...currentFilters };
      if (materialType) {
        params.material_type = `${materialType}_material`;
      }
      const res = await api.get('/notes/filtered', { params });
      setNotes(res.data);
    } catch (err) {
      setError("Failed to fetch notes. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [materialType]);

  const debouncedFetch = useCallback(debounce(fetchNotes, 500), [fetchNotes]);

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

  useEffect(() => {
      // Fetch notes whenever filters change
      if (Object.keys(filters).length > 0 || materialType) {
          debouncedFetch(filters);
      } else {
          setNotes([]); // Clear notes if no filters are active
      }
  }, [filters, materialType, debouncedFetch]);

  useEffect(() => {
    if (materialType === 'university' && universities.length === 0) {
        const fetchUniversities = async () => {
            try {
                const res = await api.get('/notes/universities');
                setUniversities(res.data.map(u => ({ key: u, name: u })));
            } catch (err) {
                setError("Failed to fetch university list.");
            }
        };
        fetchUniversities();
    }
  }, [materialType, universities.length]);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setFilters(prev => ({ ...prev, q: query }));
  };

  const handleFilterSelect = (key, value) => {
      setFilters(prev => {
          const newFilters = { ...prev };
          // Reset child filters when a parent is changed
          if (key === 'institution_type') {
              delete newFilters.field;
              delete newFilters.course;
              delete newFilters.subject;
          } else if (key === 'field') {
              delete newFilters.course;
              delete newFilters.subject;
          } else if (key === 'course') {
              delete newFilters.subject;
          }
          newFilters[key] = value;
          return newFilters;
      });
  };

  const resetFlow = () => {
      setMaterialType(null);
      setFilters({});
      setNotes([]);
      setSearchQuery('');
  };

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

  const getNextStepAndOptions = () => {
    if (!materialType) return { step: 'materialType', options: [{key: 'learnify', name: 'Learnify Material'}, {key: 'university', name: 'University Material'}]};

    if (materialType === 'learnify') {
        if (!filters.institution_type) return { step: 'institutionType', options: contentData.institutionTypes.map(i => ({key: i, name: i})) };
        const fieldOptions = contentData.fields[filters.institution_type] || [];
        if (!filters.field && fieldOptions.length > 0) return { step: 'field', options: fieldOptions.map(f => ({key: f, name: f})) };
        const courseOptions = contentData.courses[filters.field] || [];
        if (courseOptions.length > 0 && !filters.course) return { step: 'course', options: courseOptions.map(c => ({key: c, name: c})) };
        return { step: 'notesList', options: [] };
    }

    if (materialType === 'university') {
        if (!filters.university_name) return { step: 'universityName', options: universities };
        return { step: 'notesList', options: [] };
    }
    return { step: null, options: [] };
  };

  const { step, options } = getNextStepAndOptions();
  const stepTitles = {
      materialType: "Select Material Type",
      institutionType: "Select Institution Type",
      field: "Select Field / Class",
      course: "Select Course / Degree",
      universityName: "Select University"
  };

  const handleSelection = (key, value) => {
    if(key === 'materialType') {
        setMaterialType(value);
    } else {
        const stepKey = key.replace('Type', '_type').replace('Name', '_name');
        handleFilterSelect(stepKey, value);
    }
  };

  return (
    <div className="w-full">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <h1 className="text-4xl font-bold text-cyan-400">Browse Notes</h1>
            <div className="relative w-full sm:w-1/2 md:w-1/3">
                <input type="text" placeholder="Search notes by title..." value={searchQuery} onChange={handleSearchChange} className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
        </div>

        {materialType && <button onClick={resetFlow} className="mb-8 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg">&larr; Start Over</button>}

        {step && step !== 'notesList' && <SelectionGrid title={stepTitles[step]} options={options} onSelect={(val) => handleSelection(step, val)} />}

        {(step === 'notesList' || searchQuery) && (
            <div>
                <h2 className="text-2xl font-bold text-gray-300 mb-4">Available Notes</h2>
                {loading ? <p className="text-center text-gray-400">Loading...</p> : (
                    error ? <p className="text-red-500">{error}</p> :
                    notes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {notes.map(note => <NoteCard key={note.id} note={note} user={user} navigate={navigate} isFavourite={favouriteIds.has(note.id)} onToggleFavourite={handleToggleFavourite} />)}
                        </div>
                    ) : <p className="text-gray-400">No notes found for this selection.</p>
                )}
            </div>
        )}
    </div>
  );
}

const SelectionGrid = ({ title, options, onSelect }) => (
    <div className="text-center animate-fadeIn mb-8">
      <h2 className="text-3xl font-bold mb-8 text-cyan-400">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {options.map(option => (
          <div key={option.key} onClick={() => onSelect(option.key)} className="p-6 bg-gray-800 rounded-lg border-2 border-transparent hover:border-cyan-500 cursor-pointer transition-all duration-300 transform hover:scale-105">
            <h3 className="text-xl font-bold">{option.name}</h3>
          </div>
        ))}
      </div>
    </div>
);

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

export default Notes;