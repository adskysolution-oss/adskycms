'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck, CheckCircle2, AlertCircle, Clock, ArrowRight,
  CreditCard, Building, Building2, RefreshCw, Lock, Sparkles, Check, User
} from 'lucide-react';
import toast from 'react-hot-toast';

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
    aadhaarNumber: '',
    bankAccountNumber: '',
    confirmAccountNumber: '',
    accountHolderName: '',
    bankName: '',
    branchName: '',
  });

  const [ifsc, setIfsc] = useState('');
  const [fetchingIfsc, setFetchingIfsc] = useState(false);
  const [ifscError, setIfscError] = useState('');
  const [bankDetails, setBankDetails] = useState(null);

  const [submittingKyc, setSubmittingKyc] = useState(false);
  const [payingFee, setPayingFee] = useState(false);

  const loadOnboardingState = async () => {
    setLoading(true);
    try {
      const [meRes, feeRes] = await Promise.all([
        fetch('/api/mlm/auth/me').then(r => r.json()),
        fetch('/api/mlm/payment/platform-fee').then(r => r.json())
      ]);

      if (!meRes.success) {
        router.push('/nextview/login');
        return;
      }

      setMember(meRes.member);

      if (feeRes.success) {
        setFeeData(feeRes.data);
        if (feeRes.data?.kyc) setKyc(feeRes.data.kyc);
      }

      // Also check KYC details
      const kycRes = await fetch('/api/mlm/kyc').then(r => r.json());
      if (kycRes.success && kycRes.kyc) {
        setKyc(kycRes.kyc);
        setForm(prev => ({
          ...prev,
          fullName: kycRes.kyc.fullName || meRes.member.fullName || '',
          panNumber: kycRes.kyc.panNumber || '',
          aadhaarNumber: kycRes.kyc.aadhaarNumber || '',
          bankAccountNumber: kycRes.kyc.bankAccountNumber || '',
          confirmAccountNumber: kycRes.kyc.bankAccountNumber || '',
          accountHolderName: kycRes.kyc.accountHolderName || meRes.member.fullName || '',
          bankName: kycRes.kyc.bankName || '',
          branchName: kycRes.kyc.bankBranch || '',
        }));
        if (kycRes.kyc.bankIfscCode) {
          setIfsc(kycRes.kyc.bankIfscCode);
        }
      } else {
        setForm(prev => ({ ...prev, fullName: meRes.member.fullName || '', accountHolderName: meRes.member.fullName || '' }));
      }

      // If already active and fee paid, go to dashboard
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
    loadOnboardingState();

    // Check if returning from Cashfree redirect with order_id
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const orderId = params.get('order_id');
      if (orderId) {
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

  const handleKycSubmit = async (e) => {
    e.preventDefault();

    if (form.bankAccountNumber && form.confirmAccountNumber && form.bankAccountNumber !== form.confirmAccountNumber) {
      toast.error('Bank account numbers do not match!');
      return;
    }

    if (!ifsc || ifsc.length !== 11) {
      toast.error('Please enter a valid 11-character IFSC code.');
      return;
    }

    setSubmittingKyc(true);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        panNumber: form.panNumber.trim().toUpperCase(),
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
        toast.success('KYC submitted! Now awaiting Admin Approval.');
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
      // 1. Create Cashfree order
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

      // 2. Load Cashfree JS SDK v3
      const loaded = await loadScript('https://sdk.cashfree.com/js/v3/cashfree.js');
      if (loaded && window.Cashfree) {
        const mode = paymentInfo.environment === 'sandbox' ? 'sandbox' : 'production';
        const cashfree = window.Cashfree({ mode });

        // Checkout with seamless modal or redirect
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
          } else if (result.redirect) {
            console.log('Redirecting to return_url...');
          }
        }).catch((cfErr) => {
          console.warn('Modal checkout notice, falling back to redirect:', cfErr);
          cashfree.checkout({
            paymentSessionId: paymentInfo.paymentSessionId,
            redirectTarget: '_self',
          });
        });
      } else {
        toast.error('Could not load Cashfree SDK. Please check your internet connection.');
        setPayingFee(false);
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error during payment initiation');
      setPayingFee(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darker flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-text-muted">Loading Onboarding Gateway...</p>
        </div>
      </div>
    );
  }

  const isKycSubmitted = !!kyc && (kyc.status === 'PENDING' || kyc.status === 'UNDER_REVIEW' || kyc.status === 'VERIFIED');
  const isKycVerified = kyc?.status === 'VERIFIED' || member?.kycStatus === 'VERIFIED';
  const isFeePaid = !!member?.platformFeePaid;

  // Determine current active step: 1 (KYC), 2 (Payment), 3 (Unlocked)
  const currentStep = !isKycVerified ? 1 : !isFeePaid ? 2 : 3;

  return (
    <div className="min-h-screen bg-darker text-text-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header banner */}
        <div className="bg-gradient-to-br from-[#0e1726] to-[#0b1220] border border-amber-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-wider">
                Member Onboarding Gate
              </span>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Account Activation &amp; Compliance
              </h1>
              <p className="text-xs text-text-secondary">
                Welcome <strong className="text-white">{member?.fullName}</strong> ({member?.mlmCode}). Complete the 2-step verification below to unlock your dashboard and 3×15 Matrix.
              </p>
            </div>

            <button
              onClick={async () => {
                await fetch('/api/mlm/auth/logout', { method: 'POST' });
                router.push('/nextview/login');
              }}
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-white/5 border border-white/10"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* 3-Step Visual Progress Stepper */}
        <div className="grid grid-cols-3 gap-3">
          {/* Step 1 */}
          <div className={`p-4 rounded-2xl border transition ${
            isKycVerified
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : currentStep === 1
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-dark border-white/5 text-text-muted'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider">Step 1</span>
              {isKycVerified ? <CheckCircle2 size={16} className="text-emerald-400" /> : <ShieldCheck size={16} />}
            </div>
            <p className="text-xs font-black text-white">KYC Verification</p>
            <p className="text-[10px] mt-0.5 opacity-80">
              {isKycVerified ? 'Verified by Admin' : isKycSubmitted ? 'Under Admin Review' : 'Details Required'}
            </p>
          </div>

          {/* Step 2 */}
          <div className={`p-4 rounded-2xl border transition ${
            isFeePaid
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : currentStep === 2
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-dark border-white/5 text-text-muted'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider">Step 2</span>
              {isFeePaid ? <CheckCircle2 size={16} className="text-emerald-400" /> : <CreditCard size={16} />}
            </div>
            <p className="text-xs font-black text-white">Platform Activation</p>
            <p className="text-[10px] mt-0.5 opacity-80">
              {isFeePaid ? 'Paid & Activated' : isKycVerified ? '₹100 Deposit Ready' : 'Locked until KYC'}
            </p>
          </div>

          {/* Step 3 */}
          <div className={`p-4 rounded-2xl border transition ${
            currentStep === 3
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-dark border-white/5 text-text-muted'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider">Step 3</span>
              {currentStep === 3 ? <Sparkles size={16} className="text-emerald-400" /> : <Lock size={16} />}
            </div>
            <p className="text-xs font-black text-white">Dashboard Unlocked</p>
            <p className="text-[10px] mt-0.5 opacity-80">
              {currentStep === 3 ? 'Full Access Granted' : 'Locked'}
            </p>
          </div>
        </div>

        {/* STEP 1 CONTAINER */}
        {!isKycVerified && (
          <div className="space-y-6">
            {isKycSubmitted ? (
              /* KYC IS SUBMITTED BUT WAITING FOR ADMIN APPROVAL */
              <div className="bg-[#0b1220]/95 border border-amber-500/30 p-8 sm:p-10 rounded-3xl text-center space-y-4 shadow-2xl">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 animate-pulse">
                  <Clock size={36} />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-white">
                    KYC Submitted &amp; Awaiting Admin Approval
                  </h2>
                  <p className="text-text-secondary text-xs max-w-lg mx-auto">
                    Your PAN, Aadhaar, and Bank IFSC details have been submitted and are currently in the <strong>Admin Compliance Queue</strong>. Dashboard and matrix activation will unlock as soon as the Admin approves your profile.
                  </p>
                </div>

                <div className="p-4 bg-dark/80 border border-white/5 rounded-2xl max-w-md mx-auto text-left space-y-2 text-xs">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-text-secondary">Submitted Name:</span>
                    <span className="font-bold text-white">{kyc?.fullName}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-text-secondary">PAN Number:</span>
                    <span className="font-mono font-bold text-amber-400 uppercase">{kyc?.panNumber || 'Provided'}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-text-secondary">Bank / IFSC:</span>
                    <span className="font-mono font-bold text-emerald-400">{kyc?.bankIfscCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Status:</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold">
                      {kyc?.status || 'UNDER_REVIEW'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={loadOnboardingState}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10 transition"
                  >
                    <RefreshCw size={14} />
                    <span>Check Approval Status</span>
                  </button>
                </div>
              </div>
            ) : (
              /* KYC NOT SUBMITTED YET — SHOW FORM */
              <form
                onSubmit={handleKycSubmit}
                className="bg-[#0b1220]/95 border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2 text-amber-400">
                    <ShieldCheck size={18} />
                    <h3 className="text-sm font-black uppercase tracking-wider">
                      Step 1: Submit Identity &amp; Bank Details
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/20">
                    Mandatory Step
                  </span>
                </div>

                {/* Identity Inputs */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                        Full Legal Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        placeholder="Name on PAN"
                        className="w-full px-4 py-2.5 bg-dark border border-white/10 rounded-xl text-sm text-white placeholder:text-text-muted focus:border-amber-500 focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                        PAN Card Number *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={10}
                        value={form.panNumber}
                        onChange={(e) => setForm({ ...form, panNumber: e.target.value.toUpperCase() })}
                        placeholder="ABCDE1234F"
                        className="w-full px-4 py-2.5 bg-dark border border-white/10 rounded-xl text-sm font-mono uppercase text-white placeholder:text-text-muted focus:border-amber-500 focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                        Aadhaar Number (12 digits) *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={12}
                        value={form.aadhaarNumber}
                        onChange={(e) => setForm({ ...form, aadhaarNumber: e.target.value.replace(/\D/g, '') })}
                        placeholder="12-digit Number"
                        className="w-full px-4 py-2.5 bg-dark border border-white/10 rounded-xl text-sm font-mono text-white placeholder:text-text-muted focus:border-amber-500 focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Bank Account Inputs */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Bank Details (Auto-Fetch by IFSC)
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
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
                        className="w-full pl-4 pr-12 py-2.5 bg-dark border border-white/10 rounded-xl text-sm font-mono font-bold text-white uppercase focus:border-amber-500 focus:outline-none transition"
                      />
                      <div className="absolute right-3.5 top-3">
                        {fetchingIfsc && <RefreshCw size={16} className="animate-spin text-amber-400" />}
                        {!fetchingIfsc && bankDetails && <Check size={16} className="text-emerald-400" />}
                      </div>
                    </div>
                    {ifscError && <p className="text-xs text-rose-400 mt-1">{ifscError}</p>}
                  </div>

                  {bankDetails && (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-3">
                      <Building2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-extrabold text-white">{bankDetails.bankName || form.bankName}</p>
                        <p className="text-text-secondary">Branch: {bankDetails.branch || form.branchName}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                        Account Number *
                      </label>
                      <input
                        type="password"
                        required
                        value={form.bankAccountNumber}
                        onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })}
                        placeholder="Bank Account Number"
                        className="w-full px-4 py-2.5 bg-dark border border-white/10 rounded-xl text-sm font-mono text-white focus:border-amber-500 focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                        Confirm Account Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.confirmAccountNumber}
                        onChange={(e) => setForm({ ...form, confirmAccountNumber: e.target.value })}
                        placeholder="Re-enter Account Number"
                        className="w-full px-4 py-2.5 bg-dark border border-white/10 rounded-xl text-sm font-mono text-white focus:border-amber-500 focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingKyc}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>{submittingKyc ? 'Submitting Details...' : 'Submit KYC for Admin Review'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        )}

        {/* STEP 2 CONTAINER: KYC VERIFIED ➔ PLATFORM FEE / DEPOSIT */}
        {isKycVerified && !isFeePaid && (
          <div className="bg-[#0b1220]/95 border border-emerald-500/30 p-8 sm:p-10 rounded-3xl space-y-6 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  Step 1 Completed: KYC Approved &amp; Verified!
                </h3>
                <p className="text-xs text-text-secondary">
                  Your identity &amp; bank records have been approved by Admin. Now complete Step 2 to activate your 3×15 Matrix position.
                </p>
              </div>
            </div>

            {/* Fee Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-dark to-[#0b1220] border border-amber-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    Lifetime Membership &amp; Matrix Placement
                  </span>
                  <h4 className="text-xl font-black text-white mt-0.5">
                    Platform Activation Fee
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-amber-400 font-mono">₹100</span>
                  <span className="text-[10px] text-text-muted block">One-time Fee</span>
                </div>
              </div>

              <ul className="text-xs text-text-secondary space-y-2 border-t border-white/5 pt-3">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400" />
                  <span>Permanent placement in 3×15 Ternary Matrix tree</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400" />
                  <span>Direct referral commission &amp; spillover earnings eligibility</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400" />
                  <span>Instant wallet withdrawals to verified bank account</span>
                </li>
              </ul>

              <button
                onClick={handlePayFee}
                disabled={payingFee}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm shadow-xl shadow-amber-500/20 hover:scale-[1.01] transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{payingFee ? 'Activating Account & Matrix...' : 'Pay ₹100 & Activate Matrix Position'}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
