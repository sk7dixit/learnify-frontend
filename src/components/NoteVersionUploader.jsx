// src/components/NoteVersionUploader.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UploadCloud, FileText, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

// Assumed utility to generate thumbnail (as seen in UploadNotes.jsx)
const generateThumbnail = async (file) => {
    // NOTE: This implementation relies on react-pdf/pdfjs being configured globally
    return new Promise((resolve) => {
        const fileReader = new FileReader();
        fileReader.onload = async function () {
            try {
                const { pdfjs } = await import('react-pdf');
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
                resolve(null); // Fallback to no thumbnail
            }
        };
        fileReader.readAsArrayBuffer(file);
    });
};


export default function NoteVersionUploader({ noteId, currentTitle }) {
    const { user } = useAuth();
    const [myNotes, setMyNotes] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);

    // File state: {file, title, preview}
    const [fileToUpload, setFileToUpload] = useState(null);
    const [newTitle, setNewTitle] = useState(currentTitle);

    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState({ message: '', error: '' });


    // --- 1. Fetch User's Approved Notes ---
    useEffect(() => {
        const fetchNotes = async () => {
            try {
                // Fetch only notes where the user is the owner and status is 'approved' (can be updated)
                const res = await api.get('/notes/my-notes');
                // Filter client-side to only include approved notes
                const approvedNotes = res.data.filter(n => n.approval_status === 'approved');
                setMyNotes(approvedNotes);

                // If a specific noteId is passed (e.g., from EditNote page), pre-select it
                if (noteId) {
                    const preselected = approvedNotes.find(n => n.id === parseInt(noteId));
                    if (preselected) {
                        setSelectedNote(preselected.id);
                        setNewTitle(preselected.title);
                    }
                }
            } catch (err) {
                setFeedback(prev => ({ ...prev, error: "Failed to load approved notes for version update." }));
            }
        };
        fetchNotes();
    }, [noteId]);

    // --- 2. Dropzone Handler ---
    const onDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        if (file.type !== "application/pdf") {
            setFeedback(prev => ({ ...prev, error: `❌ ${file.name} is not a PDF` }));
            return;
        }

        setFeedback({ message: '', error: '' });
        const thumbnail = await generateThumbnail(file);

        setFileToUpload({
            file,
            preview: thumbnail,
        });
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "application/pdf": [] },
        maxFiles: 1
    });

    // --- 3. Submission Handler ---
    const handleSubmit = async () => {
        if (!selectedNote || !fileToUpload) {
            setFeedback(prev => ({ ...prev, error: "Please select an existing note and a new PDF file." }));
            return;
        }
        if (!newTitle.trim()) {
            setFeedback(prev => ({ ...prev, error: "New version must have a title." }));
            return;
        }

        setLoading(true);
        setFeedback({ message: '', error: '' });

        const data = new FormData();
        data.append("file", fileToUpload.file);
        data.append("newTitle", newTitle.trim());

        try {
            // New endpoint: POST /notes/:noteId/version
            const res = await api.post(`/notes/${selectedNote}/version`, data, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setFeedback({ message: res.data.message || "🎉 New version submitted for review!", error: '' });
            setFileToUpload(null);

        } catch (err) {
            const errorMsg = err.response?.data?.error || "Version submission failed. Check console for details.";
            setFeedback({ message: '', error: `❌ ${errorMsg}` });
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // If component is used on a page not tied to a note, show the full selector
    const showNoteSelector = !noteId;

    // Update title state when the note selection changes (only if noteId isn't fixed)
    useEffect(() => {
        if (showNoteSelector) {
            const currentNote = myNotes.find(n => n.id === parseInt(selectedNote));
            if (currentNote) {
                setNewTitle(currentNote.title);
            } else {
                setNewTitle('');
            }
        }
    }, [selectedNote, showNoteSelector, myNotes]);


    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg space-y-6">
            <h2 className="text-2xl font-bold text-cyan-400">Upload New Version</h2>
            <p className="text-sm text-gray-400">Submit a replacement file for an existing note. The new version will be reviewed by an admin.</p>

            {feedback.message && <div className="p-3 bg-green-800/50 text-green-300 rounded-lg font-semibold">{feedback.message}</div>}
            {feedback.error && <div className="p-3 bg-red-800/50 text-red-300 rounded-lg font-semibold">{feedback.error}</div>}

            {/* 1. Note Selector (Only shown if not fixed by parent page) */}
            {showNoteSelector && (
                <div>
                    <label className="block text-gray-400 mb-2">Select Note to Update</label>
                    <select
                        value={selectedNote || ''}
                        onChange={(e) => setSelectedNote(parseInt(e.target.value))}
                        disabled={loading || myNotes.length === 0}
                        className="w-full p-3 bg-gray-700 rounded-lg"
                    >
                        <option value="">-- Select Approved Note --</option>
                        {myNotes.map(n => (
                            <option key={n.id} value={n.id}>
                                {n.title} (ID: {n.id})
                            </option>
                        ))}
                    </select>
                    {myNotes.length === 0 && <p className="text-xs text-yellow-400 mt-2">You have no approved notes to update.</p>}
                </div>
            )}

            {/* 2. Title Input */}
            {selectedNote && (
                 <div>
                    <label className="block text-gray-400 mb-2">New Title</label>
                    <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Title for the new version"
                        required
                        className="w-full p-3 bg-gray-700 rounded-lg"
                        disabled={loading}
                    />
                </div>
            )}

            {/* 3. File Input (Dropzone) */}
            {selectedNote && (
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        isDragActive ? "border-cyan-400 bg-gray-700" : "border-gray-600 hover:border-gray-500"
                    }`}
                >
                    <input {...getInputProps()} />
                    <UploadCloud className="w-8 h-8 mx-auto text-cyan-400 mb-2" />
                    <p className="text-sm font-semibold">Drop the new PDF file here, or click to select (Max 20MB)</p>
                </div>
            )}

            {/* 4. File Preview */}
            {fileToUpload && (
                <div className="flex items-center gap-4 bg-gray-900 p-3 rounded-lg border border-gray-700">
                    <div className="w-12 h-16 flex-shrink-0 bg-gray-700 rounded-md border flex items-center justify-center">
                        {fileToUpload.preview ? (
                            <img src={fileToUpload.preview} alt="Thumbnail" className="w-full h-full object-cover rounded-md" />
                        ) : (
                            <FileText className="w-6 h-6 text-gray-500" />
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold">{fileToUpload.file.name}</p>
                        <p className="text-xs text-gray-400">Ready to submit as new version.</p>
                    </div>
                    <button onClick={() => setFileToUpload(null)} className="text-red-400 hover:text-red-600" type="button"><X className="w-5 h-5" /></button>
                </div>
            )}


            {/* 5. Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={loading || !selectedNote || !fileToUpload}
                className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg mt-6 font-semibold transition-colors disabled:opacity-50"
            >
                {loading ? "Submitting Version..." : "Submit New Version for Approval"}
            </button>
        </div>
    );
}