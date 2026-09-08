'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import {
  Sliders,
  CreditCard,
  Save,
  RefreshCw,
  ShieldCheck,
  Zap,
  History
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const GATEWAY_OPTIONS = [
  {
    id: 'adsky_cashfree',
    name: 'AdSky — Cashfree',
    badge: 'Recommended',
    description: 'Instant UPI, Cards & NetBanking via Cashfree PG',
    status: 'ACTIVE',
  },
  {
    id: 'adsky_razorpay',
    name: 'AdSky — Razorpay',
    badge: 'Standard',
    description: 'Payment Links, Cards, UPI & Wallets via Razorpay',
    status: 'READY',
  },
  {
    id: 'adsky_phonepe',
    name: 'AdSky — PhonePe',
    badge: 'PG Direct',
    description: 'PhonePe PG direct checkout flow',
    status: 'READY',
  },
];

export default function AdminMlmConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [config, setConfig] = useState({
    feeAmount: 100,
    gstPercent: 0,
    description: 'Lifetime Membership and 3x15 Matrix Placement Fee',
    paymentProvider: 'adsky_cashfree',
    version: 1,
  });

  const [auditReason, setAuditReason] = useState('');
  const [history, setHistory] = useState([]);

  // Fetch active config on load
  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/mlm/config');
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        setConfig({
          feeAmount: Number(d.feeAmount ?? d.platformFeeAmount ?? 100),
          gstPercent: Number(d.gstPercent ?? 0),
          description: d.description || 'Lifetime Membership and 3x15 Matrix Placement Fee',
          paymentProvider: d.paymentProvider || 'adsky_cashfree',
          version: d.version || 1,
        });
        if (json.history) {
          setHistory(json.history);
        }
      } else {
        toast.error(json.message || 'Failed to load configuration');
      }
    } catch (err) {
      console.error('Error fetching config:', err);
      toast.error('Network error loading configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Derived live amounts
  const feeAmount = Math.max(0, Number(config.feeAmount) || 0);
  const gstPercent = Math.max(0, Number(config.gstPercent) || 0);
  const gstAmount = Math.round((feeAmount * gstPercent) / 100);
  const totalAmount = Math.round(feeAmount + gstAmount);

  const selectedGateway =
    GATEWAY_OPTIONS.find((g) => g.id === config.paymentProvider) || GATEWAY_OPTIONS[0];

  // Handle submit / save
  const handleSave = async (e) => {
    e.preventDefault();
    if (feeAmount <= 0) {
      toast.error('Base platform fee must be greater than 0');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        platformFeeAmount: feeAmount,
        feeAmount: feeAmount,
        gstPercent: gstPercent,
        totalAmount: totalAmount,
        description: config.description.trim(),
        paymentProvider: config.paymentProvider,
        auditReason: auditReason.trim() || 'Updated platform charges and gateway config',
      };

      const res = await fetch('/api/admin/mlm/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(json.message || 'Platform fee configuration updated successfully!');
        setAuditReason('');
        await fetchConfig();
      } else {
        toast.error(json.message || 'Failed to save configuration');
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Network error while saving');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8">
        {/* Page Header */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
                <Sliders className="w-4 h-4" />
                <span>Payment Control Center</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  v{config.version} Active
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                MLM Platform Charges Config
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Configure global member activation charges, GST rates, and payment gateway routing.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={fetchConfig}
                disabled={loading || saving}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
            <div className="h-48 bg-white border border-slate-200 rounded-2xl p-6"></div>
            <div className="h-64 bg-white border border-slate-200 rounded-2xl p-6"></div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="max-w-5xl mx-auto space-y-6">
            {/* Card 1: Architecture & Gateway Settings */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition hover:border-slate-300">
              <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-600 border border-amber-100">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Architecture & Gateway Settings</h2>
                    <p className="text-xs text-slate-500">Select payment provider for member platform fee checkout</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Production (Live)
                </span>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Payment Receive Via (Gateway Account) *
                  </label>
                  <select
                    value={config.paymentProvider}
                    onChange={(e) => setConfig({ ...config, paymentProvider: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                  >
                    {GATEWAY_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name} ({opt.badge})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Gateway Routing Guarantee Box */}
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed text-amber-900">
                    <span className="font-bold uppercase tracking-wide">Payment Routing Guarantee: </span>
                    All new MLM member activation and matrix placement charges are automatically processed and verified through{' '}
                    <span className="font-bold underline text-amber-950">{selectedGateway.name}</span>{' '}
                    under purpose <code className="px-1.5 py-0.5 bg-amber-100/80 rounded font-mono text-[11px] text-amber-900">mlm_platform_fee</code>.
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: MLM Platform Fee & Pricing */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition hover:border-slate-300">
              <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-600 border border-amber-100">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">MLM Platform Charges & Pricing</h2>
                    <p className="text-xs text-slate-500">Dynamic membership fee charged to new members upon onboarding</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Base Platform Fee */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Base Platform Fee (Rs.) *
                    </label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-semibold text-sm">
                        Rs.
                      </div>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        required
                        value={config.feeAmount}
                        onChange={(e) => setConfig({ ...config, feeAmount: e.target.value })}
                        className="block w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                        placeholder="100"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5">Base activation fee before GST taxes</p>
                  </div>

                  {/* GST Percentage */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      GST % (0 = No Tax) *
                    </label>
                    <div className="relative rounded-xl shadow-sm">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={config.gstPercent}
                        onChange={(e) => setConfig({ ...config, gstPercent: e.target.value })}
                        className="block w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                        placeholder="0"
                      />
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 font-semibold text-sm">
                        %
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5">Applied on base fee ({gstPercent}% = Rs. {gstAmount})</p>
                  </div>
                </div>

                {/* Final Charged Amount Preview Banner */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-amber-100/40 to-amber-50/30 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800">
                      Final Amount Charged To Member
                    </div>
                    <div className="text-xs text-amber-700 mt-0.5">
                      Base: <span className="font-bold">Rs. {feeAmount}</span> + GST ({gstPercent}%):{' '}
                      <span className="font-bold">Rs. {gstAmount}</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-3xl font-extrabold text-amber-900 tracking-tight">
                      Rs. {totalAmount}
                    </div>
                    <div className="text-[11px] font-semibold text-amber-700">INR (One-time Activation)</div>
                  </div>
                </div>

                {/* Fee Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Fee Description (Shown to Member at Checkout)
                  </label>
                  <input
                    type="text"
                    value={config.description}
                    onChange={(e) => setConfig({ ...config, description: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                    placeholder="e.g. Lifetime Membership and 3x15 Matrix Placement Fee"
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    This label is displayed on the payment checkout screen and invoices.
                  </p>
                </div>

                {/* Audit Reason */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Reason for Change (Admin Audit Log)
                  </label>
                  <input
                    type="text"
                    value={auditReason}
                    onChange={(e) => setAuditReason(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                    placeholder="e.g. Updated platform fee to Rs. 100 as per management decision"
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Logged in administrative audit records for compliance and tracking.
                  </p>
                </div>
              </div>

              {/* Card Footer: Save Button */}
              <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving Configuration...' : 'Save Configuration'}</span>
                </button>
              </div>
            </div>

            {/* Card 3: Version History Log */}
            {history && history.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                      <History className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Configuration Version History</h2>
                      <p className="text-xs text-slate-500">Audit trail of previous platform fee changes</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    {history.length} record{history.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50/60 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200/70">
                      <tr>
                        <th className="px-6 py-3">Version</th>
                        <th className="px-6 py-3">Base Fee</th>
                        <th className="px-6 py-3">GST %</th>
                        <th className="px-6 py-3">Total Charged</th>
                        <th className="px-6 py-3">Gateway</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Updated Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {history.map((h, idx) => {
                        const isCurrent = h.isActive;
                        return (
                          <tr
                            key={h._id || idx}
                            className={isCurrent ? 'bg-amber-50/30 font-medium' : 'hover:bg-slate-50/50'}
                          >
                            <td className="px-6 py-3.5 font-bold text-slate-900">v{h.version}</td>
                            <td className="px-6 py-3.5">Rs. {h.feeAmount ?? h.totalAmount}</td>
                            <td className="px-6 py-3.5">{h.gstPercent ?? 0}%</td>
                            <td className="px-6 py-3.5 font-bold text-slate-900">
                              Rs. {h.totalAmount ?? h.feeAmount}
                            </td>
                            <td className="px-6 py-3.5 capitalize">
                              {h.paymentProvider ? h.paymentProvider.replace('_', ' ') : 'AdSky Cashfree'}
                            </td>
                            <td className="px-6 py-3.5">
                              {isCurrent ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                                  Archived
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-3.5 text-slate-400">
                              {h.effectiveFrom
                                ? new Date(h.effectiveFrom).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
