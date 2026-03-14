import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, KeyRound, ArrowRight, Loader2 } from "lucide-react";
import {
  clearAuthMessage,
  loginWithPassword,
  selectAuth,
  sendOtp,
  verifyOtp,
} from "../../redux/slices/authSlice";

export default function Auth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, isAuthenticated } = useSelector(selectAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState("password"); // 'password' or 'otp'
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [feedback, setFeedback] = useState({ message: "", type: "" });

  // Timer countdown for Resend OTP
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email) {
      return setFeedback({ message: "Please enter your email address first.", type: "error" });
    }

    try {
      const response = await dispatch(sendOtp(email)).unwrap();
      setOtpSent(true);
      setResendTimer(30); // 30 seconds cooldown
      setFeedback({
        message: response?.message || "OTP has been sent to your email.",
        type: "success",
      });
    } catch (error) {
      setFeedback({
        message: error || "Failed to send OTP. Try again.",
        type: "error",
      });
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      return setFeedback({ message: "Please enter the OTP.", type: "error" });
    }

    try {
      const response = await dispatch(verifyOtp({ email, otp })).unwrap();
      setFeedback({
        message: response?.message || "OTP verified successfully! Logging in...",
        type: "success",
      });
    } catch (error) {
      setFeedback({
        message: error || "Invalid OTP. Please check and try again.",
        type: "error",
      });
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setFeedback({ message: "Please enter both email and password.", type: "error" });
    }

    try {
      const response = await dispatch(
        loginWithPassword({ email, password }),
      ).unwrap();
      setFeedback({
        message: response?.message || "Logged in successfully!",
        type: "success",
      });
    } catch (error) {
      setFeedback({
        message: error || "Invalid email or password.",
        type: "error",
      });
    }
  };

  const switchMethod = (method) => {
    setLoginMethod(method);
    dispatch(clearAuthMessage());
    setFeedback({ message: "", type: "" });
    setOtpSent(false);
    setOtp("");
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 mt-2 text-sm">Please sign in to your account</p>
        </div>

        {/* Method Toggle */}
        <div className="px-8 mb-6">
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => switchMethod("password")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                loginMethod === "password"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => switchMethod("otp")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                loginMethod === "otp"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Email OTP
            </button>
          </div>
        </div>

        {/* Feedback Message */}
        {feedback.message && (
          <div className="px-8 mb-4">
            <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
              feedback.type === "error" ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-green-600 border border-green-100"
            }`}>
              {feedback.message}
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="px-8 pb-8">
          
          {/* Email Field (Shared across methods) */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loginMethod === "otp" && otpSent}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all disabled:opacity-60"
              />
            </div>
          </div>

          {/* Password Flow */}
          {loginMethod === "password" && (
            <form onSubmit={handlePasswordLogin}>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Password</label>
                  <a href="#" className="text-xs font-semibold text-blue-600 hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_4px_14px_rgba(37,99,235,0.25)] flex items-center justify-center disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign In"}
              </button>
            </form>
          )}

          {/* OTP Flow */}
          {loginMethod === "otp" && (
            <div>
              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || !email}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_4px_14px_rgba(37,99,235,0.25)] flex items-center justify-center disabled:opacity-70 mt-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : "Send OTP"}
                </button>
              ) : (
                <form onSubmit={handleVerifyOtp} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Enter OTP</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        placeholder="6-digit code"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none tracking-widest transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length < 4}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_4px_14px_rgba(37,99,235,0.25)] flex items-center justify-center disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : (
                      <>Verify & Login <ArrowRight size={18} className="ml-2" /></>
                    )}
                  </button>

                  <div className="mt-4 text-center">
                    <p className="text-sm text-slate-500">
                      Didn't receive the code?{" "}
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={resendTimer > 0 || loading}
                        className="font-semibold text-blue-600 hover:underline disabled:text-slate-400 disabled:no-underline"
                      >
                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                      </button>
                    </p>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>
        
        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 text-center">
          <p className="text-sm text-slate-600">
            Don't have an account? <a href="#" className="font-semibold text-blue-600 hover:underline">Sign up</a>
          </p>
        </div>

      </div>
    </div>
  );
}
