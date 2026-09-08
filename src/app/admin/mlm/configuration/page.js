'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import {
  Settings, Save, AlertCircle, RefreshCw,
  CreditCard, IndianRupee, Zap, History, ChevronDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const GATEWAY_OPTIONS = [
  { value: 'adsky_cashfree', label: 'AdSky — Cashfree', icon: '??' },
  { value: 'adsky_razorpay', label: 'AdSky — Razorpay', icon: '??' },
  { value: 'adsky_phonepe',  label: 'AdSky — PhonePe',  icon: '??' },
];

const gatewayLabel = (val) => {
  const g = GATEWAY_OPTIONS.find((o) => o.value === val);
  return g ? `${g.icon} ${g.label}` : (val || 'Select Gateway');
};

export default function AdminMlmConfigurationPage() {
  const [config, setConfig] = useState({
    platformFeeAmount: 100,
    gstPercent: 0,
    description: 'Lifetime Membership & 3x15 Matrix Placement Fee',
    paymentProvider: 'adsky_cashfree',
    version: 1,
  });
  const [initialConfig,   setInitialConfig]   = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [saving,          setSaving]          = useState(false);
  const [auditReason,     setAuditReason]     = useState('');
  const [versionHistory,  setVersionHistory]  = useState([]);
  const [showHistory,     setShowHistory]     = useState(false);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/admin/mlm/config');
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        const d = json.data;
        const mapped = {
          platformFeeAmount: d.platformFeeAmount ?? d.feeAmount ?? 100,
          gstPercent:        d.gstPercent  ?? 0,
          description:       d.description ?? 'Lifetime Membership & 3x15 Matrix Placement Fee',
          paymentProvider:   d.paymentProvider ?? 'adsky_cashfree',
          version:           d.version ?? 1,
        };
        setConfig(mapped);
        setInitialConfig(mapped);
        if (json.history) setVersionHistory(json.history);
      }
    } catch (e) {
      toast.error('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConfig(); }, []);

  const hasChanges = initialConfig &&
    JSON.stringify(config) !== JSON.stringify(initialConfig);

  const totalAmount = Math.round(
    (config.platformFeeAmount || 0) * (1 + (config.gstPercent || 0) / 100)
  );

  const handleSave = async () => {
    if (!config.platformFeeAmount || config.platformFeeAmount < 1) {
      toast.error('Platform fee must be at least Rs.1');
      return;
    }
    setSaving(true);
    try {
      const res  = await fetch('/api/admin/mlm/config', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          auditReason: auditReason || 'Admin updated platform fee configuration',
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Save failed');
      const updated = {
        platformFeeAmount: json.data.platformFeeAmount ?? json.data.totalAmount ?? config.platformFeeAmount,
        gstPercent:        json.data.gstPercent  ?? config.gstPercent,
        description:       json.data.description ?? config.description,
        paymentProvider:   json.data.paymentProvider ?? config.paymentProvider,
        version:           json.data.version ?? config.version,
      };
      setConfig(updated);
      setInitialConfig(updated);
      setAuditReason('');
      toast.success(json.message || 'Configuration saved successfully!');
      fetchConfig();
    } catch (err) {
      toast.error(err.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6 pb-16">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <span className="p-2 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <Settings className="w-5 h-5 text-amber-600" />
              </span>
              MLM Platform Configuration
            </h1>
            <p className="text-gray-400 mt-1 text-xs font-medium">
              Manage activation fee, payment gateway and pricing for NextView MLM.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black flex items-center gap-1.5 animate-pulse">
                <AlertCircle className="w-3 h-3" /> Unsaved
              </span>
            )}
            <button onClick={fetchConfig} disabled={loading || saving}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Reload
            </button>
            <button onClick={handleSave} disabled={saving || !hasChanges}
              className="flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-black text-xs rounded-xl transition shadow-md shadow-amber-500/20">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Platform Fee Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
            <IndianRupee className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-black text-gray-900">Platform Activation Fee</h2>
            <span className="ml-auto text-[10px] font-mono text-gray-400 font-bold uppercase bg-gray-50 px-2 py-1 rounded-lg border border-gray-200">
              Active v{config.version}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Base Fee */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                Base Fee (Rs.) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400">Rs.</span>
                <input type="number" min="1"
                  value={config.platformFeeAmount}
                  onChange={(e) => setConfig({ ...config, platformFeeAmount: Number(e.target.value) })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-black text-gray-900 bg-white text-sm outline-none transition" />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Base amount before GST</p>
            </div>

            {/* GST */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                GST % <span className="text-gray-300">(0 = No GST)</span>
              </label>
              <div className="relative">
                <input type="number" min="0" max="100"
                  value={config.gstPercent}
                  onChange={(e) => setConfig({ ...config, gstPercent: Number(e.target.value) })}
                  className="w-full pr-10 pl-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 font-black text-gray-900 bg-white text-sm outline-none transition" />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400">%</span>
              </div>
            </div>
          </div>

          {/* Live Total */}
          <div className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Final Amount Charged to Member</p>
              <p className="text-xs opacity-70 mt-0.5">
                Rs.{config.platformFeeAmount || 0} base
                {(config.gstPercent || 0) > 0 && ` + ${config.gstPercent}% GST`}
              </p>
            </div>
            <div className="text-right">
              <span className="text-4xl font-black">Rs.{totalAmount}</span>
              <p className="text-[10px] opacity-70 font-bold mt-0.5">One-time · INR</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
              Fee Description <span className="text-gray-300">(shown to member)</span>
            </label>
            <input type="text"
              value={config.description}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
              placeholder="e.g. Lifetime Membership & 3x15 Matrix Placement Fee"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 font-medium text-gray-700 bg-white text-sm outline-none transition" />
          </div>
        </div>

        {/* Payment Gateway Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
            <CreditCard className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-black text-gray-900">Payment Gateway</h2>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
              Payment Received Via (Gateway Account)
            </label>
            <div className="relative">
              <select
                value={config.paymentProvider}
                onChange={(e) => setConfig({ ...config, paymentProvider: e.target.value })}
                className="w-full appearance-none px-4 py-3 pr-10 rounded-xl border-2 border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 font-bold text-gray-800 bg-white text-sm outline-none transition cursor-pointer">
                {GATEWAY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
            <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-1">Payment Routing</p>
            <p className="text-xs text-blue-600 font-medium">
              MLM activation charges are routed through{' '}
              <span className="font-black">{gatewayLabel(config.paymentProvider)}</span>{' '}
              under purpose <span className="font-mono font-black bg-blue-100 px-1 rounded">mlm_platform_fee</span>.
            </p>
          </div>
        </div>

        {/* Audit + Save */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
            <Zap className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-black text-gray-900">Save Configuration</h2>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
              Reason for Change <span className="text-gray-300">(stored in audit log)</span>
            </label>
            <input type="text"
              value={auditReason}
              onChange={(e) => setAuditReason(e.target.value)}
              placeholder="e.g. Revised activation fee for Q4 campaign"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 font-medium text-gray-700 bg-white text-sm outline-none transition" />
          </div>

          <button onClick={handleSave} disabled={saving || !hasChanges}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-black text-sm rounded-2xl transition shadow-lg shadow-amber-500/25">
            <Save className="w-4 h-4" />
            {saving ? 'Saving Configuration...' : `Save & Activate — Rs.${totalAmount} Platform Fee`}
          </button>

          {!hasChanges && (
            <p className="text-center text-[11px] text-gray-400">No changes to save.</p>
          )}
        </div>

        {/* Version History */}
        {versionHistory.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <button onClick={() => setShowHistory((h) => !h)}
              className="flex items-center gap-2 w-full text-left">
              <History className="w-5 h-5 text-amber-500" />
              <span className="text-base font-black text-gray-900">Version History</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 ml-auto transition-transform ${showHistory ? 'rotate-180' : ''}`} />
            </button>
            {showHistory && (
              <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                {versionHistory.map((v, i) => (
                  <div key={i}
                    className={`flex items-center justify-between p-3 rounded-xl text-xs ${v.isActive ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50 border border-gray-100'}`}>
                    <div>
                      <span className={`font-black ${v.isActive ? 'text-amber-700' : 'text-gray-600'}`}>
                        v{v.version} — Rs.{v.totalAmount}
                        {v.isActive && <span className="ml-2 text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded-md">ACTIVE</span>}
                      </span>
                      {v.description && <p className="text-gray-400 mt-0.5">{v.description}</p>}
                    </div>
                    <div className="text-right text-gray-400">
                      <p>{v.updatedBy || 'admin'}</p>
                      <p>{v.effectiveFrom ? new Date(v.effectiveFrom).toLocaleDateString('en-IN') : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
