'use client';

import { useState, useEffect } from 'react';
import { FaUser, FaTools, FaFileUpload, FaBriefcase, FaClock, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

export default function CandidateDashboard() {
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resumeFile, setResumeFile] = useState(null);
  const [skills, setSkills] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch('/api/auth/me');
        const userData = await userRes.json();
        setUser(userData.user);

        const appRes = await fetch(`/api/applications?candidateId=${userData.user._id}`);
        const appData = await appRes.json();
        setApplications(appData.applications || []);
        
        // Mock skills for now or fetch from profile if exists
        setSkills(userData.user.skills?.join(', ') || '');
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills: skills.split(',').map(s => s.trim()).filter(Boolean),
          resumeUrl
        }),
      });

      alert('Profile updated!');
    } catch (error) {
      alert('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center"><FaSpinner className="animate-spin inline mr-2" /> Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-dark pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Welcome, {user?.name}</h1>
          <p className="text-text-secondary">Track your applications and manage your professional profile.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card p-6 border border-white/5">
              <h2 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                <FaUser className="text-primary-light" /> Professional Profile
              </h2>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Skills (comma separated)</label>
                  <textarea 
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-sm text-text-primary focus:border-primary/50 h-32 resize-none"
                    placeholder="React, Next.js, Node.js..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Resume / CV</label>
                  <div className="relative group">
                    <input 
                      type="file" 
                      id="resume" 
                      className="hidden" 
                      onChange={(e) => setResumeFile(e.target.files[0])}
                    />
                    <label 
                      htmlFor="resume" 
                      className="flex items-center justify-center p-4 border-2 border-dashed border-white/10 rounded-xl bg-white/5 cursor-pointer group-hover:border-primary/50 transition-all"
                    >
                      <FaFileUpload className="mr-2 text-text-muted" />
                      <span className="text-sm text-text-secondary">{resumeFile ? resumeFile.name : 'Upload New Resume'}</span>
                    </label>
                  </div>
                  {user?.resumeUrl && !resumeFile && (
                    <a href={user.resumeUrl} target="_blank" className="text-[10px] text-primary-light mt-2 inline-block hover:underline">View Current Resume</a>
                  )}
                </div>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="btn-primary w-full justify-center"
                >
                  {saving ? <FaSpinner className="animate-spin" /> : 'Update Profile'}
                </button>
              </form>
            </div>
          </div>

          {/* Applications Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6 border border-white/5">
              <h2 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                <FaBriefcase className="text-secondary-light" /> Applied Jobs
              </h2>
              
              {applications.length === 0 ? (
                <div className="py-12 text-center text-text-muted">
                  <p>You haven&apos;t applied to any jobs yet.</p>
                  <a href="/careers" className="text-primary-light font-bold mt-4 inline-block hover:underline">Explore Careers</a>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div key={app._id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between hover:bg-white/10 transition-all">
                      <div>
                        <h3 className="font-bold text-text-primary">{app.job?.title}</h3>
                        <div className="flex items-center gap-4 mt-1 text-xs text-text-muted">
                          <span className="flex items-center gap-1"><FaClock size={10} /> {new Date(app.createdAt).toLocaleDateString()}</span>
                          <span>{app.job?.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          app.status === 'applied' ? 'bg-yellow-400/10 text-yellow-400' :
                          app.status === 'shortlisted' ? 'bg-green-400/10 text-green-400' :
                          'bg-danger/10 text-danger'
                        }`}>
                          {app.status === 'applied' ? <><FaClock className="inline mr-1" /> Applied</> :
                           app.status === 'shortlisted' ? <><FaCheckCircle className="inline mr-1" /> Shortlisted</> :
                           <><FaTimesCircle className="inline mr-1" /> Rejected</>}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
