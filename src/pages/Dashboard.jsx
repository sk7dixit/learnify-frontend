import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { allBadges } from '../services/badgeService';

const StatCard = ({ title, value, icon, color }) => (
    <div className={`bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 ${color}`}>
        <div className="flex items-center">
            <div className="mr-4 text-3xl">{icon}</div>
            <div>
                <p className="text-gray-400 text-sm font-medium">{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-white">
          Welcome Back, <span className="text-cyan-400">{dashboardData.name}!</span>
        </h1>
        <div className="flex items-center space-x-4">
            <Link to="/profile" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                 <div className="w-10 h-10 bg-cyan-800 rounded-full flex items-center justify-center font-bold text-white">{user.name.charAt(0).toUpperCase()}</div>
                 <span>My Profile</span>
            </Link>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              Logout
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Notes Viewed" value={dashboardData.notesViewed} icon="📚" color="border-cyan-500" />
        <StatCard title="Approved Uploads" value={dashboardData.approved} icon="✅" color="border-green-500" />
        <StatCard title="Views on Your Notes" value={dashboardData.total_views} icon="👁️" color="border-purple-500" />
        <div className={`p-6 rounded-xl shadow-lg border-l-4 ${isSubscriptionActive ? 'bg-green-900/50 border-green-500' : 'bg-yellow-900/50 border-yellow-500'}`}>
            <p className="text-gray-300 text-sm font-medium">Subscription Status</p>
            <p className="text-2xl font-bold text-white">{isSubscriptionActive ? 'Active' : 'Free Tier'}</p>
            <p className="text-xs text-gray-400 mt-1">
                {isSubscriptionActive ? `Expires: ${new Date(dashboardData.subscriptionExpiry).toLocaleDateString()}` : `Free Views Used: ${dashboardData.free_views} / 2`}
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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