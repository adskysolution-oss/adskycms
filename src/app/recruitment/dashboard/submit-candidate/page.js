'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function SubmitCandidatePage() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    fetch('/api/recruitment/partner/jobs').then(r => r.json()).then(d => { if (d.success) setJobs(d.jobs); });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const formData = new FormData(e.target);
      const res = await fetch('/api/recruitment/partner/candidates', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) { toast.success('Candidate submitted successfully!'); router.push('/recruitment/dashboard/candidates'); }
      else toast.error(data.message);
    } catch { toast.error('Submission failed.'); }
    setSubmitting(false);
  };

  return (
    <div className="ml-64 min-h-screen p-6 bg-slate-50/50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">➕ Submit a Candidate</h1>
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 space-y-4">
          <div>
            <label className="block text-sm text-slate-700 font-medium mb-1">Job Position</label>
            <select name="jobId" className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 text-sm focus:border-purple-600 focus:bg-white focus:outline-none">
              <option value="">-- Select a Job (Optional) --</option>
              {jobs.map(j => <option key={j._id} value={j._id}>{j.title} ({j.location || 'Any'})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm text-slate-700 font-medium mb-1">Full Name *</label><input name="fullName" required className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 text-sm focus:border-purple-600 focus:bg-white focus:outline-none" /></div>
            <div><label className="block text-sm text-slate-700 font-medium mb-1">Mobile *</label><input name="mobile" required maxLength={10} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 text-sm focus:border-purple-600 focus:bg-white focus:outline-none" /></div>
            <div><label className="block text-sm text-slate-700 font-medium mb-1">Email</label><input type="email" name="email" className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 text-sm focus:border-purple-600 focus:bg-white focus:outline-none" /></div>
            <div><label className="block text-sm text-slate-700 font-medium mb-1">Gender</label>
              <select name="gender" className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 text-sm focus:border-purple-600 focus:bg-white focus:outline-none">
                <option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
              </select>
            </div>
            <div><label className="block text-sm text-slate-700 font-medium mb-1">State</label><input name="state" className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 text-sm focus:border-purple-600 focus:bg-white focus:outline-none" /></div>
            <div><label className="block text-sm text-slate-700 font-medium mb-1">Qualification</label><input name="qualification" className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 text-sm focus:border-purple-600 focus:bg-white focus:outline-none" /></div>
            <div><label className="block text-sm text-slate-700 font-medium mb-1">Experience</label><input name="experience" className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 text-sm focus:border-purple-600 focus:bg-white focus:outline-none" placeholder="e.g. 2 years" /></div>
            <div><label className="block text-sm text-slate-700 font-medium mb-1">Expected Salary</label><input type="number" name="expectedSalary" className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 text-sm focus:border-purple-600 focus:bg-white focus:outline-none" placeholder="Monthly CTC" /></div>
          </div>
          <div><label className="block text-sm text-slate-700 font-medium mb-1">Resume / CV</label><input type="file" name="resume" accept=".pdf,.doc,.docx" className="w-full text-slate-600 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer" /></div>
          <button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold py-3 rounded-xl transition-all shadow-xs disabled:opacity-60">
            {submitting ? 'Submitting...' : 'Submit Candidate'}
          </button>
        </form>
      </div>
    </div>
  );
}
