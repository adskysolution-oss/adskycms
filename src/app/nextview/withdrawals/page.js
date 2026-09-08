'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Building, Smartphone, CheckCircle2, AlertCircle, Clock, ShieldCheck, Receipt, Lock, Unlock } from 'lucide-react';
import MlmMemberLayout from '@/components/features/mlm/MlmMemberLayout';
export default function NextViewWithdrawalsPage() {
    const [wallet, setWallet] = useState(null);
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('BANK');
    const [bankDetails, setBankDetails] = useState({
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
    });
    const [upiId, setUpiId] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const loadData = async () => {
        setLoading(true);
        try {
            const [wRes, wdRes, kycRes] = await Promise.all([
                fetch('/api/mlm/wallet').then((r) => r.json()),
                fetch('/api/mlm/withdrawals').then((r) => r.json()),
                fetch('/api/mlm/kyc').then((r) => r.json()).catch(() => ({})),
            ]);
            if (wRes?.success) setWallet(wRes?.data?.wallet || wRes?.wallet || null);
            if (wdRes?.success) setWithdrawals(wdRes?.data?.withdrawals || wdRes?.withdrawals || []);
            const kycObj = kycRes?.data?.kyc || kycRes?.kyc;
            if (kycObj) {
                const bd = kycObj.bankDetails || {
                    accountHolderName: kycObj.accountHolderName || kycObj.fullName || '',
                    accountNumber: kycObj.bankAccountNumber || '',
                    ifscCode: kycObj.bankIfscCode || '',
                    bankName: kycObj.bankName || '',
                };
                setBankDetails(bd);
            }
        }
        catch {
            setFeedback({ type: 'error', message: 'Network error occurred while submitting withdrawal.' });
        }
        finally {
            setSubmitting(false);
        }
    };
    const minWithdrawal = wallet?.minWithdrawalAmount ?? 500;
    const availableBalance = wallet?.balance ?? 0;
    const lockedBalance = wallet?.pendingBalance ?? wallet?.lockedBalance ?? 0;
    const isEligible = availableBalance >= minWithdrawal;
    if (loading) {
        return (<MlmMemberLayout activePath="/nextview/withdrawals">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"/>
        </div>
      </MlmMemberLayout>);
    }
    return (<MlmMemberLayout activePath="/nextview/withdrawals">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Wallet Withdrawals</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Request bank transfers or UPI payouts from your withdrawable reward earnings.
            </p>
          </div>

          <Link href="/nextview/transactions" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold transition shadow-2xs">
            <Receipt className="w-4 h-4 text-slate-500"/>
            <span>Full Ledger</span>
          </Link>
        </div>

        {/* Global Alert */}
        {feedback && (<div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 ${feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {feedback.type === 'success' ? (<CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0"/>) : (<AlertCircle className="w-4 h-4 text-red-600 shrink-0"/>)}
            <span>{feedback.message}</span>
          </div>)}

        {/* ── CARD 1: BALANCE METRICS ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Withdrawable Balance</span>
            <div className="text-2xl font-black text-emerald-600">₹{availableBalance.toLocaleString('en-IN')}</div>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <Unlock className="w-3.5 h-3.5"/>
              <span>Ready for payout</span>
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Locked Rewards</span>
            <div className="text-2xl font-black text-amber-700">₹{lockedBalance.toLocaleString('en-IN')}</div>
            <p className="text-[11px] text-slate-500">Unlocks on level completion (3^L)</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Withdrawn</span>
            <div className="text-2xl font-black text-slate-900">₹{(wallet?.totalWithdrawn || 0).toLocaleString('en-IN')}</div>
            <p className="text-[11px] text-slate-500">Completed payouts</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Min. Payout Limit</span>
            <div className="text-2xl font-black text-slate-800">₹{minWithdrawal.toLocaleString('en-IN')}</div>
            <p className="text-[11px] text-slate-500">Per transaction minimum</p>
          </div>
        </div>

        {/* ── CARD 2: WITHDRAWAL FORM & INSTRUCTIONS ───────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Request Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-100">
              New Payout Request
            </h3>

            <form onSubmit={handleWithdraw} className="space-y-6">
              {/* Amount */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Withdrawal Amount (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-slate-400 font-bold">₹</span>
                  <input type="number" required min={minWithdrawal} max={availableBalance} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`Enter amount (min ₹${minWithdrawal})`} className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"/>
                </div>
                {!isEligible ? (<p className="mt-1 text-[11px] text-amber-700 font-medium">
                    You need at least ₹{minWithdrawal} withdrawable balance to request a payout.
                  </p>) : (<p className="mt-1 text-[11px] text-slate-500">
                    Max withdrawable: ₹{availableBalance.toLocaleString('en-IN')}
                  </p>)}
              </div>

              {/* Payment Mode Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Select Payout Method *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setPaymentMethod('BANK')} className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition ${paymentMethod === 'BANK'
            ? 'bg-amber-50/70 border-amber-400 text-amber-900 shadow-2xs'
            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                    <Building className="w-4 h-4 text-amber-600"/>
                    <span>Direct Bank Transfer</span>
                  </button>

                  <button type="button" onClick={() => setPaymentMethod('UPI')} className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition ${paymentMethod === 'UPI'
            ? 'bg-amber-50/70 border-amber-400 text-amber-900 shadow-2xs'
            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                    <Smartphone className="w-4 h-4 text-amber-600"/>
                    <span>Instant UPI ID</span>
                  </button>
                </div>
              </div>

              {/* Bank Details Inputs */}
              {paymentMethod === 'BANK' ? (<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Account Holder Name *</label>
                    <input type="text" required value={bankDetails.accountHolderName} onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })} placeholder="Name as per bank passbook" className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"/>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Account Number *</label>
                    <input type="password" required value={bankDetails.accountNumber} onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })} placeholder="Enter bank account number" className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-800"/>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">IFSC Code *</label>
                    <input type="text" required value={bankDetails.ifscCode} onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() })} placeholder="e.g. SBIN0001234" className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 uppercase"/>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Bank Name &amp; Branch</label>
                    <input type="text" value={bankDetails.bankName} onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })} placeholder="e.g. State Bank of India" className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"/>
                  </div>
                </div>) : (<div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Virtual Payment Address (UPI ID) *</label>
                  <input type="text" required value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="e.g. mobile@upi or username@okhdfcbank" className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"/>
                </div>)}

              <button type="submit" disabled={submitting || !isEligible || Number(amount) < minWithdrawal || Number(amount) > availableBalance} className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold transition shadow-md shadow-amber-500/25 disabled:opacity-50 inline-flex items-center justify-center gap-2">
                <ArrowUpRight className="w-4 h-4"/>
                <span>{submitting ? 'Submitting Request...' : 'Submit Withdrawal Request'}</span>
              </button>
            </form>
          </div>

          {/* Guidelines Sidebar */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100">
              Payout Guidelines
            </h4>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5"/>
                <span>KYC verification is mandatory prior to releasing withdrawals.</span>
              </div>
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5"/>
                <span>Level rewards unlock for withdrawal once their relative network tier capacity (3^L) is filled.</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5"/>
                <span>Standard bank transfer processing window is 24–48 working hours.</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── CARD 3: WITHDRAWAL HISTORY ──────────────────────────────────── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-100">
            Withdrawal Request History
          </h3>

          {withdrawals.length === 0 ? (<div className="text-center py-10 space-y-2">
              <p className="text-xs font-bold text-slate-500">No withdrawal requests found</p>
              <p className="text-[11px] text-slate-400">When you request a payout, status will show here.</p>
            </div>) : (<div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Code</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Method</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Requested At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {withdrawals.map((w) => (<tr key={w._id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 font-mono font-bold text-slate-900">{w.withdrawalCode || w._id.slice(-8)}</td>
                      <td className="py-3 font-black text-slate-900">₹{w.amount?.toLocaleString('en-IN')}</td>
                      <td className="py-3 font-semibold">{w.paymentMethod}</td>
                      <td className="py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${w.status === 'APPROVED' || w.status === 'COMPLETED'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : w.status === 'REJECTED'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500 font-mono text-[11px]">
                        {new Date(w.createdAt).toLocaleDateString('en-IN')}
                      </td>
                    </tr>))}
                </tbody>
              </table>
            </div>)}
        </div>
      </div>
    </MlmMemberLayout>);
}
