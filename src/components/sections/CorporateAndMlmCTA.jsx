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
  Handshake,
  Zap
} from 'lucide-react';
import { FloatingOrb, DottedGrid, GeometricAccent, GlowBlob } from '../ui/BackgroundEffects';

export default function CorporateAndMlmCTA() {
  return (
    <section className="py-16 sm:py-20 relative overflow-hidden bg-slate-50/50">
      {/* Background Effect Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/60 via-white to-slate-50/60" />
        <GlowBlob color="blue" size="w-[500px] h-[500px]" className="top-1/4 -right-32" opacity={0.11} />
        <GlowBlob color="purple" size="w-[400px] h-[400px]" className="bottom-0 -left-24" opacity={0.10} delay="4s" />

        <FloatingOrb variant="peach" size={40} className="top-1/3 -right-4 hidden lg:block" animation="float-slow" delay="1s" />
        <FloatingOrb variant="blue" size={32} className="bottom-24 -left-4 hidden lg:block" animation="float" delay="2.5s" />

        <DottedGrid cols={5} rows={5} spacing={16} color="#3B82F6" opacity={0.22} className="top-16 right-8 hidden lg:block" />
        <GeometricAccent type="sparkle" size={14} color="#F59E0B" opacity={0.35} className="top-20 left-16 hidden md:block" delay="1.5s" />
        <GeometricAccent type="diamond" size={12} color="#06B6D4" opacity={0.3} className="bottom-20 right-20 hidden md:block" delay="3s" />
      </div>

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-200/80 bg-blue-50/90 text-primary text-xs font-bold uppercase tracking-wider shadow-xs">
            <Handshake size={13} className="text-blue-600" />
            <span>Growth &amp; Partner Ecosystem</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Partner With <span className="gradient-text">AdSky Solution</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            Explore dedicated enterprise and partner programs—from regional agency task execution to structured partner network rewards.
          </p>
        </div>

        {/* Two Main Cards Grid - Compact, Gradient Backgrounds & Effected */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-7 max-w-5xl mx-auto items-stretch">

          {/* Card 1: Corporate Partner Program */}
          <div className="group relative rounded-3xl bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-white/95 border border-blue-200/90 shadow-[0_4px_20px_-6px_rgba(37,99,235,0.08)] hover:shadow-[0_20px_40px_-10px_rgba(37,99,235,0.18)] hover:border-blue-400 transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1">
            {/* Ambient Corner Glow Effects */}
            <div className="absolute -top-16 -right-16 w-44 h-44 bg-gradient-to-br from-blue-400/25 via-indigo-400/20 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
            <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-gradient-to-tr from-cyan-400/15 to-transparent rounded-full blur-2xl pointer-events-none" />

            {/* Top Accent Line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400" />

            <div className="p-6 sm:p-7 space-y-4 relative z-10">
              {/* Header: Icon + Badge */}
              <div className="flex items-center justify-between gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 group-hover:rotate-1 transition-transform duration-300 shrink-0">
                  <Briefcase size={22} />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-blue-100/90 text-blue-700 border border-blue-200/90 shadow-2xs">
                  <Building2 size={12} className="text-blue-600" />
                  <span>B2B &amp; Enterprise</span>
                </div>
              </div>

              {/* Title & Short Description */}
              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                  Corporate Partner Program
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                  Empower regional agencies and businesses. Access structured task execution, service commissions, CSC / MP Online kiosk verification, and regional payout pools.
                </p>
              </div>

              {/* Compact Quick Highlight Metrics */}
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 border border-blue-200/80 text-[11px] font-semibold text-slate-700 shadow-2xs">
                  <Layers size={11} className="text-blue-600" />
                  <span>Multi-tier Hierarchy</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 border border-blue-200/80 text-[11px] font-semibold text-slate-700 shadow-2xs">
                  <Building2 size={11} className="text-blue-600" />
                  <span>Kiosk Onboarding</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 border border-blue-200/80 text-[11px] font-semibold text-slate-700 shadow-2xs">
                  <Wallet size={11} className="text-blue-600" />
                  <span>Direct Bank / UPI</span>
                </span>
              </div>

              {/* Compact Feature Checklist */}
              <div className="space-y-2 pt-1">
                {[
                  { title: 'Corporate Vendor & Downline Hierarchy', desc: 'Structured multi-tier team management from Vendor to field agents.' },
                  { title: 'CSC & MP Online Kiosk Verification', desc: 'Earn verified onboarding incentives with regional activation tracking.' },
                  { title: 'Transparent Ledger & Direct Withdrawals', desc: 'Automated settlement records with instant bank/UPI payouts.' },
                ].map((f, i) => (
                  <div key={i} className="p-2.5 px-3 rounded-xl bg-white/80 border border-blue-200/60 flex items-start gap-2.5 hover:bg-white hover:border-blue-300 transition-all shadow-2xs">
                    <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={12} className="stroke-[3]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 leading-snug">{f.title}</div>
                      <div className="text-[11px] text-slate-500 leading-tight mt-0.5">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions Section */}
            <div className="p-6 sm:p-7 pt-0 relative z-10">
              <div className="pt-4 border-t border-blue-200/60 space-y-2.5">
                <Link
                  href="/nextview/register"
                  className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/35 hover:scale-[1.01] transition-all"
                >
                  <span>Register as Corporate Partner</span>
                  <ArrowRight size={15} />
                </Link>

                <div className="flex items-center justify-between gap-3 pt-0.5">
                  <Link
                    href="/corporate-partner"
                    className="py-2 px-3 rounded-lg bg-white/80 hover:bg-white text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200/90 transition shadow-2xs"
                  >
                    <span>Learn Program Details</span>
                    <ArrowUpRight size={13} className="text-slate-400" />
                  </Link>

                  <Link
                    href="/nextview/login"
                    className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition"
                  >
                    <span>Partner Login</span>
                    <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: NexVia Network Platform */}
          <div className="group relative rounded-3xl bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-white/95 border border-amber-200/90 shadow-[0_4px_20px_-6px_rgba(245,158,11,0.08)] hover:shadow-[0_20px_40px_-10px_rgba(245,158,11,0.18)] hover:border-amber-400 transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1">
            {/* Ambient Corner Glow Effects */}
            <div className="absolute -top-16 -right-16 w-44 h-44 bg-gradient-to-br from-amber-400/25 via-orange-400/20 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
            <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-gradient-to-tr from-yellow-400/15 to-transparent rounded-full blur-2xl pointer-events-none" />

            {/* Top Accent Line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400" />

            <div className="p-6 sm:p-7 space-y-4 relative z-10">
              {/* Header: Logo + Badge */}
              <div className="flex items-center justify-between gap-3">
                <div className="relative w-32 sm:w-36 h-10">
                  <Image
                    src="/nexvia.png"
                    alt="NexVia Network"
                    fill
                    sizes="(max-width: 640px) 128px, 144px"
                    className="object-contain object-left group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-amber-100/90 text-amber-800 border border-amber-200/90 shadow-2xs">
                  <Sparkles size={12} className="text-amber-600" />
                  <span>Partner Network</span>
                </div>
              </div>

              {/* Title & Short Description */}
              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight group-hover:text-amber-600 transition-colors">
                  NexVia Network Platform
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                  Join our structured partner network. Promote eligible Fixed Deposit (FD) and FD-Card products to unlock Level 1 through Level 15 upline rewards with instant payouts.
                </p>
              </div>

              {/* Compact Quick Highlight Metrics */}
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 border border-amber-200/80 text-[11px] font-semibold text-slate-700 shadow-2xs">
                  <TrendingUp size={11} className="text-amber-600" />
                  <span>BFS Matrix Spillover</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 border border-amber-200/80 text-[11px] font-semibold text-slate-700 shadow-2xs">
                  <Zap size={11} className="text-amber-600" />
                  <span>15 Levels of Bonuses</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 border border-amber-200/80 text-[11px] font-semibold text-slate-700 shadow-2xs">
                  <ShieldCheck size={11} className="text-amber-600" />
                  <span>Immutable Audit Ledger</span>
                </span>
              </div>

              {/* Compact Feature Checklist */}
              <div className="space-y-2 pt-1">
                {[
                  { title: 'Deterministic Fair BFS Matrix', desc: 'Balanced tree placement up to 3 children per node with spillover.' },
                  { title: 'Configurable Level 1–15 Bonus Distribution', desc: 'Automated upline rewards triggered instantly per verified investment.' },
                  { title: 'Dedicated Rewards Wallet & Instant Payouts', desc: 'Seamless withdrawals backed by complete financial accountability.' },
                ].map((f, i) => (
                  <div key={i} className="p-2.5 px-3 rounded-xl bg-white/80 border border-amber-200/60 flex items-start gap-2.5 hover:bg-white hover:border-amber-300 transition-all shadow-2xs">
                    <div className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={12} className="stroke-[3]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 leading-snug">{f.title}</div>
                      <div className="text-[11px] text-slate-500 leading-tight mt-0.5">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions Section */}
            <div className="p-6 sm:p-7 pt-0 relative z-10">
              <div className="pt-4 border-t border-amber-200/60 space-y-2.5">
                <Link
                  href="/nextview/register"
                  className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/25 hover:shadow-lg hover:shadow-amber-500/35 hover:scale-[1.01] transition-all"
                >
                  <span>Join NextView Network</span>
                  <ArrowRight size={15} />
                </Link>

                <div className="flex items-center justify-between gap-3 pt-0.5">
                  <Link
                    href="/nextview-network"
                    className="py-2 px-3 rounded-lg bg-white/80 hover:bg-white text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200/90 transition shadow-2xs"
                  >
                    <span>Learn Network Details</span>
                    <ArrowUpRight size={13} className="text-slate-400" />
                  </Link>

                  <Link
                    href="/nextview/login"
                    className="text-xs font-semibold text-slate-500 hover:text-amber-600 flex items-center gap-1 transition"
                  >
                    <span>Member Login</span>
                    <ChevronRight size={13} />
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
