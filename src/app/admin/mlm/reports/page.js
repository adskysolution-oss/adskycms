'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { BarChart3, MapPin, RefreshCw } from 'lucide-react';
export default function AdminMlmReportsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const loadReports = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/mlm/reports');
            const json = await res.json();
            if (res.ok && json.success) {
                setData(json.data);
            }
        }
        catch (e) {
            console.error('Failed to load MLM reports:', e);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadReports();
    }, []);
    return (<DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <BarChart3 className="w-5 h-5"/>
              </span>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                MLM Reports &amp; Geographic Analytics
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              State and district geographic distribution, KYC conversion velocity, and customer FD referral volumes.
            </p>
          </div>

          <button onClick={loadReports} disabled={loading} className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}/>
            <span>Refresh Analytics</span>
          </button>
        </div>

        {/* Global Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Registered</span>
            <p className="text-2xl font-black text-gray-900">{data?.summary?.totalMembers || 0}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active In Matrix</span>
            <p className="text-2xl font-black text-emerald-600">{data?.summary?.activeMembers || 0}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Platform Revenue</span>
            <p className="text-2xl font-black text-blue-600">₹{data?.summary?.platformRevenue || 0}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Coverage States</span>
            <p className="text-2xl font-black text-purple-600">{data?.stateStats?.length || 0}</p>
          </div>
        </div>

        {/* State-wise Member Breakdown Table */}
        <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                State-Wise Member Breakdown
              </h2>
              <p className="text-xs text-gray-500">Auto-resolved from registration PIN codes</p>
            </div>
            <span className="text-xs font-bold text-gray-500 font-mono">
              {data?.stateStats?.length || 0} States
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="p-3">State</th>
                  <th className="p-3">Total Members</th>
                  <th className="p-3">Active (In Matrix)</th>
                  <th className="p-3">Verified KYC</th>
                  <th className="p-3">Paid ₹100 Platform Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(data?.stateStats || []).map((st) => (<tr key={st._id} className="hover:bg-gray-50/60 transition">
                    <td className="p-3 font-bold text-gray-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-500"/>
                      <span>{st._id}</span>
                    </td>
                    <td className="p-3 font-bold text-gray-800">{st.totalMembers}</td>
                    <td className="p-3 font-bold text-emerald-600">{st.activeMembers}</td>
                    <td className="p-3 font-bold text-blue-600">{st.verifiedKyc}</td>
                    <td className="p-3 font-bold text-purple-600">{st.paidPlatformFee}</td>
                  </tr>))}
              </tbody>
            </table>
          </div>
        </div>

        {/* District-wise Breakdown Grid */}
        <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">
              District Analytics Top Distribution
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(data?.districtStats || []).map((d, i) => (<div key={i} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-gray-900">{d._id.district}</span>
                  <span className="text-emerald-700">{d.activeMembers} Active</span>
                </div>
                <div className="text-[11px] text-gray-500">
                  {d._id.state} &bull; Total: {d.totalMembers} members
                </div>
              </div>))}
          </div>
        </div>
      </div>
    </DashboardLayout>);
}
