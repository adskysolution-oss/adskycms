'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaBriefcase, FaArrowRight, FaSpinner } from 'react-icons/fa';

export default function JobCategoriesSection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobsAndGroup = async () => {
      try {
        // Fetch jobs to extract unique categories as requested
        const res = await fetch('/api/jobs?limit=100'); // Higher limit to get enough data for extraction
        if (!res.ok) throw new Error('Failed to fetch jobs');
        
        const data = await res.json();
        const jobs = data.jobs || [];

        // Implementation Logic: Extract unique categories and count jobs
        const categoryMap = jobs.reduce((acc, job) => {
          // Extract name from populated category or fallback
          const categoryName = typeof job.category === 'object' ? job.category.name : (job.category || "Other");
          acc[categoryName] = (acc[categoryName] || 0) + 1;
          return acc;
        }, {});

        // Transform map to array for rendering
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
    <section className="section-padding bg-dark/30">
      <div className="container-custom flex flex-col items-center justify-center py-20">
        <FaSpinner className="animate-spin text-primary mb-4" size={32} />
        <p className="text-text-muted font-bold uppercase tracking-widest text-[10px]">Analyzing Categories...</p>
      </div>
    </section>
  );

  return (
    <section className="section-padding bg-dark/30">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="section-title text-left !mb-4 italic">

              EXPLORE <span className="gradient-text">JOB CATEGORIES</span>
            </h2>
            <p className="text-text-secondary text-lg">
              Find the perfect role that matches your skills and passion. We have opportunities across various domains.
            </p>
          </div>
          <Link href="/careers" className="btn-secondary whitespace-nowrap group">
            View All Careers <FaArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <CategoryCard key={cat.name} name={cat.name} count={cat.count} />
          ))}
        </div>
        
        {categories.length === 0 && (
          <div className="text-center py-20 glass-card border border-white/5">
            <p className="text-text-muted italic">No categories found in active listings.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function CategoryCard({ name, count }) {
  return (
    <Link
      href={`/careers?search=${encodeURIComponent(name)}`} // Navigates to careers filtered by category name
      className="glass-card-hover p-8 group flex flex-col items-center text-center transition-all duration-300"
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
        <FaBriefcase size={28} className="text-primary-light group-hover:text-white transition-colors" />
      </div>
      
      <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-primary-light transition-colors uppercase tracking-tighter italic">
        {name}
      </h3>
      
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        <span className="text-[10px] uppercase tracking-[0.2em] font-black text-text-muted group-hover:text-white transition-colors">
          {count} {count === 1 ? 'Job' : 'Jobs'} Available
        </span>
      </div>

      <div className="mt-6 text-[10px] font-black uppercase tracking-widest text-primary-light opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
        Browse Opportunities
      </div>
    </Link>
  );
}
