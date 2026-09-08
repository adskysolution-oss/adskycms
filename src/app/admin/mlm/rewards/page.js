'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { IndianRupee, Search, RefreshCw } from 'lucide-react';
export default function AdminMlmRewardsPage() {
    const [rewards, setRewards] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedLevel, setSelectedLevel] = useState('ALL');
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [search, setSearch] = useState('');
    const loadRewards = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedLevel !== 'ALL')
                params.set('level', selectedLevel);
            if (selectedStatus !== 'ALL')
                params.set('status', selectedStatus);
            const res = await fetch(`/api/admin/mlm/rewards?${params.toString()}`);
            const data = await res.json();
            if (res.ok && data.success) {
                setRewards(data.data || []);
                setSummary(data.summary || null);
            }
        }
        catch (e) {
            console.error('Failed to load MLM rewards:', e);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadRewards();
    }, [selectedLevel, selectedStatus]);
    const filtered = rewards.filter((r) => {
        const q = search.toLowerCase();
        return (!q ||
            r.memberId?.fullName?.toLowerCase().includes(q) ||
            r.memberId?.mlmCode?.toLowerCase().includes(q) ||
            r.sourceMemberId?.fullName?.toLowerCase().includes(q));
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
                MLM Rewards Ledger
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Multi-tier Level 1 to 15 bonus commissions credited upon qualifying customer FD verifications.
            </p>
          </div>

          <button onClick={loadRewards} disabled={loading} className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}/>
            <span>Refresh Ledger</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Distributed</span>
            <p className="text-2xl font-black text-purple-600">₹{summary?.totalDistributed || 0}</p>
            <span className="text-[10px] text-purple-700">Credited to wallets</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pending Rewards</span>
            <p className="text-2xl font-black text-amber-600">₹{summary?.totalPending || 0}</p>
            <span className="text-[10px] text-amber-700">Awaiting processing</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Reward Transactions</span>
            <p className="text-2xl font-black text-gray-900">{summary?.totalRewards || rewards.length || 0}</p>
            <span className="text-[10px] text-gray-500">Across 15 tiers</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400"/>
            <input type="text" placeholder="Search by member name, MLM code..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"/>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-semibold focus:outline-none">
              <option value="ALL">All Levels (1 to 15)</option>
              {Array.from({ length: 15 }, (_, i) => i + 1).map((lvl) => (<option key={lvl} value={lvl.toString()}>
                  Level {lvl}
                </option>))}
            </select>

            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-semibold focus:outline-none">
              <option value="ALL">All Statuses</option>
              <option value="DISTRIBUTED">Distributed / Credited</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <span className="text-gray-500 font-bold text-xs pl-2">
              {filtered.length} records
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider text-[10px] border-b border-gray-200 font-bold">
                <tr>
                  <th className="p-4">Beneficiary Member</th>
                  <th className="p-4">Reward Level</th>
                  <th className="p-4">Source Member (Referral)</th>
                  <th className="p-4">Commission Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date Credited</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (<tr>
                    <td colSpan={6} className="p-12 text-center text-gray-400">
                      No rewards found matching the filters.
                    </td>
                  </tr>) : (filtered.map((r) => (<tr key={r._id} className="hover:bg-gray-50/60 transition">
                      <td className="p-4 font-bold text-gray-900">
                        <div>{r.memberId?.fullName || '—'}</div>
                        <div className="font-mono text-[10px] text-amber-700">{r.memberId?.mlmCode}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[10px]">
                          Level {r.level}
                        </span>
                      </td>
                      <td className="p-4 text-gray-700">
                        <div>{r.sourceMemberId?.fullName || 'Direct Customer'}</div>
                        <div className="font-mono text-[10px] text-gray-500">{r.sourceMemberId?.mlmCode || '—'}</div>
                      </td>
                      <td className="p-4 font-black text-purple-700 text-sm">
                        ₹{r.amount}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${r.status === 'DISTRIBUTED' || r.status === 'CREDITED'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : r.status === 'PENDING'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-red-50 text-red-700 border border-red-200'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500">
                        {new Date(r.createdAt).toLocaleString('en-IN')}
                      </td>
                    </tr>)))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>);
}
