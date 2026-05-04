'use client';

import { useState, useEffect } from 'react';
import { FaEye, FaCheck, FaTimes, FaSpinner, FaDownload, FaBriefcase, FaEnvelope, FaClock, FaFilter } from 'react-icons/fa';

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/applications');
      const data = await res.json();
      setApplications(data.applications || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchApplications();
    } catch {}
  };

  const filteredApps = filter === 'all' 
    ? applications 
    : applications.filter(app => app.status === filter);

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Job Applications</h1>
          <p className="text-text-secondary text-sm mt-1">Review and manage candidate applications</p>
        </div>
        
        <div className="flex items-center gap-3 bg-dark-light p-1.5 rounded-xl border border-white/5">
          {['all', 'applied', 'shortlisted', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                filter === s ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><FaSpinner className="animate-spin text-primary" size={32} /></div>
      ) : filteredApps.length === 0 ? (
        <div className="glass-card p-12 text-center text-text-muted">No applications found.</div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => (
            <div key={app._id} className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group border border-white/5 hover:border-primary/20 transition-all">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary-light font-bold">
                  {app.candidate?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-text-primary mb-1">{app.candidate?.name}</h3>
                  <div className="flex flex-wrap gap-4 text-xs text-text-muted font-medium">
                    <span className="flex items-center gap-1"><FaEnvelope size={10} /> {app.candidate?.email}</span>
                    <span className="flex items-center gap-1"><FaBriefcase size={10} /> {app.job?.title}</span>
                    <span className="flex items-center gap-1"><FaClock size={10} /> {new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                <div className="flex flex-col md:items-end">
                  <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold mb-1">Status</span>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter ${
                    app.status === 'applied' ? 'bg-yellow-400/10 text-yellow-400' :
                    app.status === 'shortlisted' ? 'bg-green-400/10 text-green-400' :
                    'bg-danger/10 text-danger'
                  }`}>
                    {app.status}
                  </span>
                </div>

                <div className="flex gap-2 ml-auto">
                  <a 
                    href={app.resumeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-3 rounded-xl bg-white/5 text-text-primary hover:bg-primary/20 hover:text-primary-light transition-all shadow-sm"
                    title="View Resume"
                  >
                    <FaEye size={14} />
                  </a>
                  <button 
                    onClick={() => updateStatus(app._id, 'shortlisted')}
                    className="p-3 rounded-xl bg-blue-400/10 text-blue-400 hover:bg-blue-400/20 transition-all"
                    title="Shortlist"
                  >
                    <FaCheck size={14} />
                  </button>
                  <button 
                    onClick={() => updateStatus(app._id, 'rejected')}
                    className="p-3 rounded-xl bg-danger/10 text-danger hover:bg-danger/20 transition-all"
                    title="Reject"
                  >
                    <FaTimes size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
