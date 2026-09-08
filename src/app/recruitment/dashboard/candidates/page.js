'use client';
import { useState, useEffect } from 'react';

const STATUS_COLORS = { submitted: 'bg-slate-700 text-slate-300', under_review: 'bg-blue-500/20 text-blue-400', shortlisted: 'bg-cyan-500/20 text-cyan-400', selected: 'bg-green-500/20 text-green-400', rejected: 'bg-red-500/20 text-red-400', joined: 'bg-emerald-500/20 text-emerald-400' };

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/recruitment/partner/candidates').then(r => r.json()).then(d => { if (d.success) setCandidates(d.candidates); }).finally(() => setLoading(false));
  }, []);
  return (
    <div className="ml-64 min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">👥 My Submitted Candidates</h1>
        {loading ? <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div></div> : candidates.length === 0 ? <p className="text-slate-400 text-center py-12">No candidates submitted yet.</p> : (
          <div className="space-y-3">
            {candidates.map(c => (
              <div key={c._id} className="glass-card p-5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">{c.fullName}</div>
                  <div className="text-slate-400 text-sm">{c.mobile} {c.jobCode && '· ' + c.jobCode} · {new Date(c.submittedAt).toLocaleDateString()}</div>
                </div>
                <span className={"text-xs px-3 py-1.5 rounded-full font-medium " + (STATUS_COLORS[c.status] || 'text-slate-400 bg-slate-800')}>{c.status.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
