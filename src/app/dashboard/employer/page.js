'use client';

import { useState, useEffect } from 'react';
import { 
  FaPlus, FaBriefcase, FaUsers, FaEdit, FaTrash, FaEye, 
  FaCheck, FaSpinner, FaArrowUp, FaSearch, 
  FaChartLine, FaUserCheck, FaUserTimes, FaComments, 
  FaBuilding, FaMapMarkerAlt, FaFilter, FaEllipsisV,
  FaRocket, FaLightbulb, FaCheckCircle, FaTimesCircle,
  FaHistory, FaGlobe, FaChevronRight, FaLock, FaLockOpen
} from 'react-icons/fa';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

export default function EmployerDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stats, setStats] = useState({ jobs: 0, activeJobs: 0, applications: 0, conversion: 0 });
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const activeTab = searchParams.get('tab') || 'overview';
  const [searchQuery, setSearchQuery] = useState('');
  const [isUpdating, setIsUpdating] = useState(null);

  const fetchStats = (apps, jobsList) => {
    const totalApps = apps.length;
    const selectedApps = apps.filter(a => a.status === 'selected').length;
    const conversion = totalApps > 0 ? Math.round((selectedApps / totalApps) * 100) : 0;
    
    setStats({
      jobs: jobsList.length,
      activeJobs: jobsList.filter(j => j.isActive).length,
      applications: totalApps,
      conversion: conversion
    });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const companyRes = await fetch('/api/companies');
      const companyData = await companyRes.json();
      
      if (!companyData.company) {
        router.push('/onboarding/company');
        return;
      }

      if (companyData.company.status !== 'approved') {
        router.push('/pending-approval');
        return;
      }

      setCompany(companyData.company);

      const [jobsRes, appRes] = await Promise.all([
        fetch('/api/jobs?my=true'),
        fetch('/api/applications?employer=true')
      ]);

      const jobsData = await jobsRes.json();
      const appData = await appRes.json();

      const jobsList = jobsData.jobs || [];
      const appsList = appData.applications || [];

      console.log('[DEBUG] Employer Dashboard - Fetched Jobs:', jobsList.length);
      console.log('[DEBUG] Employer Dashboard - Fetched Applications:', appsList);

      setJobs(jobsList);
      setApplications(appsList);
      fetchStats(appsList, jobsList);


    } catch (error) {
      console.error(error);
      toast.error('Failed to sync recruitment data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  const handleStatusUpdate = async (appId, status) => {
    setIsUpdating(appId);
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updatedApps = applications.map(a => a._id === appId ? { ...a, status } : a);
        setApplications(updatedApps);
        fetchStats(updatedApps, jobs);
        toast.success(`Candidate moved to ${status}`);
      }
    } catch (error) {
      toast.error('Failed to update pipeline');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleToggleJob = async (jobId, currentStatus) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        const updatedJobs = jobs.map(j => j._id === jobId ? { ...j, isActive: !currentStatus } : j);
        setJobs(updatedJobs);
        fetchStats(applications, updatedJobs);
        toast.success(currentStatus ? 'Job Posting Closed' : 'Job Posting Reopened');
      }
    } catch {
      toast.error('Failed to toggle job status');
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <FaBriefcase className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" />
      </div>
      <p className="text-text-muted font-black tracking-tighter uppercase italic">Booting Applicant Tracking System...</p>
    </div>
  );

  const pipelineColumns = [
    { id: 'applied', label: 'Applied', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { id: 'shortlisted', label: 'Shortlisted', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    { id: 'interviewing', label: 'Interview', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    { id: 'selected', label: 'Hired', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { id: 'rejected', label: 'Rejected', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' }
  ];

  return (
    <div className="animate-in fade-in duration-700">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <FaChartLine size={18} />
             </div>
             <h1 className="text-4xl font-black text-text-primary uppercase tracking-tighter italic">
               {activeTab === 'overview' && 'Recruitment Intelligence'}
               {activeTab === 'ats' && 'Hiring Pipeline'}
               {activeTab === 'jobs' && 'Inventory Control'}
               {activeTab === 'search' && 'Talent Discovery'}
             </h1>
          </div>
          <p className="text-text-secondary font-medium">Elevating hiring for {company?.companyName}.</p>
        </div>
        <div className="flex gap-4">
           <Link href="/dashboard/employer/jobs" className="btn-primary !px-8 !py-4 shadow-2xl shadow-primary/30 flex items-center gap-3 group">
            <FaPlus size={14} className="group-hover:rotate-90 transition-transform duration-500" /> post intelligence
          </Link>
        </div>
      </header>

      {activeTab === 'overview' && (
        <div className="space-y-10">
          {/* Analytics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Postings', value: stats.jobs, icon: FaBriefcase, color: 'text-primary-light' },
              { label: 'Active Opportunities', value: stats.activeJobs, icon: FaCheckCircle, color: 'text-emerald-400' },
              { label: 'Total Applications', value: stats.applications, icon: FaUsers, color: 'text-secondary-light' },
              { label: 'Hiring Velocity', value: `${stats.conversion}%`, icon: FaRocket, color: 'text-purple-400' },
            ].map((stat, idx) => (
              <div key={idx} className="glass-card p-6 border border-white/5 relative overflow-hidden group hover:border-primary/20 transition-all">
                 <div className={`absolute -right-6 -bottom-6 text-7xl opacity-5 group-hover:scale-125 transition-transform duration-500 ${stat.color}`}>
                   <stat.icon />
                 </div>
                 <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1 relative z-10">{stat.label}</p>
                 <p className={`text-4xl font-black tracking-tighter relative z-10 ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Submissions & Activity */}
            <div className="lg:col-span-2 space-y-8">
               <section className="glass-card p-8 border border-white/5">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-text-primary uppercase tracking-tighter italic flex items-center gap-3">
                      <FaHistory className="text-text-muted" /> Recruitment Activity
                    </h3>
                    <Link href="/dashboard/employer?tab=ats" className="text-[10px] font-black text-primary-light uppercase tracking-widest hover:underline">View Pipeline</Link>
                 </div>
                 
                 <div className="space-y-4">
                    {applications.slice(0, 5).map(app => (
                      <div key={app._id} className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                         <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary-light font-black text-sm border border-primary/20 group-hover:scale-110 transition-transform">
                              {app.candidate?.name?.charAt(0)}
                            </div>
                            <div>
                               <p className="text-sm font-black text-text-primary">{app.candidate?.name}</p>
                               <p className="text-[10px] text-text-muted uppercase font-bold tracking-tight">Applied for <span className="text-primary-light">{app.job?.title}</span></p>
                            </div>
                         </div>
                         <div className="text-right">
                            <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border ${
                              app.status === 'applied' ? 'border-blue-400/20 text-blue-400' :
                              app.status === 'shortlisted' ? 'border-indigo-400/20 text-indigo-400' :
                              app.status === 'selected' ? 'border-emerald-400/20 text-emerald-400' :
                              'border-rose-400/20 text-rose-400'
                            }`}>
                              {app.status}
                            </span>
                            <p className="text-[9px] text-text-muted mt-2 font-bold">{new Date(app.createdAt).toLocaleDateString()}</p>
                         </div>
                      </div>
                    ))}
                    {applications.length === 0 && (
                      <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
                        <FaRocket className="mx-auto text-text-muted mb-4 opacity-20" size={48} />
                        <h4 className="text-text-primary font-black uppercase tracking-tighter italic">Launch Your Hiring Mission</h4>
                        <p className="text-text-muted text-xs mt-2 max-w-xs mx-auto">Profiles with clear salary ranges and detailed tech stacks get <span className="text-primary-light font-bold">2.4x more traffic</span>.</p>
                        <Link href="/dashboard/employer/jobs" className="btn-secondary !py-2 !px-8 text-[10px] font-black uppercase mt-6">Boost Job Posting</Link>
                      </div>
                    )}
                 </div>
               </section>
            </div>

            {/* Sidebar: Hiring Insights */}
            <div className="space-y-8">
               <div className="glass-card p-8 border border-white/5 bg-gradient-to-br from-primary/10 to-transparent relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary opacity-5 blur-3xl -mr-16 -mt-16" />
                  <h3 className="text-lg font-black text-text-primary mb-6 italic border-l-4 border-primary pl-4">Hiring Intelligence</h3>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <p className="text-xs text-text-secondary leading-relaxed font-medium"><FaLightbulb className="inline text-primary-light mr-2" /> Top-performing jobs are usually posted on Tuesdays.</p>
                    </div>
                    <div className="space-y-2">
                       <p className="text-xs text-text-secondary leading-relaxed font-medium"><FaLightbulb className="inline text-secondary-light mr-2" /> 85% of candidates prioritize companies with detailed "About Us" profiles.</p>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                     <Link href="/dashboard/employer/settings" className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-primary/30 transition-all">
                             {company?.logo ? <img src={company.logo} className="w-full h-full object-contain p-1" /> : <FaBuilding className="text-text-muted" size={14} />}
                           </div>
                           <span className="text-[10px] font-black text-text-primary uppercase tracking-widest">Preview Profile</span>
                        </div>
                        <FaChevronRight size={10} className="text-text-muted group-hover:translate-x-1 transition-transform" />
                     </Link>
                  </div>
               </div>

               <div className="glass-card p-8 border border-white/5">
                  <h3 className="text-sm font-black text-text-primary mb-6 uppercase tracking-widest flex items-center gap-2">
                    <FaRocket className="text-secondary-light" /> ATS Quick Access
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    <button onClick={() => router.push('/dashboard/employer?tab=ats')} className="w-full btn-secondary !py-3 text-[10px] font-black uppercase flex items-center justify-center gap-2">
                      Review Pending applicants
                    </button>
                    <button onClick={() => router.push('/dashboard/employer?tab=search')} className="w-full py-3 px-4 rounded-xl border border-white/10 text-[10px] font-black uppercase text-text-muted hover:text-white hover:bg-white/5 transition-all">
                      Find talent for {jobs[0]?.title || 'open roles'}
                    </button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ats' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-700">
           <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              <div className="relative w-full lg:max-w-md">
                 <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                 <input 
                    placeholder="Search applicants by name or role..." 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-text-primary focus:border-primary/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                 />
              </div>
              <div className="flex items-center gap-3 w-full lg:w-auto">
                 <button className="flex-1 lg:flex-none p-4 rounded-2xl bg-white/5 border border-white/10 text-text-muted hover:text-white transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest">
                    <FaFilter size={12} /> Filters
                 </button>
              </div>
           </div>

           {/* Kanban Board Container */}
           <div className="w-full overflow-x-auto pb-10 custom-scrollbar">
              <div className="flex gap-6 min-h-[70vh] min-w-max pr-10">
                 {pipelineColumns.map(column => {
                   const columnApps = applications.filter(a => a.status === column.id && a.candidate?.name?.toLowerCase().includes(searchQuery.toLowerCase()));
                   return (
                     <div key={column.id} className="w-80 flex-shrink-0 space-y-4">

                     <div className={`flex items-center justify-between p-4 rounded-2xl border ${column.color}`}>
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black uppercase tracking-widest">{column.label}</span>
                           <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-black">{columnApps.length}</span>
                        </div>
                        <FaEllipsisV size={10} className="opacity-40" />
                     </div>

                     <div className="space-y-3 min-h-[200px]">
                        {columnApps.map(app => (
                          <div key={app._id} className="glass-card p-5 border border-white/5 hover:border-white/20 transition-all cursor-move group relative">
                             {isUpdating === app._id && (
                                <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                                   <FaSpinner className="animate-spin text-primary" size={20} />
                                </div>
                             )}
                             <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text-primary font-black text-xs group-hover:scale-110 transition-transform">
                                   {app.candidate?.name?.charAt(0)}
                                </div>
                                <div className="overflow-hidden">
                                   <h4 className="text-sm font-black text-text-primary truncate">{app.candidate?.name}</h4>
                                   <p className="text-[9px] text-text-muted uppercase font-bold truncate tracking-tighter">Matches {app.job?.title}</p>
                                </div>
                             </div>
                             
                             <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <a href={app.resumeUrl} target="_blank" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-all">
                                   <FaEye size={12} />
                                </a>
                                <div className="flex gap-1">
                                   {column.id !== 'rejected' && (
                                     <button onClick={() => handleStatusUpdate(app._id, 'rejected')} className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all">
                                        <FaTimesCircle size={14} />
                                     </button>
                                   )}
                                   {column.id === 'applied' && (
                                      <button onClick={() => handleStatusUpdate(app._id, 'shortlisted')} className="p-2 rounded-lg text-text-muted hover:text-indigo-400 hover:bg-indigo-400/10 transition-all">
                                         <FaChevronRight size={14} />
                                      </button>
                                   )}
                                   {column.id === 'shortlisted' && (
                                      <button onClick={() => handleStatusUpdate(app._id, 'interviewing')} className="p-2 rounded-lg text-text-muted hover:text-purple-400 hover:bg-purple-400/10 transition-all">
                                         <FaChevronRight size={14} />
                                      </button>
                                   )}
                                   {column.id === 'interviewing' && (
                                      <button onClick={() => handleStatusUpdate(app._id, 'selected')} className="p-2 rounded-lg text-text-muted hover:text-emerald-400 hover:bg-emerald-400/10 transition-all">
                                         <FaCheckCircle size={14} />
                                      </button>
                                   )}
                                </div>
                             </div>
                          </div>
                        ))}
                        {columnApps.length === 0 && (
                          <div className="p-10 border-2 border-dashed border-white/5 rounded-3xl flex items-center justify-center">
                             <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-20">Empty Stage</span>
                          </div>
                        )}
                     </div>
                  </div>
                );
              })}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-5 duration-700">
           {jobs.map(job => (
             <div key={job._id} className={`glass-card p-8 border hover:border-primary/30 transition-all flex flex-col justify-between group relative overflow-hidden ${!job.isActive ? 'border-danger/10 opacity-70' : 'border-white/5'}`}>
                {/* Background Glow */}
                <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-5 -mr-16 -mt-16 transition-opacity ${job.isActive ? 'bg-primary group-hover:opacity-10' : 'bg-danger'}`} />
                
                <div>
                   <div className="flex items-start justify-between mb-6">
                      <div className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter border ${job.isActive ? 'border-emerald-400/20 text-emerald-400 bg-emerald-400/5' : 'border-danger/20 text-danger bg-danger/5'}`}>
                        {job.isActive ? 'Active Mission' : 'Mission Closed'}
                      </div>
                      <button onClick={() => handleToggleJob(job._id, job.isActive)} className={`p-2 rounded-xl border border-white/10 transition-all ${job.isActive ? 'text-danger hover:bg-danger/10' : 'text-emerald-400 hover:bg-emerald-400/10'}`}>
                        {job.isActive ? <FaLock size={14} /> : <FaLockOpen size={14} />}
                      </button>
                   </div>
                   
                   <h3 className="text-2xl font-black text-text-primary mb-2 italic group-hover:text-primary-light transition-colors line-clamp-1">{job.title}</h3>
                   <div className="flex flex-wrap gap-4 text-xs font-bold text-text-muted uppercase tracking-tight mb-8">
                      <span className="flex items-center gap-2"><FaMapMarkerAlt className="text-primary-light" size={12} /> {job.location}</span>
                      <span className="flex items-center gap-2 text-text-primary font-black">{job.type}</span>
                   </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-white/5">
                   <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                         <span className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Applicants</span>
                         <span className="text-2xl font-black text-text-primary tracking-tighter">{applications.filter(a => a.job?._id === job._id).length}</span>
                      </div>
                      <Link href="/dashboard/employer?tab=ats" className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-text-muted hover:text-white transition-all group/btn">
                         <FaUsers size={16} className="group-hover/btn:scale-110 transition-transform" />
                      </Link>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                      <Link href={`/dashboard/employer/jobs/${job._id}`} className="w-full btn-secondary !py-2.5 text-[10px] font-black uppercase flex items-center justify-center gap-2">
                        <FaEdit size={10} /> Edit Posting
                      </Link>
                      <button className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black uppercase text-text-muted hover:text-white transition-all">
                        Analytics
                      </button>
                   </div>
                </div>
             </div>
           ))}
           {jobs.length === 0 && (
             <div className="col-span-full glass-card p-32 text-center border-dashed border-white/10">
                <FaRocket className="mx-auto text-text-muted mb-8 opacity-10" size={80} />
                <h3 className="text-3xl font-black text-text-primary mb-4 italic uppercase tracking-tighter">Your Talent Fleet Awaits</h3>
                <p className="text-text-secondary mb-10 max-w-lg mx-auto leading-relaxed">Launch your first job posting and access the world's most innovative tech talent through our intelligent recruitment engine.</p>
                <Link href="/dashboard/employer/jobs" className="btn-primary !px-12 !py-4 text-xs font-black uppercase tracking-widest shadow-2xl shadow-primary/30">
                  post your first mission
                </Link>
             </div>
           )}
        </div>
      )}

      {activeTab === 'search' && (
        <div className="space-y-10 animate-in slide-in-from-bottom-5 duration-700">
           <div className="glass-card p-10 border border-white/5 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
              <h3 className="text-2xl font-black text-text-primary mb-8 flex items-center gap-4 italic uppercase tracking-tighter">
                <FaGlobe className="text-primary-light animate-pulse" size={24} /> Talent Discovery Engine
              </h3>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                   <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted" />
                   <input 
                      placeholder="Search talent by skills (e.g. Next.js, Cloud Architecture, Python)..." 
                      className="w-full bg-dark border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm text-text-primary focus:border-primary/50 shadow-inner"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                   />
                </div>
                <button 
                  onClick={async () => {
                    setLoading(true);
                    try {
                       const res = await fetch(`/api/candidates?skills=${searchQuery}&name=${searchQuery}`);
                       const data = await res.json();
                       setFilteredCandidates(data.candidates || []);
                       if (data.candidates?.length === 0) toast('No candidates matching those criteria');
                    } catch {
                      toast.error('Discovery engine encountered an error');
                    } finally { setLoading(false); }
                  }}
                  className="btn-primary !px-12 !py-5 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                >
                  Initiate Search
                </button>
              </div>
           </div>

           {filteredCandidates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCandidates.map(candidate => (
                  <div key={candidate._id} className="glass-card p-8 border border-white/5 hover:border-secondary/20 transition-all flex flex-col justify-between group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-secondary opacity-5 blur-3xl -mr-12 -mt-12 group-hover:opacity-10 transition-opacity" />
                    
                    <div>
                      <div className="flex items-center gap-5 mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary-light font-black text-2xl border border-secondary/10 group-hover:scale-110 transition-transform">
                          {candidate.name?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-text-primary group-hover:text-secondary-light transition-colors">{candidate.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                             <p className="text-[10px] text-text-muted uppercase tracking-widest font-black">Verified Talent</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-3">Core Expertise</p>
                          <div className="flex flex-wrap gap-2">
                            {candidate.skills?.slice(0, 5).map((s, i) => (
                              <span key={i} className="px-3 py-1 rounded-lg bg-white/5 text-[10px] font-black text-text-secondary uppercase border border-white/5 group-hover:border-secondary/20 transition-all">#{s}</span>
                            ))}
                          </div>
                        </div>
                        
                        {candidate.experience?.[0] && (
                          <div>
                            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2">Latest Role</p>
                            <p className="text-xs text-text-primary font-bold">{candidate.experience[0].title}</p>
                            <p className="text-[10px] text-text-muted mt-0.5">{candidate.experience[0].company} • {candidate.experience[0].duration}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <button className="w-full btn-secondary !py-4 text-[10px] font-black uppercase tracking-widest mt-10 shadow-xl shadow-secondary/5">
                      Request Full Profile
                    </button>
                  </div>
                ))}
              </div>
           ) : searchQuery && !loading && (
             <div className="text-center py-32 glass-card border border-white/5">
                <FaUserTimes className="mx-auto text-text-muted mb-6 opacity-10" size={64} />
                <h4 className="text-xl font-black text-text-primary uppercase tracking-tighter italic">Discovery Threshold Not Met</h4>
                <p className="text-text-muted text-sm mt-2 max-w-sm mx-auto">Try broadening your skill criteria or search by verified names.</p>
             </div>
           )}
           
           {!searchQuery && filteredCandidates.length === 0 && (
              <div className="text-center py-20">
                 <p className="text-text-muted text-xs font-bold uppercase tracking-[0.3em] italic">Awaiting Search Parameters...</p>
              </div>
           )}
        </div>
      )}
    </div>
  );
}
