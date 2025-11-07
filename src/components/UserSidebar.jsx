// src/components/UserSidebar.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import LogoutButton from './LogoutButton';
import { useAuth } from '../context/AuthContext';

// --- Icon Components ---
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2.586l.293.293a1 1 0 001.414 0V18a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>;
const NotesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;
const AccountIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const SubscribeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
const HeartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const StatsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-5M3 4h5V9" /><path d="M21 9v2a6 6 0 0 1-6 6H9" /></svg>;
const BadgeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697A3.42 3.42 0 004.5 6.5l-1 7.5a3.42 3.42 0 003.335 2.803M16.165 4.697A3.42 3.42 0 0119.5 6.5l1 7.5a3.42 3.42 0 01-3.335 2.803m-6.664-9.606a12.023 12.023 0 016.664 0" /></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;

function UserSidebar() {
  const [isAccountOpen, setAccountOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const activeLinkStyle = { backgroundColor: '#1e3a8a', color: 'white' };

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <>
      <div className="flex items-center space-x-3 mb-10 pl-2">
        <img src="/logo.png" alt="OriNotes Logo" className="h-10 w-10"/>
        <h1 className="text-3xl font-extrabold text-cyan-400 tracking-wider">OriNotes</h1>
      </div>

      <nav className="flex-grow w-full">
        <ul className="space-y-2 w-full">
          <li><NavLink to="/dashboard" onClick={handleNavClick} style={({isActive}) => isActive ? activeLinkStyle : undefined} className="flex items-center space-x-4 text-lg p-3 rounded-lg hover:bg-gray-800 hover:text-white transition-colors duration-200"><DashboardIcon /><span>Dashboard</span></NavLink></li>
          <li><NavLink to="/notes" onClick={handleNavClick} style={({isActive}) => isActive ? activeLinkStyle : undefined} className="flex items-center space-x-4 text-lg p-3 rounded-lg hover:bg-gray-800 hover:text-white transition-colors duration-200"><NotesIcon /><span>Browse Notes</span></NavLink></li>
          <li><NavLink to="/my-notes" onClick={handleNavClick} style={({isActive}) => isActive ? activeLinkStyle : undefined} className="flex items-center space-x-4 text-lg p-3 rounded-lg hover:bg-gray-800 hover:text-white transition-colors duration-200"><NotesIcon /><span>My Notes</span></NavLink></li>
          <li><NavLink to="/my-uploads" onClick={handleNavClick} style={({isActive}) => isActive ? activeLinkStyle : undefined} className="flex items-center space-x-4 text-lg p-3 rounded-lg hover:bg-gray-800 hover:text-white transition-colors duration-200"><UploadIcon /><span>Upload a Note</span></NavLink></li>
          <li><NavLink to="/my-favourites" onClick={handleNavClick} style={({isActive}) => isActive ? activeLinkStyle : undefined} className="flex items-center space-x-4 text-lg p-3 rounded-lg hover:bg-gray-800 hover:text-white transition-colors duration-200"><HeartIcon /><span>Favourites</span></NavLink></li>
          <li><NavLink to="/my-stats" onClick={handleNavClick} style={({isActive}) => isActive ? activeLinkStyle : undefined} className="flex items-center space-x-4 text-lg p-3 rounded-lg hover:bg-gray-800 hover:text-white transition-colors duration-200"><StatsIcon /><span>My Stats</span></NavLink></li>
          <li><NavLink to="/shared-with-me" onClick={handleNavClick} style={({isActive}) => isActive ? activeLinkStyle : undefined} className="flex items-center space-x-4 text-lg p-3 rounded-lg hover:bg-gray-800 hover:text-white transition-colors duration-200"><ShareIcon /><span>Shared With Me</span></NavLink></li>
          {user?.is_subscription_enabled && (
            <li><NavLink to="/subscribe" onClick={handleNavClick} style={({isActive}) => isActive ? activeLinkStyle : undefined} className="flex items-center space-x-4 text-lg p-3 rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 hover:text-white transition-colors duration-200"><SubscribeIcon /><span>Subscribe</span></NavLink></li>
          )}
        </ul>
      </nav>

      <div className="w-full">
         <div className="border-t border-gray-700 mb-2"></div>
         <button onClick={() => setAccountOpen(!isAccountOpen)} className="w-full flex justify-between items-center text-lg p-3 rounded-lg hover:bg-gray-800 hover:text-white transition-colors duration-200">
            <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-cyan-800 rounded-full flex items-center justify-center font-bold text-white">{user?.name?.charAt(0)}</div>
                <span>{user?.name}</span>
            </div>
            <svg className={`h-5 w-5 transition-transform ${isAccountOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          </button>
          {isAccountOpen && (
            <div className="pl-6 pt-2 space-y-2 text-md">
              <NavLink to="/my-badges" onClick={handleNavClick} style={({isActive}) => isActive ? activeLinkStyle : undefined} className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"><BadgeIcon/><span>My Badges</span></NavLink>
              <NavLink to="/change-password" onClick={handleNavClick} style={({isActive}) => isActive ? activeLinkStyle : undefined} className="block text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800">Change Password</NavLink>
              <NavLink to="/note-requests" onClick={handleNavClick} style={({isActive}) => isActive ? activeLinkStyle : undefined} className="block text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800">Note Requests</NavLink>
              <NavLink to="/suggest" onClick={handleNavClick} style={({isActive}) => isActive ? activeLinkStyle : undefined} className="block text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800">Suggest Improvement</NavLink>
              <div className="pt-2"><LogoutButton /></div>
            </div>
          )}
      </div>
    </>
  );

  return (
    <>
      {/* 1. Mobile Menu Button (Visible on mobile/small screens) */}
      <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="fixed top-4 left-4 z-40 p-2 bg-gray-800 rounded-lg shadow-lg sm:hidden text-white border border-cyan-500"
          aria-label="Open menu"
      >
          <MenuIcon />
      </button>

      {/* 2. Desktop Sidebar (Visible on sm: and larger screens) */}
      <div className="fixed top-0 left-0 h-full w-64 bg-gray-900 text-gray-300 p-5 flex-col shadow-2xl z-30 border-r border-gray-700/50 hidden sm:flex">
          <SidebarContent />
      </div>

      {/* 3. Mobile Overlay Sidebar (Absolute position, slide-in/out effect) */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-gray-300 p-5 flex-col shadow-2xl z-50 border-r border-gray-700/50 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} sm:hidden`}
      >
          <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-4 right-4 text-3xl text-gray-400 hover:text-white">
              &times;
          </button>
          <SidebarContent />
      </div>

      {/* 4. Overlay Backdrop (Appears when mobile menu is open) */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black opacity-50 z-40 sm:hidden"
        ></div>
      )}
    </>
  );
}

export default UserSidebar;