// src/components/GlobalChat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api'; // Import your api instance

const profanityFilter = ['badword1', 'badword2'];

function GlobalChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const { user } = useAuth();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!isOpen) return;
        const q = query(collection(db, 'chat_messages'), orderBy('createdAt', 'asc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const msgs = [];
            querySnapshot.forEach((doc) => {
                msgs.push({ id: doc.id, ...doc.data() });
            });
            setMessages(msgs);
        });
        return () => unsubscribe();
    }, [isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || isSending) return;
        if (!user || !user.username) {
            alert("Error: Your user data is not loaded correctly. Please log out and log back in.");
            return;
        }
        if (profanityFilter.some(word => newMessage.toLowerCase().includes(word))) {
            alert("Inappropriate language is not allowed.");
            return;
        }
        setIsSending(true);
        try {
            await addDoc(collection(db, 'chat_messages'), {
                text: newMessage,
                username: user.username,
                createdAt: serverTimestamp(),
                userId: user.id,
            });
            setNewMessage('');
        } catch (error) {
            console.error("Error sending message to Firebase:", error);
            alert("Could not send message. Please check the console for errors.");
        } finally {
            setIsSending(false);
        }
    };

    // --- NEW ADMIN FUNCTION: Delete a single message ---
    const handleDeleteMessage = async (messageId) => {
        if (!window.confirm("Are you sure you want to delete this message?")) return;
        try {
            await api.delete(`/chat/messages/${messageId}`);
            // The UI will update automatically due to the onSnapshot listener
        } catch (error) {
            console.error("Failed to delete message:", error);
            alert("Could not delete the message.");
        }
    };

    // --- NEW ADMIN FUNCTION: Clear all chat ---
    const handleClearAllChat = async () => {
        if (!window.confirm("Are you sure you want to delete ALL messages in this chat? This cannot be undone.")) return;
        try {
            await api.delete('/chat/all');
            // UI will update via listener
        } catch (error) {
            console.error("Failed to clear chat:", error);
            alert("Could not clear the chat history.");
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Sending...';
        return new Date(timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!isOpen) {
        // FIX: Added sm:hidden to ensure the chat icon only shows on mobile (small screens)
        return (
            <button onClick={() => setIsOpen(true)} className="fixed bottom-5 right-5 bg-cyan-600 text-white p-4 rounded-full shadow-lg z-50 hover:bg-cyan-700 transition-colors sm:hidden">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </button>
        );
    }

    return (
        // Chat is now open as a modal-like fixed window
        <div className="fixed bottom-5 right-5 w-[350px] h-[500px] bg-gray-800 border border-gray-700 rounded-lg shadow-2xl flex flex-col z-50 animate-fadeInUp">
            <div className="flex justify-between items-center p-3 bg-gray-900 rounded-t-lg">
                <h3 className="font-bold text-lg text-cyan-400">Global Chat</h3>
                <div className="flex items-center space-x-2">
                    {/* --- NEW: Clear All button for admins --- */}
                    {user?.role === 'admin' && (
                        <button onClick={handleClearAllChat} title="Clear All Chat" className="text-red-500 hover:text-red-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    )}
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 text-2xl hover:text-white">&times;</button>
                </div>
            </div>
            <div className="flex-1 p-3 overflow-y-auto">
                {messages.map(msg => (
                    <div key={msg.id} className={`mb-3 flex items-center group ${msg.username === user.username ? 'justify-end' : 'justify-start'}`}>
                        <div className={`inline-block p-2 rounded-lg max-w-[80%] ${msg.username === user.username ? 'bg-cyan-800' : 'bg-gray-700'}`}>
                            <div className="text-xs text-gray-400 flex justify-between items-center">
                                <Link to={`/profile/${msg.username}`} className="font-bold hover:underline">{msg.username === user.username ? 'You' : msg.username}</Link>
                                <span className="ml-2">{formatDate(msg.createdAt)}</span>
                            </div>
                            <p className="text-white break-words">{msg.text}</p>
                        </div>
                        {/* --- NEW: Delete button for admins --- */}
                        {user?.role === 'admin' && (
                            <button onClick={() => handleDeleteMessage(msg.id)} className="ml-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                            </button>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-700 flex items-center space-x-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-700 p-2 rounded-lg text-white outline-none focus:ring-2 focus:ring-cyan-500"
                    disabled={isSending}
                />
                <button type="submit" className="bg-cyan-600 p-2 rounded-lg text-white hover:bg-cyan-700 disabled:opacity-50" disabled={isSending}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                </button>
            </form>
        </div>
    );
}

export default GlobalChat;