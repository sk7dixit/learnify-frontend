// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LogIn, UserPlus } from 'lucide-react'; // Icons for header

const HowToUseModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-gray-900/90 backdrop-blur-lg border border-cyan-500 rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-cyan-400 hover:text-white text-2xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-3xl font-bold text-cyan-400 mb-4 text-center">
          How to Use OriNotes
        </h2>
        <div className="space-y-3 text-gray-300 max-h-[60vh] overflow-y-auto pr-2">
          <p><strong>Browse Notes:</strong> Go to the “Notes” tab to explore all shared notes.</p>
          <p><strong>View Notes:</strong> Click “View Note” to open and study content.</p>
          <p><strong>Upload Notes:</strong> Use “Upload a Note” to share your material securely.</p>
          <p><strong>Manage Notes:</strong> Visit “My Notes” to edit or delete uploads.</p>
          <p><strong>Rate & Review:</strong> After reading, leave your rating and feedback.</p>
          <p><strong>Share Securely:</strong> Access public profiles to share resources safely.</p>
          <p><strong>Chat:</strong> Use the bottom-right chat icon to connect globally.</p>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gradientPosition, setGradientPosition] = useState(0);

  // Subtle background animation
  useEffect(() => {
    const interval = setInterval(() => {
      setGradientPosition((prev) => (prev + 1) % 360);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <HowToUseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* PHASE 3 FIX: Persistent Top Header (Sticky) */}
      <header className="sticky top-0 z-40 w-full bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">

          {/* Logo and Title */}
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="OriNotes Logo" className="h-8 w-8"/>
            <span className="text-2xl font-extrabold text-cyan-400 tracking-wider">OriNotes</span>
          </div>

          {/* Navigation/Auth Buttons */}
          <nav className="flex items-center space-x-3">
            <Link to="/login">
              <button className="flex items-center space-x-1 px-4 py-2 text-white font-semibold rounded-full border border-cyan-500 hover:bg-cyan-500/20 transition-colors">
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </button>
            </Link>
            <Link to="/register">
              <button className="flex items-center space-x-1 px-4 py-2 bg-cyan-600 text-white font-bold rounded-full hover:bg-cyan-700 transition-colors">
                <UserPlus className="w-4 h-4" />
                <span>Register</span>
              </button>
            </Link>
          </nav>
        </div>
      </header>


      <div
        className="relative min-h-[calc(100vh-65px)] flex flex-col items-center justify-center text-white overflow-hidden" // Adjusted min-height
        style={{
          background: `linear-gradient(${gradientPosition}deg, #0f172a, #003366, #0f172a)`,
          transition: "background 2s ease",
        }}
      >
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden z-0">
          {[...Array(25)].map((_, i) => (
            <span
              key={i}
              className="absolute bg-cyan-400 opacity-20 rounded-full animate-float"
              style={{
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`,
              }}
            ></span>
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-8 pt-16 animate-fadeInUp"> {/* Added pt-16 for spacing */}
          <h1 className="text-5xl md:text-7xl font-extrabold drop-shadow-[0_0_20px_rgba(0,255,255,0.3)]">
            WELCOME TO <span className="text-cyan-400">OriNotes</span>
          </h1>
          <h2 className="text-3xl md:text-5xl font-extrabold mt-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 text-transparent bg-clip-text animate-gradient">
            Explore. Learn. Grow.
          </h2>
          <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-xl mx-auto">
            Your secure online platform for course notes and collaborative learning.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-6 justify-center">
             {/* Removed redundant Login/Register buttons here to improve color hierarchy */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-110 shadow-lg"
            >
              ℹ️ How to Use
            </button>
            <Link to="/notes"> {/* New CTA to drive users to content */}
                <button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-110 shadow-lg">
                    Start Browsing
                </button>
            </Link>
          </div>
        </div>

        {/* Contact */}
        <div className="absolute bottom-4 left-4 text-gray-400 text-sm z-10">
          <p>
            <strong>Contact Us:</strong>{" "}
            <a
              href="mailto:OriNotes887@gmail.com"
              className="text-cyan-400 hover:underline"
            >
              OriNotes887@gmail.com
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default Home;