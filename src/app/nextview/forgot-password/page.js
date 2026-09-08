'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  KeyRound,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryIdentifier = (searchParams?.get('identifier') || '').trim();

  const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Verify OTP & Reset
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Step 1 Form
  const [identifier, setIdentifier] = useState(queryIdentifier);
  const [method, setMethod] = useState('MOBILE'); // 'MOBILE' | 'EMAIL'

  // Verification & Destination Data returned from backend
  const [destinationInfo, setDestinationInfo] = useState({
    destination: '',
    memberId: '',
    method: 'MOBILE',
    hasMobile: true,
    hasEmail: true,
    fullName: '',
  });

  // Step 2 Form
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Request OTP
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    if (!identifier.trim()) {
      toast.error('Please enter your Mobile number, Email, or Member Code.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/mlm/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          method,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'OTP sent successfully!');
        setDestinationInfo({
          destination: data.destination || '',
          memberId: data.memberId || '',
          method: data.method || method,
          hasMobile: data.hasMobile ?? true,
          hasEmail: data.hasEmail ?? true,
          fullName: data.fullName || '',
        });
        setStep(2);
        setResendTimer(60); // 60s cooldown
      } else {
        toast.error(data.message || 'Failed to send OTP.');
        if (data.fallbackMethod) {
          setMethod(data.fallbackMethod);
        }
      }
    } catch (err) {
      console.error('Request OTP error:', err);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0 || loading) return;
    await handleRequestOtp(null);
  };

  // Submit Password Reset
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!otp || otp.length < 6) {
      toast.error('Please enter the complete 6-digit OTP.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/mlm/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: destinationInfo.memberId,
          identifier: identifier.trim(),
          otp: otp.trim(),
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'Password updated successfully!');
        setResetSuccess(true);
        setTimeout(() => {
          router.push(`/nextview/login?identifier=${encodeURIComponent(identifier.trim())}`);
        }, 2000);
      } else {
        toast.error(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      console.error('Reset Password error:', err);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-black text-white">
      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 mb-4 shadow-lg shadow-blue-500/10">
            <KeyRound className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
            {resetSuccess
              ? 'Password Reset Complete!'
              : step === 1
              ? 'Forgot Password?'
              : 'Verify OTP & Reset'}
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            {resetSuccess
              ? 'Redirecting you to NextView login...'
              : step === 1
              ? 'Recover your NextView account using Mobile or Email OTP'
              : `Enter the 6-digit code sent to ${destinationInfo.destination || 'your device'}`}
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Glowing accent border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600" />

          {resetSuccess ? (
            /* SUCCESS STATE */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-white">Your password is updated!</h3>
              <p className="text-sm text-slate-400">
                You can now log in securely using your new credentials.
              </p>
              <div className="pt-2">
                <Link
                  href={`/nextview/login?identifier=${encodeURIComponent(identifier.trim())}`}
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition shadow-lg shadow-blue-600/30"
                >
                  <span>Go to Login</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : step === 1 ? (
            /* STEP 1: IDENTIFY & CHOOSE DELIVERY METHOD */
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Mobile Number, Email, or Member Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    autoFocus
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter registered mobile, email or NEX code"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Delivery Method Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Send Verification Code Via
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Mobile Option */}
                  <button
                    type="button"
                    onClick={() => setMethod('MOBILE')}
                    className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition ${
                      method === 'MOBILE'
                        ? 'bg-blue-600/15 border-blue-500 text-white shadow-sm ring-1 ring-blue-500/50'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                        <span>Mobile SMS</span>
                      </div>
                      {method === 'MOBILE' && (
                        <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Fast SMS OTP to your registered phone
                    </span>
                  </button>

                  {/* Email Option */}
                  <button
                    type="button"
                    onClick={() => setMethod('EMAIL')}
                    className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition ${
                      method === 'EMAIL'
                        ? 'bg-blue-600/15 border-blue-500 text-white shadow-sm ring-1 ring-blue-500/50'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Mail className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Email Inbox</span>
                      </div>
                      {method === 'EMAIL' && (
                        <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Direct OTP to your registered email
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !identifier.trim()}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/25 disabled:opacity-50 text-sm mt-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending Verification Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-sm text-slate-400">
                Remember your password?{' '}
                <Link
                  href={`/nextview/login${identifier ? `?identifier=${encodeURIComponent(identifier.trim())}` : ''}`}
                  className="text-blue-400 font-semibold hover:underline"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          ) : (
            /* STEP 2: VERIFY OTP & SET NEW PASSWORD */
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* Destination badge & Change details button */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                <div className="flex items-center gap-2 truncate">
                  {destinationInfo.method === 'EMAIL' ? (
                    <Mail className="w-4 h-4 shrink-0 text-cyan-400" />
                  ) : (
                    <Smartphone className="w-4 h-4 shrink-0 text-blue-400" />
                  )}
                  <span className="truncate">
                    Code sent to <strong className="text-white">{destinationInfo.destination}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[11px] font-bold text-blue-400 hover:text-blue-300 hover:underline shrink-0 ml-2"
                >
                  Change
                </button>
              </div>

              {/* 6-Digit OTP */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 text-center">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-[0.6em] text-2xl font-mono font-bold py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition"
                />
              </div>

              {/* Resend Link */}
              <div className="flex items-center justify-end text-xs">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || loading}
                  className="text-blue-400 hover:text-blue-300 font-semibold disabled:text-slate-500 inline-flex items-center gap-1.5 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>{resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend Code'}</span>
                </button>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  New Password (Min. 8 Chars)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-white"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Match Hint */}
              {newPassword && confirmPassword && (
                <div className="text-[11px] flex items-center gap-1.5">
                  {newPassword === confirmPassword ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-medium">
                      <Check className="w-3.5 h-3.5" /> Passwords match
                    </span>
                  ) : (
                    <span className="text-red-400 font-medium">Passwords do not match</span>
                  )}
                </div>
              )}

              {/* Submit Reset */}
              <button
                type="submit"
                disabled={loading || otp.length < 6 || !newPassword || newPassword !== confirmPassword}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/25 disabled:opacity-50 text-sm mt-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Reset Password &amp; Login</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-xs text-slate-400 hover:text-white pt-2 flex items-center justify-center gap-1 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to previous step</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NextViewForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
