'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownLeft, Receipt } from 'lucide-react';
import MlmMemberLayout from '@/components/features/mlm/MlmMemberLayout';
export default function NextViewWalletPage() {
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const loadWallet = async () => {
        try {
            const res = await fetch('/api/mlm/wallet');
            const data = await res.json();
            if (data.success) {
                setWallet(data.data.wallet);
                setTransactions(data.data.transactions || []);
            }
        }
        catch (e) {
            console.error('Error loading NextView wallet:', e);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadWallet();
    }, []);
    if (loading) {
        return (<MlmMemberLayout activePath="/nextview/wallet">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"/>
        </div>
      </MlmMemberLayout>);
    }
    const minWithdrawal = wallet?.minWithdrawalAmount ?? 500;
    const availableBalance = wallet?.balance ?? 0;
    return (<MlmMemberLayout activePath="/nextview/wallet">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <span>Rewards Wallet &amp; Ledger</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Secure ledger for tracking all incoming level rewards, direct incentives, and payout withdrawals.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/nextview/withdrawals" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold transition shadow-md shadow-amber-500/25">
              <ArrowUpRight className="w-4 h-4"/>
              <span>Withdraw Funds</span>
            </Link>

            <Link href="/nextview/transactions" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold transition shadow-2xs">
              <Receipt className="w-4 h-4 text-slate-500"/>
              <span>Full Ledger</span>
            </Link>
          </div>
        </div>

        {/* ── METRIC CARDS ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Available Balance</span>
            <div className="text-2xl font-black text-slate-900">₹{availableBalance.toLocaleString('en-IN')}</div>
            <p className="text-[11px] text-emerald-600 font-semibold">Available for withdrawal</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pending Rewards</span>
            <div className="text-2xl font-black text-amber-600">₹{(wallet?.pendingBalance || wallet?.pendingRewardBalance || 0).toLocaleString('en-IN')}</div>
            <p className="text-[11px] text-slate-400">Under level verification</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Rewards Earned</span>
            <div className="text-2xl font-black text-emerald-600">₹{(wallet?.lifetimeEarnings || wallet?.totalRewardEarned || 0).toLocaleString('en-IN')}</div>
            <p className="text-[11px] text-slate-400">All-time network earnings</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Withdrawn</span>
            <div className="text-2xl font-black text-slate-900">₹{(wallet?.totalWithdrawn || 0).toLocaleString('en-IN')}</div>
            <p className="text-[11px] text-slate-400">Processed payouts</p>
          </div>
        </div>

        {/* ── RECENT TRANSACTIONS TABLE ────────────────────────────────────── */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
              Recent Wallet Transactions
            </h3>
            <Link href="/nextview/transactions" className="text-xs font-bold text-amber-600 hover:text-amber-700">
              View All
            </Link>
          </div>

          {transactions.length === 0 ? (<div className="text-center py-10 space-y-2">
              <Receipt className="w-8 h-8 text-slate-300 mx-auto"/>
              <p className="text-xs font-bold text-slate-500">No transactions recorded yet</p>
              <p className="text-[11px] text-slate-400">When you receive level rewards or withdraw, they will be listed here.</p>
            </div>) : (<div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Description</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {transactions.slice(0, 10).map((t) => {
                const isCredit = t.type === 'credit' || t.direction === 'CREDIT';
                return (<tr key={t._id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 font-extrabold uppercase text-[11px]">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full ${isCredit
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {isCredit ? <ArrowDownLeft className="w-3 h-3"/> : <ArrowUpRight className="w-3 h-3"/>}
                            <span>{t.type || t.category}</span>
                          </span>
                        </td>
                        <td className="py-3 font-medium text-slate-800">{t.description || '—'}</td>
                        <td className={`py-3 font-black font-mono text-sm ${isCredit ? 'text-emerald-600' : 'text-red-600'}`}>
                          {isCredit ? '+' : '-'}₹{t.amount?.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${t.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3 text-slate-400 font-mono text-[11px]">
                          {new Date(t.createdAt).toLocaleDateString('en-IN')}
                        </td>
                      </tr>);
            })}
                </tbody>
              </table>
            </div>)}
        </div>
      </div>
    </MlmMemberLayout>);
}
