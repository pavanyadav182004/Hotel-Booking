import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setOtpSent(true);
      setMessage(res.message || "OTP sent to your registered email.");
    } catch (err) {
      setMessage(err.message || "Unable to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    
    // Validation
    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }
    if (!/[a-zA-Z]/.test(newPassword)) {
      setMessage("Password must contain at least 1 letter");
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setMessage("Password must contain at least 1 number");
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      setMessage("Password must contain at least 1 special character");
      return;
    }
    if (/^(123456|654321|password|admin123)$/i.test(newPassword)) {
      setMessage("Too simple password, please choose a stronger one");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const res = await apiRequest("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, otp, newPassword }),
      });
      setMessage(res.message || "Password reset successfully");
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      setMessage(err.message || "Unable to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form onSubmit={otpSent ? resetPassword : sendOtp} className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6">Forgot Password</h2>

        {message && <p className="text-sm text-blue-600 mb-3">{message}</p>}

        <input
          type="email"
          placeholder="Enter registered email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setOtpSent(false);
            setOtp("");
            setNewPassword("");
          }}
          disabled={otpSent}
          className="w-full border border-gray-300 rounded p-2 mb-3 disabled:bg-gray-100"
          required
        />

        {otpSent && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 mb-3"
              required
            />
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 mb-3"
              required
              minLength={6}
            />
          </>
        )}

        <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded disabled:opacity-60">
          {loading ? "Please wait..." : otpSent ? "Reset Password" : "Send OTP"}
        </button>

        {otpSent && (
          <button
            type="button"
            disabled={loading}
            onClick={sendOtp}
            className="w-full text-blue-600 text-sm mt-3 hover:underline disabled:opacity-60"
          >
            Resend OTP
          </button>
        )}

        <p className="text-center mt-4 text-sm">
          <Link to="/login" className="text-blue-600 hover:underline">Back to login</Link>
        </p>
      </form>
    </div>
  );
}
