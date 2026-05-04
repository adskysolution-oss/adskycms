'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaSearch, FaMapMarkerAlt, FaBriefcase, FaMoneyBillWave, FaArrowRight, FaUserTie, FaBuilding } from 'react-icons/fa';
import JobCategoriesSection from '@/components/sections/JobCategoriesSection';

export default function CareersPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/jobs?limit=6');
        const data = await res.json();
        setJobs(data.jobs || []);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // Implementation of search logic can be added here or as a separate component
    window.location.href = `/careers/search?q=${searchTerm}`;
  };

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden border-b border-white/5">
        <div className="glow-dot bg-primary top-20 right-0 animate-pulse-slow" />
        <div className="glow-dot bg-secondary bottom-0 left-0 opacity-10" />
        
        <div className="container-custom relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold mb-6 leading-tight">
            Join Our <span className="gradient-text">Mission</span>
          </h1>
          <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-12">
            Shape the future of business and talent in India. We're looking for passionate individuals to join our growing team.
          </p>

          <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary-light transition-colors">
              <FaSearch size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Search by job title, skills, or location..."
              className="w-full bg-dark-light border border-white/10 rounded-2xl py-5 pl-14 pr-32 focus:outline-none focus:border-primary/50 text-text-primary shadow-2xl transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="absolute right-3 top-2 bottom-2 px-6 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:opacity-90 transition-all text-sm">
              Search Jobs
            </button>
          </form>
        </div>
      </section>

      {/* Conversion Section */}
      <section className="py-16 border-b border-white/5 bg-dark/20">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link href="/auth/register?role=candidate" className="glass-card-hover p-10 flex items-center gap-6 group">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary-light group-hover:scale-110 transition-transform">
                <FaUserTie size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-text-primary mb-2">I am a Candidate</h3>
                <p className="text-text-secondary text-sm">Find your dream job and build your professional profile.</p>
              </div>
              <FaArrowRight className="ml-auto text-text-muted group-hover:text-primary-light transition-colors" />
            </Link>

            <Link href="/auth/register?role=employer" className="glass-card-hover p-10 flex items-center gap-6 group">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary-light group-hover:scale-110 transition-transform">
                <FaBuilding size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-text-primary mb-2">I am an Employer</h3>
                <p className="text-text-secondary text-sm">Post jobs and hire top talent for your organization.</p>
              </div>
              <FaArrowRight className="ml-auto text-text-muted group-hover:text-secondary-light transition-colors" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <JobCategoriesSection />

      {/* Latest Jobs Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="section-title text-left !mb-4">
                Latest <span className="gradient-text">Opportunities</span>
              </h2>
              <p className="text-text-secondary text-lg">Fresh roles added daily from top employers.</p>
            </div>
            <Link href="/jobs" className="text-primary-light hover:underline font-bold hidden md:block">
              View All Jobs
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="glass-card p-8 h-64 animate-pulse bg-white/5" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {jobs.map((job) => (
                <div key={job._id} className="glass-card-hover p-8 group border border-white/5">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-xl bg-surface border border-white/10 flex items-center justify-center overflow-hidden">
                      {job.company?.logo ? (
                        <img src={job.company.logo} alt={job.company.companyName} className="w-full h-full object-cover" />
                      ) : (
                        <FaBuilding className="text-text-muted" />
                      )}
                    </div>
                    <span className="text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-primary/10 text-primary-light">
                      {job.type}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-primary-light transition-colors line-clamp-1">
                    {job.title}
                  </h3>
                  <p className="text-text-muted text-sm mb-6 flex items-center gap-1 font-medium">
                    {job.company?.companyName}
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-2 text-text-secondary text-sm">
                      <FaMapMarkerAlt size={14} className="text-text-muted" /> {job.location}
                    </div>
                    <div className="flex items-center gap-2 text-text-secondary text-sm">
                      <FaMoneyBillWave size={14} className="text-text-muted" /> {job.salary}
                    </div>
                  </div>

                  <Link href={`/jobs/${job._id}`} className="btn-secondary w-full justify-center group-hover:bg-primary group-hover:text-white transition-all">
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 text-center md:hidden">
            <Link href="/jobs" className="btn-secondary w-full">
              View All Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden bg-primary/5">
        <div className="container-custom relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-6">
            Ready to find your next challenge?
          </h2>
          <p className="text-text-secondary mb-10 max-w-xl mx-auto">
            Create your profile today and let top companies reach out to you directly.
          </p>
          <Link href="/auth/register" className="btn-primary">
            Create Your Profile <FaArrowRight size={14} className="ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
}
