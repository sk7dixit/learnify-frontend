import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState(''); // Mobile state remains simple string (e.g. "+919876543210")
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [countryCode, setCountryCode] = useState('+91'); // NEW State for Country Code
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    // Combine code and number for the final payload
    const fullMobileNumber = mobileNumber.startsWith('+') ? mobileNumber : (countryCode + mobileNumber);

    try {
      await api.post('/users/register', { name, email, password, mobileNumber: fullMobileNumber, username });
      setShowOtpInput(true);
      setMessage('✅ Account created. Please enter the OTP sent to your email. (Note: Check your Spam/Junk folder if you do not receive it immediately.)');
    } catch (err) {
      setError(err.response?.data?.error || '❌ Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await api.post('/users/verify-email-otp', { email, otp });
      const { token, user } = res.data;
      login(token, user);
      setMessage('✅ Email verified! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || '❌ OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4 md:p-8">
      <div className="bg-gray-800 bg-opacity-70 backdrop-filter backdrop-blur-lg border border-gray-700 rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-sm lg:max-w-md">
        <h2 className="text-4xl font-extrabold text-cyan-400 mb-6 text-center tracking-wide">
          Join Us Today!
        </h2>

        {message && <p className="text-center text-sm font-medium text-green-400 mb-4">{message}</p>}
        {error && <p className="text-center text-sm font-medium text-red-400 mb-4">{error}</p>}

        {!showOtpInput ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-lg font-medium text-gray-300 mb-2">Name</label>
              <input type="text" id="name" className="w-full px-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg text-white" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="username" className="block text-lg font-medium text-gray-300 mb-2">Username</label>
              <input type="text" id="username" className="w-full px-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg text-white" placeholder="e.g., sunny_d" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="email" className="block text-lg font-medium text-gray-300 mb-2">Email</label>
              <input type="email" id="email" className="w-full px-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg text-white" placeholder="your@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            {/* PHASE 3 FIX: Mobile Number Input with Country Code Dropdown */}
            <div>
              <label htmlFor="mobileNumber" className="block text-lg font-medium text-gray-300 mb-2">Mobile Number</label>
              <div className="flex space-x-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="px-3 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg text-white"
                >
                  <option value="+91">+91 (IN)</option>
                  <option value="+1">+1 (US/CA)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+61">+61 (AU)</option>
                  <option value="+000">Other</option>
                </select>
                <input
                  type="tel"
                  id="mobileNumber"
                  className="flex-1 px-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg text-white"
                  placeholder="9876543210"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  required
                />
              </div>
            </div>
            {/* END FIX */}

            <div>
              <label htmlFor="password" className="block text-lg font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} id="password" className="w-full px-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg text-white pr-10" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                {/* UX: Password visibility toggle is already correctly implemented here */}
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {/* Placeholder for Eye icon SVG */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showPassword ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.125m-3.447 3.447L1.65 12a10.05 10.05 0 001.563 3.125M4.875 7.175A10.05 10.05 0 0012 5c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-1.563 3.125M12 13a3 3 0 100-6 3 3 0 000 6z" : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.828 7.522 5 12 5c4.478 0 8.268 2.828 9.542 7-1.274 4.172-5.064 7-9.542 7-4.478 0-8.268-2.828-9.542-7z"} /></svg>
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:from-cyan-700 hover:to-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg disabled:opacity-50">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpVerification} className="space-y-6">
            <div className="text-center text-gray-300">
              <p>An OTP has been sent to **{email}**. Please enter it below.</p>
              {/* FIX: New instruction for the user */}
              <p className="mt-2 text-yellow-400 text-sm font-semibold">
                ⚠️ **If you don't receive the email, please check your Spam or Junk folder.**
              </p>
            </div>
            <div>
              <label htmlFor="otp" className="block text-lg font-medium text-gray-300 mb-2">Enter OTP</label>
              <input type="text" id="otp" className="w-full px-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg text-white" placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:from-cyan-700 hover:to-blue-700 transition duration-300 disabled:opacity-50">
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-gray-400 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition duration-200">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;