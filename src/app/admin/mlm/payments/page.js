'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { CreditCard, Search, RefreshCw } from 'lucide-react';
export default function AdminMlmPaymentsPage() {
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [search, setSearch] = useState('');
    const loadPayments = async () => {
        setLoading(true);
        try {
            const url = selectedStatus !== 'ALL'
                ? `/api/admin/mlm/payments?status=${selectedStatus}`
                : '/api/admin/mlm/payments';
            const res = await fetch(url);
            const json = await res.json();
            if (res.ok && json.success) {
                setTransactions(json.data || []);
                setSummary(json.summary || null);
            }
        }
        catch (e) {
            console.error('Failed to load platform payments:', e);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadPayments();
    }, [selectedStatus]);
    const filtered = transactions.filter((t) => {
        const q = search.toLowerCase();
        return (!q ||
            t.userId?.fullName?.toLowerCase().includes(q) ||
            t.userId?.mlmCode?.toLowerCase().includes(q) ||
            t.orderId?.toLowerCase().includes(q) ||
            t.paymentId?.toLowerCase().includes(q));
    });
    return (<DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <CreditCard className="w-5 h-5"/>
              </span>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Platform Activation Payments
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Gateway verification records for the mandatory ₹100 platform activation charge.
            </p>
          </div>

          <button onClick={loadPayments} disabled={loading} className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}/>
            <span>Refresh</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Platform Fees</span>
            <p className="text-2xl font-black text-emerald-600">₹{summary?.totalCollected || 0}</p>
            <span className="text-[10px] text-gray-500">Collected via Cashfree / Gateway</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Paid Active Members</span>
            <p className="text-2xl font-black text-blue-600">{summary?.paidMembersCount || 0}</p>
            <span className="text-[10px] text-blue-700">Verified &amp; placed in matrix</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Payment Transactions</span>
            <p className="text-2xl font-black text-gray-900">{summary?.totalTransactions || transactions.length || 0}</p>
            <span className="text-[10px] text-gray-500">Total attempts &amp; successes</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400"/>
            <input type="text" placeholder="Search by member, Order ID, Payment ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"/>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-semibold focus:outline-none">
              <option value="ALL">All Payment Statuses</option>
              <option value="completed">Completed / Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
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
                  <th className="p-4">Member Info</th>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Payment Gateway ID</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (<tr>
                    <td colSpan={6} className="p-12 text-center text-gray-400">
                      No platform payment transactions found.
                    </td>
                  </tr>) : (filtered.map((t) => (<tr key={t._id} className="hover:bg-gray-50/60 transition">
                      <td className="p-4 font-bold text-gray-900">
                        <div>{t.userId?.fullName || 'Member'}</div>
                        <div className="text-[11px] font-normal text-gray-500">{t.userId?.mobile}</div>
                        <div className="font-mono text-[10px] text-amber-700">{t.userId?.mlmCode}</div>
                      </td>
                      <td className="p-4 font-mono font-bold text-gray-700 text-[11px]">
                        {t.orderId}
                      </td>
                      <td className="p-4 font-mono text-gray-600 text-[11px]">
                        {t.paymentId || '—'}
                      </td>
                      <td className="p-4 font-black text-gray-900 text-sm">
                        ₹{t.amount}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${t.status === 'completed'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : t.status === 'pending'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-red-50 text-red-700 border border-red-200'}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500">
                        {new Date(t.createdAt).toLocaleString('en-IN')}
                      </td>
                    </tr>)))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>);
}
