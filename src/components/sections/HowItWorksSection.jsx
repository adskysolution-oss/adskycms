'use client';

import { useState } from 'react';
import { Settings, Code, Rocket, ArrowRight } from 'lucide-react';
import { FloatingOrb, DottedGrid, GlowBlob } from '../ui/BackgroundEffects';

export default function HowItWorksSection() {
  const [hoveredStep, setHoveredStep] = useState(null);

  const steps = [
    {
      title: 'Discovery',
      desc: 'We analyze your requirements and create a comprehensive project roadmap.',
      icon: Settings,
      color: 'from-blue-500 to-cyan-400',
      deliverables: ['Requirements doc', 'Project roadmap'],
    },
    {
      title: 'Development',
      desc: 'Our expert team builds your solution using cutting-edge technologies.',
      icon: Code,
      color: 'from-violet-500 to-purple-400',
      deliverables: ['Sprint cycles', 'Quality code'],
    },
    {
      title: 'Delivery',
      desc: 'We deploy, test, and ensure everything works perfectly for your business.',
      icon: Rocket,
      color: 'from-emerald-500 to-green-400',
      deliverables: ['Live deployment', 'Ongoing support'],
    },
  ];

  return (
    <section className="section-padding relative overflow-hidden section-bg-light">
      {/* Background Effect Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <GlowBlob color="blue" size="w-[450px] h-[450px]" className="-top-24 left-1/4" opacity={0.10} />
        <FloatingOrb variant="blue" size={36} className="top-1/3 -left-4 hidden lg:block" animation="float-slow" delay="1s" />
        <FloatingOrb variant="cyan" size={28} className="bottom-16 -right-3 hidden md:block" animation="float-reverse" delay="2.5s" />

        <DottedGrid cols={6} rows={4} spacing={16} color="#3B82F6" opacity={0.22} className="top-12 right-12 hidden lg:block" />
        <DottedGrid cols={4} rows={4} spacing={16} color="#8B5CF6" opacity={0.20} className="bottom-10 left-8 hidden md:block" />
      </div>

      <div className="container-custom relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200/60 bg-blue-50/80 text-primary text-xs font-bold uppercase tracking-wider mb-5 mx-auto">
            <Settings size={13} />
            <span>Process</span>
          </div>
          <h2 className="section-title"><span className="gradient-text">How It Works</span></h2>
          <p className="section-subtitle">Simple steps to get started</p>
        </div>

        {/* Timeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-20 left-[16.5%] right-[16.5%] h-[2px]">
            <div className="w-full h-full bg-gradient-to-r from-blue-200 via-violet-200 to-green-200 rounded-full" />
            {/* Animated progress */}
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-violet-500 to-green-500 rounded-full transition-all duration-700 ease-out shadow-sm"
              style={{
                width: hoveredStep === 0 ? '10%' : hoveredStep === 1 ? '50%' : hoveredStep === 2 ? '100%' : '50%',
                opacity: hoveredStep !== null ? 1 : 0.4,
              }}
            />
          </div>

          {steps.map((step, i) => (
            <div
              key={i}
              className="relative group"
              onMouseEnter={() => setHoveredStep(i)}
              onMouseLeave={() => setHoveredStep(null)}
            >
              <div className={`glass-card-hover p-7 text-center transition-all duration-300 ${hoveredStep === i ? '!border-primary/30' : ''}`}>
                {/* Step number watermark */}
                <div className="absolute top-3 right-4 text-6xl font-black text-slate-100 select-none pointer-events-none leading-none">
                  {i + 1}
                </div>

                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} mx-auto mb-5 flex items-center justify-center text-white shadow-lg transition-all duration-300 relative z-10 ${hoveredStep === i ? 'scale-110 shadow-xl' : ''}`}>
                  <step.icon size={24} />
                </div>

                {/* Title */}
                <h3 className={`text-lg font-bold mb-3 transition-colors duration-300 ${hoveredStep === i ? 'text-primary' : 'text-slate-900'}`}>
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-slate-500 text-sm leading-relaxed mb-4 relative z-10">
                  {step.desc}
                </p>

                {/* Deliverables */}
                <div className="flex flex-wrap justify-center gap-2">
                  {step.deliverables.map((d) => (
                    <span key={d} className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-semibold text-slate-500">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
