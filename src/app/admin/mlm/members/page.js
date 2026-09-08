'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { Users, Search, RefreshCw, MapPin, Layers, X } from 'lucide-react';
export default function AdminMlmMembersPage() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    // Filters
    const [search, setSearch] = useState('');
    const [selectedState, setSelectedState] = useState('ALL');
    const [selectedKycStatus, setSelectedKycStatus] = useState('ALL');
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    // Selected Member for Detail Drawer
    const [selectedMember, setSelectedMember] = useState(null);
    const loadMembers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/mlm/members');
            const data = await res.json();
            if (res.ok && data.success) {
                setMembers(data.data || []);
            }
        }
        catch (e) {
            console.error('Failed to load MLM members:', e);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadMembers();
    }, []);
    const distinctStates = Array.from(new Set(members.map((m) => m.state).filter(Boolean)));
    const filteredMembers = members.filter((m) => {
        const q = search.toLowerCase();
        const matchesSearch = !q ||
            m.fullName?.toLowerCase().includes(q) ||
            m.mobile?.includes(q) ||
            m.mlmCode?.toLowerCase().includes(q) ||
            m.sponsorCode?.toLowerCase().includes(q) ||
            m.state?.toLowerCase().includes(q) ||
            m.district?.toLowerCase().includes(q) ||
            m.pincode?.includes(q);
        const matchesState = selectedState === 'ALL' || m.state === selectedState;
        const matchesKyc = selectedKycStatus === 'ALL' || m.kycStatus === selectedKycStatus;
        const matchesStatus = selectedStatus === 'ALL' || m.status === selectedStatus;
        return matchesSearch && matchesState && matchesKyc && matchesStatus;
    });
    return (<DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <Users className="w-5 h-5"/>
              </span>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                MLM Members Directory
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Complete registry of MLM members, sponsor linkages, geographic locations, and verification stages.
            </p>
          </div>

          <button onClick={loadMembers} disabled={loading} className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}/>
            <span>Refresh</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400"/>
            <input type="text" placeholder="Search by name, mobile, MLM code, sponsor, PIN..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"/>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-semibold focus:outline-none">
              <option value="ALL">All States</option>
              {distinctStates.map((st) => (<option key={st} value={st}>
                  {st}
                </option>))}
            </select>

            <select value={selectedKycStatus} onChange={(e) => setSelectedKycStatus(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-semibold focus:outline-none">
              <option value="ALL">All KYC Statuses</option>
              <option value="PENDING">KYC Pending</option>
              <option value="UNDER_REVIEW">KYC Under Review</option>
              <option value="VERIFIED">KYC Verified</option>
              <option value="REJECTED">KYC Rejected</option>
            </select>

            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-semibold focus:outline-none">
              <option value="ALL">All Member Statuses</option>
              <option value="ACTIVE">Active (Matrix Placed)</option>
              <option value="PENDING_PAYMENT">Pending ₹100 Payment</option>
              <option value="PENDING_KYC">Pending KYC</option>
            </select>

            <span className="text-gray-500 font-bold text-xs pl-2">
              {filteredMembers.length} records
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider text-[10px] border-b border-gray-200 font-bold">
                <tr>
                  <th className="p-4">Member Info</th>
                  <th className="p-4">MLM Code</th>
                  <th className="p-4">Sponsor</th>
                  <th className="p-4">Location (PIN / District)</th>
                  <th className="p-4">KYC Status</th>
                  <th className="p-4">Platform Fee</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMembers.length === 0 ? (<tr>
                    <td colSpan={8} className="p-12 text-center text-gray-400">
                      No MLM members found matching the filters.
                    </td>
                  </tr>) : (filteredMembers.map((m) => (<tr key={m._id} className="hover:bg-gray-50/60 transition">
                      <td className="p-4 font-bold text-gray-900">
                        <div>{m.fullName}</div>
                        <div className="text-[11px] font-normal text-gray-500">{m.mobile}</div>
                      </td>
                      <td className="p-4 font-mono font-bold text-amber-700">{m.mlmCode}</td>
                      <td className="p-4 font-mono text-gray-600">{m.sponsorCode || 'ROOT'}</td>
                      <td className="p-4 text-gray-700">
                        <div className="flex items-center gap-1 font-semibold">
                          <MapPin className="w-3 h-3 text-gray-400"/>
                          <span>{m.district || '—'}, {m.state || '—'}</span>
                        </div>
                        <div className="text-[10px] font-mono text-gray-500 pl-4">
                          PIN: {m.pincode || '—'} {m.city ? `(${m.city})` : ''}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${m.kycStatus === 'VERIFIED'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : m.kycStatus === 'UNDER_REVIEW'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-gray-100 text-gray-600'}`}>
                          {m.kycStatus || 'PENDING'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${m.platformFeePaid
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'}`}>
                          {m.platformFeePaid ? '₹100 Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${m.status === 'ACTIVE'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'}`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1.5">
                        <button onClick={() => setSelectedMember(m)} className="px-2.5 py-1 text-[11px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition">
                          View Details
                        </button>
                        <Link href={`/admin/mlm/matrix?member=${encodeURIComponent(m.mlmCode)}`} className="px-2.5 py-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition inline-flex items-center gap-1">
                          <Layers className="w-3 h-3"/>
                          <span>Tree</span>
                        </Link>
                      </td>
                    </tr>)))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Member Detail Modal */}
        {selectedMember && (<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-lg font-black text-gray-900">{selectedMember.fullName}</h2>
                  <p className="text-xs font-mono text-amber-600 font-bold">{selectedMember.mlmCode}</p>
                </div>
                <button onClick={() => setSelectedMember(null)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition">
                  <X className="w-5 h-5"/>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-gray-50 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-gray-400">Mobile</span>
                  <p className="font-bold text-gray-900">{selectedMember.mobile}</p>
                </div>
                <div className="p-3.5 bg-gray-50 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-gray-400">Email</span>
                  <p className="font-bold text-gray-900">{selectedMember.email || '—'}</p>
                </div>
                <div className="p-3.5 bg-gray-50 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-gray-400">Sponsor</span>
                  <p className="font-mono font-bold text-gray-900">{selectedMember.sponsorCode || 'ROOT'}</p>
                </div>
                <div className="p-3.5 bg-gray-50 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-gray-400">Membership Status</span>
                  <p className="font-bold text-emerald-600">{selectedMember.status}</p>
                </div>
                <div className="p-3.5 bg-gray-50 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-gray-400">KYC Status</span>
                  <p className="font-bold text-gray-900">{selectedMember.kycStatus}</p>
                </div>
                <div className="p-3.5 bg-gray-50 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-gray-400">Platform Fee</span>
                  <p className="font-bold text-gray-900">{selectedMember.platformFeePaid ? '₹100 (Paid)' : 'Unpaid'}</p>
                </div>
                <div className="col-span-2 p-3.5 bg-gray-50 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-gray-400">Location Details</span>
                  <p className="font-medium text-gray-900">
                    {selectedMember.address ? `${selectedMember.address}, ` : ''}
                    {selectedMember.district}, {selectedMember.state} — PIN: {selectedMember.pincode}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Link href={`/admin/mlm/matrix?member=${encodeURIComponent(selectedMember.mlmCode)}`} className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition">
                  Explore 3×15 Matrix Tree
                </Link>
                <button onClick={() => setSelectedMember(null)} className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition">
                  Close
                </button>
              </div>
            </div>
          </div>)}
      </div>
    </DashboardLayout>);
}
