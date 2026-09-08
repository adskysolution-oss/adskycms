'use client';
import React, { useState, useEffect } from 'react';
import { CreditCard, ExternalLink, X, CheckCircle2, AlertCircle, FileText, Clock, Send, ShieldCheck, ArrowRight, TrendingUp, Percent, QrCode, Zap, Award, Check } from 'lucide-react';
import MlmMemberLayout from '@/components/features/mlm/MlmMemberLayout';
const VERIFIED_BENEFITS = [
    {
        title: 'Credit Score Builder',
        desc: 'Build and improve your CIBIL score automatically with disciplined usage.',
        icon: TrendingUp,
    },
    {
        title: 'Lifetime Free Card',
        desc: 'Zero joining fee and zero annual charges forever.',
        icon: Award,
    },
    {
        title: 'Up to 20% Discounts',
        desc: 'Exclusive offers on Swiggy, Zomato, Swiggy Instamart & BookMyShow.',
        icon: Percent,
    },
    {
        title: 'UPI on Credit Card',
        desc: 'Seamless UPI QR payments supported across third-party UPI apps.',
        icon: QrCode,
    },
    {
        title: 'FD Interest Up to 7%',
        desc: 'Your ₹2,000 security deposit earns guaranteed fixed deposit returns.',
        icon: Zap,
    },
    {
        title: '90% Credit Limit',
        desc: 'Get instant ₹1,800 credit limit backed by your ₹2,000 FD deposit.',
        icon: ShieldCheck,
    },
];
export default function NextViewFdCardPage() {
    const [products, setProducts] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [applicantInfo, setApplicantInfo] = useState({
        applicantName: '',
        applicantMobile: '',
        applicantEmail: '',
        applicationReference: '',
        maskedCardNumber: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const loadData = async () => {
        setLoading(true);
        try {
            const [prodRes, appRes, profileRes] = await Promise.all([
                fetch('/api/mlm/products').then((r) => r.json()),
                fetch('/api/mlm/fd/apply').then((r) => r.json()),
                fetch('/api/mlm/profile').then((r) => r.json()).catch(() => ({})),
            ]);
            if (prodRes.success)
                setProducts(prodRes.data || []);
            if (appRes.success)
                setApplications(appRes.data || []);
            if (profileRes.success && profileRes.data) {
                setApplicantInfo((prev) => ({
                    ...prev,
                    applicantName: prev.applicantName || profileRes.data.fullName || '',
                    applicantMobile: prev.applicantMobile || profileRes.data.mobile || '',
                    applicantEmail: prev.applicantEmail || profileRes.data.email || '',
                }));
            }
        }
        catch (e) {
            console.error('Error loading FD data:', e);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadData();
    }, []);
    const handleOpenTrackModal = (prod) => {
        setSelectedProduct(prod);
        setFeedback(null);
    };
    const handleSubmitApplication = async (e) => {
        e.preventDefault();
        if (!selectedProduct)
            return;
        setSubmitting(true);
        setFeedback(null);
        try {
            const res = await fetch('/api/mlm/fd/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: selectedProduct._id,
                    applicantName: applicantInfo.applicantName,
                    applicantMobile: applicantInfo.applicantMobile,
                    applicantEmail: applicantInfo.applicantEmail,
                    applicationReference: applicantInfo.applicationReference,
                    maskedCardNumber: applicantInfo.maskedCardNumber || undefined,
                    fdAmount: selectedProduct.minAmount || 2000,
                }),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data.message || 'Submission failed');
            setFeedback({
                type: 'success',
                message: 'Application reference submitted successfully! Admin will verify for network reward qualification.',
            });
            loadData();
            setTimeout(() => {
                setSelectedProduct(null);
                setApplicantInfo((prev) => ({ ...prev, applicationReference: '', maskedCardNumber: '' }));
            }, 1800);
        }
        catch (err) {
            setFeedback({ type: 'error', message: err.message || 'Something went wrong submitting reference' });
        }
        finally {
            setSubmitting(false);
        }
    };
    if (loading) {
        return (<MlmMemberLayout activePath="/nextview/fd-card">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"/>
        </div>
      </MlmMemberLayout>);
    }
    // Exactly one official product
    const product = products[0] || null;
    const appUrl = product?.referralUrl || product?.applicationUrl || 'https://wee.bnking.in/c/ZGZjODFlM';
    const isPaused = product?.status === 'PAUSED';
    const isArchived = product?.status === 'ARCHIVED';
    const latestApp = applications[0] || null;
    return (<MlmMemberLayout activePath="/nextview/fd-card">
      <div className="space-y-6">
        {/* ── 1. COMPACT PAGE HEADER ────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <CreditCard className="w-4 h-4"/>
              </span>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                FD &amp; FD-Credit Card Scheme
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Apply for your official ₹2,000 FD-backed credit card with ₹1,800 instant limit through our partner bank.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
              <span>Official Card Product</span>
            </span>
          </div>
        </div>

        {/* ── 2. COMPACT SINGLE PRODUCT CARD ────────────────────────────────── */}
        {!product ? (<div className="bg-white rounded-3xl p-8 border border-slate-200/80 text-center space-y-2 shadow-xs">
            <CreditCard className="w-8 h-8 text-slate-300 mx-auto"/>
            <p className="text-xs font-bold text-slate-700">Scheme Temporarily Offline</p>
            <p className="text-[11px] text-slate-400">Please check back shortly.</p>
          </div>) : (<div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all space-y-6">
            {/* Top Bar: Title & Scheme Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-200/80">
                    FD-Credit Card
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                    Lifetime Free (₹0)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold text-slate-600 bg-slate-100">
                    {product.providerName || 'NexVia Banking Partner'}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {product.name}
                </h2>
              </div>

              {latestApp && (<div className="shrink-0">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase border ${latestApp.status === 'ELIGIBLE' || latestApp.status === 'VERIFIED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : latestApp.status === 'REJECTED'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    <Clock className="w-3.5 h-3.5"/>
                    <span>
                      {latestApp.status === 'ELIGIBLE' ? 'Reward Processed' : latestApp.status}
                    </span>
                  </span>
                </div>)}
            </div>

            {/* 4 Core Financial Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  FD Deposit
                </span>
                <span className="text-base sm:text-lg font-black text-slate-900 font-mono">₹2,000</span>
                <span className="text-[10px] text-slate-500 font-medium block">100% Secured</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-0.5">
                  Credit Limit
                </span>
                <span className="text-base sm:text-lg font-black text-emerald-700 font-mono">₹1,800</span>
                <span className="text-[10px] text-emerald-600 font-semibold block">90% of FD</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  FD Interest
                </span>
                <span className="text-base sm:text-lg font-black text-amber-600 font-mono">Up to 7%</span>
                <span className="text-[10px] text-slate-500 font-medium block">Guaranteed Yield</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Annual Fee
                </span>
                <span className="text-base sm:text-lg font-black text-slate-800 font-mono">₹0</span>
                <span className="text-[10px] text-slate-500 font-medium block">Lifetime Free</span>
              </div>
            </div>

            {/* Verified Benefits Grid */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                Verified Product Benefits
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {VERIFIED_BENEFITS.map((b, idx) => {
                const Icon = b.icon;
                return (<div key={idx} className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100/90 flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-3.5 h-3.5"/>
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-900">{b.title}</h4>
                        <p className="text-[11px] text-slate-500 leading-snug">{b.desc}</p>
                      </div>
                    </div>);
            })}
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              {isPaused ? (<button disabled className="w-full py-3 px-4 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed text-center">
                  Application Temporarily Unavailable
                </button>) : isArchived ? (<button disabled className="w-full py-3 px-4 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed text-center">
                  Product No Longer Available
                </button>) : (<>
                  <a href={appUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-extrabold transition shadow-md shadow-amber-500/25 flex items-center justify-center gap-2">
                    <span>Apply Now on Bank Portal</span>
                    <ExternalLink className="w-4 h-4"/>
                  </a>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">Already applied?</span>
                    <button type="button" onClick={() => handleOpenTrackModal(product)} className="font-extrabold text-amber-700 hover:text-amber-800 hover:underline inline-flex items-center gap-1">
                      <span>Submit Reference Details</span>
                      <ArrowRight className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                </>)}
            </div>
          </div>)}

        {/* ── 3. MY FD-CREDIT CARD APPLICATION ─────────────────────────────── */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                My FD-Credit Card Application
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Track your submitted external bank application reference and verification progress.
              </p>
            </div>
            {applications.length > 0 && (<span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                {applications.length} Submitted
              </span>)}
          </div>

          {applications.length === 0 ? (<div className="text-center py-8 space-y-3 max-w-sm mx-auto">
              <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-5 h-5"/>
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-800">
                  No FD-Credit Card application submitted yet
                </h4>
                <p className="text-[11px] text-slate-500">
                  Your application will appear here after you submit your bank reference details above.
                </p>
              </div>
            </div>) : (<div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Reference / ARN</th>
                    <th className="pb-3">Product Name</th>
                    <th className="pb-3">FD Amount</th>
                    <th className="pb-3">Credit Limit</th>
                    <th className="pb-3">Applicant Name</th>
                    <th className="pb-3">Submitted Date</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Reward Eligibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {applications.map((app) => {
                const isEligible = app.status === 'ELIGIBLE';
                const isVerified = app.status === 'VERIFIED';
                const isPending = app.status === 'PENDING' || app.status === 'UNDER_REVIEW';
                const isRejected = app.status === 'REJECTED';
                return (<tr key={app._id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 font-mono font-bold text-slate-900">
                          {app.applicationReference || '—'}
                          {app.maskedCardNumber && (<span className="block text-[10px] text-slate-400 font-normal">
                              Card: {app.maskedCardNumber}
                            </span>)}
                        </td>
                        <td className="py-3 font-extrabold text-slate-900 max-w-xs truncate">
                          {app.productId?.name || 'Sakhi Mahila Samriddhi FD-Credit Card'}
                        </td>
                        <td className="py-3 font-mono font-black text-slate-900">
                          ₹{(app.fdAmount || 2000).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 font-mono font-black text-emerald-600">
                          ₹{(app.creditLimit || 1800).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 font-medium text-slate-700">
                          {app.applicantName}
                          {app.applicantMobile && (<span className="block font-mono text-[11px] text-slate-400">
                              {app.applicantMobile}
                            </span>)}
                        </td>
                        <td className="py-3 text-slate-500 font-mono text-[11px]">
                          {app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td className="py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${isEligible || isVerified
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isRejected
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="py-3">
                          {isEligible ? (<span className="font-bold text-emerald-600 flex items-center gap-1 text-[11px]">
                              <Check className="w-3.5 h-3.5"/>
                              <span>Reward Processed</span>
                            </span>) : isPending ? (<span className="text-slate-400 font-semibold flex items-center gap-1 text-[11px]">
                              <Clock className="w-3.5 h-3.5 text-amber-500"/>
                              <span>Under Review</span>
                            </span>) : isRejected ? (<span className="text-red-500 font-semibold text-[11px]">
                              {app.rejectionReason || 'Rejected'}
                            </span>) : (<span className="text-slate-400">—</span>)}
                        </td>
                      </tr>);
            })}
                </tbody>
              </table>
            </div>)}
        </div>

        {/* ── 4. REFERENCE SUBMISSION MODAL ─────────────────────────────────── */}
        {selectedProduct && (<div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 relative border border-slate-100">
              <button type="button" onClick={() => setSelectedProduct(null)} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition">
                <X className="w-4 h-4"/>
              </button>

              <div className="space-y-1 pr-8">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Verification Submission
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Submit Card / Reference Details
                </h3>
                <p className="text-xs text-slate-500">
                  Product: <strong className="text-slate-800">{selectedProduct.name}</strong> (FD: ₹2,000 | Limit: ₹1,800)
                </p>
              </div>

              {feedback && (<div className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 ${feedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'}`}>
                  {feedback.type === 'success' ? (<CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0"/>) : (<AlertCircle className="w-4 h-4 text-red-600 shrink-0"/>)}
                  <span>{feedback.message}</span>
                </div>)}

              <form onSubmit={handleSubmitApplication} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Bank Application Reference / ARN Number *
                  </label>
                  <input type="text" required value={applicantInfo.applicationReference} onChange={(e) => setApplicantInfo({ ...applicantInfo, applicationReference: e.target.value.toUpperCase() })} placeholder="e.g. ARN-89234 or BANK-REF-10928" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"/>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Provide the reference number received from the bank after completing your application.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Applicant Full Name *
                    </label>
                    <input type="text" required value={applicantInfo.applicantName} onChange={(e) => setApplicantInfo({ ...applicantInfo, applicantName: e.target.value })} placeholder="e.g. Kunal Patil" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"/>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Mobile Number *
                    </label>
                    <input type="tel" required value={applicantInfo.applicantMobile} onChange={(e) => setApplicantInfo({ ...applicantInfo, applicantMobile: e.target.value })} placeholder="10-digit mobile" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-800"/>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Email Address (Optional)
                    </label>
                    <input type="email" value={applicantInfo.applicantEmail} onChange={(e) => setApplicantInfo({ ...applicantInfo, applicantEmail: e.target.value })} placeholder="applicant@example.com" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"/>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Card Identifier / Masked (Optional)
                    </label>
                    <input type="text" value={applicantInfo.maskedCardNumber} onChange={(e) => setApplicantInfo({ ...applicantInfo, maskedCardNumber: e.target.value })} placeholder="e.g. **** 1234" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-800"/>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0"/>
                    <span>Fixed Deposit: <strong>₹2,000</strong> | Credit Limit: <strong>₹1,800</strong></span>
                  </div>
                  <span className="font-bold text-emerald-700">90% LTV</span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => setSelectedProduct(null)} className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition">
                    Cancel
                  </button>

                  <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold transition shadow-md shadow-amber-500/25 inline-flex items-center gap-1.5 disabled:opacity-50">
                    <Send className="w-3.5 h-3.5"/>
                    <span>{submitting ? 'Submitting...' : 'Submit Reference'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>)}
      </div>
    </MlmMemberLayout>);
}
