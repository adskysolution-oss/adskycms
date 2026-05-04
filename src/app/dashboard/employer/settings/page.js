'use client';

import { useState, useEffect } from 'react';
import { FaBuilding, FaGlobe, FaMapMarkerAlt, FaSave, FaSpinner, FaRocket } from 'react-icons/fa';

export default function EmployerSettingsPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    description: '',
    website: '',
    location: '',
    industry: '',
    logo: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/companies')
      .then(r => r.json())
      .then(d => {
        if (d.company) setFormData(d.company);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/companies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) alert('Company profile updated successfully!');
    } catch {
      alert('Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center"><FaSpinner className="animate-spin text-primary" size={32} /></div>;

  return (
    <div className="min-h-screen bg-dark pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary-light border border-primary/20">
            <FaBuilding size={20} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-primary italic uppercase tracking-tighter">Company Profile</h1>
            <p className="text-text-secondary">Update your organization's public identity.</p>
          </div>
        </header>

        <form onSubmit={handleSave} className="space-y-8 animate-in fade-in duration-500">
          <div className="glass-card p-8 border border-white/5 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Company Name</label>
                <input 
                  required
                  className="w-full bg-dark border border-white/10 rounded-xl py-3.5 px-4 text-text-primary focus:border-primary/50 transition-all"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Website</label>
                <input 
                  className="w-full bg-dark border border-white/10 rounded-xl py-3.5 px-4 text-text-primary focus:border-primary/50 transition-all"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Location</label>
                <input 
                  className="w-full bg-dark border border-white/10 rounded-xl py-3.5 px-4 text-text-primary focus:border-primary/50 transition-all"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Industry</label>
                <input 
                  className="w-full bg-dark border border-white/10 rounded-xl py-3.5 px-4 text-text-primary focus:border-primary/50 transition-all"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Description</label>
                <textarea 
                  rows={5}
                  className="w-full bg-dark border border-white/10 rounded-xl py-3.5 px-4 text-text-primary focus:border-primary/50 transition-all resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary !px-12 !py-4 shadow-xl shadow-primary/20 flex items-center gap-2">
              {saving ? <FaSpinner className="animate-spin" /> : <FaSave />} Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
