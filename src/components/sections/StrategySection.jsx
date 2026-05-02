'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaCheckCircle } from 'react-icons/fa';

function CountUpNumber({ target, suffix = '' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000; // 2 seconds
    const increment = target / (duration / 16); // 60fps

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target]);

  return `${count}${suffix}`;
}

export default function StrategySection() {
  const sectionRef = useRef(null);
  const [hasViewed, setHasViewed] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasViewed) {
          setHasViewed(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, [hasViewed]);

  return (
    <section ref={sectionRef} className="section-padding relative overflow-hidden">
      <div className="glow-dot bg-secondary top-1/2 -left-20 animate-pulse-slow" />
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="glass-card p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
              <div className="relative grid grid-cols-2 gap-4">
                {[
                  { value: '150%', label: 'Revenue Growth' },
                  { value: '3x', label: 'Lead Generation' },
                  { value: '85%', label: 'Cost Reduction' },
                  { value: '24/7', label: 'Support' },
                ].map((s) => (
                  <div key={s.label} className="glass-card p-5 text-center">
                    <div className="text-3xl font-bold gradient-text mb-1">
                      {hasViewed && s.value === '150%' && <CountUpNumber target={150} suffix="%" />}
                      {hasViewed && s.value === '3x' && <>3</>}
                      {hasViewed && s.value === '85%' && <CountUpNumber target={85} suffix="%" />}
                      {hasViewed && s.value === '24/7' && <>24/7</>}
                      {!hasViewed && s.value}
                    </div>
                    <div className="text-text-muted text-xs">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <h2 className="section-title">Strategic Approach to Digital Growth</h2>
            <p className="text-text-secondary mb-8 leading-relaxed">
              We believe in a data-first approach. Every strategy we build is backed by thorough research, competitive analysis, and industry insights to ensure maximum impact.
            </p>
            <ul className="space-y-4 mb-8">
              {['Data-driven decision making', 'Competitive market analysis', 'Scalable growth strategies', 'Measurable ROI tracking'].map((point, i) => (
                <li key={i} className="flex items-center gap-3 text-text-secondary">
                  <FaCheckCircle className="text-green-500 flex-shrink-0" size={16} />
                  <span className="text-sm">{point}</span>
                </li>
              ))}
            </ul>
            <Link href="/about" className="btn-primary">Learn More</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
