'use client';

import React from 'react';
import Link from 'next/link';
import { Briefcase, ArrowRight, TrendingUp, CheckCircle2, ChevronRight } from 'lucide-react';

export default function CorporateAndMlmCTA() {
  return (
    <section className="py-24 bg-dark relative overflow-hidden border-t border-white/5">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_10%_20%,rgba(37,99,235,0.08),transparent_50%),radial-gradient(circle_at_90%_80%,rgba(245,158,11,0.06),transparent_50%)]" />

      <div className="container-custom relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary-light border border-primary/20 backdrop-blur-md">
            <Briefcase size={14} />
            <span>Growth &amp; Referral Ecosystem</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Partner With <span className="gradient-text">AdSky Solution</span>
          </h2>
          <p className="text-sm md:text-base text-text-secondary leading-relaxed">
            Explore dedicated enterprise and referral programs—from regional agency task execution to deterministic 3×15 matrix network rewards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Corporate Partner */}
          <div className="p-8 md:p-10 rounded-3xl bg-surface border border-white/10 hover:border-primary/40 transition duration-300 flex flex-col justify-between space-y-8 relative overflow-hidden group shadow-2xl">
            <div className="space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-light group-hover:scale-110 transition-transform">
                <Briefcase size={28} />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Corporate Partner Program</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Empower regional agencies and businesses. Access structured task execution, service referral commissions, CSC / MP Online kiosk verification, and multi-tier regional payout pools.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs text-text-secondary">
                  <CheckCircle2 className="w-4 h-4 text-primary-light shrink-0" />
                  <span>Corporate Vendor &amp; Downline Regional Hierarchy</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-secondary">
                  <CheckCircle2 className="w-4 h-4 text-primary-light shrink-0" />
                  <span>CSC &amp; MP Online Kiosk Verification &amp; Activation Incentives</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-secondary">
                  <CheckCircle2 className="w-4 h-4 text-primary-light shrink-0" />
                  <span>Transparent Ledger &amp; Direct Bank / UPI Withdrawals</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-2.5">
              <Link
                href="/corporate-partner"
                className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center border border-white/10 transition text-center"
              >
                <span>Learn Details</span>
              </Link>
              <Link
                href="/nextview/register"
                className="flex-1 py-3 px-5 rounded-xl btn-primary text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:scale-[1.02] transition text-center"
              >
                <span>Register</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/nextview/login"
                className="py-3 px-4 rounded-xl bg-surface-light hover:bg-white/10 text-text-secondary hover:text-white font-semibold text-xs flex items-center justify-center border border-white/5 transition"
              >
                <span>Login</span>
              </Link>
            </div>
          </div>

          {/* Card 2: NexVia MLM Network */}
          <div className="p-8 md:p-10 rounded-3xl bg-surface border border-white/10 hover:border-amber-500/40 transition duration-300 flex flex-col justify-between space-y-8 relative overflow-hidden group shadow-2xl">
            <div className="space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <TrendingUp size={28} />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2">NexVia 3×15 Network</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Join our structured 3×15 Matrix. Refer eligible Fixed Deposit (FD) and FD-Card products to unlock structured Level 1 through Level 15 upline rewards with instant withdrawals.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs text-text-secondary">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Deterministic Fair BFS Matrix (Max 3 Children per Node)</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-secondary">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Configurable Level 1–15 Bonus Distribution per Verified FD</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-secondary">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Dedicated Rewards Wallet with Immutable Audit Ledger</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-2.5">
              <Link
                href="/nextview-network"
                className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center border border-white/10 transition text-center"
              >
                <span>Learn Details</span>
              </Link>
              <Link
                href="/nextview/register"
                className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 hover:scale-[1.02] transition text-center"
              >
                <span>Join Network</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/nextview/login"
                className="py-3 px-4 rounded-xl bg-surface-light hover:bg-white/10 text-text-secondary hover:text-white font-semibold text-xs flex items-center justify-center border border-white/5 transition"
              >
                <span>Member Login</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
