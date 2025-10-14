import React, { useState } from 'react';
import api from '../services/api';

function ChangePassword() {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.put('/users/change-password', {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });
      setMessage(response.data.message);
      // Clear form on success
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-gray-800 rounded-xl shadow-2xl">
      <h2 className="text-3xl font-bold text-cyan-400 mb-6 text-center">Change Password</h2>

      {message && <p className="text-green-400 text-center mb-4">{message}</p>}
      {error && <p className="text-red-400 text-center mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-300 mb-2">Old Password</label>
          <input type="password" name="oldPassword" value={formData.oldPassword} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg bg-gray-700"/>
        </div>
        <div>
          <label className="block text-gray-300 mb-2">New Password</label>
          <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg bg-gray-700"/>
        </div>
        <div>
          <label className="block text-gray-300 mb-2">Confirm New Password</label>
          <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg bg-gray-700"/>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}

export default ChangePassword;