'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Briefcase, Plus, MapPin, DollarSign, Users, CheckCircle2 } from 'lucide-react';

export default function AdminRecruitmentJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    companyName: '',
    location: '',
    jobType: 'FULL_TIME',
    minExperience: 1,
    maxExperience: 5,
    minSalary: 300000,
    maxSalary: 800000,
    commissionAmount: 15000,
    openings: 1,
    description: '',
    skills: ''
  });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recruitment/admin/jobs');
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs || []);
      }
    } catch {
      toast.error('Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/recruitment/admin/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          skills: form.skills.split(',').map(s => s.trim()).filter(Boolean)
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Job opening posted successfully!');
        setModalOpen(false);
        setForm({
          title: '',
          companyName: '',
          location: '',
          jobType: 'FULL_TIME',
          minExperience: 1,
          maxExperience: 5,
          minSalary: 300000,
          maxSalary: 800000,
          commissionAmount: 15000,
          openings: 1,
          description: '',
          skills: ''
        });
        fetchJobs();
      } else {
        toast.error(data.message || 'Failed to post job');
      }
    } catch {
      toast.error('Network error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Briefcase className="w-6 h-6 text-emerald-400" />
            <span>Recruitment Job Postings</span>
          </h1>
          <p className="text-slate-400 text-sm">Create client openings for partner agencies to source and submit qualified candidates.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-semibold text-white transition flex items-center space-x-2 shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Job Opening</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm border border-slate-800 rounded-2xl bg-slate-900/20">
          No job openings posted yet. Click above to post a new job.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((j) => (
            <div key={j._id} className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4 hover:border-slate-700 transition">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs text-blue-400 font-bold">{j.jobCode}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {j.status || 'ACTIVE'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">{j.title}</h3>
                  <p className="text-xs text-slate-400">{j.companyName || 'Client Partner'}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-400">Partner Commission</span>
                  <p className="text-base font-black text-emerald-400">Rs {j.commissionAmount?.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{j.location || 'Remote'}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                  <span>Rs {(j.minSalary/100000).toFixed(1)}L - {(j.maxSalary/100000).toFixed(1)}L PA</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>{j.openings || 1} Openings</span>
                </div>
                <div>
                  <span>Exp: {j.minExperience}-{j.maxExperience} yrs</span>
                </div>
              </div>

              {j.skills && j.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {j.skills.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal for creating a job */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleCreateJob} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 my-8">
            <h3 className="font-bold text-white text-lg">Post New Recruitment Opening</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Full Stack Developer"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Company / Client Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TechCorp Solutions"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bangalore / Hybrid"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Min Experience (Yrs)</label>
                <input
                  type="number"
                  value={form.minExperience}
                  onChange={(e) => setForm({ ...form, minExperience: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Max Experience (Yrs)</label>
                <input
                  type="number"
                  value={form.maxExperience}
                  onChange={(e) => setForm({ ...form, maxExperience: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Min Annual CTC (Rs)</label>
                <input
                  type="number"
                  value={form.minSalary}
                  onChange={(e) => setForm({ ...form, minSalary: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Max Annual CTC (Rs)</label>
                <input
                  type="number"
                  value={form.maxSalary}
                  onChange={(e) => setForm({ ...form, maxSalary: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Partner Commission (Rs)</label>
                <input
                  type="number"
                  required
                  value={form.commissionAmount}
                  onChange={(e) => setForm({ ...form, commissionAmount: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Number of Openings</label>
                <input
                  type="number"
                  value={form.openings}
                  onChange={(e) => setForm({ ...form, openings: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Key Skills (comma-separated)</label>
                <input
                  type="text"
                  placeholder="React, Node.js, Next.js, MongoDB"
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Job Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Responsibilities, requirements, perks..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Publish Job'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}