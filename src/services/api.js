// src/services/api.js
// Axios wrapper with: access-token attach, refresh token flow, helper exports
import axios from "axios";

// --------- Configuration ----------
const LIVE_BACKEND_URL = "https://learnify-backend-g6cx.onrender.com"; // replace if needed
const API_BASE = import.meta.env.VITE_API_URL || LIVE_BACKEND_URL;
const BASE_URL = `${API_BASE.replace(/\/$/, "")}/api`;

// --------- Axios instance ----------
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // important: allows browser to send HttpOnly refresh cookie
  headers: {
    "Content-Type": "application/json",
  },
});

// --------- Token helpers ----------
const ACCESS_TOKEN_KEY = "token"; // sessionStorage key

export function setAccessToken(token) {
  if (token) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  }
}

export function getAccessToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY) || null;
}

export function clearAccessToken() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}

// --------- Request interceptor (attach access token) ----------
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// --------- Refresh flow utilities ----------
let isRefreshing = false;
let refreshSubscribers = [];

/**
 * Add subscriber callback to be called when refresh completes
 * callback will receive newToken (or null on failure)
 */
function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(newToken) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

/**
 * Attempt to call refresh endpoint to obtain a new access token.
 * Returns { success: boolean, token?: string }
 *
 * Notes:
 * - This uses the raw axios instance to avoid recursion with 'api'.
 * - Server is expected to use refresh cookie to authenticate this call.
 */
async function requestRefreshToken() {
  try {
    // Try /auth/refresh first, fallback to /users/refresh
    const endpoints = ["/auth/refresh", "/users/refresh", "/auth/token/refresh"];
    for (const ep of endpoints) {
      try {
        // Use global axios instance to bypass API interceptor with expired token
        const resp = await axios.post(`${BASE_URL}${ep}`, {}, { withCredentials: true });
        // Prefer response.data.token, else header 'x-new-access-token'
        const newToken = resp?.data?.token || resp?.headers?.["x-new-access-token"] || null;
        if (newToken) return { success: true, token: newToken };
      } catch (e) {
        // try next endpoint
      }
    }
    return { success: false };
  } catch (err) {
    return { success: false };
  }
}

// --------- Response interceptor (handle 401 -> refresh) ----------
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If no response or status not 401, reject immediately
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // Avoid infinite loop: don't retry refresh endpoint itself
    if (originalRequest._retry) {
      // Already retried once
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    // If a refresh is already happening, queue the request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(async (newToken) => {
          if (newToken) {
            // update header and retry
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            try {
              const res = await api(originalRequest);
              resolve(res);
            } catch (err) {
              reject(err);
            }
          } else {
            reject(error);
          }
        });
      });
    }

    // Start refresh process
    isRefreshing = true;
    try {
      const { success, token: newToken } = await requestRefreshToken();
      if (!success || !newToken) {
        // refresh failed: clear token and notify subscribers
        clearAccessToken();
        onRefreshed(null);
        isRefreshing = false;
        return Promise.reject(error);
      }

      // Save new token and notify queued requests
      setAccessToken(newToken);
      onRefreshed(newToken);
      isRefreshing = false;

      // Retry original request with new token
      originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (err) {
      clearAccessToken();
      onRefreshed(null);
      isRefreshing = false;
      return Promise.reject(err);
    }
  }
);

// --------- Convenience helpers for auth flows ----------

/**
 * logout: call backend to revoke refresh token (server should clear cookie)
 */
export async function logout() {
  try {
    // PHASE 1 FIX: Use the path defined in userRoutes.js
    await api.post("/users/logout");
  } catch (err) {
    // If logout fails, continue to clear client state
    console.warn("Logout failed on server side, clearing local tokens.");
  } finally {
    try {
      clearAccessToken();
    } catch (e) {}
  }
}

/**
 * Exchange credentials for token via login (helper example).
 * The controller may respond with { token, user, remember } — store token if present.
 * This is a convenience wrapper; you can still call api.post('/auth/login', ...) directly.
 */
export async function login(credentials = {}) {
  // credentials: { identifier, password, twoFactorCode, rememberMe }
  const resp = await api.post("/auth/login", credentials);
  const token = resp?.data?.token || null;
  if (token) setAccessToken(token);
  return resp;
}

// ... (2FA and Badge helpers remain unchanged) ...

// --------- Export default axios instance ----------
export default api;