// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    const currentToken = sessionStorage.getItem('token');
    if (!currentToken) return;
    try {
      const response = await api.get('/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error("Failed to fetch unread notification count:", error);
    }
  }, []);

  useEffect(() => {
    try {
      const storedToken = sessionStorage.getItem('token');
      const storedUser = JSON.parse(sessionStorage.getItem('user'));
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        fetchUnreadCount();
      }
    } catch (error) {
      console.error("Failed to parse user from sessionStorage", error);
      sessionStorage.clear();
    } finally {
      setLoading(false);
    }
  }, [fetchUnreadCount]);

  // *** NEW FUNCTION TO RE-SYNC USER DATA FROM SERVER ***
  const refreshUser = useCallback(async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return; // No need to refresh if not logged in
    try {
        const { data } = await api.get('/users/profile');
        // Update both the React state and the session storage
        setUser(data);
        sessionStorage.setItem('user', JSON.stringify(data));
        console.log("User data refreshed:", data);
    } catch (error) {
        console.error("Failed to refresh user data:", error);
        // If token is invalid, log the user out
        logout();
    }
  }, []);

  const login = useCallback((newToken, newUser) => {
    sessionStorage.setItem('token', newToken);
    sessionStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  const logout = useCallback(() => {
    sessionStorage.clear();
    setToken(null);
    setUser(null);
    setUnreadCount(0);
  }, []);

  const updateUserProfile = useCallback((updatedData) => {
    setUser(currentUser => {
      const newUserState = { ...currentUser, ...updatedData };
      sessionStorage.setItem('user', JSON.stringify(newUserState));
      return newUserState;
    });
  }, []);

  const contextValue = {
    user, token, login, logout, updateUserProfile,
    loading, unreadCount, fetchUnreadCount,
    refreshUser // <-- EXPORT THE NEW FUNCTION
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};