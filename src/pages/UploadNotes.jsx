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

        const thumbnail = await generateThumbnail(file);

        processedFiles.push({
          id: Date.now() + Math.random(),
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
    maxSize: 20 * 1024 * 1024,
  });

  const removeFile = (id) => {
    setFiles(files.filter((f) => f.id !== id));
  };

  const handleTitleChange = (id, newTitle) => {
    setFiles(prevList => prevList.map(item =>
      item.id === id ? { ...item, title: newTitle } : item
    ));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setFeedback(prev => ({ ...prev, error: "Please select at least one PDF." }));
      return;
    }
    if (files.some(f => f.title.trim() === '')) {
      setFeedback(prev => ({ ...prev, error: "All files must have a title." }));
      return;
    }
    if (materialType === 'personal_material' && (!formData.subject || !formData.course)) {
      setFeedback(prev => ({ ...prev, error: "Please select Course and Subject for Personal Material." }));
      return;
    }

    const data = new FormData();
    data.append("material_type", materialType);

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
    <div className="min-h-screen p-4 md:p-8 relative">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
            Upload Your Notes
          </h1>
          <p className="text-slate-400">Share your knowledge with the community</p>
        </div>

        {feedback.message && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-2 animate-fade-in-up">
            <CheckCircle size={20} />
            <span>{feedback.message}</span>
          </div>
        )}
        {feedback.error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2 animate-fade-in-up">
            <AlertCircle size={20} />
            <span>{feedback.error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Metadata */}
          <div className="lg:col-span-1 space-y-6">
            <GlassCard className="h-full">
              <div className="flex items-center gap-2 mb-6 text-cyan-400">
                <BookOpen size={24} />
                <h2 className="text-xl font-semibold">Note Details</h2>
              </div>

              <div className="space-y-6">
                <Select
                  label="Material Type"
                  value={materialType}
                  onChange={(e) => setMaterialType(e.target.value)}
                  options={[
                    { value: "personal_material", label: "Personal / School" },
                    { value: "university_material", label: "University / College" }
                  ]}
                />

                <div className="pt-4 border-t border-slate-700/50">
                  {materialType === "personal_material" ? (
                    <PersonalNoteForm formData={formData} handleChange={handlePersonalChange} />
                  ) : (
                    <UniversityNoteForm uniState={uniState} handleUniChange={handleUniChange} />
                  )}
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Right Column: Upload Area */}
          <div className="lg:col-span-2 space-y-6">
            <GlassCard>
              <div className="flex items-center gap-2 mb-6 text-cyan-400">
                <Layers size={24} />
                <h2 className="text-xl font-semibold">Files</h2>
              </div>

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 ${isDragActive
                    ? "border-cyan-400 bg-cyan-400/10 scale-[1.02]"
                    : "border-slate-600 hover:border-cyan-400/50 hover:bg-slate-800/50"
                  }`}
              >
                <input {...getInputProps()} />
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 text-cyan-400 shadow-lg">
                  <UploadCloud size={32} />
                </div>
                {isDragActive ? (
                  <p className="font-semibold text-cyan-300">Drop PDFs here...</p>
                ) : (
                  <div>
                    <p className="font-semibold text-slate-200 text-lg">Click or Drag & Drop PDFs</p>
                    <p className="text-slate-400 text-sm mt-2">Max 10 files, up to 20MB each</p>
                  </div>
                )}
              </div>
            </GlassCard>

            {files.length > 0 && (
              <GlassCard className="animate-fade-in-up">
                <h3 className="text-lg font-semibold mb-4 text-slate-200">Selected Files ({files.length})</h3>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {files.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-start gap-4 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 hover:border-cyan-500/30 transition-colors group"
                    >
                      <div className="w-16 h-20 flex-shrink-0 bg-slate-900 rounded-lg border border-slate-700 overflow-hidden flex items-center justify-center relative">
                        {f.preview ? (
                          <img src={f.preview} alt="Thumbnail" className="w-full h-full object-cover" />
                        ) : (
                          <FileText className="w-8 h-8 text-slate-600" />
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      </div>

                      <div className="flex-1 min-w-0 pt-1">
                        <Input
                          value={f.title}
                          onChange={(e) => handleTitleChange(f.id, e.target.value)}
                          placeholder="Enter title for this note"
                          className="py-2 text-sm mb-1"
                        />
                        <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                          <FileText size={12} /> {f.file.name}
                        </p>
                      </div>

                      <button
                        onClick={() => removeFile(f.id)}
                        className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                        type="button"
                      >
                        <X size={18} />
                      </button>
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