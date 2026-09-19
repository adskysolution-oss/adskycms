'use client';

import { FaArrowRight } from 'react-icons/fa';
import { Layers } from 'lucide-react';
import IconByName from '@/components/ui/IconByName';
import { HoverEffect } from '../ui/card-hover-effect';
import { FloatingOrb, DottedGrid, CurvedLine, GeometricAccent, GlowBlob } from '../ui/BackgroundEffects';

export default function ServicesSection({ services = [] }) {
  if (services.length === 0) return null;

  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background Effect Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <GlowBlob color="blue" size="w-[500px] h-[500px]" className="-top-20 -right-32" opacity={0.11} />
        <GlowBlob color="purple" size="w-[350px] h-[350px]" className="bottom-0 -left-24" opacity={0.09} delay="4s" />

        <FloatingOrb variant="purple" size={40} className="top-1/3 -left-5 hidden lg:block" animation="float-slow" delay="1s" />
        <FloatingOrb variant="cyan" size={32} className="bottom-1/4 -right-4 hidden lg:block" animation="float-reverse" delay="3s" />
        <FloatingOrb variant="ring" size={28} className="top-16 right-16 hidden md:block" animation="float" delay="2s" />

        <DottedGrid cols={6} rows={6} spacing={16} color="#3B82F6" opacity={0.24} className="top-1/4 left-4 hidden md:block" />
        <CurvedLine variant="arc" width={180} height={60} color="#8B5CF6" opacity={0.22} className="bottom-12 left-1/4 hidden xl:block" />
        <GeometricAccent type="sparkle" size={14} color="#06B6D4" opacity={0.3} className="top-24 right-1/4 hidden md:block" delay="1.5s" />
      </div>

      <div className="container-custom relative z-10">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200/60 bg-blue-50/80 text-primary text-xs font-bold uppercase tracking-wider mb-5 mx-auto">
            <Layers size={13} />
            <span>What We Do</span>
          </div>
          <h2 className="section-title"><span className="gradient-text">Our Services</span></h2>
          <p className="section-subtitle">Comprehensive digital solutions tailored to your needs</p>
        </div>

        <HoverEffect
          items={services.map((svc, i) => ({
            id: svc._id,
            link: '#',
            content: (
              <div className="group" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center mb-5 group-hover:from-primary/25 group-hover:to-secondary/25 transition-all group-hover:scale-105">
                  <IconByName name={svc.icon} className="text-primary" size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">{svc.name}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{svc.description}</p>
                <div className="flex items-center gap-2 text-primary text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                  Learn more <FaArrowRight size={11} />
                </div>
              </div>
            )
          }))}
        />
      </div>
    </section>
  );
}
