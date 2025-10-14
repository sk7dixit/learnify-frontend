// src/pages/Notifications.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Helper function for formatting dates
const formatDate = (dateString) => new Date(dateString).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

// --- VIEW FOR REGULAR USERS ---
function UserNotificationsView() {
    const { fetchUnreadCount } = useAuth(); // Get the function to refresh the global count
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/notifications');
            setNotifications(response.data.notifications);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleMarkAllRead = async () => {
        try {
            await api.post('/notifications/mark-read');
            fetchNotifications(); // Re-fetch to show the updated "read" status
            fetchUnreadCount(); // Trigger a refresh of the global unread count for the sidebar
        } catch (error) {
            console.error("Failed to mark notifications as read:", error);
        }
    };

    if (loading) return <p className="text-gray-400">Loading notifications...</p>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-cyan-400">Notifications</h1>
                <button
                    onClick={handleMarkAllRead}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                    Mark All as Read
                </button>
            </div>

            <div className="space-y-4">
                {notifications.length > 0 ? notifications.map(n => (
                    <div key={n.id} className={`p-4 rounded-lg border-l-4 ${n.is_read ? 'bg-gray-800 border-gray-600' : 'bg-blue-900/50 border-cyan-500'}`}>
                        <p className="font-bold text-lg">{n.title}</p>
                        <p className="text-gray-300 mt-1">{n.message}</p>
                        <p className="text-xs text-gray-500 mt-2">{formatDate(n.created_at)}</p>
                    </div>
                )) : (
                    <p className="text-gray-500">You have no notifications.</p>
                )}
            </div>
        </div>
    );
}

// --- VIEW FOR ADMINS ---
function AdminNotificationsView() {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendNotification = async (e) => {
        e.preventDefault();
        if (!title.trim() || !message.trim()) {
            setFeedback('Title and message cannot be empty.');
            return;
        }
        setLoading(true);
        setFeedback('');
        try {
            await api.post('/notifications', { title, message });
            setTitle('');
            setMessage('');
            setFeedback('✅ Notification sent successfully to all users!');
        } catch (error) {
            setFeedback('❌ Failed to send notification.');
            console.error("Failed to send notification:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-4xl font-bold text-cyan-400 mb-6">Broadcast a Notification</h1>
            <p className="text-gray-400 mb-8">This message will be sent to every registered user on the platform.</p>

            <form onSubmit={handleSendNotification} className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="mb-4">
                    <label htmlFor="title" className="block text-gray-300 mb-2 font-semibold">Title</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-3 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="message" className="block text-gray-300 mb-2 font-semibold">Message</label>
                    <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows="6"
                        className="w-full p-3 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                    {loading ? 'Broadcasting...' : 'Send to All Users'}
                </button>
                 {feedback && <p className={`mt-4 text-center font-semibold ${feedback.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>{feedback}</p>}
            </form>
        </div>
    );
}

// --- MAIN COMPONENT THAT DECIDES WHICH VIEW TO SHOW ---
function Notifications() {
  const { user } = useAuth();

  if (!user) return null;

  return user.role === 'admin' ? <AdminNotificationsView /> : <UserNotificationsView />;
}

export default Notifications;