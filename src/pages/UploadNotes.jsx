// src/pages/UploadNotes.jsx
import React, { useState } from "react";
import api from "../services/api";
// Assuming you have this imported to get the University Material data structure
import { universityData, courseData, subjectData } from "../services/universityData";

// --- MOCK DATA FOR ORINOTES LEGACY FLOW (Consolidate later) ---
const oriNotesData = {
  institutionTypes: ["School", "College", "Competitive Exam"],
  fields: {
    College: ["Engineering", "Medical", "Arts", "Commerce"],
    School: ["Class 12", "Class 11", "Class 10"],
    "Competitive Exam": ["UPSC", "SSC", "Banking", "Railways"]
  },
  courses: {
    Engineering: ["B.Tech", "M.Tech", "Diploma"],
    Medical: ["MBBS", "BDS", "BAMS"],
    Arts: ["B.A.", "M.A."],
    Commerce: ["B.Com", "BBA"],
    "Class 12": ["Physics", "Chemistry", "Maths", "Biology"],
    "Class 11": ["Physics", "Chemistry", "Maths", "Biology"],
    "Class 10": ["Maths", "Science"],
  },
  subjects: {
    "B.Tech": ["Computer Science", "Mechanical", "Civil", "Electronics"],
    "B.A.": ["History", "Political Science", "Sociology"],
    // You would need to fill out more subjects here
  }
};
// -----------------------------------------------------------------


// Reusable input components (keeping them clean)
const TextInput = ({ label, name, ...props }) => (
    <div>
        <label className="block text-gray-300 mb-2 font-semibold">{label}</label>
        <input name={name} {...props} className="w-full px-4 py-2 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
    </div>
);

const SelectInput = ({ label, name, value, onChange, options, required, ...props }) => (
    <div>
        <label className="block text-gray-300 mb-2 font-semibold">{label}</label>
        <select name={name} value={value} onChange={onChange} required={required} {...props} className="w-full px-4 py-2 rounded-lg bg-gray-700">
            <option value="" disabled>-- Select {label} --</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);


