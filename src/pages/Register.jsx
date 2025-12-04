import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, Globe, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Logo from '../components/ui/Logo';

const Register = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const fullMobileNumber = mobileNumber.startsWith('+') ? mobileNumber : (countryCode + mobileNumber);

    try {
      await api.post('/users/register', { name, email, password, mobileNumber: fullMobileNumber, username });
      setShowOtpInput(true);
      setMessage('✅ Account created. Please enter the OTP sent to your email.');
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
      setMessage('✅ Email verified! Redirecting...');
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px]"></div>
      </div>

      <GlassCard className="w-full max-w-md animate-fade-in-up">
        <div className="flex flex-col items-center mb-8">
          <Logo size="lg" className="mb-2" />
          <p className="text-slate-400 text-center">
            {showOtpInput ? 'Verify your email to continue' : 'Create your account to get started'}
          </p>
        </div>

        {message && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-start gap-2">
            <CheckCircle size={18} className="mt-0.5 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!showOtpInput ? (
          <form onSubmit={handleRegister} className="space-y-5">
            <Input
              icon={User}
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              icon={User}
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <Input
              icon={Mail}
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="flex gap-3">
              <div className="relative w-28 shrink-0">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Globe size={20} />
                </div>
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full pl-10 pr-2 py-3 glass-input rounded-xl appearance-none cursor-pointer"
                >
                  <option value="+91">+91</option>
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                  <option value="+61">+61</option>
                </select>
              </div>
              <Input
                icon={Phone}
                type="tel"
                placeholder="Mobile Number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                required
                containerClassName="flex-1"
              />
            </div>

            <Input
              icon={Lock}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" isLoading={loading} className="w-full mt-2">
              Create Account <ArrowRight size={18} />
            </Button>
          </form>
        ) : (
          <form onSubmit={handleOtpVerification} className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-slate-300 text-sm">
                We sent a code to <span className="text-cyan-400 font-medium">{email}</span>
              </p>
              <p className="text-xs text-amber-400/80 bg-amber-400/10 py-2 px-3 rounded-lg inline-block">
                ⚠️ Check your Spam/Junk folder if not received
              </p>
            </div>

            <Input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="text-center text-2xl tracking-widest font-mono"
              maxLength={6}
              required
              autoFocus
            />

            <Button type="submit" isLoading={loading} className="w-full">
              Verify Email <CheckCircle size={18} />
            </Button>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline transition-all">
              Sign in
            </Link>
          </p>
        </div>
      </GlassCard>
    </div>
  );
};

export default Register;