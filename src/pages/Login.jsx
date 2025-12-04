import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Key, ArrowRight, ShieldCheck, Smartphone, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api, { setAccessToken } from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Logo from '../components/ui/Logo';

function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' | 'otp'
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleSuccessfulLogin = (response) => {
    const token = response?.data?.token || response?.data?.accessToken || null;
    const user = response?.data?.user || response?.data?.profile || null;

    if (token) {
      try {
        authLogin(token, user);
      } catch (e) {
        try { setAccessToken(token); } catch (_) { }
      }
      setMessage('Login successful — redirecting...');
      setError('');
      setLoading(false);
      const target = (user && user.role === 'admin') ? '/admin-dashboard' : '/dashboard';
      setTimeout(() => navigate(target, { replace: true }), 900);
      return;
    }

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
        const payload = {
          identifier: identifier.trim(),
          password,
          twoFactorCode: twoFactorRequired ? twoFactorCode.trim() : undefined,
          rememberMe,
        };

        const response = await api.post('/users/login', payload);
        if (response.data && response.data.twoFactorRequired) {
          setTwoFactorRequired(true);
          setError(response.data.error || 'Two-factor authentication required. Enter code.');
          setLoading(false);
          return;
        }

        handleSuccessfulLogin(response);

      } else {
        if (!isOtpSent) {
          const resp = await api.post('/users/login-otp-request', { identifier: identifier.trim() });
          setMessage(resp.data?.message || 'OTP sent. Please check your device.');
          setIsOtpSent(true);
          setLoading(false);
        } else {
          const resp = await api.post('/users/login-otp-verify', { identifier: identifier.trim(), otp: otp.trim(), rememberMe });
          handleSuccessfulLogin(resp);
        }
      }
    } catch (err) {
      const srv = err.response?.data;
      if (srv?.twoFactorRequired) {
        setTwoFactorRequired(true);
        setError(srv.error || 'Two-factor required. Enter code.');
      } else if (/verify/i.test(srv?.error || '')) {
        setError(srv?.error || 'Email not verified.');
      } else {
        setError(srv?.error || 'Login failed. Check credentials and try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/20 rounded-full blur-[120px]"></div>
      </div>

      <GlassCard className="w-full max-w-md animate-fade-in-up">
        <div className="flex flex-col items-center mb-8">
          <Logo size="lg" className="mb-2" />
          <p className="text-slate-400 text-center">Welcome back, please login to continue</p>
        </div>

        {/* Method Switcher */}
        <div className="flex p-1 bg-slate-800/50 rounded-xl mb-6 border border-slate-700/50">
          <button
            onClick={() => switchMethod('password')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${loginMethod === 'password'
                ? 'bg-cyan-500/20 text-cyan-400 shadow-sm border border-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
              }`}
          >
            <Key size={16} /> Password
          </button>
          <button
            onClick={() => switchMethod('otp')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${loginMethod === 'otp'
                ? 'bg-cyan-500/20 text-cyan-400 shadow-sm border border-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
              }`}
          >
            <Smartphone size={16} /> OTP Login
          </button>
        </div>

        {message && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-start gap-2 animate-fade-in-up">
            <CheckCircle size={18} className="mt-0.5 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex flex-col gap-2 animate-fade-in-up">
            <div className="flex items-start gap-2">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
            {error.includes('verified') && (
              <button
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="text-xs font-semibold text-red-300 hover:text-red-200 underline self-start ml-6"
              >
                {resendLoading ? 'Resending...' : 'Resend verification email'}
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            icon={Mail}
            placeholder="Email or Username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            disabled={isOtpSent || twoFactorRequired || loading}
          />

          {loginMethod === 'password' && !twoFactorRequired && (
            <>
              <div className="space-y-1">
                <Input
                  icon={Lock}
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline">
                    Forgot Password?
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-800"
                  disabled={loading}
                />
                <label htmlFor="rememberMe" className="text-sm text-slate-300 cursor-pointer select-none">
                  Remember me for 10 days
                </label>
              </div>
            </>
          )}

          {twoFactorRequired && (
            <div className="animate-fade-in-up">
              <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl mb-4">
                <p className="text-sm text-cyan-200 flex items-center gap-2">
                  <ShieldCheck size={18} />
                  Two-Factor Authentication Required
                </p>
                <p className="text-xs text-slate-400 mt-1 ml-6">
                  Enter the code from your authenticator app.
                </p>
              </div>
              <Input
                icon={ShieldCheck}
                placeholder="Enter 6-digit 2FA Code"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                required
                disabled={loading}
                autoFocus
                className="text-center tracking-widest font-mono text-lg"
              />
            </div>
          )}

          {loginMethod === 'otp' && isOtpSent && (
            <div className="animate-fade-in-up">
              <Input
                icon={Key}
                placeholder="Enter OTP Code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                disabled={loading}
                autoFocus
                className="text-center tracking-widest font-mono text-lg"
              />
            </div>
          )}

          <Button type="submit" isLoading={loading} className="w-full mt-2">
            {loading ? (
              'Processing...'
            ) : (
              <>
                {loginMethod === 'password'
                  ? (twoFactorRequired ? 'Verify & Login' : 'Sign In')
                  : (isOtpSent ? 'Verify OTP' : 'Send OTP')
                }
                {!loading && <ArrowRight size={18} />}
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline transition-all">
              Create Account
            </Link>
          </p>
        </div>
      </GlassCard>
    </div>
  );
}

export default Login;
