// src/pages/MyUploads.jsx
import React, { useState, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Trash2 } from 'lucide-react';
import { universityData, courseData, subjectData } from '../services/universityData'; // Assuming these are defined

// --- Reusable Input Components (unchanged) ---
const TextInput = ({ label, name, ...props }) => (
    <div>
        <label className="block text-gray-300 mb-2 font-semibold">{label}</label>
        <input
            name={name}
            {...props}
            className="w-full mt-2 px-4 py-2 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
    </div>
);

const SelectInput = ({ label, name, value, onChange, options, ...props }) => (
    <div>
        <label className="block text-gray-300 mb-2 font-semibold">{label}</label>
        <select
            name={name}
            value={value}
            onChange={onChange}
            {...props}
            className="w-full mt-2 px-4 py-2 rounded-lg bg-gray-700"
        >
            <option value="">-- Select {label} --</option>
            {options.map((opt) => (
                <option key={opt} value={opt}>
                    {opt}
                </option>
            ))}
        </select>
    </div>
);

// --- Form Components (unchanged) ---
// Personal Note Form - remains the same, fields now apply to all files in the batch
const PersonalNoteForm = ({ formData, handleChange }) => {
    const legacyContent = {
        fields: ["Engineering", "Medical", "Arts", "Commerce", "Class 12", "Class 11", "Class 10"],
        courses: {
            Engineering: ["B.Tech", "M.Tech", "Diploma"],
            Medical: ["MBBS", "BDS", "BAMS"]
        },
        subjects: {
            "B.Tech": ["Computer Science", "Mechanical", "Civil", "Electronics"],
            "MBBS": ["Anatomy", "Physiology", "Biochemistry"],
            "Class 12": ["Physics", "Chemistry", "Maths", "Biology", "Computer Science"]
        }
    };

    const courseOptions = formData.field ? legacyContent.courses[formData.field] || [] : [];
    const subjectOptions = formData.course ? legacyContent.subjects[formData.course] || [] : [];

    return (
        <div className="space-y-6">
             {/* NOTE: Title removed here as it is now defined per file */}
            <SelectInput
                label="Field / Class"
                name="field"
                value={formData.field}
                onChange={handleChange}
                options={legacyContent.fields}
                required
            />
            {courseOptions.length > 0 && (
                <SelectInput
                    label="Course / Degree"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    options={courseOptions}
                    required
                />
            )}
            {subjectOptions.length > 0 && (
                <SelectInput
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    options={subjectOptions}
                    required
                />
            )}
        </div>
    );
};

// University Note Form - remains the same, fields now apply to all files in the batch
const UniversityNoteForm = ({ uniState, handleUniChange }) => {
    const stateOptions = Object.keys(universityData);
    const institutionTypeOptions = uniState.state ? Object.keys(universityData[uniState.state]) : [];
    const institutionOptions =
        uniState.state && uniState.institutionType ? universityData[uniState.state][uniState.institutionType] : [];
    const courseOptions = Object.keys(courseData);
    const semesterOptions = uniState.course
        ? Array.from({ length: courseData[uniState.course].semesters }, (_, i) => i + 1)
        : [];
    const subjectOptions =
        uniState.course && uniState.semester && subjectData[uniState.course]
            ? subjectData[uniState.course][uniState.semester] || []
            : [];

    return (
        <div className="space-y-6 p-4 border border-gray-600 rounded-lg">
            <SelectInput label="State" name="state" value={uniState.state} onChange={handleUniChange} options={stateOptions} required />
            {uniState.state && (
                <SelectInput
                    label="Institution Type"
                    name="institutionType"
                    value={uniState.institutionType}
                    onChange={handleUniChange}
                    options={institutionTypeOptions}
                    required
                />
            )}
            {uniState.institutionType && (
                <SelectInput
                    label="Institution Name"
                    name="institution"
                    value={uniState.institution}
                    onChange={handleUniChange}
                    options={[...institutionOptions, "Other"]}
                    required
                />
            )}
            {uniState.institution === "Other" && (
                <TextInput
                    label="Specify Institution"
                    name="otherInstitution"
                    value={uniState.otherInstitution}
                    onChange={handleUniChange}
                    placeholder="Enter institution name"
                    required
                />
            )}

            <SelectInput label="Course" name="course" value={uniState.course} onChange={handleUniChange} options={courseOptions} required />
            {uniState.course && (
                <SelectInput
                    label="Semester"
                    name="semester"
                    value={uniState.semester}
                    onChange={handleUniChange}
                    options={semesterOptions}
                    required
                />
            )}
            {uniState.semester && (
                <SelectInput
                    label="Subject"
                    name="subject"
                    value={uniState.subject}
                    onChange={handleUniChange}
                    options={[...subjectOptions, "Other"]}
                    required
                />
            )}
            {uniState.subject === "Other" && (
                <TextInput
                    label="Specify Subject"
                    name="otherSubject"
                    value={uniState.otherSubject}
                    onChange={handleUniChange}
                    placeholder="Enter subject name"
                    required
                />
            )}
        </div>
    );
};
// --- END Form Components ---


