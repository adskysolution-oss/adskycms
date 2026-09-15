'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { ShieldCheck, Search, RefreshCw, Eye, CheckCircle2, AlertTriangle, XCircle, Clock, X } from 'lucide-react';

export default function AdminMlmKycPage() {
    const [kycRecords, setKycRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL');
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedRecord, setSelectedRecord] = useState(null);

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
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
            if (selectedRecord && selectedRecord._id === kycId) {
                setSelectedRecord(null);
            }
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
            k.maskedPan?.toLowerCase().includes(q) ||
            k.aadhaarNumber?.includes(q) ||
            k.maskedAadhaar?.includes(q) ||
            k.bankDetails?.accountHolderName?.toLowerCase().includes(q) ||
            k.bankDetails?.bankName?.toLowerCase().includes(q);
        const matchesTab = activeTab === 'ALL' || k.status === activeTab;
        return matchesSearch && matchesTab;
    });

    return (
      <DashboardLayout>
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
                Automated APITXT verification records and manual compliance review for NexVia MLM members.
              </p>
            </div>

            <button onClick={loadKyc} disabled={loading} className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}/>
              <span>Refresh Records</span>
            </button>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-2 text-xs font-bold">
            {[
              { key: 'ALL', label: `All (${kycRecords.length})` },
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
          ].map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${activeTab === tab.key
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                {tab.label}
              </button>
            ))}
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
                    <th className="p-4">PAN Verification</th>
                    <th className="p-4">Aadhaar Verification</th>
                    <th className="p-4">Bank Details</th>
                    <th className="p-4">Overall Status</th>
                    <th className="p-4">Submitted / Verified</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-gray-400">
                        No KYC records found.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((k) => {
                      const panV = k.panVerification || {};
                      const aadhV = k.aadhaarVerification || {};
                      const isAuto = k.verificationSource === 'AUTOMATIC_APITXT';

                      return (
                        <tr key={k._id} className="hover:bg-gray-50/60 transition">
                          <td className="p-4 font-bold text-gray-900">
                            <div>{k.memberId?.fullName || '—'}</div>
                            <div className="text-[11px] font-normal text-gray-500">{k.memberId?.mobile}</div>
                            <div className="font-mono text-[10px] text-amber-700">{k.memberId?.mlmCode}</div>
                          </td>

                          {/* PAN Column */}
                          <td className="p-4">
                            <div className="font-mono font-bold text-gray-900">
                              {k.maskedPan || k.panNumber || '—'}
                            </div>
                            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                panV.verified
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : panV.status === 'MISMATCH'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : panV.status === 'FAILED'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-gray-100 text-gray-500'
                              }`}>
                                {panV.verified ? '✓ Verified' : panV.status || 'Pending'}
                              </span>
                              {panV.nameMatch !== undefined && panV.nameMatch !== null && (
                                <span className="text-[9px] text-gray-400">
                                  Name: {panV.nameMatch ? 'Match' : 'Mismatch'}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Aadhaar Column */}
                          <td className="p-4">
                            <div className="font-mono text-gray-700">
                              {k.maskedAadhaar || (k.aadhaarNumber ? `XXXX-XXXX-${k.aadhaarNumber.slice(-4)}` : '—')}
                            </div>
                            <div className="mt-1">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                aadhV.verified
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : aadhV.status === 'OTP_SENT'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : aadhV.status === 'FAILED'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-gray-100 text-gray-500'
                              }`}>
                                {aadhV.verified ? '✓ Verified' : aadhV.status || 'Pending'}
                              </span>
                            </div>
                          </td>

                          {/* Bank Details */}
                          <td className="p-4 text-gray-700">
                            {k.bankDetails ? (
                              <div>
                                <div className="font-bold text-gray-900">{k.bankDetails.accountHolderName}</div>
                                <div className="font-mono text-[11px]">A/C: {k.bankDetails.accountNumber}</div>
                                <div className="font-mono text-[10px] text-gray-500">
                                  IFSC: {k.bankDetails.ifscCode} {k.bankDetails.bankName ? `(${k.bankDetails.bankName})` : ''}
                                </div>
                              </div>
                            ) : (
                              '—'
                            )}
                          </td>

                          {/* Overall Status */}
                          <td className="p-4">
                            <div className="space-y-1">
                              <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold ${
                                k.status === 'VERIFIED'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : k.status === 'UNDER_REVIEW'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200 font-black animate-pulse'
                                  : k.status === 'REJECTED'
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {k.status}
                              </span>
                              {k.status === 'VERIFIED' && (
                                <div className="text-[9px] font-semibold text-slate-500">
                                  {isAuto ? '⚡ APITXT Auto' : '👤 Manual Admin'}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Submitted Date */}
                          <td className="p-4 text-gray-500 text-[11px]">
                            {new Date(k.verifiedAt || k.updatedAt || k.createdAt).toLocaleString('en-IN')}
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => setSelectedRecord(k)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] shadow-sm transition inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Details</span>
                            </button>
                            {k.status !== 'VERIFIED' && (
                              <button
                                onClick={() => handleVerify(k._id, 'VERIFY')}
                                disabled={actionLoading === k._id}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition disabled:opacity-50"
                              >
                                Approve
                              </button>
                            )}
                            {k.status !== 'REJECTED' && (
                              <button
                                onClick={() => handleVerify(k._id, 'REJECT')}
                                disabled={actionLoading === k._id}
                                className="px-2 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-[11px] transition disabled:opacity-50"
                              >
                                Reject
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Details & Verification Audit Modal */}
          {selectedRecord && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="absolute right-5 top-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>

                <div>
                  <h3 className="text-xl font-black text-slate-900">KYC Verification Audit Details</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Member: <strong>{selectedRecord.memberId?.fullName}</strong> ({selectedRecord.memberId?.mlmCode})
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* PAN Verification Panel */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="font-bold text-slate-900">PAN Verification</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        selectedRecord.panVerification?.verified
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {selectedRecord.panVerification?.status || 'PENDING'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p><span className="text-slate-500">PAN:</span> <strong className="font-mono">{selectedRecord.maskedPan || selectedRecord.panNumber}</strong></p>
                      <p><span className="text-slate-500">Provider:</span> {selectedRecord.panVerification?.provider || 'APITXT'}</p>
                      <p><span className="text-slate-500">Name Match:</span> <strong>{selectedRecord.panVerification?.nameMatch ? 'YES' : selectedRecord.panVerification?.nameMatch === false ? 'NO' : '—'}</strong></p>
                      <p><span className="text-slate-500">DOB Match:</span> <strong>{selectedRecord.panVerification?.dobMatch ? 'YES' : selectedRecord.panVerification?.dobMatch === false ? 'NO' : '—'}</strong></p>
                      {selectedRecord.panVerification?.requestId && (
                        <p className="text-[10px] text-slate-400 font-mono">Req ID: {selectedRecord.panVerification.requestId}</p>
                      )}
                    </div>
                  </div>

                  {/* Aadhaar Verification Panel */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="font-bold text-slate-900">Aadhaar Verification</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        selectedRecord.aadhaarVerification?.verified
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {selectedRecord.aadhaarVerification?.status || 'PENDING'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p><span className="text-slate-500">Aadhaar:</span> <strong className="font-mono">{selectedRecord.maskedAadhaar || (selectedRecord.aadhaarNumber ? `XXXX-XXXX-${selectedRecord.aadhaarNumber.slice(-4)}` : '—')}</strong></p>
                      <p><span className="text-slate-500">Provider:</span> {selectedRecord.aadhaarVerification?.provider || 'APITXT'}</p>
                      {selectedRecord.aadhaarVerification?.verifiedName && (
                        <p><span className="text-slate-500">Verified Name:</span> <strong>{selectedRecord.aadhaarVerification.verifiedName}</strong></p>
                      )}
                      {selectedRecord.aadhaarVerification?.requestId && (
                        <p className="text-[10px] text-slate-400 font-mono">Req ID: {selectedRecord.aadhaarVerification.requestId}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Verification History Timeline */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Verification Audit History</h4>
                  <div className="max-h-44 overflow-y-auto space-y-2 border border-slate-200 rounded-2xl p-3 bg-slate-50">
                    {selectedRecord.verificationHistory?.length > 0 ? (
                      selectedRecord.verificationHistory.map((h, i) => (
                        <div key={i} className="text-xs border-b border-slate-200/70 pb-2 last:border-b-0 last:pb-0">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-900">{h.verificationType} ({h.source})</span>
                            <span className="text-[10px] text-slate-400">{new Date(h.timestamp).toLocaleString('en-IN')}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">{h.remarks || h.status}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">No historical audit entries yet.</p>
                    )}
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    onClick={() => handleVerify(selectedRecord._id, 'VERIFY')}
                    disabled={actionLoading === selectedRecord._id}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50"
                  >
                    Manual Approve
                  </button>
                  <button
                    onClick={() => handleVerify(selectedRecord._id, 'REJECT')}
                    disabled={actionLoading === selectedRecord._id}
                    className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs transition disabled:opacity-50"
                  >
                    Manual Reject
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
}
