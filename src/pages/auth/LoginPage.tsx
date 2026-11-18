import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  useForgetPasswordMutation,
  useLazyGetProfileQuery,
  useLoginMutation,
  useResendOtpMutation,
  useResetPasswordMutation,
  useVerifyEmailOtpMutation,
} from "@/api/auth.api";
import { ROUTES } from "@/constants/routes";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { login, setUser } from "@/store/slices/authSlice";
import type { AuthSession } from "@/types/auth.types";
import {
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type AuthMode = "login" | "forgot_email" | "forgot_otp" | "forgot_reset" | "forgot_success";

interface LoginPageProps {
  initialMode?: "login" | "forgot_email";
}

const OTP_RESEND_SECONDS = 45;

export const LoginPage: React.FC<LoginPageProps> = ({ initialMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const [loginRequest, { isLoading: isLoginLoading }] = useLoginMutation();
  const [forgetPassword, { isLoading: isForgetLoading }] = useForgetPasswordMutation();
  const [verifyEmailOtp, { isLoading: isVerifyLoading }] = useVerifyEmailOtpMutation();
  const [resendOtp, { isLoading: isResendLoading }] = useResendOtpMutation();
  const [resetPassword, { isLoading: isResetLoading }] = useResetPasswordMutation();
  const [fetchProfile] = useLazyGetProfileQuery();

  const [mode, setMode] = useState<AuthMode>(
    initialMode ||
      (location.pathname === ROUTES.AUTH.FORGOT_PASSWORD ? "forgot_email" : "login")
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState("");

  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [resendNotice, setResendNotice] = useState("");
  const [countdown, setCountdown] = useState(OTP_RESEND_SECONDS);
  const [resetToken, setResetToken] = useState("");
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetError, setResetError] = useState("");
  const [successError, setSuccessError] = useState("");

  const isBusy =
    isLoginLoading ||
    isForgetLoading ||
    isVerifyLoading ||
    isResendLoading ||
    isResetLoading;

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (mode !== "forgot_otp" || countdown <= 0) return;
    const timer = window.setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [mode, countdown]);

  useEffect(() => {
    if (mode === "forgot_otp") {
      const focusTimer = window.setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
      return () => window.clearTimeout(focusTimer);
    }
  }, [mode]);

  async function establishSession(session: AuthSession) {
    dispatch(
      login({
        ...session,
        remember: rememberMe,
      })
    );

    try {
      const profile = await fetchProfile().unwrap();
      dispatch(setUser(profile));
    } catch {
      // Login session is enough; profile refresh is best-effort.
    }

    navigate(ROUTES.DASHBOARD, { replace: true });
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      const session = await loginRequest({ email: email.trim(), password }).unwrap();
      await establishSession(session);
    } catch (error) {
      setLoginError(getApiErrorMessage(error, "Invalid email or password."));
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setOtpError("");

    try {
      await forgetPassword({ email: forgotEmail.trim() }).unwrap();
      setCountdown(OTP_RESEND_SECONDS);
      setOtp(["", "", "", "", "", ""]);
      setResendNotice("");
      setResetToken("");
      setMode("forgot_otp");
    } catch (error) {
      setOtpError(getApiErrorMessage(error, "Could not send verification code."));
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    setOtpError("");
    if (val.length > 1) {
      const pastedDigits = val.replace(/\D/g, "").slice(0, 6).split("");
      const next = [...otp];
      pastedDigits.forEach((digit, i) => {
        next[i] = digit;
      });
      setOtp(next);
      otpInputsRef.current[Math.min(pastedDigits.length, 5)]?.focus();
      return;
    }

    const digit = val.slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const next = [...otp];
        next[index - 1] = "";
        setOtp(next);
        otpInputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;
    const next = [...otp];
    pastedData.split("").forEach((digit, i) => {
      next[i] = digit;
    });
    setOtp(next);
    otpInputsRef.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    if (enteredOtp.length < 6) {
      setOtpError("Please enter all 6 digits of the verification code.");
      return;
    }

    try {
      const result = await verifyEmailOtp({
        email: forgotEmail.trim(),
        oneTimeCode: enteredOtp,
      }).unwrap();

      if (!result.resetToken) {
        setOtpError("Verification succeeded but no reset token was returned. Please try again.");
        return;
      }

      setResetToken(result.resetToken);
      setNewPassword("");
      setConfirmPassword("");
      setResetError("");
      setMode("forgot_reset");
    } catch (error) {
      setOtpError(getApiErrorMessage(error, "Invalid or expired verification code."));
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || isResendLoading) return;

    try {
      const result = await resendOtp({ email: forgotEmail.trim() }).unwrap();
      setCountdown(OTP_RESEND_SECONDS);
      setResendNotice(result.message || "A fresh verification code has been sent.");
      window.setTimeout(() => setResendNotice(""), 4000);
    } catch (error) {
      setOtpError(getApiErrorMessage(error, "Could not resend verification code."));
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");

    if (newPassword.length < 8) {
      setResetError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match. Please ensure both fields are identical.");
      return;
    }
    if (!resetToken) {
      setResetError("Missing reset token. Please verify your email code again.");
      setMode("forgot_otp");
      return;
    }

    try {
      await resetPassword({
        resetToken,
        newPassword,
        confirmPassword,
      }).unwrap();
      setPassword(newPassword);
      setEmail(forgotEmail.trim());
      setMode("forgot_success");
    } catch (error) {
      setResetError(getApiErrorMessage(error, "Could not reset password."));
    }
  };

  const handleProceedToDashboard = async () => {
    setSuccessError("");
    try {
      const session = await loginRequest({
        email: forgotEmail.trim() || email.trim(),
        password: newPassword || password,
      }).unwrap();
      await establishSession(session);
    } catch (error) {
      setSuccessError(getApiErrorMessage(error, "Password updated. Please sign in manually."));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-1">
            <img
              src="/logo-trimmed.png"
              alt="LocalFix Logo"
              className="h-12 w-auto object-contain drop-shadow-xs"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Admin Control Center
          </h1>
          <p className="text-xs text-gray-500">
            Texas Home Improvement &amp; Contractor Compliance Directory
          </p>
        </div>

        {mode === "login" && (
          <Card className="p-6 sm:p-8 space-y-6 shadow-xl border-gray-200 animate-in fade-in duration-200">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3 text-xs rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium">
                  {loginError}
                </div>
              )}

              <Input
                label="Admin Email"
                type="email"
                icon={<Mail className="w-4 h-4" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gmail.com"
                required
                autoComplete="username"
              />

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-title">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setOtpError("");
                      setMode("forgot_email");
                    }}
                    className="text-xs font-semibold text-primary hover:text-blue-700 hover:underline transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute left-3.5 text-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter secure password"
                    required
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 pl-10 pr-10 text-sm text-title placeholder:text-muted/60 transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-muted hover:text-title p-1 cursor-pointer transition-colors"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                  />
                  <span>Remember this device</span>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full justify-center flex items-center gap-2 mt-4"
                disabled={isBusy}
              >
                <span>{isLoginLoading ? "Signing in..." : "Sign In"}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </Card>
        )}

        {mode === "forgot_email" && (
          <Card className="p-6 sm:p-8 space-y-6 shadow-xl border-gray-200 animate-in fade-in duration-200">
            <div className="space-y-2 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary shadow-2xs mb-3">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Reset Admin Password
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                Enter your verified admin email address. We will dispatch a 6-digit security code
                to verify your identity.
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4">
              {otpError && (
                <div className="p-2.5 text-xs rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium">
                  {otpError}
                </div>
              )}

              <Input
                label="Admin Email Address"
                type="email"
                icon={<Mail className="w-4 h-4" />}
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="admin@gmail.com"
                required
                autoFocus
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full justify-center flex items-center gap-2 mt-2"
                disabled={isBusy}
              >
                <span>{isForgetLoading ? "Sending Security Code..." : "Send Verification Code"}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <button
                type="button"
                onClick={() => {
                  setOtpError("");
                  setMode("login");
                }}
                className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1.5 pt-2 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </button>
            </form>
          </Card>
        )}

        {mode === "forgot_otp" && (
          <Card className="p-6 sm:p-8 space-y-6 shadow-xl border-gray-200 animate-in fade-in duration-200">
            <div className="space-y-2 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary shadow-2xs mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Enter Security Code
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                We sent a 6-digit verification code to{" "}
                <strong className="text-slate-800 font-semibold">{forgotEmail}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-5">
              {otpError && (
                <div className="p-2.5 text-xs rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium text-center">
                  {otpError}
                </div>
              )}

              {resendNotice && (
                <div className="p-2.5 text-xs rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium text-center">
                  {resendNotice}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-center text-xs font-semibold text-slate-700">
                  6-Digit Verification Code
                </label>
                <div
                  className="flex items-center justify-center gap-2 sm:gap-2.5"
                  onPaste={handleOtpPaste}
                >
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputsRef.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className={`w-11 h-12 sm:w-12 sm:h-13 text-center text-lg sm:text-xl font-bold rounded-xl border bg-white text-slate-900 transition-all outline-none shadow-2xs ${
                        digit
                          ? "border-blue-600 ring-2 ring-blue-50 bg-blue-50/20"
                          : "border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full justify-center flex items-center gap-2"
                disabled={isBusy}
              >
                <span>{isVerifyLoading ? "Verifying Code..." : "Verify & Proceed"}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="flex flex-col items-center gap-2 pt-1 text-xs">
                {countdown > 0 ? (
                  <span className="text-slate-400">
                    Resend code in{" "}
                    <strong className="text-slate-600 font-mono">{countdown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    disabled={isResendLoading}
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>
                      {isResendLoading ? "Sending..." : "Didn't receive code? Resend Code"}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setMode("forgot_email")}
                  className="text-slate-500 hover:text-slate-800 font-medium cursor-pointer pt-1"
                >
                  Change email address
                </button>
              </div>
            </form>
          </Card>
        )}

        {mode === "forgot_reset" && (
          <Card className="p-6 sm:p-8 space-y-6 shadow-xl border-gray-200 animate-in fade-in duration-200">
            <div className="space-y-2 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary shadow-2xs mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Create New Password
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                Set a strong, secure new password for admin account:{" "}
                <strong className="text-slate-800 font-semibold">{forgotEmail}</strong>
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              {resetError && (
                <div className="p-2.5 text-xs rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium">
                  {resetError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-title">New Password</label>
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute left-3.5 text-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 8 characters"
                    required
                    autoFocus
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 pl-10 pr-10 text-sm text-title placeholder:text-muted/60 transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 text-muted hover:text-title p-1 cursor-pointer transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-title">
                  Confirm New Password
                </label>
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute left-3.5 text-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 pl-10 pr-10 text-sm text-title placeholder:text-muted/60 transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 text-muted hover:text-title p-1 cursor-pointer transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl space-y-1.5 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`h-3.5 w-3.5 rounded-full flex items-center justify-center text-[9px] ${
                      newPassword.length >= 8
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    ✓
                  </span>
                  <span
                    className={
                      newPassword.length >= 8 ? "text-emerald-700 font-medium" : "text-slate-500"
                    }
                  >
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`h-3.5 w-3.5 rounded-full flex items-center justify-center text-[9px] ${
                      confirmPassword && newPassword === confirmPassword
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    ✓
                  </span>
                  <span
                    className={
                      confirmPassword && newPassword === confirmPassword
                        ? "text-emerald-700 font-medium"
                        : "text-slate-500"
                    }
                  >
                    Both passwords match
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full justify-center flex items-center gap-2 mt-2"
                disabled={
                  isBusy || newPassword.length < 8 || newPassword !== confirmPassword
                }
              >
                <span>{isResetLoading ? "Updating Password..." : "Update Password & Continue"}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <button
                type="button"
                onClick={() => setMode("login")}
                className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer pt-1"
              >
                Cancel and return to Sign In
              </button>
            </form>
          </Card>
        )}

        {mode === "forgot_success" && (
          <Card className="p-6 sm:p-8 space-y-6 shadow-xl border-gray-200 text-center animate-in fade-in duration-200">
            <div className="space-y-3">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Password Reset Successfully!
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                Your credentials have been securely updated. You can now access the admin console
                with your new password.
              </p>
            </div>

            {successError && (
              <div className="p-2.5 text-xs rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-medium">
                {successError}
              </div>
            )}

            <div className="space-y-2 pt-2">
              <Button
                onClick={handleProceedToDashboard}
                variant="primary"
                size="lg"
                className="w-full justify-center flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                disabled={isBusy}
              >
                <span>{isLoginLoading ? "Signing in..." : "Proceed to Admin Console"}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <Button
                onClick={() => setMode("login")}
                variant="outline"
                size="md"
                className="w-full justify-center text-xs text-slate-600"
              >
                Sign In Manually
              </Button>
            </div>
          </Card>
        )}

        <div className="text-center text-[11px] text-slate-400">
          <span>Protected by HomeFix 256-Bit SSL Administrative Clearance</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
