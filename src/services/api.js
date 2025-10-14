// src/services/api.js
import axios from "axios";

// Use the Vite environment variable for production, fallback to localhost for dev.
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

// Always append /api here so you can call api.post('/users/login')
const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true, // allow cookies / credentials if needed
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
