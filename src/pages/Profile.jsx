// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { allBadges } from '../services/badgeService';
import { User, Mail, Phone, School, Edit2, Save, X, Shield, QrCode, CheckCircle, AlertCircle, Award, LogOut } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

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
        <GlassCard className="mt-8">
            <div className="flex items-center gap-2 mb-6 text-cyan-400">
                <Shield size={24} />
                <h3 className="text-xl font-bold">Two-Factor Authentication (2FA)</h3>
            </div>

            <div className="flex items-center gap-2 mb-6">
                <span className="text-slate-300">Status:</span>
                <span className={`font-semibold px-3 py-1 rounded-full text-sm ${user.is_two_factor_enabled
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                    {user.is_two_factor_enabled ? 'Enabled' : 'Disabled'}
                </span>
            </div>

            {message && (
                <div className={`p-4 rounded-xl mb-6 flex items-center gap-2 ${message.includes('❌')
                        ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                        : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    }`}>
                    {message.includes('❌') ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                    <span>{message}</span>
                </div>
            )}

            {user.is_two_factor_enabled ? (
                <Button
                    variant="danger"
                    onClick={handleDisable2FA}
                    isLoading={loading}
                    icon={LogOut}
                >
                    Disable 2FA
                </Button>
            ) : (
                setupStep === 1 ? (
                    <Button
                        variant="primary"
                        onClick={handleGenerateSecret}
                        isLoading={loading}
                        icon={QrCode}
                    >
                        Enable 2FA
                    </Button>
                ) : (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="flex flex-col items-center p-6 bg-white/5 rounded-xl border border-white/10">
                            <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48 rounded-lg mb-4" />
                            <p className="text-sm text-slate-400">Secret Key:</p>
                            <p className="font-mono text-cyan-300 text-lg tracking-wider">{setupSecret}</p>
                        </div>

                        <div className="max-w-xs mx-auto space-y-4">
                            <Input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder="Enter 6-digit code"
                                icon={Shield}
                                className="text-center text-lg tracking-widest"
                            />
                            <div className="flex gap-3">
                                <Button
                                    variant="secondary"
                                    onClick={() => setSetupStep(1)}
                                    disabled={loading}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleVerifySetup}
                                    isLoading={loading}
                                    className="flex-1"
                                >
                                    Verify
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            )}
        </GlassCard>
    );
};

// --- Main Profile Component ---
function Profile() {
    const { user, updateUserProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        mobileNumber: '', schoolCollege: '', bio: '',
    });
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
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

    if (!user) return (
        <div className="min-h-screen flex items-center justify-center text-cyan-400">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
        </div>
    );

    return (
        <div className="min-h-screen p-4 md:p-8 relative">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Profile Header Card */}
                <GlassCard className="relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-cyan-500/20 to-blue-600/20" />

                    <div className="relative pt-16 px-4 pb-4 flex flex-col md:flex-row items-center md:items-end gap-6">
                        <div className="w-32 h-32 rounded-full bg-slate-900 border-4 border-slate-800 flex items-center justify-center text-5xl font-bold text-cyan-400 shadow-xl">
                            {user.name.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex-1 text-center md:text-left mb-2">
                            <h1 className="text-3xl font-bold text-white">{user.name}</h1>
                            <p className="text-cyan-400 font-medium">@{user.username}</p>
                            <p className="text-slate-400 mt-2 max-w-lg mx-auto md:mx-0">
                                {user.bio || "No bio added yet."}
                            </p>
                        </div>

                        <Button
                            variant={isEditing ? "secondary" : "primary"}
                            onClick={() => setIsEditing(!isEditing)}
                            icon={isEditing ? X : Edit2}
                        >
                            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                        </Button>
                    </div>
                </GlassCard>

                {/* Edit Form */}
                {isEditing && (
                    <GlassCard className="animate-fade-in-up border-cyan-500/30">
                        <div className="flex items-center gap-2 mb-6 text-cyan-400">
                            <Edit2 size={24} />
                            <h3 className="text-xl font-bold">Edit Information</h3>
                        </div>

                        {message && (
                            <div className={`p-4 rounded-xl mb-6 flex items-center gap-2 ${message.includes('❌')
                                    ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                                    : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                }`}>
                                {message.includes('❌') ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                                <span>{message}</span>
                            </div>
                        )}

                        <form onSubmit={handleUpdate} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Full Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    icon={User}
                                />
                                <Input
                                    label="Mobile Number"
                                    type="tel"
                                    name="mobileNumber"
                                    value={formData.mobileNumber}
                                    onChange={handleChange}
                                    icon={Phone}
                                />
                            </div>

                            <Input
                                label="School / College"
                                name="schoolCollege"
                                value={formData.schoolCollege}
                                onChange={handleChange}
                                icon={School}
                            />

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 ml-1">Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Tell us about yourself..."
                                    className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all resize-none"
                                />
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" variant="primary" icon={Save}>
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </GlassCard>
                )}

                {/* Badges Section */}
                <GlassCard>
                    <div className="flex items-center gap-2 mb-6 text-cyan-400">
                        <Award size={24} />
                        <h3 className="text-xl font-bold">My Badges</h3>
                    </div>

                    <div className="flex flex-wrap gap-6">
                        {(user.badges && user.badges.length > 0) ? user.badges.map(badgeKey => {
                            const badge = allBadges[badgeKey];
                            if (!badge) return null;
                            return (
                                <div key={badgeKey} className="group relative flex flex-col items-center p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-cyan-500/50 transition-all hover:-translate-y-1">
                                    <span className="text-5xl mb-2 drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300">{badge.symbol}</span>
                                    <span className="text-sm font-medium text-slate-300">{badge.name}</span>

                                    <div className="absolute bottom-full mb-2 w-48 bg-slate-900 text-xs text-slate-300 p-3 rounded-lg border border-slate-700 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                        <p className="font-bold text-cyan-400 mb-1">{badge.name}</p>
                                        <p>{badge.description}</p>
                                    </div>
                                </div>
                            )
                        }) : (
                            <div className="w-full text-center py-8 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
                                <p>No badges earned yet. Start uploading notes!</p>
                            </div>
                        )}
                        <Link to="/my-badges" className="flex flex-col items-center justify-center w-24 h-24 rounded-xl border-2 border-dashed border-slate-700 text-slate-500 hover:text-cyan-400 hover:border-cyan-400/50 hover:bg-cyan-400/5 transition-all group" title="View All Badges">
                            <span className="text-3xl group-hover:scale-110 transition-transform">+</span>
                            <span className="text-xs mt-1">View All</span>
                        </Link>
                    </div>
                </GlassCard>

                {/* 2FA Section */}
                <TwoFactorAuthManager user={user} updateUserProfile={updateUserProfile} />

            </div>
        </div>
    );
}

export default Profile;