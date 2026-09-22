'use client';

import { Layers } from 'lucide-react';
import { FloatingOrb, DottedGrid, CurvedLine, GeometricAccent, GlowBlob } from '../ui/BackgroundEffects';
import ServicesInteractiveGrid from './ServicesInteractiveGrid';

export default function ServicesSection({ services = [] }) {
  if (services.length === 0) return null;

  return (
    <section id="services-section" className="section-padding relative overflow-hidden bg-slate-50/40">
      {/* Dynamic Background Ambient Blobs & Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <GlowBlob color="blue" size="w-[520px] h-[520px]" className="-top-28 -right-32" opacity={0.12} />
        <GlowBlob color="purple" size="w-[420px] h-[420px]" className="bottom-0 -left-28" opacity={0.10} delay="4s" />

        <FloatingOrb variant="purple" size={40} className="top-1/4 -left-5 hidden lg:block" animation="float-slow" delay="1s" />
        <FloatingOrb variant="cyan" size={34} className="bottom-1/3 -right-4 hidden lg:block" animation="float-reverse" delay="3s" />
        <FloatingOrb variant="ring" size={28} className="top-16 right-16 hidden md:block" animation="float" delay="2s" />

        <DottedGrid cols={6} rows={6} spacing={16} color="#3B82F6" opacity={0.25} className="top-1/4 left-4 hidden md:block" />
        <CurvedLine variant="arc" width={190} height={65} color="#8B5CF6" opacity={0.22} className="bottom-12 left-1/4 hidden xl:block" />
        <GeometricAccent type="sparkle" size={14} color="#06B6D4" opacity={0.32} className="top-24 right-1/4 hidden md:block" delay="1.5s" />
      </div>

      <div className="container-custom relative z-10">
        {/* Header Badge & Title */}
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200/80 bg-blue-50/90 text-primary text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <Layers size={13} className="animate-pulse text-blue-600" />
            <span>Enterprise Digital Capabilities</span>
          </div>
          <h2 className="section-title text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            Our <span className="gradient-text">Services</span>
          </h2>
          <p className="section-subtitle text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Comprehensive digital solutions tailored to your business vision. Click any service card to reveal full scope, tech stack, and deliverables.
          </p>
        </div>

        {/* Reusable Rich Interactive Colorful Services Grid */}
        <ServicesInteractiveGrid services={services} />
      </div>
    </section>
  );
}
