'use client';

import { useState, useEffect } from 'react';
import { 
  FaUser, FaTools, FaFileUpload, FaBriefcase, FaClock, 
  FaCheckCircle, FaTimesCircle, FaSpinner, FaRocket, 
  FaSearch, FaBookmark, FaComments, FaGraduationCap, FaBuilding 
} from 'react-icons/fa';
import Link from 'next/link';

export default function CandidateDashboard() {
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resumeFile, setResumeFile] = useState(null);
  const [skills, setSkills] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch('/api/user/me');
        const userData = await userRes.json();
        setUser(userData.user);

        const appRes = await fetch(`/api/applications?candidateId=${userData.user._id}`);
        const appData = await appRes.json();
        setApplications(appData.applications || []);
        
        setSkills(userData.user.skills?.join(', ') || '');
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const calculateProgress = () => {
    if (!user) return 0;
    let score = 0;
    if (user.name) score += 20;
    if (user.email) score += 20;
    if (user.resumeUrl) score += 20;
    if (user.skills?.length > 0) score += 20;
    if (user.experience?.length > 0) score += 10;
    if (user.education?.length > 0) score += 10;
    return score;
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let resumeUrl = user.resumeUrl || '';
      
      if (resumeFile) {
        const formData = new FormData();
        formData.append('file', resumeFile);
        formData.append('folder', 'resumes');
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();
        resumeUrl = uploadData.media.url;
      }

      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills: skills.split(',').map(s => s.trim()).filter(Boolean),
          resumeUrl
        }),
      });

      const updated = await res.json();
      setUser(updated.user);
      alert('Profile optimized for recruiters!');
    } catch (error) {
      alert('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center space-y-4">
      <FaSpinner className="animate-spin text-primary" size={40} />
      <p className="text-text-muted font-bold tracking-tighter uppercase">Building Your Career Dashboard...</p>
    </div>
  );

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-dark pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary-light border border-secondary/20">
                <FaRocket size={18} />
              </div>
              <h1 className="text-3xl font-bold text-text-primary uppercase tracking-tighter italic">Mission Control</h1>
            </div>
            <p className="text-text-secondary">Track your professional journey and find your next breakthrough.</p>
          </div>
          <Link href="/careers" className="btn-primary !px-8 shadow-xl shadow-primary/20 flex items-center gap-2">
            <FaSearch size={14} /> Explore New Roles
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Area */}
          <div className="lg:col-span-1 space-y-6">
            {/* Progress Card */}
            <div className="glass-card p-6 border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-secondary opacity-5 blur-2xl group-hover:opacity-10 transition-opacity" />
              <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-6 flex items-center justify-between">
                Profile Completion
                <span className="text-secondary-light">{progress}%</span>
              </h2>
              <div className="w-full bg-white/5 h-2 rounded-full mb-6 overflow-hidden">
                <div className="bg-gradient-to-r from-secondary to-primary h-full transition-all duration-1000" style={{ width: `${progress}%` }} />
              </div>
              <ul className="space-y-3">
                {[
                  { label: 'Upload Resume', done: !!user.resumeUrl },
                  { label: 'Add Skills', done: user.skills?.length > 0 },
                  { label: 'Experience History', done: user.experience?.length > 0 },
                ].map((step, idx) => (
                  <li key={idx} className={`text-[10px] flex items-center gap-2 font-bold uppercase tracking-wider ${step.done ? 'text-success' : 'text-text-muted'}`}>
                    {step.done ? <FaCheckCircle size={10} /> : <div className="w-2.5 h-2.5 rounded-full border border-white/20" />}
                    {step.label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Stats */}
            <div className="glass-card p-6 border border-white/5">
              <h2 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-6">Activity Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Applied Jobs</span>
                  <span className="font-bold text-text-primary">{applications.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Interviews</span>
                  <span className="font-bold text-purple-400">{applications.filter(a => a.status === 'interviewing').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Saved</span>
                  <span className="font-bold text-secondary-light">0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tabs */}
            <div className="flex gap-8 mb-4 border-b border-white/5">
              {[
                { id: 'overview', label: 'Dashboard', icon: FaRocket },
                { id: 'applications', label: 'My Applications', icon: FaBriefcase },
                { id: 'interviews', label: 'Interviews', icon: FaComments },
                { id: 'profile', label: 'Optimize Profile', icon: FaUser }
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
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Status Banner */}
                  <div className="glass-card p-8 border border-white/5 bg-gradient-to-br from-primary/10 to-transparent">
                    <h3 className="text-lg font-bold text-text-primary mb-2 italic">Ready for a move?</h3>
                    <p className="text-sm text-text-muted mb-6">Recruiters are actively searching for experts in <span className="text-primary-light font-bold">#NextJS #React</span>.</p>
                    <button className="btn-secondary text-[10px] uppercase font-bold tracking-widest !py-2">Update Availability</button>
                  </div>
                  
                  {/* Recommendation Card */}
                  <div className="glass-card p-8 border border-white/5">
                    <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                      <FaBriefcase className="text-secondary-light" /> Recommended Roles
                    </h3>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-secondary/20 transition-all cursor-pointer">
                      <p className="text-xs font-bold text-text-primary">Lead Frontend Architect</p>
                      <p className="text-[10px] text-text-muted">AdSky Solutions · Mumbai, India</p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity List */}
                <div className="glass-card p-8 border border-white/5">
                  <h3 className="text-sm font-bold text-text-primary mb-6 flex items-center gap-2">
                    <FaClock className="text-text-muted" /> Recent Activity
                  </h3>
                  <div className="space-y-4">
                    {applications.slice(0, 3).map(app => (
                      <div key={app._id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-dark flex items-center justify-center text-text-muted">
                            <FaBuilding size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-text-primary">{app.job?.title}</p>
                            <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Status: {app.status}</p>
                          </div>
                        </div>
                        <div className="text-[10px] font-bold text-text-muted">{new Date(app.createdAt).toLocaleDateString()}</div>
                      </div>
                    ))}
                    {applications.length === 0 && <p className="text-center py-10 text-text-muted text-sm italic">No recent activity found.</p>}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'applications' && (
              <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                {applications.length === 0 ? (
                  <div className="glass-card p-20 text-center text-text-muted border border-white/5 uppercase tracking-widest italic font-bold">
                    Mission log is empty. Start applying.
                  </div>
                ) : (
                  applications.map((app) => (
                    <div key={app._id} className="glass-card p-6 border border-white/5 flex flex-col md:flex-row items-center justify-between hover:border-primary/20 transition-all group">
                      <div className="flex items-center gap-6 w-full">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center text-text-muted group-hover:text-primary-light transition-all border border-white/5">
                          <FaBriefcase size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-text-primary text-xl mb-1">{app.job?.title}</h3>
                          <div className="flex items-center gap-4 text-xs text-text-muted font-bold tracking-tight uppercase">
                            <span className="flex items-center gap-1.5"><FaBuilding size={12} /> TechFlow Corp</span>
                            <span className="flex items-center gap-1.5"><FaClock size={12} /> {new Date(app.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 mt-6 md:mt-0 w-full md:w-auto justify-between md:justify-end">
                        <div className="flex flex-col md:items-end">
                          <span className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Current Status</span>
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg ${
                            app.status === 'applied' ? 'bg-yellow-400/10 text-yellow-400 shadow-yellow-400/5 border border-yellow-400/10' :
                            app.status === 'shortlisted' ? 'bg-blue-400/10 text-blue-400 shadow-blue-400/5 border border-blue-400/10' :
                            app.status === 'interviewing' ? 'bg-purple-400/10 text-purple-400 shadow-purple-400/5 border border-purple-400/10' :
                            'bg-danger/10 text-danger shadow-danger/5 border border-danger/10'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="glass-card p-8 border border-white/5 animate-in zoom-in-95 duration-500">
                <form onSubmit={handleProfileUpdate} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                      <h3 className="text-xs font-black text-text-muted uppercase tracking-[0.3em] mb-6 border-l-2 border-primary pl-4">Skills Matrix</h3>
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Core Skills (comma separated)</label>
                      <textarea 
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        className="w-full bg-dark border border-white/10 rounded-2xl px-6 py-5 text-sm text-text-primary focus:border-primary h-40 resize-none transition-all shadow-inner"
                        placeholder="React, TypeScript, Node.js, Cloud Architecture..."
                      />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-text-muted uppercase tracking-[0.3em] mb-6 border-l-2 border-secondary pl-4">Credentials</h3>
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Resume / Portfolio (PDF)</label>
                      <div className="relative group">
                        <input 
                          type="file" 
                          id="resume" 
                          className="hidden" 
                          onChange={(e) => setResumeFile(e.target.files[0])}
                        />
                        <label 
                          htmlFor="resume" 
                          className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-white/10 rounded-2xl bg-white/5 cursor-pointer group-hover:border-secondary/50 transition-all hover:bg-white/10"
                        >
                          <FaFileUpload className="mb-4 text-text-muted group-hover:text-secondary-light transition-colors" size={32} />
                          <span className="text-sm text-text-secondary font-bold uppercase tracking-widest">{resumeFile ? resumeFile.name : 'Upload Credentials'}</span>
                        </label>
                      </div>
                      {user?.resumeUrl && !resumeFile && (
                        <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-[10px] font-bold text-text-muted uppercase">Verified Resume Attached</span>
                          <a href={user.resumeUrl} target="_blank" className="text-[10px] text-secondary-light font-black uppercase hover:underline">View</a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-8 border-t border-white/5">
                    <button 
                      type="submit" 
                      disabled={saving}
                      className="btn-primary !px-16 !py-5 text-lg font-black uppercase tracking-tighter shadow-2xl shadow-primary/20"
                    >
                      {saving ? <><FaSpinner className="animate-spin mr-3" /> Optimizing...</> : 'Save & Publish Profile'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'interviews' && (
              <div className="glass-card p-20 text-center border border-white/5">
                <div className="w-20 h-20 rounded-full bg-purple-400/10 flex items-center justify-center mx-auto mb-6 text-purple-400">
                  <FaComments size={32} className="animate-pulse" />
                </div>
                <h2 className="text-xl font-bold text-text-primary mb-2 uppercase italic tracking-widest">Awaiting Calls</h2>
                <p className="text-text-muted text-sm max-w-md mx-auto">Interview invites will appear here once an employer selects your profile for the next stage.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
