// src/pages/UserSubmissions.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const formatDate = (dateString) => new Date(dateString).toLocaleString();

function UserSubmissions() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            // **THE FIX IS HERE: The URL prefix is now '/admin'.**
            const response = await api.get('/admin/user-submissions');
            setNotes(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const handleDelete = async (noteId) => {
        if (!window.confirm("Are you sure you want to permanently delete this user's note?")) return;
        try {
            // Assuming your delete route is /api/notes/:id
            await api.delete(`/notes/${noteId}`);
            fetchSubmissions(); // Refresh list
        } catch (err) {
            alert("Failed to delete note.");
        }
    };

    if (loading) return <p>Loading user submissions...</p>;

    return (
        <div className="w-full">
            <h1 className="text-4xl font-bold text-cyan-400 mb-8">User Submissions</h1>
            <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="py-3 px-4 text-left font-semibold">Title</th>
                            <th className="py-3 px-4 text-left font-semibold">Uploaded By</th>
                            <th className="py-3 px-4 text-left font-semibold">Status</th>
                            <th className="py-3 px-4 text-left font-semibold">Date</th>
                            <th className="py-3 px-4 text-left font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {notes.map(note => (
                            <tr key={note.id}>
                                <td className="py-3 px-4">{note.title}</td>
                                <td className="py-3 px-4 text-cyan-400">{note.username}</td>
                                <td className="py-3 px-4">{note.approval_status}</td>
                                <td className="py-3 px-4 text-gray-400">{formatDate(note.created_at)}</td>
                                <td className="py-3 px-4 flex space-x-2">
                                    <button onClick={() => navigate(`/notes/view/${note.id}`)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded">View</button>
                                    <button onClick={() => handleDelete(note.id)} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default UserSubmissions;