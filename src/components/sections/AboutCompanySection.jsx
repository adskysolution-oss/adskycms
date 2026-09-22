'use client';

import { Building2, CheckCircle2, Sparkles, Check } from 'lucide-react';
import { FloatingOrb, DottedGrid, CurvedLine, GlowBlob } from '../ui/BackgroundEffects';

export default function AboutCompanySection() {
  const capabilities = [
    {
      text: 'IT Development & Software Solutions',
      cardBg: 'bg-gradient-to-br from-blue-100/90 via-indigo-50/70 to-white',
      border: 'border-blue-200/90 hover:border-blue-400',
      checkBg: 'bg-blue-600 text-white shadow-sm shadow-blue-500/25',
    },
    {
      text: 'Website & Application Development',
      cardBg: 'bg-gradient-to-br from-purple-100/90 via-violet-50/70 to-white',
      border: 'border-purple-200/90 hover:border-purple-400',
      checkBg: 'bg-purple-600 text-white shadow-sm shadow-purple-500/25',
    },
    {
      text: 'Recruitment & Bulk Hiring Solutions',
      cardBg: 'bg-gradient-to-br from-emerald-100/90 via-teal-50/70 to-white',
      border: 'border-emerald-200/90 hover:border-emerald-400',
      checkBg: 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/25',
    },
    {
      text: 'Vendor Network & Talent Management',
      cardBg: 'bg-gradient-to-br from-amber-100/90 via-orange-50/70 to-white',
      border: 'border-amber-200/90 hover:border-amber-400',
      checkBg: 'bg-amber-600 text-white shadow-sm shadow-amber-500/25',
    },
    {
      text: 'Business Consulting & Digital Growth',
      cardBg: 'bg-gradient-to-br from-cyan-100/90 via-sky-50/70 to-white',
      border: 'border-cyan-200/90 hover:border-cyan-400',
      checkBg: 'bg-cyan-600 text-white shadow-sm shadow-cyan-500/25',
    },
  ];

  return (
    <section className="section-padding relative overflow-hidden bg-slate-50/50 border-b border-slate-200/70">
      {/* Background Effect Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <GlowBlob color="blue" size="w-[450px] h-[450px]" className="-top-20 -right-20" opacity={0.11} />
        <GlowBlob color="purple" size="w-[350px] h-[350px]" className="bottom-0 -left-20" opacity={0.09} delay="4s" />

        <FloatingOrb variant="purple" size={38} className="top-1/4 -right-4 hidden lg:block" animation="float-slow" delay="1s" />
        <FloatingOrb variant="cyan" size={30} className="bottom-12 -left-3 hidden md:block" animation="float-reverse" delay="2.5s" />

        <DottedGrid cols={5} rows={5} spacing={16} color="#3B82F6" opacity={0.22} className="top-12 left-8 hidden md:block" />
        <CurvedLine variant="wave" width={220} height={60} color="#8B5CF6" opacity={0.20} className="bottom-12 right-12 hidden xl:block" />
      </div>

      <div className="container-custom relative z-10">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200/80 bg-blue-50/90 text-primary text-xs font-bold uppercase tracking-wider mb-5 shadow-xs">
          <Building2 size={13} className="text-blue-600" />
          <span>Who We Are</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column - Story */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              The Future of <span className="gradient-text">Digital Growth</span>
            </h2>

            <p className="text-slate-600 leading-relaxed text-lg font-medium">
              AdSky Solution is a fast-growing digital solutions and recruitment powerhouse based in India.
              We don&apos;t just build products; we architect scalable futures.
            </p>

            <p className="text-slate-500 leading-relaxed text-base">
              Our mission is to bridge the gap between innovative technology and world-class talent.
              From startups to global enterprises, we provide the strategic backbone for measurable success.
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs font-semibold text-primary">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
              <span>Pioneering scalable technology &amp; strategic staffing since inception</span>
            </div>
          </div>

          {/* Right Column - Colorful Capability Cards */}
          <div className="lg:col-span-5 space-y-3.5">
            {capabilities.map((item, i) => (
              <div
                key={i}
                className={`relative rounded-2xl border p-4 sm:px-5 sm:py-4 transition-all duration-300 group flex items-center gap-4 shadow-2xs hover:shadow-md hover:-translate-y-0.5 overflow-hidden ${item.cardBg} ${item.border}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${item.checkBg}`}>
                  <Check size={16} strokeWidth={3} />
                </div>
                <p className="text-sm font-extrabold text-slate-900 group-hover:text-primary transition-colors">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}