'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaBriefcase, FaArrowRight, FaTruck, FaGlobe, FaPhoneAlt, FaUsers, FaSearch } from 'react-icons/fa';

// Map icon names to components
const IconMap = {
  FaBriefcase: FaBriefcase,
  FaTruck: FaTruck,
  FaGlobe: FaGlobe,
  FaPhoneAlt: FaPhoneAlt,
  FaUsers: FaUsers,
  FaSearch: FaSearch,
};

export default function JobCategoriesSection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories?type=job');
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="h-48 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
        </div>
      </div>
    </section>
  );

  return (
    <section className="section-padding bg-dark/30">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="section-title text-left !mb-4">
              Explore <span className="gradient-text">Job Categories</span>
            </h2>
            <p className="text-text-secondary text-lg">
              Find the perfect role that matches your skills and passion. We have opportunities across various domains.
            </p>
          </div>
          <Link href="/careers" className="btn-secondary whitespace-nowrap">
            View All Careers <FaArrowRight size={14} className="ml-2" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {categories.map((cat) => {
            const Icon = IconMap[cat.icon] || FaBriefcase;
            return (
              <Link 
                key={cat._id}
                href={`/careers?category=${cat._id}`}
                className="glass-card-hover p-8 group flex flex-col items-center text-center transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon size={32} className="text-primary-light" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-primary-light transition-colors">
                  {cat.name}
                </h3>
                <span className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-white/5 ${cat.tag === 'Remote' ? 'text-green-400' : 'text-blue-400'}`}>
                  {cat.tag || 'Remote'}
                </span>
                <div className="mt-6 text-sm text-text-muted group-hover:text-text-secondary transition-colors">
                  Browse Opportunities
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
