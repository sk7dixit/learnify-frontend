import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Helper function to format dates nicely and consistently
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

// --- COMPONENT FOR REGULAR USERS ---
function UserSuggestionView() {
    const [message, setMessage] = useState('');
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState('');

    // Function to fetch the user's personal suggestion history
    const fetchHistory = useCallback(async () => {
        try {
            const response = await api.get('/suggestions/my-history');
            setHistory(response.data);
        } catch (error) {
            console.error("Failed to fetch suggestion history:", error);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    // Handles submitting a new suggestion
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) {
            setFeedback('Please enter a suggestion before sending.');
            return;
        }
        setLoading(true);
        setFeedback('');
        try {
            await api.post('/suggestions', { message });
            setMessage('');
            setFeedback('✅ Your suggestion has been sent successfully!');
            fetchHistory(); // Refresh the history list after sending
        } catch (error) {
            setFeedback('❌ Failed to send suggestion. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-4xl font-bold text-cyan-400 mb-6">Suggest an Improvement</h1>
            <p className="text-gray-400 mb-8">We value your feedback! Let us know how we can make Learnify better for you.</p>

            <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg mb-12">
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your suggestion here..."
                    rows="5"
                    className="w-full p-3 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                    {loading ? 'Sending...' : 'Send Suggestion'}
                </button>
                {feedback && <p className={`mt-4 text-center font-semibold ${feedback.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>{feedback}</p>}
            </form>

            <h2 className="text-3xl font-bold text-cyan-400 mb-6">Your Suggestion History</h2>
            <div className="space-y-6">
                {history.length > 0 ? history.map(item => (
                    <div key={item.id} className="bg-gray-800 p-4 rounded-lg">
                        <p className="text-gray-300"><strong>You said:</strong> {item.message}</p>
                        <p className="text-xs text-gray-500 mt-2">Sent: {formatDate(item.created_at)}</p>
                        {item.admin_reply && (
                            <div className="mt-4 border-t border-gray-700 pt-4">
                                <p className="text-cyan-300"><strong>Admin replied:</strong> {item.admin_reply}</p>
                                <p className="text-xs text-gray-500 mt-2">Replied: {formatDate(item.replied_at)}</p>
                            </div>
                        )}
                    </div>
                )) : <p className="text-gray-500">You haven't sent any suggestions yet.</p>}
            </div>
        </div>
    );
}

// --- COMPONENT FOR ADMINS ---
function AdminSuggestionView() {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [replyingTo, setReplyingTo] = useState(null); // Holds the full suggestion object to reply to
    const [replyMessage, setReplyMessage] = useState('');

    // Function to fetch all suggestions from all users
    const fetchAllSuggestions = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/suggestions/all');
            setSuggestions(response.data);
        } catch (err) {
            setError('Failed to load suggestions.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllSuggestions();
    }, [fetchAllSuggestions]);

    // Handles sending the admin's reply
    const handleSendReply = async () => {
        if (!replyMessage.trim()) return;
        try {
            await api.put(`/suggestions/reply/${replyingTo.id}`, { reply: replyMessage });
            setReplyingTo(null); // Close the modal
            setReplyMessage('');
            fetchAllSuggestions(); // Refresh the list to show the new status
        } catch (error) {
            alert('Failed to send reply. Please try again.');
        }
    };

    if (loading) return <p className="text-center text-gray-400">Loading user suggestions...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    // If we are replying to a message, show a modal-like interface
    if (replyingTo) {
        return (
            <div className="bg-gray-800 p-6 rounded-lg max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-4">Reply to {replyingTo.user_name}</h2>
                <div className="bg-gray-700 p-4 rounded mb-4">
                    <p className="text-sm text-gray-400">User's message:</p>
                    <p className="italic">"{replyingTo.message}"</p>
                </div>
                <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply here..."
                    rows="5"
                    className="w-full p-3 rounded-lg bg-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <div className="flex justify-end space-x-4 mt-4">
                    <button onClick={() => setReplyingTo(null)} className="bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-500">Cancel</button>
                    <button onClick={handleSendReply} className="bg-cyan-600 px-4 py-2 rounded-lg hover:bg-cyan-500">Send Reply</button>
                </div>
            </div>
        );
    }

    // Main admin view: the list of all suggestions
    return (
        <div>
            <h1 className="text-4xl font-bold text-cyan-400 mb-8">User Suggestions</h1>
            <div className="space-y-4">
                {suggestions.map(s => (
                    <div key={s.id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-start">
                        <div>
                            <p className="font-bold">{s.user_name} <span className="text-sm text-gray-400">({s.user_email})</span></p>
                            <p className="text-gray-300 my-2">{s.message}</p>
                            <p className="text-xs text-gray-500">Received: {formatDate(s.created_at)}</p>
                            {s.admin_reply && (
                                <div className="mt-3 border-t border-gray-700 pt-3">
                                    <p className="text-cyan-300 text-sm"><strong>Your reply:</strong> {s.admin_reply}</p>
                                    <p className="text-xs text-gray-500 mt-1">Replied: {formatDate(s.replied_at)}</p>
                                </div>
                            )}
                        </div>
                        {s.status !== 'replied' && (
                            <button onClick={() => setReplyingTo(s)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors flex-shrink-0 ml-4">
                                Reply
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- MAIN COMPONENT THAT DECIDES WHICH VIEW TO SHOW ---
function SuggestImprovement() {
  const { user } = useAuth();

  // Render a different view based on the user's role
  if (!user) return null; // Or a loading state

  return user.role === 'admin' ? <AdminSuggestionView /> : <UserSuggestionView />;
}

export default SuggestImprovement;