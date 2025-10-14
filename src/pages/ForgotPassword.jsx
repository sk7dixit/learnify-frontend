// src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Verify OTP, 3: Reset Password
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const response = await api.post('/users/forgot-password', { emailOrMobile });
      setMessage(response.data.message);
      setStep(2); // Move to the next step
    } catch (err) {
      setError(err.response?.data?.error || '❌ Failed to send OTP. Please check your details.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const response = await api.post('/users/verify-otp', { mobileNumber: emailOrMobile, otp });
      setMessage(response.data.message);
      setStep(3); // Move to the password reset step
    } catch (err) {
      setError(err.response?.data?.error || '❌ OTP verification failed. Please try again.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await api.post('/users/reset-password', {
        mobileNumber: emailOrMobile,
        otp,
        newPassword
      });
      setMessage(response.data.message);
      setTimeout(() => navigate('/login'), 2000); // Redirect to login
    } catch (err) {
      setError(err.response?.data?.error || '❌ Failed to reset password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4 md:p-8">
      <div className="bg-gray-800 bg-opacity-70 backdrop-filter backdrop-blur-lg border border-gray-700 rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-sm lg:max-w-md">
        <h2 className="text-4xl font-extrabold text-cyan-400 mb-6 text-center tracking-wide">
          Forgot Password
        </h2>

        {message && <p className="text-green-400 text-center mb-4">{message}</p>}
        {error && <p className="text-red-400 text-center mb-4">{error}</p>}

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label htmlFor="emailOrMobile" className="block text-lg font-medium text-gray-300 mb-2">
                Email or Mobile Number
              </label>
              <input
                type="text"
                id="emailOrMobile"
                className="w-full px-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200"
                placeholder="email@example.com or +91XXXXXXXXXX"
                value={emailOrMobile}
                onChange={(e) => setEmailOrMobile(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:from-cyan-700 hover:to-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg"
            >
              Send Verification Code
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <p className="text-center text-gray-300">
              A 6-digit code has been sent to your mobile number.
            </p>
            <div>
              <label htmlFor="otp" className="block text-lg font-medium text-gray-300 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                id="otp"
                className="w-full px-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:from-cyan-700 hover:to-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg"
            >
              Verify Code
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-lg font-medium text-gray-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                className="w-full px-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-lg font-medium text-gray-300 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="w-full px-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:from-cyan-700 hover:to-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg"
            >
              Reset Password
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-gray-400 text-sm">
          Remembered your password?{' '}
          <Link
            to="/login"
            className="text-cyan-400 hover:text-cyan-300 font-semibold transition duration-200"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;