'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaBuilding, FaGlobe, FaMapMarkerAlt, FaFileUpload, FaSpinner, FaArrowRight } from 'react-icons/fa';

export default function CompanyOnboardingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: '',
    description: '',
    website: '',
    location: '',
    industry: '',
    logo: ''
  });
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let logoUrl = '';
      if (logoFile) {
        const logoData = new FormData();
        logoData.append('file', logoFile);
        logoData.append('folder', 'company_logos');
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: logoData });
        const uploadJson = await uploadRes.json();
        logoUrl = uploadJson.media.url;
      }

      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, logo: logoUrl }),
      });

      if (!res.ok) throw new Error('Failed to create company');
      
      router.push('/pending-approval');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="w-full max-w-3xl relative z-10">
        <div className="glass-card p-8 md:p-12 border border-slate-200/80 shadow-xl bg-white rounded-2xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Complete Your Company Profile</h1>
            <p className="text-slate-600">Tell us about your organization to get started with hiring.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Company Logo</label>
                <div className="relative group flex items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-slate-100 hover:border-primary transition-all cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={(e) => setLogoFile(e.target.files[0])}
                  />
                  {logoFile ? (
                    <div className="text-center">
                      <p className="text-primary font-bold">{logoFile.name}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <FaFileUpload size={32} className="mb-2" />
                      <span className="text-sm">Click to upload logo</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Company Name *</label>
                <div className="relative group">
                  <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input 
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-primary transition-all"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Website URL</label>
                <div className="relative group">
                  <FaGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input 
                    placeholder="https://company.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-primary transition-all"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Location *</label>
                <div className="relative group">
                  <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input 
                    required
                    placeholder="City, Country"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-primary transition-all"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Industry</label>
                <input 
                  placeholder="Tech, Finance, etc."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3.5 px-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-primary transition-all"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Company Description *</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3.5 px-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-primary transition-all resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full justify-center !py-4 text-lg shadow-xl shadow-primary/20"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <>Submit for Approval <FaArrowRight size={14} className="ml-2" /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
