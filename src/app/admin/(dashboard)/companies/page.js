'use client';

import { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaSpinner, FaEye, FaExternalLinkAlt, FaBuilding, FaMapMarkerAlt, FaGlobe } from 'react-icons/fa';

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/companies');
      const data = await res.json();
      setCompanies(data.companies || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/admin/companies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchCompanies();
    } catch {}
  };

  const filtered = filter === 'all' ? companies : companies.filter(c => c.status === filter);

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Company Verifications</h1>
          <p className="text-text-secondary text-sm mt-1">Review and approve employer registrations</p>
        </div>
        
        <div className="flex items-center gap-3 bg-dark-light p-1.5 rounded-xl border border-white/5">
          {['all', 'pending', 'approved', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                filter === s ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><FaSpinner className="animate-spin text-primary" size={32} /></div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center text-text-muted">No company profiles found.</div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filtered.map((company) => (
            <div key={company._id} className="glass-card p-6 border border-white/5 flex flex-col justify-between">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                  {company.logo ? (
                    <img src={company.logo} alt={company.companyName} className="w-full h-full object-contain p-2" />
                  ) : (
                    <FaBuilding size={24} className="text-text-muted" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-text-primary text-lg">{company.companyName}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                      company.status === 'pending' ? 'bg-yellow-400/10 text-yellow-400' :
                      company.status === 'approved' ? 'bg-green-400/10 text-green-400' :
                      'bg-danger/10 text-danger'
                    }`}>
                      {company.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-text-muted">
                    <span className="flex items-center gap-1"><FaMapMarkerAlt size={10} /> {company.location}</span>
                    {company.website && (
                      <a href={company.website} target="_blank" className="flex items-center gap-1 hover:text-primary-light transition-colors">
                        <FaGlobe size={10} /> {new URL(company.website).hostname}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-text-secondary line-clamp-3 leading-relaxed">
                  {company.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div className="text-xs text-text-muted italic">
                  Owner: <span className="text-text-secondary font-medium">{company.user?.name}</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => updateStatus(company._id, 'approved')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-400/10 text-green-400 hover:bg-green-400/20 text-xs font-bold transition-all"
                  >
                    <FaCheck size={10} /> Approve
                  </button>
                  <button 
                    onClick={() => updateStatus(company._id, 'rejected')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-danger/10 text-danger hover:bg-danger/20 text-xs font-bold transition-all"
                  >
                    <FaTimes size={10} /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
