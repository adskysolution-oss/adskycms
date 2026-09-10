'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Users,
  TrendingUp,
  Trophy,
  Target,
  ArrowRight,
  Play,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  BarChart3,
} from 'lucide-react';

const PILLARS = [
  {
    icon: Users,
    title: 'PEOPLE',
    subtitle: 'Connect',
    desc: 'Real People, Real Opportunities',
    badgeStyle: 'bg-blue-50 text-blue-600 border-blue-200'
  },
  {
    icon: TrendingUp,
    title: 'OPPORTUNITIES',
    subtitle: 'Build',
    desc: 'More Possibilities, More Success',
    badgeStyle: 'bg-amber-50 text-amber-600 border-amber-200'
  },
  {
    icon: Trophy,
    title: 'GROWTH',
    subtitle: 'Achieve',
    desc: 'Your Goals, Our Support',
    badgeStyle: 'bg-emerald-50 text-emerald-600 border-emerald-200'
  },
  {
    icon: Target,
    title: 'FREEDOM',
    subtitle: 'Live Better',
    desc: 'Financial Freedom, A Brighter Future',
    badgeStyle: 'bg-rose-50 text-rose-600 border-rose-200'
  }
];

const MILESTONES = ['VISION', 'PLANNING', 'DISCIPLINE', 'ACTION', 'SUCCESS'];

