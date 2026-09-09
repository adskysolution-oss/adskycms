'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, CheckCircle2, AlertCircle, Clock, ArrowRight, CreditCard, Building, FileCheck, RefreshCw } from 'lucide-react';
function loadScript(src) {
    return new Promise((resolve) => {
        if (typeof document === 'undefined')
            return resolve(false);
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve(true);
            return;
        }
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
    // IFSC Auto-fetch state
    const [fetchingIfsc, setFetchingIfsc] = useState(false);
    const [ifscDetails, setIfscDetails] = useState(null);
    const [ifscError, setIfscError] = useState('');
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
            const res = await fetch(`https://ifsc.razorpay.com/${code}`);
            if (res.ok) {
                const data = await res.json();
                setIfscDetails({
                    bank: data.BANK || '',
                    branch: data.BRANCH || '',
                    city: data.CITY || '',
                });
                setForm((prev) => ({
                    ...prev,
                    bankName: `${data.BANK} - ${data.BRANCH}`,
                }));
            }
            else {
                setIfscError('Invalid IFSC code or branch not found');
                setIfscDetails(null);
            }
        }
        catch {
            setIfscError('Failed to verify IFSC code');
            setIfscDetails(null);
        }
        finally {
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
                setKycData(kycRes.data.kyc);
                const kyc = kycRes.data.kyc;
                setForm({
                    panNumber: kyc.panNumber || '',
                    aadhaarNumber: kyc.aadhaarNumber || '',
                    accountHolderName: kyc.bankDetails?.accountHolderName || '',
                    accountNumber: kyc.bankDetails?.accountNumber || '',
                    confirmAccountNumber: kyc.bankDetails?.accountNumber || '',
                    ifscCode: kyc.bankDetails?.ifscCode || '',
                    bankName: kyc.bankDetails?.bankName || '',
                    upiId: kyc.bankDetails?.upiId || '',
                });
            }
            if (feeRes.success && feeRes.data) {
                setFeeData(feeRes.data);
            }
        }
        catch (err) {
            console.error('Error loading onboarding status:', err);
            setError('Unable to load onboarding status. Please refresh.');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadData();
        // Check for payment callback from direct gateway
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('order_id');
        if (orderId) {
            fetch('/api/mlm/payment/platform-fee', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'VERIFY_PAYMENT', orderId }),
            })
                .then((r) => r.json())
                .then((vData) => {
                if (vData.success) {
                    setSuccessMsg('Payment confirmed! Your account is now active.');
                    loadData();
                    setTimeout(() => router.push('/nextview/dashboard'), 1500);
                }
            })
                .catch(() => { });
        }
    }, []);
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };
    const handleKycSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        if (form.accountNumber !== form.confirmAccountNumber) {
            setError('Bank Account Number and Confirm Account Number must match.');
            return;
        }
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber.trim().toUpperCase())) {
            setError('Please enter a valid 10-character PAN number (e.g. ABCDE1234F).');
            return;
        }
        if (!/^\d{12}$/.test(form.aadhaarNumber.trim())) {
            setError('Please enter a valid 12-digit Aadhaar number.');
            return;
        }
        setSubmittingKyc(true);
        try {
            const res = await fetch('/api/mlm/kyc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    panNumber: form.panNumber,
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
            if (!res.ok)
                throw new Error(data.message || 'KYC submission failed');
            setSuccessMsg('KYC details submitted successfully! Awaiting administrator approval.');
            loadData();
        }
        catch (err) {
            setError(err.message || 'Failed to submit KYC details');
        }
        finally {
            setSubmittingKyc(false);
        }
    };
    const handlePayPlatformFee = async () => {
        setError('');
        setSuccessMsg('');
        setPayingFee(true);
        try {
            // 1. Create order on server
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
            // Case 1: Custom Direct Payment Link
            if (paymentInfo.paymentUrl && paymentInfo.paymentUrl.startsWith('http')) {
                window.location.href = paymentInfo.paymentUrl;
                return;
            }
            // Case 2: Razorpay Inline Checkout
            if (paymentInfo.provider === 'razorpay') {
                const loaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
                if (!loaded || !window.Razorpay) {
                    throw new Error('Could not load Razorpay SDK. Please check your internet connection.');
                }
                const orgName = paymentInfo.organization === 'foundation' ? 'SakhiHub Foundation' : 'SakhiHub';
                const options = {
                    key: paymentInfo.razorpayKeyId,
                    amount: Math.round(paymentInfo.amount * 100),
                    currency: 'INR',
                    name: orgName,
                    description: `Platform Activation Charge (₹${paymentInfo.amount})`,
                    order_id: paymentInfo.paymentSessionId,
                    handler: async function (response) {
                        setPayingFee(true);
                        try {
                            const verifyRes = await fetch('/api/mlm/payment/platform-fee', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    action: 'VERIFY_PAYMENT',
                                    orderId: paymentInfo.orderId,
                                    razorpayPaymentId: response.razorpay_payment_id,
                                    razorpaySignature: response.razorpay_signature,
                                }),
                            });
                            const verifyData = await verifyRes.json();
                            if (!verifyRes.ok || !verifyData.success) {
                                throw new Error(verifyData.message || 'Payment verification failed');
                            }
                            setSuccessMsg('Payment confirmed! Your account is now active and placed in the 3×15 Network.');
                            loadData();
                            setTimeout(() => {
                                router.push('/nextview/dashboard');
                            }, 1500);
                        }
                        catch (vErr) {
                            setError(vErr.message || 'Payment verification failed');
                        }
                        finally {
                            setPayingFee(false);
                        }
                    },
                    theme: { color: '#f59e0b' },
                    modal: {
                        ondismiss: function () {
                            setPayingFee(false);
                        }
                    }
                };
                const rzp = new window.Razorpay(options);
                rzp.open();
                return;
            }
            // Case 3: Cashfree Seamless Checkout
            if (paymentInfo.provider === 'cashfree') {
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
            }
            // Fallback
            if (paymentInfo.paymentUrl) {
                window.location.href = paymentInfo.paymentUrl;
                return;
            }
            throw new Error('Payment gateway configuration is incomplete. Please contact support.');
        }
        catch (err) {
            setError(err.message || 'Payment failed or was cancelled');
            setPayingFee(false);
        }
    };
    if (loading) {
        return (<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"/>
          <p className="text-sm font-medium">Loading Verification Status...</p>
        </div>
      </div>);
    }
    const kycStatus = memberData?.kycStatus || kycData?.status || 'PENDING';
    const isPaid = memberData?.platformFeePaid || false;
    const isActive = memberData?.status === 'ACTIVE' && isPaid;
    const feeAmount = feeData?.amount ?? 100;
    return (<div className="min-h-screen bg-gray-50 text-gray-900 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center mb-2">
            <img src="/nexvia.png" alt="NexVia Logo" className="h-14 w-auto object-contain"/>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            NexVia Member Verification &amp; Activation
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
            Complete your KYC verification and ₹{feeAmount} platform activation charge to secure your slot in the 3×15 Network.
          </p>
        </div>

        {/* Global Alerts */}
        {error && (<div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium flex items-start gap-2.5 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5"/>
            <span>{error}</span>
          </div>)}

        {successMsg && (<div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium flex items-start gap-2.5 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5"/>
            <span>{successMsg}</span>
          </div>)}

        {/* Step Progress Indicator */}
        <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-2xl border border-gray-200/80 shadow-sm text-center text-xs font-bold">
          <div className={`py-2 rounded-xl transition ${kycStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 font-extrabold' : 'bg-amber-50 text-amber-800'}`}>
            1. KYC Details {kycStatus === 'VERIFIED' ? '✓' : ''}
          </div>
          <div className={`py-2 rounded-xl transition ${kycStatus === 'VERIFIED' ? 'bg-amber-50 text-amber-800 font-extrabold' : 'bg-gray-50 text-gray-400'}`}>
            2. Admin Review {kycStatus === 'VERIFIED' ? '✓' : ''}
          </div>
          <div className={`py-2 rounded-xl transition ${isActive ? 'bg-emerald-50 text-emerald-700 font-extrabold' : 'bg-gray-50 text-gray-400'}`}>
            3. ₹{feeAmount} Activation {isActive ? '✓' : ''}
          </div>
        </div>

        {/* ── STAGE 1: ACTIVE & COMPLETED ─────────────────────────────────── */}
        {isActive ? (<div className="bg-white border border-gray-200/80 rounded-3xl p-8 text-center shadow-xl shadow-gray-200/50 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
              <CheckCircle2 className="w-8 h-8"/>
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-gray-900">Membership Activated!</h2>
              <p className="text-xs text-gray-500">
                Your account is fully verified and placed into the deterministic 3×15 Network tree.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/70 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Member ID:</span>
                <span className="font-mono font-bold text-gray-900">{memberData?.mlmCode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Platform Charge:</span>
                <span className="font-bold text-emerald-600">₹{feeAmount} Paid ✓</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">3×15 Network Slot:</span>
                <span className="font-bold text-amber-700">Placed ✓</span>
              </div>
            </div>

            <button type="button" onClick={async () => {
                try {
                    await fetch('/api/auth/me');
                }
                catch (e) {
                    // ignore
                }
                window.location.href = '/nextview/dashboard';
            }} className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold shadow-md shadow-amber-500/20 transition cursor-pointer">
              <span>Enter Member Dashboard</span>
              <ArrowRight className="w-4 h-4"/>
            </button>
          </div>) : kycStatus === 'VERIFIED' && !isPaid ? (
        /* ── STAGE 2: KYC APPROVED -> ₹feeAmount PLATFORM CHARGE PAYMENT ──────── */
        <div className="bg-white border border-gray-200/80 rounded-3xl p-8 shadow-xl shadow-gray-200/50 space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600"/>
                <span>KYC Approved by Administration</span>
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900">
                Activate Your NexVia Membership
              </h2>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Pay the one-time ₹{feeAmount} platform charge to confirm your position in the 3×15 Network and unlock your referral link &amp; wallet.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50/60 to-white border border-amber-200 space-y-4">
              <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Charge Description</span>
                <span className="text-xs font-bold text-gray-900">3×15 Network Activation</span>
              </div>
              <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Payable Amount</span>
                <span className="text-2xl font-black text-amber-600">₹{feeAmount}</span>
              </div>
              <div className="text-[11px] text-gray-500 leading-relaxed">
                Includes dedicated rewards immutable ledger, 3×15 tree positioning, level 1–15 bonus qualification, and promo material access.
              </div>
            </div>

            <button type="button" onClick={handlePayPlatformFee} disabled={payingFee} className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-extrabold shadow-lg shadow-amber-500/25 transition disabled:opacity-50">
              <CreditCard className="w-5 h-5"/>
              <span>{payingFee ? 'Processing Activation...' : `Pay ₹${feeAmount} Platform Charge Now`}</span>
            </button>

            <p className="text-center text-[11px] text-gray-400">
              Safe &amp; Secure Payment Processing • Instant Activation
            </p>
          </div>) : kycStatus === 'UNDER_REVIEW' ? (
        /* ── STAGE 3: KYC SUBMITTED & UNDER REVIEW BY ADMIN ─────────────── */
        <div className="bg-white border border-gray-200/80 rounded-3xl p-8 text-center shadow-xl shadow-gray-200/50 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600 shadow-sm">
              <Clock className="w-8 h-8 animate-pulse"/>
            </div>
            <div className="space-y-1.5">
              <h2 className="text-2xl font-black text-gray-900">KYC Under Verification</h2>
              <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                Your Aadhaar, PAN, and Bank details have been submitted and are currently under review by our administration team. Once approved, you will proceed to the ₹{feeAmount} activation step.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/70 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">PAN Number:</span>
                <span className="font-mono font-bold text-gray-900">{kycData?.panNumber || form.panNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Aadhaar (Masked):</span>
                <span className="font-mono font-bold text-gray-900">
                  XXXX-XXXX-{(kycData?.aadhaarNumber || form.aadhaarNumber).slice(-4)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Bank Account:</span>
                <span className="font-mono font-bold text-gray-900">
                  {(kycData?.bankDetails?.accountNumber || form.accountNumber).slice(0, 3)}••••{(kycData?.bankDetails?.accountNumber || form.accountNumber).slice(-4)}
                </span>
              </div>
            </div>

            <button onClick={loadData} className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold inline-flex items-center gap-2 shadow-sm transition">
              <RefreshCw className="w-4 h-4"/>
              <span>Check Status / Refresh</span>
            </button>
          </div>) : (
        /* ── STAGE 4: KYC INPUT FORM (PENDING / REJECTED / CORRECTION) ─── */
        <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-xl shadow-gray-200/50 space-y-6">
            {kycStatus === 'CORRECTION_REQUIRED' || kycStatus === 'REJECTED' ? (<div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-600"/>
                  <span>Correction Required / Rejected by Admin</span>
                </div>
                <p>{kycData?.adminRemarks || kycData?.correctionRemarks || 'Please update your details and re-submit for review.'}</p>
              </div>) : null}

            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">Submit Verification Details</h2>
              <p className="text-xs text-gray-500">
                Please enter your accurate PAN, Aadhaar, and Bank Account details for compliance.
              </p>
            </div>

            <form onSubmit={handleKycSubmit} className="space-y-5">
              {/* PAN & Aadhaar Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-900 border-b border-gray-100 pb-1">
                  1. Identity Verification (PAN &amp; Aadhaar)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                      PAN Card Number *
                    </label>
                    <input type="text" required maxLength={10} name="panNumber" value={form.panNumber} onChange={handleFormChange} placeholder="e.g. ABCDE1234F" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-mono font-bold text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none uppercase transition"/>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                      Aadhaar Card Number *
                    </label>
                    <input type="text" required maxLength={12} name="aadhaarNumber" value={form.aadhaarNumber} onChange={handleFormChange} placeholder="12-digit Aadhaar Number" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-mono text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none transition"/>
                  </div>
                </div>
              </div>

              {/* Bank Details Section */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-900 border-b border-gray-100 pb-1">
                  2. Bank Account Details (For Payouts)
                </h3>

                {/* Bank Account Number & Confirm */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                      Account Holder Name *
                    </label>
                    <input type="text" required name="accountHolderName" value={form.accountHolderName} onChange={handleFormChange} placeholder="Name as in bank passbook" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none transition"/>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                      IFSC Code *
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input type="text" required maxLength={11} name="ifscCode" value={form.ifscCode} onChange={handleIfscChange} placeholder="e.g. SBIN0001234" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-mono font-bold text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none uppercase transition"/>
                        {ifscDetails && (<div className="absolute right-3 top-2.5">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600"/>
                          </div>)}
                      </div>
                      <button type="button" onClick={() => handleIfscLookup()} disabled={fetchingIfsc || form.ifscCode.length !== 11} className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 transition disabled:opacity-50 inline-flex items-center gap-1.5">
                        <RefreshCw className={`w-3.5 h-3.5 ${fetchingIfsc ? 'animate-spin' : ''}`}/>
                        <span>Fetch</span>
                      </button>
                    </div>
                    {ifscError && (<p className="mt-1 text-[11px] text-red-600 font-medium">{ifscError}</p>)}
                    {ifscDetails && (<p className="mt-1 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5"/>
                        <span>{ifscDetails.bank} ({ifscDetails.branch})</span>
                      </p>)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                      Bank Name &amp; Branch (Auto-Fetched)
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-3 h-4 w-4 text-gray-400"/>
                      <input type="text" name="bankName" value={form.bankName} onChange={handleFormChange} placeholder="Auto-fetched via IFSC code" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none transition"/>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                      UPI ID (Optional)
                    </label>
                    <input type="text" name="upiId" value={form.upiId} onChange={handleFormChange} placeholder="e.g. mobile@upi" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none transition"/>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                      Account Number *
                    </label>
                    <input type="password" required name="accountNumber" value={form.accountNumber} onChange={handleFormChange} placeholder="Enter bank account number" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-mono text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none transition"/>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                      Confirm Account Number *
                    </label>
                    <input type="text" required name="confirmAccountNumber" value={form.confirmAccountNumber} onChange={handleFormChange} placeholder="Re-enter bank account number" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-mono text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none transition"/>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={submittingKyc} className="w-full mt-6 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold shadow-md shadow-amber-500/20 transition disabled:opacity-50">
                <FileCheck className="w-4 h-4"/>
                <span>{submittingKyc ? 'Submitting Details...' : 'Submit KYC for Administrator Verification'}</span>
              </button>
            </form>
          </div>)}
      </div>
    </div>);
}