function UploadNotes() {
    const [formData, setFormData] = useState({
        material_type: "OriNotes", // Default to OriNotes
        title: "",
        isFree: false,
    });
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // State for OriNotes/Legacy fields
    const [oriNotesState, setOriNotesState] = useState({
        institutionType: '',
        field: '',
        course: '',
        subject: '',
    });

    // State for University Material fields
    const [uniState, setUniState] = useState({
        state: '',
        institutionType: '',
        institution: '',
        otherInstitution: '',
        course: '',
        semester: '',
        subject: '',
        otherSubject: ''
    });

    // Handle changes for main form data
    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    // Special handler for OriNotes cascading dropdowns
    const handleOriNotesChange = (e) => {
        const { name, value } = e.target;
        setOriNotesState(prev => {
            const newState = { ...prev, [name]: value };
            // Reset logic
            if (name === 'institutionType') {
                newState.field = ''; newState.course = ''; newState.subject = '';
            } else if (name === 'field') {
                newState.course = ''; newState.subject = '';
            } else if (name === 'course') {
                newState.subject = '';
            }
            return newState;
        });
    };

    // Special handler for University cascading dropdowns (retained logic)
    const handleUniChange = (e) => {
        const { name, value } = e.target;
        setUniState(prev => {
            const newState = { ...prev, [name]: value };
            if (name === 'state') {
                newState.institutionType = ''; newState.institution = ''; newState.otherInstitution = '';
            } else if (name === 'institutionType') {
                newState.institution = ''; newState.otherInstitution = '';
            } else if (name === 'course') {
                newState.semester = ''; newState.subject = ''; newState.otherSubject = '';
            } else if (name === 'semester') {
                newState.subject = ''; newState.otherSubject = '';
            }
            return newState;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) { setError("Please select a file to upload."); return; }
        if (!formData.title) { setError("Please provide a title."); return; }

        setLoading(true);
        setMessage("");
        setError("");
        const data = new FormData();

        // 1. Append shared data
        data.append("file", file);
        data.append("material_type", formData.material_type);
        data.append("title", formData.title);
        data.append("isFree", formData.isFree);

        // 2. Append Material-Specific Data
        if (formData.material_type === 'university') {
            data.append("university_name", uniState.institution === 'Other' ? uniState.otherInstitution : uniState.institution);
            data.append("course", uniState.course);
            data.append("subject", uniState.subject === 'Other' ? uniState.otherSubject : uniState.subject + ` (Sem ${uniState.semester})`);
        } else if (formData.material_type === 'OriNotes') {
            // FIX: Append the required fields for OriNotes flow
            data.append("institution_type", oriNotesState.institutionType);
            data.append("field", oriNotesState.field);
            data.append("course", oriNotesState.course);
            data.append("subject", oriNotesState.subject);
        }

        try {
            await api.post("/notes/upload", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setMessage("✅ Note uploaded successfully!");
            // Reset all states
            e.target.reset();
            setFormData({ material_type: "OriNotes", title: "", isFree: false });
            setOriNotesState({ institutionType: '', field: '', course: '', subject: '' });
            setUniState({ state: '', institutionType: '', institution: '', otherInstitution: '', course: '', semester: '', subject: '', otherSubject: '' });
            setFile(null);
        } catch (err) {
            setError(err.response?.data?.error || "❌ Upload failed. Please check the server logs.");
        } finally {
            setLoading(false);
        }
    };


    // ---- DERIVED OPTIONS FOR ORINOTES FLOW ----
    const fieldOptions = oriNotesState.institutionType ? oriNotesData.fields[oriNotesState.institutionType] || [] : [];
    const courseOptionsOriNotes = oriNotesState.field ? oriNotesData.courses[oriNotesState.field] || [] : [];
    const subjectOptionsOriNotes = oriNotesState.course ? oriNotesData.subjects[oriNotesState.course] || [] : [];

    // ---- DERIVED OPTIONS FOR UNIVERSITY FLOW ----
    const stateOptions = Object.keys(universityData);
    const institutionTypeOptions = uniState.state ? Object.keys(universityData[uniState.state]) : [];
    const institutionOptions = (uniState.state && uniState.institutionType) ? universityData[uniState.state][uniState.institutionType] : [];
    const courseOptionsUni = Object.keys(courseData);
    const semesterOptions = uniState.course ? Array.from({ length: courseData[uniState.course].semesters }, (_, i) => i + 1) : [];
    const subjectOptionsUni = (uniState.course && uniState.semester && subjectData[uniState.course]) ? subjectData[uniState.course][uniState.semester] || [] : [];


    return (
        <div className="max-w-2xl mx-auto p-8 bg-gray-800 text-white rounded-xl shadow-2xl border border-gray-700">
            <h2 className="text-3xl font-bold mb-6 text-cyan-400">📤 Upload New Note</h2>
            {message && <p className="mb-4 text-green-400 text-center">{message}</p>}
            {error && <p className="mb-4 text-red-400 text-center">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-gray-300 mb-2 font-semibold">Material Type</label>
                    <select name="material_type" value={formData.material_type} onChange={handleFormChange} className="w-full px-4 py-2 rounded-lg bg-gray-700">
                        <option value="OriNotes">OriNotes Material (Legacy)</option>
                        <option value="university">University Material</option>
                    </select>
                </div>

                {/* --- RENDER CASCADING FIELDS BASED ON MATERIAL TYPE --- */}

                {/* OriNotes Material Fields */}
                {formData.material_type === 'OriNotes' && (
                    <div className="space-y-6 p-4 border border-gray-600 rounded-lg">
                        <SelectInput label="Institution Type" name="institutionType" value={oriNotesState.institutionType} onChange={handleOriNotesChange} options={oriNotesData.institutionTypes} required />
                        {oriNotesState.institutionType && <SelectInput label="Field / Class" name="field" value={oriNotesState.field} onChange={handleOriNotesChange} options={fieldOptions} required />}
                        {oriNotesState.field && <SelectInput label="Course / Degree" name="course" value={oriNotesState.course} onChange={handleOriNotesChange} options={courseOptionsOriNotes} required />}
                        {oriNotesState.course && <SelectInput label="Subject" name="subject" value={oriNotesState.subject} onChange={handleOriNotesChange} options={subjectOptionsOriNotes} required />}
                    </div>
                )}

                {/* University Material Fields (Retained Logic) */}
                {formData.material_type === 'university' && (
                    <div className="space-y-6 p-4 border border-gray-600 rounded-lg">
                        <SelectInput label="State" name="state" value={uniState.state} onChange={handleUniChange} options={stateOptions} required />
                        {uniState.state && <SelectInput label="Institution Type" name="institutionType" value={uniState.institutionType} onChange={handleUniChange} options={institutionTypeOptions} required />}
                        {uniState.institutionType && <SelectInput label="Institution Name" name="institution" value={uniState.institution} onChange={handleUniChange} options={[...institutionOptions, 'Other']} required />}
                        {uniState.institution === 'Other' && <TextInput label="Specify Institution" name="otherInstitution" value={uniState.otherInstitution} onChange={handleUniChange} placeholder="Enter institution name" required />}

                        <SelectInput label="Course" name="course" value={uniState.course} onChange={handleUniChange} options={courseOptionsUni} required />
                        {uniState.course && <SelectInput label="Semester" name="semester" value={uniState.semester} onChange={handleUniChange} options={semesterOptions} required />}
                        {uniState.semester && <SelectInput label="Subject" name="subject" value={uniState.subject} onChange={handleUniChange} options={[...subjectOptionsUni, 'Other']} required />}
                        {uniState.subject === 'Other' && <TextInput label="Specify Subject" name="otherSubject" value={uniState.otherSubject} onChange={handleUniChange} placeholder="Enter subject name" required />}
                    </div>
                )}

                <TextInput label="Note Title" name="title" value={formData.title} onChange={handleFormChange} placeholder="e.g., Introduction to Algorithms - Unit 1" required />

                <div>
                    <label className="block text-gray-300 mb-2 font-semibold">PDF File</label>
                    <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} required className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"/>
                </div>

                <div className="flex items-center">
                    <input type="checkbox" id="isFree" name="isFree" checked={formData.isFree} onChange={handleFormChange} className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"/>
                    <label htmlFor="isFree" className="ml-3 text-gray-300">Mark as a Free Note 🔓</label>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 mt-4">
                    {loading ? 'Uploading...' : 'Upload Note'}
                </button>
            </form>
        </div>
    );
}

export default UploadNotes;