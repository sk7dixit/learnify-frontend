// src/pages/BrowseNotesModal.jsx (renamed to BrowseNotesPage)
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, ChevronDown, BookOpen } from 'lucide-react';
import api from '../services/api'; // Import your API instance
import { courseData } from '../services/universityData'; // For all courses list

// --- Dropdown Helper Component (Keep this unchanged) ---
const Dropdown = ({ label, value, options, onChange, isDisabled }) => {
// ... (Your Dropdown JSX/logic remains the same) ...
    return (
        <div className="relative w-full">
            <label className="block text-sm font-semibold text-gray-300 mb-1">{label}</label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={isDisabled || options.length === 0}
                    className={`
                        w-full appearance-none px-4 py-3 border rounded-lg transition duration-200
                        bg-gray-700 text-white border-gray-600 focus:ring-cyan-500 focus:border-cyan-500
                        ${(isDisabled || options.length === 0) ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-600 cursor-pointer'}
                    `}
                >
                    <option value="" disabled>{`Select ${label}`}</option>
                    {options.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
        </div>
    );
};
// --------------------------------------------------------

const BrowseNotesPage = ({ onSearch }) => {
    // 1. State for selected filters
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // 2. State for dynamically loaded options
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [availableSemesters, setAvailableSemesters] = useState([]);

    // Get all Course options from local file (Initial dropdown)
    const allCourseOptions = useMemo(() => Object.keys(courseData), []);

    // --- Dynamic Loading Effects ---

    // Effect 1: Fetch AVAILABLE Subjects when Course changes
    useEffect(() => {
        setAvailableSubjects([]);
        setAvailableSemesters([]);
        setSelectedSubject('');
        setSelectedSemester('');

        if (selectedCourse) {
            // NOTE: YOU MUST IMPLEMENT THIS NEW BACKEND ENDPOINT
            api.get(`/notes/available-subjects`, { params: { course: selectedCourse } })
                .then(res => setAvailableSubjects(res.data.subjects || []))
                .catch(err => console.error("Failed to fetch available subjects:", err));
        }
    }, [selectedCourse]);

    // Effect 2: Populate all possible Semesters when Subject changes
    useEffect(() => {
        setAvailableSemesters([]);
        setSelectedSemester('');

        if (selectedSubject && selectedCourse && courseData[selectedCourse]) {
            const totalSemesters = courseData[selectedCourse].semesters;
            // Populates all possible semesters (1, 2, 3...) for the selected course
            const semesters = Array.from({ length: totalSemesters }, (_, i) => `${i + 1}`);
            setAvailableSemesters(semesters);

            // OPTIONAL: If you want to only show semesters that have notes for the selected subject,
            // you'd need another API call here: `/notes/available-semesters?course=...&subject=...`
        }
    }, [selectedSubject, selectedCourse]);

    // --- Search Handler ---
    const handleGetNotes = () => {
        if (!selectedCourse || !selectedSubject || !selectedSemester) {
            console.error('ACTION BLOCKED: Please select a Course, Subject, and Semester.');
            return;
        }

        setIsSearching(true);
        const searchCriteria = {
            course: selectedCourse,
            subject: selectedSubject,
            semester: selectedSemester,
        };

        // Call the parent function (Notes.jsx) which handles API fetch and results display
        if(onSearch) {
            onSearch(searchCriteria);
        }

        // Simulating loading end. The actual end will be in Notes.jsx after the fetch.
        // We set it to false instantly so the button is ready for the next click.
        setIsSearching(false);
    };

    const isSearchDisabled = !selectedCourse || !selectedSubject || !selectedSemester || isSearching;

    return (
        <div className="p-4 md:p-8">
            <div className="p-6 bg-gray-900 border border-cyan-800 rounded-xl shadow-2xl backdrop-filter backdrop-blur-sm max-w-6xl mx-auto">
                <h2 className="text-3xl font-extrabold text-cyan-400 mb-6 flex items-center">
                    <BookOpen className="w-8 h-8 mr-3" />
                    Dynamic Material Search
                </h2>
                <p className="text-gray-400 mb-8">
                    Select criteria to view available notes. Options are filtered by existing approved uploads.
                </p>

                {/* Dropdown Grid (Simplified fields) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                    {/* 1. Course Dropdown (Initial filter) */}
                    <Dropdown
                        label="Course"
                        value={selectedCourse}
                        options={allCourseOptions}
                        onChange={setSelectedCourse}
                        isDisabled={false}
                    />

                    {/* 2. Subject Dropdown (Filtered by API) */}
                    <Dropdown
                        label="Subject"
                        value={selectedSubject}
                        options={availableSubjects}
                        onChange={setSelectedSubject}
                        isDisabled={!selectedCourse || availableSubjects.length === 0}
                    />

                    {/* 3. Semester Dropdown (Filtered by Course data) */}
                    <Dropdown
                        label="Semester"
                        value={selectedSemester}
                        options={availableSemesters}
                        onChange={setSelectedSemester}
                        isDisabled={!selectedSubject || availableSemesters.length === 0}
                    />
                </div>

                {/* GET Button */}
                <div className="mt-8 text-center">
                    <button
                        onClick={handleGetNotes}
                        disabled={isSearchDisabled}
                        className={`
                            w-full md:w-auto px-12 py-3 text-lg font-bold rounded-lg transition duration-300 transform hover:scale-[1.02]
                            flex items-center justify-center space-x-2 shadow-xl
                            ${isSearchDisabled
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600'
                            }
                        `}
                    >
                        {isSearching ? (
                            <>
                                <Search className="w-5 h-5 animate-spin" />
                                <span>Searching...</span>
                            </>
                        ) : (
                            <>
                                <Search className="w-5 h-5" />
                                <span>GET NOTES</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BrowseNotesPage;