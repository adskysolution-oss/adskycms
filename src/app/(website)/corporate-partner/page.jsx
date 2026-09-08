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
  Star,
  Building2,
  HelpCircle,
  Globe,
  Users,
  FileText,
} from 'lucide-react';

export const metadata = {
  title: 'Corporate Partner Program — AdSky Solution',
  description:
    'Join AdSky Solution Corporate Partner Program for regional agencies, enterprises, and service operators — structured task execution, transparent ledger, and referral commissions.',
};

const HOW_IT_WORKS = [
  { step: '01', title: 'Register', desc: 'Complete the Corporate Partner registration with your agency or business details.' },
  { step: '02', title: 'Document Verification', desc: 'Submit business registration & identity documents for KYC review.' },
  { step: '03', title: 'Verification & Approval', desc: 'Our operations team reviews and verifies your regional application.' },
  { step: '04', title: 'Partner Activation', desc: 'Your authorized partner account is activated with access to your dashboard.' },
  { step: '05', title: 'Operations & Onboarding', desc: 'Execute regional tasks, onboard CSC / MP Online kiosks, and manage field teams.' },
  { step: '06', title: 'Commissions & Payouts', desc: 'Earn referral incentives and withdraw earnings directly to Bank or UPI.' },
];

const BENEFITS = [
  { icon: Building2, title: 'Regional Hierarchy', desc: 'Operate with a structured downline: Corporate Vendor → Sub-Vendor → Team Leader → Executive.' },
  { icon: BarChart3, title: 'Structured Task Execution', desc: 'Receive and execute tasks through your dedicated dashboard with full tracking and reporting.' },
  { icon: Wallet, title: 'Referral Commissions', desc: 'Earn commissions for verified CSC / MP Online kiosk onboarding and service referrals.' },
  { icon: Globe, title: 'Kiosk Onboarding Incentives', desc: 'Facilitate ₹100 activation incentives for verified kiosk onboardings in your region.' },
  { icon: ShieldCheck, title: 'Transparent Ledger', desc: 'Full audit trail of all transactions, payouts, and commissions in your partner dashboard.' },
  { icon: FileText, title: 'Direct Bank / UPI Withdrawals', desc: 'Withdraw earned commissions directly to your registered bank account or UPI ID.' },
];

const WHO_CAN_JOIN = [
  'Regional agencies with field operations capacity',
  'Enterprises and SMEs seeking referral network opportunities',
  'Individuals or organizations operating CSC / MP Online centers',
  'Service distributors and field onboarding agents',
  'Eligible business organizations in tier-2 and tier-3 cities',
];

const FAQ = [
  {
    q: 'Who is eligible to become a Corporate Partner?',
    a: 'Eligible applicants include regional agencies, enterprises, CSC/MP Online service operators, and businesses with field operations capacity who can complete the verification process.',
  },
  {
    q: 'What documents are required for registration?',
    a: 'Required documents include business identity proof, address verification, and relevant business registration documents presented during onboarding.',
  },
  {
    q: 'How long does the verification and approval process take?',
    a: 'Verification is conducted by our operations team after document submission. Processing typically takes 24 to 48 hours based on document completeness.',
  },
  {
    q: 'How are commissions calculated and paid out?',
    a: 'Verified commissions are credited to your Corporate Partner wallet in real time and can be withdrawn via Direct Bank Transfer or UPI.',
  },
  {
    q: 'Can I build a regional field team beneath me?',
    a: 'Yes. The Corporate Partner hierarchy supports Corporate Vendor → Sub-Vendor → Team Leader → Executive tiers, allowing you to manage and scale your regional operations.',
  },
];

