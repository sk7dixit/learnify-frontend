// src/pages/ManageNotes.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const StatusBadge = ({ status }) => {
    const styles = {
        pending: 'bg-yellow-500/20 text-yellow-400',
        approved: 'bg-green-500/20 text-green-400',
        rejected: 'bg-red-500/20 text-red-400',
    };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-500/20 text-gray-400'}`}>
            {status.toUpperCase()}
        </span>
    );
};

function ManageNotes() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchAllNotes = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/all-notes');
            setNotes(response.data);
        } catch (err) {
            setError('Failed to load notes.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllNotes();
    }, []);

    const handleDelete = async (noteId) => {
        if (!window.confirm("Are you sure you want to permanently delete this note? This action cannot be undone.")) {
            return;
        }
        try {
            await api.delete(`/notes/${noteId}`);
            // Refresh the list after deletion
            fetchAllNotes();
        } catch (err) {
            alert("Failed to delete the note.");
        }
    };

    const formatDate = (dateString) => new Date(dateString).toLocaleString();

    if (loading) return <p>Loading all notes...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="w-full">
            <h1 className="text-4xl font-bold text-cyan-400 mb-8">Manage All Notes</h1>

            {notes.length > 0 ? (
                <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="py-3 px-4 text-left font-semibold">Title</th>
                                <th className="py-3 px-4 text-left font-semibold">Uploaded by</th>
                                <th className="py-3 px-4 text-left font-semibold">Status</th>
                                <th className="py-3 px-4 text-left font-semibold">Date</th>
                                <th className="py-3 px-4 text-left font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {notes.map(note => (
                                <tr key={note.id} className="hover:bg-gray-700/50">
                                    <td className="py-3 px-4">{note.title}</td>
                                    <td className="py-3 px-4 text-gray-400">{note.username}</td>
                                    <td className="py-3 px-4"><StatusBadge status={note.approval_status} /></td>
                                    <td className="py-3 px-4 text-gray-400">{formatDate(note.created_at)}</td>
                                    <td className="py-3 px-4 flex space-x-2">
                                        <button onClick={() => navigate(`/edit-note/${note.id}`)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded">Edit</button>
                                        <button onClick={() => handleDelete(note.id)} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-400">No notes have been uploaded to the platform yet.</p>
            )}
        </div>
    );
}

export default ManageNotes;