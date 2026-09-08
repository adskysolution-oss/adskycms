'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Receipt, ArrowUpRight, ArrowDownLeft, Search, ChevronLeft, ChevronRight, Wallet } from 'lucide-react';
import MlmMemberLayout from '@/components/features/mlm/MlmMemberLayout';
export default function NextViewTransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pages: 1 });
    const loadTransactions = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/mlm/wallet?page=${page}&limit=25`);
            const data = await res.json();
            if (data.success) {
                setTransactions(data?.data?.transactions || data?.transactions || []);
            const p = data?.data?.pagination || data?.pagination;
            if (p) setPagination(p);
            }
        }
        catch (e) {
            console.error('Error loading transactions:', e);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadTransactions();
    }, [page]);
    const filtered = transactions.filter((t) => {
        if (activeTab === 'REWARD' && t.type !== 'REWARD')
            return false;
        if (activeTab === 'WITHDRAWAL' && t.type !== 'WITHDRAWAL')
            return false;
        if (activeTab === 'CREDIT' && t.direction !== 'CREDIT')
            return false;
        if (activeTab === 'DEBIT' && t.direction !== 'DEBIT')
            return false;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const matchDesc = (t.description || '').toLowerCase().includes(q);
            const matchRef = (t.referenceId || '').toLowerCase().includes(q);
            const matchId = (t._id || '').toLowerCase().includes(q);
            return matchDesc || matchRef || matchId;
        }
        return true;
    });
    return (<MlmMemberLayout activePath="/nextview/transactions">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Wallet Transactions</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete financial ledger of rewards, referral payouts, and debits.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/nextview/wallet" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold transition shadow-2xs">
              <Wallet className="w-4 h-4 text-amber-600"/>
              <span>Wallet Overview</span>
            </Link>
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-2xl">
              {['ALL', 'REWARD', 'WITHDRAWAL', 'CREDIT', 'DEBIT'].map((tab) => (<button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${activeTab === tab
                ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                : 'text-slate-500 hover:text-slate-800'}`}>
                  {tab === 'ALL' ? 'All Activity' : tab}
                </button>))}
            </div>

            {/* Search input */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5"/>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search reference ID..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"/>
            </div>
          </div>

          {/* Ledger Table */}
          {loading ? (<div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"/>
            </div>) : filtered.length === 0 ? (<div className="text-center py-12 space-y-2">
              <Receipt className="w-8 h-8 text-slate-300 mx-auto"/>
              <p className="text-xs font-bold text-slate-500">No transactions match your filter</p>
              <p className="text-[11px] text-slate-400">All credited rewards and withdrawals will appear here.</p>
            </div>) : (<div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Description</th>
                    <th className="pb-3">Reference / Order</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Balance After</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filtered.map((t) => {
                const isCredit = t.direction === 'CREDIT';
                return (<tr key={t._id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                              {isCredit ? <ArrowDownLeft className="w-3.5 h-3.5"/> : <ArrowUpRight className="w-3.5 h-3.5"/>}
                            </div>
                            <span className="font-extrabold text-slate-900 uppercase text-[11px]">{t.type}</span>
                          </div>
                        </td>
                        <td className="py-3.5 text-slate-700 font-medium max-w-xs truncate">
                          {t.description || '—'}
                        </td>
                        <td className="py-3.5 font-mono text-[11px] font-bold text-slate-500">
                          {t.referenceId || t._id.slice(-8)}
                        </td>
                        <td className="py-3.5">
                          <span className={`font-black font-mono text-sm ${isCredit ? 'text-emerald-600' : 'text-red-600'}`}>
                            {isCredit ? '+' : '-'}₹{t.amount?.toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="py-3.5 font-mono text-slate-500">
                          ₹{t.balanceAfter?.toLocaleString('en-IN') ?? '—'}
                        </td>
                        <td className="py-3.5 text-slate-400 font-mono text-[11px]">
                          {new Date(t.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                        </td>
                      </tr>);
            })}
                </tbody>
              </table>
            </div>)}

          {/* Pagination Controls */}
          {pagination.pages > 1 && (<div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
              <span className="text-slate-400">
                Page {page} of {pagination.pages}
              </span>
              <div className="flex gap-2">
                <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40">
                  <ChevronLeft className="w-4 h-4"/>
                </button>
                <button type="button" disabled={page >= pagination.pages} onClick={() => setPage(page + 1)} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40">
                  <ChevronRight className="w-4 h-4"/>
                </button>
              </div>
            </div>)}
        </div>
      </div>
    </MlmMemberLayout>);
}
