// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { allBadges } from '../services/badgeService';

function Profile() {
  const { user, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '', age: '', mobileNumber: '', schoolCollege: '', bio: '',
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
        setFormData({
            name: user.name || '', age: user.age || '',
            mobileNumber: user.mobile_number || '',
            schoolCollege: user.school_college || '', bio: user.bio || '',
        });
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put("/users/profile", formData);
      updateUserProfile(res.data.user);
      setMessage("✅ Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      setMessage("❌ Failed to update profile.");
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (!user) return <p>Loading profile...</p>;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-700">
            <div className="flex flex-col md:flex-row items-center md:space-x-8">
                <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 bg-cyan-800 rounded-full flex items-center justify-center text-5xl font-bold text-white mb-4 md:mb-0">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-center md:text-left">
                    <h2 className="text-4xl font-bold text-white">{user.name}</h2>
                    <p className="text-cyan-400">@{user.username}</p>
                    <p className="text-gray-400 mt-4 max-w-lg">{user.bio || "This user hasn't written a bio yet."}</p>
                </div>
                <button onClick={() => setIsEditing(!isEditing)} className="mt-6 md:mt-0 md:ml-auto bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
            </div>

            <div className="border-t border-gray-700 my-8"></div>

            <div>
                <h3 className="text-2xl font-bold text-white mb-4">My Badges</h3>
                <div className="flex flex-wrap gap-4 items-center">
                    {(user.badges && user.badges.length > 0) ? user.badges.map(badgeKey => {
                        const badge = allBadges[badgeKey];
                        if (!badge) return null;
                        return (
                            <div key={badgeKey} className="group relative flex flex-col items-center" title={badge.name}>
                                <span className="text-5xl transform group-hover:scale-125 transition-transform">{badge.symbol}</span>
                                <div className="absolute bottom-full mb-2 w-max bg-gray-900 text-xs text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <p className="font-bold">{badge.name}</p>
                                    <p>{badge.description}</p>
                                </div>
                            </div>
                        )
                    }) : <p className="text-gray-500">No badges earned yet.</p>}
                     <Link to="/my-badges" className="flex flex-col items-center justify-center text-gray-500 hover:text-white" title="View All Badges">
                        <span className="text-4xl border-2 border-dashed border-gray-600 rounded-full w-14 h-14 flex items-center justify-center transition-colors hover:border-white hover:text-cyan-400">+</span>
                    </Link>
                </div>
            </div>
        </div>

        {isEditing && (
             <div className="mt-8 bg-gray-800 rounded-2xl p-8 border border-gray-700">
                 <h3 className="text-2xl font-bold text-white mb-6">Edit Information</h3>
                 {message && <p className="text-center mb-4">{message}</p>}
                 <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="w-full p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-cyan-500 outline-none"/>
                        <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Age" className="w-full p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-cyan-500 outline-none"/>
                    </div>
                    <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} placeholder="Mobile Number" className="w-full p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-cyan-500 outline-none"/>
                    <input type="text" name="schoolCollege" value={formData.schoolCollege} onChange={handleChange} placeholder="School/College" className="w-full p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-cyan-500 outline-none"/>
                    <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3" placeholder="Your Bio" className="w-full p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-cyan-500 outline-none"></textarea>
                    <button type="submit" className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700">
                      Save Changes
                    </button>
                 </form>
             </div>
        )}
    </div>
  );
}

export default Profile;