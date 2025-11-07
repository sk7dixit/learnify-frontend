// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// --- Import all pages ---
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Notes from './pages/Notes';
import NoteViewer from './pages/NoteViewer';
import AdminDashboard from './pages/AdminDashboard';
import AdminSettings from './pages/AdminSettings';
import ActiveUsers from './pages/ActiveUsers';
import UploadNotes from './pages/UploadNotes';
import EditNote from './pages/EditNote';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Notifications from './pages/Notifications';
import RateUs from './pages/RateUs';
import Share from './pages/Share';
import SuggestImprovement from './pages/SuggestImprovement';
import ForgotPassword from './pages/ForgotPassword';
import FreeNote from './pages/FreeNote';
import Subscribe from './pages/Subscribe';
import ChangePassword from './pages/ChangePassword';
import MyFavourites from './pages/MyFavourites';
import MyUploads from './pages/MyUploads';
import MyStats from './pages/MyStats';
import ApprovalRequests from './pages/ApprovalRequests';
import PublicProfile from './pages/PublicProfile';
import NoteRequests from './pages/NoteRequests';
import MyNotes from './pages/MyNotes';
import UserSubmissions from './pages/UserSubmissions';
import SharedWithMe from './pages/SharedWithMe';
import MyBadges from './pages/MyBadges';
import AdminBadges from './pages/AdminBadges';
import ManageNotes from './pages/ManageNotes';

// --- Import layout components ---
import PrivateRoute from './components/PrivateRoute';
import AdminSidebar from './components/AdminSidebar';
import UserSidebar from './components/UserSidebar';
import GlobalChat from './components/GlobalChat';

function MainLayout() {
  const { user } = useAuth();
  const Sidebar = () => user ? (user.role === 'admin' ? <AdminSidebar /> : <UserSidebar />) : null;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-row">

      {/* The Sidebar is now managed internally by its component, which handles
        both desktop (fixed, hidden on mobile) and mobile (overlay) views.
      */}
      {user && <Sidebar />}

      {/* Main content container.
        - By default (mobile): ml-0 (no margin)
        - On sm screens and larger (desktop): sm:ml-64 (margin of 64px, equal to sidebar width)
      */}
      <main className={`w-full transition-all duration-300 ${user ? 'sm:ml-64' : 'ml-0'}`}>
        {/* Adjusted padding: p-4 for mobile, sm:p-8 for desktop */}
        <div className="p-4 sm:p-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/free-note" element={<FreeNote />} />

            {/* Private Routes (available to both users and admins) */}
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/profile/:username" element={<PrivateRoute><PublicProfile /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/notes" element={<PrivateRoute><Notes /></PrivateRoute>} />
            <Route path="/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />
            <Route path="/note-requests" element={<PrivateRoute><NoteRequests /></PrivateRoute>} />
            <Route path="/notes/view/:noteId" element={<PrivateRoute><NoteViewer /></PrivateRoute>} />
            <Route path="/subscribe" element={<PrivateRoute><Subscribe /></PrivateRoute>} />
            <Route path="/privacy" element={<PrivateRoute><PrivacyPolicy /></PrivateRoute>} />
            <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
            <Route path="/rate-us" element={<PrivateRoute><RateUs /></PrivateRoute>} />
            <Route path="/share" element={<PrivateRoute><Share /></PrivateRoute>} />
            <Route path="/suggest" element={<PrivateRoute><SuggestImprovement /></PrivateRoute>} />
            <Route path="/my-favourites" element={<PrivateRoute><MyFavourites /></PrivateRoute>} />
            <Route path="/my-uploads" element={<PrivateRoute><MyUploads /></PrivateRoute>} />
            <Route path="/my-stats" element={<PrivateRoute><MyStats /></PrivateRoute>} />
            <Route path="/my-notes" element={<PrivateRoute><MyNotes /></PrivateRoute>} />
            <Route path="/my-badges" element={<PrivateRoute><MyBadges /></PrivateRoute>} />
            <Route path="/shared-with-me" element={<PrivateRoute><SharedWithMe /></PrivateRoute>} />

            {/* Admin-Only Routes */}
            <Route path="/admin-dashboard" element={<PrivateRoute requiredRole="admin"><AdminDashboard /></PrivateRoute>} />
            <Route path="/admin-settings" element={<PrivateRoute requiredRole="admin"><AdminSettings /></PrivateRoute>} />
            <Route path="/active-users" element={<PrivateRoute requiredRole="admin"><ActiveUsers /></PrivateRoute>} />
            <Route path="/upload-notes" element={<PrivateRoute requiredRole="admin"><UploadNotes /></PrivateRoute>} />
            <Route path="/edit-note/:id" element={<PrivateRoute requiredRole="admin"><EditNote /></PrivateRoute>} />
            <Route path="/approval-requests" element={<PrivateRoute requiredRole="admin"><ApprovalRequests /></PrivateRoute>} />
            <Route path="/user-submissions" element={<PrivateRoute requiredRole="admin"><UserSubmissions /></PrivateRoute>} />
            <Route path="/admin/badges" element={<PrivateRoute requiredRole="admin"><AdminBadges /></PrivateRoute>} />
            <Route path="/manage-notes" element={<PrivateRoute requiredRole="admin"><ManageNotes /></PrivateRoute>} />
          </Routes>
        </div>
      </main>
      {user && <GlobalChat />}
    </div>
  );
}

function AppController() {
  const { loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <img src="/logo.png" alt="OriNotes Logo" className="h-12 w-12 animate-pulse mr-4"/>
        <div className="text-xl font-semibold">Initializing OriNotes...</div>
      </div>
    );
  }
  return <MainLayout />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppController />
      </AuthProvider>
    </BrowserRouter>
  );
}