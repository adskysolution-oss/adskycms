'use client';

import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export default function OurJourneySection() {
  const containerRef = useRef(null);
  const milestones = [
    {
      year: '2023',
      badge: 'Foundation',
      cardBg: 'bg-gradient-to-br from-blue-100/90 via-indigo-50/70 to-white',
      border: 'border-blue-300/90 hover:border-blue-500 shadow-md hover:shadow-xl hover:shadow-blue-500/15',
      topBar: 'bg-gradient-to-r from-blue-600 to-indigo-600',
      yearColor: 'text-blue-700',
      description:
        'AD Sky Solution was founded in Delhi with a vision to empower businesses through IT development, digital solutions, and recruitment services across India.',
    },
    {
      year: '2024',
      badge: 'Scale & Network',
      cardBg: 'bg-gradient-to-br from-emerald-100/90 via-teal-50/70 to-white',
      border: 'border-emerald-300/90 hover:border-emerald-500 shadow-md hover:shadow-xl hover:shadow-emerald-500/15',
      topBar: 'bg-gradient-to-r from-emerald-600 to-teal-600',
      yearColor: 'text-emerald-700',
      description:
        'Expanded operations by building a strong Pan-India recruitment vendor network and delivering high-quality IT solutions.',
    },
    {
      year: '2025',
      badge: 'Enterprise Trust',
      cardBg: 'bg-gradient-to-br from-purple-100/90 via-violet-50/70 to-white',
      border: 'border-purple-300/90 hover:border-purple-500 shadow-md hover:shadow-xl hover:shadow-purple-500/15',
      topBar: 'bg-gradient-to-r from-purple-600 to-violet-600',
      yearColor: 'text-purple-700',
      description:
        'Strengthened client relationships and established AD Sky Solution as a reliable technology partner.',
    },
    {
      year: '2026',
      badge: 'Continuous Growth',
      cardBg: 'bg-gradient-to-br from-amber-100/90 via-orange-50/70 to-white',
      border: 'border-amber-300/90 hover:border-amber-500 shadow-md hover:shadow-xl hover:shadow-amber-500/15',
      topBar: 'bg-gradient-to-r from-amber-500 to-orange-600',
      yearColor: 'text-amber-700',
      description:
        'Continuing growth with scalable solutions and long-term partnerships across India.',
    },
  ];

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <section className="section-padding relative bg-slate-50/40 border-b border-slate-200/70">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-20 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <span>Milestones</span>
          </div>
          <h2 className="section-title">
            Our <span className="gradient-text">Journey</span>
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            From a startup vision to a growing digital solutions company — our journey is driven by innovation and impact.
          </p>
        </div>

        {/* Timeline Container */}
        <div ref={containerRef} className="relative max-w-4xl mx-auto">
          {/* Vertical line background (Static) */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 bg-slate-200" />

          {/* Vertical line progress (Animated) */}
          <motion.div
            style={{ scaleY, originY: 0 }}
            className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 bg-gradient-to-b from-blue-500 via-primary-light to-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.3)] z-0"
          />

          <div className="flex flex-col md:block">
            {milestones.map((item, i) => {
              const isLeft = i % 2 === 0;

              return (
                <div key={i} className={`w-full relative flex flex-col ${isLeft ? 'items-start' : 'items-end'} md:block`}>
                  {/* Dot (Desktop only) */}
                  <div className="hidden md:block absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-primary to-secondary border-[3px] border-white shadow-md z-10" />

                  {/* Card */}
                  <motion.div
                    initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className={`
                      w-[92%] md:w-[calc(50%-40px)] mb-8 md:mb-20
                      ${isLeft ? 'md:mr-auto md:pr-6' : 'md:ml-auto md:pl-6'}
                    `}
                  >
                    <div className={`relative rounded-3xl p-6 lg:p-8 transition-all duration-300 border overflow-hidden ${item.cardBg} ${item.border}`}>
                      {/* Top Accent Stripe */}
                      <div className={`h-1.5 w-full absolute top-0 left-0 right-0 ${item.topBar}`} />

                      <div className="flex items-center justify-between mb-3">
                        <h3 className={`text-2xl font-black ${item.yearColor}`}>
                          {item.year}
                        </h3>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/90 border border-slate-200 text-slate-700 shadow-2xs">
                          {item.badge}
                        </span>
                      </div>

                      <p className="text-slate-600 text-sm leading-relaxed font-medium">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>

                  {/* Spacer for mobile */}
                  {i < milestones.length - 1 && (
                    <div className="md:hidden h-12" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}