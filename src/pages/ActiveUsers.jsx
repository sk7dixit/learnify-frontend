// src/pages/ActiveUsers.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Trash2, Shield, AlertTriangle, Search, Calendar, Filter } from 'lucide-react';
// Import your API service
import api from '../services/api';

// --- Helper: Convert date string to Date object for comparison ---
const parseDate = (dateString) => {
    if (dateString === 'Never' || !dateString) return null;
    // Attempt to parse the localized string, fallback to new Date()
    return new Date(dateString);
};

const ActiveUsers = () => {
    const [allUsers, setAllUsers] = useState([]); // Master list fetched from API
    const [loading, setLoading] = useState(true);
    const [confirmation, setConfirmation] = useState(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // --- PHASE 4 FIX: Filter State ---
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState(''); // Registered after
    const [endDate, setEndDate] = useState('');   // Registered before

    // 1. Fetch Users from API
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                // Endpoint: GET /api/admin/active-users
                const response = await api.get('/admin/active-users');
                // Assume response.data is an array of user objects:
                // { id, name, email, created_at, last_login }
                setAllUsers(response.data.map(user => ({
                    ...user,
                    // Format dates for display (assuming created_at/last_login are ISO strings)
                    registered: user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A',
                    lastLogin: user.last_login ? new Date(user.last_login).toLocaleString() : 'Never',
                })) || []);
            } catch (err) {
                setError('❌ Failed to load active users from the server.');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // 2. PHASE 4 FIX: Filtering Logic (Memoized)
    const filteredUsers = useMemo(() => {
        let filtered = allUsers;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(query) ||
                user.username.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query)
            );
        }

        const start = parseDate(startDate);
        const end = parseDate(endDate);

        // Filter by Date Registered
        if (start || end) {
             filtered = filtered.filter(user => {
                const userRegDate = parseDate(user.registered);
                if (!userRegDate) return false;

                const passesStart = start ? userRegDate >= start : true;
                const passesEnd = end ? userRegDate <= end : true;

                return passesStart && passesEnd;
            });
        }

        // FUTURE: Add filter by status/role if necessary

        return filtered;
    }, [allUsers, searchQuery, startDate, endDate]);


    // 3. HANDLER TO REMOVE USER
    const handleRemoveUser = async (userId) => {
        setError('');
        setSuccessMessage('');

        try {
            // Endpoint: DELETE /api/admin/users/:id
            await api.delete(`/admin/users/${userId}`);

            // Remove the user from the local state upon successful deletion
            setAllUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
            setSuccessMessage(`✅ User ID ${userId} removed successfully.`);

        } catch (err) {
            setError(err.response?.data?.error || '❌ Failed to remove user.');
        } finally {
            setConfirmation(null); // Close modal
        }
    };

    // --- MODAL / CONFIRMATION UI (Unchanged) ---
    const ConfirmationModal = () => {
        if (!confirmation) return null;

        // ... (Modal JSX remains the same as provided) ...
        return (
            <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
                <div className="bg-gray-800 p-6 rounded-xl shadow-2xl max-w-sm w-full border border-red-700">
                    <div className="text-center mb-4">
                        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                        <h3 className="text-xl font-bold text-white">Confirm Deletion</h3>
                        <p className="text-gray-400 mt-2">
                            Are you sure you want to permanently remove user **{confirmation.username}**?
                            This action cannot be undone.
                        </p>
                    </div>
                    <div className="flex justify-between space-x-4 mt-6">
                        <button
                            onClick={() => setConfirmation(null)}
                            className="flex-1 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-500 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => handleRemoveUser(confirmation.userId)}
                            className="flex-1 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                        >
                            <Trash2 className="w-4 h-4 inline mr-1" /> Remove
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#070e17] p-4 sm:p-8">
            <h1 className="text-4xl font-bold text-white mb-8 flex items-center">
                <Shield className="w-8 h-8 mr-3 text-cyan-400" />
                Active Users (Admin Panel)
            </h1>

            {error && <div className="p-3 mb-4 bg-red-800 text-white rounded-lg">{error}</div>}
            {successMessage && <div className="p-3 mb-4 bg-green-800 text-white rounded-lg">{successMessage}</div>}

            {/* PHASE 4 FIX: Search and Filter Bar */}
            <div className="bg-gray-800 p-4 rounded-xl shadow-inner mb-6">
                <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                    <Filter className="w-5 h-5" /> Filter & Search
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search Input */}
                    <div className="col-span-1 md:col-span-2 relative">
                        <input
                            type="text"
                            placeholder="Search by name, username, or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>

                    {/* Date Registered Start */}
                    <div>
                        <label className="text-xs block text-gray-400 mb-1">Registered After</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-cyan-500"
                        />
                    </div>

                    {/* Date Registered End */}
                    <div>
                        <label className="text-xs block text-gray-400 mb-1">Registered Before</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-cyan-500"
                        />
                    </div>
                </div>
                <p className="mt-3 text-sm text-gray-400">
                    Showing **{filteredUsers.length}** users out of **{allUsers.length}** total.
                </p>
            </div>


            {/* Responsive Table Container */}
            <div className="overflow-x-auto bg-[#121a28] rounded-xl shadow-2xl">
                {loading ? (
                     <div className="p-6 text-center text-gray-400">Loading user data...</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-[#1f283a] sticky top-0">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    User Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                    Date Registered
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                    Last Login
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-700 transition duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                        {user.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {user.registered}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-cyan-400">
                                        {user.lastLogin}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => setConfirmation({ userId: user.id, username: user.name })}
                                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {filteredUsers.length === 0 && !loading && (
                    <div className="p-6 text-center text-gray-400">No users match your filter criteria.</div>
                )}
            </div>

            {/* Display Confirmation Modal */}
            <ConfirmationModal />
        </div>
    );
};

export default ActiveUsers;