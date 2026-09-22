import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  ShieldCheck,
  Wallet,
  BarChart3,
  ChevronRight,
  Building2,
  HelpCircle,
  Globe,
  Users,
  FileText,
  Sparkles,
  Zap,
  Layers,
  Award,
  ArrowUpRight,
  Compass
} from 'lucide-react';
import { FloatingOrb, DottedGrid, GeometricAccent, GlowBlob } from '@/components/ui/BackgroundEffects';

export const metadata = {
  title: 'Corporate Partner Program — AdSky Solution',
  description:
    'Join AdSky Solution Corporate Partner Program for regional agencies, enterprises, and service operators — structured task execution, transparent ledger, and partner commissions.',
};

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Register Profile',
    desc: 'Complete the Corporate Partner registration with your agency or business details.',
    theme: 'blue',
    cardBg: 'bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-white',
    border: 'border-blue-200/90 hover:border-blue-400',
    numberBg: 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25',
    shadowHover: 'hover:shadow-blue-500/15',
  },
  {
    step: '02',
    title: 'KYC Verification',
    desc: 'Submit business registration & identity documents for fast compliance review.',
    theme: 'cyan',
    cardBg: 'bg-gradient-to-br from-cyan-50/90 via-sky-50/40 to-white',
    border: 'border-cyan-200/90 hover:border-cyan-400',
    numberBg: 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/25',
    shadowHover: 'hover:shadow-cyan-500/15',
  },
  {
    step: '03',
    title: 'Operational Approval',
    desc: 'Our enterprise operations team verifies and approves your regional jurisdiction.',
    theme: 'purple',
    cardBg: 'bg-gradient-to-br from-purple-50/90 via-violet-50/40 to-white',
    border: 'border-purple-200/90 hover:border-purple-400',
    numberBg: 'bg-gradient-to-br from-purple-600 to-violet-600 text-white shadow-md shadow-purple-500/25',
    shadowHover: 'hover:shadow-purple-500/15',
  },
  {
    step: '04',
    title: 'Partner Activation',
    desc: 'Authorized partner credentials activated with direct access to executive dashboard.',
    theme: 'emerald',
    cardBg: 'bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white',
    border: 'border-emerald-200/90 hover:border-emerald-400',
    numberBg: 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25',
    shadowHover: 'hover:shadow-emerald-500/15',
  },
  {
    step: '05',
    title: 'Task & Kiosk Operations',
    desc: 'Execute regional tasks, onboard CSC / MP Online kiosks, and scale field teams.',
    theme: 'amber',
    cardBg: 'bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-white',
    border: 'border-amber-200/90 hover:border-amber-400',
    numberBg: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/25',
    shadowHover: 'hover:shadow-amber-500/15',
  },
  {
    step: '06',
    title: 'Commissions & Payouts',
    desc: 'Earn real-time verified incentives and withdraw funds directly to Bank or UPI.',
    theme: 'rose',
    cardBg: 'bg-gradient-to-br from-rose-50/90 via-pink-50/40 to-white',
    border: 'border-rose-200/90 hover:border-rose-400',
    numberBg: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/25',
    shadowHover: 'hover:shadow-rose-500/15',
  },
];

