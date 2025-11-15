import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

// Refactored StatCard to accept onClick and use Link/Button logic
const StatCard = ({ title, value, color, icon, onClick }) => (
    <div
        className={`bg-gray-800 p-6 rounded-lg shadow-xl border-l-4 ${color} ${onClick ? 'hover:bg-gray-700 cursor-pointer transition-colors' : ''}`}
        onClick={onClick}
    >
        <div className="flex items-center space-x-4">
            <div className="text-3xl">{icon}</div>
            <div>
                <h2 className="text-lg text-gray-400">{title}</h2>
                <p className="text-4xl font-bold mt-1">{value}</p>
            </div>
        </div>
    </div>
);


function MyStats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Initialize navigate

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await api.get('/users/my-stats');
                setStats(response.data);
            } catch (err) {
                setError('Failed to load your contribution stats.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Helper function to navigate to MyNotes with a filter (if applicable)
    // NOTE: MyNotes.jsx will need to read this state, or we navigate directly to the filtered view if one exists.
    // For simplicity, we navigate to the MyNotes page and the MyNotes component must filter.
    const handleCardClick = (status) => {
        // You would typically navigate to a filtered route, e.g., /my-notes?status=approved
        navigate(`/my-notes?status=${status}`);
        // NOTE: MyNotes.jsx needs to implement reading the query parameter 'status' and filtering its list.
    };


    if (loading) {
        return <p className="text-center">Loading your stats...</p>;
    }
    if (error) {
        return <p className="text-center text-red-500">{error}</p>;
    }

    return (
        <div className="w-full">
            <h1 className="text-4xl font-bold text-cyan-400 mb-8">My Contributions</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Views is generally read-only, so no click action */}
                <StatCard title="Total Views on Your Notes" value={stats.total_views} color="border-purple-500" icon="👁️" />

                <StatCard
                    title="Approved Notes"
                    value={stats.approved}
                    color="border-green-500"
                    icon="✅"
                    onClick={() => handleCardClick('approved')} // Make clickable
                />
                <StatCard
                    title="Pending Notes"
                    value={stats.pending}
                    color="border-yellow-500"
                    icon="⏳"
                    onClick={() => handleCardClick('pending')} // Make clickable
                />
                <StatCard
                    title="Rejected Notes"
                    value={stats.rejected}
                    color="border-red-500"
                    icon="❌"
                    onClick={() => handleCardClick('rejected')} // Make clickable
                />
            </div>
        </div>
    );
}

export default MyStats;