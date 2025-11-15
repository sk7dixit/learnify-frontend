// src/pages/BrowseNotesPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api'; // IMPORTANT: correct relative path

// Simple dropdowns for Course -> Subject -> Semester etc.
// This component focuses on university-style browsing. It calls onSearch(filters) when user applies selection.
export default function BrowseNotesPage({ onSearch }) {
  // Store all available filter options fetched from the backend
  const [availableFilters, setAvailableFilters] = useState({
    courses: [],
    subjects: [],
    fields: [],
    universities: [],
  });

  // State for user selections
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [semester, setSemester] = useState('');
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [error, setError] = useState('');

  // PHASE 1 FIX: Fetch ALL available filters on component mount
  useEffect(() => {
    const fetchAllFilters = async () => {
      setLoadingFilters(true);
      setError('');
      try {
        // This endpoint was added in the backend fix
        const res = await api.get('/notes/available-subjects');
        // Expecting data: { subjects: [...], courses: [...], fields: [...], universities: [...] }
        setAvailableFilters(res.data);
      } catch (err) {
        console.error('Failed to fetch available filters:', err);
        setError('Failed to load browsing filters');
      } finally {
        setLoadingFilters(false);
      }
    };
    fetchAllFilters();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const filters = {
      course: selectedCourse || undefined,
      subject: selectedSubject || undefined,
      semester: semester || undefined // Assuming semester is a number/string field, not from a discrete list
    };
    onSearch && onSearch(filters);
  };

  const handleClear = () => {
    setSelectedCourse('');
    setSelectedSubject('');
    setSemester('');
    onSearch && onSearch({}); // Trigger search with empty filters
  };

  if (loadingFilters) {
    return <div className="bg-gray-800 p-6 rounded-lg text-white text-center">Loading browsing options...</div>;
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-2xl font-semibold text-white mb-4">Refine by Course / Subject</h2>

      <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-gray-400 mb-2">Course</label>
          <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="w-full p-2 rounded bg-gray-700">
            <option value="">-- Select Course --</option>
            {availableFilters.courses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-gray-400 mb-2">Subject</label>
          {/* We now show all available subjects fetched on load */}
          <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="w-full p-2 rounded bg-gray-700">
            <option value="">-- Select Subject --</option>
            {availableFilters.subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-gray-400 mb-2">Semester (optional)</label>
          <input value={semester} onChange={(e) => setSemester(e.target.value)} placeholder="e.g., 1, 2, 3..." className="w-full p-2 rounded bg-gray-700" />
        </div>

        {/* You can add Field and University filters similarly if needed for the UI */}

        <div className="sm:col-span-3 flex gap-2 mt-2">
          <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded">
            Get Notes
          </button>
          <button type="button" onClick={handleClear} className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded">
            Clear
          </button>
          {error && <p className="text-red-400 ml-4">{error}</p>}
        </div>
      </form>
    </div>
  );
}