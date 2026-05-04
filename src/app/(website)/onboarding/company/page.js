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
    <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,1)_0%,rgba(0,0,0,1)_100%)]" />
      <div className="glow-dot bg-primary top-1/4 left-1/4 opacity-20" />
      
      <div className="w-full max-w-3xl relative z-10">
        <div className="glass-card p-8 md:p-12 border border-white/10 shadow-2xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-text-primary mb-4">Complete Your Company Profile</h1>
            <p className="text-text-secondary">Tell us about your organization to get started with hiring.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Company Logo</label>
                <div className="relative group flex items-center justify-center p-8 border-2 border-dashed border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-all cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={(e) => setLogoFile(e.target.files[0])}
                  />
                  {logoFile ? (
                    <div className="text-center">
                      <p className="text-primary-light font-bold">{logoFile.name}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-text-muted">
                      <FaFileUpload size={32} className="mb-2" />
                      <span className="text-sm">Click to upload logo</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Company Name *</label>
                <div className="relative group">
                  <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                  <input 
                    required
                    className="w-full bg-dark border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-text-primary focus:outline-none focus:border-primary/50 transition-all"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Website URL</label>
                <div className="relative group">
                  <FaGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                  <input 
                    placeholder="https://company.com"
                    className="w-full bg-dark border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-text-primary focus:outline-none focus:border-primary/50 transition-all"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Location *</label>
                <div className="relative group">
                  <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                  <input 
                    required
                    placeholder="City, Country"
                    className="w-full bg-dark border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-text-primary focus:outline-none focus:border-primary/50 transition-all"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Industry</label>
                <input 
                  placeholder="Tech, Finance, etc."
                  className="w-full bg-dark border border-white/10 rounded-xl py-3.5 px-4 text-text-primary focus:outline-none focus:border-primary/50 transition-all"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Company Description *</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full bg-dark border border-white/10 rounded-xl py-3.5 px-4 text-text-primary focus:outline-none focus:border-primary/50 transition-all resize-none"
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
