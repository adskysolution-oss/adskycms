'use client';

import { useState, useEffect } from 'react';
import { 
  FaPlus, FaEdit, FaTrash, FaSpinner, FaSave, FaTimes, 
  FaBriefcase, FaMapMarkerAlt, FaMoneyBillWave, FaRocket, FaChevronLeft, FaKeyboard 
} from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EmployerJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [company, setCompany] = useState(null);
  const [manualCategory, setManualCategory] = useState('');
  const [isManual, setIsManual] = useState(false);

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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [compRes, catRes, jobsRes] = await Promise.all([
        fetch('/api/companies'),
        fetch('/api/categories?type=job'),
        fetch('/api/jobs?my=true&limit=100')
      ]);

      const compData = await compRes.json();
      const catData = await catRes.json();
      const jobsData = await jobsRes.json();

      if (!compData.company) {
        router.push('/onboarding/company');
        return;
      }
      if (compData.company.status !== 'approved') {
        router.push('/pending-approval');
        return;
      }

      setCompany(compData.company);
      setCategories(catData.categories || []);
      setJobs(jobsData.jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveJob = async () => {
    setSaving(true);
    setMsg('');
    try {
      const payload = { 
        ...editing, 
        requirements: typeof editing.requirements === 'string' ? editing.requirements.split('\n').filter(Boolean) : editing.requirements,
        skills: typeof editing.skills === 'string' ? editing.skills.split(',').map(s => s.trim()).filter(Boolean) : editing.skills,
        company: company._id
      };

      if (isManual && manualCategory) {
        payload.manualCategory = manualCategory;
      }
      
      const method = editing._id ? 'PUT' : 'POST';
      const url = editing._id ? `/api/jobs/${editing._id}` : '/api/jobs';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      
      setMsg('Job listing updated successfully!');
      setEditing(null);
      setManualCategory('');
      setIsManual(false);
      fetchData();
    } catch (err) { 
      setMsg('Error: ' + err.message); 
    } finally { 
      setSaving(false); 
    }
  };

  const deleteJob = async (id) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const startEditing = (job) => {
    setEditing(job);
    setIsManual(false);
    setManualCategory('');
  };

  if (loading && !company) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
      <FaSpinner className="animate-spin text-primary" size={40} />
      <p className="text-slate-500 font-bold tracking-tighter uppercase">Loading Jobs...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-12 px-4 md:px-8 text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-12">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/employer" className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all shadow-xs">
              <FaChevronLeft size={14} />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Manage Listings</h1>
              <p className="text-slate-500 text-sm uppercase tracking-widest font-bold">Active recruitment for {company?.companyName}</p>
            </div>
          </div>
          <button 
            onClick={() => startEditing({ ...emptyJob })}
            className="btn-primary !rounded-2xl !px-8 !py-4 shadow-xl shadow-primary/20 flex items-center gap-3"
          >
            <FaPlus size={14} /> Post New Job
          </button>
        </div>

        {msg && (
          <div className={`mb-8 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 animate-fade-in ${msg.includes('Error') ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-green-600/10 text-green-700 border border-green-600/20'}`}>
            <span className={`w-2 h-2 rounded-full ${msg.includes('Error') ? 'bg-danger' : 'bg-green-600'} animate-pulse`} />
            {msg}
          </div>
        )}

        {/* Editor Modal/Overlay */}
        {editing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="glass-card w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 bg-white border border-slate-200/80 shadow-2xl relative rounded-2xl">
              <button 
                onClick={() => setEditing(null)} 
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition-all p-2 rounded-full hover:bg-slate-100"
              >
                <FaTimes size={20} />
              </button>

              <h2 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tight">
                {editing._id ? 'Update' : 'Create'} Job Listing
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.2em] ml-1">Job Title</label>
                  <input 
                    placeholder="e.g. Senior Frontend Engineer"
                    value={editing.title} 
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })} 
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-5 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:outline-none transition-all" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.2em] ml-1">Category</label>
                  <div className="flex gap-2">
                    {!isManual ? (
                      <select 
                        value={editing.category?._id || editing.category} 
                        onChange={(e) => {
                          if (e.target.value === 'manual') {
                            setIsManual(true);
                            setEditing({ ...editing, category: '' });
                          } else {
                            setEditing({ ...editing, category: e.target.value });
                          }
                        }} 
                        className="flex-1 bg-slate-50 border border-slate-300 rounded-2xl px-5 py-3.5 text-sm text-slate-900 focus:bg-white focus:border-primary focus:outline-none transition-all"
                      >
                        <option value="" className="bg-white text-slate-900">Select Category</option>
                        {categories.map(c => <option key={c._id} value={c._id} className="bg-white text-slate-900">{c.name}</option>)}
                        <option value="manual" className="bg-white text-primary font-bold">+ Enter Manually</option>
                      </select>
                    ) : (
                      <div className="flex-1 relative">
                        <FaKeyboard className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={14} />
                        <input 
                          autoFocus
                          placeholder="Type category name..."
                          value={manualCategory} 
                          onChange={(e) => setManualCategory(e.target.value)} 
                          className="w-full bg-slate-50 border border-primary/50 rounded-2xl px-12 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:outline-none transition-all" 
                        />
                        <button 
                          onClick={() => setIsManual(false)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                        >
                          <FaTimes size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.2em] ml-1">Location</label>
                  <input 
                    placeholder="e.g. Bangalore, Remote"
                    value={editing.location} 
                    onChange={(e) => setEditing({ ...editing, location: e.target.value })} 
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-5 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:outline-none transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.2em] ml-1">Salary Range</label>
                  <input 
                    placeholder="e.g. ₹15L - ₹25L PA"
                    value={editing.salary} 
                    onChange={(e) => setEditing({ ...editing, salary: e.target.value })} 
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-5 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:outline-none transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.2em] ml-1">Job Type</label>
                  <select 
                    value={editing.type} 
                    onChange={(e) => setEditing({ ...editing, type: e.target.value })} 
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-5 py-3.5 text-sm text-slate-900 focus:bg-white focus:border-primary focus:outline-none transition-all"
                  >
                    {['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote', 'Field Work'].map(t => <option key={t} value={t} className="bg-white text-slate-900">{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.2em] ml-1">Experience Level</label>
                  <input 
                    placeholder="e.g. 3-5 Years"
                    value={editing.experience} 
                    onChange={(e) => setEditing({ ...editing, experience: e.target.value })} 
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-5 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:outline-none transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-6 mb-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.2em] ml-1">Job Description</label>
                  <textarea 
                    placeholder="Describe the role and responsibilities..."
                    value={editing.description} 
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })} 
                    rows={6} 
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-5 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:outline-none transition-all resize-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.2em] ml-1">Requirements (one per line)</label>
                  <textarea 
                    placeholder="Bachelor's degree in CS&#10;Proficiency in React.js&#10;Excellent communication"
                    value={Array.isArray(editing.requirements) ? editing.requirements.join('\n') : editing.requirements} 
                    onChange={(e) => setEditing({ ...editing, requirements: e.target.value })} 
                    rows={4} 
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-5 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:outline-none transition-all resize-none" 
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                <label className="flex items-center gap-3 text-slate-600 text-xs font-bold uppercase tracking-widest cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={editing.isActive} 
                    onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} 
                    className="w-4 h-4 rounded border-slate-300 bg-slate-50 checked:bg-primary transition-all cursor-pointer" 
                  /> 
                  <span className="group-hover:text-slate-900 transition-colors">Active Listing</span>
                </label>
                <div className="flex gap-4">
                  <button onClick={() => setEditing(null)} className="px-6 py-3.5 rounded-2xl text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all">Cancel</button>
                  <button 
                    onClick={saveJob} 
                    disabled={saving} 
                    className="btn-primary !rounded-2xl !px-10 !py-3.5 shadow-xl shadow-primary/20"
                  >
                    {saving ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />} 
                    {editing._id ? 'Update Listing' : 'Publish Job'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="glass-card p-20 text-center border border-slate-200 bg-white shadow-xs rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6 text-slate-500">
              <FaBriefcase size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No jobs posted yet</h3>
            <p className="text-slate-500 max-w-xs mx-auto mb-8 text-sm">Start building your team by creating your first job listing.</p>
            <button 
              onClick={() => startEditing({ ...emptyJob })}
              className="btn-primary !rounded-xl !px-8 !py-3"
            >
              Post First Job
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {jobs.map((job) => (
              <div key={job._id} className="glass-card p-6 border border-slate-200/80 flex flex-col md:flex-row items-center justify-between group hover:border-primary/40 transition-all bg-white shadow-xs rounded-2xl">
                <div className="flex-1 min-w-0 w-full md:w-auto">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-slate-900 text-lg truncate group-hover:text-primary transition-colors">{job.title}</h3>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${job.isActive ? 'border-green-600/20 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                      {job.isActive ? 'Live' : 'Draft'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-2"><FaBriefcase className="text-primary/70" size={10} /> {job.category?.name || 'Uncategorized'}</span>
                    <span className="flex items-center gap-2"><FaMapMarkerAlt className="text-primary/70" size={10} /> {job.location}</span>
                    <span className="flex items-center gap-2"><FaMoneyBillWave className="text-primary/70" size={10} /> {job.salary}</span>
                    <span className="flex items-center gap-2"><FaRocket className="text-primary/70" size={10} /> {job.type}</span>
                  </div>
                </div>
                <div className="flex gap-3 mt-6 md:mt-0 w-full md:w-auto">
                  <button 
                    onClick={() => startEditing({ ...job })} 
                    className="flex-1 md:flex-none p-3.5 rounded-2xl bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition-all border border-slate-200 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest"
                  >
                    <FaEdit size={12} /> Edit
                  </button>
                  <button 
                    onClick={() => deleteJob(job._id)} 
                    className="flex-1 md:flex-none p-3.5 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 transition-all border border-red-200 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
