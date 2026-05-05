'use client';

import { useState, useEffect } from 'react';
import { FaSave, FaSpinner, FaGlobe, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaLink } from 'react-icons/fa';

export default function GeneralSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'AdSky Solution',
    siteEmail: 'info@adskysolution.com',
    sitePhone: '8076611842',
    address: 'AD Sky Solution, 126 Satyam Enclave Sahibabad, Ghaziabad UTTAR PRADESH 201003',

    facebook: '',
    instagram: '',
    linkedin: '',
    twitter: '',
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      // Implementation for saving settings to DB
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMsg('Settings saved successfully!');
    } catch (err) {
      setMsg('Error saving settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-4xl">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-text-primary">General Settings</h1>
        <p className="text-text-secondary text-sm mt-1">Manage your website's global information</p>
      </div>

      {msg && (
        <div className={`mb-8 p-4 rounded-xl text-sm ${msg.includes('Error') ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
          {msg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        <div className="glass-card p-8 border border-white/5">
          <h2 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
            <FaGlobe className="text-primary-light" /> Site Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Site Name</label>
              <input 
                value={settings.siteName} 
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:border-primary" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Site Email</label>
              <input 
                value={settings.siteEmail} 
                onChange={(e) => setSettings({ ...settings, siteEmail: e.target.value })}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:border-primary" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Phone Number</label>
              <input 
                value={settings.sitePhone} 
                onChange={(e) => setSettings({ ...settings, sitePhone: e.target.value })}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:border-primary" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Physical Address</label>
              <input 
                value={settings.address} 
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:border-primary" 
              />
            </div>
          </div>
        </div>

        <div className="glass-card p-8 border border-white/5">
          <h2 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
            <FaLink className="text-secondary-light" /> Social Media Links
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Facebook URL</label>
              <input 
                value={settings.facebook} 
                onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:border-primary" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Instagram URL</label>
              <input 
                value={settings.instagram} 
                onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:border-primary" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">LinkedIn URL</label>
              <input 
                value={settings.linkedin} 
                onChange={(e) => setSettings({ ...settings, linkedin: e.target.value })}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:border-primary" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Twitter URL</label>
              <input 
                value={settings.twitter} 
                onChange={(e) => setSettings({ ...settings, twitter: e.target.value })}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:border-primary" 
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="btn-primary !px-12 !py-4 shadow-xl shadow-primary/20">
            {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />} Save All Changes
          </button>
        </div>
      </form>
    </div>
  );
}
