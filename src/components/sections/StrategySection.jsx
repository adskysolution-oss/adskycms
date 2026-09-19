'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaCheckCircle } from 'react-icons/fa';
import { ArrowRight, TrendingUp, Target, BarChart3, Headphones } from 'lucide-react';
import { FloatingOrb, DottedGrid, CurvedLine, GeometricAccent, GlowBlob } from '../ui/BackgroundEffects';

function CountUpNumber({ target, suffix = '' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);

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

const statItems = [
  { value: '150%', label: 'Revenue Growth', icon: TrendingUp, color: 'from-blue-500 to-cyan-400', numTarget: 150, suffix: '%' },
  { value: '3x', label: 'Lead Generation', icon: Target, color: 'from-violet-500 to-purple-400', numTarget: 3, suffix: 'x' },
  { value: '85%', label: 'Cost Reduction', icon: BarChart3, color: 'from-emerald-500 to-green-400', numTarget: 85, suffix: '%' },
  { value: '24/7', label: 'Support', icon: Headphones, color: 'from-amber-500 to-orange-400', numTarget: null, suffix: '' },
];

export default function StrategySection() {
  const sectionRef = useRef(null);
  const [hasViewed, setHasViewed] = useState(false);

  useEffect(() => {
    const currentRef = sectionRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasViewed) {
          setHasViewed(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(currentRef);

    return () => {
      observer.unobserve(currentRef);
    };
  }, [hasViewed]);

  return (
    <section ref={sectionRef} className="section-padding relative overflow-hidden">
      {/* Background Effect Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <GlowBlob color="purple" size="w-[450px] h-[450px]" className="top-0 -left-32" opacity={0.11} />
        <GlowBlob color="blue" size="w-[350px] h-[350px]" className="bottom-0 -right-24" opacity={0.10} delay="4s" />

        <FloatingOrb variant="blue" size={54} className="bottom-8 -right-6 hidden lg:block" animation="float-slow" delay="1s" blur={true} />
        <FloatingOrb variant="cyan" size={32} className="top-1/4 -left-3 hidden md:block" animation="float" delay="2.5s" />

        <DottedGrid cols={5} rows={5} spacing={16} color="#8B5CF6" opacity={0.24} className="top-12 right-10 hidden lg:block" />
        <CurvedLine variant="s-curve" width={220} height={120} color="#3B82F6" opacity={0.22} className="top-8 -left-8 hidden xl:block" />
        <GeometricAccent type="sparkle" size={14} color="#F59E0B" opacity={0.35} className="bottom-20 left-1/3 hidden md:block" delay="2s" />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* LEFT — Stats Bento Grid */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              {statItems.map((s, i) => (
                <div
                  key={s.label}
                  className="glass-card-hover p-6 text-center group"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mx-auto mb-3 text-white group-hover:scale-110 transition-transform shadow-sm`}>
                    <s.icon size={18} />
                  </div>

                  {/* Number */}
                  <div className="text-2xl sm:text-3xl font-extrabold gradient-text mb-1 tabular-nums">
                    {hasViewed && s.numTarget !== null && <CountUpNumber target={s.numTarget} suffix={s.suffix} />}
                    {hasViewed && s.numTarget === null && <>24/7</>}
                    {!hasViewed && s.value}
                  </div>

                  <div className="text-xs text-slate-400 font-medium">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Floating decorative pill */}
            <div className="deco-pill -bottom-4 left-1/2 -translate-x-1/2 animate-float flex items-center gap-1.5 hidden sm:flex">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span>Proven Results</span>
            </div>
          </div>

          {/* RIGHT — Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200/60 bg-blue-50/80 text-primary text-xs font-bold uppercase tracking-wider mb-5">
              <BarChart3 size={13} />
              <span>Growth Strategy</span>
            </div>

            <h2 className="section-title !text-left !mb-4">
              Strategic Approach to <span className="gradient-text">Digital Growth</span>
            </h2>

            <p className="text-slate-500 mb-8 leading-relaxed text-base">
              We believe in a data-first approach. Every strategy we build is backed by thorough research, competitive analysis, and industry insights to ensure maximum impact.
            </p>

            <ul className="space-y-3 mb-8">
              {['Data-driven decision making', 'Competitive market analysis', 'Scalable growth strategies', 'Measurable ROI tracking'].map((point, i) => (
                <li key={i} className="flex items-center gap-3 group">
                  <div className="w-6 h-6 rounded-lg bg-green-50 border border-green-200/60 flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition-colors">
                    <FaCheckCircle className="text-green-500" size={12} />
                  </div>
                  <span className="text-sm text-slate-600">{point}</span>
                </li>
              ))}
            </ul>

            <Link href="/about" className="btn-primary">
              Learn More <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
