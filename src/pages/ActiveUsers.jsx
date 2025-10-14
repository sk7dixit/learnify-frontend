import React, { useState, useEffect } from 'react';
import api from '../services/api';

function ActiveUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/active-users');
        setUsers(response.data);
      } catch (err) {
        setError('Failed to fetch user data. Please try again later.');
        console.error("Error fetching active users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Helper function to format dates nicely
  const formatDate = (dateString) => {
    if (!dateString) {
      return <span className="text-gray-500">Never</span>;
    }
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <p className="text-center text-gray-400">Loading user data...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="w-full">
      <h1 className="text-4xl font-bold text-cyan-400 mb-8">Active Users</h1>
      <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-sm">User Name</th>
                <th className="py-3 px-4 text-left font-semibold text-sm">Email</th>
                <th className="py-3 px-4 text-left font-semibold text-sm">Date Registered</th>
                <th className="py-3 px-4 text-left font-semibold text-sm">Last Login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-700/50 transition-colors">
                  <td className="py-3 px-4 text-sm">{user.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-400">{user.email}</td>
                  <td className="py-3 px-4 text-sm text-gray-400">{formatDate(user.created_at)}</td>
                  <td className="py-3 px-4 text-sm text-cyan-400 font-medium">{formatDate(user.last_login)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ActiveUsers;