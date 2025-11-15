// src/pages/UserSubmissions.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Calendar } from 'lucide-react';

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

// Helper: Converts date string (e.g., YYYY-MM-DD from input) to Date object
const parseDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString);
};


function UserSubmissions() {
    const [allNotes, setAllNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // --- PHASE 4 FIX: Filter State ---
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filterUsername, setFilterUsername] = useState('');


    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            // Endpoint: GET /api/admin/user-submissions
            const response = await api.get('/admin/user-submissions');
            setAllNotes(response.data); // Store master list
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    // 1. PHASE 4 FIX: Filtering Logic (Memoized)
    const filteredNotes = useMemo(() => {
        let filtered = allNotes;

        // Filter by Search Query (Title, Username)
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(note =>
                note.title.toLowerCase().includes(query) ||
                note.username.toLowerCase().includes(query)
            );
        }

        // Filter by Approval Status
        if (filterStatus) {
            filtered = filtered.filter(note => note.approval_status === filterStatus);
        }

        // Filter by Username (exact match filter)
        if (filterUsername) {
            const userQuery = filterUsername.toLowerCase();
            filtered = filtered.filter(note => note.username.toLowerCase() === userQuery);
        }

        // Filter by Date Uploaded
        const start = parseDate(startDate);
        const end = parseDate(endDate);

        if (start || end) {
             filtered = filtered.filter(note => {
                const noteDate = parseDate(note.created_at);
                if (!noteDate) return false;

                const passesStart = start ? noteDate >= start : true;
                const passesEnd = end ? noteDate <= end : true;

                return passesStart && passesEnd;
            });
        }

        return filtered;
    }, [allNotes, searchQuery, filterStatus, filterUsername, startDate, endDate]);


    const handleDelete = async (noteId) => {
        if (!window.confirm("Are you sure you want to permanently delete this user's note?")) return;
        try {
            // Assuming your delete route is /api/notes/:id
            await api.delete(`/notes/${noteId}`);
            // Optimistically update the master list
            setAllNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
        } catch (err) {
            alert("Failed to delete note.");
        }
    };

    if (loading) return <p className="text-center text-gray-400">Loading user submissions...</p>;

    return (
        <div className="w-full p-4 sm:p-0">
            <h1 className="text-4xl font-bold text-cyan-400 mb-8">User Submissions ({allNotes.length})</h1>

            {/* PHASE 4 FIX: Search and Filter Bar */}
            <div className="bg-gray-800 p-4 rounded-xl shadow-inner mb-6">
                <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                    <Filter className="w-5 h-5" /> Filter Submissions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Search Input */}
                    <div className="col-span-1 md:col-span-2 relative">
                        <input
                            type="text"
                            placeholder="Search title or uploader..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-cyan-500"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>

                    {/* Status Filter */}
                    <div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-cyan-500"
                        >
                            <option value="">-- All Statuses --</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    {/* Date Uploaded Start */}
                    <div>
                        <label className="text-xs block text-gray-400 mb-1">Uploaded After</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-cyan-500"
                        />
                    </div>

                    {/* Date Uploaded End */}
                    <div>
                        <label className="text-xs block text-gray-400 mb-1">Uploaded Before</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-cyan-500"
                        />
                    </div>

                    {/* Future: Filter by Username (if desired for complex lookup)
                    <div className="md:col-span-1">
                        <label className="text-xs block text-gray-400 mb-1">Specific Uploader</label>
                        <input
                            type="text"
                            placeholder="Exact username"
                            value={filterUsername}
                            onChange={(e) => setFilterUsername(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-cyan-500"
                        />
                    </div> */}
                </div>
                <p className="mt-4 text-sm text-gray-400">
                    Showing **{filteredNotes.length}** submissions matching the criteria.
                </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-[#121a28] rounded-xl shadow-2xl">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-[#1f283a] sticky top-0">
                        <tr>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Title</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Uploaded By</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {filteredNotes.map(note => (
                            <tr key={note.id} className="hover:bg-gray-700/50">
                                <td className="py-3 px-4 text-sm text-white">{note.title}</td>
                                <td className="py-3 px-4 text-sm text-cyan-400">{note.username}</td>
                                <td className="py-3 px-4 text-sm"><StatusBadge status={note.approval_status} /></td>
                                <td className="py-3 px-4 text-sm text-gray-400">{formatDate(note.created_at)}</td>
                                <td className="py-3 px-4 flex space-x-2">
                                    <button onClick={() => navigate(`/notes/view/${note.id}`)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded text-sm">View</button>
                                    <button onClick={() => handleDelete(note.id)} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded text-sm">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredNotes.length === 0 && !loading && (
                    <div className="p-6 text-center text-gray-400">No submissions found matching your filter criteria.</div>
                )}
            </div>
        </div>
    );
}

export default UserSubmissions;