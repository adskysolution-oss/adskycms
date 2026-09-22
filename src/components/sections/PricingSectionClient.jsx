'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Check,
  Zap,
  ShieldCheck,
  Clock,
  HelpCircle,
  ChevronRight,
  ArrowRight,
  Building2,
  Headphones,
  CheckCircle2,
  Star,
  Award
} from 'lucide-react';
import { CardSpotlight } from '@/components/ui/card-spotlight';

const PLAN_THEMES = {
  starter: {
    theme: 'emerald',
    cardBg: 'bg-gradient-to-br from-emerald-100/90 via-teal-50/70 to-white',
    border: 'border-2 border-emerald-300 hover:border-emerald-500 shadow-lg shadow-emerald-500/10 hover:shadow-2xl hover:shadow-emerald-500/20',
    accentLine: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    spotlightColor: 'rgba(16, 185, 129, 0.16)',
    blobColor: 'from-emerald-500/30 to-teal-500/20',
    badgeBg: 'bg-emerald-600 text-white border-emerald-600',
    priceGradient: 'text-emerald-700',
    checkBg: 'bg-emerald-100 border-emerald-300 text-emerald-700',
    buttonClass: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-600/30',
    tag: 'Starter MVP',
    highlightBadge: 'Fast Turnaround',
  },
  pro: {
    theme: 'blue',
    cardBg: 'bg-gradient-to-br from-blue-100/95 via-indigo-50/80 to-white',
    border: 'border-2 border-blue-600 shadow-2xl shadow-blue-600/25 ring-4 ring-blue-500/20 md:-translate-y-2',
    accentLine: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600',
    spotlightColor: 'rgba(37, 99, 235, 0.22)',
    blobColor: 'from-blue-500/35 to-indigo-600/25',
    badgeBg: 'bg-blue-600 text-white border-blue-600',
    priceGradient: 'text-blue-700',
    checkBg: 'bg-blue-100 border-blue-300 text-blue-700',
    buttonClass: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-xl shadow-blue-600/35',
    tag: 'Growth & Scale',
    highlightBadge: 'Recommended',
  },
  enterprise: {
    theme: 'purple',
    cardBg: 'bg-gradient-to-br from-purple-100/90 via-violet-50/70 to-white',
    border: 'border-2 border-purple-300 hover:border-purple-500 shadow-lg shadow-purple-500/10 hover:shadow-2xl hover:shadow-purple-500/20',
    accentLine: 'bg-gradient-to-r from-purple-600 to-violet-600',
    spotlightColor: 'rgba(147, 51, 234, 0.16)',
    blobColor: 'from-purple-500/30 to-violet-500/20',
    badgeBg: 'bg-purple-600 text-white border-purple-600',
    priceGradient: 'text-purple-700',
    checkBg: 'bg-purple-100 border-purple-300 text-purple-700',
    buttonClass: 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg shadow-purple-600/30',
    tag: 'Custom Scope',
    highlightBadge: 'Full Infrastructure',
  },
};

const PRICING_FAQ = [
  {
    q: 'Can I upgrade or customize my plan as my business expands?',
    a: 'Yes, absolutely. You can upgrade, add custom modules, or transition to a tailored enterprise architecture plan at any stage with prorated billing.',
    badge: 'Flexibility',
  },
  {
    q: 'Are there any hidden onboarding or deployment fees?',
    a: 'No hidden fees. Every deliverable, repository access, deployment pipeline, and testing milestone is itemized transparently in your scope document.',
    badge: 'Transparent',
  },
  {
    q: 'What payment and invoicing options do you support?',
    a: 'We support all major payment options: UPI, Corporate Netbanking, NEFT/RTGS, Credit/Debit Cards, and GST-compliant enterprise invoices.',
    badge: 'Billing',
  },
  {
    q: 'Do I get 100% intellectual property (IP) and code ownership?',
    a: 'Yes. Upon milestone completion and final settlement, you receive 100% full intellectual property rights, repository ownership, and architectural documentation.',
    badge: 'Ownership',
  },
];

