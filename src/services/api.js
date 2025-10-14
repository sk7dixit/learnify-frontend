import axios from 'axios';

// Get the base URL from environment variables for production, or use a local default.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  // THE FIX IS HERE: We add the '/api' prefix to the base URL.
  // Now every call like api.post('/users/login') will correctly go to '.../api/users/login'.
  baseURL: `${API_URL}/api`,
});

// No changes are needed for the interceptor.
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