export default function CorporatePartnerPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white pt-24 pb-20">
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-16 md:py-24 border-b border-white/5">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_30%,rgba(37,99,235,0.15),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(96,165,250,0.1),transparent_50%)]" />
        <div className="container-custom relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary-light border border-primary/20 backdrop-blur-md">
              <Briefcase size={14} className="text-primary-light" />
              <span>AdSky Solution Partner Ecosystem</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] text-white">
              Corporate Partner<br />
              <span className="gradient-text">Program</span>
            </h1>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto font-normal">
              A structured partnership for regional agencies, enterprises, and businesses to scale operations through verified referrals, kiosk verification, and multi-tier task execution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/nextview/register"
                className="btn-primary !py-4 !px-8 !rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/25 hover:scale-[1.02] transition"
              >
                <span>Become a Corporate Partner</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/nextview/login"
                className="py-4 px-8 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm border border-white/10 backdrop-blur-md transition flex items-center justify-center gap-2"
              >
                <span>Partner Portal Login</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT IS CORPORATE PARTNER ────────────────────────────── */}
      <section className="py-20 border-b border-white/5">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary-light">
                <Briefcase size={14} /> <span>What Is the Program?</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
                Empowering Regional Growth &amp; Field Infrastructure
              </h2>
              <p className="text-text-secondary leading-relaxed text-sm md:text-base">
                The AdSky Solution Corporate Partner Program empowers regional agencies and enterprises to operate as authorized field partners. Partners manage service referrals, CSC &amp; MP Online kiosk verification, and structured task assignments with direct wallet payouts.
              </p>
              <p className="text-text-secondary leading-relaxed text-sm md:text-base">
                With a deterministic hierarchy—Corporate Vendor → Sub-Vendor → Team Leader → Executive—partners gain full management tools and real-time ledger visibility.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {BENEFITS.slice(0, 4).map((b) => (
                <div key={b.title} className="p-6 rounded-2xl bg-surface border border-white/5 hover:border-primary/40 transition duration-300 space-y-3 group">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-light group-hover:scale-110 transition-transform">
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

      {/* ── WHO CAN JOIN & HIERARCHY ─────────────────────────────── */}
      <section className="py-20 bg-dark-light/50 border-b border-white/5">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary-light">
                <Users size={14} /> <span>Eligibility</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white">Who Can Join?</h2>
              <p className="text-text-secondary text-sm leading-relaxed">
                The Corporate Partner Program is designed for regional agencies, field distributors, and business operators ready to expand their regional footprint.
              </p>
              <ul className="space-y-3 pt-2">
                {WHO_CAN_JOIN.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-text-secondary">
                    <CheckCircle2 className="w-5 h-5 text-primary-light shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-8 rounded-3xl bg-surface border border-white/10 shadow-2xl space-y-6">
              <h3 className="font-black text-white text-xl">Operational Hierarchy</h3>
              <div className="space-y-3">
                {[
                  { role: 'Corporate Vendor', desc: 'Top-tier authorized regional partner', color: 'bg-blue-500' },
                  { role: 'Corporate Sub-Vendor', desc: 'Regional sub-partner under a Vendor', color: 'bg-blue-400' },
                  { role: 'Team Leader', desc: 'Manages regional executive teams', color: 'bg-sky-400' },
                  { role: 'Corporate Executive', desc: 'Direct field execution & onboarding', color: 'bg-cyan-400' },
                ].map((tier) => (
                  <div key={tier.role} className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${tier.color} shrink-0 shadow-lg`} />
                    <div className="flex-1 p-3.5 rounded-xl bg-dark/60 border border-white/5">
                      <div className="font-bold text-sm text-white">{tier.role}</div>
                      <div className="text-xs text-text-muted">{tier.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="py-20 border-b border-white/5">
        <div className="container-custom">
          <div className="text-center max-w-xl mx-auto mb-14 space-y-3">
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary-light">
              <ChevronRight size={14} /> <span>Process</span>
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white">How Partnership Works</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="p-6 rounded-2xl border border-white/5 bg-surface hover:border-primary/40 transition duration-300 space-y-3">
                <span className="text-3xl font-black text-primary/30">{item.step}</span>
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
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary-light">
              <HelpCircle size={14} /> <span>FAQ</span>
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group border border-white/5 rounded-2xl bg-surface overflow-hidden hover:border-primary/30 transition p-1"
              >
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-bold text-white text-sm list-none">
                  <span>{item.q}</span>
                  <ChevronRight size={16} className="text-primary-light group-open:rotate-90 transition-transform shrink-0 ml-3" />
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
      <section className="py-20 bg-gradient-to-br from-primary/20 via-surface to-dark relative overflow-hidden">
        <div className="container-custom text-center max-w-3xl space-y-6 relative z-10">
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
            Ready to Partner With Us?
          </h2>
          <p className="text-text-secondary text-sm md:text-base leading-relaxed">
            Register today, submit your documents, and join the AdSky Solution Corporate Partner network.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/nextview/register"
              className="btn-primary !py-4 !px-8 !rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/25 hover:scale-[1.02] transition"
            >
              <span>Register as Corporate Partner</span>
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/nextview/login"
              className="py-4 px-8 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm border border-white/10 backdrop-blur-md transition flex items-center justify-center gap-2"
            >
              <span>Partner Login</span>
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
