// src/services/api.js
import axios from "axios";

// --- Configuration ---
// 1. Use VITE_API_URL (set on Netlify/Render for live backend link)
// 2. Fallback to localhost for local development
// 3. The fallback URL below should be replaced with your live backend URL for testing consistency.
const LIVE_BACKEND_URL = "https://learnify-backend-g6cx.onrender.com"; // ⚠️ Replace with your actual live backend URL!

const API_URL =
  import.meta.env.VITE_API_URL || LIVE_BACKEND_URL;

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