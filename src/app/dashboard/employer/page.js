'use client';

import { useState, useEffect } from 'react';
import { 
  FaPlus, FaBriefcase, FaUsers, FaEdit, FaTrash, FaEye, 
  FaCheck, FaSpinner, FaArrowUp, FaSearch, 
  FaChartLine, FaUserCheck, FaUserTimes, FaComments, FaBuilding, FaMapMarkerAlt 
} from 'react-icons/fa';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function EmployerDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stats, setStats] = useState({ jobs: 0, activeJobs: 0, applications: 0, shortlisted: 0 });
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const activeTab = searchParams.get('tab') || 'overview';
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
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
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <FaSpinner className="animate-spin text-primary" size={40} />
      <p className="text-text-muted font-bold tracking-tighter uppercase">Initializing Recruitment Hub...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-primary uppercase tracking-tighter italic">
            {activeTab === 'overview' && 'Recruitment Hub'}
            {activeTab === 'ats' && 'Applicant Pipeline'}
            {activeTab === 'jobs' && 'Job Management'}
            {activeTab === 'search' && 'Talent Search'}
          </h1>
          <p className="text-text-secondary">Welcome back, {company?.companyName}.</p>
        </div>
        <Link href="/dashboard/employer/jobs" className="btn-primary !px-8 shadow-xl shadow-primary/20 flex items-center gap-2">
          <FaPlus size={14} /> Post New Job
        </Link>
      </header>

      {activeTab === 'overview' && (
        <div className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Postings', value: stats.jobs, icon: FaBriefcase, color: 'from-blue-500 to-indigo-600' },
              { label: 'Active Jobs', value: stats.activeJobs, icon: FaCheck, color: 'from-emerald-500 to-teal-600' },
              { label: 'Applications', value: stats.applications, icon: FaUsers, color: 'from-orange-500 to-amber-600' },
              { label: 'Pipeline', value: stats.shortlisted, icon: FaUserCheck, color: 'from-purple-500 to-pink-600' },
            ].map((item, idx) => (
              <div key={idx} className="glass-card p-6 border border-white/5 group relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.color} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity`} />
                <div className="text-3xl font-black text-text-primary mb-1 tracking-tighter">{item.value}</div>
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-card p-8 border border-white/5">
              <h2 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2 uppercase tracking-widest">
                <FaArrowUp className="text-success" size={14} /> Recent Submissions
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
                        <p className="text-[10px] text-text-muted">For {app.job?.title}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-text-muted">{new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
                {applications.length === 0 && <p className="text-sm text-text-muted text-center py-10">No recent applications.</p>}
              </div>
            </div>

            <div className="glass-card p-8 border border-white/5">
              <h2 className="text-lg font-bold text-text-primary mb-6 uppercase tracking-widest">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => router.push('/dashboard/employer/jobs')} className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-center group">
                  <FaBriefcase className="text-primary-light group-hover:scale-110 transition-transform" size={24} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Edit Jobs</span>
                </button>
                <button onClick={() => router.push('/dashboard/employer?tab=ats')} className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-center group">
                  <FaUsers className="text-secondary-light group-hover:scale-110 transition-transform" size={24} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Pipeline</span>
                </button>
                <button onClick={() => router.push('/dashboard/employer/settings')} className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-center group">
                  <FaBuilding className="text-accent-light group-hover:scale-110 transition-transform" size={24} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Company Info</span>
                </button>
                <button onClick={() => router.push('/dashboard/employer?tab=search')} className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-center group">
                  <FaSearch className="text-success group-hover:scale-110 transition-transform" size={24} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Find Talent</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ats' && (
        <div className="space-y-6">
          <div className="relative mb-8 max-w-xl">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              placeholder="Search applicants by name..." 
              className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-text-primary focus:border-primary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="glass-card p-20 text-center text-text-muted">No applications found.</div>
            ) : (
              applications.filter(a => a.candidate?.name?.toLowerCase().includes(searchQuery.toLowerCase())).map(app => (
                <div key={app._id} className="glass-card p-6 border border-white/5 hover:border-primary/20 transition-all">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary-light font-bold text-lg border border-primary/20">
                        {app.candidate?.name?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-text-primary text-lg mb-1">{app.candidate?.name}</h3>
                        <p className="text-xs text-text-muted font-medium">Applied for <span className="text-primary-light font-bold">{app.job?.title}</span> • {new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center flex-wrap gap-4">
                      <div className="flex gap-2 p-1 bg-dark rounded-xl border border-white/5">
                        {[
                          { id: 'shortlisted', icon: FaUserCheck, color: 'text-blue-400', label: 'Shortlist' },
                          { id: 'interviewing', icon: FaComments, color: 'text-purple-400', label: 'Interview' },
                          { id: 'rejected', icon: FaUserTimes, color: 'text-danger', label: 'Reject' }
                        ].map(status => (
                          <button 
                            key={status.id}
                            onClick={() => handleStatusUpdate(app._id, status.id)}
                            className={`p-3 rounded-lg transition-all ${app.status === status.id ? 'bg-white/5 ' + status.color : 'text-text-muted hover:bg-white/5'}`}
                            title={status.label}
                          >
                            <status.icon size={16} />
                          </button>
                        ))}
                      </div>
                      <a href={app.resumeUrl} target="_blank" className="btn-secondary !py-3 !px-5 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
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
              <div key={job._id} className="glass-card p-6 border border-white/5 flex items-center justify-between hover:border-primary/20 transition-all group">
                 <div>
                  <h3 className="font-bold text-text-primary text-lg mb-1 group-hover:text-primary-light transition-colors">{job.title}</h3>
                  <div className="flex gap-4 text-[10px] text-text-muted font-black uppercase tracking-widest">
                    <span className="flex items-center gap-1"><FaMapMarkerAlt size={10} /> {job.location}</span>
                    <span>• {job.type}</span>
                    <button onClick={() => router.push('/dashboard/employer?tab=ats')} className="text-primary-light hover:underline underline-offset-4">View Applicants</button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => router.push(`/dashboard/employer/jobs/${job._id}`)} className="p-3 rounded-xl bg-white/5 text-text-muted hover:text-primary-light transition-all border border-white/5"><FaEdit size={14} /></button>
                  <button className="p-3 rounded-xl bg-white/5 text-text-muted hover:text-danger transition-all border border-white/5"><FaTrash size={14} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'search' && (
        <div className="space-y-8 animate-in fade-in duration-500">
           <div className="glass-card p-8 border border-white/5 bg-gradient-to-br from-primary/5 to-transparent">
             <h3 className="text-xl font-black text-text-primary mb-6 flex items-center gap-2 italic uppercase tracking-tighter">
               <FaSearch className="text-primary-light" size={18} /> Discovery Engine
             </h3>
             <div className="flex flex-col md:flex-row gap-4">
               <input 
                 placeholder="Search by name or skills (e.g. React, Python)..." 
                 className="flex-1 bg-dark border border-white/10 rounded-xl py-4 px-6 text-sm text-text-primary focus:border-primary/50"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
               <button 
                 onClick={async () => {
                   setLoading(true);
                   try {
                      const res = await fetch(`/api/candidates?skills=${searchQuery}&name=${searchQuery}`);
                      const data = await res.json();
                      setFilteredCandidates(data.candidates || []);
                   } catch {} finally { setLoading(false); }
                 }}
                 className="btn-primary !px-10"
               >
                 Search Talent
               </button>
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCandidates.map(candidate => (
                <div key={candidate._id} className="glass-card p-6 border border-white/5 hover:border-secondary/20 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary-light font-bold text-lg">
                        {candidate.name?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-text-primary">{candidate.name}</h4>
                        <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Verified Professional</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {candidate.skills?.slice(0, 4).map((s, i) => (
                        <span key={i} className="px-2 py-1 rounded-lg bg-white/5 text-[9px] font-black text-text-muted uppercase">#{s}</span>
                      ))}
                    </div>
                  </div>
                  <button className="w-full btn-secondary !py-2.5 text-[10px] font-black uppercase tracking-widest">
                    View Profile
                  </button>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
}
