'use client';

import { useState, useEffect } from 'react';
import { 
  FaSearch, FaMapMarkerAlt, FaBriefcase, FaFilter, 
  FaMoneyBillWave, FaClock, FaChevronRight, FaSpinner, FaBookmark, FaRegBookmark 
} from 'react-icons/fa';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CareersPage() {
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: '',
    location: '',
    type: '',
    category: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchJobs();
    fetchAppliedJobs();
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const res = await fetch('/api/user/me');
      const data = await res.json();
      if (data.success) {
        setSavedJobIds(data.user.savedJobs || []);
      }
    } catch {}
  };


  const fetchAppliedJobs = async () => {
    try {
      const res = await fetch('/api/applications/me');
      if (res.ok) {
        const data = await res.json();
        const ids = data.applications?.map(app => (app.job?._id || app.jobId?._id || app.job || app.jobId)) || [];
        console.log('[DEBUG] Careers Page - Applied Job IDs:', ids);
        setAppliedJobIds(ids);
      }
    } catch (error) {
      console.error('[ERROR] Careers Page - Fetch Applied:', error);
    }
  };


  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories?type=job');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {}
  };

  const fetchJobs = async (params = filters) => {
    setLoading(true);
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`/api/jobs?${query}`);
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    fetchJobs(newFilters);
  };

  const toggleSaveJob = async (e, jobId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch('/api/jobs/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.isSaved) {
          setSavedJobIds([...savedJobIds, jobId]);
          toast.success('Job saved!');
        } else {
          setSavedJobIds(savedJobIds.filter(id => id !== jobId));
          toast.success('Job removed from saved');
        }
      }
    } catch {
      toast.error('Authentication required to save jobs');
    }
  };


  return (
    <div className="pt-32 pb-24">
      {/* Hero Section */}
      <section className="relative mb-20">
        <div className="container-custom text-center">
          <div className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-xs font-bold uppercase tracking-widest mb-6 animate-bounce">
            Join the elite team
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-text-primary mb-6 tracking-tighter italic">
            YOUR NEXT <span className="gradient-text">BREAKTHROUGH</span> IS HERE
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-12">
            Explore high-impact roles at industry-leading companies. <br />
            Our ATS-optimized platform connects top talent with premium opportunities.
          </p>

          {/* Advanced Search Bar */}
          <div className="max-w-4xl mx-auto glass-card p-2 md:p-3 rounded-2xl flex flex-col md:flex-row gap-2 border border-white/10 shadow-2xl">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input 
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Job title or keywords..." 
                className="w-full bg-transparent py-4 pl-12 pr-4 text-text-primary focus:outline-none font-medium"
              />
            </div>
            <div className="hidden md:block w-px bg-white/10 my-2" />
            <div className="flex-1 relative">
              <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input 
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="Location..." 
                className="w-full bg-transparent py-4 pl-12 pr-4 text-text-primary focus:outline-none font-medium"
              />
            </div>
            <button 
              onClick={() => fetchJobs()}
              className="btn-primary !px-10 !py-4 shadow-xl shadow-primary/20"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1 space-y-8">
            <div className="glass-card p-8 border border-white/5 sticky top-32">
              <h3 className="text-sm font-black text-text-primary mb-8 uppercase tracking-[0.2em] flex items-center gap-2">
                <FaFilter className="text-primary-light" size={12} /> Refine Search
              </h3>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Category</label>
                  <select 
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-text-primary focus:border-primary/50"
                  >
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Job Type</label>
                  <div className="space-y-3">
                    {['Full-time', 'Contract', 'Remote', 'Internship'].map(type => (
                      <label key={type} className="flex items-center gap-3 group cursor-pointer">
                        <input 
                          type="radio" 
                          name="type" 
                          value={type} 
                          checked={filters.type === type}
                          onChange={handleFilterChange}
                          className="accent-primary" 
                        />
                        <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">{type}</span>
                      </label>
                    ))}
                    <button onClick={() => { setFilters({...filters, type: ''}); fetchJobs({...filters, type: ''}); }} className="text-[10px] text-primary-light font-bold hover:underline mt-2">Clear Type</button>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
                    <p className="text-xs font-bold text-text-primary mb-2">Want personalized alerts?</p>
                    <p className="text-[10px] text-text-muted mb-4 leading-relaxed">Save your search and we'll notify you when matching jobs drop.</p>
                    <button className="w-full btn-secondary !py-2 text-[10px] font-black uppercase tracking-widest">Save Search</button>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Job List */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-text-primary">
                {jobs.length} <span className="text-text-muted font-medium">Opportunities Found</span>
              </h2>
            </div>

            {loading ? (
              <div className="py-20 text-center flex flex-col items-center gap-4">
                <FaSpinner className="animate-spin text-primary" size={32} />
                <p className="text-text-muted font-bold uppercase tracking-tighter">Syncing listings...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="glass-card p-20 text-center border border-white/5">
                <FaBriefcase className="mx-auto text-text-muted mb-4" size={40} />
                <h3 className="text-xl font-bold text-text-primary mb-2 italic">Zero matches found</h3>
                <p className="text-text-secondary text-sm">Try adjusting your filters or search keywords.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {jobs.map((job) => (
                  <Link 
                    key={job._id} 
                    href={`/jobs/${job._id}`}
                    className="glass-card p-6 md:p-8 border border-white/5 hover:border-primary/30 transition-all group flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                  >
                    <div className="flex gap-6 w-full md:w-auto">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-110 transition-transform">
                        {job.company?.logo ? (
                          <img src={job.company.logo} alt={job.company.companyName} className="w-full h-full object-contain p-2" />
                        ) : (
                          <FaBriefcase className="text-text-muted" size={24} />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-text-primary mb-1 group-hover:text-primary-light transition-colors">{job.title}</h3>
                        <p className="text-sm font-bold text-text-secondary mb-3">{job.company?.companyName}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-text-muted font-medium">
                          <span className="flex items-center gap-1.5"><FaMapMarkerAlt size={12} className="text-primary-light" /> {job.location}</span>
                          <span className="flex items-center gap-1.5"><FaMoneyBillWave size={12} className="text-secondary-light" /> {job.salary}</span>
                          <span className="flex items-center gap-1.5"><FaClock size={12} className="text-accent-light" /> {job.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                      <button 
                        onClick={(e) => toggleSaveJob(e, job._id)}
                        className={`p-3 rounded-xl border transition-all ${
                          savedJobIds.includes(job._id) 
                            ? 'bg-secondary/10 border-secondary/20 text-secondary-light' 
                            : 'bg-white/5 border-white/5 text-text-muted hover:border-secondary/20'
                        }`}
                      >
                        {savedJobIds.includes(job._id) ? <FaBookmark size={14} /> : <FaRegBookmark size={14} />}
                      </button>

                      <div className="hidden md:flex flex-wrap gap-2 mr-4 max-w-xs justify-end">
                        {appliedJobIds.includes(job._id) && (
                          <span className="px-3 py-1 rounded-full bg-green-400/10 text-green-400 text-[10px] font-black uppercase tracking-widest border border-green-400/20">
                            Applied
                          </span>
                        )}
                        {job.skills?.slice(0, 2).map((skill, i) => (
                          <span key={i} className="px-2 py-1 rounded-lg bg-white/5 text-[9px] font-bold text-text-muted uppercase tracking-tighter">#{skill}</span>
                        ))}
                      </div>
                      <div className={`p-4 rounded-xl transition-all shadow-xl ${appliedJobIds.includes(job._id) ? 'bg-green-400/10 text-green-400' : 'bg-primary/10 text-primary-light group-hover:bg-primary group-hover:text-white shadow-primary/5'}`}>
                        <FaChevronRight size={14} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
