'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { ShieldCheck, Search, RefreshCw } from 'lucide-react';
export default function AdminMlmKycPage() {
    const [kycRecords, setKycRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL');
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const loadKyc = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/mlm/kyc');
            const data = await res.json();
            if (res.ok && data.success) {
                setKycRecords(data.data || []);
            }
        }
        catch (e) {
            console.error('Failed to load KYC records:', e);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadKyc();
    }, []);
    const handleVerify = async (kycId, action) => {
        const reason = action === 'REJECT' || action === 'CORRECTION'
            ? prompt(`Enter reason / remarks for ${action}:`)
            : 'KYC verified and approved by admin';
        if (reason === null)
            return;
        setActionLoading(kycId);
        try {
            const res = await fetch(`/api/admin/mlm/kyc/${kycId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    adminRemarks: reason,
                    rejectionReason: reason,
                    correctionRemarks: reason,
                }),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data.message || 'Action failed');
            alert(`KYC status updated to ${data.data?.status || action}!`);
            loadKyc();
        }
        catch (e) {
            alert(e.message || 'Failed to update KYC status');
        }
        finally {
            setActionLoading(null);
        }
    };
    const filteredRecords = kycRecords.filter((k) => {
        const q = search.toLowerCase();
        const matchesSearch = !q ||
            k.memberId?.fullName?.toLowerCase().includes(q) ||
            k.memberId?.mobile?.includes(q) ||
            k.memberId?.mlmCode?.toLowerCase().includes(q) ||
            k.panNumber?.toLowerCase().includes(q) ||
            k.aadhaarNumber?.includes(q) ||
            k.bankDetails?.accountHolderName?.toLowerCase().includes(q) ||
            k.bankDetails?.bankName?.toLowerCase().includes(q);
        const matchesTab = activeTab === 'ALL' || k.status === activeTab;
        return matchesSearch && matchesTab;
    });
    return (<DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <ShieldCheck className="w-5 h-5"/>
              </span>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                KYC &amp; Bank Verifications
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Review submitted PAN cards, Aadhaar numbers, bank accounts, and IFSC codes before approving for platform payment.
            </p>
          </div>

          <button onClick={loadKyc} disabled={loading} className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}/>
            <span>Refresh Submissions</span>
          </button>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-2 text-xs font-bold">
          {[
            { key: 'ALL', label: `All Submissions (${kycRecords.length})` },
            {
                key: 'UNDER_REVIEW',
                label: `Under Review (${kycRecords.filter((k) => k.status === 'UNDER_REVIEW').length})`,
            },
            {
                key: 'PENDING',
                label: `Pending (${kycRecords.filter((k) => k.status === 'PENDING').length})`,
            },
            {
                key: 'VERIFIED',
                label: `Approved (${kycRecords.filter((k) => k.status === 'VERIFIED').length})`,
            },
            {
                key: 'REJECTED',
                label: `Rejected (${kycRecords.filter((k) => k.status === 'REJECTED').length})`,
            },
        ].map((tab) => (<button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${activeTab === tab.key
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              {tab.label}
            </button>))}
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400"/>
          <input type="text" placeholder="Search by member, PAN, Aadhaar, bank..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"/>
        </div>

        {/* KYC Table */}
        <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider text-[10px] border-b border-gray-200 font-bold">
                <tr>
                  <th className="p-4">Member Info</th>
                  <th className="p-4">PAN Details</th>
                  <th className="p-4">Aadhaar (12 Digits)</th>
                  <th className="p-4">Bank Account &amp; IFSC</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Submitted</th>
                  <th className="p-4 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRecords.length === 0 ? (<tr>
                    <td colSpan={7} className="p-12 text-center text-gray-400">
                      No KYC records found.
                    </td>
                  </tr>) : (filteredRecords.map((k) => (<tr key={k._id} className="hover:bg-gray-50/60 transition">
                      <td className="p-4 font-bold text-gray-900">
                        <div>{k.memberId?.fullName || '—'}</div>
                        <div className="text-[11px] font-normal text-gray-500">{k.memberId?.mobile}</div>
                        <div className="font-mono text-[10px] text-amber-700">{k.memberId?.mlmCode}</div>
                      </td>
                      <td className="p-4 font-mono font-bold text-gray-900">
                        {k.panNumber || '—'}
                      </td>
                      <td className="p-4 font-mono text-gray-700">
                        {k.aadhaarNumber ? `XXXX-XXXX-${k.aadhaarNumber.slice(-4)}` : '—'}
                      </td>
                      <td className="p-4 text-gray-700">
                        {k.bankDetails ? (<div>
                            <div className="font-bold text-gray-900">{k.bankDetails.accountHolderName}</div>
                            <div className="font-mono text-[11px]">A/C: {k.bankDetails.accountNumber}</div>
                            <div className="font-mono text-[10px] text-gray-500">
                              IFSC: {k.bankDetails.ifscCode} {k.bankDetails.bankName ? `(${k.bankDetails.bankName})` : ''}
                            </div>
                            {k.bankDetails.upiId && (<div className="text-[10px] text-purple-700 font-semibold">UPI: {k.bankDetails.upiId}</div>)}
                          </div>) : ('—')}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${k.status === 'VERIFIED'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : k.status === 'UNDER_REVIEW'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200 font-black animate-pulse'
                    : k.status === 'REJECTED'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-gray-100 text-gray-600'}`}>
                          {k.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500">
                        {new Date(k.updatedAt || k.createdAt).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                        {k.status !== 'VERIFIED' && (<button onClick={() => handleVerify(k._id, 'VERIFY')} disabled={actionLoading === k._id} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition disabled:opacity-50">
                            Approve
                          </button>)}
                        {k.status !== 'REJECTED' && (<button onClick={() => handleVerify(k._id, 'REJECT')} disabled={actionLoading === k._id} className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-[11px] transition disabled:opacity-50">
                            Reject
                          </button>)}
                      </td>
                    </tr>)))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>);
}
