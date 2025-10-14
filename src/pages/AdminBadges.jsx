// src/pages/AdminBadges.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminBadges = () => {
    const [badgeData, setBadgeData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBadgeData = async () => {
            try {
                setLoading(true);
                const response = await api.get('/admin/badges');
                setBadgeData(response.data);
            } catch (error) {
                console.error("Failed to fetch badge data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBadgeData();
    }, []);

    if (loading) return <p>Loading badge data...</p>;

    return (
        <div className="w-full">
            <h1 className="text-4xl font-bold text-cyan-400 mb-8">Badge Management</h1>
            <div className="space-y-8">
                {badgeData.map(badge => (
                    <div key={badge.name} className="bg-gray-800 p-6 rounded-lg">
                        <div className="flex items-center space-x-4 mb-4">
                            <span className="text-4xl">{badge.symbol}</span>
                            <div>
                                <h2 className="text-2xl font-bold">{badge.name}</h2>
                                <p className="text-sm text-gray-400">{badge.description}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Users with this badge ({badge.users.length}):</h3>
                            {badge.users.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {badge.users.map(username => (
                                        <span key={username} className="bg-gray-700 text-cyan-300 text-xs font-semibold px-2 py-1 rounded-full">{username}</span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No users have earned this badge yet.</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminBadges;