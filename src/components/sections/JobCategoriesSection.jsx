'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaBriefcase, FaArrowRight, FaSpinner } from 'react-icons/fa';
import { Briefcase, ArrowRight } from 'lucide-react';
import { FloatingOrb, DottedGrid, GeometricAccent, GlowBlob } from '../ui/BackgroundEffects';

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

  // Color palette for category cards
  const cardColors = [
    { bg: 'from-blue-500 to-cyan-400', ring: 'border-blue-200/60' },
    { bg: 'from-violet-500 to-purple-400', ring: 'border-violet-200/60' },
    { bg: 'from-emerald-500 to-green-400', ring: 'border-emerald-200/60' },
    { bg: 'from-amber-500 to-orange-400', ring: 'border-amber-200/60' },
    { bg: 'from-rose-500 to-pink-400', ring: 'border-rose-200/60' },
    { bg: 'from-indigo-500 to-blue-400', ring: 'border-indigo-200/60' },
    { bg: 'from-teal-500 to-cyan-400', ring: 'border-teal-200/60' },
    { bg: 'from-fuchsia-500 to-purple-400', ring: 'border-fuchsia-200/60' },
  ];

  return (
    <section className="section-padding section-bg-blue relative overflow-hidden">
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200/60 bg-blue-50/80 text-primary text-xs font-bold uppercase tracking-wider mb-4">
              <Briefcase size={13} />
              <span>Career Opportunities</span>
            </div>
            <h2 className="section-title text-left !mb-3">
              Explore <span className="gradient-text">Job Categories</span>
            </h2>
            <p className="text-slate-500 text-base">
              Find the perfect role that matches your skills and passion. We have opportunities across various domains.
            </p>
          </div>
          <Link href="/careers" className="btn-secondary whitespace-nowrap group">
            View All Careers <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {categories.map((cat, i) => {
            const colorSet = cardColors[i % cardColors.length];
            return (
              <Link
                key={cat.name}
                href={`/careers?search=${encodeURIComponent(cat.name)}`}
                className="glass-card-hover p-6 group flex flex-col"
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorSet.bg} flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform shadow-sm`}>
                  <FaBriefcase size={20} />
                </div>

                {/* Name */}
                <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors leading-snug">
                  {cat.name}
                </h3>

                {/* Count badge */}
                <div className="flex items-center gap-2 mt-auto pt-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-slate-400 font-semibold">
                    {cat.count} {cat.count === 1 ? 'Position' : 'Positions'} Open
                  </span>
                </div>

                {/* Hover reveal CTA */}
                <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  Browse <FaArrowRight size={10} />
                </div>
              </Link>
            );
          })}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-20 glass-card">
            <p className="text-slate-400 italic">No categories found in active listings.</p>
          </div>
        )}
      </div>
    </section>
  );
}
