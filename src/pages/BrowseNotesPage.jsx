// src/pages/BrowseNotesPage.jsx (or whatever your file is named)
import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, BookOpen } from 'lucide-react';
// IMPORT THE REAL DATA:
import { universityData, courseData, subjectData } from '../services/universityData'; 


// --- START: STATE AND HANDLERS ---
const BrowseNotesPage = ({ onSearch }) => {
    // 1. State changed to reflect the data structure
    const [selectedState, setSelectedState] = useState('');
    const [selectedInstitutionType, setSelectedInstitutionType] = useState('');
    const [selectedInstitution, setSelectedInstitution] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    
    // --- Dynamic Options Calculation (Cascading Logic) ---

    // 1. Get all unique state names
    const stateOptions = useMemo(() => Object.keys(universityData), []);

    // 2. Filter Institution Types based on selected state
    const institutionTypeOptions = useMemo(() => 
        selectedState ? Object.keys(universityData[selectedState]) : [], 
        [selectedState]
    );

    // 3. Filter Institutions based on selected state and type
    const institutionOptions = useMemo(() => {
        if (!selectedState || !selectedInstitutionType) return [];
        let list = universityData[selectedState][selectedInstitutionType] || [];
        return [...list, "Other"];
    }, [selectedState, selectedInstitutionType]);
    
    // 4. Get all Course options
    const courseOptions = useMemo(() => Object.keys(courseData), []);

    // 5. Filter Semesters based on selected course
    const semesterOptions = useMemo(() => {
        if (!selectedCourse || !courseData[selectedCourse]) return [];
        const totalSemesters = courseData[selectedCourse].semesters;
        return Array.from({ length: totalSemesters }, (_, i) => `${i + 1}`);
    }, [selectedCourse]);

    // 6. Filter Subjects based on selected course and semester
    const subjectOptions = useMemo(() => {
        if (!selectedCourse || !selectedSemester || !subjectData[selectedCourse]) return [];
        // Map subject names from the correct semester array
        const subjects = subjectData[selectedCourse][selectedSemester] || [];
        return subjects;
    }, [selectedCourse, selectedSemester]);


    // --- Reset subsequent dropdowns when a parent changes ---
    useEffect(() => {
        setSelectedInstitutionType('');
        setSelectedInstitution('');
        setSelectedCourse('');
        setSelectedSemester('');
        setSelectedSubject('');
    }, [selectedState]);

    useEffect(() => {
        setSelectedInstitution('');
        setSelectedCourse('');
        setSelectedSemester('');
        setSelectedSubject('');
    }, [selectedInstitutionType]);

    useEffect(() => {
        setSelectedSemester('');
        setSelectedSubject('');
    }, [selectedCourse]);

    useEffect(() => {
        setSelectedSubject('');
    }, [selectedSemester]);


    // --- Search Handler ---
    const handleGetNotes = () => {
        // Validation check should be updated to match the new fields
        if (!selectedInstitution || !selectedCourse || !selectedSemester || !selectedSubject) {
            console.error('ACTION BLOCKED: Please complete required selections before searching.');
            return;
        }

        setIsSearching(true);
        const searchCriteria = {
            // Note: Your backend must be configured to search based on these keys
            state: selectedState,
            institution_name: selectedInstitution,
            course: selectedCourse,
            semester: selectedSemester,
            subject: selectedSubject
        };

        // Call the parent function with the search criteria (which calls the API)
        if(onSearch) {
            onSearch(searchCriteria);
        }
        
        setTimeout(() => { // Simulate loading end
            setIsSearching(false);
        }, 1500); 
    };

    const isSearchDisabled = !selectedInstitution || !selectedCourse || !selectedSemester || !selectedSubject || isSearching;
    
    // ... Dropdown Helper Component (keep this helper unchanged) ...
    const Dropdown = ({ label, value, options, onChange, isDisabled }) => (
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
    
    // --- Render Component ---
    return (
        <div className="p-4 md:p-8">
            <div className="p-6 bg-gray-900 border border-cyan-800 rounded-xl shadow-2xl backdrop-filter backdrop-blur-sm max-w-6xl mx-auto">
                <h2 className="text-3xl font-extrabold text-cyan-400 mb-6 flex items-center">
                    <BookOpen className="w-8 h-8 mr-3" />
                    University Material Search
                </h2>
                <p className="text-gray-400 mb-8">
                    Select your academic path to find existing notes shared by the community.
                </p>

                {/* 6-Column Dropdown Grid - Responsive Layout (Updated fields) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">

                    {/* 1. State Dropdown */}
                    <Dropdown
                        label="State"
                        value={selectedState}
                        options={stateOptions}
                        onChange={setSelectedState}
                        isDisabled={false}
                    />
                    
                    {/* 2. Institution Type Dropdown */}
                    <Dropdown
                        label="Inst. Type"
                        value={selectedInstitutionType}
                        options={institutionTypeOptions}
                        onChange={setSelectedInstitutionType}
                        isDisabled={!selectedState}
                    />

                    {/* 3. Institution Name Dropdown */}
                    <Dropdown
                        label="Institution Name"
                        value={selectedInstitution}
                        options={institutionOptions}
                        onChange={setSelectedInstitution}
                        isDisabled={!selectedInstitutionType}
                    />

                    {/* 4. Course Dropdown */}
                    <Dropdown
                        label="Course"
                        value={selectedCourse}
                        options={courseOptions}
                        onChange={setSelectedCourse}
                        isDisabled={!selectedInstitution}
                    />

                    {/* 5. Semester Dropdown */}
                    <Dropdown
                        label="Semester"
                        value={selectedSemester}
                        options={semesterOptions}
                        onChange={setSelectedSemester}
                        isDisabled={!selectedCourse}
                    />

                    {/* 6. Subject Dropdown */}
                    <Dropdown
                        label="Subject"
                        value={selectedSubject}
                        options={subjectOptions}
                        onChange={setSelectedSubject}
                        isDisabled={!selectedSemester}
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