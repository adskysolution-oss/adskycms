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
  ArrowUpRight,
  Handshake
} from 'lucide-react';
import { FloatingOrb, DottedGrid, GeometricAccent, GlowBlob } from '../ui/BackgroundEffects';

export default function CorporateAndMlmCTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Effect Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/60 via-white to-slate-50/60" />
        <GlowBlob color="blue" size="w-[500px] h-[500px]" className="top-1/4 -right-32" opacity={0.11} />
        <GlowBlob color="purple" size="w-[400px] h-[400px]" className="bottom-0 -left-24" opacity={0.10} delay="4s" />

        <FloatingOrb variant="peach" size={44} className="top-1/3 -right-4 hidden lg:block" animation="float-slow" delay="1s" />
        <FloatingOrb variant="blue" size={36} className="bottom-24 -left-4 hidden lg:block" animation="float" delay="2.5s" />

        <DottedGrid cols={5} rows={5} spacing={16} color="#3B82F6" opacity={0.22} className="top-16 right-8 hidden lg:block" />
        <GeometricAccent type="sparkle" size={14} color="#F59E0B" opacity={0.35} className="top-20 left-16 hidden md:block" delay="1.5s" />
        <GeometricAccent type="diamond" size={12} color="#06B6D4" opacity={0.3} className="bottom-20 right-20 hidden md:block" delay="3s" />
      </div>

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200/60 bg-blue-50/80 text-primary text-xs font-bold uppercase tracking-wider">
            <Handshake size={14} />
            <span>Growth &amp; Referral Ecosystem</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Partner With <span className="gradient-text">AdSky Solution</span>
          </h2>
          <p className="text-sm md:text-base text-slate-500 leading-relaxed">
            Explore dedicated enterprise and referral programs—from regional agency task execution to deterministic 3×15 matrix network rewards.
          </p>
        </div>

        {/* Two Main Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">

          {/* Card 1: Corporate Partner Program */}
          <div className="group relative rounded-3xl bg-white border border-slate-200/80 shadow-[0_4px_20px_-6px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_-12px_rgba(37,99,235,0.14)] hover:border-blue-300/70 transition-all duration-400 flex flex-col justify-between overflow-hidden">
            {/* Top Accent Line */}
            <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400" />

            <div className="p-8 sm:p-10 space-y-7">
              {/* Header: Icon + Badge */}
              <div className="flex items-start justify-between gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300 shrink-0">
                  <Briefcase size={26} />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-200/80">
                  <Building2 size={13} className="text-blue-600" />
                  <span>B2B &amp; Enterprise</span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2.5">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                  Corporate Partner Program
                </h3>
                <p className="text-sm sm:text-[15px] text-slate-500 leading-relaxed">
                  Empower regional agencies and businesses. Access structured task execution, service referral commissions, CSC / MP Online kiosk verification, and multi-tier regional payout pools.
                </p>
              </div>

              {/* Quick Highlight Metrics Strip */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-600">
                  <Layers size={13} className="text-blue-500" />
                  <span>Multi-tier Hierarchy</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-600">
                  <Building2 size={13} className="text-blue-500" />
                  <span>Kiosk Onboarding</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-600">
                  <Wallet size={13} className="text-blue-500" />
                  <span>Direct Bank / UPI</span>
                </span>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-3 pt-2">
                {[
                  { title: 'Corporate Vendor & Downline Regional Hierarchy', desc: 'Structured multi-tier team management from Corporate Vendor to field agents.' },
                  { title: 'CSC & MP Online Kiosk Verification & Activation', desc: 'Earn verified onboarding incentives with regional activation tracking.' },
                  { title: 'Transparent Ledger & Direct Bank / UPI Withdrawals', desc: 'Immutable transaction records with automated, fast payout processing.' },
                ].map((f, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex items-start gap-3.5 hover:bg-blue-50/40 hover:border-blue-200/60 transition-colors">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={14} className="stroke-[3]" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900">{f.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions Section */}
            <div className="p-8 sm:p-10 pt-0">
              <div className="pt-6 border-t border-slate-100 space-y-3.5">
                <Link
                  href="/nextview/register"
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 hover:scale-[1.01] transition-all"
                >
                  <span>Register as Corporate Partner</span>
                  <ArrowRight size={17} />
                </Link>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <Link
                    href="/corporate-partner"
                    className="py-2.5 px-4 rounded-xl bg-slate-100/90 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200/80 transition"
                  >
                    <span>Learn Program Details</span>
                    <ArrowUpRight size={14} className="text-slate-400" />
                  </Link>

                  <Link
                    href="/nextview/login"
                    className="text-xs font-semibold text-slate-400 hover:text-blue-600 flex items-center gap-1 transition"
                  >
                    <span>Partner Login</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: NexVia Matrix Platform */}
          <div className="group relative rounded-3xl bg-white border border-slate-200/80 shadow-[0_4px_20px_-6px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_-12px_rgba(245,158,11,0.14)] hover:border-amber-300/70 transition-all duration-400 flex flex-col justify-between overflow-hidden">
            {/* Top Accent Line */}
            <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400" />

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
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide bg-amber-50 text-amber-800 border border-amber-200/80">
                  <Sparkles size={13} className="text-amber-600" />
                  <span>3×15 Matrix</span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2.5">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight group-hover:text-amber-600 transition-colors">
                  NexVia Matrix Platform
                </h3>
                <p className="text-sm sm:text-[15px] text-slate-500 leading-relaxed">
                  Join our structured 3×15 Matrix. Refer eligible Fixed Deposit (FD) and FD-Card products to unlock structured Level 1 through Level 15 upline rewards with instant withdrawals.
                </p>
              </div>

              {/* Quick Highlight Metrics Strip */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-600">
                  <TrendingUp size={13} className="text-amber-500" />
                  <span>BFS Matrix Spillover</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-600">
                  <Sparkles size={13} className="text-amber-500" />
                  <span>15 Levels of Bonuses</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-600">
                  <ShieldCheck size={13} className="text-amber-500" />
                  <span>Immutable Audit Ledger</span>
                </span>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-3 pt-2">
                {[
                  { title: 'Deterministic Fair BFS Matrix (Max 3 Children per Node)', desc: 'Automated team spillover ensures balanced tree placement without favoritism.' },
                  { title: 'Configurable Level 1–15 Bonus Distribution per Verified FD', desc: 'Automated upline distribution triggered instantly upon verified investment.' },
                  { title: 'Dedicated Rewards Wallet with Immutable Audit Ledger', desc: 'Instant withdrawal requests with complete financial accountability.' },
                ].map((f, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex items-start gap-3.5 hover:bg-amber-50/30 hover:border-amber-200/60 transition-colors">
                    <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={14} className="stroke-[3]" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900">{f.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions Section */}
            <div className="p-8 sm:p-10 pt-0">
              <div className="pt-6 border-t border-slate-100 space-y-3.5">
                <Link
                  href="/nextview/register"
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.01] transition-all"
                >
                  <span>Join NextView Network</span>
                  <ArrowRight size={17} />
                </Link>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <Link
                    href="/nextview-network"
                    className="py-2.5 px-4 rounded-xl bg-slate-100/90 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200/80 transition"
                  >
                    <span>Learn Network Details</span>
                    <ArrowUpRight size={14} className="text-slate-400" />
                  </Link>

                  <Link
                    href="/nextview/login"
                    className="text-xs font-semibold text-slate-400 hover:text-amber-600 flex items-center gap-1 transition"
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
