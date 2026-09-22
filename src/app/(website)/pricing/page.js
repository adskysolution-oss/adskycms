import { Sparkles } from 'lucide-react';
import { getActivePricingPlans } from '@/lib/data';
import PricingSectionClient from '@/components/sections/PricingSectionClient';
import { FloatingOrb, DottedGrid, GeometricAccent, GlowBlob } from '@/components/ui/BackgroundEffects';

export const metadata = {
  title: 'Pricing & Investment Plans - AdSky Solution',
  description: 'Transparent investment tiers for web development, software engineering, and digital growth. Simple, upfront pricing with no hidden charges.',
};

export default async function PricingPage() {
  const plans = await getActivePricingPlans();

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden bg-gradient-to-b from-blue-50/60 via-white to-slate-50/40">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <GlowBlob color="blue" size="w-[520px] h-[520px]" className="-top-28 -right-32" opacity={0.15} />
          <GlowBlob color="purple" size="w-[420px] h-[420px]" className="bottom-0 -left-28" opacity={0.12} delay="4s" />
          <FloatingOrb variant="blue" size={38} className="top-1/4 -left-5 hidden lg:block" animation="float-slow" delay="1s" />
          <FloatingOrb variant="peach" size={32} className="bottom-1/3 -right-4 hidden lg:block" animation="float-reverse" delay="2.5s" />
          <DottedGrid cols={6} rows={6} spacing={16} color="#3B82F6" opacity={0.25} className="top-1/4 left-4 hidden md:block" />
          <GeometricAccent type="sparkle" size={14} color="#06B6D4" opacity={0.35} className="top-20 right-1/4 hidden md:block" delay="1.5s" />
        </div>

        <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200/80 bg-blue-50/90 text-primary text-xs font-bold uppercase tracking-wider mb-5 shadow-xs">
            <Sparkles size={13} className="text-blue-600" />
            <span>Transparent Investment</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-5">
            Simple, <span className="gradient-text">Transparent</span> Pricing
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Choose the investment tier tailored to your digital growth. Zero hidden fees, guaranteed deliverables, and 100% intellectual property ownership.
          </p>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section className="section-padding !pt-0 relative overflow-hidden pb-28 bg-slate-50/30">
        <div className="deco-dot top-[20%] right-[10%] w-3 h-3 bg-secondary opacity-25 hidden lg:block" />
        <div className="deco-ring w-20 h-20 bottom-[15%] left-[6%] hidden lg:block" />

        <div className="container-custom relative z-10">
          {plans.length === 0 ? (
            <div className="glass-card p-16 text-center max-w-xl mx-auto">
              <p className="text-slate-600 text-lg font-semibold">
                No pricing plans available yet.
              </p>
              <p className="text-slate-400 text-sm mt-2">
                Admin can add plans from the dashboard.
              </p>
            </div>
          ) : (
            <PricingSectionClient initialPlans={plans} />
          )}
        </div>
      </section>
    </>
  );
}