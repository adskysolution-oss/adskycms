'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/recruitment/partner/jobs').then(r => r.json()).then(d => { if (d.success) setJobs(d.jobs); }).finally(() => setLoading(false));
  }, []);
  return (
    <div className="ml-64 min-h-screen p-6 bg-slate-50/50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">💼 Available Job Positions</h1>
        {loading ? <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div></div> : jobs.length === 0 ? <p className="text-slate-500 text-center py-12">No open positions right now.</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map(j => (
              <div key={j._id} className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-5 hover:border-purple-300 hover:shadow-md transition-all">
                <div className="font-semibold text-slate-900 mb-1">{j.title}</div>
                <div className="text-slate-500 text-sm">{j.company || 'N/A'} · {j.location || 'N/A'}</div>
                {j.salaryMin && <div className="text-emerald-600 font-semibold text-sm mt-2">₹{j.salaryMin?.toLocaleString()} - ₹{j.salaryMax?.toLocaleString()}</div>}
                <div className="flex gap-2 mt-3 flex-wrap">
                  <span className="text-xs bg-slate-100 text-slate-700 border border-slate-200/60 px-2 py-1 rounded font-medium">{j.jobType?.replace(/_/g,' ')}</span>
                  <span className="text-xs bg-slate-100 text-slate-700 border border-slate-200/60 px-2 py-1 rounded font-medium">{j.openings} openings</span>
                </div>
                <Link href={'/recruitment/dashboard/submit-candidate?jobId=' + j._id} className="mt-4 block w-full text-center bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold py-2 rounded-lg transition-colors shadow-xs">Submit Candidate</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
