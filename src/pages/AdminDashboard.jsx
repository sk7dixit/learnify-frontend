import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

// Adjusted StatCard for responsiveness (p-4 on mobile, larger text scaling)
const StatCard = ({ title, value, icon, link }) => (
    <Link to={link} className="bg-gray-800 p-4 rounded-xl shadow-lg hover:bg-gray-700 transition-colors duration-300 block">
        <div className="flex items-center">
            <div className="mr-3 text-2xl sm:text-3xl">{icon}</div>
            <div>
                <p className="text-gray-400 text-xs sm:text-sm font-medium uppercase tracking-wider">{title}</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{value}</p>
            </div>
        </div>
    </Link>
);

const COLORS = ['#0ea5e9', '#8b5cf6', '#db2777'];

function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/admin/dashboard");
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch admin data.", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !data) {
    return <p className="text-center text-xl">Loading Mission Control...</p>;
  }

  return (
    <div className="w-full animate-fadeIn">
      {/* Optimized Header for Mobile: Smaller font, profile details stack */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-cyan-400 mb-4 sm:mb-0">Admin Dashboard</h1>
         <Link to="/profile" className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors">
            {/* Reduced size on mobile */}
            <span>{user.name}</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-800 rounded-full flex items-center justify-center font-bold text-white text-md sm:text-lg">{user.name.charAt(0).toUpperCase()}</div>
        </Link>
      </div>

      {/* Stat Cards: Uses grid-cols-2 on mobile, scales up to 4 on large screens */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatCard title="Total Users" value={data.totalUsers} icon="👤" link="/active-users" />
        <StatCard title="Active Subs" value={data.activeSubscriptions} icon="💳" link="/admin-subscriptions" />
        <StatCard title="Total Revenue" value={`$${data.totalRevenue.toFixed(2)}`} icon="💰" link="/admin-subscriptions" />
        <StatCard title="Total Views" value={data.totalNotesViews} icon="👁️" link="/notes" />
      </div>

      {/* Charts Section: Stacks vertically on mobile (grid-cols-1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">

        {/* Popular Notes (Bar Chart) - takes full width on mobile */}
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-white">Most Popular Notes</h2>
          <ResponsiveContainer width="100%" height={300}>
            {/* Ensure XAxis labels don't cause overflow on mobile */}
            <BarChart data={data.popularNotes} margin={{ top: 5, right: 20, left: -10, bottom: 50 }}>
              <XAxis dataKey="title" stroke="#a0aec0" tick={{ fontSize: 8 }} angle={-45} textAnchor="end" interval={0} />
              <YAxis stroke="#a0aec0" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} cursor={{ fill: '#ffffff10' }} />
              <Bar dataKey="view_count" fill="#22d3ee" name="Views" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Subscription Plans (Pie Chart) */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-white">Subscription Plans</h2>
           <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data.planDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {data.planDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}/>
              </PieChart>
            </ResponsiveContainer>
        </div>
      </div>

       <div className="mt-8 bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-white">Quick Actions</h2>
          {/* Quick Actions: Uses flex-wrap to stack buttons on narrow screens */}
          <div className="flex flex-wrap gap-3 sm:gap-4">
              <Link to="/approval-requests" className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-3 rounded-lg text-sm">Review Pending Notes</Link>
              <Link to="/user-submissions" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg text-sm">View User Submissions</Link>
              <Link to="/admin/badges" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-3 rounded-lg text-sm">Manage Badges</Link>
              <Link to="/admin-settings" className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-3 rounded-lg text-sm">App Settings</Link>
          </div>
       </div>

    </div>
  );
}

export default AdminDashboard;