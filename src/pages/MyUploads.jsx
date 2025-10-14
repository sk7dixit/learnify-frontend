import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { universityData, courseData, subjectData } from '../services/universityData';

// Reusable input components
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

// Personal Note Form
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
            <TextInput
                label="Note Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., My Personal C++ Notes"
                required
            />
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

// University Note Form
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

function MyUploads() {
    const { refreshUser } = useAuth();
    const [uploadType, setUploadType] = useState("personal_material");
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({ title: "", field: "", course: "", subject: "" });
    const [uniState, setUniState] = useState({
        state: "",
        institutionType: "",
        institution: "",
        otherInstitution: "",
        course: "",
        semester: "",
        subject: "",
        otherSubject: ""
    });

    const handlePersonalChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const updated = { ...prev, [name]: value };
            if (name === "field") {
                updated.course = "";
                updated.subject = "";
            }
            if (name === "course") {
                updated.subject = "";
            }
            return updated;
        });
    };

    const handleUniChange = (e) => {
        const { name, value } = e.target;
        setUniState((prev) => {
            const newState = { ...prev, [name]: value };
            if (name === "state") {
                newState.institutionType = "";
                newState.institution = "";
                newState.otherInstitution = "";
            }
            if (name === "institutionType") {
                newState.institution = "";
                newState.otherInstitution = "";
            }
            if (name === "course") {
                newState.semester = "";
                newState.subject = "";
                newState.otherSubject = "";
            }
            if (name === "semester") {
                newState.subject = "";
                newState.otherSubject = "";
            }
            return newState;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError("Please select a PDF file to upload.");
            return;
        }
        setLoading(true);
        setMessage("");
        setError("");

        const data = new FormData();
        data.append("file", file);
        data.append("material_type", uploadType);

        if (uploadType === "university_material") {
            data.append("title", formData.title);
            data.append(
                "university_name",
                uniState.institution === "Other" ? uniState.otherInstitution : uniState.institution
            );
            data.append("course", uniState.course);
            data.append(
                "subject",
                uniState.subject === "Other"
                    ? uniState.otherSubject
                    : uniState.subject + ` (Sem ${uniState.semester})`
            );
        } else {
            data.append("title", formData.title);
            data.append("field", formData.field);
            data.append("course", formData.course);
            data.append("subject", formData.subject);
        }

        try {
            const response = await api.post("/notes/user-upload", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setMessage(response.data.message);
            await refreshUser();
            setFormData({ title: "", field: "", course: "", subject: "" });
            setUniState({
                state: "",
                institutionType: "",
                institution: "",
                otherInstitution: "",
                course: "",
                semester: "",
                subject: "",
                otherSubject: ""
            });
            setFile(null);
            e.target.reset();
        } catch (err) {
            setError(err.response?.data?.error || "Upload failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8 bg-gray-800 rounded-xl">
            <h1 className="text-4xl font-bold text-cyan-400 mb-4">Upload Your Note</h1>
            <p className="text-gray-400 mb-8">
                Contribute to the community! Your note will be watermarked and sent for admin approval.
            </p>

            {message && <p className="text-green-400 text-center mb-4">{message}</p>}
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-gray-300 mb-2 font-semibold">Type of Material</label>
                    <select
                        value={uploadType}
                        onChange={(e) => setUploadType(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-gray-700"
                    >
                        <option value="personal_material">Personal Note</option>
                        <option value="university_material">University/College Material</option>
                    </select>
                </div>

                {uploadType === "personal_material" ? (
                    <PersonalNoteForm formData={formData} handleChange={handlePersonalChange} />
                ) : (
                    <>
                        <TextInput
                            label="Note Title"
                            name="title"
                            value={formData.title}
                            onChange={handlePersonalChange}
                            placeholder="e.g., Data Structures - Unit 1 Notes"
                            required
                        />
                        <UniversityNoteForm uniState={uniState} handleUniChange={handleUniChange} />
                    </>
                )}

                <div>
                    <label className="block text-gray-300 mb-2 font-semibold">PDF File</label>
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setFile(e.target.files[0])}
                        required
                        className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 mt-4"
                >
                    {loading ? "Uploading..." : "Upload Note"}
                </button>
            </form>
        </div>
    );
}

export default MyUploads;
