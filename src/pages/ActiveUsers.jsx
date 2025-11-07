import React, { useState } from 'react';
import { Trash2, Shield, AlertTriangle } from 'lucide-react';
// In a real app, you would import your API service here:
// import api from '../services/api';

// --- MOCK USER DATA (Replace with data fetched from your API) ---
const INITIAL_USERS = [
    { id: 'u1', username: 'Shashwat Dixit', email: 'shashwatdixit22@gmail.com', registered: 'Nov 4, 2025, 11:30 AM', lastLogin: 'Nov 7, 2025, 05:39 PM' },
    { id: 'u2', username: 'Amar', email: 'forget4evemorev@gmail.com', registered: 'Nov 5, 2025, 09:15 PM', lastLogin: 'Nov 5, 2025, 09:16 PM' },
    { id: 'u3', username: 'Aarsh Tripathi', email: 'aarshtripathi21@gmail.com', registered: 'Nov 5, 2025, 09:04 PM', lastLogin: 'Nov 5, 2025, 09:00 PM' },
    { id: 'u4', username: 'Utsav', email: 'utsavpoochou43@gmail.com', registered: 'Nov 5, 2025, 08:56 PM', lastLogin: 'Nov 5, 2025, 08:57 PM' },
    { id: 'u5', username: 'Ujjwal Upadhyay', email: 'ujju.up@gmail.com', registered: 'Nov 5, 2025, 08:49 PM', lastLogin: 'Nov 5, 2025, 08:47 PM' },
    { id: 'u6', username: 'sakshi', email: 'sakshisooni27022005@gmail.com', registered: 'Nov 5, 2025, 09:00 PM', lastLogin: 'Never' },
    { id: 'u7', username: 'Khushboo Saini', email: 'khushboosaini066@gmail.com', registered: 'Nov 5, 2025, 09:09 PM', lastLogin: 'Never' },
    { id: 'u8', username: 'Anjan', email: 'fltkar@gmail.com', registered: 'Nov 5, 2025, 07:00 PM', lastLogin: 'Never' },
];
// --- END MOCK DATA ---

const ActiveUsers = () => {
    const [users, setUsers] = useState(INITIAL_USERS);
    const [confirmation, setConfirmation] = useState(null); // { userId, username }
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // 1. HANDLER TO REMOVE USER
    const handleRemoveUser = async (userId) => {
        setError('');
        setSuccessMessage('');

        // ⚠️ In a real application, you would make an API call here:
        /*
        try {
            // Assuming your backend has an admin endpoint like /api/admin/users/delete/:id
            await api.delete(`/admin/users/delete/${userId}`);

            // Remove the user from the local state upon successful deletion
            setUsers(users.filter(user => user.id !== userId));
            setSuccessMessage(`✅ User ID ${userId} removed successfully.`);

        } catch (err) {
            setError('❌ Failed to remove user. Please check server logs.');
        } finally {
            setConfirmation(null); // Close modal
        }
        */

        // --- MOCK DELETION (For demonstration) ---
        console.log(`MOCK: Attempting to delete user ID: ${userId}`);
        const userToRemove = users.find(u => u.id === userId);

        if (userToRemove) {
            // Simulating a successful API call
            setTimeout(() => {
                setUsers(users.filter(user => user.id !== userId));
                setSuccessMessage(`✅ User '${userToRemove.username}' removed successfully.`);
                setConfirmation(null);
            }, 500);
        } else {
            setError('❌ Mock Error: User not found.');
            setConfirmation(null);
        }
        // --- END MOCK DELETION ---
    };

    // --- MODAL / CONFIRMATION UI ---
    const ConfirmationModal = () => {
        if (!confirmation) return null;

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
        <div className="min-h-screen bg-[#070e17] p-8">
            <h1 className="text-4xl font-bold text-white mb-8 flex items-center">
                <Shield className="w-8 h-8 mr-3 text-cyan-400" />
                Active Users (Admin Panel)
            </h1>

            {error && <div className="p-3 mb-4 bg-red-800 text-white rounded-lg">{error}</div>}
            {successMessage && <div className="p-3 mb-4 bg-green-800 text-white rounded-lg">{successMessage}</div>}

            {/* Responsive Table Container */}
            <div className="overflow-x-auto bg-[#121a28] rounded-xl shadow-2xl">
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
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-700 transition duration-150">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                    {user.username}
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
                                        onClick={() => setConfirmation({ userId: user.id, username: user.username })}
                                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && (
                    <div className="p-6 text-center text-gray-400">No active users found.</div>
                )}
            </div>

            {/* Display Confirmation Modal */}
            <ConfirmationModal />
        </div>
    );
};

export default ActiveUsersTable;