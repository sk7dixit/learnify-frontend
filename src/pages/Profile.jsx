// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { allBadges } from '../services/badgeService';

// --- NEW 2FA Component ---
const TwoFactorAuthManager = ({ user, updateUserProfile }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [setupSecret, setSetupSecret] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [setupStep, setSetupStep] = useState(1); // 1: Generate, 2: Verify
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGenerateSecret = async () => {
        setLoading(true);
        setMessage('');
        try {
            const res = await api.post('/users/2fa/generate-secret');
            setQrCodeUrl(res.data.qrCodeUrl);
            setSetupSecret(res.data.secret);
            setSetupStep(2);
            setMessage('Scan the QR code below in your authenticator app.');
        } catch (err) {
            setMessage('❌ Failed to generate 2FA secret.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifySetup = async () => {
        if (!verificationCode) return;
        setLoading(true);
        setMessage('');
        try {
            const res = await api.post('/users/2fa/verify-setup', {
                token: verificationCode,
                secret: setupSecret,
            });
            updateUserProfile(res.data.user); // Update context with new 2FA status
            setMessage(res.data.message);
            setSetupStep(1); // Reset form
            setQrCodeUrl('');
            setSetupSecret('');
            setVerificationCode('');
        } catch (err) {
            setMessage(err.response?.data?.error || '❌ Invalid code. Verification failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleDisable2FA = async () => {
        if (!window.confirm("Are you sure you want to disable Two-Factor Authentication?")) return;
        setLoading(true);
        setMessage('');
        try {
            const res = await api.post('/users/2fa/disable');
            updateUserProfile(res.data.user); // Update context
            setMessage(res.data.message);
        } catch (err) {
            setMessage('❌ Failed to disable 2FA.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="border border-gray-700 p-6 rounded-lg bg-gray-900/50">
            <h3 className="text-xl font-bold text-cyan-400 mb-4">Two-Factor Authentication (2FA)</h3>
            <p className={`mb-4 font-semibold ${user.is_two_factor_enabled ? 'text-green-400' : 'text-red-400'}`}>
                Status: {user.is_two_factor_enabled ? '✅ Enabled' : '❌ Disabled'}
            </p>
            {message && <p className="mb-4 text-sm text-center font-medium text-yellow-300">{message}</p>}

            {user.is_two_factor_enabled ? (
                <button onClick={handleDisable2FA} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
                    {loading ? 'Disabling...' : 'Disable 2FA'}
                </button>
            ) : (
                setupStep === 1 ? (
                    <button onClick={handleGenerateSecret} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
                        {loading ? 'Generating...' : 'Enable 2FA'}
                    </button>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48 border-4 border-white p-1 rounded-lg" />
                        </div>
                        <p className="text-sm text-gray-400 text-center">Secret Key: <span className="font-mono text-cyan-300">{setupSecret}</span></p>
                        <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            placeholder="Enter 6-digit code to verify"
                            className="w-full p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                        />
                        <div className="flex justify-between space-x-2">
                             <button onClick={() => setSetupStep(1)} disabled={loading} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">Cancel</button>
                             <button onClick={handleVerifySetup} disabled={loading} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
                                {loading ? 'Verifying...' : 'Verify & Enable'}
                            </button>
                        </div>
                    </div>
                )
            )}
        </div>
    );
};

// --- Main Profile Component ---
function Profile() {
  const { user, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '', // Removed age
    mobileNumber: '', schoolCollege: '', bio: '',
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
        setFormData({
            name: user.name || '', // Removed age
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

            {/* --- NEW 2FA MANAGER INTEGRATION --- */}
            <TwoFactorAuthManager user={user} updateUserProfile={updateUserProfile} />

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
                        {/* AGE FIELD REMOVED */}
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