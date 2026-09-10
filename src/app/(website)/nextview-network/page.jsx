'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import NexViaHeroBanner from '@/components/sections/NexViaHeroBanner';
import {
  ArrowRight,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Wallet,
  Network,
  Users,
  Award,
  Layers,
  CheckCircle2,
  Star,
  Sparkles,
  BadgeCheck,
  CreditCard,
  BarChart3,
  Gift,
  Car,
  Trophy,
  Zap,
  Info,
  Lock,
  Crown,
  Bike,
  Gem,
  Target,
} from 'lucide-react';

// ─── DATA ──────────────────────────────────────────────────────────────────

const LEVEL_INCOME = [
  { level: 1,  members: 3,        income: '₹600',          incomeNum: 600,         rewardPerFd: 200, label: 'L1', highlight: true },
  { level: 2,  members: 9,        income: '₹630',          incomeNum: 630,         rewardPerFd: 70,  label: 'L2' },
  { level: 3,  members: 27,       income: '₹1,485',        incomeNum: 1485,        rewardPerFd: 55,  label: 'L3' },
  { level: 4,  members: 81,       income: '₹3,645',        incomeNum: 3645,        rewardPerFd: 45,  label: 'L4' },
  { level: 5,  members: 243,      income: '₹9,720',        incomeNum: 9720,        rewardPerFd: 40,  label: 'L5' },
  { level: 6,  members: 729,      income: '₹25,515',       incomeNum: 25515,       rewardPerFd: 35,  label: 'L6' },
  { level: 7,  members: 2187,     income: '₹65,610',       incomeNum: 65610,       rewardPerFd: 30,  label: 'L7' },
  { level: 8,  members: 6561,     income: '₹1,64,025',     incomeNum: 164025,      rewardPerFd: 25,  label: 'L8' },
  { level: 9,  members: 19683,    income: '₹4,33,026',     incomeNum: 433026,      rewardPerFd: 22,  label: 'L9' },
  { level: 10, members: 59049,    income: '₹11,80,980',    incomeNum: 1180980,     rewardPerFd: 20,  label: 'L10' },
  { level: 11, members: 177147,   income: '₹26,57,205',    incomeNum: 2657205,     rewardPerFd: 15,  label: 'L11' },
  { level: 12, members: 531441,   income: '₹69,08,733',    incomeNum: 6908733,     rewardPerFd: 13,  label: 'L12' },
  { level: 13, members: 1594323,  income: '₹1,75,37,553',  incomeNum: 17537553,    rewardPerFd: 11,  label: 'L13' },
  { level: 14, members: 4782969,  income: '₹4,78,29,690',  incomeNum: 47829690,    rewardPerFd: 10,  label: 'L14' },
  { level: 15, members: 14348907, income: '₹12,91,40,163', incomeNum: 129140163,  rewardPerFd: 9,   label: 'L15', premium: true },
];

const ACHIEVEMENT_REWARDS = [
  { level: 1,  code: 'L1',  bonus: '300',           cash: '₹300',           extra: null,                         icon: '🎯' },
  { level: 2,  code: 'L2',  bonus: '900',           cash: '₹900',           extra: null,                         icon: '⭐' },
  { level: 3,  code: 'L3',  bonus: '2,100',         cash: '₹2,100',         extra: null,                         icon: '🌟' },
  { level: 4,  code: 'L4',  bonus: '5,100',         cash: '₹5,100',         extra: null,                         icon: '💎' },
  { level: 5,  code: 'L5',  bonus: '11,111',        cash: '₹11,111',        extra: null,                         icon: '🏆' },
  { level: 6,  code: 'L6',  bonus: '31,111',        cash: '₹31,111',        extra: null,                         icon: '🥇' },
  { level: 7,  code: 'L7',  bonus: '1,11,111',      cash: '₹1,11,111',      extra: null,                         icon: '🚀' },
  { level: 8,  code: 'L8',  bonus: '2,11,111',      cash: '₹2,11,111',      extra: 'Pulsar Bike',                icon: '🏍️', vehicleType: 'bike' },
  { level: 9,  code: 'L9',  bonus: '5,11,111',      cash: '₹5,11,111',      extra: 'Royal Enfield 350 / Bullet', icon: '🏍️', vehicleType: 'bike' },
  { level: 10, code: 'L10', bonus: '11,11,111',     cash: '₹11,11,111',     extra: 'Creta',                      icon: '🚗', vehicleType: 'car' },
  { level: 11, code: 'L11', bonus: '51,51,111',     cash: '₹51,51,111',     extra: 'SUV Car',                    icon: '🚙', vehicleType: 'car' },
  { level: 12, code: 'L12', bonus: '1,11,11,111',   cash: '₹1,11,11,111',   extra: 'Fortuner',                   icon: '🚙', vehicleType: 'car' },
  { level: 13, code: 'L13', bonus: '2,11,11,111',   cash: '₹2,11,11,111',   extra: 'Toyota SUV',                 icon: '🚙', vehicleType: 'car' },
  { level: 14, code: 'L14', bonus: '5,11,11,111',   cash: '₹5,11,11,111',   extra: 'Mercedes',                   icon: '🏎️', vehicleType: 'luxury' },
  { level: 15, code: 'L15', bonus: '11,11,11,111',  cash: '₹11,11,11,111',  extra: 'Land Rover Defender',        icon: '👑', vehicleType: 'defender', premium: true },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Register', desc: 'Complete your NexVia member registration online with your basic details.', icon: Users },
  { step: '02', title: 'Verification', desc: 'Submit KYC documents. Your profile is reviewed and approved by the team.', icon: BadgeCheck },
  { step: '03', title: 'Applicable FD Activation', desc: 'Activate your ₹2,000 Fixed Deposit with our verified financial partner.', icon: CreditCard },
  { step: '04', title: 'Network Placement', desc: 'You are placed in the 3×15 matrix using a fair Breadth-First Search algorithm.', icon: Network },
  { step: '05', title: 'Level Completion', desc: 'As your downline grows and FDs activate, level rewards are unlocked automatically.', icon: BarChart3 },
  { step: '06', title: 'Reward / Wallet', desc: 'Receive rewards in your NexVia wallet. Withdraw to Bank or UPI instantly.', icon: Wallet },
];