const BENEFITS = [
  {
    icon: Building2,
    badge: 'Enterprise Structure',
    title: 'Regional Hierarchy',
    desc: 'Operate with a structured downline: Corporate Vendor → Sub-Vendor → Team Leader → Executive.',
    cardBg: 'bg-gradient-to-br from-blue-100/90 via-indigo-50/70 to-white',
    border: 'border-blue-300/90 hover:border-blue-500',
    iconBg: 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30',
    pillBg: 'bg-blue-600 text-white border-blue-600',
    blobColor: 'from-blue-500/30 to-indigo-500/20',
  },
  {
    icon: BarChart3,
    badge: 'Operations',
    title: 'Structured Task Execution',
    desc: 'Receive and execute tasks through your dedicated dashboard with full tracking, SLAs, and reporting.',
    cardBg: 'bg-gradient-to-br from-emerald-100/90 via-teal-50/70 to-white',
    border: 'border-emerald-300/90 hover:border-emerald-500',
    iconBg: 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30',
    pillBg: 'bg-emerald-600 text-white border-emerald-600',
    blobColor: 'from-emerald-500/30 to-teal-500/20',
  },
  {
    icon: Wallet,
    badge: 'Direct Earnings',
    title: 'Partner Commissions',
    desc: 'Earn verified commissions for CSC / MP Online kiosk onboarding and regional business facilitation.',
    cardBg: 'bg-gradient-to-br from-amber-100/90 via-orange-50/70 to-white',
    border: 'border-amber-300/90 hover:border-amber-500',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30',
    pillBg: 'bg-amber-600 text-white border-amber-600',
    blobColor: 'from-amber-500/30 to-orange-500/20',
  },
  {
    icon: Globe,
    badge: 'Kiosk Network',
    title: 'Kiosk Onboarding Incentives',
    desc: 'Facilitate ₹100 activation incentives for verified kiosk onboardings and field centers in your region.',
    cardBg: 'bg-gradient-to-br from-purple-100/90 via-violet-50/70 to-white',
    border: 'border-purple-300/90 hover:border-purple-500',
    iconBg: 'bg-gradient-to-br from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/30',
    pillBg: 'bg-purple-600 text-white border-purple-600',
    blobColor: 'from-purple-500/30 to-violet-500/20',
  },
  {
    icon: ShieldCheck,
    badge: 'Security & Audit',
    title: 'Transparent Ledger',
    desc: 'Full immutable audit trail of all transactions, payouts, and commissions in your partner dashboard.',
    cardBg: 'bg-gradient-to-br from-cyan-100/90 via-sky-50/70 to-white',
    border: 'border-cyan-300/90 hover:border-cyan-500',
    iconBg: 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30',
    pillBg: 'bg-cyan-600 text-white border-cyan-600',
    blobColor: 'from-cyan-500/30 to-blue-500/20',
  },
  {
    icon: FileText,
    badge: 'Instant Payouts',
    title: 'Direct Bank / UPI Withdrawals',
    desc: 'Withdraw earned commissions directly to your registered bank account or verified UPI ID with fast settlement.',
    cardBg: 'bg-gradient-to-br from-rose-100/90 via-pink-50/70 to-white',
    border: 'border-rose-300/90 hover:border-rose-500',
    iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30',
    pillBg: 'bg-rose-600 text-white border-rose-600',
    blobColor: 'from-rose-500/30 to-pink-500/20',
  },
];

