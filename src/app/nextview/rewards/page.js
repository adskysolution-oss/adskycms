'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Award, CheckCircle2, Wallet } from 'lucide-react';
import MlmMemberLayout from '@/components/features/mlm/MlmMemberLayout';
export default function NextViewRewardsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function loadRewards() {
            try {
                const res = await fetch('/api/mlm/rewards');
                const json = await res.json();
                if (json.success) {
                    setData(json.data);
                }
            }
            catch (e) {
                console.error('Error loading rewards:', e);
            }
            finally {
                setLoading(false);
            }
        }
        loadRewards();
    }, []);
    if (loading) {
        return (<MlmMemberLayout activePath="/nextview/rewards">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"/>
        </div>
      </MlmMemberLayout>);
    }
    const totalGenerated = data?.totalGeneratedRewards ?? data?.totalRewardsEarned ?? 0;
    const withdrawable = data?.withdrawableRewards ?? data?.totalRewards ?? 0;
    const locked = data?.lockedRewards ?? 0;
    const levelBreakdown = data?.levelBreakdown || {};
    const levelOccupancies = data?.levelOccupancies || [];
    const rewardsList = data?.rewards || [];
    return (<MlmMemberLayout activePath="/nextview/rewards">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <span>Level 1–15 Rewards Breakdown</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              15-tier deterministic network rewards generated from verified downline FD/FD-Card bookings.
            </p>
          </div>

          <Link href="/nextview/wallet" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold transition shadow-2xs">
            <Wallet className="w-4 h-4 text-amber-600"/>
            <span>Go to Wallet</span>
          </Link>
        </div>

        {/* ── 1. METRIC CARDS ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Withdrawable Rewards</span>
            <div className="text-2xl font-black text-emerald-600">₹{withdrawable.toLocaleString('en-IN')}</div>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5"/>
              <span>Available for payout</span>
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Locked Rewards</span>
            <div className="text-2xl font-black text-amber-700">₹{locked.toLocaleString('en-IN')}</div>
            <p className="text-[11px] text-slate-400">Unlocks upon level completion (3^L)</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Generated</span>
            <div className="text-2xl font-black text-slate-900">₹{totalGenerated.toLocaleString('en-IN')}</div>
            <p className="text-[11px] text-slate-400">All-time network earnings</p>
          </div>
        </div>

        {/* ── 2. LEVEL BREAKDOWN GRID (L1 - L15) ────────────────────────────── */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
              15-Tier Level Capacity &amp; Unlock Status
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Formula: 3^Level</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((levelNum) => {
            const capacity = Math.pow(3, levelNum);
            const occ = levelOccupancies.find((o) => o.level === levelNum);
            const placedCount = occ?.placedCount ?? occ?.filledCount ?? 0;
            const fdDoneCount = occ?.fdDoneCount ?? 0;
            const isPlacementComplete = occ?.isPlacementComplete ?? (placedCount >= capacity);
            const isComplete = occ?.isComplete ?? false; // both placed + fd done
            const lvlData = levelBreakdown[levelNum] || { total: 0, withdrawable: 0, locked: 0 };
            const placementPct = Math.min(100, Math.round((placedCount / capacity) * 100));
            const fdPct = Math.min(100, Math.round((fdDoneCount / capacity) * 100));
            return (<div key={levelNum} className={`border rounded-2xl p-4 transition space-y-2.5 ${isComplete
                    ? 'bg-emerald-50/50 border-emerald-300 shadow-2xs'
                    : isPlacementComplete
                        ? 'bg-amber-50/60 border-amber-300'
                        : lvlData.total > 0
                            ? 'bg-amber-50/30 border-amber-200'
                            : 'bg-slate-50 border-slate-200/80'}`}>
                  {/* Level Header */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs text-slate-900">
                      Level {levelNum}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${isComplete
                    ? 'bg-emerald-100 text-emerald-800'
                    : isPlacementComplete
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-700'}`}>
                      {isComplete
                    ? '✓ Complete'
                    : isPlacementComplete
                        ? `FD: ${fdDoneCount}/${capacity}`
                        : `${placedCount}/${capacity}`}
                    </span>
                  </div>

                  {/* Reward Amount */}
                  <div className="space-y-0.5">
                    <div className="text-lg font-black text-slate-900">
                      ₹{lvlData.total?.toLocaleString('en-IN') || 0}
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
                      <span>Withdrawable: <strong className="text-emerald-700">₹{lvlData.withdrawable || 0}</strong></span>
                      {lvlData.locked > 0 && (<span className="text-amber-700">Locked: ₹{lvlData.locked}</span>)}
                    </div>
                  </div>

                  {/* Placement Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                      <span>Placed</span>
                      <span>{placedCount}/{capacity}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${isPlacementComplete ? 'bg-amber-500' : 'bg-slate-400'}`} style={{ width: `${placementPct}%` }}/>
                    </div>
                  </div>

                  {/* FD Card Progress Bar (only show if at least 1 placed) */}
                  {placedCount > 0 && (<div className="space-y-1">
                      <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                        <span>FD Card Done</span>
                        <span>{fdDoneCount}/{capacity}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${isComplete ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${fdPct}%` }}/>
                      </div>
                    </div>)}
                </div>);
        })}
          </div>
        </div>

        {/* ── 3. REWARDS LEDGER TABLE ──────────────────────────────────────── */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
              Reward Credit Ledger
            </h3>
            <span className="text-xs text-slate-400 font-semibold">{rewardsList.length} events</span>
          </div>

          {rewardsList.length === 0 ? (<div className="text-center py-10 space-y-2">
              <Award className="w-8 h-8 text-slate-300 mx-auto"/>
              <p className="text-xs font-bold text-slate-500">No reward events recorded yet</p>
              <p className="text-[11px] text-slate-400">
                When downline members invest in verified FD products, your network level rewards will appear here.
              </p>
            </div>) : (<div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Network Level</th>
                    <th className="pb-3">Description</th>
                    <th className="pb-3">Reward Amount</th>
                    <th className="pb-3">Unlock Status</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {rewardsList.map((r) => {
                const isCompleted = r.status === 'completed';
                return (<tr key={r._id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 font-bold font-mono text-amber-700">L{r.level || 1}</td>
                        <td className="py-3.5 font-medium text-slate-800 max-w-sm truncate">
                          {r.description || 'Level Reward'}
                        </td>
                        <td className="py-3.5 font-black text-emerald-600 font-mono text-sm">
                          +₹{r.amount?.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                            {isCompleted ? 'Withdrawable' : 'Locked (Pending 3^L)'}
                          </span>
                        </td>
                        <td className="py-3.5 text-slate-400 font-mono text-[11px]">
                          {new Date(r.createdAt).toLocaleDateString('en-IN')}
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
