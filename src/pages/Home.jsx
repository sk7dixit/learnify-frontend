// src/pages/Home.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// import InteractiveNotebook from '../components/InteractiveNotebook'; // REMOVED

// The HowToUseModal component remains unchanged
const HowToUseModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6 relative border border-cyan-500">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
                <h2 className="text-3xl font-bold text-cyan-400 mb-4">How to Use OriNotes</h2>
                <div className="space-y-3 text-gray-300 max-h-[70vh] overflow-y-auto pr-2">
                    {/* Modal content remains the same */}
                    <p><strong>Browse Notes:</strong> Go to the "Notes" tab...</p>
                    <p><strong>View Notes:</strong> Click "View Note"...</p>
                    <p><strong>Upload Your Notes:</strong> Navigate to "Upload a Note"...</p>
                    <p><strong>Manage Your Uploads:</strong> Go to "My Notes"...</p>
                    <p><strong>Rate & Review:</strong> After viewing a note...</p>
                    <p><strong>Share Notes Securely:</strong> When viewing another user's public profile...</p>
                    <p><strong>Manage Requests:</strong> Check "Account" &gt; "Note Requests"...</p>
                    <p><strong>Global Chat:</strong> Click the chat icon on the bottom-right...</p>
                </div>
            </div>
        </div>
    );
};

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <HowToUseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Main container changed from grid-cols-2 to grid-cols-1, and uses Tailwind's background */}
      <div className="min-h-screen w-full bg-gray-900 text-white flex items-center justify-center">

        {/* --- CONTENT CENTERED (Previously LEFT COLUMN) --- */}
        <div className="relative z-10 p-8 md:p-12 lg:p-16 max-w-4xl text-center">
          <div className="animate-fadeInUp">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white drop-shadow-lg">
              WELCOME TO OriNotes
            </h1>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white drop-shadow-lg mt-2">
              <span className="text-cyan-400">Explore. Learn. Grow.</span>
            </h2>
            <p className="mt-6 text-xl md:text-2xl text-gray-300 max-w-xl mx-auto">
              Your secure online platform for course notes.
            </p>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row gap-6 animate-fadeIn delay-500 justify-center">
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105 shadow-lg">
              ℹ️ How to Use
            </button>
            <Link to="/login">
              <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105 shadow-lg">
                Login
              </button>
            </Link>
            <Link to="/register">
              <button className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105 shadow-lg">
                Register
              </button>
            </Link>
          </div>
        </div>

        {/* --- CONTACT US (Positioned absolutely) --- */}
        <div className="absolute bottom-4 left-4 z-20 text-gray-400 text-sm">
          <p><strong>Contact Us:</strong> <a href="mailto:OriNotes887@gmail.com" className="text-cyan-400 hover:underline">OriNotes887@gmail.com</a></p>
        </div>
      </div>
    </>
  );
};

export default Home;