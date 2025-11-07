import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, BookOpen } from 'lucide-react';

// --- MOCK DATA STRUCTURE (Replace with API/Firestore Fetch) ---
// In a real app, this data would be fetched from the backend (e.g., /api/metadata/university_structure)
const UNIVERSITY_STRUCTURE_MOCK = [
    {
        college: "Tech University",
        courses: [
            {
                name: "Computer Science",
                semesters: [
                    {
                        number: "Semester 1",
                        subjects: [
                            { name: "Programming Basics", chapters: ["Variables", "Loops", "Functions"] },
                            { name: "Applied Physics", chapters: ["Mechanics", "Thermodynamics"] },
                        ]
                    },
                    {
                        number: "Semester 2",
                        subjects: [
                            { name: "Data Structures", chapters: ["Arrays", "Linked Lists", "Trees"] },
                            { name: "Calculus II", chapters: ["Integrals", "Differential Equations"] },
                        ]
                    },
                ]
            },
            {
                name: "Electrical Engineering",
                semesters: [
                    {
                        number: "Semester 1",
                        subjects: [
                            { name: "Circuit Theory", chapters: ["Ohm's Law", "Thevenin's Theorem"] },
                        ]
                    },
                ]
            }
        ]
    },
    {
        college: "Management School",
        courses: [
            {
                name: "MBA",
                semesters: [
                    {
                        number: "Semester 1",
                        subjects: [
                            { name: "Financial Accounting", chapters: ["P&L", "Balance Sheets"] },
                            { name: "Marketing Strategy", chapters: ["4 Ps", "Market Segmentation"] },
                        ]
                    }
                ]
            }
        ]
    }
];
// --- END MOCK DATA ---


const BrowseNotesModal = ({ onSearch }) => {
    // State to hold the current selections
    const [selectedCollege, setSelectedCollege] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedChapter, setSelectedChapter] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // --- Dynamic Options Calculation (Cascading Logic) ---

    // 1. Get all unique college names
    const collegeOptions = useMemo(() =>
        UNIVERSITY_STRUCTURE_MOCK.map(item => item.college),
        []
    );

    // 2. Filter courses based on selected college
    const courseOptions = useMemo(() => {
        const collegeData = UNIVERSITY_STRUCTURE_MOCK.find(c => c.college === selectedCollege);
        return collegeData ? collegeData.courses.map(course => course.name) : [];
    }, [selectedCollege]);

    // 3. Filter semesters based on selected course
    const semesterOptions = useMemo(() => {
        const collegeData = UNIVERSITY_STRUCTURE_MOCK.find(c => c.college === selectedCollege);
        const courseData = collegeData?.courses.find(cs => cs.name === selectedCourse);
        return courseData ? courseData.semesters.map(sem => sem.number) : [];
    }, [selectedCollege, selectedCourse]);

    // 4. Filter subjects based on selected semester
    const subjectOptions = useMemo(() => {
        const collegeData = UNIVERSITY_STRUCTURE_MOCK.find(c => c.college === selectedCollege);
        const courseData = collegeData?.courses.find(cs => cs.name === selectedCourse);
        const semesterData = courseData?.semesters.find(sem => sem.number === selectedSemester);
        return semesterData ? semesterData.subjects.map(sub => sub.name) : [];
    }, [selectedCollege, selectedCourse, selectedSemester]);

    // 5. Filter chapters based on selected subject
    const chapterOptions = useMemo(() => {
        const collegeData = UNIVERSITY_STRUCTURE_MOCK.find(c => c.college === selectedCollege);
        const courseData = collegeData?.courses.find(cs => cs.name === selectedCourse);
        const semesterData = courseData?.semesters.find(sem => sem.number === selectedSemester);
        const subjectData = semesterData?.subjects.find(sub => sub.name === selectedSubject);
        return subjectData ? subjectData.chapters : [];
    }, [selectedCollege, selectedCourse, selectedSemester, selectedSubject]);


    // --- Reset subsequent dropdowns when a parent changes ---
    useEffect(() => {
        setSelectedCourse('');
        setSelectedSemester('');
        setSelectedSubject('');
        setSelectedChapter('');
    }, [selectedCollege]);

    useEffect(() => {
        setSelectedSemester('');
        setSelectedSubject('');
        setSelectedChapter('');
    }, [selectedCourse]);

    useEffect(() => {
        setSelectedSubject('');
        setSelectedChapter('');
    }, [selectedSemester]);

    useEffect(() => {
        setSelectedChapter('');
    }, [selectedSubject]);


    // --- Search Handler ---
    const handleGetNotes = () => {
        if (!selectedCollege || !selectedCourse || !selectedSemester || !selectedSubject || !selectedChapter) {
            alert('Please complete all selections before searching.');
            return;
        }

        setIsSearching(true);
        console.log("Searching for notes with:", {
            college: selectedCollege,
            course: selectedCourse,
            semester: selectedSemester,
            subject: selectedSubject,
            chapter: selectedChapter
        });

        // ⚠️ In a real application, you would make an API call here:
        // api.get('/api/notes/search', { params: { college, course, ... }})

        setTimeout(() => {
            setIsSearching(false);
            // Call the parent function with the search criteria
            if(onSearch) {
                onSearch({ college: selectedCollege, course: selectedCourse, subject: selectedSubject, chapter: selectedChapter });
            }
            alert(`Notes Found for: ${selectedChapter} in ${selectedSubject}. (See console for search query)`);
        }, 1500); // Simulate API loading time
    };

    // Check if the GET button should be enabled
    const isSearchDisabled = !selectedCollege || !selectedCourse || !selectedSemester || !selectedSubject || !selectedChapter || isSearching;


    // --- Dropdown Helper Component ---
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
        <div className="p-8 bg-gray-900 border border-cyan-800 rounded-xl shadow-2xl backdrop-filter backdrop-blur-sm">
            <h2 className="text-3xl font-extrabold text-cyan-400 mb-6 flex items-center">
                <BookOpen className="w-8 h-8 mr-3" />
                University Material Search
            </h2>
            <p className="text-gray-400 mb-8">
                Select your academic path to find existing notes shared by the community.
            </p>

            {/* 5-Column Dropdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

                {/* 1. College Dropdown */}
                <Dropdown
                    label="College Name"
                    value={selectedCollege}
                    options={collegeOptions}
                    onChange={setSelectedCollege}
                    isDisabled={false}
                />

                {/* 2. Course Dropdown */}
                <Dropdown
                    label="Course"
                    value={selectedCourse}
                    options={courseOptions}
                    onChange={setSelectedCourse}
                    isDisabled={!selectedCollege}
                />

                {/* 3. Semester Dropdown */}
                <Dropdown
                    label="Semester"
                    value={selectedSemester}
                    options={semesterOptions}
                    onChange={setSelectedSemester}
                    isDisabled={!selectedCourse}
                />

                {/* 4. Subject Dropdown */}
                <Dropdown
                    label="Subject"
                    value={selectedSubject}
                    options={subjectOptions}
                    onChange={setSelectedSubject}
                    isDisabled={!selectedSemester}
                />

                {/* 5. Chapter Dropdown */}
                <Dropdown
                    label="Chapter/Topic"
                    value={selectedChapter}
                    options={chapterOptions}
                    onChange={setSelectedChapter}
                    isDisabled={!selectedSubject}
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
    );
};

export default BrowseNotesModal;