import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { allBadges } from '../services/badgeService';

const StatCard = ({ title, value, icon, color }) => (
    // Ensure padding is slightly reduced on mobile (p-4)
    <div className={`bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg border-l-4 ${color}`}>
        <div className="flex items-center">
            <div className="mr-4 text-3xl">{icon}</div>
            <div>
                <p className="text-gray-400 text-xs sm:text-sm font-medium">{title}</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    </div>
);

const Dashboard = () => {
  const { user, logout, refreshUser } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const fetchData = async () => {
      try {
        setLoading(true);
        await refreshUser(); // Refresh user data on dashboard load for latest badges
        const [dashboardRes, statsRes] = await Promise.all([
             api.get('/users/dashboard'),
             api.get('/users/my-stats')
        ]);
        setDashboardData({ ...dashboardRes.data, ...statsRes.data });
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !dashboardData) {
    return <div className="text-center p-10">Loading your dashboard...</div>;
  }

  const isSubscriptionActive = dashboardData.subscriptionExpiry && new Date(dashboardData.subscriptionExpiry) > new Date();

  return (
    <div className="w-full animate-fadeIn">
      {/* --- MOBILE-OPTIMIZED HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-0">
          Welcome Back, <span className="text-cyan-400">{dashboardData.name.split(' ')[0]}!</span>
        </h1>

        {/* Profile and Logout condensed on mobile */}
        <div className="flex items-center space-x-3 sm:space-x-4">
            <Link to="/profile" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                 {/* Reduced size of profile avatar on mobile */}
                 <div className="w-8 h-8 sm:w-10 sm:h-10 bg-cyan-800 rounded-full flex items-center justify-center font-bold text-white text-md sm:text-lg">{user.name.charAt(0).toUpperCase()}</div>
                 {/* "My Profile" text is visible on all screens */}
                 <span className="text-sm sm:text-base">My Profile</span>
            </Link>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 sm:px-4 rounded-lg transition duration-300 text-sm"
            >
              Logout
            </button>
        </div>
      </div>
      {/* --- END MOBILE-OPTIMIZED HEADER --- */}

      {/* Stat Cards: Grid layout optimized for 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatCard title="Notes Viewed" value={dashboardData.notesViewed} icon="📚" color="border-cyan-500" />
        <StatCard title="Approved Uploads" value={dashboardData.approved} icon="✅" color="border-green-500" />
        <StatCard title="Views on Your Notes" value={dashboardData.total_views} icon="👁️" color="border-purple-500" />

        {/* Subscription Status Card */}
        <div className={`p-4 sm:p-6 rounded-xl shadow-lg border-l-4 ${isSubscriptionActive ? 'bg-green-900/50 border-green-500' : 'bg-yellow-900/50 border-yellow-500'}`}>
            <p className="text-gray-400 text-xs sm:text-sm font-medium">Subscription Status</p>
            <p className="text-xl sm:text-2xl font-bold text-white">{isSubscriptionActive ? 'Active' : 'Free Tier'}</p>
            <p className="text-xs text-gray-400 mt-1">
                {isSubscriptionActive ? `Expires: ${new Date(dashboardData.subscriptionExpiry).toLocaleDateString()}` : `Free Views Used: ${dashboardData.free_views} / 2`}
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Your Achievements</h2>
            <div className="flex flex-wrap gap-4 items-center">
                {(user.badges && user.badges.length > 0) ? user.badges.map(badgeKey => {
                    const badge = allBadges[badgeKey];
                    if (!badge) return null;
                    return (
                        <div key={badgeKey} className="group relative flex flex-col items-center text-center" title={badge.name}>
                            <span className="text-5xl transform group-hover:scale-125 transition-transform">{badge.symbol}</span>
                            <p className="text-xs text-gray-400 mt-1">{badge.name}</p>
                        </div>
                    )
                }) : <p className="text-gray-500">Upload and review notes to earn badges!</p>}
                <Link to="/my-badges" className="flex flex-col items-center justify-center text-gray-500 hover:text-white" title="View All Badges">
                    <span className="text-4xl border-2 border-dashed border-gray-600 rounded-full w-14 h-14 flex items-center justify-center transition-colors hover:border-white hover:text-cyan-400">+</span>
                    <p className="text-xs mt-1">View All</p>
                </Link>
            </div>
        </div>
        {/* Quick Action Card - responsive to 1/3 width on large screens */}
        <div className="bg-cyan-800/50 p-6 rounded-xl shadow-lg flex flex-col justify-center items-center text-center">
            <h2 className="text-2xl font-bold text-white">Ready for more?</h2>
            <p className="text-cyan-200 my-4">Contribute to the community or find the perfect notes for your next exam.</p>
            <div className="flex space-x-4">
                <Link to="/my-uploads" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">Upload a Note</Link>
                <Link to="/notes" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">Browse Notes</Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;