const WHY_NEXVIA = [
  { icon: Layers, title: 'Structured System', desc: 'A deterministic 3×15 BFS matrix ensures fair, transparent placement — no favoritism, no manipulation.' },
  { icon: Zap, title: 'Digital Platform', desc: 'Fully online — registration, KYC, FD activation, network tracking, wallet, and withdrawals, all in one portal.' },
  { icon: Gift, title: 'Achievement Rewards', desc: 'Beyond level income, unlock special cash bonuses and physical rewards at each milestone level.' },
  { icon: Users, title: 'Team Growth', desc: 'Every member benefits from collective network growth. When your team succeeds, your rewards unlock automatically.' },
];

const MATRIX_JOURNEY = [
  { label: 'YOU', value: 1, level: 0 },
  { label: 'L1', value: 3, level: 1 },
  { label: 'L2', value: 9, level: 2 },
  { label: 'L3', value: 27, level: 3 },
  { label: 'L4', value: 81, level: 4 },
  { label: 'L5', value: 243, level: 5 },
  { label: 'L6', value: 729, level: 6 },
  { label: 'L7', value: '2,187', level: 7 },
  { label: 'L8', value: '6,561', level: 8 },
  { label: 'L9', value: '19,683', level: 9 },
  { label: 'L10', value: '59,049', level: 10 },
  { label: 'L11', value: '1,77,147', level: 11 },
  { label: 'L12', value: '5,31,441', level: 12 },
  { label: 'L13', value: '15,94,323', level: 13 },
  { label: 'L14', value: '47,82,969', level: 14 },
  { label: 'L15', value: '1,43,48,907', level: 15 },
];

// ─── TELEMETRY HELPER ────────────────────────────────────────────────────

function getMatrixTelemetry(matrixData) {
  const levelOccupancies = matrixData?.levelOccupancies || [];
  const downlineMembers = matrixData?.downlineMembers || [];
  const directChildren = matrixData?.directChildren || [];
  const member = matrixData?.member || null;

  // Active level: first level not yet complete
  const firstIncomplete = levelOccupancies.find((l) => !l.isComplete);
  const activeLevel = firstIncomplete?.level ?? 1;

  const levelStats = LEVEL_INCOME.map((lvl) => {
    const occ = levelOccupancies.find((o) => o.level === lvl.level);
    const capacity = lvl.members;
    const filledCount = occ?.filledCount ?? occ?.placedCount ?? 0;
    const isComplete = Boolean(occ?.isComplete || (occ && occ.filledCount >= capacity));
    const isActive = lvl.level === activeLevel && !isComplete;
    const isLocked = lvl.level > activeLevel && !isComplete;
    const progressPct = capacity > 0 ? Math.min(100, Math.round((filledCount / capacity) * 100)) : 0;

    return {
      ...lvl,
      capacity,
      filledCount,
      isComplete,
      isActive,
      isLocked,
      progressPct,
    };
  });

  return {
    member,
    directChildren,
    downlineMembers,
    levelOccupancies,
    activeLevel,
    levelStats,
  };
}

// ─── LEVEL INCOME SECTION — YOUR JOURNEY TO L15 ──────────────────────────

