// src/pages/MyNotes.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import api from '../services/api';

const formatDate = (dateString) => new Date(dateString).toLocaleString();

const StatusBadge = ({ status }) => {
    const styles = {
        pending: 'bg-yellow-500/20 text-yellow-400',
        approved: 'bg-green-500/20 text-green-400',
        rejected: 'bg-red-500/20 text-red-400',
    };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
            {status.toUpperCase()}
        </span>
    );
};

function MyNotes() {
    const [notes, setNotes] = useState([]);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Initialize navigate

    const fetchMyNotes = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await api.get('/notes/my-notes');
            setNotes(response.data);
        } catch (err) {
            console.error("Failed to fetch my notes:", err);
            setError('Failed to load your notes. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyNotes();
    }, []);

    const handleSelect = (id) => {
        const newSelectedIds = new Set(selectedIds);
        if (newSelectedIds.has(id)) {
            newSelectedIds.delete(id);
        } else {
            newSelectedIds.add(id);
        }
        setSelectedIds(newSelectedIds);
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(new Set(notes.map(n => n.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.size === 0) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} notes? This cannot be undone.`)) return;

        try {
            await api.delete('/notes/my-notes', { data: { noteIds: Array.from(selectedIds) } });
            setSelectedIds(new Set());
            fetchMyNotes(); // Refresh the list
        } catch (err) {
            alert('Failed to delete notes. Please try again.');
        }
    };

    if (loading) {
        return <p className="text-center text-gray-400">Loading your notes...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500">{error}</p>;
    }

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-cyan-400">My Notes</h1>
                {notes.length > 0 && selectedIds.size > 0 && (
                    <button onClick={handleDeleteSelected} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
                        Delete Selected ({selectedIds.size})
                    </button>
                )}
            </div>

            {notes.length > 0 ? (
                <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="p-4 text-left"><input type="checkbox" onChange={handleSelectAll} /></th>
                                <th className="py-3 px-4 text-left font-semibold">Title</th>
                                <th className="py-3 px-4 text-left font-semibold">Status</th>
                                <th className="py-3 px-4 text-left font-semibold">Date Uploaded</th>
                                <th className="py-3 px-4 text-left font-semibold">Actions</th> {/* New Column */}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {notes.map(note => (
                                <tr key={note.id} className="hover:bg-gray-700/50">
                                    <td className="p-4"><input type="checkbox" checked={selectedIds.has(note.id)} onChange={() => handleSelect(note.id)} /></td>
                                    <td className="py-3 px-4">{note.title}</td>
                                    <td className="py-3 px-4"><StatusBadge status={note.approval_status} /></td>
                                    <td className="py-3 px-4 text-gray-400">{formatDate(note.created_at)}</td>
                                    {/* --- THIS IS THE NEW "VIEW" BUTTON --- */}
                                    <td className="py-3 px-4">
                                        <button
                                            onClick={() => navigate(`/notes/view/${note.id}`)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-center text-gray-400">You have not uploaded any notes yet.</p>
            )}
        </div>
    );
}

export default MyNotes;