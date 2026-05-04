'use client';

import { useState, useEffect } from 'react';
import { 
  FaPlus, FaBriefcase, FaUsers, FaEdit, FaTrash, FaEye, 
  FaCheck, FaTimes, FaSpinner, FaArrowUp, FaSearch, 
  FaChartLine, FaFilter, FaUserCheck, FaUserTimes, FaComments, FaBuilding, FaMapMarkerAlt 
} from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EmployerDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ jobs: 0, activeJobs: 0, applications: 0, shortlisted: 0 });
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Check Company Status
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

        // 2. Fetch Data
        const [jobsRes, appRes] = await Promise.all([
          fetch('/api/jobs?my=true'),
          fetch('/api/applications?employer=true')
        ]);

        const jobsData = await jobsRes.json();
        const appData = await appRes.json();

        const jobsList = jobsData.jobs || [];
        const appsList = appData.applications || [];

        setJobs(jobsList);
        setApplications(appsList);

        setStats({
          jobs: jobsList.length,
          activeJobs: jobsList.filter(j => j.isActive).length,
          applications: appsList.length,
          shortlisted: appsList.filter(a => a.status === 'shortlisted' || a.status === 'interviewing').length
        });

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const handleStatusUpdate = async (appId, status) => {
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setApplications(apps => apps.map(a => a._id === appId ? { ...a, status } : a));
        // Update stats
        const updatedApps = applications.map(a => a._id === appId ? { ...a, status } : a);
        setStats(prev => ({
          ...prev,
          shortlisted: updatedApps.filter(a => a.status === 'shortlisted' || a.status === 'interviewing').length
        }));
      }
    } catch (error) {
      alert('Error updating status');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center space-y-4">
      <FaSpinner className="animate-spin text-primary" size={40} />
      <p className="text-text-muted font-bold tracking-tighter uppercase">Initializing SaaS Dashboard...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row justify-between md:items-end gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary-light border border-primary/20">
                <FaChartLine size={18} />
              </div>
              <h1 className="text-3xl font-bold text-text-primary">Recruitment Hub</h1>
            </div>
            <p className="text-text-secondary">Welcome back, {company?.companyName}. Here's your hiring overview.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard/employer/jobs" className="btn-primary !px-8 !py-4 shadow-xl shadow-primary/20 flex items-center gap-2">
              <FaPlus size={14} /> Post New Job
            </Link>
          </div>
        </header>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Postings', value: stats.jobs, icon: FaBriefcase, color: 'from-blue-500 to-indigo-600', sub: 'Total listings' },
            { label: 'Active Jobs', value: stats.activeJobs, icon: FaCheck, color: 'from-emerald-500 to-teal-600', sub: 'Currently live' },
            { label: 'Applications', value: stats.applications, icon: FaUsers, color: 'from-orange-500 to-amber-600', sub: 'Recent submissions' },
            { label: 'Pipeline', value: stats.shortlisted, icon: FaUserCheck, color: 'from-purple-500 to-pink-600', sub: 'Shortlisted/Interview' },
          ].map((item, idx) => (
            <div key={idx} className="glass-card p-6 border border-white/5 hover:border-primary/20 transition-all group relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.color} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity`} />
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-text-secondary group-hover:text-primary-light transition-colors">
                  <item.icon size={18} />
                </div>
              </div>
              <div className="text-4xl font-black text-text-primary mb-1 tracking-tighter">{item.value}</div>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{item.label}</div>
              <div className="text-[10px] text-text-muted mt-3 italic">{item.sub}</div>
            </div>
          ))}
        </div>

        {/* Dashboard Tabs */}
        <div className="flex flex-wrap gap-8 mb-10 border-b border-white/5">
          {[
            { id: 'overview', label: 'Overview', icon: FaChartLine },
            { id: 'jobs', label: 'My Listings', icon: FaBriefcase },
            { id: 'ats', label: 'Applicant Tracking', icon: FaUsers },
            { id: 'search', label: 'Candidate Search', icon: FaSearch }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === tab.id ? 'text-primary-light border-b-2 border-primary' : 'text-text-muted hover:text-text-primary'}`}
            >
              <tab.icon size={12} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-card p-8 border border-white/5">
              <h2 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                <FaArrowUp className="text-success" size={14} /> Recent Applications
              </h2>
              <div className="space-y-4">
                {applications.slice(0, 5).map(app => (
                  <div key={app._id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary-light font-bold text-xs">
                        {app.candidate?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-primary">{app.candidate?.name}</p>
                        <p className="text-[10px] text-text-muted">Applied for {app.job?.title}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-text-muted">{new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
                {applications.length === 0 && <p className="text-sm text-text-muted text-center py-10">No recent applications.</p>}
              </div>
            </div>

            <div className="glass-card p-8 border border-white/5">
              <h2 className="text-lg font-bold text-text-primary mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => router.push('/dashboard/employer/jobs')} className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-center">
                  <FaBriefcase className="text-primary-light" size={24} />
                  <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">Edit Jobs</span>
                </button>
                <button onClick={() => setActiveTab('ats')} className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-center">
                  <FaUsers className="text-secondary-light" size={24} />
                  <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">Pipeline</span>
                </button>
                <button onClick={() => router.push('/dashboard/employer/settings')} className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-center">
                  <FaBuilding className="text-accent-light" size={24} />
                  <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">Edit Company</span>
                </button>
                <button onClick={() => setActiveTab('search')} className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-center">
                  <FaSearch className="text-success" size={24} />
                  <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">Find Talent</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ats' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                <input 
                  placeholder="Search applicants..." 
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-text-primary focus:border-primary/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-xl border border-white/5">
                {['all', 'shortlisted', 'interviewing', 'rejected'].map(s => (
                  <button key={s} className="px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-text-primary transition-colors">{s}</button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {applications.length === 0 ? (
                <div className="glass-card p-20 text-center text-text-muted">No applications found.</div>
              ) : (
                applications.filter(a => a.candidate?.name?.toLowerCase().includes(searchQuery.toLowerCase())).map(app => (
                  <div key={app._id} className="glass-card p-6 border border-white/5 hover:border-primary/20 transition-all">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary-light font-bold text-lg border border-primary/20 shadow-inner">
                          {app.candidate?.name?.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-text-primary text-lg mb-1">{app.candidate?.name}</h3>
                          <div className="flex flex-wrap gap-4 text-xs text-text-muted font-medium">
                            <span className="flex items-center gap-2">Applied for <span className="text-primary-light">{app.job?.title}</span></span>
                            <span>• {new Date(app.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center flex-wrap gap-4">
                        {/* ATS Status Controls */}
                        <div className="flex gap-2 p-1 bg-dark rounded-xl border border-white/5 shadow-inner">
                          {[
                            { id: 'shortlisted', icon: FaUserCheck, color: 'text-blue-400', label: 'Shortlist' },
                            { id: 'interviewing', icon: FaComments, color: 'text-purple-400', label: 'Interview' },
                            { id: 'rejected', icon: FaUserTimes, color: 'text-danger', label: 'Reject' }
                          ].map(status => (
                            <button 
                              key={status.id}
                              onClick={() => handleStatusUpdate(app._id, status.id)}
                              className={`p-3 rounded-lg transition-all flex flex-col items-center gap-1 group/btn ${app.status === status.id ? 'bg-white/5 ' + status.color : 'text-text-muted hover:bg-white/5 hover:' + status.color}`}
                              title={status.label}
                            >
                              <status.icon size={16} />
                              <span className="text-[8px] font-bold uppercase tracking-tighter opacity-0 group-hover/btn:opacity-100 transition-opacity">{status.label}</span>
                            </button>
                          ))}
                        </div>

                        <a href={app.resumeUrl} target="_blank" className="btn-secondary !py-3 !px-5 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-inner">
                          <FaEye size={12} /> View Resume
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="space-y-4">
            {jobs.length === 0 ? (
              <div className="glass-card p-20 text-center text-text-muted border border-white/5">No job listings created yet.</div>
            ) : (
              jobs.map(job => (
                <div key={job._id} className="glass-card p-6 border border-white/5 flex items-center justify-between hover:border-primary/20 transition-all">
                   <div>
                    <h3 className="font-bold text-text-primary text-lg mb-1">{job.title}</h3>
                    <div className="flex gap-4 text-xs text-text-muted font-medium">
                      <span className="flex items-center gap-1"><FaMapMarkerAlt size={10} /> {job.location}</span>
                      <span>• {job.type}</span>
                      <span className="text-primary-light font-bold underline cursor-pointer" onClick={() => setActiveTab('ats')}>View Applicants</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-3 rounded-xl bg-white/5 text-text-muted hover:text-primary-light transition-all border border-white/5"><FaEdit /></button>
                    <button className="p-3 rounded-xl bg-white/5 text-text-muted hover:text-danger transition-all border border-white/5"><FaTrash /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="glass-card p-8 border border-white/5 bg-gradient-to-br from-primary/5 to-transparent">
               <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2 italic uppercase tracking-tighter">
                 <FaSearch className="text-primary-light" size={18} /> Proactive Talent Discovery
               </h3>
               <div className="flex flex-col md:flex-row gap-4">
                 <div className="relative flex-1">
                   <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                   <input 
                     placeholder="Search by name or skills (e.g. React, Python)..." 
                     className="w-full bg-dark border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-text-primary focus:border-primary/50 shadow-inner"
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
                        // We reuse candidates state or add a new one. Let's use a local state.
                        setFilteredCandidates(data.candidates || []);
                     } catch {} finally { setLoading(false); }
                   }}
                   className="btn-primary !px-10 shadow-xl shadow-primary/20"
                 >
                   Search Talent
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(filteredCandidates || []).map(candidate => (
                  <div key={candidate._id} className="glass-card p-6 border border-white/5 hover:border-secondary/20 transition-all flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary-light font-bold text-lg border border-secondary/20 group-hover:scale-110 transition-transform">
                          {candidate.name?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-text-primary">{candidate.name}</h4>
                          <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Verified Professional</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {candidate.skills?.slice(0, 4).map((s, i) => (
                          <span key={i} className="px-2 py-1 rounded-lg bg-white/5 border border-white/5 text-[9px] font-bold text-text-muted uppercase">#{s}</span>
                        ))}
                      </div>
                    </div>
                    <button className="w-full btn-secondary !py-2.5 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-inner">
                      <FaEye size={12} /> View Profile
                    </button>
                  </div>
                ))}
                {(filteredCandidates || []).length === 0 && searchQuery && !loading && (
                   <div className="col-span-full py-20 text-center text-text-muted font-bold italic uppercase tracking-widest opacity-50">
                      No talent matches found for "{searchQuery}"
                   </div>
                )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
