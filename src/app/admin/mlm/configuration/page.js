'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { Settings, Save, CheckCircle2, AlertCircle, Shield, ShieldCheck, Network, Users, CreditCard, Award, Wallet, RefreshCw, ExternalLink, Phone, Mail, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminMlmShareSettingsCard from '@/components/features/admin/AdminMlmShareSettingsCard';
export default function AdminMlmConfigurationPage() {
    const [config, setConfig] = useState({
        registrationEnabled: true,
        requireSponsorCode: true,
        allowDirectPublicRegistrationWithoutSponsor: false,
        otpVerificationRequired: true,
        otpMethods: ['MOBILE', 'EMAIL'],
        kycRequired: true,
        panRequired: true,
        aadhaarRequired: true,
        bankDetailsRequired: true,
        kycApprovalRequiredBeforeActivation: true,
        platformFeeRequired: true,
        platformFeeAmount: 100,
        currency: 'INR',
        paymentProvider: 'sakhihub_cashfree',
        rewardsEnabled: true,
        withdrawalsEnabled: true,
        minWithdrawalAmount: 100,
        maxWithdrawalAmount: 50000,
        manualWithdrawalApproval: true,
        bankTransferEnabled: true,
        upiEnabled: true,
        walletEnabled: true,
    });
    const [initialConfig, setInitialConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [auditReason, setAuditReason] = useState('');
    // Confirmation Modal for Danger Zone actions
    const [confirmModal, setConfirmModal] = useState({
        show: false,
        title: '',
        description: '',
        onConfirm: () => { },
    });
    const fetchConfig = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/mlm/config');
            const json = await res.json();
            if (res.ok && json.success && json.data) {
                setConfig(json.data);
                setInitialConfig(json.data);
            }
        }
        catch (e) {
            console.error('Failed to load MLM configuration:', e);
            toast.error('Failed to load MLM configuration');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchConfig();
    }, []);
    const hasUnsavedChanges = initialConfig &&
        JSON.stringify(config) !== JSON.stringify(initialConfig);
    const handleSave = async (e) => {
        if (e)
            e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            const res = await fetch('/api/admin/mlm/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...config,
                    auditReason: auditReason || 'Admin updated MLM configuration settings',
                }),
            });
            const json = await res.json();
            if (!res.ok || !json.success) {
                throw new Error(json.message || 'Failed to save configuration');
            }
            setConfig(json.data);
            setInitialConfig(json.data);
            setAuditReason('');
            setMessage('Configuration saved successfully!');
            toast.success('MLM configuration saved and versioned successfully');
            setTimeout(() => setMessage(''), 3000);
        }
        catch (err) {
            console.error('Save error:', err);
            setMessage(err.message || 'Failed to save configuration');
            toast.error(err.message || 'Failed to save configuration');
        }
        finally {
            setSaving(false);
        }
    };
    if (loading) {
        return (<DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>);
    }
    return (<DashboardLayout>
      <div className="space-y-6 pb-16 max-w-5xl">
        {/* Header matching Payment Config style */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <span className="p-2 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <Settings className="w-6 h-6 text-amber-600"/>
              </span>
              MLM &amp; FD Configuration
            </h1>
            <p className="text-gray-500 mt-1.5 font-medium text-xs">
              Manage MLM activation, FD products, payment rules, reward behavior and member configuration.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (<span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600"/>
                <span>Unsaved Changes</span>
              </span>)}

            <button onClick={() => fetchConfig()} disabled={loading || saving} className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}/>
              <span>Reset</span>
            </button>

            <button onClick={() => handleSave()} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl transition shadow-md shadow-amber-500/20 disabled:opacity-50">
              <Save className="w-4 h-4"/>
              <span>{saving ? 'Saving Changes...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        {message && (<div className={`p-4 rounded-2xl font-bold text-xs flex items-center gap-2 ${message.includes('success')
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.includes('success') ? (<CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0"/>) : (<AlertCircle className="w-4 h-4 text-red-600 shrink-0"/>)}
            <span>{message}</span>
          </div>)}

        {/* DYNAMIC WHATSAPP REFERRAL SHARE & POSTER SETTINGS */}
        <AdminMlmShareSettingsCard />

        <form onSubmit={handleSave} className="space-y-6">
          {/* SECTION 1 — MLM MEMBERSHIP & ACTIVATION */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Users className="text-amber-500 w-5 h-5"/>
                1. MLM Membership &amp; Activation
              </h3>
              <span className="text-[10px] font-mono text-gray-400 font-bold uppercase">
                Active Version v{config.version || 1}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                <div>
                  <label className="block text-xs font-black text-gray-900">
                    Enable MLM Registration
                  </label>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Allow new members to register on /mlm/register
                  </p>
                </div>
                <input type="checkbox" checked={config.registrationEnabled} onChange={(e) => setConfig({ ...config, registrationEnabled: e.target.checked })} className="w-5 h-5 accent-amber-500 rounded cursor-pointer"/>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                <div>
                  <label className="block text-xs font-black text-gray-900">
                    Require Platform Fee Before Activation
                  </label>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Mandate payment before placing in 3×15 matrix
                  </p>
                </div>
                <input type="checkbox" checked={config.platformFeeRequired} onChange={(e) => setConfig({ ...config, platformFeeRequired: e.target.checked })} className="w-5 h-5 accent-amber-500 rounded cursor-pointer"/>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Platform Activation Fee (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-xs font-black text-gray-400">
                    ₹
                  </span>
                  <input type="number" min="0" value={config.platformFeeAmount} onChange={(e) => setConfig({
            ...config,
            platformFeeAmount: Number(e.target.value),
        })} className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500/20 font-black text-gray-900 bg-white text-sm"/>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Currency
                </label>
                <input type="text" readOnly value={config.currency || 'INR'} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-bold text-gray-500 bg-gray-100 text-sm"/>
              </div>
            </div>

            {/* Activation Flow Diagram */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
              <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider">
                Production Activation Pipeline
              </span>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-amber-900">
                <span className="px-2 py-1 bg-white rounded-lg border border-amber-200">
                  1. Registration
                </span>
                <span>&rarr;</span>
                <span className="px-2 py-1 bg-white rounded-lg border border-amber-200">
                  2. OTP Verification
                </span>
                <span>&rarr;</span>
                <span className="px-2 py-1 bg-white rounded-lg border border-amber-200">
                  3. KYC Details
                </span>
                <span>&rarr;</span>
                <span className="px-2 py-1 bg-white rounded-lg border border-amber-200">
                  4. KYC Admin Approval
                </span>
                <span>&rarr;</span>
                <span className="px-2 py-1 bg-white rounded-lg border border-amber-200">
                  5. ₹{config.platformFeeAmount} Payment
                </span>
                <span>&rarr;</span>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-300">
                  6. Active &amp; Matrix Placed
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2 — REFERRAL & SPONSOR RULES */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Network className="text-amber-500 w-5 h-5"/>
                2. Referral &amp; Sponsor Rules
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                <div>
                  <label className="block text-xs font-black text-gray-900">
                    Require Valid Sponsor Code
                  </label>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Registration rejected if sponsor code is invalid or missing
                  </p>
                </div>
                <input type="checkbox" checked={config.requireSponsorCode} onChange={(e) => setConfig({ ...config, requireSponsorCode: e.target.checked })} className="w-5 h-5 accent-amber-500 rounded cursor-pointer"/>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                <div>
                  <label className="block text-xs font-black text-gray-900">
                    Allow Direct Public Registration
                  </label>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Fallback to root seed sponsor if no sponsor code provided
                  </p>
                </div>
                <input type="checkbox" checked={config.allowDirectPublicRegistrationWithoutSponsor} onChange={(e) => setConfig({
            ...config,
            allowDirectPublicRegistrationWithoutSponsor: e.target.checked,
        })} className="w-5 h-5 accent-amber-500 rounded cursor-pointer"/>
              </div>
            </div>
          </div>

          {/* SECTION 3 — PLATFORM PAYMENT GATEWAY */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <CreditCard className="text-amber-500 w-5 h-5"/>
                3. MLM Platform Payment Gateway
              </h3>
              <Link href="/admin/payment-config" className="text-xs font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1">
                <span>Global Payment Control Center</span>
                <ExternalLink className="w-3.5 h-3.5"/>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Payment Receive Via (Gateway Account)
                </label>
                <select value={config.paymentProvider || 'sakhihub_cashfree'} onChange={(e) => setConfig({ ...config, paymentProvider: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500/20 font-bold text-gray-800 bg-white text-xs">
                  <optgroup label="SakhiHub">
                    <option value="sakhihub_cashfree">SakhiHub — Cashfree</option>
                    <option value="sakhihub_phonepe">SakhiHub — PhonePe</option>
                    <option value="sakhihub_razorpay">SakhiHub — Razorpay</option>
                  </optgroup>
                  <optgroup label="SakhiHub Foundation">
                    <option value="foundation_cashfree">SakhiHub Foundation — Cashfree</option>
                    <option value="foundation_phonepe">SakhiHub Foundation — PhonePe</option>
                    <option value="foundation_razorpay">SakhiHub Foundation — Razorpay</option>
                  </optgroup>
                </select>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-1">
                <span className="text-[10px] font-black uppercase text-blue-900 tracking-wider">
                  Payment Routing Guarantee
                </span>
                <p className="text-xs text-blue-800">
                  MLM activation charges are routed through your chosen gateway account (<code>{config.paymentProvider || 'sakhihub_cashfree'}</code>) under purpose <code>mlm_platform_fee</code>.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 4 — FD PRODUCTS & REWARD RULES */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Award className="text-amber-500 w-5 h-5"/>
                4. FD Products &amp; Reward Trigger Rules
              </h3>
              <Link href="/admin/mlm/levels" className="text-xs font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1">
                <span>Manage Level 1–15 Matrix Config &rarr;</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
                <span className="text-[10px] font-black uppercase text-gray-400">Reward Trigger</span>
                <p className="font-bold text-gray-900 text-xs">Verified Customer FD Booking</p>
                <p className="text-[10px] text-gray-500">Not triggered on registration or platform fees</p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
                <span className="text-[10px] font-black uppercase text-gray-400">Matrix Depth</span>
                <p className="font-bold text-amber-700 text-xs">Level 1 to Level 15</p>
                <p className="text-[10px] text-gray-500">Ternary spatial upline tree</p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                <div>
                  <label className="block text-xs font-black text-gray-900">
                    Enable MLM Rewards
                  </label>
                  <p className="text-[10px] text-gray-500">
                    Process commissions upon FD approval
                  </p>
                </div>
                <input type="checkbox" checked={config.rewardsEnabled} onChange={(e) => setConfig({ ...config, rewardsEnabled: e.target.checked })} className="w-5 h-5 accent-amber-500 rounded cursor-pointer"/>
              </div>
            </div>
          </div>

          {/* SECTION 5 — KYC REQUIREMENTS */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <ShieldCheck className="text-amber-500 w-5 h-5"/>
                5. MLM KYC Requirements
              </h3>
              <Link href="/admin/mlm/kyc" className="text-xs font-bold text-amber-600 hover:text-amber-700">
                Inspect KYC Queue &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">PAN Required</span>
                <input type="checkbox" checked={config.panRequired} onChange={(e) => setConfig({ ...config, panRequired: e.target.checked })} className="w-4 h-4 accent-amber-500 rounded cursor-pointer"/>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">Aadhaar Required</span>
                <input type="checkbox" checked={config.aadhaarRequired} onChange={(e) => setConfig({ ...config, aadhaarRequired: e.target.checked })} className="w-4 h-4 accent-amber-500 rounded cursor-pointer"/>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">Bank Details</span>
                <input type="checkbox" checked={config.bankDetailsRequired} onChange={(e) => setConfig({ ...config, bankDetailsRequired: e.target.checked })} className="w-4 h-4 accent-amber-500 rounded cursor-pointer"/>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">Approval Required</span>
                <input type="checkbox" checked={config.kycApprovalRequiredBeforeActivation} onChange={(e) => setConfig({
            ...config,
            kycApprovalRequiredBeforeActivation: e.target.checked,
        })} className="w-4 h-4 accent-amber-500 rounded cursor-pointer"/>
              </div>
            </div>
          </div>

          {/* SECTION 6 — WITHDRAWAL & WALLET RULES */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Wallet className="text-amber-500 w-5 h-5"/>
                6. MLM Withdrawal &amp; Wallet Rules
              </h3>
              <Link href="/admin/mlm/withdrawals" className="text-xs font-bold text-amber-600 hover:text-amber-700">
                Review Payout Requests &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Minimum Withdrawal (₹)
                </label>
                <input type="number" min="0" value={config.minWithdrawalAmount} onChange={(e) => setConfig({
            ...config,
            minWithdrawalAmount: Number(e.target.value),
        })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500/20 font-black text-gray-900 bg-white text-xs"/>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Maximum Withdrawal (₹)
                </label>
                <input type="number" min="0" value={config.maxWithdrawalAmount} onChange={(e) => setConfig({
            ...config,
            maxWithdrawalAmount: Number(e.target.value),
        })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500/20 font-black text-gray-900 bg-white text-xs"/>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                <div>
                  <label className="block text-xs font-black text-gray-900">
                    Withdrawals Enabled
                  </label>
                  <p className="text-[10px] text-gray-500">
                    Allow members to request wallet payouts
                  </p>
                </div>
                <input type="checkbox" checked={config.withdrawalsEnabled} onChange={(e) => setConfig({ ...config, withdrawalsEnabled: e.target.checked })} className="w-5 h-5 accent-amber-500 rounded cursor-pointer"/>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">Bank Transfer Payouts</span>
                <input type="checkbox" checked={config.bankTransferEnabled} onChange={(e) => setConfig({ ...config, bankTransferEnabled: e.target.checked })} className="w-4 h-4 accent-amber-500 rounded cursor-pointer"/>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">UPI Payouts</span>
                <input type="checkbox" checked={config.upiEnabled} onChange={(e) => setConfig({ ...config, upiEnabled: e.target.checked })} className="w-4 h-4 accent-amber-500 rounded cursor-pointer"/>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">Manual Admin Payout Approval</span>
                <input type="checkbox" checked={config.manualWithdrawalApproval} onChange={(e) => setConfig({
            ...config,
            manualWithdrawalApproval: e.target.checked,
        })} className="w-4 h-4 accent-amber-500 rounded cursor-pointer"/>
              </div>
            </div>
          </div>

          {/* SECTION 7 — REGISTRATION & OTP SETTINGS */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Shield className="text-amber-500 w-5 h-5"/>
                7. Registration &amp; OTP Verification Rules
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                <div>
                  <label className="block text-xs font-black text-gray-900">
                    OTP Verification Required
                  </label>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Validate phone or email via 6-digit OTP
                  </p>
                </div>
                <input type="checkbox" checked={config.otpVerificationRequired} onChange={(e) => setConfig({
            ...config,
            otpVerificationRequired: e.target.checked,
        })} className="w-5 h-5 accent-amber-500 rounded cursor-pointer"/>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                <label className="block text-xs font-black text-gray-900">
                  Supported OTP Channels
                </label>
                <div className="flex items-center gap-4 text-xs font-bold text-gray-700">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <Phone className="w-3.5 h-3.5 text-amber-600"/>
                    <span>Mobile SMS OTP</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <Mail className="w-3.5 h-3.5 text-purple-600"/>
                    <span>Email OTP</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 8 — AUDIT REASON & SAVE ACTION */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8 space-y-4">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
              Change Reason (Recorded in Immutable Audit Log)
            </h3>
            <input type="text" placeholder="e.g. Set MLM activation platform charge and selected payment account" value={auditReason} onChange={(e) => setAuditReason(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500/20"/>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button type="button" onClick={() => fetchConfig()} className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition">
                Discard Changes
              </button>
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl transition shadow-md shadow-amber-500/20 disabled:opacity-50">
                <Save className="w-4 h-4"/>
                <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
              </button>
            </div>
          </div>

          {/* SECTION 9 — DANGER ZONE */}
          <div className="bg-red-50/60 rounded-3xl border border-red-200 p-6 lg:p-8 space-y-4">
            <div className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="w-5 h-5 text-red-600"/>
              <h3 className="text-base font-black uppercase tracking-wider">
                Danger Zone (Emergency System Controls)
              </h3>
            </div>
            <p className="text-xs text-red-700">
              These emergency actions take effect immediately across all MLM APIs. Confirmation is required.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button type="button" onClick={() => setConfirmModal({
            show: true,
            title: config.registrationEnabled
                ? 'Pause MLM Registrations?'
                : 'Resume MLM Registrations?',
            description: config.registrationEnabled
                ? 'This will prevent new users from submitting registration on /mlm/register.'
                : 'This will re-enable member registrations.',
            onConfirm: () => {
                const updated = {
                    ...config,
                    registrationEnabled: !config.registrationEnabled,
                };
                setConfig(updated);
                setConfirmModal({ ...confirmModal, show: false });
            },
        })} className="p-3 bg-white hover:bg-red-100/50 border border-red-200 rounded-2xl text-left transition">
                <div className="text-xs font-bold text-red-900">
                  {config.registrationEnabled ? 'Pause Registrations' : 'Resume Registrations'}
                </div>
                <div className="text-[10px] text-red-600 mt-0.5">
                  Currently: {config.registrationEnabled ? 'ACTIVE' : 'PAUSED'}
                </div>
              </button>

              <button type="button" onClick={() => setConfirmModal({
            show: true,
            title: config.rewardsEnabled
                ? 'Pause MLM Reward Engine?'
                : 'Resume MLM Reward Engine?',
            description: config.rewardsEnabled
                ? 'This will temporarily stop generating Level 1–15 bonuses on verified FD bookings.'
                : 'This will re-enable automatic Level 1–15 bonus distributions.',
            onConfirm: () => {
                const updated = {
                    ...config,
                    rewardsEnabled: !config.rewardsEnabled,
                };
                setConfig(updated);
                setConfirmModal({ ...confirmModal, show: false });
            },
        })} className="p-3 bg-white hover:bg-red-100/50 border border-red-200 rounded-2xl text-left transition">
                <div className="text-xs font-bold text-red-900">
                  {config.rewardsEnabled ? 'Pause Rewards' : 'Resume Rewards'}
                </div>
                <div className="text-[10px] text-red-600 mt-0.5">
                  Currently: {config.rewardsEnabled ? 'ACTIVE' : 'PAUSED'}
                </div>
              </button>

              <button type="button" onClick={() => setConfirmModal({
            show: true,
            title: config.withdrawalsEnabled
                ? 'Pause Member Withdrawals?'
                : 'Resume Member Withdrawals?',
            description: config.withdrawalsEnabled
                ? 'This will block members from submitting new withdrawal requests.'
                : 'This will allow members to request withdrawals again.',
            onConfirm: () => {
                const updated = {
                    ...config,
                    withdrawalsEnabled: !config.withdrawalsEnabled,
                };
                setConfig(updated);
                setConfirmModal({ ...confirmModal, show: false });
            },
        })} className="p-3 bg-white hover:bg-red-100/50 border border-red-200 rounded-2xl text-left transition">
                <div className="text-xs font-bold text-red-900">
                  {config.withdrawalsEnabled ? 'Pause Withdrawals' : 'Resume Withdrawals'}
                </div>
                <div className="text-[10px] text-red-600 mt-0.5">
                  Currently: {config.withdrawalsEnabled ? 'ACTIVE' : 'PAUSED'}
                </div>
              </button>
            </div>
          </div>
        </form>

        {/* Confirmation Modal */}
        {confirmModal.show && (<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5"/>
                <h3 className="font-black text-gray-900 text-sm">{confirmModal.title}</h3>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {confirmModal.description}
              </p>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setConfirmModal({ ...confirmModal, show: false })} className="px-4 py-2 bg-gray-100 rounded-xl font-bold text-xs">
                  Cancel
                </button>
                <button type="button" onClick={() => confirmModal.onConfirm()} className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-xs shadow-md shadow-red-600/20">
                  Confirm Toggle
                </button>
              </div>
            </div>
          </div>)}
      </div>
    </DashboardLayout>);
}
