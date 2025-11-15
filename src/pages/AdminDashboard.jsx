// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import api from "../services/api";
import { useAuth } from "../context/AuthAuthContext";

const COLORS = ['#06b6d4', '#7c3aed', '#ec4899', '#f59e0b', '#10b981'];

function StatCard({ title, value, icon, link }) {
  return (
    <Link
      to={link}
      className="min-w-[180px] sm:min-w-0 flex-shrink-0 sm:flex-shrink md:flex-1 bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-md hover:bg-gray-700 transition-colors duration-200"
      aria-label={`${title}: ${value}`}
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl sm:text-3xl">{icon}</div>
        <div className="truncate">
          <p className="text-xs sm:text-sm text-gray-400 font-medium uppercase tracking-wider">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-white truncate">{value}</p>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard({ height = 60 }) {
  return (
    <div className="bg-gray-800 animate-pulse rounded p-4" style={{ height }}>
      <div className="h-6 bg-gray-700 rounded w-3/4 mb-3" />
      <div className="h-4 bg-gray-700 rounded w-1/2" />
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartKey, setChartKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        // Ensure the dashboard endpoint returns pendingReportsCount
        const response = await api.get("/admin/dashboard");
        if (!mounted) return;
        setData(response.data);
        setChartKey(k => k + 1);
      } catch (err) {
        console.error("Failed to fetch admin data.", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

  // Safeguard: default shapes
  const popularNotes = data?.popularNotes || [];
  const planDistribution = data?.planDistribution || [];
  const totalUsers = data?.totalUsers ?? 0;
  const activeSubscriptions = data?.activeSubscriptions ?? 0;
  const totalRevenue = data?.totalRevenue ?? 0;
  const totalNotesViews = data?.totalNotesViews ?? 0;
  const pendingReportsCount = data?.pendingReportsCount ?? 0;


  return (
    <div className="w-full animate-fadeIn px-4 sm:px-6 md:px-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-400 leading-tight">Admin Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-400 mt-1">Mission control for OriNotes — key metrics & quick actions</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center space-x-3 text-gray-300 hover:text-white">
            <div className="text-sm">{user?.name}</div>
            <div className="w-9 h-9 bg-purple-800 rounded-full flex items-center justify-center font-bold text-white text-sm">{user?.name?.charAt(0)?.toUpperCase?.()}</div>
          </div>
          <Link to="/profile" className="sm:hidden inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white">
            <div className="w-9 h-9 bg-purple-800 rounded-full flex items-center justify-center font-bold text-white text-sm">{user?.name?.charAt(0)?.toUpperCase?.()}</div>
          </Link>
        </div>
      </div>

      {/* Stat cards - updated with new card and corrected links (PHASE 4 FIX) */}
      <div className="mb-6">
        <div className="overflow-x-auto pb-2 -mx-2 sm:mx-0">
          <div className="flex gap-3 w-max sm:w-full px-2 sm:px-0">
            {loading ? (
              <>
                <SkeletonCard height={84} />
                <SkeletonCard height={84} />
                <SkeletonCard height={84} />
                <SkeletonCard height={84} />
              </>
            ) : (
              <>
                {/* Links to /active-users */}
                <StatCard title="Total Users" value={totalUsers} icon="👥" link="/active-users" />

                {/* Links to /admin-subscriptions */}
                <StatCard title="Active Subs" value={activeSubscriptions} icon="💳" link="/admin-subscriptions" />
                <StatCard title="Total Revenue" value={`$${(totalRevenue || 0).toFixed(2)}`} icon="💰" link="/admin-subscriptions" />

                {/* NEW: Reports Card (Links to reports review page) */}
                {pendingReportsCount > 0 && (
                    <StatCard
                        title="New Reports"
                        value={pendingReportsCount}
                        icon="🚩"
                        link="/admin/reports-review"
                    />
                )}

                {/* Links to /manage-notes (Full Admin list) */}
                <StatCard
                    title="Total Views"
                    value={totalNotesViews}
                    icon="👁️"
                    link="/manage-notes"
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Left/Big chart */}
        <div className="lg:col-span-2 bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-lg sm:text-xl font-semibold text-white">Most Popular Notes</h2>
            <div className="text-sm text-gray-400">{popularNotes.length} items</div>
          </div>

          <div className="w-full h-[260px] sm:h-[320px]">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-gray-400">Loading chart...</div>
              </div>
            ) : popularNotes.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-gray-400">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" key={`bar-${chartKey}`}>
                <BarChart data={popularNotes} margin={{ top: 8, right: 18, left: -8, bottom: 60 }}>
                  <XAxis dataKey="title" stroke="#9CA3AF" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" interval={0} />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip wrapperStyle={{ backgroundColor: '#111827' }} contentStyle={{ backgroundColor: '#0b1220', border: 'none', color: '#fff' }} />
                  <Bar dataKey="view_count" fill="#06b6d4" name="Views" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right/smaller chart */}
        <div className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-lg sm:text-xl font-semibold text-white">Subscription Plans</h2>
            <div className="text-sm text-gray-400">{planDistribution.length} plans</div>
          </div>

          <div className="w-full h-[260px] sm:h-[320px]">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-gray-400">Loading chart...</div>
              </div>
            ) : planDistribution.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-gray-400">No subscription data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" key={`pie-${chartKey}`}>
                <PieChart>
                  <Pie
                    data={planDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {planDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip wrapperStyle={{ backgroundColor: '#111827' }} contentStyle={{ backgroundColor: '#0b1220', border: 'none', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
          <div className="text-sm text-gray-400">Shortcuts for common tasks</div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/approval-requests"
            className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-3 rounded-lg text-sm"
          >
            Review Pending Notes
          </Link>

          {/* NEW: Link to Review Reports Page */}
          <Link
            to="/admin/reports-review"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-lg text-sm"
          >
            Review Community Reports ({pendingReportsCount})
          </Link>

          <Link
            to="/user-submissions"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg text-sm"
          >
            View User Submissions
          </Link>

          <Link
            to="/admin/badges"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-3 rounded-lg text-sm"
          >
            Manage Badges
          </Link>

          <Link
            to="/admin-settings"
            className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-3 rounded-lg text-sm"
          >
            App Settings
          </Link>

          <Link
            to="/active-users"
            className="inline-flex items-center gap-2 border border-gray-700 text-gray-200 hover:bg-gray-700 py-2 px-3 rounded-lg text-sm"
          >
            Active Users
          </Link>
        </div>
      </div>

      {/* Footer spacing */}
      <div className="h-8" />
    </div>
  );
}