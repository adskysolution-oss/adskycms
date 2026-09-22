'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaBriefcase, FaArrowRight, FaSpinner } from 'react-icons/fa';
import { Briefcase, ArrowRight, Sparkles } from 'lucide-react';
import { FloatingOrb, DottedGrid, GeometricAccent, GlowBlob } from '../ui/BackgroundEffects';

const CATEGORY_THEMES = [
  {
    theme: 'blue',
    cardBg: 'bg-gradient-to-br from-blue-100/90 via-indigo-50/70 to-white',
    border: 'border-blue-300/90 hover:border-blue-500',
    topBar: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    iconBg: 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30',
    blobColor: 'from-blue-500/30 to-indigo-500/20',
    pillBg: 'bg-blue-100 text-blue-700 border-blue-200',
    hoverShadow: 'hover:shadow-xl hover:shadow-blue-500/15',
    arrowColor: 'text-blue-600',
  },
  {
    theme: 'purple',
    cardBg: 'bg-gradient-to-br from-purple-100/90 via-violet-50/70 to-white',
    border: 'border-purple-300/90 hover:border-purple-500',
    topBar: 'bg-gradient-to-r from-purple-600 to-violet-600',
    iconBg: 'bg-gradient-to-br from-purple-600 to-violet-600 text-white shadow-md shadow-purple-500/30',
    blobColor: 'from-purple-500/30 to-violet-500/20',
    pillBg: 'bg-purple-100 text-purple-700 border-purple-200',
    hoverShadow: 'hover:shadow-xl hover:shadow-purple-500/15',
    arrowColor: 'text-purple-600',
  },
  {
    theme: 'emerald',
    cardBg: 'bg-gradient-to-br from-emerald-100/90 via-teal-50/70 to-white',
    border: 'border-emerald-300/90 hover:border-emerald-500',
    topBar: 'bg-gradient-to-r from-emerald-600 to-teal-600',
    iconBg: 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/30',
    blobColor: 'from-emerald-500/30 to-teal-500/20',
    pillBg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    hoverShadow: 'hover:shadow-xl hover:shadow-emerald-500/15',
    arrowColor: 'text-emerald-600',
  },
  {
    theme: 'amber',
    cardBg: 'bg-gradient-to-br from-amber-100/90 via-orange-50/70 to-white',
    border: 'border-amber-300/90 hover:border-amber-500',
    topBar: 'bg-gradient-to-r from-amber-500 to-orange-600',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/30',
    blobColor: 'from-amber-500/30 to-orange-500/20',
    pillBg: 'bg-amber-100 text-amber-800 border-amber-200',
    hoverShadow: 'hover:shadow-xl hover:shadow-amber-500/15',
    arrowColor: 'text-amber-700',
  },
  {
    theme: 'cyan',
    cardBg: 'bg-gradient-to-br from-cyan-100/90 via-sky-50/70 to-white',
    border: 'border-cyan-300/90 hover:border-cyan-500',
    topBar: 'bg-gradient-to-r from-cyan-600 to-blue-600',
    iconBg: 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/30',
    blobColor: 'from-cyan-500/30 to-sky-500/20',
    pillBg: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    hoverShadow: 'hover:shadow-xl hover:shadow-cyan-500/15',
    arrowColor: 'text-cyan-600',
  },
  {
    theme: 'rose',
    cardBg: 'bg-gradient-to-br from-rose-100/90 via-pink-50/70 to-white',
    border: 'border-rose-300/90 hover:border-rose-500',
    topBar: 'bg-gradient-to-r from-rose-500 to-pink-600',
    iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/30',
    blobColor: 'from-rose-500/30 to-pink-500/20',
    pillBg: 'bg-rose-100 text-rose-700 border-rose-200',
    hoverShadow: 'hover:shadow-xl hover:shadow-rose-500/15',
    arrowColor: 'text-rose-600',
  },
];

