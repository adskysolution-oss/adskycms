'use client';

import { useState } from 'react';

export default function HowItWorksSection() {
  const [hoveredStep, setHoveredStep] = useState(null);
  const steps = [
    { title: 'Discovery', desc: 'We analyze your requirements and create a comprehensive project roadmap.' },
    { title: 'Development', desc: 'Our expert team builds your solution using cutting-edge technologies.' },
    { title: 'Delivery', desc: 'We deploy, test, and ensure everything works perfectly for your business.' },
  ];

  return (
    <section className="section-padding relative">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="section-title"><span className="gradient-text">How It Works</span></h2>
          <p className="section-subtitle">Simple steps to get started</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Animated connecting line */}
          <div className="hidden md:block absolute top-16 left-0 right-0 h-[2px] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary via-secondary to-primary transition-all duration-500 ease-out"
              style={{
                width:
                  hoveredStep === 0
                    ? '35%'
                    : hoveredStep === 1
                    ? '100%'
                    : hoveredStep === 2
                    ? '65%'
                    : '60%',
                marginLeft:
                  hoveredStep === 0
                    ? '5%'
                    : hoveredStep === 1
                    ? '0%'
                    : hoveredStep === 2
                    ? '35%'
                    : '20%',
                opacity: hoveredStep !== null ? 1 : 0.3,
              }}
            />
          </div>

          {steps.map((step, i) => (
            <div
              key={i}
              className="text-center relative transition-all duration-300"
              onMouseEnter={() => setHoveredStep(i)}
              onMouseLeave={() => setHoveredStep(null)}
            >
              <div
                className={`w-14 h-14 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white font-bold text-xl relative z-10 shadow-lg transition-all duration-300 ${
                  hoveredStep === i
                    ? 'bg-gradient-to-br from-primary to-secondary shadow-primary/40 scale-110'
                    : 'bg-gradient-to-br from-primary to-secondary shadow-primary/20'
                }`}
              >
                {i + 1}
              </div>
              <h3 className={`text-xl font-semibold mb-3 transition-colors duration-300 ${hoveredStep === i ? 'text-primary-light' : 'text-text-primary'}`}>
                {step.title}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
