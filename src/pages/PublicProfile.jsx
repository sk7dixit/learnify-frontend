// src/pages/PublicProfile.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/users/profile/${username}`);
        setProfile(response.data);
      } catch (err) {
        setError('User not found or failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  const handleRequestAccess = async (noteId) => {
    try {
        const res = await api.post(`/notes/access/request/${noteId}`);
        // Provide specific success message
        alert(res.data.message || "Request sent!");
    } catch (err) {
        // Provide specific error message from the backend
        alert(err.response?.data?.error || "Failed to send request. You may have already requested access.");
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="w-full">
      <h1 className="text-4xl font-bold text-cyan-400 mb-2">{profile.username}</h1>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Uploaded Notes</h2>
        {profile.uploadedNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.uploadedNotes.map(note => (
              <div key={note.id} className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-bold truncate">{note.title}</h3>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-gray-400">Views: {note.view_count}</span>
                  <button onClick={() => handleRequestAccess(note.id)} className="bg-blue-600 text-white text-sm font-semibold py-1 px-3 rounded hover:bg-blue-700">
                    Request Access
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">This user hasn't uploaded any notes yet.</p>
        )}
      </div>
    </div>
  );
}

export default PublicProfile;