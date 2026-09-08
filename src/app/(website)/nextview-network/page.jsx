import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  ShieldCheck,
  Wallet,
  BarChart3,
  ChevronRight,
  Star,
  Network,
  BookOpen,
  HelpCircle,
  CreditCard,
} from 'lucide-react';

export const metadata = {
  title: 'NexVia Network (3×15 Referral Matrix) — AdSky Solution',
  description:
    'Join AdSky Solution NexVia Network — a structured 3×15 referral matrix with level-based rewards, verified participation, and an integrated rewards wallet.',
};

const HOW_IT_WORKS = [
  { step: '01', title: 'Register', desc: 'Complete your NexVia Network member registration online.' },
  { step: '02', title: 'KYC Verification', desc: 'Submit your identity and verification documents.' },
  { step: '03', title: 'Account Approval', desc: 'Your member account is verified and approved.' },
  { step: '04', title: 'FD / Product Activation', desc: 'Activate eligible Fixed Deposit or FD-Card products.' },
  { step: '05', title: 'Network Placement', desc: 'You are deterministically placed into the 3×15 BFS Matrix.' },
  { step: '06', title: 'Level Rewards & Payout', desc: 'Earn Level 1–15 rewards and withdraw directly to Bank or UPI.' },
];

const BENEFITS = [
  { icon: Network, title: 'Deterministic 3×15 Matrix', desc: 'Breadth-First Search (BFS) placement algorithm ensures fair and transparent allocation for every member.' },
  { icon: TrendingUp, title: 'Multi-Level Rewards', desc: 'Earn verified Level 1 through Level 15 bonuses upon completion of downline FD activations.' },
  { icon: Wallet, title: 'Integrated Rewards Wallet', desc: 'Track all earnings in real time with an immutable transaction ledger and fast withdrawal processing.' },
  { icon: BarChart3, title: 'Real-Time Downline Tree', desc: 'Monitor your matrix occupancy, team growth, and reward unlocks via an interactive visual dashboard.' },
  { icon: ShieldCheck, title: 'Verified KYC Compliance', desc: '100% verified members ensure a trusted, fraud-free, and compliant growth network.' },
  { icon: CreditCard, title: 'Instant Withdrawals', desc: 'Seamless direct bank transfers and instant UPI withdrawal processing.' },
];

const LEVEL_SIZES = [1, 3, 9, 27, 81, 243, 729];

const FAQ = [
  {
    q: 'What is the NexVia 3×15 Matrix structure?',
    a: 'The matrix allows a maximum of 3 direct children per node across up to 15 levels. Placement is handled automatically via a deterministic BFS algorithm to ensure fairness.',
  },
  {
    q: 'When are level bonuses unlocked?',
    a: 'Level bonuses unlock once the required slots at a level are filled and the corresponding FD/FD-Card activations are verified.',
  },
  {
    q: 'How do I withdraw my earnings?',
    a: 'Earnings in your Member Wallet can be withdrawn directly to your linked Bank Account or verified UPI ID through the Member Portal.',
  },
  {
    q: 'Where do I view my tree and downline?',
    a: 'After logging into the Member Portal, navigate to the Network / Matrix page to see an interactive visualization of your entire team.',
  },
];

