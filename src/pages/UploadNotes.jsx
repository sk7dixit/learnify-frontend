// src/pages/UploadNotes.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { X, FileText, UploadCloud } from "lucide-react"; // Added lucide icons
import { Document, Page, pdfjs } from "react-pdf";

// Import data from the provided universityData.js
import { universityData, courseData, subjectData } from '../services/universityData';

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;


// --- Helper Components (Imported/Adapted from MyUploads.jsx logic) ---

// Component for Personal/School Material
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

    // Note: This form should only collect metadata that applies to the entire batch
    return (
        <div className="space-y-4 p-4 border border-gray-700 rounded-lg">
            <h3 className="text-xl font-bold mb-2">Metadata (Personal)</h3>

            <div>
                <label className="block text-gray-400 mb-1">Field / Class</label>
                <select name="field" value={formData.field} onChange={handleChange} required className="w-full p-2 bg-gray-700 rounded">
                    <option value="">-- Select Field / Class --</option>
                    {legacyContent.fields.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>

            {courseOptions.length > 0 && (
                <div>
                    <label className="block text-gray-400 mb-1">Course / Degree</label>
                    <select name="course" value={formData.course} onChange={handleChange} required className="w-full p-2 bg-gray-700 rounded">
                        <option value="">-- Select Course --</option>
                        {courseOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
            )}

            {subjectOptions.length > 0 && (
                <div>
                    <label className="block text-gray-400 mb-1">Subject</label>
                    <select name="subject" value={formData.subject} onChange={handleChange} required className="w-full p-2 bg-gray-700 rounded">
                        <option value="">-- Select Subject --</option>
                        {subjectOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
            )}
        </div>
    );
};

// Component for University Material
const UniversityNoteForm = ({ uniState, handleUniChange }) => {
    const stateOptions = Object.keys(universityData);
    const institutionTypeOptions = uniState.state ? Object.keys(universityData[uniState.state]) : [];
    const institutionOptions =
        uniState.state && uniState.institutionType ? universityData[uniState.state][uniState.institutionType] : [];
    const courseOptions = Object.keys(courseData);
    const semesterOptions = uniState.course
        ? Array.from({ length: courseData[uniState.course]?.semesters || 0 }, (_, i) => i + 1)
        : [];
    const subjectOptions =
        uniState.course && uniState.semester && subjectData[uniState.course]
            ? subjectData[uniState.course][uniState.semester] || []
            : [];

    return (
        <div className="space-y-4 p-4 border border-gray-700 rounded-lg">
             <h3 className="text-xl font-bold mb-2">Metadata (University)</h3>

            <div>
                <label className="block text-gray-400 mb-1">State</label>
                <select name="state" value={uniState.state} onChange={handleUniChange} options={stateOptions} required className="w-full p-2 bg-gray-700 rounded">
                    <option value="">-- Select State --</option>
                    {stateOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>

            {uniState.state && (
                <div>
                    <label className="block text-gray-400 mb-1">Institution Type</label>
                    <select name="institutionType" value={uniState.institutionType} onChange={handleUniChange} required className="w-full p-2 bg-gray-700 rounded">
                        <option value="">-- Select Type --</option>
                        {institutionTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
            )}

            {uniState.institutionType && (
                <div>
                    <label className="block text-gray-400 mb-1">Institution Name</label>
                    <select name="institution" value={uniState.institution} onChange={handleUniChange} required className="w-full p-2 bg-gray-700 rounded">
                         <option value="">-- Select Institution --</option>
                         {[...institutionOptions, "Other"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
            )}

            {uniState.institution === "Other" && (
                 <div>
                    <label className="block text-gray-400 mb-1">Specify Institution</label>
                    <input type="text" name="otherInstitution" value={uniState.otherInstitution} onChange={handleUniChange} placeholder="Enter institution name" required className="w-full p-2 bg-gray-700 rounded" />
                 </div>
            )}

            <div>
                 <label className="block text-gray-400 mb-1">Course</label>
                 <select name="course" value={uniState.course} onChange={handleUniChange} required className="w-full p-2 bg-gray-700 rounded">
                      <option value="">-- Select Course --</option>
                      {courseOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                 </select>
            </div>

            {uniState.course && (
                <div>
                    <label className="block text-gray-400 mb-1">Semester</label>
                    <select name="semester" value={uniState.semester} onChange={handleUniChange} required className="w-full p-2 bg-gray-700 rounded">
                        <option value="">-- Select Semester --</option>
                        {semesterOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
            )}

            {uniState.semester && (
                <div>
                    <label className="block text-gray-400 mb-1">Subject</label>
                    <select name="subject" value={uniState.subject} onChange={handleUniChange} required className="w-full p-2 bg-gray-700 rounded">
                        <option value="">-- Select Subject --</option>
                        {[...subjectOptions, "Other"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
            )}

            {uniState.subject === "Other" && (
                 <div>
                    <label className="block text-gray-400 mb-1">Specify Subject</label>
                    <input type="text" name="otherSubject" value={uniState.otherSubject} onChange={handleUniChange} placeholder="Enter subject name" required className="w-full p-2 bg-gray-700 rounded" />
                 </div>
            )}
        </div>
    );
};
// --- End Helper Components ---


export default function UploadNotes() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState({ message: '', error: '' });

  // Files state: {id, file, title, preview}
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Metadata State
  const [materialType, setMaterialType] = useState("personal_material");
  const [formData, setFormData] = useState({ field: "", course: "", subject: "" });
  const [uniState, setUniState] = useState({
      state: "", institutionType: "", institution: "", otherInstitution: "",
      course: "", semester: "", subject: "", otherSubject: ""
  });

  // --- Metadata Handlers ---
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
        // Reset dependent fields on primary changes
        if (name === "state") { newState.institutionType = ""; newState.institution = ""; newState.otherInstitution = ""; }
        if (name === "institutionType") { newState.institution = ""; newState.otherInstitution = ""; }
        if (name === "course") { newState.semester = ""; newState.subject = ""; newState.otherSubject = ""; }
        if (name === "semester") { newState.subject = ""; newState.otherSubject = ""; }
        if (name === "institution" && value !== "Other") { newState.otherInstitution = ""; }
        if (name === "subject" && value !== "Other") { newState.otherSubject = ""; }
        return newState;
    });
  };

  // --- File Logic ---
  const generateThumbnail = async (file) => {
    // Uses react-pdf/pdfjs for thumbnail generation (same as existing logic)
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = async function () {
        try {
          const typedArray = new Uint8Array(this.result);
          const pdf = await pdfjs.getDocument({ data: typedArray }).promise;
          const page = await pdf.getPage(1);

          const viewport = page.getViewport({ scale: 0.3 });
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({ canvasContext: ctx, viewport }).promise;
          resolve(canvas.toDataURL());
        } catch (e) {
          // If thumbnail generation fails, provide a fallback icon
          resolve(null);
        }
      };
      fileReader.onerror = reject;
      fileReader.readAsArrayBuffer(file);
    });
  };

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (files.length + acceptedFiles.length > 10) {
        setFeedback(prev => ({ ...prev, error: "❌ Maximum 10 PDFs allowed per upload." }));
        return;
      }

      const processedFiles = [];
      setFeedback({ message: '', error: '' });

      for (const file of acceptedFiles) {
        if (file.type !== "application/pdf") {
          setFeedback(prev => ({ ...prev, error: `❌ ${file.name} is not a PDF` }));
          continue;
        }

        const thumbnail = await generateThumbnail(file);

        processedFiles.push({
          id: Date.now() + Math.random(), // Unique ID
          file,
          title: file.name.replace(/\.[^/.]+$/, ''),
          preview: thumbnail,
        });
      }

      setFiles((prev) => [...prev, ...processedFiles]);
    },
    [files]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [] },
    maxSize: 20 * 1024 * 1024, // 20MB per file (as set in backend config)
  });

  const removeFile = (id) => {
    setFiles(files.filter((f) => f.id !== id));
  };

  const handleTitleChange = (id, newTitle) => {
    setFiles(prevList => prevList.map(item =>
        item.id === id ? { ...item, title: newTitle } : item
    ));
  };


  // --- Final Submission ---
  const handleUpload = async () => {
    if (files.length === 0) {
      setFeedback(prev => ({ ...prev, error: "Please select at least one PDF." }));
      return;
    }
    if (files.some(f => f.title.trim() === '')) {
      setFeedback(prev => ({ ...prev, error: "All files must have a title." }));
      return;
    }
    // Basic validation based on selected material type
    if (materialType === 'personal_material' && (!formData.subject || !formData.course)) {
       setFeedback(prev => ({ ...prev, error: "Please select Course and Subject for Personal Material." }));
       return;
    }
    // Add similar validation for uniState if necessary

    const data = new FormData();
    data.append("material_type", materialType);

    // Append metadata
    if (materialType === 'university_material') {
        const universityName = uniState.institution === 'Other' ? uniState.otherInstitution : uniState.institution;
        const subject = uniState.subject === 'Other' ? uniState.otherSubject : (uniState.subject + (uniState.semester ? ` (Sem ${uniState.semester})` : ''));

        data.append("university_name", universityName);
        data.append("course", uniState.course);
        data.append("subject", subject);
        data.append("semester", uniState.semester || '');
    } else {
        data.append("field", formData.field);
        data.append("course", formData.course);
        data.append("subject", formData.subject);
    }


    // Append files and titles
    files.forEach((f) => {
      data.append("files[]", f.file);
      data.append("titles[]", f.title);
    });

    try {
      setUploading(true);
      setFeedback({ message: '', error: '' });

      const res = await api.post("/notes/multi-upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFeedback({ message: res.data.message || "🎉 Upload successful!", error: '' });
      setFiles([]);
      // Reset metadata fields
      setFormData({ field: "", course: "", subject: "" });
      setUniState({ state: "", institutionType: "", institution: "", otherInstitution: "", course: "", semester: "", subject: "", otherSubject: "" });

    } catch (err) {
      const errorMsg = err.response?.data?.error || "Upload failed. Check console/server logs.";
      setFeedback({ message: '', error: `❌ ${errorMsg}` });
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const isMetadataComplete = () => {
    if (materialType === 'personal_material') {
        return formData.field && formData.course && formData.subject;
    }
    if (materialType === 'university_material') {
        return uniState.state && uniState.institutionType && uniState.institution && uniState.course && uniState.semester && uniState.subject;
    }
    return false;
  };


  return (
    <div className="max-w-4xl mx-auto p-4 text-white">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">
        Batch Upload Your Notes (Phase 2 Upgrade)
      </h1>

      {feedback.message && <div className="p-3 mb-4 bg-green-800/50 text-green-300 rounded-lg font-semibold">{feedback.message}</div>}
      {feedback.error && <div className="p-3 mb-4 bg-red-800/50 text-red-300 rounded-lg font-semibold">{feedback.error}</div>}


      {/* 1. METADATA SECTION */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-8 space-y-6">
          <div className="flex items-center space-x-3 mb-4">
            <label className="block text-xl font-semibold">Material Type:</label>
            <select
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value)}
              className="p-2 bg-gray-700 rounded"
            >
              <option value="personal_material">Personal/School Note</option>
              <option value="university_material">University/College Material</option>
            </select>
          </div>

          {materialType === "personal_material" ? (
              <PersonalNoteForm formData={formData} handleChange={handlePersonalChange} />
          ) : (
              <UniversityNoteForm uniState={uniState} handleUniChange={handleUniChange} />
          )}
      </div>


      {/* 2. FILE DRAG DROP AREA */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
           <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? "border-cyan-400 bg-gray-700" : "border-gray-600 hover:border-gray-500"
              }`}
            >
              <input {...getInputProps()} />
              <UploadCloud className="w-10 h-10 mx-auto text-cyan-400 mb-3" />
              {isDragActive ? (
                  <p className="font-semibold">Drop PDFs here...</p>
              ) : (
                  <p className="font-semibold">Drag & drop PDF files here, or click to select (Max 10 files, 20MB each)</p>
              )}
          </div>
      </div>

      {/* 3. FILE PREVIEWS & TITLE EDITOR */}
      {files.length > 0 && (
          <div className="mt-6 space-y-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h3 className="text-xl font-bold">Files to be uploaded ({files.length})</h3>
              {files.map((f) => (
                  <div
                      key={f.id}
                      className="flex items-center gap-4 bg-gray-900 p-3 rounded-lg border border-gray-700"
                  >
                      <div className="w-16 h-20 flex-shrink-0 bg-gray-700 rounded-md border flex items-center justify-center">
                          {f.preview ? (
                              <img src={f.preview} alt="Thumbnail" className="w-full h-full object-cover rounded-md" />
                          ) : (
                              <FileText className="w-8 h-8 text-gray-500" />
                          )}
                      </div>

                      <div className="flex-1">
                          <label className="block text-xs text-gray-400 mb-1">Title (Per File)</label>
                          <input
                              type="text"
                              value={f.title}
                              onChange={(e) => handleTitleChange(f.id, e.target.value)}
                              placeholder="Enter title for this note"
                              className="w-full p-2 bg-gray-700 rounded text-sm"
                          />
                          <p className="text-xs text-gray-500 mt-1 truncate">{f.file.name}</p>
                      </div>

                      <button
                          onClick={() => removeFile(f.id)}
                          className="text-red-400 hover:text-red-600 flex-shrink-0"
                          type="button"
                      >
                          <X className="w-5 h-5" />
                      </button>
                  </div>
              ))}
          </div>
      )}

      {/* 4. Upload button */}
      <button
        onClick={handleUpload}
        disabled={uploading || files.length === 0 || !isMetadataComplete()}
        className="w-full bg-cyan-600 hover:bg-cyan-700 p-3 rounded-lg mt-6 font-semibold transition-colors disabled:opacity-50"
      >
        {uploading ? `Uploading ${files.length} Files...` : `Upload ${files.length || ''} Notes`}
      </button>
    </div>
  );
}