export default function PricingSectionClient({ initialPlans = [] }) {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'

  const plans = initialPlans.map((plan, idx) => {
    let themeKey = 'starter';
    const nameLower = plan.name?.toLowerCase() || '';
    if (plan.highlighted || nameLower.includes('pro') || idx === 1) {
      themeKey = 'pro';
    } else if (nameLower.includes('enterprise') || idx === 2) {
      themeKey = 'enterprise';
    }
    const theme = PLAN_THEMES[themeKey];

    // Calculate price with 20% discount on yearly
    const displayPrice = billingCycle === 'yearly'
      ? Math.round(plan.price * 0.8)
      : plan.price;

    return {
      ...plan,
      themeKey,
      theme,
      displayPrice,
    };
  });

  return (
    <div className="w-full">
      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center mb-10 sm:mb-12">
        <div className="inline-flex items-center p-1.5 rounded-2xl bg-white border border-slate-200/90 shadow-md">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              billingCycle === 'monthly'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('yearly')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              billingCycle === 'yearly'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Yearly Commitment</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* 3 Distinctly-Colored Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-stretch">
        {plans.map((plan) => {
          const { theme } = plan;
          const isPro = plan.themeKey === 'pro';

          return (
            <CardSpotlight
              key={plan._id || plan.name}
              color={theme.spotlightColor}
              className={`relative rounded-3xl p-6 sm:p-7 transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                theme.cardBg
              } ${theme.border}`}
            >
              {/* Ambient Radiant Corner Glow Blob */}
              <div
                className={`absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br ${theme.blobColor} rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500`}
              />

              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  {/* Pro Most Popular Header Ribbon (Flush with top edge - never clipped!) */}
                  {isPro ? (
                    <div className="-mt-6 sm:-mt-7 -mx-6 sm:-mx-7 mb-5 py-2 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm">
                      <Star size={12} className="text-amber-300 fill-amber-300" />
                      <span>Most Popular Choice</span>
                    </div>
                  ) : (
                    /* Top Accent Line for non-Pro cards */
                    <div className="-mt-6 sm:-mt-7 -mx-6 sm:-mx-7 mb-5 h-1.5 bg-gradient-to-r from-slate-200 to-transparent" />
                  )}

                  {/* Top Badge & Sub-label Row */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className={`text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border shadow-2xs ${theme.badgeBg}`}>
                      {theme.tag}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {theme.highlightBadge}
                    </span>
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
                    {plan.name}
                  </h3>

                  {/* Plan Description (min-h keeps all cards evenly aligned) */}
                  <p className="text-slate-600 text-xs sm:text-sm mb-5 leading-relaxed min-h-[42px]">
                    {plan.description}
                  </p>

                  {/* Price Display */}
                  <div className="mb-6 pb-5 border-b border-slate-200/90 min-h-[75px] flex flex-col justify-center">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-slate-700">{plan.currency || '₹'}</span>
                      <span className={`text-4xl sm:text-5xl font-black tracking-tight ${theme.priceGradient}`}>
                        {plan.displayPrice?.toLocaleString() || plan.price?.toLocaleString()}
                      </span>
                      <span className="text-slate-500 text-xs sm:text-sm font-semibold ml-1">
                        /{billingCycle === 'yearly' ? 'year' : 'month'}
                      </span>
                    </div>
                    {billingCycle === 'yearly' ? (
                      <p className="text-[11px] font-bold text-emerald-600 mt-1">
                        Billed annually (Includes 20% discount)
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 mt-1">
                        Flexible monthly milestone terms
                      </p>
                    )}
                  </div>

                  {/* Features Checklist Header */}
                  <div className="space-y-1 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                      <Sparkles size={12} className="text-primary" />
                      <span>Included Deliverables:</span>
                    </span>
                  </div>

                  {/* Features Checklist */}
                  <ul className="space-y-2.5 mb-6">
                    {plan.features?.map((f, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-slate-800 text-xs sm:text-sm font-medium">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs ${theme.checkBg}`}>
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <span className="leading-snug">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Action CTA Button */}
                <div className="pt-2 mt-auto">
                  <Link
                    href={`/contact?plan=${encodeURIComponent(plan.name)}`}
                    className={`w-full py-3.5 px-6 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] ${theme.buttonClass}`}
                  >
                    <span>Choose {plan.name}</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </CardSpotlight>
          );
        })}
      </div>

      {/* Trust Badges Row */}
      <div className="mt-16 pt-10 border-t border-slate-200/80 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <ShieldCheck size={22} className="text-blue-600 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-slate-900">100% IP &amp; Code Rights</p>
            <p className="text-[11px] text-slate-500">Full repository handover</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <Zap size={22} className="text-amber-500 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-slate-900">48-Hour Sprint Kickoff</p>
            <p className="text-[11px] text-slate-500">Fast milestone start</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <Award size={22} className="text-emerald-600 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-slate-900">Transparent Billing</p>
            <p className="text-[11px] text-slate-500">No hidden fees or lock-ins</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <Headphones size={22} className="text-purple-600 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-slate-900">Dedicated Lead PM</p>
            <p className="text-[11px] text-slate-500">Direct Slack / WhatsApp sync</p>
          </div>
        </div>
      </div>

      {/* Pricing FAQ Section */}
      <div className="mt-20 max-w-4xl mx-auto">
        <div className="text-center mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <HelpCircle size={13} />
            <span>Pricing Details</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-3">
          {PRICING_FAQ.map((faq, idx) => (
            <details
              key={idx}
              className="group border border-slate-200/90 rounded-2xl bg-gradient-to-r from-blue-50/40 via-white to-indigo-50/20 overflow-hidden hover:border-blue-400 transition-all p-1 shadow-xs"
            >
              <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-bold text-slate-900 text-sm list-none">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 border border-blue-200">
                    {faq.badge}
                  </span>
                  <span>{faq.q}</span>
                </div>
                <ChevronRight size={16} className="text-primary group-open:rotate-90 transition-transform shrink-0 ml-3" />
              </summary>
              <div className="px-6 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Bottom Custom Enterprise Scope Banner */}
      <div className="mt-16 max-w-5xl mx-auto">
        <div className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white shadow-2xl overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-xs font-bold uppercase tracking-wider">
              <Building2 size={13} />
              <span>Tailored Enterprise Solutions</span>
            </span>
            <h4 className="text-2xl sm:text-3xl font-black">Need a Custom Scope or Infrastructure?</h4>
            <p className="text-blue-100 text-xs sm:text-sm max-w-xl leading-relaxed">
              We design dedicated enterprise sprint teams, custom microservices, and specialized cloud DevOps architecture tailored to your company.
            </p>
          </div>

          <Link
            href="/contact?plan=EnterpriseCustom"
            className="py-3.5 px-7 rounded-xl bg-white hover:bg-blue-50 text-blue-700 font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl hover:scale-105 transition-all shrink-0 relative z-10 cursor-pointer"
          >
            <span>Talk to Solutions Architect</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}
