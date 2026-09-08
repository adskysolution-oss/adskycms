'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { IndianRupee, Search, RefreshCw } from 'lucide-react';
export default function AdminMlmWithdrawalsPage() {
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL');
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const loadWithdrawals = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/mlm/withdrawals');
            const json = await res.json();
            if (res.ok && json.success) {
                setWithdrawals(json.data || []);
            }
        }
        catch (e) {
            console.error('Failed to load withdrawals:', e);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadWithdrawals();
    }, []);
    const handleProcess = async (withdrawalId, action) => {
        const transRef = action === 'APPROVE'
            ? prompt('Enter Bank / UPI Transaction Reference / UTR Number:')
            : prompt('Enter rejection reason / remarks:');
        if (transRef === null)
            return;
        setActionLoading(withdrawalId);
        try {
            const res = await fetch(`/api/admin/mlm/withdrawals/${withdrawalId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: action === 'APPROVE' ? 'PAID' : 'REJECTED',
                    transactionReference: transRef,
                    remarks: transRef,
                }),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data.message || 'Action failed');
            alert(`Withdrawal marked as ${action === 'APPROVE' ? 'PAID' : 'REJECTED'}!`);
            loadWithdrawals();
        }
        catch (e) {
            alert(e.message || 'Failed to process payout');
        }
        finally {
            setActionLoading(null);
        }
    };
    const filtered = withdrawals.filter((w) => {
        const q = search.toLowerCase();
        const matchesSearch = !q ||
            w.memberId?.fullName?.toLowerCase().includes(q) ||
            w.memberId?.mlmCode?.toLowerCase().includes(q) ||
            w.upiId?.toLowerCase().includes(q) ||
            w.bankDetails?.accountNumber?.includes(q) ||
            w.transactionReference?.toLowerCase().includes(q);
        const matchesTab = activeTab === 'ALL' || w.status === activeTab;
        return matchesSearch && matchesTab;
    });
    return (<DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <IndianRupee className="w-5 h-5"/>
              </span>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Withdrawal Payout Requests
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Process verified member earnings withdrawals to their linked Bank Accounts or UPI IDs.
            </p>
          </div>

          <button onClick={loadWithdrawals} disabled={loading} className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}/>
            <span>Refresh</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-2 text-xs font-bold">
          {[
            { key: 'ALL', label: `All Requests (${withdrawals.length})` },
            {
                key: 'PENDING',
                label: `Pending Payout (${withdrawals.filter((w) => w.status === 'PENDING').length})`,
            },
            {
                key: 'PAID',
                label: `Paid / Settled (${withdrawals.filter((w) => w.status === 'PAID').length})`,
            },
            {
                key: 'REJECTED',
                label: `Rejected (${withdrawals.filter((w) => w.status === 'REJECTED').length})`,
            },
        ].map((tab) => (<button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${activeTab === tab.key
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              {tab.label}
            </button>))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400"/>
          <input type="text" placeholder="Search by member name, MLM code, UPI, UTR..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"/>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider text-[10px] border-b border-gray-200 font-bold">
                <tr>
                  <th className="p-4">Member Info</th>
                  <th className="p-4">Payout Amount</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Destination Bank / UPI</th>
                  <th className="p-4">UTR / Ref No</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Requested Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (<tr>
                    <td colSpan={8} className="p-12 text-center text-gray-400">
                      No withdrawal payout requests found.
                    </td>
                  </tr>) : (filtered.map((w) => (<tr key={w._id} className="hover:bg-gray-50/60 transition">
                      <td className="p-4 font-bold text-gray-900">
                        <div>{w.memberId?.fullName || 'Member'}</div>
                        <div className="font-mono text-[10px] text-amber-700">{w.memberId?.mlmCode || '—'}</div>
                      </td>
                      <td className="p-4 font-black text-emerald-600 text-sm">
                        ₹{w.amount}
                      </td>
                      <td className="p-4 font-bold text-gray-700">{w.paymentMethod}</td>
                      <td className="p-4 text-gray-700 font-mono text-[11px]">
                        {w.paymentMethod === 'UPI' ? (<span className="text-purple-700 font-semibold">{w.upiId || '—'}</span>) : (<div>
                            <div>A/C: {w.bankDetails?.accountNumber}</div>
                            <div className="text-[10px] text-gray-500">IFSC: {w.bankDetails?.ifscCode}</div>
                          </div>)}
                      </td>
                      <td className="p-4 font-mono text-gray-600 text-[11px]">
                        {w.transactionReference || '—'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${w.status === 'PAID'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : w.status === 'PENDING'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                    : 'bg-red-50 text-red-700 border border-red-200'}`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500">
                        {new Date(w.createdAt).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                        {w.status === 'PENDING' && (<>
                            <button onClick={() => handleProcess(w._id, 'APPROVE')} disabled={actionLoading === w._id} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition disabled:opacity-50">
                              Mark Paid
                            </button>
                            <button onClick={() => handleProcess(w._id, 'REJECT')} disabled={actionLoading === w._id} className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-[11px] transition disabled:opacity-50">
                              Reject
                            </button>
                          </>)}
                      </td>
                    </tr>)))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>);
}
