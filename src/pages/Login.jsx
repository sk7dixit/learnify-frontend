// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { setAccessToken } from '../services/api';

function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' | 'otp'
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  // Called when a successful login response arrives
  const handleSuccessfulLogin = (response) => {
    // Response shape: { data: { token, user } } (server may vary)
    const token = response?.data?.token || response?.data?.accessToken || null;
    const user = response?.data?.user || response?.data?.profile || null;

    if (token) {
      // Let AuthContext handle storing token/user or store here if needed
      try {
        authLogin(token, user); // your AuthContext's login function
      } catch (e) {
        // Fallback: store token in api helper if AuthContext doesn't
        try { setAccessToken(token); } catch (_) {}
      }
      setMessage('Login successful — redirecting...');
      setError('');
      setLoading(false);
      const target = (user && user.role === 'admin') ? '/admin-dashboard' : '/dashboard';
      setTimeout(() => navigate(target, { replace: true }), 900);
      return;
    }

    // If no token but server returned something else (rare), show a message
    setMessage(response?.data?.message || 'Logged in (no token provided).');
    setLoading(false);
  };

  const switchMethod = (method) => {
    setLoginMethod(method);
    setError('');
    setMessage('');
    setIsOtpSent(false);
    setOtp('');
    setPassword('');
    setTwoFactorRequired(false);
    setTwoFactorCode('');
  };

  const getButtonText = () => {
    if (loading) {
      if (loginMethod === 'password') return twoFactorRequired ? 'Verifying 2FA...' : 'Logging in...';
      return isOtpSent ? 'Verifying...' : 'Sending...';
    }
    if (loginMethod === 'password') return twoFactorRequired ? 'Verify 2FA' : 'Log In';
    return isOtpSent ? 'Login with OTP' : 'Send OTP';
  };

  // resend verification link (phase 6)
  const handleResendVerification = async () => {
    if (!identifier) return setError('Enter your email or username to resend verification.');
    setResendLoading(true);
    setError('');
    setMessage('');
    try {
      const resp = await api.post('/users/resend-verification', { identifier });
      setMessage(resp?.data?.message || 'Verification link resent. Check your inbox.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend verification link.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (loginMethod === 'password') {
        // Login with password (may require 2FA)
        const payload = {
          identifier: identifier.trim(),
          password,
          twoFactorCode: twoFactorRequired ? twoFactorCode.trim() : undefined,
          rememberMe, // informs backend to issue longer refresh token / cookie
        };

        const response = await api.post('/users/login', payload);
        // Server may respond with { twoFactorRequired: true } and 200/403
        if (response.data && response.data.twoFactorRequired) {
          setTwoFactorRequired(true);
          setError(response.data.error || 'Two-factor authentication required. Enter code.');
          setLoading(false);
          return;
        }

        // Otherwise, treat as successful
        handleSuccessfulLogin(response);

      } else {
        // OTP flow: two-step
        if (!isOtpSent) {
          // Request OTP to be sent to the user's mobile/email depending on server impl
          const resp = await api.post('/users/login-otp-request', { identifier: identifier.trim() });
          setMessage(resp.data?.message || 'OTP sent. Please check your device.');
          setIsOtpSent(true);
          setLoading(false);
        } else {
          // Verify OTP
          const resp = await api.post('/users/login-otp-verify', { identifier: identifier.trim(), otp: otp.trim(), rememberMe });
          // OTP verify should return token + user
          handleSuccessfulLogin(resp);
        }
      }
    } catch (err) {
      // Server could respond with various payloads:
      // - { error: '...', twoFactorRequired: true }
      // - { error: 'Email not verified' }
      const srv = err.response?.data;
      if (srv?.twoFactorRequired) {
        // Server is telling us 2FA must be completed
        setTwoFactorRequired(true);
        setError(srv.error || 'Two-factor required. Enter code.');
      } else if (/verify/i.test(srv?.error || '')) {
        // Likely not verified email
        setError(srv?.error || 'Email not verified. You may resend verification.');
        setMessage('');
      } else {
        setError(srv?.error || 'Login failed. Check credentials and try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="bg-gray-800 bg-opacity-75 border border-gray-700 rounded-xl shadow-2xl p-6 max-w-md w-full">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-cyan-400 mb-6 text-center tracking-tight">Welcome Back</h2>

        <div className="flex justify-center border border-gray-600 rounded-lg p-1 mb-5">
          <button
            onClick={() => switchMethod('password')}
            className={`w-1/2 py-2 rounded-md text-sm font-semibold ${loginMethod === 'password' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          >
            Use Password
          </button>
          <button
            onClick={() => switchMethod('otp')}
            className={`w-1/2 py-2 rounded-md text-sm font-semibold ${loginMethod === 'otp' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          >
            Use OTP
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-300 mb-2">Email or Username</label>
            <input
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              disabled={isOtpSent || twoFactorRequired || loading}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="your@example.com or username"
            />
          </div>

          {loginMethod === 'password' && !twoFactorRequired && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                  aria-label={showPassword ? 'Hide' : 'Show'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="flex justify-between items-center mt-2">
                <Link to="/forgot-password" className="text-sm text-gray-400 hover:text-cyan-400">Forgot Password?</Link>
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="form-checkbox h-4 w-4 text-cyan-500"
                    disabled={loading}
                  />
                  Remember me (10 days)
                </label>
              </div>
            </div>
          )}

          {twoFactorRequired && (
            <div>
              <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-300 mb-2">2FA Code</label>
              <input
                id="twoFactorCode"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                required
                disabled={loading}
                placeholder="123456"
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <p className="text-xs text-gray-400 mt-2">Enter the code from your authenticator app. If you don't have one, use the 'Disable 2FA' flow in account settings after logging in.</p>
            </div>
          )}

          {loginMethod === 'otp' && isOtpSent && (
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-2">OTP</label>
              <input
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                disabled={loading}
                placeholder="6-digit code"
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700 transition transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {getButtonText()}
          </button>
        </form>

        {/* Messages */}
        {error && (
          <div className="mt-4 text-center">
            <p className="text-red-400">{error}</p>

            {/* If server indicates verification needed, offer resend */}
            <div className="mt-2 flex items-center justify-center gap-2">
              <button
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="text-sm text-cyan-300 hover:text-cyan-200"
              >
                {resendLoading ? 'Resending...' : 'Resend verification'}
              </button>
            </div>
          </div>
        )}

        {message && <p className="mt-4 text-center text-green-400">{message}</p>}

        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
