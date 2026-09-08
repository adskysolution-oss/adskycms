'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { Wallet, Search, RefreshCw, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
export default function AdminMlmWalletPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState('ALL');
    const [search, setSearch] = useState('');
    const loadData = async () => {
        setLoading(true);
        try {
            const url = selectedType !== 'ALL'
                ? `/api/admin/mlm/wallet?type=${selectedType}`
                : '/api/admin/mlm/wallet';
            const res = await fetch(url);
            const json = await res.json();
            if (res.ok && json.success) {
                setData(json.data);
            }
        }
        catch (e) {
            console.error('Failed to load MLM wallet data:', e);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadData();
    }, [selectedType]);
    const transactions = data?.transactions || [];
    const filtered = transactions.filter((tx) => {
        const q = search.toLowerCase();
        return (!q ||
            tx.memberId?.fullName?.toLowerCase().includes(q) ||
            tx.memberId?.mlmCode?.toLowerCase().includes(q) ||
            tx.description?.toLowerCase().includes(q) ||
            tx.referenceId?.toLowerCase().includes(q));
    });
    return (<DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <Wallet className="w-5 h-5"/>
              </span>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                MLM Wallets &amp; Financial Ledger
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Isolated MLM member earnings, commission balances, and double-entry transaction ledgers.
            </p>
          </div>

          <button onClick={loadData} disabled={loading} className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}/>
            <span>Refresh Ledger</span>
          </button>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Member Balances</span>
            <p className="text-2xl font-black text-emerald-600">₹{data?.summary?.totalBalance || 0}</p>
            <span className="text-[10px] text-gray-500">Currently held in wallets</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Lifetime Earned</span>
            <p className="text-2xl font-black text-purple-600">₹{data?.summary?.totalEarned || 0}</p>
            <span className="text-[10px] text-purple-700">All credited commissions</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Payouts Withdrawn</span>
            <p className="text-2xl font-black text-blue-600">₹{data?.summary?.totalWithdrawn || 0}</p>
            <span className="text-[10px] text-blue-700">Settled to bank accounts</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Wallets</span>
            <p className="text-2xl font-black text-gray-900">{data?.summary?.activeWallets || 0}</p>
            <span className="text-[10px] text-gray-500">Initialized MLM accounts</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400"/>
            <input type="text" placeholder="Search by member name, MLM code, reference..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"/>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-semibold focus:outline-none">
              <option value="ALL">All Transaction Types</option>
              <option value="CREDIT">Credits (Rewards)</option>
              <option value="DEBIT">Debits (Withdrawals)</option>
            </select>

            <span className="text-gray-500 font-bold text-xs pl-2">
              {filtered.length} entries
            </span>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider text-[10px] border-b border-gray-200 font-bold">
                <tr>
                  <th className="p-4">Member</th>
                  <th className="p-4">Transaction Type</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Balance After</th>
                  <th className="p-4">Description / Reference</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (<tr>
                    <td colSpan={6} className="p-12 text-center text-gray-400">
                      No wallet transactions found.
                    </td>
                  </tr>) : (filtered.map((tx) => (<tr key={tx._id} className="hover:bg-gray-50/60 transition">
                      <td className="p-4 font-bold text-gray-900">
                        <div>{tx.memberId?.fullName || 'Member'}</div>
                        <div className="font-mono text-[10px] text-amber-700">{tx.memberId?.mlmCode || '—'}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit ${tx.type === 'CREDIT'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'}`}>
                          {tx.type === 'CREDIT' ? (<ArrowDownLeft className="w-3 h-3"/>) : (<ArrowUpRight className="w-3 h-3"/>)}
                          <span>{tx.type}</span>
                        </span>
                      </td>
                      <td className={`p-4 font-black text-sm ${tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount}
                      </td>
                      <td className="p-4 font-mono font-bold text-gray-800">
                        ₹{tx.balanceAfter ?? '—'}
                      </td>
                      <td className="p-4 text-gray-600">
                        <div>{tx.description || 'Transaction'}</div>
                        {tx.referenceId && (<div className="text-[10px] font-mono text-gray-400">Ref: {tx.referenceId}</div>)}
                      </td>
                      <td className="p-4 text-gray-500">
                        {new Date(tx.createdAt).toLocaleString('en-IN')}
                      </td>
                    </tr>)))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>);
}
