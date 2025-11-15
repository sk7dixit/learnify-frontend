// src/components/NoteCardDisplay.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Heart, Star } from 'lucide-react'; // Icons for the new UX

const NoteCardDisplay = ({ note, isFavourite, onToggleFavourite }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // --- Access Logic ---
    const isSubscribed = user?.subscription_expiry && new Date(user.subscription_expiry) > new Date();
    const isAdmin = user?.role === 'admin';
    const hasUnlimitedAccess = note.is_free || isSubscribed || isAdmin;
    const canUseFreeViews = !hasUnlimitedAccess && user && typeof user.free_views === 'number' && user.free_views > 0;
    const isPremium = !note.is_free;

    // --- Data Formatting ---
    const averageRating = note.average_rating ? parseFloat(note.average_rating).toFixed(1) : 'N/A';
    const uploadedDate = note.created_at ? new Date(note.created_at).toLocaleDateString() : 'N/A';
    const subjectDisplay = note.course && note.subject ? `${note.course} — ${note.subject}` : (note.subject || 'Unclassified');

    const handleViewClick = () => {
        navigate(`/notes/view/${note.id}`);
    };

    return (
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-cyan-500 transition-colors shadow-md flex flex-col justify-between h-full">

            {/* Top Section: Title and Premium Badge */}
            <div className="mb-3">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-white truncate pr-2" title={note.title}>
                        {note.title}
                    </h3>
                    {isPremium && !hasUnlimitedAccess && (
                        <Lock className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" title="OriPro Exclusive" />
                    )}
                </div>

                <p className="text-sm text-gray-400 mt-1">{subjectDisplay}</p>
                <p className="text-xs text-gray-500">Uploaded by: {note.username || 'Unknown'}</p>
            </div>

            {/* Middle Section: Metadata */}
            <div className="text-sm text-gray-300 space-y-1 mb-4 border-t border-b border-gray-700 py-2">
                <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>Rating: {averageRating} / 5</span>
                </div>
                <p>Views: {note.view_count ?? 0}</p>
                <p>Date: {uploadedDate}</p>
            </div>

            {/* Bottom Section: Actions */}
            <div className="flex items-center space-x-2">
                <button
                    onClick={handleViewClick}
                    className="flex-grow bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
                    disabled={!hasUnlimitedAccess && !canUseFreeViews && isPremium}
                >
                    {canUseFreeViews ? `🔓 View (Free ${user.free_views}/3)` : 'View Note'}
                </button>

                <button
                    onClick={(e) => { e.stopPropagation(); onToggleFavourite(note.id); }}
                    className={`p-2 rounded ${isFavourite ? 'text-red-500 hover:text-red-400' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                    title={isFavourite ? "Remove from Favourites" : "Add to Favourites"}
                >
                    <Heart className="h-6 w-6" fill={isFavourite ? 'currentColor' : 'none'} />
                </button>
            </div>
        </div>
    );
};

export default NoteCardDisplay;