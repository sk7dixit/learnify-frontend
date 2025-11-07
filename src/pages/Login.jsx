// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState('password');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  // A single function to handle the logic after a successful API call
  const handleSuccessfulLogin = (response) => {
    const { token, user } = response.data;
    login(token, user);
    setMessage('Login successful! Redirecting...');
    // Ensure loading is set to false BEFORE redirecting on success
    setLoading(false);
    // Redirect admin to admin dashboard, users to user dashboard
    const target = user.role === 'admin' ? '/admin-dashboard' : '/dashboard';
    setTimeout(() => navigate(target, { replace: true }), 1000);
  };

  // Resets state when switching between login methods
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

  // Dynamically determines the text for the main submit button
  const getButtonText = () => {
    if (loading) {
      if (loginMethod === 'password') return twoFactorRequired ? 'Verifying 2FA...' : 'Logging in...';
      return isOtpSent ? 'Verifying...' : 'Sending...';
    }
    if (loginMethod === 'password') return twoFactorRequired ? 'Verify 2FA' : 'Log In';
    return isOtpSent ? 'Login with OTP' : 'Send OTP';
  };

  // A single submit handler for the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (loginMethod === 'password') {
        // Handle password or 2FA login
        const payload = { identifier, password, twoFactorCode };
        const response = await api.post('/users/login', payload);

        handleSuccessfulLogin(response);

      } else {
        // Handle the two-step OTP login
        if (!isOtpSent) {
          // Step 1: Request the OTP
          const response = await api.post('/users/login-otp-request', { identifier });
          setMessage(response.data.message);
          setIsOtpSent(true);
          // Turn loading off after sending OTP but before step 2
          setLoading(false);
        } else {
          // Step 2: Verify the OTP
          const response = await api.post('/users/login-otp-verify', { identifier, otp });
          handleSuccessfulLogin(response);
        }
      }
    } catch (err) {
      const serverError = err.response?.data;
      if (serverError?.twoFactorRequired) {
        // New server response for 2FA requirement
        setTwoFactorRequired(true);
        setError(serverError.error);
        // Turn loading OFF if 2FA is required, to allow user to input the code and submit again
        setLoading(false);
      } else {
        setError(serverError?.error || 'An unexpected error occurred.');
        // Turn loading OFF on all other failures
        setLoading(false);
      }
    }
    // Removed redundant finally block condition
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="bg-gray-800 bg-opacity-70 backdrop-filter backdrop-blur-lg border border-gray-700 rounded-xl shadow-2xl p-8 max-w-md w-full">
        <h2 className="text-4xl font-extrabold text-cyan-400 mb-6 text-center tracking-wide">
          Welcome Back!
        </h2>

        {/* --- Login Method Toggle --- */}
        <div className="flex justify-center border border-gray-600 rounded-lg p-1 mb-6">
          <button onClick={() => switchMethod('password')} className={`w-1/2 py-2 rounded-md transition-colors text-sm font-semibold ${loginMethod === 'password' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
            Use Password
          </button>
          <button onClick={() => switchMethod('otp')} className={`w-1/2 py-2 rounded-md transition-colors text-sm font-semibold ${loginMethod === 'otp' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
            Use OTP
          </button>
        </div>

        {/* --- Single Form for Both Methods --- */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="identifier" className="block text-lg font-medium text-gray-300 mb-2">Email or Username</label>
            <input
              type="text"
              id="identifier"
              className="w-full px-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200"
              placeholder="your@example.com or your_username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              disabled={isOtpSent || twoFactorRequired} // Disable if OTP sent or 2FA required
            />
          </div>

          {/* Conditionally render Password field */}
          {loginMethod === 'password' && !twoFactorRequired && (
            <div>
              <label htmlFor="password" className="block text-lg font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="w-full px-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200 pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.879 16.121A4.995 4.995 0 0112 15c1.455 0 2.845.385 4.012 1.012m-5.858-4.904A2 2 0 1112 10a2 2 0 01-2 2z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                </button>
              </div>
              <Link to="/forgot-password" className="block text-right text-sm text-gray-400 hover:text-cyan-400 transition duration-200 mt-2">Forgot Password?</Link>
            </div>
          )}

          {/* --- NEW: 2FA Code Input --- */}
          {twoFactorRequired && (
            <div>
              <label htmlFor="twoFactorCode" className="block text-lg font-medium text-gray-300 mb-2">2FA Code</label>
              <input
                type="text"
                id="twoFactorCode"
                className="w-full px-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200"
                placeholder="Enter 6-digit code from authenticator app"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                required
              />
            </div>
          )}

          {/* Conditionally render OTP field for OTP login */}
          {loginMethod === 'otp' && isOtpSent && (
            <div>
              <label htmlFor="otp" className="block text-lg font-medium text-gray-300 mb-2">Enter OTP</label>
              <input
                type="text"
                id="otp"
                className="w-full px-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
          )}

          {/* --- Single Submit Button --- */}
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:from-cyan-700 hover:to-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg disabled:opacity-50">
            {getButtonText()}
          </button>
        </form>

        {/* --- Feedback Messages --- */}
        {error && <p className="text-red-400 text-center text-sm mt-4">{error}</p>}
        {message && <p className="text-green-400 text-center text-sm mt-4">{message}</p>}

        {/* --- Link to Register Page --- */}
        <p className="mt-8 text-center text-gray-400 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold transition duration-200">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;