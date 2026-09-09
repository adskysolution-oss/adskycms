'use client';
import { useState, useEffect } from 'react';

const STATUS_COLORS = { 
  submitted: 'bg-slate-100 text-slate-700 border border-slate-200', 
  under_review: 'bg-blue-50 text-blue-700 border border-blue-200', 
  shortlisted: 'bg-cyan-50 text-cyan-700 border border-cyan-200', 
  selected: 'bg-emerald-50 text-emerald-700 border border-emerald-200', 
  rejected: 'bg-rose-50 text-rose-700 border border-rose-200', 
  joined: 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
};

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/recruitment/partner/candidates').then(r => r.json()).then(d => { if (d.success) setCandidates(d.candidates); }).finally(() => setLoading(false));
  }, []);
  return (
    <div className="ml-64 min-h-screen p-6 bg-slate-50/50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">👥 My Submitted Candidates</h1>
        {loading ? <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div></div> : candidates.length === 0 ? <p className="text-slate-500 text-center py-12">No candidates submitted yet.</p> : (
          <div className="space-y-3">
            {candidates.map(c => (
              <div key={c._id} className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{c.fullName}</div>
                  <div className="text-slate-500 text-sm">{c.mobile} {c.jobCode && '· ' + c.jobCode} · {new Date(c.submittedAt).toLocaleDateString()}</div>
                </div>
                <span className={"text-xs px-3 py-1.5 rounded-full font-medium " + (STATUS_COLORS[c.status] || 'text-slate-600 bg-slate-100 border border-slate-200')}>{c.status.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
