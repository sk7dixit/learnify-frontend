// src/pages/ForgotPassword.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const PHONE_PATTERN = /^(\+?\d{7,15})$/; // simple phone detection, accepts + and 7-15 digits
const RESEND_COOLDOWN = 60; // seconds

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1 = request, 2 = verify OTP (mobile), 3 = reset password (mobile) or email-flow done
  const [identifier, setIdentifier] = useState(""); // email or mobile
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

  // Start countdown helper
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

  // Determine if identifier looks like phone or email
  const detectFlow = (value) => {
    if (!value) return "unknown";
    if (value.includes("@")) return "email";
    if (PHONE_PATTERN.test(value.trim())) return "mobile";
    // fallback: if all digits and length reasonable -> mobile
    const digits = value.replace(/\D/g, "");
    if (digits.length >= 7 && digits.length <= 15) return "mobile";
    return "email";
  };

  // Step 1: send OTP or email reset link
  const handleSend = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSending(true);

    const flow = detectFlow(identifier.trim());
    setIsMobileFlow(flow === "mobile");

    try {
      if (flow === "mobile") {
        // Mobile OTP flow
        const resp = await api.post("/users/forgot-password", { mobileNumber: identifier.trim() });
        setMessage(resp.data?.message || "OTP sent to your mobile number.");
        setStep(2); // go to OTP verify
        startResendCountdown();
      } else {
        // Email reset flow
        const resp = await api.post("/users/forgot-password", { email: identifier.trim() });
        // Server should send a password-reset link to email
        setMessage(resp.data?.message || "Password reset link sent to your email. Check your inbox.");
        // In email flow we don't proceed to OTP steps — instruct user to follow email link
        setStep(4); // step 4 = email-sent confirmation
        startResendCountdown();
      }
    } catch (err) {
      const srv = err.response?.data;
      setError(srv?.error || "Failed to send reset instruction. Please try again later.");
    } finally {
      setSending(false);
    }
  };

  // Step 2: verify OTP (mobile)
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

  // Step 3: reset password (mobile flow)
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
      // For mobile flow we include mobileNumber + otp + newPassword
      const payload = isMobileFlow
        ? { mobileNumber: identifier.trim(), otp: otp.trim(), newPassword }
        : { email: identifier.trim(), token: undefined, newPassword }; // email flow reset via link usually handled server-side

      const resp = await api.post("/users/reset-password", payload);
      setMessage(resp.data?.message || "Password updated successfully. Redirecting to login...");
      // Wait a bit then redirect
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      const srv = err.response?.data;
      setError(srv?.error || "Failed to reset password. Try again.");
    } finally {
      setResetting(false);
    }
  };

  const handleResend = async () => {
    // Resend OTP or email, depending on flow. Respect cooldown on UI.
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="bg-gray-800 bg-opacity-70 border border-gray-700 rounded-xl shadow-2xl p-6 w-full max-w-md">
        <h2 className="text-3xl font-bold text-cyan-400 mb-4 text-center">Forgot password</h2>

        {message && <div className="mb-4 text-sm text-green-300 text-center">{message}</div>}
        {error && <div className="mb-4 text-sm text-red-400 text-center">{error}</div>}

        {step === 1 && (
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Email address or mobile number</label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="email@example.com or +91XXXXXXXXXX"
                required
                className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                disabled={sending}
              />
              <p className="mt-2 text-xs text-gray-400">If you enter an email we'll send a reset link. If you enter a mobile number we'll send an OTP.</p>
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold disabled:opacity-50"
              disabled={sending}
            >
              {sending ? "Sending..." : "Send reset instruction"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <p className="text-sm text-gray-300">OTP was sent to <strong className="text-white">{identifier}</strong></p>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Enter OTP</label>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit code"
                required
                className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                disabled={verifying}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
                disabled={verifying}
              >
                {verifying ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={handleResend}
                className="w-36 py-2 rounded bg-gray-700 border border-gray-600 text-gray-200"
                disabled={resendCountdown > 0}
              >
                {resendCountdown > 0 ? `Resend (${resendCountdown}s)` : "Resend OTP"}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                disabled={resetting}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                disabled={resetting}
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
              disabled={resetting}
            >
              {resetting ? "Resetting..." : "Reset password"}
            </button>
          </form>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-300 text-center">A password reset link has been sent to <strong className="text-white">{identifier}</strong>. Follow the link in your email to reset your password.</p>
            <div className="flex gap-2">
              <button
                onClick={handleResend}
                className="flex-1 py-2 rounded bg-gray-700 border border-gray-600 text-gray-200"
                disabled={resendCountdown > 0}
              >
                {resendCountdown > 0 ? `Resend email (${resendCountdown}s)` : "Resend email"}
              </button>
              <Link to="/login" className="flex-1 text-center py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold">Back to login</Link>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-gray-300 hover:text-cyan-300">Remember your password? Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
