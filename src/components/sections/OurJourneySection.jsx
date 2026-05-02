'use client';

import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';

export default function OurJourneySection() {
  const containerRef = useRef(null);
  const milestones = [
    {
      year: '2023',
      description:
        'AD Sky Solution was founded in Delhi with a vision to empower businesses through IT development, digital solutions, and recruitment services across India.',
    },
    {
      year: '2024',
      description:
        'Expanded operations by building a strong Pan-India recruitment vendor network and delivering high-quality IT solutions.',
    },
    {
      year: '2025',
      description:
        'Strengthened client relationships and established AD Sky Solution as a reliable technology partner.',
    },
    {
      year: '2026',
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
    <section className="section-padding relative">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="section-title">
            Our <span className="gradient-text">Journey</span>
          </h2>
          <p className="section-subtitle">
            From a startup vision to a growing digital solutions company — our journey is driven by innovation and impact.
          </p>
        </div>

        {/* Timeline Container */}
        <div ref={containerRef} className="relative max-w-4xl mx-auto">
          {/* Vertical line background (Static) */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 bg-white/10" />
          
          {/* Vertical line progress (Animated) */}
          <motion.div 
            style={{ scaleY, originY: 0 }}
            className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 bg-gradient-to-b from-blue-500 via-primary-light to-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.5)] z-0"
          />

          <div className="flex flex-col md:block">
            {milestones.map((item, i) => {
              const isLeft = i % 2 === 0;

              return (
                <div key={i} className={`w-full relative flex flex-col ${isLeft ? 'items-start' : 'items-end'} md:block`}>
                  {/* Dot (Desktop only) */}
                  <div className="hidden md:block absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-primary-light to-secondary border-[3px] border-dark z-10" />

                  {/* Card */}
                  <motion.div
                    initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className={`
                      w-[92%] md:w-[calc(50%-40px)] mb-8 md:mb-20
                      ${isLeft ? 'md:mr-auto md:pr-6' : 'md:ml-auto md:pl-6'}
                    `}
                  >
                    <div className="glass-card p-6 lg:p-8 transition-all duration-300 hover:border-white/10">
                      <div className="flex items-center justify-between mb-3 md:block">
                        <h3 className="text-xl font-bold gradient-text">
                          {item.year}
                        </h3>
                        {/* Dot (Mobile only - next to year) */}
                        <div className="md:hidden w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                      </div>

                      <p className="text-text-secondary text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>

                  {/* Spacer for mobile to maintain vertical height for the line */}
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