'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck, CheckCircle2, AlertCircle, Clock, ArrowRight, CreditCard, Building,
  FileCheck, RefreshCw, Check, Send, KeyRound, AlertTriangle, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDobInput, dobToIso, normalizeDob, isValidDob } from '@/lib/verification/dobHelper';

function loadScript(src) {
    return new Promise((resolve) => {
        if (typeof document === 'undefined') return resolve(false);
        if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

export default function NextViewVerificationPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [memberData, setMemberData] = useState(null);
    const [kycData, setKycData] = useState(null);
    const [feeData, setFeeData] = useState(null);

    // Form State
    const [form, setForm] = useState({
        panNumber: '',
        fullName: '',
        dob: '',
        aadhaarNumber: '',
        accountHolderName: '',
        accountNumber: '',
        confirmAccountNumber: '',
        ifscCode: '',
        bankName: '',
        upiId: '',
    });

    const [submittingKyc, setSubmittingKyc] = useState(false);
    const [payingFee, setPayingFee] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // PAN Auto-verification state
    const [verifyingPan, setVerifyingPan] = useState(false);
    const [panResult, setPanResult] = useState(null);

    // Aadhaar OTP state
    const [sendingAadhaarOtp, setSendingAadhaarOtp] = useState(false);
    const [aadhaarOtpSent, setAadhaarOtpSent] = useState(false);
    const [aadhaarOtp, setAadhaarOtp] = useState('');
    const [verifyingAadhaarOtp, setVerifyingAadhaarOtp] = useState(false);
    const [aadhaarResult, setAadhaarResult] = useState(null);
    const [resendCountdown, setResendCountdown] = useState(0);
    const timerRef = useRef(null);
    const datePickerRef = useRef(null);

    // IFSC state
    const [fetchingIfsc, setFetchingIfsc] = useState(false);
    const [ifscDetails, setIfscDetails] = useState(null);
    const [ifscError, setIfscError] = useState('');

    useEffect(() => {
        if (resendCountdown > 0) {
            timerRef.current = setTimeout(() => {
                setResendCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [resendCountdown]);

    const handleIfscLookup = async (codeToLookup) => {
        const code = (codeToLookup || form.ifscCode).trim().toUpperCase();
        if (!code || code.length !== 11) {
            setIfscError('Enter a valid 11-character IFSC code');
            setIfscDetails(null);
            return;
        }
        setFetchingIfsc(true);
        setIfscError('');
        try {
            const res = await fetch(`/api/ifsc/${code}`);
            const data = await res.json();
            if (res.ok && data.success && data.data) {
                setIfscDetails(data.data);
                setForm((prev) => ({
                    ...prev,
                    bankName: `${data.data.bankName} - ${data.data.branch || ''}`,
                }));
            } else {
                setIfscError('Invalid IFSC code or branch not found');
                setIfscDetails(null);
            }
        } catch {
            setIfscError('Failed to verify IFSC code');
            setIfscDetails(null);
        } finally {
            setFetchingIfsc(false);
        }
    };

    const handleIfscChange = (e) => {
        const val = e.target.value.toUpperCase().slice(0, 11);
        setForm((prev) => ({ ...prev, ifscCode: val }));
        if (val.length === 11) {
            handleIfscLookup(val);
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const [profileRes, kycRes, feeRes] = await Promise.all([
                fetch('/api/mlm/profile').then((r) => r.json()),
                fetch('/api/mlm/kyc').then((r) => r.json()),
                fetch('/api/mlm/payment/platform-fee').then((r) => r.json()),
            ]);

            if (profileRes.success && profileRes.data) {
                setMemberData(profileRes.data);
            }

            if (kycRes.success && kycRes.data?.kyc) {
                const kyc = kycRes.data.kyc;
                setKycData(kyc);
                setForm({
                    panNumber: kyc.panNumber || '',
                    fullName: kyc.fullName || profileRes.data?.fullName || '',
                    dob: kyc.dob || '',
                    aadhaarNumber: kyc.aadhaarNumber || '',
                    accountHolderName: kyc.bankDetails?.accountHolderName || profileRes.data?.fullName || '',
                    accountNumber: kyc.bankDetails?.accountNumber || '',
                    confirmAccountNumber: kyc.bankDetails?.accountNumber || '',
                    ifscCode: kyc.bankDetails?.ifscCode || '',
                    bankName: kyc.bankDetails?.bankName || '',
                    upiId: kyc.bankDetails?.upiId || '',
                });

                if (kyc.panVerification?.verified) {
                    setPanResult({
                        verified: true,
                        status: 'VERIFIED',
                        maskedPan: kyc.maskedPan,
                    });
                }
                if (kyc.aadhaarVerification?.verified) {
                    setAadhaarResult({
                        verified: true,
                        status: 'VERIFIED',
                        maskedAadhaar: kyc.maskedAadhaar,
                    });
                }
            } else if (profileRes.data) {
                setForm((prev) => ({
                    ...prev,
                    fullName: profileRes.data.fullName || '',
                    accountHolderName: profileRes.data.fullName || '',
                }));
            }

            if (feeRes.success && feeRes.data) {
                setFeeData(feeRes.data);
            }
        } catch (err) {
            console.error('Error loading onboarding status:', err);
            setError('Unable to load onboarding status. Please refresh.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadData();
    }, []);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // PAN Auto-Verify
    const handleVerifyPan = async () => {
        const pan = form.panNumber.trim().toUpperCase();
        const name = form.fullName.trim();
        const cleanDob = normalizeDob(form.dob);

        if (!pan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
            setError('Please enter a valid 10-character PAN number (e.g. ABCDE1234F).');
            return;
        }
        if (!name) {
            setError('Please enter your full name as per PAN.');
            return;
        }
        if (!cleanDob || !isValidDob(cleanDob)) {
            setError('Please enter a valid Date of Birth (DD/MM/YYYY).');
            return;
        }

        setError('');
        setVerifyingPan(true);
        try {
            const res = await fetch('/api/mlm/kyc/pan/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pan, name, dob: cleanDob }),
            });
            const data = await res.json();
            if (res.ok && data.success && data.verified) {
                setPanResult(data.panVerification || { verified: true, status: 'VERIFIED' });
                setSuccessMsg('PAN verified successfully!');
                loadData();
            } else {
                setError(data.message || 'PAN verification failed.');
                setPanResult({ verified: false, message: data.message });
            }
        } catch {
            setError('Network error during PAN verification.');
        } finally {
            setVerifyingPan(false);
        }
    };

    // Aadhaar Send OTP
    const handleSendAadhaarOtp = async () => {
        const cleanAadhaar = form.aadhaarNumber.trim().replace(/\D/g, '');
        if (cleanAadhaar.length !== 12) {
            setError('Please enter a valid 12-digit Aadhaar number.');
            return;
        }

        setError('');
        setSendingAadhaarOtp(true);
        try {
            const res = await fetch('/api/mlm/kyc/aadhaar/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ aadhaarNumber: cleanAadhaar }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setAadhaarOtpSent(true);
                setResendCountdown(60);
                setSuccessMsg(data.message || 'OTP sent to your registered mobile number!');
            } else {
                setError(data.message || 'Failed to send Aadhaar OTP.');
            }
        } catch {
            setError('Network error while sending Aadhaar OTP.');
        } finally {
            setSendingAadhaarOtp(false);
        }
    };

    // Aadhaar Verify OTP
    const handleVerifyAadhaarOtp = async () => {
        const cleanOtp = aadhaarOtp.trim().replace(/\D/g, '');
        if (cleanOtp.length !== 6) {
            setError('Please enter the 6-digit OTP.');
            return;
        }

        setError('');
        setVerifyingAadhaarOtp(true);
        try {
            const res = await fetch('/api/mlm/kyc/aadhaar/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ otp: cleanOtp }),
            });
            if (res.ok && data.success && data.verified) {
                setAadhaarResult(data.aadhaarVerification || { verified: true, status: 'VERIFIED' });
                setSuccessMsg(data.message || 'Aadhaar verified successfully! Please enter your bank details below to proceed.');
                loadData();
                setTimeout(() => {
                    document.getElementById('verification-bank-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 350);
            } else {
                setError(data.message || 'Aadhaar OTP verification failed.');
            }
        } catch {
            setError('Network error during OTP verification.');
        } finally {
            setVerifyingAadhaarOtp(false);
        }
    };

    const handleKycSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        if (form.accountNumber !== form.confirmAccountNumber) {
            setError('Bank Account Number and Confirm Account Number must match.');
            return;
        }

        setSubmittingKyc(true);
        try {
            const res = await fetch('/api/mlm/kyc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: form.fullName,
                    panNumber: form.panNumber,
                    dob: form.dob,
                    aadhaarNumber: form.aadhaarNumber,
                    bankDetails: {
                        accountHolderName: form.accountHolderName,
                        accountNumber: form.accountNumber,
                        ifscCode: form.ifscCode,
                        bankName: form.bankName,
                        upiId: form.upiId,
                    }
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'KYC submission failed');
            setSuccessMsg(data.message || 'KYC details submitted successfully!');
            loadData();
        } catch (err) {
            setError(err.message || 'Failed to submit KYC details');
        } finally {
            setSubmittingKyc(false);
        }
    };

    const handlePayPlatformFee = async () => {
        setError('');
        setPayingFee(true);
        try {
            const orderRes = await fetch('/api/mlm/payment/platform-fee', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'CREATE_ORDER' }),
            });
            const orderData = await orderRes.json();
            if (!orderRes.ok || !orderData.success) {
                throw new Error(orderData.message || 'Failed to initiate payment');
            }
            const paymentInfo = orderData.data;

            const loaded = await loadScript('https://sdk.cashfree.com/js/v3/cashfree.js');
            if (loaded && window.Cashfree) {
                const mode = paymentInfo.environment === 'sandbox' ? 'sandbox' : 'production';
                const cf = window.Cashfree({ mode });
                cf.checkout({
                    paymentSessionId: paymentInfo.paymentSessionId,
                    redirectTarget: '_self',
                });
                return;
            }
            throw new Error('Could not load payment gateway.');
        } catch (err) {
            setError(err.message || 'Payment failed');
            setPayingFee(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"/>
                    <p className="text-sm font-medium">Loading Verification Status...</p>
                </div>
            </div>
        );
    }

    const isPanVerified = kycData?.panVerification?.verified || panResult?.verified;
    const isAadhaarVerified = kycData?.aadhaarVerification?.verified || aadhaarResult?.verified;
    const hasSavedBank = Boolean(
      (kycData?.bankAccountNumber && kycData.bankAccountNumber.trim().length > 0) ||
      (kycData?.bankDetails?.accountNumber && kycData.bankDetails.accountNumber.trim().length > 0)
    );
    const isKycApproved = (kycData?.status === 'VERIFIED' || memberData?.kycStatus === 'VERIFIED') && hasSavedBank;
    const isPaid = memberData?.platformFeePaid || false;
    const isActive = memberData?.status === 'ACTIVE' && isPaid;
    const feeAmount = feeData?.amount ?? 100;

    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center mb-2">
              <img src="/nexvia.png" alt="NexVia Logo" className="h-14 w-auto object-contain"/>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              NexVia Member Verification &amp; Activation
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
              Automated PAN &amp; Aadhaar verification with instant compliance approval.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium flex items-start gap-2.5 shadow-sm">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5"/>
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium flex items-start gap-2.5 shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5"/>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Stepper */}
          <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-2xl border border-gray-200/80 shadow-sm text-center text-xs font-bold">
            <div className={`py-2 rounded-xl transition ${isKycApproved ? 'bg-emerald-50 text-emerald-700 font-extrabold' : 'bg-amber-50 text-amber-800'}`}>
              1. KYC Verification {isKycApproved ? '✓' : ''}
            </div>
            <div className={`py-2 rounded-xl transition ${isKycApproved && !isPaid ? 'bg-amber-50 text-amber-800 font-extrabold' : isPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-400'}`}>
              2. ₹{feeAmount} Activation {isPaid ? '✓' : ''}
            </div>
            <div className={`py-2 rounded-xl transition ${isActive ? 'bg-emerald-50 text-emerald-700 font-extrabold' : 'bg-gray-50 text-gray-400'}`}>
              3. Dashboard Unlocked {isActive ? '✓' : ''}
            </div>
          </div>

          {/* ACTIVE STATE */}
          {isActive ? (
            <div className="bg-white border border-gray-200/80 rounded-3xl p-8 text-center shadow-xl space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
                <CheckCircle2 className="w-8 h-8"/>
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-gray-900">Membership Activated!</h2>
                <p className="text-xs text-gray-500">Your account is fully verified and placed in the 3×15 Matrix.</p>
              </div>

              <button
                type="button"
                onClick={() => router.push('/nextview/dashboard')}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold shadow-md shadow-amber-500/20"
              >
                <span>Enter Member Dashboard</span>
                <ArrowRight className="w-4 h-4"/>
              </button>
            </div>
          ) : isKycApproved && !isPaid ? (
            /* KYC APPROVED -> PLATFORM FEE PAYMENT */
            <div className="bg-white border border-gray-200/80 rounded-3xl p-8 shadow-xl space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600"/>
                  <span>KYC Verified &amp; Approved</span>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">Activate Your NexVia Membership</h2>
                <p className="text-xs text-gray-500">Pay the ₹{feeAmount} one-time activation fee to unlock your Matrix position.</p>
              </div>

              <button
                type="button"
                onClick={handlePayPlatformFee}
                disabled={payingFee}
                className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-extrabold shadow-lg shadow-amber-500/25 disabled:opacity-50"
              >
                <CreditCard className="w-5 h-5"/>
                <span>{payingFee ? 'Processing...' : `Pay ₹${feeAmount} Platform Fee`}</span>
              </button>
            </div>
          ) : (
            /* KYC VERIFICATION FORM */
            <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900">Identity &amp; Compliance Verification</h2>
                <p className="text-xs text-gray-500">Verify your PAN and Aadhaar using instant API checks.</p>
              </div>

              {/* PAN Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">1. PAN Verification</h3>
                  {isPanVerified && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      ✓ PAN Verified
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      disabled={isPanVerified}
                      name="fullName"
                      value={form.fullName}
                      onChange={handleFormChange}
                      placeholder="Name on PAN"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">PAN Card Number *</label>
                    <input
                      type="text"
                      disabled={isPanVerified}
                      maxLength={10}
                      name="panNumber"
                      value={form.panNumber}
                      onChange={handleFormChange}
                      placeholder="ABCDE1234F"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono uppercase font-bold text-gray-900 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">DOB (DD/MM/YYYY) *</label>
                    <div className="relative">
                      <input
                        type="text"
                        disabled={isPanVerified}
                        maxLength={10}
                        name="dob"
                        value={form.dob}
                        onChange={(e) => {
                          const formatted = formatDobInput(e.target.value);
                          setForm((prev) => ({ ...prev, dob: formatted }));
                        }}
                        onBlur={() => {
                          if (form.dob) {
                            const normalized = normalizeDob(form.dob);
                            setForm((prev) => ({ ...prev, dob: normalized }));
                          }
                        }}
                        placeholder="DD/MM/YYYY"
                        className="w-full pl-3 pr-9 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono text-gray-900 disabled:bg-gray-100 focus:outline-none focus:border-amber-500"
                      />
                      {/* Hidden native date input for calendar selection */}
                      <input
                        ref={datePickerRef}
                        type="date"
                        disabled={isPanVerified}
                        max={new Date().toISOString().split('T')[0]}
                        value={dobToIso(form.dob)}
                        onChange={(e) => {
                          if (e.target.value) {
                            const normalized = normalizeDob(e.target.value);
                            setForm((prev) => ({ ...prev, dob: normalized }));
                          }
                        }}
                        className="sr-only"
                        tabIndex={-1}
                        aria-hidden="true"
                      />
                      <button
                        type="button"
                        disabled={isPanVerified}
                        onClick={() => {
                          try {
                            datePickerRef.current?.showPicker();
                          } catch {
                            datePickerRef.current?.focus();
                          }
                        }}
                        title="Choose from calendar"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-600 transition p-1 disabled:opacity-50"
                      >
                        <Calendar size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {!isPanVerified && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleVerifyPan}
                      disabled={verifyingPan || !form.panNumber || !form.dob}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {verifyingPan ? <RefreshCw size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
                      <span>{verifyingPan ? 'Verifying PAN...' : 'Verify PAN'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Aadhaar Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">2. Aadhaar OTP Verification</h3>
                  {isAadhaarVerified && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      ✓ Aadhaar Verified
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Aadhaar Number (12 Digits) *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      disabled={isAadhaarVerified || aadhaarOtpSent}
                      maxLength={12}
                      name="aadhaarNumber"
                      value={form.aadhaarNumber}
                      onChange={handleFormChange}
                      placeholder="12-digit Aadhaar Number"
                      className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono text-gray-900 disabled:bg-gray-100"
                    />
                    {!isAadhaarVerified && (
                      <button
                        type="button"
                        onClick={handleSendAadhaarOtp}
                        disabled={sendingAadhaarOtp || form.aadhaarNumber.length !== 12 || resendCountdown > 0}
                        className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {sendingAadhaarOtp ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
                        <span>{resendCountdown > 0 ? `${resendCountdown}s` : aadhaarOtpSent ? 'Resend OTP' : 'Send OTP'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {aadhaarOtpSent && !isAadhaarVerified && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                    <label className="block text-[11px] font-bold text-amber-900">Enter 6-Digit OTP</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={aadhaarOtp}
                        onChange={(e) => setAadhaarOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="6-digit OTP"
                        className="flex-1 px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm font-mono tracking-widest text-gray-900"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyAadhaarOtp}
                        disabled={verifyingAadhaarOtp || aadhaarOtp.length !== 6}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {verifyingAadhaarOtp ? <RefreshCw size={13} className="animate-spin" /> : <KeyRound size={13} />}
                        <span>Verify</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bank Details Form */}
              <form id="verification-bank-section" onSubmit={handleKycSubmit} className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b pb-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    3. Bank Account Details (Payout Destination)
                  </h3>
                  {hasSavedBank && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      ✓ Details Saved
                    </span>
                  )}
                </div>

                {isPanVerified && isAadhaarVerified && !hasSavedBank && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-bold">Identity Verified! Please enter your Bank Account details</p>
                      <p className="text-amber-800 mt-0.5">
                        Your PAN and Aadhaar have been verified. Please enter your bank account details below to complete KYC and unlock Step 2 (Platform Activation).
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Account Holder Name *</label>
                    <input
                      type="text"
                      required
                      name="accountHolderName"
                      value={form.accountHolderName}
                      onChange={handleFormChange}
                      placeholder="Name in passbook"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">IFSC Code *</label>
                    <input
                      type="text"
                      required
                      maxLength={11}
                      name="ifscCode"
                      value={form.ifscCode}
                      onChange={handleIfscChange}
                      placeholder="e.g. SBIN0000691"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono font-bold uppercase text-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Account Number *</label>
                    <input
                      type="password"
                      required
                      name="accountNumber"
                      value={form.accountNumber}
                      onChange={handleFormChange}
                      placeholder="Bank account number"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Confirm Account Number *</label>
                    <input
                      type="text"
                      required
                      name="confirmAccountNumber"
                      value={form.confirmAccountNumber}
                      onChange={handleFormChange}
                      placeholder="Re-enter account number"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono text-gray-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingKyc}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FileCheck className="w-4 h-4"/>
                  <span>{submittingKyc ? 'Saving Details...' : (isPanVerified && isAadhaarVerified) ? 'Save Bank Details & Proceed to Step 2' : 'Save Bank & Compliance Details'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
}