const WHO_CAN_JOIN = [
  { title: 'Regional Agencies & Franchisees', desc: 'Agencies with on-ground team operations capacity', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { title: 'Enterprises & Growing SMEs', desc: 'Businesses seeking structured partner network opportunities', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { title: 'CSC / MP Online Kiosk Operators', desc: 'Individuals or organizations operating citizen service centers', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { title: 'Service Distributors & Field Agents', desc: 'Direct onboarding executives with regional merchant reach', color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { title: 'Tier-2 & Tier-3 Business Entities', desc: 'Authorized organizations expanding local digital service delivery', color: 'text-rose-600 bg-rose-50 border-rose-200' },
];

const FAQ = [
  {
    q: 'Who is eligible to become a Corporate Partner?',
    a: 'Eligible applicants include regional agencies, enterprises, CSC/MP Online service operators, and businesses with field operations capacity who can complete the verification process.',
    badge: 'Eligibility',
  },
  {
    q: 'What documents are required for registration?',
    a: 'Required documents include business identity proof (PAN/GSTIN), address verification, and relevant business registration documents presented during onboarding.',
    badge: 'Documents',
  },
  {
    q: 'How long does the verification and approval process take?',
    a: 'Verification is conducted by our operations team after document submission. Processing typically takes 24 to 48 hours based on document completeness.',
    badge: 'Timeline',
  },
  {
    q: 'How are commissions calculated and paid out?',
    a: 'Verified commissions are credited to your Corporate Partner wallet in real time and can be withdrawn via Direct Bank Transfer or UPI.',
    badge: 'Payouts',
  },
  {
    q: 'Can I build a regional field team beneath me?',
    a: 'Yes. The Corporate Partner hierarchy supports Corporate Vendor → Sub-Vendor → Team Leader → Executive tiers, allowing you to manage and scale your regional operations.',
    badge: 'Hierarchy',
  },
];

export default function CorporatePartnerPage() {
  return (
    <div className="min-h-screen bg-slate-50/40 text-slate-900 pt-24 pb-20">
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-16 md:py-24 border-b border-slate-200/80 bg-gradient-to-b from-blue-50/60 via-white to-slate-50/50">
        {/* Background Decorative Accents */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <GlowBlob color="blue" size="w-[520px] h-[520px]" className="-top-28 -right-32" opacity={0.15} />
          <GlowBlob color="purple" size="w-[420px] h-[420px]" className="bottom-0 -left-28" opacity={0.12} delay="3s" />
          <FloatingOrb variant="blue" size={40} className="top-1/4 -left-5 hidden lg:block" animation="float-slow" delay="1s" />
          <FloatingOrb variant="peach" size={36} className="bottom-1/3 -right-4 hidden lg:block" animation="float-reverse" delay="2s" />
          <DottedGrid cols={6} rows={6} spacing={16} color="#3B82F6" opacity={0.25} className="top-1/4 left-4 hidden md:block" />
          <GeometricAccent type="sparkle" size={14} color="#06B6D4" opacity={0.35} className="top-20 right-1/4 hidden md:block" delay="1.5s" />
        </div>

        <div className="container-custom relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100/90 text-blue-700 border border-blue-300/80 shadow-xs backdrop-blur-md">
              <Briefcase size={14} className="text-blue-600" />
              <span>AdSky Solution Partner Ecosystem</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] text-slate-900">
              Corporate Partner<br />
              <span className="gradient-text">Program</span>
            </h1>

            <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
              A structured partnership for regional agencies, enterprises, and businesses to scale operations through verified onboardings, kiosk verification, and multi-tier task execution.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link
                href="/nextview/register"
                className="py-4 px-8 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-blue-600/25 hover:shadow-2xl hover:shadow-blue-600/35 hover:scale-[1.02] transition-all"
              >
                <span>Become a Corporate Partner</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/nextview/login"
                className="py-4 px-8 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300/80 hover:border-blue-300 transition flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                <span>Partner Portal Login</span>
                <ChevronRight size={16} />
              </Link>
            </div>

            {/* Micro Highlights Pill Row */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-semibold text-slate-600">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/80 shadow-2xs">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>PAN India Kiosk Network</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/80 shadow-2xs">
                <CheckCircle2 size={13} className="text-blue-600" />
                <span>Guaranteed Ledger Payouts</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/80 shadow-2xs">
                <CheckCircle2 size={13} className="text-purple-600" />
                <span>4-Tier Operational Scale</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT IS CORPORATE PARTNER (6 DISTINCT COLORFUL BENEFIT CARDS) ── */}
      <section className="py-20 border-b border-slate-200/80 bg-white relative overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold uppercase tracking-wider">
              <Compass size={13} />
              <span>Program Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Empowering Regional Growth &amp; <span className="gradient-text">Field Infrastructure</span>
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              Operate as an authorized field partner with full management tools, CSC / MP Online kiosk verification, and direct ledger visibility.
            </p>
          </div>

          {/* 6 Rich, Colorful Benefit Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
            {BENEFITS.map((b, i) => {
              const IconComp = b.icon;
              return (
                <div
                  key={b.title}
                  className={`group relative rounded-3xl p-6 sm:p-7 border transition-all duration-300 flex flex-col justify-between overflow-hidden ${b.cardBg} ${b.border} shadow-[0_4px_20px_-6px_rgba(0,0,0,0.06)] hover:shadow-xl hover:-translate-y-1.5`}
                >
                  {/* Ambient Corner Glow Blob */}
                  <div
                    className={`absolute -top-14 -right-14 w-40 h-40 bg-gradient-to-br ${b.blobColor} rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500`}
                  />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-3 mb-5">
                      <div className={`w-13 h-13 rounded-2xl ${b.iconBg} flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-1`}>
                        <IconComp size={24} />
                      </div>
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-2xs border ${b.pillBg}`}>
                        {b.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold text-slate-900 mb-2.5 group-hover:text-primary transition-colors">
                      {b.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {b.desc}
                    </p>
                  </div>

                  <div className="relative z-10 pt-4 mt-5 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5 text-primary group-hover:gap-2 transition-all">
                      <span>Explore Capability</span>
                      <ArrowRight size={13} />
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold">0{i + 1}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── WHO CAN JOIN & HIERARCHY ─────────────────────────────── */}
      <section className="py-20 bg-gradient-to-b from-slate-50 via-blue-50/30 to-slate-50 border-b border-slate-200/80 relative overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Eligibility Cards */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
                <Users size={13} /> <span>Eligibility Criteria</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Who Can Join As A <span className="gradient-text">Partner?</span>
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                The Corporate Partner Program is designed for regional agencies, field distributors, and business operators ready to expand their regional footprint.
              </p>

              <div className="space-y-3 pt-2">
                {WHO_CAN_JOIN.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex items-start gap-3.5 group"
                  >
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 mt-0.5 ${item.color}`}>
                      <CheckCircle2 size={16} className="stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Operational Hierarchy (Vibrant 4-tier Stack) */}
            <div className="relative rounded-3xl bg-white border border-slate-200/90 shadow-2xl p-7 sm:p-9 overflow-hidden">
              {/* Decorative Accent Stripe */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500" />
              <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between gap-3 pb-6 border-b border-slate-100 mb-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                    Tiered Governance
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-2xl mt-2">
                    Operational Hierarchy
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
                  <Layers size={22} />
                </div>
              </div>

              <div className="space-y-3.5 relative">
                {/* Vertical connecting line */}
                <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-600 via-sky-500 to-emerald-500 hidden sm:block" />

                {[
                  {
                    role: 'Corporate Vendor',
                    desc: 'Top-tier authorized regional partner with territory governance',
                    tier: 'Tier 1',
                    badgeBg: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25',
                    cardBg: 'bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-white border-blue-200',
                  },
                  {
                    role: 'Corporate Sub-Vendor',
                    desc: 'Regional sub-partner operating under a Corporate Vendor',
                    tier: 'Tier 2',
                    badgeBg: 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/25',
                    cardBg: 'bg-gradient-to-br from-cyan-50/90 via-sky-50/40 to-white border-cyan-200',
                  },
                  {
                    role: 'Team Leader',
                    desc: 'Manages regional executive teams and service delivery metrics',
                    tier: 'Tier 3',
                    badgeBg: 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-md shadow-purple-500/25',
                    cardBg: 'bg-gradient-to-br from-purple-50/90 via-violet-50/40 to-white border-purple-200',
                  },
                  {
                    role: 'Corporate Executive',
                    desc: 'Direct field execution, kiosk verification & agent onboarding',
                    tier: 'Tier 4',
                    badgeBg: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25',
                    cardBg: 'bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white border-emerald-200',
                  },
                ].map((tier, idx) => (
                  <div key={tier.role} className="flex items-center gap-3.5 relative z-10">
                    <div className={`w-10 h-10 rounded-xl ${tier.badgeBg} flex items-center justify-center text-xs font-black shrink-0`}>
                      0{idx + 1}
                    </div>
                    <div className={`flex-1 p-3.5 rounded-2xl border ${tier.cardBg} shadow-2xs hover:shadow-md transition-shadow`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-sm text-slate-900">{tier.role}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/90 border border-slate-200 text-slate-600">
                          {tier.tier}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 leading-tight mt-1">{tier.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS (6 DISTINCT VIBRANT PROCESS CARDS) ───────── */}
      <section className="py-20 border-b border-slate-200/80 bg-white relative overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="text-center max-w-xl mx-auto mb-14 space-y-3">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold uppercase tracking-wider">
              <ChevronRight size={14} /> <span>Step-by-Step</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How Partnership <span className="gradient-text">Works</span>
            </h2>
            <p className="text-slate-500 text-sm">
              Simple 6-stage lifecycle to become an active regional operator.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((item) => (
              <div
                key={item.step}
                className={`p-6 sm:p-7 rounded-3xl border transition-all duration-300 space-y-3 shadow-xs hover:shadow-xl hover:-translate-y-1.5 ${item.cardBg} ${item.border} ${item.shadowHover}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={`w-10 h-10 rounded-xl ${item.numberBg} text-sm font-black flex items-center justify-center`}>
                    {item.step}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/90 border border-slate-200 text-slate-600 shadow-2xs">
                    Stage {item.step}
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg pt-1">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ACCORDIONS (COLOR ACCENTED) ───────────────────────── */}
      <section className="py-20 border-b border-slate-200/80 bg-slate-50/50 relative overflow-hidden">
        <div className="container-custom max-w-4xl relative z-10">
          <div className="text-center mb-14 space-y-3">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold uppercase tracking-wider">
              <HelpCircle size={14} /> <span>Knowledge Base</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
          </div>

          <div className="space-y-3.5">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group border border-slate-200/90 rounded-2xl bg-gradient-to-r from-blue-50/40 via-white to-indigo-50/20 overflow-hidden hover:border-blue-400/80 transition-all p-1 shadow-xs"
              >
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-extrabold text-slate-900 text-sm sm:text-[15px] list-none">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 border border-blue-200">
                      {item.badge}
                    </span>
                    <span>{item.q}</span>
                  </div>
                  <ChevronRight size={16} className="text-primary group-open:rotate-90 transition-transform shrink-0 ml-3" />
                </summary>
                <div className="px-6 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA SECTION (VIBRANT BLUE-INDIGO HIGH IMPACT BANNER) ── */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 text-white relative overflow-hidden">
        {/* Ambient Lighting Blobs inside CTA */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/25 rounded-full blur-3xl pointer-events-none" />

        <div className="container-custom text-center max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Sparkles size={14} className="text-yellow-300" />
            <span>Launch Your Agency Operations</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
            Ready to Partner With Us?
          </h2>

          <p className="text-blue-100 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            Register today, submit your documents, and join the AdSky Solution Corporate Partner network to unlock regional growth.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-3">
            <Link
              href="/nextview/register"
              className="py-4 px-8 rounded-2xl bg-white hover:bg-blue-50 text-blue-700 font-extrabold text-sm flex items-center justify-center gap-2 shadow-2xl hover:shadow-white/25 hover:scale-[1.02] transition-all"
            >
              <span>Register as Corporate Partner</span>
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/nextview/login"
              className="py-4 px-8 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/30 backdrop-blur-md transition flex items-center justify-center gap-2"
            >
              <span>Partner Portal Login</span>
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