function MyUploads() {
    const { refreshUser } = useAuth();
    const fileInputRef = useRef(null);

    const [uploadType, setUploadType] = useState("personal_material");
    
    // PHASE 2 FIX: State now holds an array of file objects { file: File, title: string, id: number }
    const [fileList, setFileList] = useState([]); 
    
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Metadata state (applies to ALL files in the list)
    const [formData, setFormData] = useState({ title: "", field: "", course: "", subject: "" });
    const [uniState, setUniState] = useState({
        state: "", institutionType: "", institution: "", otherInstitution: "",
        course: "", semester: "", subject: "", otherSubject: ""
    });


    // --- Handlers ---
    const handlePersonalChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const updated = { ...prev, [name]: value };
            if (name === "field") { updated.course = ""; updated.subject = ""; }
            if (name === "course") { updated.subject = ""; }
            return updated;
        });
    };

    const handleUniChange = (e) => {
        const { name, value } = e.target;
        setUniState((prev) => {
            const newState = { ...prev, [name]: value };
            if (name === "state") { newState.institutionType = ""; newState.institution = ""; newState.otherInstitution = ""; }
            if (name === "institutionType") { newState.institution = ""; newState.otherInstitution = ""; }
            if (name === "course") { newState.semester = ""; newState.subject = ""; newState.otherSubject = ""; }
            if (name === "semester") { newState.subject = ""; newState.otherSubject = ""; }
            return newState;
        });
    };
    
    // PHASE 2 FIX: Handler for adding multiple files from input
    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files)
            .filter(f => f.type === 'application/pdf') // Basic validation
            .map((file, index) => ({
                id: Date.now() + index, // Unique ID for key/tracking
                file: file,
                title: file.name.replace(/\.[^/.]+$/, '') // Default title is filename
            }));
        
        setFileList(prevList => [...prevList, ...newFiles]);
        // Clear file input value to allow selecting the same file(s) again
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // PHASE 2 FIX: Handler for updating the title of a specific file
    const handleTitleChange = (id, newTitle) => {
        setFileList(prevList => prevList.map(item => 
            item.id === id ? { ...item, title: newTitle } : item
        ));
    };

    // PHASE 2 FIX: Handler for removing a file from the list
    const handleRemoveFile = (id) => {
        setFileList(prevList => prevList.filter(item => item.id !== id));
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (fileList.length === 0) {
            setError("Please select at least one PDF file to upload.");
            return;
        }
        // Ensure all files have a non-empty title
        if (fileList.some(item => item.title.trim() === '')) {
             setError("All uploaded files must have a title.");
            return;
        }

        setLoading(true);
        setMessage("");
        setError("");

        const data = new FormData();
        data.append("material_type", uploadType);
        
        // PHASE 2 FIX: Append ALL files and ALL titles
        fileList.forEach(item => {
            data.append("files[]", item.file); // Backend expects files[]
            data.append("titles[]", item.title); // Backend expects titles[]
        });
        
        // Append all metadata (applies to the whole batch)
        if (uploadType === "university_material") {
            data.append(
                "university_name",
                uniState.institution === "Other" ? uniState.otherInstitution : uniState.institution
            );
            data.append("course", uniState.course);
            data.append(
                "subject",
                uniState.subject === "Other"
                    ? uniState.otherSubject
                    : uniState.subject + (uniState.semester ? ` (Sem ${uniState.semester})` : '')
            );
            data.append("semester", uniState.semester || '');
        } else {
            // Personal Material fields
            data.append("field", formData.field);
            data.append("course", formData.course);
            data.append("subject", formData.subject);
        }

        try {
            // PHASE 2 FIX: Use the new multi-upload endpoint
            const response = await api.post("/notes/multi-upload", data, { 
                headers: { "Content-Type": "multipart/form-data" }
            });
            
            setMessage(response.data.message);
            await refreshUser();
            
            // Clear form state
            setFileList([]);
            setFormData({ title: "", field: "", course: "", subject: "" });
            setUniState({
                state: "", institutionType: "", institution: "", otherInstitution: "",
                course: "", semester: "", subject: "", otherSubject: ""
            });
            
        } catch (err) {
            // Handle specific multi-upload errors (like file limits or individual file errors)
            const errorMsg = err.response?.data?.error || "Upload failed. Check console for details.";
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-8 bg-gray-800 rounded-xl">
            <h1 className="text-4xl font-bold text-cyan-400 mb-4">Upload Your Note(s)</h1>
            <p className="text-gray-400 mb-8">
                You can upload multiple files at once. All files in the batch must share the same subject/course information below.
            </p>

            {message && <p className="text-green-400 text-center mb-4">{message}</p>}
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. UPLOAD TYPE SELECTION */}
                <div>
                    <label className="block text-gray-300 mb-2 font-semibold">Type of Material</label>
                    <select
                        value={uploadType}
                        onChange={(e) => setUploadType(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-gray-700"
                    >
                        <option value="personal_material">Personal Note (General/School)</option>
                        <option value="university_material">University/College Material</option>
                    </select>
                </div>

                {/* 2. METADATA FORM (Applies to all files) */}
                {uploadType === "personal_material" ? (
                    <PersonalNoteForm formData={formData} handleChange={handlePersonalChange} />
                ) : (
                    <UniversityNoteForm uniState={uniState} handleUniChange={handleUniChange} />
                )}
                
                {/* 3. FILE SELECTOR & LIST (PHASE 2 FIX: Multi-file UI) */}
                <div className="pt-4 border-t border-gray-700">
                    <label className="block text-gray-300 mb-2 font-semibold">Select PDF File(s)</label>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        multiple // Allows multiple selection
                        onChange={handleFileChange}
                        className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                    />
                     <p className="text-xs text-gray-500 mt-2">PDF only, Max 10 files per batch, 20MB per file.</p>
                </div>

                {/* 4. DYNAMIC FILE LIST & TITLE INPUT */}
                {fileList.length > 0 && (
                    <div className="space-y-3 p-4 bg-gray-700 rounded-lg">
                        <h3 className="text-lg font-bold text-white">Files to Upload ({fileList.length})</h3>
                        {fileList.map(item => (
                            <div key={item.id} className="flex items-center space-x-3">
                                {/* Title Input */}
                                <input
                                    type="text"
                                    value={item.title}
                                    onChange={(e) => handleTitleChange(item.id, e.target.value)}
                                    placeholder={item.file.name.replace(/\.[^/.]+$/, '')}
                                    required
                                    className="flex-1 px-3 py-2 rounded bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500"
                                />
                                {/* Remove Button */}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveFile(item.id)}
                                    className="text-red-500 hover:text-red-400 p-2 rounded"
                                    title={`Remove ${item.file.name}`}
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                
                {/* 5. SUBMIT BUTTON */}
                <button
                    type="submit"
                    disabled={loading || fileList.length === 0}
                    className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 mt-4"
                >
                    {loading ? "Uploading Batch..." : `Upload ${fileList.length} Note(s)`}
                </button>
            </form>
        </div>
    );
}

export default MyUploads;