function LevelIncomeSection({ matrixData }) {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const { levelStats, activeLevel } = getMatrixTelemetry(matrixData);

  return (
    <section className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-blue-600">
            <TrendingUp size={13} />
            <span>3×15 Matrix Rewards</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Your Journey to L15
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Follow your progression through all 15 matrix levels. Each tier unlocks its total reward potential upon verified completion of all node positions with active applicable FD.
          </p>
        </div>

        {/* Matrix telemetry summary chips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto mb-8">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total 15-Level Potential</div>
            <div className="text-lg font-black text-slate-900">₹20,59,58,380</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Matrix Capacity</div>
            <div className="text-lg font-black text-blue-700">14,348,907 Peak</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
            <div className="text-[10px] font-black uppercase tracking-wider text-amber-700">Current Target</div>
            <div className="text-lg font-black text-amber-600">Level {activeLevel} Active</div>
          </div>
        </div>

        {/* ── SEQUENTIAL L1 → L15 JOURNEY LIST ── */}
        <div className="max-w-3xl mx-auto space-y-2.5">
          {levelStats.map((l) => {
            const isSelected = selectedLevel === l.level;
            const barWidth = Math.max(l.filledCount > 0 ? 3 : 0, l.progressPct);

            return (
              <div
                key={l.level}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  l.premium
                    ? 'bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 border-blue-700 text-white shadow-md'
                    : l.isActive
                    ? 'bg-amber-50/70 border-amber-300 shadow-sm ring-2 ring-amber-400/20'
                    : l.isComplete
                    ? 'bg-emerald-50/50 border-emerald-300 shadow-xs'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
                }`}
              >
                <button
                  onClick={() => setSelectedLevel(isSelected ? null : l.level)}
                  className="w-full p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left cursor-pointer"
                >
                  {/* Left: Level badge + income */}
                  <div className="flex items-center gap-3.5 min-w-[200px]">
                    <div
                      className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 border ${
                        l.premium
                          ? 'bg-blue-800 border-blue-600 text-amber-400 shadow-sm'
                          : l.isActive
                          ? 'bg-amber-500 border-amber-400 text-white shadow-sm'
                          : l.isComplete
                          ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                          : 'bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      <span className="text-[8px] font-black uppercase tracking-wider leading-none opacity-80">
                        {l.premium ? '👑' : 'LVL'}
                      </span>
                      <span className="text-base font-black leading-tight">L{l.level}</span>
                    </div>

                    <div>
                      <div
                        className={`text-[10px] font-black uppercase tracking-wider mb-0.5 ${
                          l.premium ? 'text-blue-300' : l.isActive ? 'text-amber-800' : 'text-slate-400'
                        }`}
                      >
                        Total Level Potential
                      </div>
                      <div
                        className={`text-lg sm:text-xl font-black leading-tight ${
                          l.premium ? 'text-amber-400' : l.isActive ? 'text-slate-900' : 'text-slate-900'
                        }`}
                      >
                        {l.income}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Progress bar + actual/capacity count */}
                  <div className="flex-1 sm:max-w-xs space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className={l.premium ? 'text-blue-200' : 'text-slate-500'}>
                        Capacity: {l.capacity.toLocaleString('en-IN')}
                      </span>
                      <span
                        className={`font-mono text-xs ${
                          l.premium
                            ? 'text-white'
                            : l.isActive
                            ? 'text-amber-800'
                            : l.isComplete
                            ? 'text-emerald-700'
                            : 'text-slate-700'
                        }`}
                      >
                        {l.filledCount.toLocaleString('en-IN')} / {l.capacity.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div
                      className={`h-2 rounded-full overflow-hidden ${
                        l.premium ? 'bg-blue-900/80 border border-blue-700/50' : 'bg-slate-100'
                      }`}
                    >
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          l.premium
                            ? 'bg-gradient-to-r from-amber-400 to-amber-300'
                            : l.isComplete
                            ? 'bg-emerald-500'
                            : l.isActive
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>

                  {/* Right: Status Pill */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                    {l.isComplete ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs font-black uppercase tracking-wider">
                        <CheckCircle2 size={12} className="text-emerald-600" />
                        Complete
                      </span>
                    ) : l.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 text-xs font-black uppercase tracking-wider">
                        <Sparkles size={12} className="text-amber-600" />
                        Active Target
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <Lock size={11} className="text-slate-400" />
                        Locked
                      </span>
                    )}
                    <span
                      className={`text-xs transition-transform duration-200 ${
                        isSelected ? 'rotate-90 text-blue-600' : 'text-slate-400'
                      }`}
                    >
                      <ChevronRight size={16} />
                    </span>
                  </div>
                </button>

                {/* Expanded level details */}
                {isSelected && (
                  <div
                    className={`p-4 sm:p-5 border-t text-xs space-y-3 ${
                      l.premium
                        ? 'bg-blue-900/60 border-blue-800 text-blue-100'
                        : 'bg-slate-50/80 border-slate-200 text-slate-600'
                    }`}
                  >
                  <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
                      <div>
                        <div className="font-bold uppercase tracking-wider text-[10px] text-slate-400">
                          Remaining to Complete
                        </div>
                        <div className={`text-sm font-black ${l.premium ? 'text-amber-400' : 'text-blue-700'}`}>
                          {Math.max(0, l.capacity - l.filledCount).toLocaleString('en-IN')} positions
                        </div>
                      </div>
                    </div>
                    <p className={`text-[11px] leading-relaxed pt-1 border-t ${l.premium ? 'border-blue-800 text-blue-200' : 'border-slate-200 text-slate-500'}`}>
                      Level rewards unlock when all {l.capacity.toLocaleString('en-IN')} node positions at Level {l.level} are filled in your matrix and their respective applicable Fixed Deposits (FD/FD-Card) are activated and verified.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-slate-400 mt-8 max-w-xl mx-auto">
          * Stated rewards represent maximum level potential under the 3×15 matrix. Unlocking requires complete level occupancy and verified FD activations as per financial partner terms.
        </p>
      </div>
    </section>
  );
}



// ─── ACHIEVEMENT REWARDS SECTION ──────────────────────────────────────────

const MILESTONE_ICONS = {
  1: Target,
  2: Star,
  3: Sparkles,
  4: Gem,
  5: Award,
  6: Trophy,
  7: Zap,
  8: Bike,
  9: Bike,
  10: Car,
  11: Car,
  12: Car,
  13: Car,
  14: Car,
  15: Crown,
};

function AchievementSection() {
  const [viewMode, setViewMode] = useState('table'); // 'table' (default, matches official reference) | 'grid'

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-slate-50/90 via-white to-slate-50/70 border-b border-slate-200/80">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2.5">
          <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#0B3B95] bg-blue-50 border border-blue-200/80 px-3 py-1 rounded-full">
            <Trophy size={13} className="text-amber-500" />
            <span>Achievement Rewards</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Milestone Rewards at Every Level
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Milestone completion unlocks applicable cash bonuses and physical achievement rewards at each level tier.
          </p>

          {/* View Toggle */}
          <div className="pt-2 flex items-center justify-center">
            <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'table'
                    ? 'bg-[#0B3B95] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>📊 Table View</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-medium">Official</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-[#0B3B95] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🎴 Cards View</span>
              </button>
            </div>
          </div>
        </div>

        {/* ─── TABLE VIEW (Exact layout matching official reference) ─── */}
        {viewMode === 'table' ? (
          <div className="max-w-3xl mx-auto rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-blue-400/50 shadow-2xl bg-white">
            {/* Top Blue Header Banner */}
            <div className="bg-[#0B3B95] px-4 py-4 sm:py-5 flex items-center justify-center gap-3 sm:gap-4 relative text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center shrink-0 shadow-inner">
                <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-amber-300 fill-amber-300/30 drop-shadow-xs" />
              </div>
              <div>
                <h3 className="text-lg sm:text-2xl md:text-2xl font-black uppercase tracking-wider text-white">
                  LEVEL-WISE ACHIEVEMENT REWARDS
                </h3>
                <p className="text-blue-200 text-xs sm:text-sm font-semibold tracking-wide mt-0.5">
                  (प्रति लेवल बोनस)
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[520px]">
                <thead>
                  <tr className="bg-[#D7E9FD] text-[#0B3B95] font-black text-xs sm:text-sm border-b border-blue-200">
                    <th className="py-3 px-4 sm:px-6 text-center w-24 sm:w-28 font-black uppercase tracking-wide">
                      Level
                    </th>
                    <th className="py-3 px-4 sm:px-6 text-center w-48 sm:w-56 font-black uppercase tracking-wide">
                      Achievement Bonus (₹)
                    </th>
                    <th className="py-3 px-4 sm:px-6 text-left font-black uppercase tracking-wide">
                      Additional Reward
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100/70 text-xs sm:text-sm">
                  {ACHIEVEMENT_REWARDS.map((r) => {
                    const isYellowHighlight = r.level === 1;
                    const isPhysical = Boolean(r.extra);
                    const isPinnacle = Boolean(r.premium);

                    return (
                      <tr
                        key={r.level}
                        className={`transition-colors duration-150 ${
                          isYellowHighlight
                            ? 'bg-[#FEF9C3] hover:bg-[#FEF08A]/80 font-bold'
                            : isPinnacle
                            ? 'bg-blue-50/50 hover:bg-blue-100/60 font-bold'
                            : r.level % 2 === 0
                            ? 'bg-[#F9FBFF] hover:bg-blue-50/50'
                            : 'bg-white hover:bg-blue-50/50'
                        }`}
                      >
                        {/* Level Code (L1 - L15) */}
                        <td className="py-2.5 sm:py-3 px-4 sm:px-6 text-center font-black text-[#0B3B95]">
                          {r.code}
                        </td>

                        {/* Achievement Bonus (₹) */}
                        <td className="py-2.5 sm:py-3 px-4 sm:px-6 text-center font-black text-[#0B3B95] tracking-tight">
                          {r.bonus}
                        </td>

                        {/* Additional Reward */}
                        <td className="py-2.5 sm:py-3 px-4 sm:px-6 text-left">
                          {isPhysical ? (
                            <div className="flex items-center justify-between gap-2 pr-2">
                              <span className="font-extrabold text-[#0B3B95] tracking-tight text-xs sm:text-sm">
                                {r.extra}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 border ${
                                  isPinnacle
                                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-blue-950 border-amber-300 shadow-xs'
                                    : r.vehicleType === 'bike'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : r.vehicleType === 'luxury'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                }`}
                              >
                                {isPinnacle ? (
                                  <>
                                    <Crown size={12} className="text-blue-950" />
                                    <span>Pinnacle Reward</span>
                                  </>
                                ) : r.vehicleType === 'bike' ? (
                                  <>
                                    <Bike size={12} className="text-amber-700" />
                                    <span>Motorbike</span>
                                  </>
                                ) : (
                                  <>
                                    <Car size={12} className="text-blue-700" />
                                    <span>Vehicle</span>
                                  </>
                                )}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-bold block text-center sm:text-left sm:pl-2">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ─── 15-CARD GRID VIEW (Alternative view) ─── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {ACHIEVEMENT_REWARDS.map((r) => {
              const IconComp = MILESTONE_ICONS[r.level] || Trophy;
              const isPhysical = Boolean(r.extra);
              const isPinnacle = Boolean(r.premium);

              return (
                <div
                  key={r.level}
                  className={`relative flex flex-col justify-between h-full p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                    isPinnacle
                      ? 'bg-gradient-to-b from-blue-950 via-blue-900 to-slate-900 border-2 border-amber-400 text-white shadow-lg'
                      : isPhysical
                      ? 'bg-gradient-to-b from-amber-50/40 via-white to-white border-amber-300/80 shadow-xs hover:border-amber-400'
                      : 'bg-white border-slate-200/90 shadow-2xs hover:border-slate-300'
                  }`}
                >
                  {isPinnacle && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-blue-950 text-[9px] font-black uppercase tracking-wider rounded-full shadow-sm">
                      PINNACLE
                    </div>
                  )}

                  {/* Card Header: Level Badge & Professional Icon */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        isPinnacle
                          ? 'bg-blue-800/80 text-amber-300 border border-blue-700/60'
                          : isPhysical
                          ? 'bg-amber-100/70 text-amber-900 border border-amber-200/70'
                          : 'bg-slate-100 text-slate-700 border border-slate-200/60'
                      }`}
                    >
                      Level {r.level}
                    </span>

                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                        isPinnacle
                          ? 'bg-amber-400/20 border-amber-400/40 text-amber-300'
                          : isPhysical
                          ? 'bg-amber-50 border border-amber-200 text-amber-600'
                          : 'bg-blue-50/80 border border-blue-100 text-blue-600'
                      }`}
                    >
                      <IconComp size={15} />
                    </div>
                  </div>

                  {/* Card Body: Cash Reward */}
                  <div className="space-y-0.5 my-auto">
                    <div
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        isPinnacle ? 'text-blue-300' : 'text-slate-400'
                      }`}
                    >
                      Cash Reward
                    </div>
                    <div
                      className={`text-lg sm:text-xl font-black tracking-tight leading-snug ${
                        isPinnacle ? 'text-amber-400' : 'text-slate-900'
                      }`}
                    >
                      {r.cash}
                    </div>
                  </div>

                  {/* Card Footer: Physical Achievement Reward or Cash Bonus Tag */}
                  {isPhysical ? (
                    <div
                      className={`mt-3 pt-2.5 border-t flex items-center gap-1.5 text-xs font-bold ${
                        isPinnacle
                          ? 'border-blue-800/80 text-amber-300'
                          : 'border-amber-200/70 text-amber-800'
                      }`}
                    >
                      <IconComp size={13} className={isPinnacle ? 'text-amber-400 shrink-0' : 'text-amber-600 shrink-0'} />
                      <span className="truncate">{r.extra}</span>
                    </div>
                  ) : (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                      <CheckCircle2 size={12} className="text-slate-300 shrink-0" />
                      <span>Cash Milestone</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Note Footer */}
        <div className="mt-8 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 max-w-3xl mx-auto">
          <p className="text-xs text-amber-800 leading-relaxed text-center">
            <strong>Note:</strong> Milestone rewards are unlocked upon verified network completion of applicable criteria at each level. Physical rewards (vehicles etc.) are subject to verified eligibility, availability, and financial partner terms.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── MATRIX JOURNEY SECTION — 3×15 VISUAL TREE ───────────────────────────

function MatrixJourneySection({ matrixData }) {
  const [activeInspector, setActiveInspector] = useState(null);
  const { member, directChildren, downlineMembers, levelStats } = getMatrixTelemetry(matrixData);

  const l1Stats = levelStats[0];
  const l2Stats = levelStats[1];
  const l3Stats = levelStats[2];

  // L1 3 positions
  const l1Positions = [0, 1, 2].map((idx) => {
    const child = directChildren[idx] || null;
    return {
      index: idx,
      positionLabel: `L1.${idx + 1}`,
      isFilled: Boolean(child),
      member: child,
      name: child?.fullName || child?.memberId?.fullName || null,
      code: child?.mlmCode || child?.memberId?.mlmCode || null,
      fdStatus: child?.memberId?.fdCard?.status || child?.fdCard?.status || null,
    };
  });

  // L2 9 positions organized into 3 triads (one triad under each L1 node)
  const l2Members = downlineMembers.filter((m) => m.relativeLevel === 2);
  const l2Triads = [0, 1, 2].map((parentIdx) => {
    const parentNode = l1Positions[parentIdx];
    const slots = [0, 1, 2].map((slotIdx) => {
      const globalSlot = parentIdx * 3 + slotIdx + 1;
      const matched = l2Members[globalSlot - 1] || null;
      return {
        parentIdx,
        slotIdx,
        globalSlot,
        positionLabel: `L2.${parentIdx + 1}.${slotIdx + 1}`,
        isFilled: Boolean(matched),
        member: matched,
        name: matched?.fullName || null,
        code: matched?.mlmCode || null,
      };
    });
    return { parentIdx, parentNode, slots };
  });

  // L3 27 positions organized into 9 triads across 3 branches
  const l3Members = downlineMembers.filter((m) => m.relativeLevel === 3);
  const l3Branches = [0, 1, 2].map((branchIdx) => {
    const triads = [0, 1, 2].map((subIdx) => {
      const triadIdx = branchIdx * 3 + subIdx;
      const slots = [0, 1, 2].map((slotIdx) => {
        const globalSlot = triadIdx * 3 + slotIdx + 1;
        const matched = l3Members[globalSlot - 1] || null;
        return {
          triadIdx,
          slotIdx,
          globalSlot,
          positionLabel: `L3.${globalSlot}`,
          isFilled: Boolean(matched),
          member: matched,
          name: matched?.fullName || null,
          code: matched?.mlmCode || null,
        };
      });
      return { triadIdx, slots };
    });
    return { branchIdx, triads };
  });

  return (
    <section className="py-16 sm:py-20 bg-slate-50/70 border-b border-slate-200/80">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-blue-600">
            <Network size={13} />
            <span>Structured 3-Child Branching</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Your Network Grows Exponentially
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Every position anchors a maximum of 3 direct children. Levels 1 to 3 render your interactive visual hierarchy, cascading into compact horizontal tiers down to Level 15.
          </p>
        </div>

        {/* Tree Container with responsive horizontal scroll protection */}
        <div className="max-w-5xl mx-auto overflow-x-auto pb-4">
          <div className="min-w-[700px] flex flex-col items-center">

            {/* ── ROOT NODE (YOU) ── */}
            <div className="flex flex-col items-center">
              <button
                onClick={() =>
                  setActiveInspector({
                    type: 'ROOT',
                    title: member?.fullName ? `${member.fullName} (${member.mlmCode || 'Root'})` : 'Root Anchor (You)',
                    subtitle: 'Matrix Root Position',
                    capacity: 1,
                    filled: 1,
                    desc: 'Your root position anchors the entire 3×15 ternary referral matrix.',
                  })
                }
                className="group relative flex flex-col items-center p-3.5 rounded-2xl bg-gradient-to-b from-blue-950 via-blue-900 to-blue-800 text-white border-2 border-blue-500 shadow-xl hover:scale-105 transition-all cursor-pointer text-center min-w-[160px]"
              >
                <div className="w-8 h-8 rounded-full bg-blue-700/80 border border-blue-400 flex items-center justify-center mb-1.5 shadow-inner">
                  <Users size={15} className="text-white" />
                </div>
                <div className="text-[9px] font-black uppercase tracking-wider text-blue-300">ROOT NODE</div>
                <div className="text-sm font-black text-white truncate max-w-[150px]">
                  {member?.fullName || 'YOU (Root)'}
                </div>
                <div className="text-[10px] text-blue-200/80 font-mono">1 Position</div>
              </button>

              {/* Vertical trunk to L1 */}
              <div className="w-0.5 h-6 bg-blue-300/80" />
            </div>

            {/* ── LEVEL 1 (Capacity 3) ── */}
            <div className="w-full flex flex-col items-center">
              {/* Level 1 Header Banner */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-900 text-xs font-black uppercase tracking-wider mb-2">
                <span>Level 1</span>
                <span className="w-1 h-1 rounded-full bg-blue-400" />
                <span className="text-blue-700">Total Potential: ₹600</span>
                <span className="w-1 h-1 rounded-full bg-blue-400" />
                <span className="font-mono text-[11px] text-blue-600 font-bold">
                  {l1Stats.filledCount} / 3 nodes
                </span>
              </div>

              {/* Connector split to 3 nodes */}
              <div className="relative w-[70%] h-4">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-300/80 rounded-full" />
                <div className="absolute top-0 left-0 w-0.5 h-4 bg-blue-300/80" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-blue-300/80" />
                <div className="absolute top-0 right-0 w-0.5 h-4 bg-blue-300/80" />
              </div>

              {/* 3 Positions */}
              <div className="w-[70%] flex justify-between gap-3">
                {l1Positions.map((pos) => (
                  <button
                    key={pos.index}
                    onClick={() =>
                      setActiveInspector({
                        type: 'L1',
                        title: `Level 1 — Position ${pos.index + 1}`,
                        subtitle: pos.isFilled ? `Occupied: ${pos.name || pos.code || 'Active Member'}` : 'Available Slot',
                        capacity: 3,
                        filled: l1Stats.filledCount,
                        potential: '₹600 Total Level Potential',
                        desc: pos.isFilled
                          ? `Placed under your direct root. FD Status: ${pos.fdStatus || 'Standard'}`
                          : 'Open position ready for direct placement or BFS spillover.',
                      })
                    }
                    className={`flex-1 p-3 rounded-2xl border transition-all text-center cursor-pointer hover:shadow-md ${
                      pos.isFilled
                        ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-xs'
                        : 'bg-white border-2 border-dashed border-slate-300 text-slate-500 hover:border-blue-400'
                    }`}
                  >
                    <div className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
                      {pos.positionLabel}
                    </div>
                    <div className="text-xs font-black truncate">
                      {pos.isFilled ? pos.name || pos.code || 'Active Member' : 'Available Slot'}
                    </div>
                    <div className={`text-[10px] font-bold mt-1 ${pos.isFilled ? 'text-blue-700' : 'text-slate-400'}`}>
                      {pos.isFilled ? 'Active Placed' : 'Empty Position'}
                    </div>
                  </button>
                ))}
              </div>

              {/* Vertical drops from each L1 node to L2 */}
              <div className="w-[70%] flex justify-between px-6">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-0.5 h-6 bg-slate-300" />
                ))}
              </div>
            </div>

            {/* ── LEVEL 2 (Capacity 9, 3 Groups of 3) ── */}
            <div className="w-full flex flex-col items-center">
              {/* Level 2 Header Banner */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-black uppercase tracking-wider mb-2">
                <span>Level 2</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-blue-700">Total Potential: ₹630</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="font-mono text-[11px] text-slate-600 font-bold">
                  {l2Stats.filledCount} / 9 nodes
                </span>
              </div>

              {/* 3 Triad Groups */}
              <div className="w-full grid grid-cols-3 gap-4 px-2">
                {l2Triads.map((triad) => (
                  <div key={triad.parentIdx} className="flex flex-col items-center">
                    {/* Triad branch connector */}
                    <div className="relative w-[85%] h-3 mb-1">
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-300 rounded-full" />
                      <div className="absolute top-0 left-0 w-0.5 h-3 bg-slate-300" />
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-slate-300" />
                      <div className="absolute top-0 right-0 w-0.5 h-3 bg-slate-300" />
                    </div>

                    {/* 3 Nodes in Triad */}
                    <div className="w-full grid grid-cols-3 gap-1.5">
                      {triad.slots.map((slot) => (
                        <button
                          key={slot.globalSlot}
                          onClick={() =>
                            setActiveInspector({
                              type: 'L2',
                              title: `Level 2 — Slot ${slot.globalSlot}`,
                              subtitle: slot.isFilled ? `Occupied: ${slot.name || slot.code}` : 'Available Slot',
                              capacity: 9,
                              filled: l2Stats.filledCount,
                              potential: '₹630 Total Level Potential',
                              desc: slot.isFilled
                                ? `Connected under L1 parent node ${triad.parentIdx + 1}.`
                                : 'Open matrix slot at depth 2.',
                            })
                          }
                          className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                            slot.isFilled
                              ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs'
                              : 'bg-white border border-dashed border-slate-200 text-slate-400 hover:border-blue-300'
                          }`}
                        >
                          <div className="text-[8px] font-black uppercase text-slate-400 leading-none">
                            {slot.positionLabel}
                          </div>
                          <div className="text-[10px] font-extrabold truncate mt-0.5">
                            {slot.isFilled ? slot.name || slot.code || 'Active' : 'Available'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Vertical connector to L3 */}
              <div className="w-0.5 h-6 bg-slate-300 mt-2" />
            </div>

            {/* ── LEVEL 3 (Capacity 27, 9 Triads across 3 Branches) ── */}
            <div className="w-full flex flex-col items-center">
              {/* Level 3 Header Banner */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-black uppercase tracking-wider mb-2">
                <span>Level 3</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-blue-700">Total Potential: ₹1,485</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="font-mono text-[11px] text-slate-600 font-bold">
                  {l3Stats.filledCount} / 27 nodes
                </span>
              </div>

              {/* 27 Positions Grid: 3 Branches of 9 nodes (3 triads each) */}
              <div className="w-full grid grid-cols-3 gap-3 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                {l3Branches.map((branch) => (
                  <div
                    key={branch.branchIdx}
                    className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-2"
                  >
                    <div className="text-[9px] font-black uppercase tracking-wider text-slate-400 text-center">
                      Branch {branch.branchIdx + 1} (Slots {branch.branchIdx * 9 + 1}–{(branch.branchIdx + 1) * 9})
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {branch.triads.map((triad) =>
                        triad.slots.map((slot) => (
                          <button
                            key={slot.globalSlot}
                            onClick={() =>
                              setActiveInspector({
                                type: 'L3',
                                title: `Level 3 — Slot ${slot.globalSlot} / 27`,
                                subtitle: slot.isFilled ? `Occupied: ${slot.name || slot.code}` : 'Available Slot',
                                capacity: 27,
                                filled: l3Stats.filledCount,
                                potential: '₹1,485 Total Level Potential',
                                desc: slot.isFilled
                                  ? `Level 3 verified placement in matrix.`
                                  : `Available position at Level 3. Total 27 positions required for completion.`,
                              })
                            }
                            className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                              slot.isFilled
                                ? 'bg-blue-600 border-blue-700 text-white font-black'
                                : 'bg-white border-dashed border-slate-200 text-slate-400 hover:border-blue-300 font-medium'
                            }`}
                            title={`Position ${slot.globalSlot}: ${slot.isFilled ? slot.name || 'Occupied' : 'Available'}`}
                          >
                            <div className="text-[7px] leading-none opacity-80">{slot.globalSlot}</div>
                            <div className="text-[9px] font-bold leading-tight truncate">
                              {slot.isFilled ? '✓' : '—'}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── CASCADING DEPTH TRANSITION (Outside scroll container — 100% full width on phone) ── */}
        <div className="max-w-3xl mx-auto flex flex-col items-center my-6 px-2">
          <div className="w-0.5 h-5 bg-slate-300 mb-2" />
          <div className="px-3.5 sm:px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] sm:text-xs font-black uppercase tracking-wider text-blue-700 shadow-2xs text-center max-w-full">
            Cascading Depth • Levels 4 to 15 (14,348,907 Peak Capacity)
          </div>
          <div className="w-0.5 h-4 bg-slate-300 mt-2" />
        </div>

        {/* ── COMPACT HORIZONTAL PROGRESS ROWS (L4 to L14) (100% responsive, NO horizontal scroll on mobile) ── */}
        <div className="max-w-3xl mx-auto space-y-2.5 w-full px-2 sm:px-0">
          {levelStats.slice(3, 14).map((l) => (
            <div
              key={l.level}
              className={`flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border transition-all ${
                l.isActive
                  ? 'bg-amber-50/80 border-amber-300 shadow-xs'
                  : l.isComplete
                  ? 'bg-emerald-50/50 border-emerald-300'
                  : 'bg-white border-slate-200/90'
              }`}
            >
              {/* Level Badge & Income */}
              <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                <span
                  className={`px-2 py-0.5 rounded-lg text-xs font-black ${
                    l.isActive
                      ? 'bg-amber-500 text-white'
                      : l.isComplete
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  L{l.level}
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-800 tracking-tight">
                  {l.income}
                </span>
              </div>

              {/* Progress bar */}
              <div className="flex-1 min-w-0 mx-1.5 sm:mx-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1">
                  <span className="hidden xs:inline">Progress</span>
                  <span className="font-mono text-slate-600 text-[9px] sm:text-[10px] truncate ml-auto">
                    {l.filledCount.toLocaleString('en-IN')} / {l.capacity.toLocaleString('en-IN')}
                    <span className="hidden sm:inline"> nodes</span>
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      l.isComplete ? 'bg-emerald-500' : l.isActive ? 'bg-amber-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.max(l.filledCount > 0 ? 3 : 0, l.progressPct)}%` }}
                  />
                </div>
              </div>

              {/* Status pill */}
              <div className="shrink-0 text-right">
                {l.isComplete ? (
                  <span className="text-[9px] sm:text-[10px] font-black text-emerald-600 uppercase px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                    Done
                  </span>
                ) : l.isActive ? (
                  <span className="text-[9px] sm:text-[10px] font-black text-amber-600 uppercase px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
                    Active
                  </span>
                ) : (
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">
                    Locked
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── LEVEL 15 PINNACLE CARD (100% Responsive, NO horizontal scroll on mobile) ── */}
        <div className="max-w-3xl mx-auto mt-3 w-full px-2 sm:px-0">
          {(() => {
            const l15 = levelStats[14];
            return (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 border-2 border-blue-700 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-lg sm:text-xl shrink-0">
                    👑
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                      Level 15 — PINNACLE MAXIMUM
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-amber-400 leading-tight">
                      ₹12,91,40,163
                    </div>
                  </div>
                </div>

                <div className="space-y-1 sm:text-right">
                  <div className="text-[10px] font-black uppercase tracking-wider text-blue-300">
                    Matrix Capacity
                  </div>
                  <div className="text-sm sm:text-base font-black text-white font-mono">
                    {l15.filledCount.toLocaleString('en-IN')} / 14,348,907 nodes
                  </div>
                  <div className="w-full sm:w-36 sm:ml-auto h-1.5 rounded-full bg-blue-900 overflow-hidden mt-1">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${Math.max(l15.filledCount > 0 ? 3 : 0, l15.progressPct)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Interactive Inspector Drawer */}
        {activeInspector && (
          <div className="max-w-2xl mx-auto mt-6 p-4 sm:p-5 rounded-2xl bg-blue-50 border border-blue-200 text-xs shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-black text-blue-900 text-sm">{activeInspector.title}</div>
              <button
                onClick={() => setActiveInspector(null)}
                className="text-slate-400 hover:text-slate-700 font-bold px-1.5"
              >
                ✕
              </button>
            </div>
            <div className="text-blue-700 font-bold">{activeInspector.subtitle}</div>
            <p className="text-slate-600 leading-relaxed">{activeInspector.desc}</p>
            {activeInspector.potential && (
              <div className="text-slate-900 font-black pt-1 border-t border-blue-200/60">
                {activeInspector.potential}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────

export default function NextViewNetworkPage() {
  const [matrixData, setMatrixData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadMatrixData() {
      try {
        const res = await fetch('/api/mlm/matrix');
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json?.success && json?.data) {
            setMatrixData(json.data);
          }
        }
      } catch {
        // Unauthenticated visitor fallback
      }
    }
    loadMatrixData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 pt-20">

      {/* ════════════════════════ 1. HERO ════════════════════════════════ */}
      <NexViaHeroBanner />

      {/* ════════════════════════ 2. ₹2,000 FD SECTION ════════════════════ */}
      <section className="py-12 sm:py-16 bg-slate-50/70 border-b border-slate-200/80">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-blue-600">
                <CreditCard size={13} />
                <span>FD Activation</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">₹2,000 Applicable Fixed Deposit</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {/* FD Card */}
              <div className="p-5 rounded-2xl bg-white border border-blue-200/80 shadow-sm text-center space-y-2">
                <div className="text-3xl font-black text-blue-700">₹2,000</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fixed Deposit Amount</div>
                <div className="text-[11px] text-slate-400 leading-relaxed">Applicable FD as per financial partner terms</div>
              </div>

              {/* Platform Fee */}
              <div className="p-5 rounded-2xl bg-white border border-amber-200/80 shadow-sm text-center space-y-2">
                <div className="text-3xl font-black text-amber-600">₹100</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Platform Activation Fee</div>
                <div className="text-[11px] text-slate-400 leading-relaxed">One-time platform activation charge</div>
              </div>

              {/* FD Card Facility */}
              <div className="p-5 rounded-2xl bg-white border border-emerald-200/80 shadow-sm text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-emerald-600" />
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">FD-Card Facility</div>
                <div className="text-[11px] text-slate-400 leading-relaxed">Eligible FD/FD-Card benefits as applicable</div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50/80 border border-blue-200/70">
              <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Disclaimer:</strong> FD/FD-Card approval, eligibility, credit facility and applicable terms are subject to the respective financial partner's verification, approval and policies. NexVia is a referral network platform and does not directly issue FDs or financial instruments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════ 3. MATRIX JOURNEY ═════════════════════════ */}
      <MatrixJourneySection matrixData={matrixData} />

      {/* ════════════════════════ 4. LEVEL INCOME ═══════════════════════════ */}
      <div id="income-plan">
        <LevelIncomeSection matrixData={matrixData} />
      </div>

      {/* ════════════════════════ 5. ACHIEVEMENT REWARDS ════════════════════ */}
      <AchievementSection />

      {/* ════════════════════════ 6. HOW IT WORKS ════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
        <div className="container-custom">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-blue-600">
              <ChevronRight size={13} />
              <span>Step-by-Step</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">How NexVia Works</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {HOW_IT_WORKS.map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.step}
                  className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400/50 hover:shadow-md transition duration-200 space-y-4 group shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black text-slate-200 group-hover:text-blue-100 transition-colors leading-none">
                      {item.step}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                      <IconComp size={17} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base mb-1">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════ 7. WHY NEXVIA ══════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-slate-50/70 border-b border-slate-200/80">
        <div className="container-custom">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-amber-600">
              <Star size={13} />
              <span>Why NexVia</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Built for Trust & Growth</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {WHY_NEXVIA.map((card) => {
              const IconComp = card.icon;
              return (
                <div
                  key={card.title}
                  className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400/40 hover:shadow-md transition duration-200 space-y-3 group shadow-xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                    <IconComp size={19} />
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">{card.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════ 8. COMPLIANCE NOTICE ═══════════════════════ */}
      <section className="py-10 bg-white border-b border-slate-200/80">
        <div className="container-custom max-w-3xl">
          <div className="flex items-start gap-4 p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
              <ShieldCheck size={17} />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-black uppercase tracking-wider text-slate-500">Important Compliance Notice</div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                NexVia rewards, FD/FD-Card facilities, credit facilities and other financial services are subject to applicable eligibility criteria, verification, approval and terms/policies of the respective financial partner. <strong>No income or reward is guaranteed.</strong> All stated figures represent the maximum potential upon full network completion as per the plan structure. Actual results may vary based on individual participation and market conditions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════ 9. FINAL CTA ═══════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(245,158,11,0.12),transparent_50%)] pointer-events-none" />
        <div className="container-custom text-center max-w-2xl space-y-6 relative z-10">
          <div className="flex justify-center mb-2">
            <div className="relative w-36 sm:w-44 h-10 sm:h-12">
              <Image
                src="/nexvia.png"
                alt="NexVia"
                fill
                className="object-contain brightness-0 invert"
              />
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
            Ready to Start Your
            <br />
            <span className="text-amber-400">NexVia Journey?</span>
          </h2>

          <p className="text-blue-200 text-sm sm:text-base leading-relaxed">
            Register, verify, activate your FD, and let the 3×15 matrix work for you. Join a structured, digital, and transparent network today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/nextview/register"
              className="w-full sm:w-auto px-9 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-blue-950 font-extrabold text-sm shadow-xl shadow-amber-500/30 hover:scale-[1.02] active:scale-95 transition flex items-center justify-center gap-2"
            >
              <span>JOIN NEXVIA</span>
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/nextview/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/25 backdrop-blur-md transition flex items-center justify-center gap-2"
            >
              <span>LOGIN TO MEMBER PANEL</span>
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
