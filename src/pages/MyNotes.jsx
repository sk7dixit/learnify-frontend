// src/pages/MyNotes.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'; // Import useSearchParams
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
            {status ? status.toUpperCase() : 'N/A'}
        </span>
    );
};

// --- Empty State Component (New) ---
const EmptyState = ({ onNavigate }) => (
    <div className="text-center py-16 bg-gray-800 rounded-xl border border-gray-700 shadow-xl">
        <p className="text-6xl mb-4">🚀</p>
        <h2 className="text-2xl font-bold text-gray-300 mb-4">No Uploaded Notes Found!</h2>
        <p className="text-gray-500 mb-6">Be the first to share your knowledge with the community.</p>
        <button
            onClick={() => onNavigate('/my-uploads')}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg"
        >
            Upload Your First Note
        </button>
    </div>
);


function MyNotes() {
    const [notes, setNotes] = useState([]);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // PHASE 4 FIX: Read query parameter for filtering
    const [searchParams, setSearchParams] = useSearchParams();
    const filterStatus = searchParams.get('status');

    const fetchMyNotes = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const response = await api.get('/notes/me'); // Changed to /notes/me for consistency
            setNotes(response.data);
        } catch (err) {
            console.error("Failed to fetch my notes:", err);
            setError('Failed to load your notes. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyNotes();
    }, [fetchMyNotes]);

    // Filter the notes based on the URL query parameter (for MyStats integration)
    const filteredNotes = useMemo(() => {
        if (!filterStatus) return notes;
        return notes.filter(note => note.approval_status === filterStatus);
    }, [notes, filterStatus]);

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
            setSelectedIds(new Set(filteredNotes.map(n => n.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.size === 0) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} notes? This cannot be undone.`)) return;

        try {
            // NOTE: Assuming backend endpoint is /api/notes/delete
            await api.post('/notes/delete', { noteIds: Array.from(selectedIds) });
            setSelectedIds(new Set());
            fetchMyNotes(); // Refresh the list
        } catch (err) {
            alert('Failed to delete notes. Please try again.');
        }
    };

    // Clear filter handler
    const handleClearFilter = () => {
        setSearchParams({});
    };


    if (loading) {
        return <p className="text-center text-gray-400">Loading your notes...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500">{error}</p>;
    }

    if (notes.length === 0 && !filterStatus) {
        // Show empty state only if no notes exist and no filter is actively set
        return <EmptyState onNavigate={navigate} />;
    }

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-cyan-400">
                    My Notes
                    {filterStatus && (
                        <span className="text-lg font-normal text-yellow-400 ml-3">
                            (Filtered: {filterStatus.toUpperCase()})
                        </span>
                    )}
                </h1>
                <div className="flex space-x-3 items-center">
                    {filterStatus && (
                         <button onClick={handleClearFilter} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">
                            Clear Filter
                        </button>
                    )}
                    {filteredNotes.length > 0 && selectedIds.size > 0 && (
                        <button onClick={handleDeleteSelected} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
                            Delete Selected ({selectedIds.size})
                        </button>
                    )}
                </div>
            </div>

            {filteredNotes.length > 0 ? (
                <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="p-4 text-left"><input type="checkbox" checked={selectedIds.size === filteredNotes.length && filteredNotes.length > 0} onChange={handleSelectAll} className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-900 border-gray-600 rounded" /></th>
                                <th className="py-3 px-4 text-left font-semibold">Title</th>
                                <th className="py-3 px-4 text-left font-semibold">Status</th>
                                <th className="py-3 px-4 text-left font-semibold">Date Uploaded</th>
                                <th className="py-3 px-4 text-left font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {filteredNotes.map(note => (
                                <tr key={note.id} className="hover:bg-gray-700/50">
                                    <td className="p-4"><input type="checkbox" checked={selectedIds.has(note.id)} onChange={() => handleSelect(note.id)} className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-900 border-gray-600 rounded" /></td>
                                    <td className="py-3 px-4">{note.title}</td>
                                    <td className="py-3 px-4"><StatusBadge status={note.approval_status} /></td>
                                    <td className="py-3 px-4 text-gray-400">{formatDate(note.created_at)}</td>
                                    <td className="py-3 px-4 flex space-x-2">
                                        {/* View Button */}
                                        <button
                                            onClick={() => navigate(`/notes/view/${note.id}`)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded text-sm"
                                        >
                                            View
                                        </button>

                                        {/* Edit Button (Only for pending or rejected notes) */}
                                        {(note.approval_status === 'pending' || note.approval_status === 'rejected') && (
                                            <button
                                                onClick={() => navigate(`/edit-note/${note.id}`)}
                                                className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-1 px-3 rounded text-sm"
                                            >
                                                Edit
                                            </button>
                                        )}

                                        {/* Version Button (For approved notes) */}
                                        {note.approval_status === 'approved' && (
                                            <button
                                                onClick={() => navigate(`/notes/view/${note.id}`)} // Navigate to a page with version uploader or integrate modal
                                                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-1 px-3 rounded text-sm"
                                            >
                                                New Version
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-center text-gray-400 p-6 bg-gray-800 rounded-xl">
                    No notes found under the selected filter: **{filterStatus.toUpperCase()}**.
                    {filterStatus === 'approved' && <span className='block mt-2'>Your note may be in pending review.</span>}
                </p>
            )}
        </div>
    );
}

export default MyNotes;