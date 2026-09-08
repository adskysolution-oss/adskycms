'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Building2, Search, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

export default function AdminRecruitmentPartnersPage() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchPartners = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      ...(statusFilter && { status: statusFilter }),
      ...(search && { search })
    });
    try {
      const res = await fetch(`/api/recruitment/admin/partners?${params}`);
      const data = await res.json();
      if (data.success) {
        setPartners(data.partners || []);
      }
    } catch {
      toast.error('Failed to load partners.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [statusFilter, search]);

  const handlePartnerAction = async (partnerId, action) => {
    try {
      const res = await fetch('/api/recruitment/admin/partners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId, action })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Partner ${action.toLowerCase()} successfully!`);
        fetchPartners();
      } else {
        toast.error(data.message || 'Action failed.');
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
            <Building2 className="w-6 h-6 text-blue-400" />
            <span>Recruitment Partners</span>
          </h1>
          <p className="text-slate-400 text-sm">Verify agency credentials, activate/deactivate partners, and manage commission tiers.</p>
        </div>
      </div>

      <div className="flex gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by company name, contact person, or email..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING">Pending Verification</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : partners.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm border border-slate-800 rounded-2xl bg-slate-900/20">
          No partners found.
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900/40">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                <th className="p-4">Partner Code</th>
                <th className="p-4">Agency / Company</th>
                <th className="p-4">Contact Person</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p._id} className="border-b border-slate-900/60 hover:bg-slate-900/50 transition">
                  <td className="p-4 font-mono text-blue-400 font-bold">{p.partnerCode || 'N/A'}</td>
                  <td className="p-4">
                    <div className="font-semibold text-white">{p.companyName}</div>
                    <div className="text-xs text-slate-400">{p.city}, {p.state}</div>
                  </td>
                  <td className="p-4 text-slate-300 font-medium">{p.contactPerson}</td>
                  <td className="p-4 text-xs space-y-0.5">
                    <div className="text-slate-300">{p.email}</div>
                    <div className="text-slate-500">{p.phone}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      p.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      p.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {p.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handlePartnerAction(p._id, 'APPROVE')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handlePartnerAction(p._id, 'REJECT')}
                          className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 rounded-lg text-xs font-semibold"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {p.status === 'ACTIVE' && (
                      <button
                        onClick={() => handlePartnerAction(p._id, 'SUSPEND')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-xs"
                      >
                        Suspend
                      </button>
                    )}
                    {p.status === 'SUSPENDED' && (
                      <button
                        onClick={() => handlePartnerAction(p._id, 'APPROVE')}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
                      >
                        Reactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}