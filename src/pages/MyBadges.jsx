// src/pages/MyBadges.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { allBadges } from '../services/badgeService';

const MyBadges = () => {
    const { user } = useAuth();
    const userBadges = user?.badges || [];

    return (
        <div className="w-full">
            <h1 className="text-4xl font-bold text-cyan-400 mb-8">My Badge Collection</h1>

            {userBadges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userBadges.map(badgeKey => {
                        const badge = allBadges[badgeKey];
                        if (!badge) return null;
                        return (
                            <div key={badgeKey} className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex items-center space-x-6 transform hover:scale-105 hover:border-cyan-400 transition-all duration-300">
                                <div className="text-6xl">{badge.symbol}</div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">{badge.name}</h3>
                                    <p className="text-gray-400 mt-1">{badge.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-800 rounded-xl">
                    <p className="text-5xl mb-4">🛡️</p>
                    <h2 className="text-2xl font-bold text-gray-300">Your collection is empty!</h2>
                    <p className="text-gray-500 mt-2">Start uploading and interacting to earn your first badge.</p>
                </div>
            )}
        </div>
    );
};

export default MyBadges;