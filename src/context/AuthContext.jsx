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
    // Check if we have an access token in session storage or state
    if (!sessionStorage.getItem('token')) return;
    try {
      const response = await api.get('/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error("Failed to fetch unread notification count:", error);
    }
  }, []);

  const logout = useCallback(async () => {
    // Notify the backend to revoke the refresh token cookie
    try {
      await api.post('/users/logout');
    } catch (error) {
      console.error("Error during logout (revoke token):", error);
    }
    sessionStorage.clear();
    setToken(null);
    setUser(null);
    setUnreadCount(0);
    // Reload to clear state globally and ensure cookie is clear
    window.location.href = '/login';
  }, []);

  // *** PHASE 1 FIX: Logic to check local storage and refresh token from cookie ***
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = sessionStorage.getItem('token');
        const storedUser = JSON.parse(sessionStorage.getItem('user'));

        // 1. Check for valid session/token
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
          fetchUnreadCount();
          return;
        }

        // 2. If no session, attempt to refresh token via cookie
        console.log("Attempting token refresh via cookie...");
        const refreshResponse = await api.post('/users/refresh-token');

        // Success: Backend returned a new access token
        const newAccessToken = refreshResponse.data.token;
        if (newAccessToken) {
          // Note: The /refresh-token endpoint should ideally return the full user payload
          // We will call /users/profile to get the full user data securely
          api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

          const userResponse = await api.get('/users/profile');
          const freshUser = userResponse.data;

          sessionStorage.setItem('token', newAccessToken);
          sessionStorage.setItem('user', JSON.stringify(freshUser));
          setToken(newAccessToken);
          setUser(freshUser);
          fetchUnreadCount();
        }
      } catch (error) {
        // Refresh failed (cookie expired, missing, or invalid)
        console.log("Refresh token failed/not present:", error?.response?.data?.error || error.message);
        sessionStorage.clear();
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();

  }, [fetchUnreadCount, logout]);

  // *** NEW FUNCTION TO RE-SYNC USER DATA FROM SERVER ***
  const refreshUser = useCallback(async () => {
    const currentToken = sessionStorage.getItem('token');
    if (!currentToken) return;
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
  }, [logout]);

  const login = useCallback((newToken, newUser) => {
    sessionStorage.setItem('token', newToken);
    sessionStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    fetchUnreadCount();
  }, [fetchUnreadCount]);

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
    refreshUser
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