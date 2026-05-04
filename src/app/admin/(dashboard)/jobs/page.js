'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaSave, FaTimes, FaBriefcase, FaMapMarkerAlt, FaMoneyBillWave } from 'react-icons/fa';

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/user/me');
      const data = await res.json();
      setUser(data.user);
      return data.user;
    } catch { return null; }
  };

  const emptyJob = {
    title: '',
    description: '',
    requirements: '',
    category: '',
    location: '',
    salary: '',
    type: 'Full-time',
    experience: 'Entry Level',
    skills: '',
    isActive: true,
  };

  const fetchJobs = async (currentUser) => {
    setLoading(true);
    const u = currentUser || user;
    const isEmployer = u?.role === 'employer';
    try {
      const res = await fetch(`/api/jobs?limit=100${isEmployer ? '&my=true' : ''}`);
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch {} finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories?type=job');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {}
  };

  useEffect(() => {
    fetchUser().then(u => {
      fetchJobs(u);
      fetchCategories();
    });
  }, []);

  const saveJob = async () => {
    setSaving(true);
    setMsg('');
    try {
      const payload = { 
        ...editing, 
        requirements: typeof editing.requirements === 'string' ? editing.requirements.split('\n').filter(Boolean) : editing.requirements,
        skills: typeof editing.skills === 'string' ? editing.skills.split(',').map(s => s.trim()).filter(Boolean) : editing.skills
      };
      
      const method = editing._id ? 'PUT' : 'POST';
      const url = editing._id ? `/api/jobs/${editing._id}` : '/api/jobs';
      
      // Auto-set company for employers
      if (!editing._id) {
        if (user?.role === 'employer') {
          // Fetch company ID first
          const companyRes = await fetch('/api/companies');
          const companyData = await companyRes.json();
          if (companyData.company) {
            payload.company = companyData.company._id;
          } else {
            throw new Error('Company profile not found. Please complete onboarding.');
          }
        } else if (!payload.company) {
          payload.company = '6633768c8c8c8c8c8c8c8c8c'; // AdSky ID
        }
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) throw new Error('Save failed');
      setMsg('Job saved!');
      setEditing(null);
      fetchJobs();
    } catch (err) { setMsg('Error: ' + err.message); }
    finally { setSaving(false); }
  };

  const deleteJob = async (id) => {
    if (!confirm('Delete this job?')) return;
    try {
      await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      fetchJobs();
    } catch {}
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Jobs Management</h1>
          <p className="text-text-secondary text-sm mt-1">Create and manage job listings</p>
        </div>
        <button onClick={() => setEditing({ ...emptyJob })} className="btn-primary text-sm">
          <FaPlus size={12} /> New Job
        </button>
      </div>

      {msg && <div className={`mb-4 p-3 rounded-lg text-sm ${msg.includes('Error') ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>{msg}</div>}

      {editing && (
        <div className="glass-card p-6 mb-8 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-text-primary">{editing._id ? 'Edit' : 'New'} Job</h2>
            <button onClick={() => setEditing(null)} className="text-text-muted hover:text-text-primary"><FaTimes size={18} /></button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Job Title *</label>
              <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:border-primary" />
            </div>
            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Category *</label>
              <select value={editing.category?._id || editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:border-primary">
                <option value="">Select Category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Location *</label>
              <input value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:border-primary" />
            </div>
            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Salary *</label>
              <input value={editing.salary} onChange={(e) => setEditing({ ...editing, salary: e.target.value })} className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:border-primary" />
            </div>
            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Job Type</label>
              <select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })} className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:border-primary">
                {['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote', 'Field Work'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Experience Level</label>
              <input value={editing.experience} onChange={(e) => setEditing({ ...editing, experience: e.target.value })} className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:border-primary" />
            </div>
          </div>

          <div className="space-y-6 mb-6">
            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Description *</label>
              <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={5} className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:border-primary resize-y" />
            </div>
            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Requirements (one per line)</label>
              <textarea value={Array.isArray(editing.requirements) ? editing.requirements.join('\n') : editing.requirements} onChange={(e) => setEditing({ ...editing, requirements: e.target.value })} rows={4} className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:border-primary resize-y" />
            </div>
            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Skills (comma-separated)</label>
              <input value={Array.isArray(editing.skills) ? editing.skills.join(', ') : editing.skills} onChange={(e) => setEditing({ ...editing, skills: e.target.value })} className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:border-primary" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <label className="flex items-center gap-2 text-text-secondary text-sm cursor-pointer">
              <input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} className="accent-primary" /> Active Listing
            </label>
            <button onClick={saveJob} disabled={saving} className="btn-primary">
              {saving ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />} Save Job
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><FaSpinner className="animate-spin text-primary" size={32} /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {jobs.map((job) => (
            <div key={job._id} className="glass-card p-5 flex items-center justify-between group border border-white/5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-text-primary truncate">{job.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${job.isActive ? 'bg-green-400/10 text-green-400' : 'bg-danger/10 text-danger'}`}>
                    {job.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-text-muted font-medium">
                  <span className="flex items-center gap-1"><FaBriefcase size={10} /> {job.category?.name || 'Uncategorized'}</span>
                  <span className="flex items-center gap-1"><FaMapMarkerAlt size={10} /> {job.location}</span>
                  <span className="flex items-center gap-1"><FaMoneyBillWave size={10} /> {job.salary}</span>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button onClick={() => setEditing({ ...job })} className="p-2.5 rounded-xl bg-primary/10 text-primary-light hover:bg-primary/20 transition-all"><FaEdit size={14} /></button>
                <button onClick={() => deleteJob(job._id)} className="p-2.5 rounded-xl bg-danger/10 text-danger hover:bg-danger/20 transition-all"><FaTrash size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