export default function NextViewNetworkPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white pt-24 pb-20">
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-16 md:py-24 border-b border-white/5">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_30%,rgba(245,158,11,0.15),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(234,88,12,0.1),transparent_50%)]" />
        <div className="container-custom relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 backdrop-blur-md">
              <TrendingUp size={14} className="text-amber-400" />
              <span>AdSky Solution Growth Network</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] text-white">
              NexVia<br />
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">3×15 Referral Matrix</span>
            </h1>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto font-normal">
              A fair, deterministic 3×15 network where members unlock structured Level 1–15 rewards through verified FD-Card activations and transparent downline growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/nextview/register"
                className="py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-xl shadow-amber-500/25 hover:scale-[1.02] transition flex items-center justify-center gap-2"
              >
                <span>Join NexVia Network</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/nextview/login"
                className="py-4 px-8 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm border border-white/10 backdrop-blur-md transition flex items-center justify-center gap-2"
              >
                <span>Member Login</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT IS NEXVIA ──────────────────────────────────────── */}
      <section className="py-20 border-b border-white/5">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-400">
                <BookOpen size={14} /> <span>Matrix Mechanics</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
                Fair, Deterministic &amp; Transparent Rewards
              </h2>
              <p className="text-text-secondary leading-relaxed text-sm md:text-base">
                NexVia Network utilizes a ternary 3×15 matrix. Every member node can accommodate up to 3 direct children. New members are placed using a deterministic Breadth-First Search (BFS) algorithm, eliminating favoritism and creating an equitable structure for everyone.
              </p>
              <p className="text-text-secondary leading-relaxed text-sm md:text-base">
                As downline members activate verified products, multi-level rewards unlock into your personal member wallet with instant withdrawal capabilities.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {BENEFITS.slice(0, 4).map((b) => (
                <div key={b.title} className="p-6 rounded-2xl bg-surface border border-white/5 hover:border-amber-500/40 transition duration-300 space-y-3 group">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <b.icon size={22} />
                  </div>
                  <h3 className="font-bold text-white text-base">{b.title}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3×15 MATRIX CAPACITY VISUALIZER ─────────────────────── */}
      <section className="py-20 bg-dark-light/50 border-b border-white/5">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-400">
              <Network size={14} /> <span>Matrix Structure</span>
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white">
              Exponential Tier Capacity
            </h2>
            <p className="text-text-secondary text-sm">
              Each level multiplies capacity by 3x (3<sup>Level</sup>), providing deep reward opportunities across 15 complete tiers.
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-3 bg-surface p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl">
            {LEVEL_SIZES.map((size, i) => {
              const level = i + 1;
              const fullSize = Math.pow(3, level);
              const barWidth = Math.min(100, (size / LEVEL_SIZES[LEVEL_SIZES.length - 1]) * 100);
              return (
                <div key={level} className="flex items-center gap-4">
                  <div className="w-12 shrink-0 text-right">
                    <span className="text-xs font-black text-amber-400">L{level}</span>
                  </div>
                  <div className="flex-1 h-7 bg-dark rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-end pr-2.5 transition-all"
                      style={{ width: `${barWidth}%`, minWidth: '40px' }}
                    >
                      <span className="text-[10px] font-black text-white">{size.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="w-24 shrink-0 text-right">
                    <span className="text-[11px] font-semibold text-text-muted">max {fullSize.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
            <div className="text-center pt-4 border-t border-white/5">
              <span className="text-xs text-text-muted">Levels 8 to 15 scale smoothly up to 14,348,907 total network positions</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="py-20 border-b border-white/5">
        <div className="container-custom">
          <div className="text-center max-w-xl mx-auto mb-14 space-y-3">
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-400">
              <ChevronRight size={14} /> <span>Step-by-Step</span>
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="p-6 rounded-2xl border border-white/5 bg-surface hover:border-amber-500/40 transition duration-300 space-y-3">
                <span className="text-3xl font-black text-amber-500/30">{item.step}</span>
                <h3 className="font-bold text-white text-base">{item.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="py-20 border-b border-white/5">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-14 space-y-3">
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-400">
              <HelpCircle size={14} /> <span>FAQ</span>
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group border border-white/5 rounded-2xl bg-surface overflow-hidden hover:border-amber-500/30 transition p-1"
              >
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-bold text-white text-sm list-none">
                  <span>{item.q}</span>
                  <ChevronRight size={16} className="text-amber-400 group-open:rotate-90 transition-transform shrink-0 ml-3" />
                </summary>
                <div className="px-6 pb-5 text-xs text-text-secondary leading-relaxed border-t border-white/5 pt-4">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-amber-500/20 via-surface to-dark relative overflow-hidden">
        <div className="container-custom text-center max-w-3xl space-y-6 relative z-10">
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
            Ready to Join the Network?
          </h2>
          <p className="text-text-secondary text-sm md:text-base leading-relaxed">
            Create your account today, verify your profile, and start building your 3×15 matrix rewards with NexVia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/nextview/register"
              className="py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-xl shadow-amber-500/25 hover:scale-[1.02] transition flex items-center justify-center gap-2"
            >
              <span>Join NexVia Network</span>
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/nextview/login"
              className="py-4 px-8 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm border border-white/10 backdrop-blur-md transition flex items-center justify-center gap-2"
            >
              <span>Member Login</span>
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
