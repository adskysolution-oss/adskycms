'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck, CheckCircle2, AlertCircle, Clock, ArrowRight,
  CreditCard, Building2, RefreshCw, Lock, Sparkles, Check, CheckCircle,
  KeyRound, Send, AlertTriangle, Calendar
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

export default function NextViewOnboardingPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState(null);
  const [kyc, setKyc] = useState(null);
  const [feeData, setFeeData] = useState(null);

  // Form State for Step 1 (KYC)
  const [form, setForm] = useState({
    fullName: '',
    panNumber: '',
    dob: '',
    aadhaarNumber: '',
    bankAccountNumber: '',
    confirmAccountNumber: '',
    accountHolderName: '',
    bankName: '',
    branchName: '',
  });

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

  // Bank / IFSC state
  const [ifsc, setIfsc] = useState('');
  const [fetchingIfsc, setFetchingIfsc] = useState(false);
  const [ifscError, setIfscError] = useState('');
  const [bankDetails, setBankDetails] = useState(null);

  const [submittingKyc, setSubmittingKyc] = useState(false);
  const [payingFee, setPayingFee] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);

  // Countdown timer for Aadhaar OTP resend
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

  const loadOnboardingState = async () => {
    try {
      const [meRes, feeRes, kycRes] = await Promise.all([
        fetch('/api/mlm/auth/me').then((r) => r.json()),
        fetch('/api/mlm/payment/platform-fee').then((r) => r.json()),
        fetch('/api/mlm/kyc').then((r) => r.json()),
      ]);

      if (!meRes.success) {
        router.push('/nextview/login');
        return;
      }

      setMember(meRes.member);

      if (feeRes.success) {
        setFeeData(feeRes.data);
      }

      if (kycRes.success && kycRes.kyc) {
        const k = kycRes.kyc;
        setKyc(k);
        setForm((prev) => ({
          ...prev,
          fullName: k.fullName || meRes.member.fullName || '',
          panNumber: k.panNumber || '',
          dob: k.dob || '',
          aadhaarNumber: k.aadhaarNumber || '',
          bankAccountNumber: k.bankAccountNumber || '',
          confirmAccountNumber: k.bankAccountNumber || '',
          accountHolderName: k.accountHolderName || meRes.member.fullName || '',
          bankName: k.bankName || '',
          branchName: k.bankBranch || '',
        }));

        if (k.bankIfscCode) {
          setIfsc(k.bankIfscCode);
        }

        if (k.panVerification?.verified) {
          setPanResult({
            verified: true,
            status: 'VERIFIED',
            maskedPan: k.maskedPan,
            nameMatch: k.panVerification.nameMatch,
            dobMatch: k.panVerification.dobMatch,
          });
        }

        if (k.aadhaarVerification?.verified) {
          setAadhaarResult({
            verified: true,
            status: 'VERIFIED',
            maskedAadhaar: k.maskedAadhaar,
          });
        }
      } else {
        setForm((prev) => ({
          ...prev,
          fullName: meRes.member.fullName || '',
          accountHolderName: meRes.member.fullName || '',
        }));
      }

      if (meRes.member.status === 'ACTIVE' && meRes.member.kycStatus === 'VERIFIED' && meRes.member.platformFeePaid) {
        router.push('/nextview/dashboard');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load onboarding state');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOnboardingState();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const orderId = params.get('order_id');
      if (orderId) {
        setTimeout(() => {
          setPayingFee(true);
          const toastId = toast.loading('Verifying payment with Cashfree...');
          fetch('/api/mlm/payment/platform-fee', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'VERIFY_PAYMENT', orderId }),
          })
            .then((r) => r.json())
            .then((data) => {
              toast.dismiss(toastId);
              if (data.success) {
                toast.success('Payment verified! Your account is now ACTIVE.');
                setTimeout(() => {
                  router.push('/nextview/dashboard');
                }, 1200);
              } else {
                toast.error(data.message || 'Payment verification pending. Please try again.');
              }
            })
            .catch(() => {
              toast.dismiss(toastId);
              toast.error('Network error while verifying payment');
            })
            .finally(() => {
              setPayingFee(false);
            });
        }, 0);
      }
    }
  }, []);

  // Auto-fetch Bank by IFSC
  const handleIfscLookup = async (codeToLookup) => {
    const code = (codeToLookup || ifsc).trim().toUpperCase();
    if (!code || code.length !== 11) {
      setIfscError('Enter a valid 11-character IFSC code');
      setBankDetails(null);
      return;
    }

    setFetchingIfsc(true);
    setIfscError('');

    try {
      const res = await fetch(`/api/ifsc/${code}`);
      const data = await res.json();

      if (res.ok && data.success && data.data) {
        setBankDetails(data.data);
        setForm((prev) => ({
          ...prev,
          bankName: data.data.bankName || '',
          branchName: data.data.branch || '',
        }));
        toast.success(`Bank auto-fetched: ${data.data.bankName} (${data.data.branch})`);
      } else {
        setIfscError('IFSC code not found. Enter details manually.');
        setBankDetails(null);
      }
    } catch {
      setIfscError('Failed to verify IFSC code.');
      setBankDetails(null);
    } finally {
      setFetchingIfsc(false);
    }
  };

  const handleIfscChange = (e) => {
    const val = e.target.value.toUpperCase().trim().slice(0, 11);
    setIfsc(val);
    if (val.length === 11) {
      handleIfscLookup(val);
    } else {
      setBankDetails(null);
      setIfscError('');
    }
  };

  // ── PAN Auto-Verification ──
  const handleVerifyPan = async () => {
    const pan = form.panNumber.trim().toUpperCase();
    const name = form.fullName.trim();
    const cleanDob = normalizeDob(form.dob);

    if (!pan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
      toast.error('Please enter a valid 10-character PAN (e.g. ABCDE1234F)');
      return;
    }
    if (!name) {
      toast.error('Please enter your legal name as on PAN card');
      return;
    }
    if (!cleanDob || !isValidDob(cleanDob)) {
      toast.error('Please enter a valid Date of Birth (DD/MM/YYYY)');
      return;
    }

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
        toast.success(data.message || 'PAN verified successfully!');
        loadOnboardingState();
      } else {
        setPanResult({
          verified: false,
          status: data.status || 'FAILED',
          message: data.message || 'PAN verification failed',
          isMismatch: data.isMismatch,
        });
        toast.error(data.message || 'PAN details could not be matched.');
      }
    } catch {
      toast.error('Network error during PAN verification');
    } finally {
      setVerifyingPan(false);
    }
  };

  // ── Aadhaar Send OTP ──
  const handleSendAadhaarOtp = async () => {
    const cleanAadhaar = form.aadhaarNumber.trim().replace(/\D/g, '');
    if (cleanAadhaar.length !== 12) {
      toast.error('Please enter a valid 12-digit Aadhaar number');
      return;
    }

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
        toast.success(data.message || 'OTP sent to Aadhaar-registered mobile number!');
      } else {
        toast.error(data.message || 'Failed to send Aadhaar OTP');
      }
    } catch {
      toast.error('Network error while requesting Aadhaar OTP');
    } finally {
      setSendingAadhaarOtp(false);
    }
  };

  // ── Aadhaar Verify OTP ──
  const handleVerifyAadhaarOtp = async () => {
    const cleanOtp = aadhaarOtp.trim().replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      toast.error('Please enter the 6-digit OTP received on mobile');
      return;
    }

    setVerifyingAadhaarOtp(true);
    try {
      const res = await fetch('/api/mlm/kyc/aadhaar/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: cleanOtp }),
      });
      const data = await res.json();

      if (res.ok && data.success && data.verified) {
        setAadhaarResult(data.aadhaarVerification || { verified: true, status: 'VERIFIED' });
        toast.success(data.message || 'Aadhaar verified successfully! Please enter your Bank Account details below to proceed.');
        loadOnboardingState();
        setTimeout(() => {
          document.getElementById('bank-details-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 350);
      } else {
        toast.error(data.message || 'Aadhaar OTP verification failed');
      }
    } catch {
      toast.error('Network error during Aadhaar OTP verification');
    } finally {
      setVerifyingAadhaarOtp(false);
    }
  };

  // ── Submit Complete KYC Form ──
  const handleKycSubmit = async (e) => {
    e.preventDefault();

    if (!form.bankAccountNumber?.trim()) {
      toast.error('Please enter your Bank Account Number.');
      return;
    }

    if (form.confirmAccountNumber && form.bankAccountNumber.trim() !== form.confirmAccountNumber.trim()) {
      toast.error('Bank account numbers do not match!');
      return;
    }

    if (!ifsc || ifsc.trim().length !== 11) {
      toast.error('Please enter a valid 11-character IFSC code.');
      return;
    }

    setSubmittingKyc(true);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        panNumber: form.panNumber.trim().toUpperCase(),
        dob: form.dob.trim(),
        aadhaarNumber: form.aadhaarNumber.trim(),
        bankAccountNumber: form.bankAccountNumber.trim(),
        bankIfscCode: ifsc.trim().toUpperCase(),
        bankName: form.bankName.trim(),
        bankBranch: form.branchName.trim(),
        accountHolderName: form.accountHolderName.trim() || form.fullName.trim(),
      };

      const res = await fetch('/api/mlm/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'KYC details updated successfully!');
        loadOnboardingState();
      } else {
        toast.error(data.message || 'Failed to submit KYC.');
      }
    } catch {
      toast.error('Network error during KYC submission');
    } finally {
      setSubmittingKyc(false);
    }
  };

  const handlePayFee = async () => {
    setPayingFee(true);
    try {
      const res = await fetch('/api/mlm/payment/platform-fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE_ORDER' }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to initiate payment.');
        setPayingFee(false);
        return;
      }

      const paymentInfo = data.data;
      const loaded = await loadScript('https://sdk.cashfree.com/js/v3/cashfree.js');
      if (loaded && window.Cashfree) {
        const mode = paymentInfo.environment === 'sandbox' ? 'sandbox' : 'production';
        const cashfree = window.Cashfree({ mode });

        cashfree.checkout({
          paymentSessionId: paymentInfo.paymentSessionId,
          redirectTarget: '_modal',
        }).then(async (result) => {
          if (result.error) {
            toast.error(result.error.message || 'Payment was cancelled or failed.');
            setPayingFee(false);
            return;
          }
          if (result.paymentDetails) {
            toast.loading('Confirming payment with Cashfree...', { id: 'cf-verify' });
            try {
              const verifyRes = await fetch('/api/mlm/payment/platform-fee', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'VERIFY_PAYMENT', orderId: paymentInfo.orderId }),
              });
              const verifyData = await verifyRes.json();
              toast.dismiss('cf-verify');
              if (verifyRes.ok && verifyData.success) {
                toast.success('Payment confirmed! Your account is now ACTIVE.');
                setTimeout(() => {
                  router.push('/nextview/dashboard');
                }, 1200);
              } else {
                toast.error(verifyData.message || 'Payment verification pending.');
              }
            } catch {
              toast.dismiss('cf-verify');
              toast.error('Network error during verification.');
            } finally {
              setPayingFee(false);
            }
          }
        }).catch(() => {
          cashfree.checkout({
            paymentSessionId: paymentInfo.paymentSessionId,
            redirectTarget: '_self',
          });
        });
      } else {
        toast.error('Could not load Cashfree SDK.');
        setPayingFee(false);
      }
    } catch {
      toast.error('Network error during payment initiation');
      setPayingFee(false);
    }
  };

  const handleCheckPaymentStatus = async () => {
    setCheckingPayment(true);
    const toastId = toast.loading('Checking payment status...');
    try {
      const res = await fetch('/api/mlm/payment/platform-fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CHECK_STATUS' }),
      });
      const data = await res.json();
      toast.dismiss(toastId);

      if (data.success && (data.result === 'PAID' || data.result === 'ALREADY_SYNCED' || data.data?.isAlreadyActive)) {
        toast.success('Payment confirmed! Your account is active.');
        setTimeout(() => {
          router.push('/nextview/dashboard');
        }, 1200);
      } else if (data.result === 'PENDING') {
        toast('Payment is still pending with Cashfree.', { icon: '⏳' });
      } else {
        toast.error(data.message || 'Unable to confirm payment.');
      }
    } catch {
      toast.dismiss(toastId);
      toast.error('Network error while checking payment status.');
    } finally {
      setCheckingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-500">Loading Onboarding Gateway...</p>
        </div>
      </div>
    );
  }

  const isPanVerified = kyc?.panVerification?.verified || panResult?.verified;
  const isAadhaarVerified = kyc?.aadhaarVerification?.verified || aadhaarResult?.verified;
  const hasSavedBank = Boolean(
    (kyc?.bankAccountNumber && kyc.bankAccountNumber.trim().length > 0) ||
    (kyc?.bankDetails?.accountNumber && kyc.bankDetails.accountNumber.trim().length > 0)
  );
  const isKycVerified = (kyc?.status === 'VERIFIED' || member?.kycStatus === 'VERIFIED') && hasSavedBank;
  const isFeePaid = !!member?.platformFeePaid;
  const currentStep = !isKycVerified ? 1 : !isFeePaid ? 2 : 3;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header banner */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-black uppercase tracking-wider">
                Member Compliance Gateway
              </span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Automatic KYC Verification &amp; Activation
              </h1>
              <p className="text-xs text-slate-600">
                Welcome <strong className="text-slate-900">{member?.fullName}</strong> ({member?.mlmCode}). Complete automatic PAN, Aadhaar &amp; Bank verification below to unlock your Matrix position.
              </p>
            </div>

            <button
              onClick={async () => {
                await fetch('/api/mlm/auth/logout', { method: 'POST' });
                router.push('/nextview/login');
              }}
              className="text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* 3-Step Visual Stepper */}
        <div className="grid grid-cols-3 gap-3">
          <div className={`p-4 rounded-2xl border transition ${
            isKycVerified
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : currentStep === 1
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-white border-slate-200 text-slate-400'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider">Step 1</span>
              {isKycVerified ? <CheckCircle2 size={16} className="text-emerald-600" /> : <ShieldCheck size={16} />}
            </div>
            <p className="text-xs font-black text-slate-900">KYC &amp; Bank Details</p>
            <p className="text-[10px] mt-0.5 opacity-80">
              {isKycVerified ? 'Auto-Verified' : !isPanVerified ? 'PAN Pending' : !isAadhaarVerified ? 'Aadhaar Pending' : 'Bank Details Pending'}
            </p>
          </div>

          <div className={`p-4 rounded-2xl border transition ${
            isFeePaid
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : currentStep === 2
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-white border-slate-200 text-slate-400'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider">Step 2</span>
              {isFeePaid ? <CheckCircle2 size={16} className="text-emerald-600" /> : <CreditCard size={16} />}
            </div>
            <p className="text-xs font-black text-slate-900">Platform Activation</p>
            <p className="text-[10px] mt-0.5 opacity-80">
              {isFeePaid ? 'Paid & Active' : isKycVerified ? `₹${feeData?.amount ?? 100} Deposit Ready` : 'Locked until KYC'}
            </p>
          </div>

          <div className={`p-4 rounded-2xl border transition ${
            currentStep === 3
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-white border-slate-200 text-slate-400'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider">Step 3</span>
              {currentStep === 3 ? <Sparkles size={16} className="text-emerald-600" /> : <Lock size={16} />}
            </div>
            <p className="text-xs font-black text-slate-900">Dashboard Unlocked</p>
            <p className="text-[10px] mt-0.5 opacity-80">
              {currentStep === 3 ? 'Full Access Granted' : 'Locked'}
            </p>
          </div>
        </div>

        {/* STEP 1 CONTAINER: KYC VERIFICATION */}
        {!isKycVerified && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2 text-amber-800">
                  <ShieldCheck size={18} />
                  <h3 className="text-sm font-black uppercase tracking-wider">
                    Step 1: Automatic KYC &amp; Bank Details Verification
                  </h3>
                </div>
                <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200">
                  APITXT Verified
                </span>
              </div>

              {/* Progress summary banner - 3 pillars: PAN, Aadhaar, Bank Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
                <div className="flex items-center gap-2">
                  {isPanVerified ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0"></div>
                  )}
                  <div>
                    <p className="font-bold text-slate-900">1. PAN Verification</p>
                    <p className="text-[10px] text-slate-500">
                      {isPanVerified ? '✓ Verified' : 'Pending Verification'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isAadhaarVerified ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0"></div>
                  )}
                  <div>
                    <p className="font-bold text-slate-900">2. Aadhaar OTP</p>
                    <p className="text-[10px] text-slate-500">
                      {isAadhaarVerified ? '✓ Verified' : aadhaarOtpSent ? '⏳ OTP Sent' : 'Pending OTP'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {hasSavedBank ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0"></div>
                  )}
                  <div>
                    <p className="font-bold text-slate-900">3. Bank Account</p>
                    <p className="text-[10px] text-slate-500">
                      {hasSavedBank ? '✓ Saved' : 'Pending Details'}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── 1. PAN SECTION ── */}
              <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    1. PAN Card Verification
                  </h4>
                  {isPanVerified ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                      <Check size={12} />
                      <span>✓ PAN Verified</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-semibold">Government Verified</span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      disabled={isPanVerified}
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="Name as per PAN"
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 disabled:opacity-75 disabled:bg-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      PAN Number (10 Chars) *
                    </label>
                    <input
                      type="text"
                      disabled={isPanVerified}
                      maxLength={10}
                      value={form.panNumber}
                      onChange={(e) => setForm({ ...form, panNumber: e.target.value.toUpperCase() })}
                      placeholder="ABCDE1234F"
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold uppercase text-slate-900 focus:outline-none focus:border-amber-500 disabled:opacity-75 disabled:bg-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Date of Birth (DD/MM/YYYY) *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        disabled={isPanVerified}
                        maxLength={10}
                        value={form.dob}
                        onChange={(e) => {
                          const formatted = formatDobInput(e.target.value);
                          setForm({ ...form, dob: formatted });
                        }}
                        onBlur={() => {
                          if (form.dob) {
                            const normalized = normalizeDob(form.dob);
                            setForm({ ...form, dob: normalized });
                          }
                        }}
                        placeholder="DD/MM/YYYY"
                        className="w-full pl-3.5 pr-10 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-500 disabled:opacity-75 disabled:bg-slate-100"
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
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-600 transition p-1 disabled:opacity-50"
                      >
                        <Calendar size={15} />
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
                      {verifyingPan ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          <span>Verifying PAN...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={13} />
                          <span>Verify PAN</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {panResult && !panResult.verified && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                    <AlertTriangle size={15} className="shrink-0 mt-0.5 text-rose-600" />
                    <div>
                      <p className="font-bold">
                        {panResult.isMismatch ? 'Name/DOB Mismatch' : 'PAN Verification Failed'}
                      </p>
                      <p className="text-[11px] mt-0.5">{panResult.message}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* ── 2. AADHAAR SECTION ── */}
              <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    2. Aadhaar OTP Verification
                  </h4>
                  {isAadhaarVerified ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                      <Check size={12} />
                      <span>✓ Aadhaar Verified</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-semibold">2-Step UIDAI Verification</span>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Aadhaar Number (12 digits) *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        disabled={isAadhaarVerified || aadhaarOtpSent}
                        maxLength={12}
                        value={form.aadhaarNumber}
                        onChange={(e) => setForm({ ...form, aadhaarNumber: e.target.value.replace(/\D/g, '') })}
                        placeholder="12-digit Aadhaar Number"
                        className="flex-1 px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-500 disabled:opacity-75 disabled:bg-slate-100"
                      />
                      {!isAadhaarVerified && (
                        <button
                          type="button"
                          onClick={handleSendAadhaarOtp}
                          disabled={sendingAadhaarOtp || form.aadhaarNumber.length !== 12 || resendCountdown > 0}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
                        >
                          {sendingAadhaarOtp ? (
                            <>
                              <RefreshCw size={13} className="animate-spin" />
                              <span>Sending OTP...</span>
                            </>
                          ) : resendCountdown > 0 ? (
                            <span>Resend in {resendCountdown}s</span>
                          ) : (
                            <>
                              <Send size={13} />
                              <span>{aadhaarOtpSent ? 'Resend OTP' : 'Send OTP'}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {aadhaarOtpSent && !isAadhaarVerified && (
                    <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-900">
                        Enter 6-Digit Aadhaar OTP *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={aadhaarOtp}
                          onChange={(e) => setAadhaarOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="6-digit OTP"
                          className="flex-1 px-3.5 py-2 bg-white border border-amber-300 rounded-xl text-sm font-mono tracking-widest text-slate-900 focus:outline-none focus:border-amber-600"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyAadhaarOtp}
                          disabled={verifyingAadhaarOtp || aadhaarOtp.length !== 6}
                          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {verifyingAadhaarOtp ? (
                            <>
                              <RefreshCw size={13} className="animate-spin" />
                              <span>Verifying...</span>
                            </>
                          ) : (
                            <>
                              <KeyRound size={13} />
                              <span>Verify Aadhaar</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] text-amber-700">
                        OTP has been dispatched to the mobile number registered with your Aadhaar.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── 3. BANK DETAILS (AUTO-FETCH BY IFSC) ── */}
              <form id="bank-details-section" onSubmit={handleKycSubmit} className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-800">
                    3. Bank Account Details (Payout Destination)
                  </span>
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
                        Your PAN and Aadhaar have been verified. Please provide your bank account details below to secure payouts and advance to Step 2 (Platform Activation).
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Bank IFSC Code *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={11}
                      value={ifsc}
                      onChange={handleIfscChange}
                      placeholder="e.g. SBIN0000691, HDFC0000060"
                      className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 uppercase focus:bg-white focus:border-amber-500 focus:outline-none transition"
                    />
                    <div className="absolute right-3.5 top-3">
                      {fetchingIfsc && <RefreshCw size={16} className="animate-spin text-amber-600" />}
                      {!fetchingIfsc && bankDetails && <Check size={16} className="text-emerald-600" />}
                    </div>
                  </div>
                  {ifscError && <p className="text-xs text-rose-500 mt-1">{ifscError}</p>}
                </div>

                {bankDetails && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                    <Building2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-extrabold text-slate-900">{bankDetails.bankName || form.bankName}</p>
                      <p className="text-slate-600">Branch: {bankDetails.branch || form.branchName}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Account Number *
                    </label>
                    <input
                      type="password"
                      required
                      value={form.bankAccountNumber}
                      onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })}
                      placeholder="Bank Account Number"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Confirm Account Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.confirmAccountNumber}
                      onChange={(e) => setForm({ ...form, confirmAccountNumber: e.target.value })}
                      placeholder="Re-enter Account Number"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingKyc}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>{submittingKyc ? 'Saving Details...' : (isPanVerified && isAadhaarVerified) ? 'Save Bank Details & Proceed to Step 2' : 'Save Compliance & Bank Records'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* STEP 2 CONTAINER: KYC VERIFIED -> PLATFORM ACTIVATION FEE */}
        {isKycVerified && !isFeePaid && (
          <div className="bg-white border border-emerald-200 p-8 sm:p-10 rounded-3xl space-y-6 shadow-xl">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Step 1 Completed: KYC Approved &amp; Verified!
                </h3>
                <p className="text-xs text-slate-600">
                  Your identity has been verified. Complete Step 2 platform activation to secure your permanent 3×15 Matrix position.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50/60 to-orange-50/40 border border-amber-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                    {feeData?.feeDescription || feeData?.feeName || 'Lifetime Membership & Matrix Placement'}
                  </span>
                  <h4 className="text-xl font-black text-slate-900 mt-0.5">
                    Platform Activation Fee
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-amber-700 font-mono">₹{feeData?.amount ?? 100}</span>
                  <span className="text-[10px] text-slate-500 block">One-time Fee</span>
                </div>
              </div>

              <ul className="text-xs text-slate-700 space-y-2 border-t border-amber-200/60 pt-3">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600" />
                  <span>Permanent placement in 3×15 Ternary Matrix tree</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600" />
                  <span>Direct referral commission &amp; spillover earnings eligibility</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600" />
                  <span>Instant wallet withdrawals to verified bank account</span>
                </li>
              </ul>

              <button
                onClick={handlePayFee}
                disabled={payingFee || checkingPayment}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm shadow-xl shadow-amber-500/20 hover:scale-[1.01] transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{payingFee ? 'Activating Matrix...' : `Pay ₹${feeData?.amount ?? 100} & Activate Matrix Position`}</span>
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                onClick={handleCheckPaymentStatus}
                disabled={payingFee || checkingPayment}
                className="w-full py-3 rounded-2xl bg-white hover:bg-amber-50/70 border border-amber-300 text-amber-900 font-bold text-xs shadow-sm hover:shadow transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} className={checkingPayment ? 'animate-spin text-amber-600' : 'text-amber-600'} />
                <span>{checkingPayment ? 'Checking Payment...' : 'Already paid? Check Payment Status'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
