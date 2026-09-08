'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { Network, Users, ShieldCheck, Award, Wallet, IndianRupee, RefreshCw, ArrowRight, CheckCircle2, Layers, SlidersHorizontal, FileText, CreditCard, Sparkles, BarChart3 } from 'lucide-react';
export default function AdminMlmOverviewPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/mlm/dashboard');
            const data = await res.json();
            if (res.ok && data.success) {
                setStats(data.data);
            }
        }
        catch (e) {
            console.error('Error loading MLM dashboard stats:', e);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadData();
    }, []);
    return (<DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <Network className="w-5 h-5"/>
              </span>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                MLM &amp; FD Platform
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              Control Center &bull; Real-time network telemetry, 3×15 matrix analytics, and financial operations.
            </p>
          </div>

          <button onClick={loadData} disabled={loading} className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}/>
            <span>Refresh Telemetry</span>
          </button>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Members</span>
            <p className="text-2xl font-black text-gray-900">{stats?.totalMembers ?? stats?.members?.total ?? 0}</p>
            <div className="text-[10px] text-gray-500 flex items-center gap-1">
              <span>Registered in database</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Placed</span>
            <p className="text-2xl font-black text-emerald-600">{stats?.activeMembers ?? stats?.members?.active ?? 0}</p>
            <div className="text-[10px] text-emerald-700 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3 h-3"/>
              <span>In 3×15 Matrix</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pending KYC</span>
            <p className="text-2xl font-black text-amber-600">{stats?.pendingKyc ?? stats?.kyc?.pending ?? 0}</p>
            <div className="text-[10px] text-amber-700 font-semibold">
              <span>Under admin review</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Rewards</span>
            <p className="text-2xl font-black text-purple-600">₹{stats?.totalRewardsDistributed ?? stats?.rewards?.totalGenerated ?? 0}</p>
            <div className="text-[10px] text-purple-700 font-semibold">
              <span>Distributed to members</span>
            </div>
          </div>
        </div>

        {/* Secondary KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">FD Applications</span>
            <p className="text-xl font-black text-gray-900">{stats?.totalFdApplications ?? stats?.fdApplications?.total ?? 0}</p>
            <span className="text-[10px] text-gray-500">Customer FD referrals</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pending Withdrawals</span>
            <p className="text-xl font-black text-orange-600">{stats?.pendingWithdrawals ?? stats?.withdrawals?.pending ?? 0}</p>
            <span className="text-[10px] text-orange-700">Awaiting payout</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Platform Fees</span>
            <p className="text-xl font-black text-blue-600">₹{((stats?.activeMembers ?? stats?.members?.active ?? 0)) * 100}</p>
            <span className="text-[10px] text-blue-700">₹100 per activated member</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Matrix Structure</span>
            <p className="text-xl font-black text-gray-900">3 × 15</p>
            <span className="text-[10px] text-gray-500">Ternary spatial tree</span>
          </div>
        </div>

        {/* Pending Action Items Section */}
        <div className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-gray-700">
            Pending Operational Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-amber-600"/>
                  <span>KYC Verifications Pending</span>
                </div>
                <p className="text-xs text-amber-800">
                  {stats?.pendingKyc ?? stats?.kyc?.pending ?? 0} members submitted PAN, Aadhaar, and Bank details awaiting approval.
                </p>
              </div>
              <Link href="/admin/mlm/kyc" className="mt-4 inline-flex items-center justify-between px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm">
                <span>Review KYC Submissions</span>
                <ArrowRight className="w-3.5 h-3.5"/>
              </Link>
            </div>

            <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-blue-900 font-bold text-sm">
                  <Award className="w-4 h-4 text-blue-600"/>
                  <span>FD Referrals Pending</span>
                </div>
                <p className="text-xs text-blue-800">
                  Verify customer FD bookings to trigger Level 1–15 reward distribution.
                </p>
              </div>
              <Link href="/admin/mlm/fd" className="mt-4 inline-flex items-center justify-between px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm">
                <span>Inspect FD Applications</span>
                <ArrowRight className="w-3.5 h-3.5"/>
              </Link>
            </div>

            <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-4 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-orange-900 font-bold text-sm">
                  <Wallet className="w-4 h-4 text-orange-600"/>
                  <span>Withdrawal Requests</span>
                </div>
                <p className="text-xs text-orange-800">
                  {stats?.pendingWithdrawals ?? stats?.withdrawals?.pending ?? 0} member withdrawal requests awaiting bank / UPI payout.
                </p>
              </div>
              <Link href="/admin/mlm/withdrawals" className="mt-4 inline-flex items-center justify-between px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition shadow-sm">
                <span>Process Payouts</span>
                <ArrowRight className="w-3.5 h-3.5"/>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Module Navigation Grid */}
        <div className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-gray-700">
            MLM Management Modules
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
            { title: 'Members Directory', href: '/admin/mlm/members', icon: Users, desc: 'Search & filters' },
            { title: 'KYC Verification', href: '/admin/mlm/kyc', icon: ShieldCheck, desc: 'PAN, Aadhaar, Bank' },
            { title: 'FD Applications', href: '/admin/mlm/fd', icon: Award, desc: 'Customer FDs' },
            { title: '3×15 Matrix Tree', href: '/admin/mlm/matrix', icon: Layers, desc: 'Spatial inspector' },
            { title: 'Rewards Ledger', href: '/admin/mlm/rewards', icon: IndianRupee, desc: 'Level 1-15 rewards' },
            { title: 'Level Rules', href: '/admin/mlm/levels', icon: SlidersHorizontal, desc: 'Tiers 1-15 config' },
            { title: 'MLM Wallets', href: '/admin/mlm/wallet', icon: Wallet, desc: 'Financial balances' },
            { title: 'Withdrawals', href: '/admin/mlm/withdrawals', icon: IndianRupee, desc: 'Payout requests' },
            { title: 'Platform Payments', href: '/admin/mlm/payments', icon: CreditCard, desc: '₹100 fee orders' },
            { title: 'Reports & Analytics', href: '/admin/mlm/reports', icon: BarChart3, desc: 'State/District data' },
            { title: 'Training Materials', href: '/admin/mlm/training', icon: Sparkles, desc: 'Learning & banners' },
            { title: 'Audit Logs', href: '/admin/mlm/audit-logs', icon: FileText, desc: 'Immutable trail' },
        ].map((m) => {
            const Icon = m.icon;
            return (<Link key={m.href} href={m.href} className="p-4 rounded-2xl bg-white border border-gray-200/80 hover:border-amber-400 hover:shadow-md transition group text-left flex flex-col justify-between">
                  <div className="p-2 w-9 h-9 rounded-xl bg-gray-50 text-gray-700 group-hover:bg-amber-500 group-hover:text-white transition flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4"/>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 group-hover:text-amber-600 transition">
                      {m.title}
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">{m.desc}</p>
                  </div>
                </Link>);
        })}
          </div>
        </div>
      </div>
    </DashboardLayout>);
}
