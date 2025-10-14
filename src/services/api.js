// src/services/api.js
import axios from 'axios';

// This line automatically chooses the correct API URL.
// In development, it uses your local server.
// In production (after deploying), it will use the live URL you set in the environment variables.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// The interceptor remains the same, no changes needed here.
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;