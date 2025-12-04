import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Phone, Lock, ArrowRight, CheckCircle, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import api from "../services/api";
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Logo from '../components/ui/Logo';

const PHONE_PATTERN = /^(\+?\d{7,15})$/;
const RESEND_COOLDOWN = 60;

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1 = request, 2 = verify OTP (mobile), 3 = reset password (mobile), 4 = email-sent
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [isMobileFlow, setIsMobileFlow] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const resendTimerRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    };
  }, []);

  const startResendCountdown = (seconds = RESEND_COOLDOWN) => {
    setResendCountdown(seconds);
    if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    resendTimerRef.current = setInterval(() => {
      setResendCountdown((s) => {
        if (s <= 1) {
          clearInterval(resendTimerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const detectFlow = (value) => {
    if (!value) return "unknown";
    if (value.includes("@")) return "email";
    if (PHONE_PATTERN.test(value.trim())) return "mobile";
    const digits = value.replace(/\D/g, "");
    if (digits.length >= 7 && digits.length <= 15) return "mobile";
    return "email";
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSending(true);

    const flow = detectFlow(identifier.trim());
    setIsMobileFlow(flow === "mobile");

    try {
      if (flow === "mobile") {
        const resp = await api.post("/users/forgot-password", { mobileNumber: identifier.trim() });
        setMessage(resp.data?.message || "OTP sent to your mobile number.");
        setStep(2);
        startResendCountdown();
      } else {
        const resp = await api.post("/users/forgot-password", { email: identifier.trim() });
        setMessage(resp.data?.message || "Password reset link sent to your email.");
        setStep(4);
        startResendCountdown();
      }
    } catch (err) {
      const srv = err.response?.data;
      setError(srv?.error || "Failed to send reset instruction. Please try again later.");
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setVerifying(true);
    try {
      const resp = await api.post("/users/verify-otp", { mobileNumber: identifier.trim(), otp: otp.trim() });
      setMessage(resp.data?.message || "OTP verified. Please set a new password.");
      setStep(3);
    } catch (err) {
      const srv = err.response?.data;
      setError(srv?.error || "OTP verification failed. Try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setResetting(true);
    try {
      const payload = isMobileFlow
        ? { mobileNumber: identifier.trim(), otp: otp.trim(), newPassword }
        : { email: identifier.trim(), token: undefined, newPassword };

      const resp = await api.post("/users/reset-password", payload);
      setMessage(resp.data?.message || "Password updated successfully. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      const srv = err.response?.data;
      setError(srv?.error || "Failed to reset password. Try again.");
    } finally {
      setResetting(false);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0) return;
    setError("");
    setMessage("");
    setSending(true);
    try {
      if (isMobileFlow) {
        const resp = await api.post("/users/forgot-password", { mobileNumber: identifier.trim(), resend: true });
        setMessage(resp.data?.message || "OTP resent.");
      } else {
        const resp = await api.post("/users/forgot-password", { email: identifier.trim(), resend: true });
        setMessage(resp.data?.message || "Reset email resent.");
      }
      startResendCountdown();
    } catch (err) {
      const srv = err.response?.data;
      setError(srv?.error || "Failed to resend. Please wait and try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-purple-500/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[10%] right-[20%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[100px]"></div>
      </div>

      <GlassCard className="w-full max-w-md animate-fade-in-up">
        <div className="flex flex-col items-center mb-6">
          <Logo size="lg" className="mb-2" />
          <h2 className="text-xl font-semibold text-slate-200">Reset Password</h2>
          <p className="text-slate-400 text-sm text-center mt-1">
            {step === 1 && "Enter your email or mobile to receive instructions"}
            {step === 2 && "Enter the OTP sent to your mobile"}
            {step === 3 && "Create a new password"}
            {step === 4 && "Check your email"}
          </p>
        </div>

        {message && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-start gap-2 animate-fade-in-up">
            <CheckCircle size={18} className="mt-0.5 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2 animate-fade-in-up">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSend} className="space-y-5">
            <Input
              icon={Mail}
              placeholder="Email or Mobile Number"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              disabled={sending}
            />

            <Button type="submit" isLoading={sending} className="w-full">
              Send Instructions <ArrowRight size={18} />
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="text-center mb-2">
              <p className="text-sm text-slate-300">Sent to <span className="text-cyan-400 font-medium">{identifier}</span></p>
            </div>

            <Input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              disabled={verifying}
              className="text-center tracking-widest font-mono text-lg"
              autoFocus
            />

            <div className="flex gap-3">
              <Button type="submit" isLoading={verifying} className="flex-1">
                Verify OTP
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleResend}
                disabled={resendCountdown > 0}
                className="w-32"
              >
                {resendCountdown > 0 ? `${resendCountdown}s` : "Resend"}
              </Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <Input
              icon={Lock}
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={resetting}
            />
            <Input
              icon={Lock}
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={resetting}
            />
            <Button type="submit" isLoading={resetting} className="w-full">
              Reset Password <CheckCircle size={18} />
            </Button>
          </form>
        )}

        {step === 4 && (
          <div className="space-y-6 text-center">
            <div className="p-4 bg-cyan-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-cyan-400">
              <Mail size={32} />
            </div>
            <p className="text-slate-300 text-sm">
              We've sent a password reset link to <span className="text-white font-medium">{identifier}</span>.
              Please check your inbox and spam folder.
            </p>

            <div className="flex flex-col gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleResend}
                disabled={resendCountdown > 0}
                className="w-full"
              >
                {resendCountdown > 0 ? `Resend Email (${resendCountdown}s)` : "Resend Email"}
              </Button>

              <Link to="/login" className="w-full">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft size={18} /> Back to Login
                </Button>
              </Link>
            </div>
          </div>
        )}

        {step !== 4 && (
          <div className="mt-8 text-center">
            <Link to="/login" className="text-slate-400 hover:text-cyan-400 text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default ForgotPassword;
