// src/components/AdminSidebar.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import LogoutButton from './LogoutButton';
import { useAuth } from '../context/AuthContext';

// --- Icon Components ---
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2.586l.293.293a1 1 0 001.414 0V18a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const NotesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ApprovalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const SubmissionsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const BadgeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697A3.42 3.42 0 004.5 6.5l-1 7.5a3.42 3.42 0 003.335 2.803M16.165 4.697A3.42 3.42 0 0119.5 6.5l1 7.5a3.42 3.42 0 01-3.335 2.803m-6.664-9.606a12.023 12.023 0 016.664 0" /></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const AccountIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;


function AdminSidebar() {
  const [isAccountOpen, setAccountOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const activeLinkStyle = { backgroundColor: '#1e3a8a', color: 'white' };

  // Helper to close mobile menu on navigation
  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-center mb-8">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
          Admin Panel
        </h1>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto">
        <NavLink to="/admin-dashboard" onClick={handleNavClick} style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors p-3 rounded-lg hover:bg-gray-800">
          <DashboardIcon />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/upload-notes" onClick={handleNavClick} style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors p-3 rounded-lg hover:bg-gray-800">
          <UploadIcon />
          <span>Upload Note</span>
        </NavLink>
        <NavLink to="/manage-notes" onClick={handleNavClick} style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors p-3 rounded-lg hover:bg-gray-800">
          <NotesIcon />
          <span>Manage Notes</span>
        </NavLink>
        <NavLink to="/admin/users" onClick={handleNavClick} style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors p-3 rounded-lg hover:bg-gray-800">
          <UsersIcon />
          <span>Active Users</span>
        </NavLink>
        <NavLink to="/admin/approvals" onClick={handleNavClick} style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors p-3 rounded-lg hover:bg-gray-800">
          <ApprovalIcon />
          <span>Approvals</span>
        </NavLink>
        <NavLink to="/admin/submissions" onClick={handleNavClick} style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors p-3 rounded-lg hover:bg-gray-800">
          <SubmissionsIcon />
          <span>Submissions</span>
        </NavLink>
        <NavLink to="/admin/badges" onClick={handleNavClick} style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors p-3 rounded-lg hover:bg-gray-800">
          <BadgeIcon />
          <span>Badges</span>
        </NavLink>
        <NavLink to="/admin/settings" onClick={handleNavClick} style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors p-3 rounded-lg hover:bg-gray-800">
          <SettingsIcon />
          <span>Settings</span>
        </NavLink>

        {/* Added My Notes for Admin as well, as requested */}
        <NavLink to="/my-notes" onClick={handleNavClick} style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors p-3 rounded-lg hover:bg-gray-800">
          <NotesIcon />
          <span>My Notes</span>
        </NavLink>
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-700">
        <button
          onClick={() => setAccountOpen(!isAccountOpen)}
          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-300"
        >
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <span>{user?.name}</span>
          </div>
          <svg className={`h-5 w-5 transition-transform ${isAccountOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
        </button>
        {isAccountOpen && (
          <div className="pl-6 pt-2 space-y-2 text-md">
            <NavLink to="/profile" onClick={handleNavClick} style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"><AccountIcon /><span>My Profile</span></NavLink>
            <NavLink to="/change-password" onClick={handleNavClick} style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="block text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800">Change Password</NavLink>
            <NavLink to="/suggest" onClick={handleNavClick} style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="block text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800">User Suggestions</NavLink>
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

export default AdminSidebar;