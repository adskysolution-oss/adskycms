'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaBriefcase, FaUsers, FaEdit, FaTrash, FaEye, FaCheck, FaTimes, FaSpinner, FaArrowUp } from 'react-icons/fa';
import Link from 'next/link';

export default function EmployerDashboard() {
  const [stats, setStats] = useState({ jobs: 0, applications: 0 });
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Employer's Jobs
        const jobsRes = await fetch('/api/jobs?my=true');
        const jobsData = await jobsRes.json();
        setJobs(jobsData.jobs || []);

        // Fetch Applications for Employer's Jobs
        const appRes = await fetch('/api/applications?employer=true');
        const appData = await appRes.json();
        setApplications(appData.applications || []);

        setStats({
          jobs: jobsData.jobs?.length || 0,
          applications: appData.applications?.length || 0
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStatusUpdate = async (appId, status) => {
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setApplications(apps => apps.map(a => a._id === appId ? { ...a, status } : a));
      }
    } catch (error) {
      alert('Error updating status');
    }
  };

  if (loading) return <div className="p-20 text-center text-text-muted"><FaSpinner className="animate-spin inline mr-2" /> Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-dark pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Employer Dashboard</h1>
            <p className="text-text-secondary">Manage your job listings and track applicants.</p>
          </div>
          <Link href="/admin/jobs" className="btn-primary text-sm">
            <FaPlus className="mr-2" /> Post New Job
          </Link>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="glass-card p-8 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary-light">
                <FaBriefcase size={20} />
              </div>
              <span className="text-success text-xs font-bold flex items-center gap-1">
                <FaArrowUp size={10} /> Active
              </span>
            </div>
            <div className="text-4xl font-bold text-text-primary mb-1">{stats.jobs}</div>
            <div className="text-text-muted text-sm uppercase tracking-widest font-bold">Total Job Postings</div>
          </div>
          <div className="glass-card p-8 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary-light">
                <FaUsers size={20} />
              </div>
              <span className="text-primary-light text-xs font-bold">New</span>
            </div>
            <div className="text-4xl font-bold text-text-primary mb-1">{stats.applications}</div>
            <div className="text-text-muted text-sm uppercase tracking-widest font-bold">Total Applications</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 mb-8 border-b border-white/5">
          <button 
            onClick={() => setActiveTab('jobs')}
            className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'jobs' ? 'text-primary-light border-b-2 border-primary' : 'text-text-muted hover:text-text-primary'}`}
          >
            My Jobs
          </button>
          <button 
            onClick={() => setActiveTab('apps')}
            className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'apps' ? 'text-primary-light border-b-2 border-primary' : 'text-text-muted hover:text-text-primary'}`}
          >
            Applicants
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'jobs' ? (
          <div className="space-y-4">
            {jobs.length === 0 ? (
              <div className="glass-card p-12 text-center text-text-muted border border-white/5">No jobs posted yet.</div>
            ) : (
              jobs.map(job => (
                <div key={job._id} className="glass-card p-6 flex items-center justify-between border border-white/5 hover:border-primary/20 transition-all group">
                  <div>
                    <h3 className="font-bold text-text-primary text-lg">{job.title}</h3>
                    <div className="flex gap-4 mt-1 text-sm text-text-muted">
                      <span>{job.location}</span>
                      <span>{job.type}</span>
                      <span className="text-primary-light font-bold">0 Applicants</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="p-3 rounded-xl bg-white/5 text-text-muted hover:text-primary-light transition-all"><FaEdit /></button>
                    <button className="p-3 rounded-xl bg-white/5 text-text-muted hover:text-danger transition-all"><FaTrash /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="glass-card p-12 text-center text-text-muted border border-white/5">No applications received yet.</div>
            ) : (
              applications.map(app => (
                <div key={app._id} className="glass-card p-6 border border-white/5 hover:border-primary/20 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary-light font-bold">
                        {app.candidate?.name?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-text-primary">{app.candidate?.name}</h3>
                        <p className="text-xs text-text-muted">{app.candidate?.email} · Applied for <span className="text-primary-light">{app.job?.title}</span></p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <a href={app.resumeUrl} target="_blank" className="p-3 rounded-xl bg-white/5 text-text-muted hover:text-text-primary transition-all flex items-center gap-2 text-xs font-bold">
                        <FaEye /> View Resume
                      </a>
                      
                      <div className="flex gap-2 border-l border-white/10 pl-4">
                        <button 
                          onClick={() => handleStatusUpdate(app._id, 'shortlisted')}
                          disabled={app.status === 'shortlisted'}
                          className={`p-3 rounded-xl transition-all ${app.status === 'shortlisted' ? 'bg-green-400 text-white shadow-lg' : 'bg-white/5 text-green-400 hover:bg-green-400/20'}`}
                        >
                          <FaCheck />
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(app._id, 'rejected')}
                          disabled={app.status === 'rejected'}
                          className={`p-3 rounded-xl transition-all ${app.status === 'rejected' ? 'bg-danger text-white shadow-lg' : 'bg-white/5 text-danger hover:bg-danger/20'}`}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