export default function JobCategoriesSection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobsAndGroup = async () => {
      try {
        const res = await fetch('/api/jobs?limit=100');
        if (!res.ok) throw new Error('Failed to fetch jobs');

        const data = await res.json();
        const jobs = data.jobs || [];

        const categoryMap = jobs.reduce((acc, job) => {
          const categoryName = typeof job.category === 'object' ? job.category.name : (job.category || "Other");
          acc[categoryName] = (acc[categoryName] || 0) + 1;
          return acc;
        }, {});

        const categoriesList = Object.entries(categoryMap).map(([name, count]) => ({
          name,
          count,
        }));

        setCategories(categoriesList);
      } catch (error) {
        console.error('Failed to extract categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobsAndGroup();
  }, []);

  if (loading) return (
    <section className="section-padding section-bg-blue">
      <div className="container-custom flex flex-col items-center justify-center py-20">
        <FaSpinner className="animate-spin text-primary mb-4" size={32} />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Analyzing Categories...</p>
      </div>
    </section>
  );

  return (
    <section className="section-padding relative overflow-hidden bg-slate-50/40">
      {/* Background Effect Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <GlowBlob color="blue" size="w-[500px] h-[500px]" className="-top-24 -right-36" opacity={0.12} />
        <GlowBlob color="cyan" size="w-[350px] h-[350px]" className="bottom-0 -left-20" opacity={0.09} delay="5s" />

        <FloatingOrb variant="cyan" size={42} className="top-1/3 -right-4 hidden lg:block" animation="float-slow" delay="1.5s" />
        <FloatingOrb variant="ring" size={24} className="bottom-16 left-12 hidden md:block" animation="float" delay="3s" />

        <DottedGrid cols={5} rows={5} spacing={16} color="#3B82F6" opacity={0.22} className="top-16 left-6 hidden md:block" />
        <GeometricAccent type="diamond" size={12} color="#06B6D4" opacity={0.35} className="top-24 right-1/4 hidden lg:block" delay="2s" />
        <GeometricAccent type="plus" size={14} color="#8B5CF6" opacity={0.3} className="bottom-20 right-1/3 hidden md:block" delay="1s" />
      </div>

      <div className="container-custom relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200/80 bg-blue-50/90 text-primary text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
              <Briefcase size={13} className="text-blue-600" />
              <span>Career Opportunities</span>
            </div>
            <h2 className="section-title text-left !mb-3">
              Explore <span className="gradient-text">Job Categories</span>
            </h2>
            <p className="text-slate-600 text-base">
              Find the perfect role that matches your skills and passion. We have opportunities across various domains.
            </p>
          </div>
          <Link href="/careers" className="btn-secondary whitespace-nowrap group !rounded-xl !px-5 !py-2.5 text-xs sm:text-sm">
            View All Careers <ArrowRight size={14} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Distinctly-Colored Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
          {categories.map((cat, i) => {
            const theme = CATEGORY_THEMES[i % CATEGORY_THEMES.length];
            return (
              <Link
                key={cat.name}
                href={`/careers?search=${encodeURIComponent(cat.name)}`}
                className={`group relative rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-[0_4px_20px_-6px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 ${theme.cardBg} ${theme.border} ${theme.hoverShadow}`}
              >
                {/* Top Accent Stripe */}
                <div className={`h-1.5 w-full absolute top-0 left-0 right-0 ${theme.topBar}`} />

                {/* Ambient Corner Glow */}
                <div
                  className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${theme.blobColor} rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500`}
                />

                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-2xl ${theme.iconBg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110 group-hover:rotate-2`}>
                    <FaBriefcase size={20} />
                  </div>

                  {/* Name */}
                  <h3 className="text-base font-extrabold text-slate-900 mb-2 group-hover:text-primary transition-colors leading-snug">
                    {cat.name}
                  </h3>
                </div>

                <div className="relative z-10 pt-3 mt-4 border-t border-slate-200/70 flex items-center justify-between">
                  {/* Count badge */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 border border-slate-200/80 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] text-slate-700 font-bold">
                      {cat.count} {cat.count === 1 ? 'Position' : 'Positions'}
                    </span>
                  </div>

                  {/* Arrow CTA */}
                  <div className={`flex items-center gap-1 text-xs font-bold ${theme.arrowColor} group-hover:translate-x-1 transition-transform`}>
                    <span>Explore</span>
                    <FaArrowRight size={10} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-20 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <p className="text-slate-500 font-semibold">No active job categories at this moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}
