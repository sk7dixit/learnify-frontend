// src/pages/Dashboard.jsx
import React from 'react';
import { LogOut, User, Menu, Search, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useAuth } from '../context/AuthContext'; // Import Auth Context

// Mock data and user name for demonstration (Replace with actual data fetching)
// We will use actual user data where possible.

const Dashboard = () => {
    // Retain state for UI only if needed, but remove menu/sidebar states
    // const [isMenuOpen, setIsMenuOpen] = useState(false); // REMOVED

    const { user } = useAuth(); // Get user data from context
    const navigate = useNavigate(); // Initialize navigate

    // Placeholder data - replace with data fetched from your /users/dashboard API endpoint
    const userProfile = {
        notesViewed: user?.notesViewed || 0, // Assume backend provides these
        approvedUploads: user?.approvedUploads || 0,
        viewsOnNotes: user?.viewsOnNotes || 0,
        subscriptionStatus: user?.subscription_expiry ? 'Premium' : 'Free Tier',
        freeViewsUsed: user?.free_views || 0,
        freeViewsTotal: 2,
    };

    // Handlers now use navigate
    const handleRedirectToBrowse = () => {
        navigate('/notes'); // Redirects to the main Notes page
    };

    const handleRedirectToUpload = () => {
        navigate('/my-uploads'); // Redirects to the MyUploads page
    };


    // --- Dashboard Content (JSX) ---
    return (
        <div className="min-h-screen bg-[#070e17] text-white font-inter">

            {/* 1. HEADER (SIMPLIFIED TO ONLY SHOW WELCOME TEXT) */}
            <header className="p-4 bg-[#121a28] shadow-lg sticky top-0 z-20">
                <div className="flex items-center justify-between">
                    <div className="md:block">
                         <h1 className="text-xl font-bold text-gray-50 md:text-2xl whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] sm:max-w-none">
                            Welcome Back, <span className="text-cyan-400">{user?.name || 'User'}!</span>
                        </h1>
                    </div>

                    {/* The User Icon is likely rendered by the main App Layout, so we remove the redundant button here. */}
                </div>
            </header>

            {/* 2. MAIN DASHBOARD CONTENT */}
            <main className="p-4 md:p-8">

                {/* Ready for more? Section (Buttons) - PHASE 3 FIX: MOVED HIGHER */}
                <div className="mb-8 p-6 bg-[#1f283a] rounded-xl shadow-lg border border-gray-700">
                    <h3 className="text-2xl font-bold text-cyan-400 mb-3">Ready for more?</h3>
                    <p className="text-gray-300 mb-6">
                        Contribute to the community or find the perfect notes for your next exam.
                    </p>
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                        {/* Upload Button */}
                        <button
                            onClick={handleRedirectToUpload}
                            className="flex-1 bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition shadow-md flex items-center justify-center space-x-2">
                            <Upload className="w-5 h-5" />
                            <span>Upload a Note</span>
                        </button>
                        {/* Browse Button - NOW REDIRECTS */}
                        <button
                            onClick={handleRedirectToBrowse}
                            className="flex-1 bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-cyan-700 transition shadow-md flex items-center justify-center space-x-2"
                        >
                            <Search className="w-5 h-5" />
                            <span>Browse Notes</span>
                        </button>
                    </div>
                </div>

                {/* 4-Stat Grid (Responsive layout) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <Card icon="📚" title="Notes Viewed" value={userProfile.notesViewed} color="bg-red-700" />
                    <Card icon="✅" title="Approved Uploads" value={userProfile.approvedUploads} color="bg-green-700" />
                    <Card icon="👁️" title="Views on Your Notes" value={userProfile.viewsOnNotes} color="bg-purple-700" />
                    <Card
                        icon="⭐"
                        title="Subscription Status"
                        value={userProfile.subscriptionStatus}
                        color="bg-yellow-700"
                        details={`Free Views Used: ${userProfile.freeViewsUsed} / ${userProfile.freeViewsTotal}`}
                    />
                </div>

                {/* Your Achievements Section (Keeping the original structure) */}
                <h2 className="text-3xl font-bold text-gray-50 mt-8 mb-6">Your Achievements</h2>
                <div className="flex items-center space-x-6">
                    <div className="flex flex-col items-center">
                        <div className="text-5xl mb-2">⏳</div>
                        <span className="text-gray-300">OG Member</span>
                    </div>
                    <button
                        onClick={() => navigate('/my-badges')}
                        className="flex flex-col items-center cursor-pointer"
                    >
                        <div className="w-16 h-16 border-4 border-gray-600 rounded-full flex items-center justify-center text-4xl text-gray-400 hover:border-cyan-400 transition">
                            +
                        </div>
                        <span className="text-gray-300 mt-2">View All</span>
                    </button>
                </div>
            </main>
        </div>
    );
};

// Helper Stat Card Component
const Card = ({ icon, title, value, color, details }) => (
    <div className={`p-4 rounded-xl shadow-lg ${color} bg-opacity-30 border-t-4 border-b-4 border-opacity-70 flex flex-col justify-between h-32`}>
        <div>
            <p className="text-sm text-gray-300 font-medium">{title}</p>
            <h3 className="text-3xl font-extrabold mt-1">
                {value}
            </h3>
        </div>
        {details && (
            <p className="text-xs font-semibold text-yellow-300 pt-1 border-t border-gray-700 mt-2">
                {details}
            </p>
        )}
    </div>
);


export default Dashboard;