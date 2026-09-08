'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { UserCheck, Search, Filter, ExternalLink, Calendar } from 'lucide-react';

export default function AdminRecruitmentCandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [joiningDate, setJoiningDate] = useState('');

  const fetchCandidates = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      ...(statusFilter && { status: statusFilter })
    });
    try {
      const res = await fetch(`/api/recruitment/admin/candidates?${params}`);
      const data = await res.json();
      if (data.success) {
        setCandidates(data.candidates || []);
      }
    } catch {
      toast.error('Failed to load candidates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [statusFilter]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedCandidate || !newStatus) return;
    try {
      const res = await fetch('/api/recruitment/admin/candidates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: selectedCandidate._id,
          status: newStatus,
          adminNotes,
          ...(joiningDate ? { joiningDate } : {})
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Candidate status updated successfully!');
        setModalOpen(false);
        fetchCandidates();
      } else {
        toast.error(data.message || 'Update failed.');
      }
    } catch {
      toast.error('Network error occurred.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <UserCheck className="w-6 h-6 text-purple-400" />
            <span>Recruitment Candidate Pipeline</span>
          </h1>
          <p className="text-slate-400 text-sm">Review candidate resumes, schedule interviews, mark selections, and trigger partner payouts.</p>
        </div>
      </div>

      <div className="flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">All Candidate Stages</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="SHORTLISTED">Shortlisted</option>
          <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
          <option value="SELECTED">Selected / Offered</option>
          <option value="PLACED">Joined / Placed</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : candidates.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm border border-slate-800 rounded-2xl bg-slate-900/20">
          No candidates found in this stage.
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900/40">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                <th className="p-4">Candidate</th>
                <th className="p-4">Role / Experience</th>
                <th className="p-4">Partner Agency</th>
                <th className="p-4">Current Status</th>
                <th className="p-4">Submitted Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={c._id} className="border-b border-slate-900/60 hover:bg-slate-900/50 transition">
                  <td className="p-4">
                    <div className="font-bold text-white">{c.fullName}</div>
                    <div className="text-xs text-slate-400">{c.email} | {c.phone}</div>
                    {c.resumeUrl && (
                      <a href={c.resumeUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline flex items-center space-x-1 mt-1">
                        <span>View Resume</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </td>
                  <td className="p-4 text-xs">
                    <div className="font-semibold text-white">{c.currentRole || 'Not specified'}</div>
                    <div className="text-slate-400">{c.totalExperienceYears ? `${c.totalExperienceYears} yrs experience` : '-'}</div>
                    <div className="text-slate-400">Notice: {c.noticePeriodDays ? `${c.noticePeriodDays} days` : 'Immediate'}</div>
                  </td>
                  <td className="p-4 text-xs">
                    <div className="font-semibold text-slate-300">{c.partnerId?.companyName || 'Direct'}</div>
                    <div className="text-slate-500 font-mono">{c.partnerId?.partnerCode}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      c.status === 'PLACED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      c.status === 'SELECTED' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      c.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-slate-400">
                    {c.submittedAt ? new Date(c.submittedAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedCandidate(c);
                        setNewStatus(c.status);
                        setAdminNotes(c.adminNotes || '');
                        setModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
                    >
                      Update Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for updating status */}
      {modalOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleUpdateStatus} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-white text-lg">Update Candidate Pipeline Stage</h3>
            <p className="text-xs text-slate-400">Candidate: <span className="text-white font-semibold">{selectedCandidate.fullName}</span></p>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Pipeline Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="SUBMITTED">Submitted</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                <option value="SELECTED">Selected / Offered</option>
                <option value="PLACED">Joined / Placed (Triggers Commission)</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {newStatus === 'PLACED' && (
              <div>
                <label className="block text-xs text-slate-400 mb-1">Official Joining Date</label>
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs text-slate-400 mb-1">Admin Notes / Feedback</label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. Cleared round 2 interview, salary offered Rs 8 LPA"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
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
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}