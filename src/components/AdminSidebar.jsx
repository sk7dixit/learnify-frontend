// src/components/AdminSidebar.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import LogoutButton from './LogoutButton';
import { useAuth } from '../context/AuthContext';

// --- Icon Components (no changes here) ---
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2.586l.293.293a1 1 0 001.414 0V18a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const NotesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ApprovalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const SubmissionsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const BadgeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697A3.42 3.42 0 004.5 6.5l-1 7.5a3.42 3.42 0 003.335 2.803M16.165 4.697A3.42 3.42 0 0119.5 6.5l1 7.5a3.42 3.42 0 01-3.335 2.803m-6.664-9.606a12.023 12.023 0 016.664 0" /></svg>;


function AdminSidebar() {
  const [isAccountOpen, setAccountOpen] = useState(false);
  const { user } = useAuth();
  const activeLinkStyle = { backgroundColor: '#1e3a8a', color: 'white' };

  return (
    <div className="fixed top-0 left-0 h-full w-64 bg-gray-900 text-gray-300 p-5 flex flex-col shadow-2xl z-30 border-r border-gray-700/50">
      <div className="flex items-center space-x-3 mb-10 pl-2">
        <img src="/logo.png" alt="OriNotes Logo" className="h-10 w-10"/>
        <h1 className="text-3xl font-extrabold text-cyan-400 tracking-wider">OriNotes</h1>
      </div>

      <nav className="flex-grow w-full">
        <ul className="space-y-2 w-full">
          <li><NavLink to="/admin-dashboard" style={({isActive}) => isActive ? activeLinkStyle : undefined} className="flex items-center space-x-4 text-lg p-3 rounded-lg hover:bg-gray-800 hover:text-white transition-colors duration-200"><DashboardIcon /><span>Dashboard</span></NavLink></li>
          <li><NavLink to="/upload-notes" style={({isActive}) => isActive ? activeLinkStyle : undefined} className="flex items-center space-x-4 text-lg p-3 rounded-lg hover:bg-gray-800 hover:text-white transition-colors duration-200"><UploadIcon /><span>Upload Note</span></NavLink></li>

          {/* --- THIS IS THE NEW LINK --- */}
          <li><NavLink to="/manage-notes" style={({isActive}) => isActive ? activeLinkStyle : undefined} className="flex items-center space-x-4 text-lg p-3 rounded-lg hover:bg-gray-800 hover:text-white transition-colors duration-200"><NotesIcon /><span>Manage Notes</span></NavLink></li>

          <li><NavLink to="/active-users" style={({isActive}) => isActive ? activeLinkStyle : undefined} className="flex items-center space-x-4 text-lg p-3 rounded-lg hover:bg-gray-800 hover:text-white transition-colors duration-200"><UsersIcon /><span>Active Users</span></NavLink></li>
          <li><NavLink to="/approval-requests" style={({isActive}) => isActive ? activeLinkStyle : undefined} className="flex items-center space-x-4 text-lg p-3 rounded-lg hover:bg-gray-800 hover:text-white transition-colors duration-200"><ApprovalIcon /><span>Approvals</span></NavLink></li>
          <li><NavLink to="/user-submissions" style={({isActive}) => isActive ? activeLinkStyle : undefined} className="flex items-center space-x-4 text-lg p-3 rounded-lg hover:bg-gray-800 hover:text-white transition-colors duration-200"><SubmissionsIcon /><span>Submissions</span></NavLink></li>
          <li><NavLink to="/admin/badges" style={({isActive}) => isActive ? activeLinkStyle : undefined} className="flex items-center space-x-4 text-lg p-3 rounded-lg hover:bg-gray-800 hover:text-white transition-colors duration-200"><BadgeIcon /><span>Badges</span></NavLink></li>
          <li><NavLink to="/admin-settings" style={({isActive}) => isActive ? activeLinkStyle : undefined} className="flex items-center space-x-4 text-lg p-3 rounded-lg hover:bg-gray-800 hover:text-white transition-colors duration-200"><SettingsIcon /><span>Settings</span></NavLink></li>
        </ul>
      </nav>

      {/* Account section remains the same */}
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
              <NavLink to="/change-password" style={({isActive}) => isActive ? activeLinkStyle : undefined} className="block text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800">Change Password</NavLink>
              <NavLink to="/suggest" style={({isActive}) => isActive ? activeLinkStyle : undefined} className="block text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800">User Suggestions</NavLink>
              <div className="pt-2"><LogoutButton /></div>
            </div>
          )}
      </div>
    </div>
  );
}

export default AdminSidebar;