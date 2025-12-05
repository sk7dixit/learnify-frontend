// src/pages/UploadNotes.jsx
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { X, FileText, UploadCloud, CheckCircle, AlertCircle, BookOpen, GraduationCap, Layers } from "lucide-react";
import { pdfjs } from "react-pdf";
import { universityData, courseData, subjectData } from '../services/universityData';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

// --- Helper Components ---

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
    <div className="space-y-4 animate-fade-in-up">
      <Select
        label="Field / Class"
        name="field"
        value={formData.field}
        onChange={handleChange}
        options={legacyContent.fields}
        placeholder="Select Field"
        required
      />

      {courseOptions.length > 0 && (
        <Select
          label="Course / Degree"
          name="course"
          value={formData.course}
          onChange={handleChange}
          options={courseOptions}
          placeholder="Select Course"
          required
        />
      )}

      {subjectOptions.length > 0 && (
        <Select
          label="Subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          options={subjectOptions}
          placeholder="Select Subject"
          required
        />
      )}
    </div>
  );
};

const UniversityNoteForm = ({ uniState, handleUniChange }) => {
  const stateOptions = Object.keys(universityData);
  const institutionTypeOptions = uniState.state ? Object.keys(universityData[uniState.state]) : [];
  const institutionOptions = uniState.state && uniState.institutionType ? universityData[uniState.state][uniState.institutionType] : [];
  const courseOptions = Object.keys(courseData);
  const semesterOptions = uniState.course
    ? Array.from({ length: courseData[uniState.course]?.semesters || 0 }, (_, i) => i + 1)
    : [];
  const subjectOptions = uniState.course && uniState.semester && subjectData[uniState.course]
    ? subjectData[uniState.course][uniState.semester] || []
    : [];

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="State"
          name="state"
          value={uniState.state}
          onChange={handleUniChange}
          options={stateOptions}
          placeholder="Select State"
          required
        />

        {uniState.state && (
          <Select
            label="Institution Type"
            name="institutionType"
            value={uniState.institutionType}
            onChange={handleUniChange}
            options={institutionTypeOptions}
            placeholder="Select Type"
            required
          />
        )}
      </div>

      {uniState.institutionType && (
        <Select
          label="Institution Name"
          name="institution"
          value={uniState.institution}
          onChange={handleUniChange}
          options={[...institutionOptions, "Other"]}
          placeholder="Select Institution"
          required
        />
      )}

      {uniState.institution === "Other" && (
        <Input
          label="Specify Institution"
          name="otherInstitution"
          value={uniState.otherInstitution}
          onChange={handleUniChange}
          placeholder="Enter institution name"
          required
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Course"
          name="course"
          value={uniState.course}
          onChange={handleUniChange}
          options={courseOptions}
          placeholder="Select Course"
          required
        />

        {uniState.course && (
          <Select
            label="Semester"
            name="semester"
            value={uniState.semester}
            onChange={handleUniChange}
            options={semesterOptions}
            placeholder="Select Semester"
            required
          />
        )}
      </div>

      {uniState.semester && (
        <Select
          label="Subject"
          name="subject"
          value={uniState.subject}
          onChange={handleUniChange}
          options={[...subjectOptions, "Other"]}
          placeholder="Select Subject"
          required
        />
      )}

      {uniState.subject === "Other" && (
        <Input
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

export default function UploadNotes() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState({ message: '', error: '' });
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [materialType, setMaterialType] = useState("personal_material");
  const [formData, setFormData] = useState({ field: "", course: "", subject: "" });
  const [uniState, setUniState] = useState({
    state: "", institutionType: "", institution: "", otherInstitution: "",
    course: "", semester: "", subject: "", otherSubject: ""
  });

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
      if (name === "institution" && value !== "Other") { newState.otherInstitution = ""; }
      if (name === "subject" && value !== "Other") { newState.otherSubject = ""; }
      return newState;
    });
  };

  const generateThumbnail = async (file) => {
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
        const preview = await generateThumbnail(file);
        processedFiles.push({
          file,
          preview,
          title: file.name.replace('.pdf', ''),
          isFree: false
        });
      }

      setFiles(prev => [...prev, ...processedFiles]);
    },
    [files]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 20 * 1024 * 1024, // 20MB
  });

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (index, field, value) => {
    setFiles(prev => prev.map((f, i) => i === index ? { ...f, [field]: value } : f));
  };

  const isMetadataComplete = () => {
    if (materialType === 'personal_material') {
      return formData.field && formData.course && formData.subject;
    } else {
      return uniState.state && uniState.institutionType && uniState.institution && uniState.course && uniState.semester && uniState.subject;
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    if (!isMetadataComplete()) {
      setFeedback({ error: 'Please complete all selection fields.', message: '' });
      return;
    }

    setUploading(true);
    setFeedback({ message: '', error: '' });

    const data = new FormData();

    // Append Global Metadata
    data.append('material_type', materialType);
    if (materialType === 'personal_material') {
      data.append('field', formData.field);
      data.append('course', formData.course);
      data.append('subject', formData.subject);
    } else {
      data.append('university_name', uniState.institution === 'Other' ? uniState.otherInstitution : uniState.institution);
      data.append('course', uniState.course);
      data.append('subject', uniState.subject === 'Other' ? uniState.otherSubject : uniState.subject);
    }

    // Append Files and Per-File Metadata
    files.forEach((f) => {
      data.append('files', f.file);
      data.append('titles', f.title);
      data.append('is_free', f.isFree);
      // Note: We are sending arrays for titles and is_free.
      // The backend handleMultiUpload expects these to match the files array index.
    });

    try {
      const res = await api.post("/notes/multi-upload", data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFeedback({ message: `✅ ${res.data.message}`, error: '' });
      setFiles([]);
    } catch (err) {
      console.error(err);
      setFeedback({ error: err.response?.data?.error || "❌ Upload failed", message: '' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 animate-fade-in">
            Share Your Knowledge
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto animate-fade-in delay-100">
            Upload your notes and help students across the platform. Earn badges and recognition for your contributions.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Metadata Selection */}
          <div className="lg:col-span-1 space-y-6">
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <BookOpen className="text-cyan-400" size={20} />
                Note Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Material Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setMaterialType("personal_material")}
                      className={`p-3 rounded-lg border transition-all duration-200 flex flex-col items-center gap-2 ${materialType === "personal_material"
                          ? "bg-cyan-500/20 border-cyan-500 text-white"
                          : "bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800"
                        }`}
                    >
                      <Layers size={20} />
                      <span className="text-sm">Personal</span>
                    </button>
                    <button
                      onClick={() => setMaterialType("university_material")}
                      className={`p-3 rounded-lg border transition-all duration-200 flex flex-col items-center gap-2 ${materialType === "university_material"
                          ? "bg-blue-500/20 border-blue-500 text-white"
                          : "bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800"
                        }`}
                    >
                      <GraduationCap size={20} />
                      <span className="text-sm">University</span>
                    </button>
                  </div>
                </div>

                {materialType === "personal_material" ? (
                  <PersonalNoteForm formData={formData} handleChange={handlePersonalChange} />
                ) : (
                  <UniversityNoteForm uniState={uniState} handleUniChange={handleUniChange} />
                )}
              </div>
            </GlassCard>
          </div>

          {/* Right Column: Upload Area & File List */}
          <div className="lg:col-span-2 space-y-6">

            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`relative group border-2 border-dashed rounded-2xl p-8 transition-all duration-300 cursor-pointer text-center overflow-hidden ${isDragActive
                  ? "border-cyan-400 bg-cyan-400/10"
                  : "border-gray-700 hover:border-cyan-500/50 hover:bg-gray-800/50"
                }`}
            >
              <input {...getInputProps()} />
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className={`p-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400 group-hover:scale-110 transition-transform duration-300`}>
                  <UploadCloud size={40} />
                </div>
                <div>
                  <p className="text-xl font-medium text-white group-hover:text-cyan-400 transition-colors">
                    {isDragActive ? "Drop files here" : "Drag & drop PDFs here"}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">or click to browse</p>
                </div>
                <p className="text-xs text-gray-500">Max 10 files, 20MB each</p>
              </div>
            </div>

            {/* Feedback Messages */}
            {feedback.error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 animate-fade-in">
                <AlertCircle size={20} />
                {feedback.error}
              </div>
            )}
            {feedback.message && (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 flex items-center gap-3 animate-fade-in">
                <CheckCircle size={20} />
                {feedback.message}
              </div>
            )}

            {/* Selected Files List */}
            {files.length > 0 && (
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
                  <span>Selected Files ({files.length})</span>
                  <button onClick={() => setFiles([])} className="text-xs text-red-400 hover:text-red-300">Clear All</button>
                </h3>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-start gap-4 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 transition-colors group">
                      {/* Thumbnail */}
                      <div className="w-16 h-20 bg-gray-900 rounded-md overflow-hidden flex-shrink-0 border border-gray-700">
                        {file.preview ? (
                          <img src={file.preview} alt="Preview" className="w-full h-full object-cover opacity-80" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600">
                            <FileText size={24} />
                          </div>
                        )}
                      </div>

                      {/* File Details */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <Input
                            value={file.title}
                            onChange={(e) => handleFileChange(index, 'title', e.target.value)}
                            placeholder="Note Title"
                            className="h-8 text-sm bg-gray-900/50 border-gray-700 focus:border-cyan-500"
                          />
                          <button
                            onClick={() => removeFile(index)}
                            className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 truncate max-w-[150px]">{file.file.name}</span>
                          <label className="flex items-center gap-2 cursor-pointer group/check">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${file.isFree ? 'bg-cyan-500 border-cyan-500' : 'border-gray-600 bg-gray-900'}`}>
                              {file.isFree && <CheckCircle size={12} className="text-white" />}
                            </div>
                            <input
                              type="checkbox"
                              checked={file.isFree}
                              onChange={(e) => handleFileChange(index, 'isFree', e.target.checked)}
                              className="hidden"
                            />
                            <span className="text-xs text-gray-400 group-hover/check:text-gray-300">Free?</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700/50">
                  <Button
                    onClick={handleUpload}
                    disabled={uploading || files.length === 0 || !isMetadataComplete()}
                    isLoading={uploading}
                    className="w-full"
                  >
                    {uploading ? 'Uploading...' : 'Upload All Notes'}
                  </Button>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}