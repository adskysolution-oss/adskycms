'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  RefreshCw,
  AlertCircle,
  MapPin,
  Building,
} from 'lucide-react';
import toast from 'react-hot-toast';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sponsorFromQuery = (searchParams?.get('sponsor') || searchParams?.get('ref') || '').trim();

  const [step, setStep] = useState(1); // 1 = Form, 2 = OTP
  const [isLockedSponsor, setIsLockedSponsor] = useState(false);

  // Form State
  const [form, setForm] = useState({
    fullName: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    sponsorCode: sponsorFromQuery,
    verificationMethod: 'EMAIL', // 'EMAIL' | 'MOBILE'
    pincode: '',
    state: '',
    district: '',
    city: '',
    block: '',
    address: '',
    termsAccepted: true,
  });

  // Interactive States
  const [sponsorDetails, setSponsorDetails] = useState(null);
  const [validatingSponsor, setValidatingSponsor] = useState(false);
  const [sponsorError, setSponsorError] = useState('');

  const [fetchingPincode, setFetchingPincode] = useState(false);
  const [pincodeError, setPincodeError] = useState('');
  const [areaOptions, setAreaOptions] = useState([]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Validate Sponsor Code
  const verifySponsor = async (code) => {
    if (!code || code.trim().length < 3) {
      setSponsorDetails(null);
      setSponsorError('');
      return;
    }

    setValidatingSponsor(true);
    setSponsorError('');

    try {
      const res = await fetch(`/api/mlm/auth/sponsor?code=${encodeURIComponent(code.trim())}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setSponsorDetails({
          fullName: data.data.fullName,
          mlmCode: data.data.mlmCode || code.trim().toUpperCase(),
        });
        setSponsorError('');
      } else {
        setSponsorDetails(null);
        setSponsorError(data.message || 'Invalid sponsor / referral code');
      }
    } catch {
      setSponsorDetails(null);
      setSponsorError('Unable to verify sponsor code');
    } finally {
      setValidatingSponsor(false);
    }
  };

  useEffect(() => {
    if (sponsorFromQuery) {
      setForm((prev) => ({ ...prev, sponsorCode: sponsorFromQuery }));
      setIsLockedSponsor(true);
      verifySponsor(sponsorFromQuery);
    }
  }, [sponsorFromQuery]);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (name === 'sponsorCode' && !isLockedSponsor) {
      if (value.length >= 4) {
        verifySponsor(value);
      } else {
        setSponsorDetails(null);
        setSponsorError('');
      }
    }
  };

  // Auto-fetch location by PIN code
  const handlePincodeLookup = async (codeToLookup) => {
    const pin = (codeToLookup || form.pincode).trim();
    if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      setPincodeError('Enter a valid 6-digit PIN code');
      return;
    }

    setFetchingPincode(true);
    setPincodeError('');

    try {
      const res = await fetch(`/api/pincode/${pin}`);
      const data = await res.json();

      if (res.ok && data.success && data.data) {
        const { state, district, block, area } = data.data;
        setForm((prev) => ({
          ...prev,
          state: state || prev.state,
          district: district || prev.district,
          block: block || prev.block,
          city: (Array.isArray(area) && area.length > 0 ? area[0] : block) || prev.city,
        }));
        if (Array.isArray(area) && area.length > 0) {
          setAreaOptions(area);
        }
        toast.success(`Location auto-fetched: ${district}, ${state}`);
      } else {
        setPincodeError('PIN code not found. You can enter details manually.');
      }
    } catch {
      setPincodeError('Failed to fetch PIN code data.');
    } finally {
      setFetchingPincode(false);
    }
  };

  const handlePincodeChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setForm((prev) => ({ ...prev, pincode: val }));
    if (val.length === 6) {
      handlePincodeLookup(val);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!form.sponsorCode.trim()) {
      setError('A valid Referral / Sponsor Code is required.');
      return;
    }

    if (!form.email || !form.email.trim()) {
      setError('Email Address is required.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('Please enter a valid Email Address.');
      return;
    }

    if (form.mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!form.termsAccepted) {
      setError('You must accept the Terms & Conditions and Privacy Policy.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/mlm/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccessMessage(
        `OTP has been sent to your ${
          form.verificationMethod === 'EMAIL' ? 'email address' : 'mobile number'
        }. Please enter the 6-digit OTP code below.`
      );
      toast.success('OTP sent successfully!');
      setStep(2);
      setResendTimer(60);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please check your details.');
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!otp.trim() || otp.trim().length < 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/mlm/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: form.mobile.trim(),
          email: form.email.trim(),
          otp: otp.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'OTP verification failed');
      }

      toast.success('Registration verified successfully!');
      setSuccessMessage('Registration confirmed! Redirecting to KYC onboarding...');
      setTimeout(() => {
        router.push('/nextview/onboarding');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP');
      toast.error(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/mlm/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: form.mobile.trim(),
          email: form.email.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to resend OTP');

      setSuccessMessage('A fresh OTP has been dispatched.');
      toast.success('New OTP sent!');
      setResendTimer(60);
    } catch (err) {
      setError(err.message || 'Could not resend OTP');
      toast.error(err.message || 'Resend failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center mb-6">
        <div className="inline-flex items-center justify-center mb-3">
          <Image
            src="/nexvia.png"
            alt="NexVia Network"
            width={220}
            height={70}
            className="h-16 sm:h-20 w-auto object-contain drop-shadow-xs"
            priority
          />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">
          Join <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">NexVia Network</span>
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium">
          Create your member account &amp; enter the 3×15 reward matrix
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-200/80 shadow-xl">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-medium flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {step === 1 ? (
            <form className="space-y-5" onSubmit={handleRegisterSubmit} autoComplete="off">
              {/* SECTION A: REFERRAL / SPONSOR */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black uppercase tracking-wider text-amber-800">
                    Sponsor / Referral Code *
                  </label>
                  {validatingSponsor && (
                    <span className="text-[11px] text-amber-600 flex items-center gap-1 font-semibold">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Verifying...
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    readOnly={isLockedSponsor}
                    name="sponsorCode"
                    value={form.sponsorCode}
                    onChange={handleChange}
                    onBlur={() => verifySponsor(form.sponsorCode)}
                    placeholder="Enter sponsor code (e.g. NEX-ROOT-001)"
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-mono font-bold uppercase transition focus:outline-none ${
                      isLockedSponsor
                        ? 'bg-amber-100/60 border border-amber-300 text-amber-900 cursor-not-allowed'
                        : 'bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                    }`}
                  />
                  {!isLockedSponsor && (
                    <button
                      type="button"
                      onClick={() => verifySponsor(form.sponsorCode)}
                      className="px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 text-xs font-bold transition"
                    >
                      Verify
                    </button>
                  )}
                </div>

                {sponsorDetails ? (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-700">
                    <span className="font-semibold">✓ Referred by {sponsorDetails.fullName}</span>
                    <span className="font-mono font-bold text-emerald-800">{sponsorDetails.mlmCode}</span>
                  </div>
                ) : sponsorError ? (
                  <p className="text-[11px] font-bold text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {sponsorError}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Enter valid sponsor code from an active Network member.
                  </p>
                )}
              </div>

              {/* SECTION B: PERSONAL DETAILS */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2">
                  Personal Information
                </h3>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Full Name (As per Aadhaar/PAN) *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Enter legal full name"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Mobile Number (10 Digits) *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        name="mobile"
                        value={form.mobile}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setForm((prev) => ({ ...prev, mobile: val }));
                        }}
                        placeholder="10-digit number"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Send OTP Method Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Send OTP Verification To: *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold cursor-pointer transition ${
                        form.verificationMethod === 'EMAIL'
                          ? 'bg-amber-50 border-amber-500 text-slate-900 ring-1 ring-amber-500'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="verificationMethod"
                        value="EMAIL"
                        checked={form.verificationMethod === 'EMAIL'}
                        onChange={handleChange}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span>Email Address</span>
                    </label>

                    <label
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold cursor-pointer transition ${
                        form.verificationMethod === 'MOBILE'
                          ? 'bg-amber-50 border-amber-500 text-slate-900 ring-1 ring-amber-500'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="verificationMethod"
                        value="MOBILE"
                        checked={form.verificationMethod === 'MOBILE'}
                        onChange={handleChange}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span>Mobile Number</span>
                    </label>
                  </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Password (Min. 8 Chars) *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Create strong password"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter password"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 focus:outline-none"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION C: LOCATION & ADDRESS WITH PIN CODE AUTO-FETCH */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2">
                  Location &amp; Address (Auto-Fetch via PIN Code)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        PIN Code *
                      </label>
                      {fetchingPincode && (
                        <span className="text-[10px] text-amber-600 flex items-center gap-1 font-semibold">
                          <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Fetching...
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        name="pincode"
                        value={form.pincode}
                        onChange={handlePincodeChange}
                        placeholder="6-digit PIN"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none transition"
                      />
                    </div>
                    {pincodeError && (
                      <p className="text-[10px] text-amber-600 font-semibold mt-1">{pincodeError}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      placeholder="State"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      District *
                    </label>
                    <input
                      type="text"
                      required
                      name="district"
                      value={form.district}
                      onChange={handleChange}
                      placeholder="District"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      City / Area / Town *
                    </label>
                    {areaOptions.length > 0 ? (
                      <select
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition"
                      >
                        {areaOptions.map((area, idx) => (
                          <option key={idx} value={area} className="bg-white text-slate-900">
                            {area}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="City or Town"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none transition"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Block / Tehsil
                    </label>
                    <input
                      type="text"
                      name="block"
                      value={form.block}
                      onChange={handleChange}
                      placeholder="Block / Tehsil (Optional)"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Complete Address (Optional)
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="House/Flat No., Street, Landmark"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={form.termsAccepted}
                    onChange={handleChange}
                    className="mt-0.5 rounded text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    I agree to the{' '}
                    <Link href="/terms-and-conditions" target="_blank" className="font-bold text-amber-600 hover:underline">
                      Terms &amp; Conditions
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy-policy" target="_blank" className="font-bold text-amber-600 hover:underline">
                      Privacy Policy
                    </Link>{' '}
                    of NexVia Network.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-2xl shadow-lg shadow-amber-500/20 text-sm font-extrabold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 focus:ring-2 focus:ring-amber-500 transition disabled:opacity-50 mt-4"
              >
                <span>{loading ? 'Sending OTP Verification...' : 'Register & Verify OTP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-xs text-slate-500 pt-2">
                Already an active member?{' '}
                <Link href="/nextview/login" className="font-bold text-amber-600 hover:underline">
                  Login here
                </Link>
              </p>
            </form>
          ) : (
            /* STEP 2: OTP VERIFICATION */
            <form className="space-y-6" onSubmit={handleVerifyOtpSubmit} autoComplete="off">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600 shadow-sm mb-1">
                  <KeyRound className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Verify {form.verificationMethod === 'EMAIL' ? 'Email' : 'Mobile'} OTP
                </h2>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Enter the 6-digit verification code sent to{' '}
                  <strong className="text-amber-600">
                    {form.verificationMethod === 'EMAIL' ? form.email : form.mobile}
                  </strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 text-center">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-[0.6em] text-2xl font-mono font-bold py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-slate-500 hover:text-slate-800 font-semibold"
                >
                  &larr; Edit Details
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || loading}
                  className="text-amber-600 hover:text-amber-700 font-bold disabled:text-slate-400 inline-flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>{resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-2xl shadow-lg shadow-amber-500/20 text-sm font-extrabold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 focus:ring-2 focus:ring-amber-500 transition disabled:opacity-50"
              >
                <span>{loading ? 'Verifying...' : 'Verify OTP & Complete'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NextViewRegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