export default function NexViaHeroBanner({ imageSrc = '/nexvia-hero-banner.jpg' }) {
  return (
    <section className="relative w-full bg-gradient-to-b from-sky-50/60 via-white to-slate-50 border-b border-slate-200/90 overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute -top-24 -left-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

        {/* ── MAIN 2-COLUMN HERO LAYOUT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">

          {/* ════════════════ LEFT COLUMN: Content & CTAs (lg:col-span-7) ════════════════ */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-5 text-center lg:text-left">

            {/* Top Brand Header: Official Logo + Matrix Badge */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <div className="relative w-44 sm:w-52 h-14 sm:h-16 shrink-0">
                <Image
                  src="/nexvia.png"
                  alt="NexVia — Connect • Build • Grow"
                  fill
                  priority
                  className="object-contain object-center lg:object-left drop-shadow-xs"
                />
              </div>

              {/* <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 border border-amber-500/25 shadow-xs">
                <Sparkles size={13} className="text-amber-600" />
                <span>Deterministic 3×15 Matrix</span>
              </div> */}
            </div>

            {/* Slogans & Primary Headline */}
            <div className="space-y-2">
              <p className="text-xs sm:text-sm font-black tracking-widest uppercase text-blue-700">
                A STRONGER TODAY • A BRIGHTER TOMORROW
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
                NEXVIA SMART FD<br />
                <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-amber-500 bg-clip-text text-transparent">
                  CONNECT • BUILD • GROW
                </span>
              </h1>
            </div>

            {/* Navy Sub-Bar Pill */}
            <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-1 px-4 py-2 rounded-xl bg-blue-950 text-white text-xs sm:text-sm font-medium shadow-sm mx-auto lg:mx-0 max-w-fit border border-blue-900">
              <span className="text-amber-400 font-bold">Build Your Network</span>
              <span className="text-blue-400/50">•</span>
              <span className="text-white font-medium">Create Opportunities</span>
              <span className="text-blue-400/50">•</span>
              <span className="text-emerald-400 font-bold">Grow Together</span>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Join a transparent, verified referral platform designed for individuals and enterprises seeking exponential growth, verified security, and deterministic tier rewards.
            </p>

            {/* ── MOBILE-ONLY IMAGE: Visible directly on Phone UI! ── */}
            <div className="block lg:hidden w-full my-2">
              <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden shadow-lg border-2 border-white bg-slate-900 group">
                <Image
                  src={imageSrc}
                  alt="NexVia Vision - Overlooking Tomorrow"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                {/* Floating Mobile Badge */}
                <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full border border-white shadow-sm">
                  <span className="text-[10px] font-bold text-blue-950 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Together We Grow
                  </span>
                </div>

                <div className="absolute bottom-2.5 inset-x-2.5 p-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-md flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider">
                    Small Steps • Big Futures
                  </span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                    Roadmap
                  </span>
                </div>
              </div>
            </div>

            {/* ── 4 PILLARS CARDS (2 cols on Mobile, 4 cols on Desktop) ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {PILLARS.map((p) => {
                const IconComp = p.icon;
                return (
                  <div
                    key={p.title}
                    className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-400/50 transition duration-200 text-left flex flex-col justify-between group"
                  >
                    <div>
                      <div className={`w-8 h-8 rounded-xl ${p.badgeStyle} border flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform`}>
                        <IconComp size={16} />
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                        {p.subtitle}
                      </span>
                      <h4 className="text-xs font-black text-slate-900 leading-tight">
                        {p.title}
                      </h4>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2">
                      {p.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* ── CTA BUTTONS (Prominent & Clear) ── */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Link
                href="/nextview/register"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-blue-950 font-extrabold text-sm shadow-lg shadow-amber-500/25 hover:scale-[1.02] active:scale-95 transition flex items-center justify-center gap-2"
              >
                <span>JOIN NEXVIA</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/nextview/login"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-2xs hover:border-slate-400 transition flex items-center justify-center gap-2"
              >
                <span>LOGIN</span>
                <ChevronRight size={16} />
              </Link>
              <a
                href="#income-plan"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-sm border border-blue-200 shadow-2xs transition flex items-center justify-center gap-2"
              >
                <BarChart3 size={16} className="text-blue-700" />
                <span>VIEW INCOME PLAN</span>
              </a>
            </div>

          </div>

          {/* ════════════════ RIGHT COLUMN: Crisp, HD Image Showcase (lg:col-span-5) ════════════════ */}
          <div className="hidden lg:block lg:col-span-5 relative">

            {/* Visual Frame Card (Crystal clear, NO washed-out white gradient!) */}
            <div className="relative rounded-3xl overflow-hidden border-2 border-white shadow-2xl bg-slate-900 group">
              <div className="relative w-full aspect-[16/11]">
                <Image
                  src={imageSrc}
                  alt="NexVia Vision - Businessman Overlooking Sunrise City"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Subtle bottom vignette so overlays pop */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                {/* Floating Top-Left: "Together We Grow" */}
                <div className="absolute top-3.5 left-3.5 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white shadow-md">
                  <span className="text-xs font-black text-blue-950 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Together We Grow
                  </span>
                </div>

                {/* Floating Top-Right: "A Better Tomorrow Together" */}
                <div className="absolute top-3.5 right-3.5 bg-blue-950/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-blue-400/30 text-white shadow-md">
                  <span className="text-[11px] font-semibold text-blue-200">
                    A Better Tomorrow Together
                  </span>
                </div>

                {/* Bottom Overlay Card on Image */}
                <div className="absolute bottom-3.5 inset-x-3.5 p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-lg flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-black tracking-wider text-amber-600">
                      Career Progression
                    </div>
                    <div className="text-xs font-black text-slate-900">
                      Small Steps • Big Futures
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                    Step-by-Step
                  </span>
                </div>
              </div>
            </div>

            {/* Directional Milestone Roadmap Bar Below Image */}
            <div className="mt-3 p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider text-center mb-1.5">
                The NexVia Success Roadmap
              </div>
              <div className="flex items-center justify-between gap-1 overflow-x-auto">
                {MILESTONES.map((step, idx) => (
                  <div key={step} className="flex items-center gap-1 shrink-0">
                    <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${idx === MILESTONES.length - 1
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700'
                      }`}>
                      {step}
                    </div>
                    {idx < MILESTONES.length - 1 && (
                      <span className="text-slate-300 text-[10px] font-bold">→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* ── SLEEK BOTTOM NAVY FOOTER STRIP ── */}
        <div className="mt-8 rounded-2xl bg-blue-950 text-white px-5 py-3.5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 border border-blue-900">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm font-semibold tracking-wide text-blue-100">
            <div className="flex items-center gap-2">
              <span className="text-amber-400">🤝</span>
              <span>ONE TEAM</span>
            </div>
            <span className="text-blue-700 hidden sm:inline">|</span>
            <div className="flex items-center gap-2">
              <span className="text-amber-400">🎯</span>
              <span>ONE GOAL</span>
            </div>
            <span className="text-blue-700 hidden sm:inline">|</span>
            <div className="flex items-center gap-2">
              <span className="text-amber-400">💡</span>
              <span>ONE VISION</span>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-slate-300 flex items-center gap-2">
            <span className="font-extrabold tracking-wider text-white">NEXVIA</span>
            <span className="text-amber-400">•</span>
            <span className="text-blue-200">CONNECT</span>
            <span>•</span>
            <span className="text-blue-200">BUILD</span>
            <span>•</span>
            <span className="text-amber-400 font-bold">GROW</span>
          </div>
        </div>

      </div>
    </section>
  );
}
