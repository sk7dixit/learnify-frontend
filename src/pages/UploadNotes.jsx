// src/pages/UploadNotes.jsx
import React, { useState } from "react";
import api from "../services/api";
import { universityData, courseData, subjectData } from "../services/universityData";

// Reusable input components
const TextInput = ({ label, name, ...props }) => (
    <div>
        <label className="block text-gray-300 mb-2 font-semibold">{label}</label>
        <input name={name} {...props} className="w-full px-4 py-2 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
    </div>
);

const SelectInput = ({ label, name, value, onChange, options, ...props }) => (
    <div>
        <label className="block text-gray-300 mb-2 font-semibold">{label}</label>
        <select name={name} value={value} onChange={onChange} {...props} className="w-full px-4 py-2 rounded-lg bg-gray-700">
            <option value="">-- Select {label} --</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

function UploadNotes() {
    // State for the main form data
    const [formData, setFormData] = useState({
        material_type: "learnify_material",
        title: "",
        isFree: false,
    });
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // State for managing the cascading dropdowns
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

    // Handle changes for both form and university dropdowns
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name in formData) {
            setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        } else {
            handleUniChange(e);
        }
    };

    // Special handler for cascading dropdowns to reset child fields
    const handleUniChange = (e) => {
        const { name, value } = e.target;
        setUniState(prev => {
            const newState = { ...prev, [name]: value };
            // Reset logic
            if (name === 'state') {
                newState.institutionType = '';
                newState.institution = '';
                newState.otherInstitution = '';
            }
            if (name === 'institutionType') {
                newState.institution = '';
                newState.otherInstitution = '';
            }
            if (name === 'course') {
                newState.semester = '';
                newState.subject = '';
                newState.otherSubject = '';
            }
            if (name === 'semester') {
                newState.subject = '';
                newState.otherSubject = '';
            }
            return newState;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError("Please select a file to upload.");
            return;
        }
        setLoading(true);
        setMessage("");
        setError("");
        const data = new FormData();

        // Append main form data
        data.append("material_type", formData.material_type);
        data.append("title", formData.title);
        data.append("isFree", formData.isFree);
        data.append("file", file);

        // Append university-specific data, handling the "Other" option
        if (formData.material_type === 'university_material') {
            data.append("university_name", uniState.institution === 'Other' ? uniState.otherInstitution : uniState.institution);
            data.append("course", uniState.course);
            data.append("subject", uniState.subject === 'Other' ? uniState.otherSubject : uniState.subject + ` (Sem ${uniState.semester})`);
        }

        try {
            await api.post("/notes/upload", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setMessage("✅ Note uploaded successfully!");
            e.target.reset(); // Clear file input
            // Reset all state
            setFormData({ material_type: "learnify_material", title: "", isFree: false });
            setUniState({ state: '', institutionType: '', institution: '', otherInstitution: '', course: '', semester: '', subject: '', otherSubject: '' });
            setFile(null);
        } catch (err) {
            setError("❌ Upload failed. Please check the server logs.");
        } finally {
            setLoading(false);
        }
    };

    // ---- DERIVED OPTIONS FOR DROPDOWNS ----
    const stateOptions = Object.keys(universityData);
    const institutionTypeOptions = uniState.state ? Object.keys(universityData[uniState.state]) : [];
    const institutionOptions = (uniState.state && uniState.institutionType) ? universityData[uniState.state][uniState.institutionType] : [];
    const courseOptions = Object.keys(courseData);
    const semesterOptions = uniState.course ? Array.from({ length: courseData[uniState.course].semesters }, (_, i) => i + 1) : [];
    const subjectOptions = (uniState.course && uniState.semester && subjectData[uniState.course]) ? subjectData[uniState.course][uniState.semester] || [] : [];

    return (
        <div className="max-w-2xl mx-auto p-8 bg-gray-800 text-white rounded-xl shadow-2xl border border-gray-700">
            <h2 className="text-3xl font-bold mb-6 text-cyan-400">📤 Upload New Note</h2>
            {message && <p className="mb-4 text-green-400 text-center">{message}</p>}
            {error && <p className="mb-4 text-red-400 text-center">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-gray-300 mb-2 font-semibold">Material Type</label>
                    <select name="material_type" value={formData.material_type} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-700">
                        <option value="learnify_material">Learnify Material (Legacy)</option>
                        <option value="university_material">University Material</option>
                    </select>
                </div>

                {/* --- University Material Flow --- */}
                {formData.material_type === 'university_material' && (
                    <div className="space-y-6 p-4 border border-gray-600 rounded-lg">
                        <SelectInput label="State" name="state" value={uniState.state} onChange={handleUniChange} options={stateOptions} required />
                        {uniState.state && <SelectInput label="Institution Type" name="institutionType" value={uniState.institutionType} onChange={handleUniChange} options={institutionTypeOptions} required />}
                        {uniState.institutionType && <SelectInput label="Institution Name" name="institution" value={uniState.institution} onChange={handleUniChange} options={[...institutionOptions, 'Other']} required />}
                        {uniState.institution === 'Other' && <TextInput label="Specify Institution" name="otherInstitution" value={uniState.otherInstitution} onChange={handleUniChange} placeholder="Enter institution name" required />}

                        <SelectInput label="Course" name="course" value={uniState.course} onChange={handleUniChange} options={courseOptions} required />
                        {uniState.course && <SelectInput label="Semester" name="semester" value={uniState.semester} onChange={handleUniChange} options={semesterOptions} required />}
                        {uniState.semester && <SelectInput label="Subject" name="subject" value={uniState.subject} onChange={handleUniChange} options={[...subjectOptions, 'Other']} required />}
                        {uniState.subject === 'Other' && <TextInput label="Specify Subject" name="otherSubject" value={uniState.otherSubject} onChange={handleUniChange} placeholder="Enter subject name" required />}
                    </div>
                )}

                <TextInput label="Note Title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Introduction to Algorithms - Unit 1" required />

                <div>
                    <label className="block text-gray-300 mb-2 font-semibold">PDF File</label>
                    <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} required className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"/>
                </div>

                <div className="flex items-center">
                    <input type="checkbox" id="isFree" name="isFree" checked={formData.isFree} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"/>
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