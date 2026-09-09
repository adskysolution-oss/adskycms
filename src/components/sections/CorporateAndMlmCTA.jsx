'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Briefcase, 
  ArrowRight, 
  TrendingUp, 
  CheckCircle2, 
  ChevronRight, 
  Building2, 
  Sparkles, 
  ShieldCheck, 
  Wallet, 
  Layers, 
  ArrowUpRight 
} from 'lucide-react';

export default function CorporateAndMlmCTA() {
  return (
    <section className="py-24 bg-gradient-to-b from-slate-50/60 via-white to-slate-50/80 relative overflow-hidden border-t border-slate-200/80">
      {/* Subtle Background Glows */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[radial-gradient(circle_at_30%_30%,rgba(37,99,235,0.06),transparent_60%),radial-gradient(circle_at_70%_70%,rgba(245,158,11,0.05),transparent_60%)] blur-2xl" />
      </div>

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
            <Briefcase size={14} className="text-blue-600" />
            <span>Growth &amp; Referral Ecosystem</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            Partner With <span className="gradient-text">AdSky Solution</span>
          </h2>
          <p className="text-sm md:text-base text-slate-600 leading-relaxed">
            Explore dedicated enterprise and referral programs—from regional agency task execution to deterministic 3×15 matrix network rewards.
          </p>
        </div>

        {/* Two Main Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Card 1: Corporate Partner Program */}
          <div className="group relative rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.06),0_2px_8px_-2px_rgba(0,0,0,0.03)] hover:shadow-[0_24px_48px_-12px_rgba(37,99,235,0.14)] hover:border-blue-300 transition-all duration-300 flex flex-col justify-between overflow-hidden">
            {/* Top Accent Line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400" />

            <div className="p-8 sm:p-10 space-y-7">
              {/* Header: Icon + Badge */}
              <div className="flex items-start justify-between gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300 shrink-0">
                  <Briefcase size={26} />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
                  <Building2 size={13} className="text-blue-600" />
                  <span>B2B &amp; Enterprise</span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2.5">
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                  Corporate Partner Program
                </h3>
                <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed">
                  Empower regional agencies and businesses. Access structured task execution, service referral commissions, CSC / MP Online kiosk verification, and multi-tier regional payout pools.
                </p>
              </div>

              {/* Quick Highlight Metrics Strip */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                  <Layers size={13} className="text-blue-600" />
                  <span>Multi-tier Regional Hierarchy</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                  <Building2 size={13} className="text-blue-600" />
                  <span>Kiosk Onboarding</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                  <Wallet size={13} className="text-blue-600" />
                  <span>Direct Bank / UPI</span>
                </span>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-start gap-3.5 hover:bg-blue-50/30 hover:border-blue-200/70 transition-colors">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={14} className="stroke-[3]" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900">Corporate Vendor &amp; Downline Regional Hierarchy</div>
                    <div className="text-xs text-slate-500 mt-0.5">Structured multi-tier team management from Corporate Vendor to field agents.</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-start gap-3.5 hover:bg-blue-50/30 hover:border-blue-200/70 transition-colors">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={14} className="stroke-[3]" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900">CSC &amp; MP Online Kiosk Verification &amp; Activation</div>
                    <div className="text-xs text-slate-500 mt-0.5">Earn verified onboarding incentives with regional activation tracking.</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-start gap-3.5 hover:bg-blue-50/30 hover:border-blue-200/70 transition-colors">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={14} className="stroke-[3]" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900">Transparent Ledger &amp; Direct Bank / UPI Withdrawals</div>
                    <div className="text-xs text-slate-500 mt-0.5">Immutable transaction records with automated, fast payout processing.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Section */}
            <div className="p-8 sm:p-10 pt-0">
              <div className="pt-6 border-t border-slate-100 space-y-3.5">
                {/* Primary CTA */}
                <Link
                  href="/nextview/register"
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/35 hover:scale-[1.01] transition-all"
                >
                  <span>Register as Corporate Partner</span>
                  <ArrowRight size={17} />
                </Link>

                {/* Secondary Actions Row */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <Link
                    href="/corporate-partner"
                    className="py-2.5 px-4 rounded-xl bg-slate-100/90 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200/80 transition"
                  >
                    <span>Learn Program Details</span>
                    <ArrowUpRight size={14} className="text-slate-500" />
                  </Link>

                  <Link
                    href="/nextview/login"
                    className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition"
                  >
                    <span>Partner Login</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: NexVia 3×15 Network */}
          <div className="group relative rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.06),0_2px_8px_-2px_rgba(0,0,0,0.03)] hover:shadow-[0_24px_48px_-12px_rgba(245,158,11,0.16)] hover:border-amber-300 transition-all duration-300 flex flex-col justify-between overflow-hidden">
            {/* Top Accent Line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400" />

            <div className="p-8 sm:p-10 space-y-7">
              {/* Header: Logo + Badge */}
              <div className="flex items-center justify-between gap-4">
                <div className="relative w-36 sm:w-44 h-12">
                  <Image
                    src="/nexvia.png"
                    alt="NexVia Network"
                    fill
                    className="object-contain object-left group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs">
                  <Sparkles size={13} className="text-amber-600" />
                  <span>3×15 Matrix</span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2.5">
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight group-hover:text-amber-600 transition-colors">
                  NexVia 3×15 Network
                </h3>
                <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed">
                  Join our structured 3×15 Matrix. Refer eligible Fixed Deposit (FD) and FD-Card products to unlock structured Level 1 through Level 15 upline rewards with instant withdrawals.
                </p>
              </div>

              {/* Quick Highlight Metrics Strip */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                  <TrendingUp size={13} className="text-amber-600" />
                  <span>BFS Matrix Spillover</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                  <Sparkles size={13} className="text-amber-600" />
                  <span>15 Levels of Bonuses</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                  <ShieldCheck size={13} className="text-amber-600" />
                  <span>Immutable Audit Ledger</span>
                </span>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-start gap-3.5 hover:bg-amber-50/30 hover:border-amber-200/70 transition-colors">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={14} className="stroke-[3]" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900">Deterministic Fair BFS Matrix (Max 3 Children per Node)</div>
                    <div className="text-xs text-slate-500 mt-0.5">Automated team spillover ensures balanced tree placement without favoritism.</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-start gap-3.5 hover:bg-amber-50/30 hover:border-amber-200/70 transition-colors">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={14} className="stroke-[3]" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900">Configurable Level 1–15 Bonus Distribution per Verified FD</div>
                    <div className="text-xs text-slate-500 mt-0.5">Automated upline distribution triggered instantly upon verified investment.</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-start gap-3.5 hover:bg-amber-50/30 hover:border-amber-200/70 transition-colors">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={14} className="stroke-[3]" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900">Dedicated Rewards Wallet with Immutable Audit Ledger</div>
                    <div className="text-xs text-slate-500 mt-0.5">Instant withdrawal requests with complete financial accountability.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Section */}
            <div className="p-8 sm:p-10 pt-0">
              <div className="pt-6 border-t border-slate-100 space-y-3.5">
                {/* Primary CTA */}
                <Link
                  href="/nextview/register"
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35 hover:scale-[1.01] transition-all"
                >
                  <span>Join NextView Network</span>
                  <ArrowRight size={17} />
                </Link>

                {/* Secondary Actions Row */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <Link
                    href="/nextview-network"
                    className="py-2.5 px-4 rounded-xl bg-slate-100/90 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200/80 transition"
                  >
                    <span>Learn Network Details</span>
                    <ArrowUpRight size={14} className="text-slate-500" />
                  </Link>

                  <Link
                    href="/nextview/login"
                    className="text-xs font-semibold text-slate-500 hover:text-amber-600 flex items-center gap-1 transition"
                  >
                    <span>Member Login</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
