'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function AdminMlmShareConfigPage() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [posterFile, setPosterFile] = useState(null);
  const [message, setMessage] = useState('');
  const [posterTitle, setPosterTitle] = useState('');

  useEffect(() => {
    fetch('/api/admin/mlm/share-config').then(r => r.json()).then(d => {
      if (d.success && d.config) { setConfig(d.config); setMessage(d.config.messageTemplate || ''); setPosterTitle(d.config.posterTitle || ''); }
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const formData = new FormData();
      formData.append('messageTemplate', message);
      formData.append('posterTitle', posterTitle);
      if (posterFile) formData.append('poster', posterFile);
      const res = await fetch('/api/admin/mlm/share-config', { method: 'PUT', body: formData });
      const data = await res.json();
      if (data.success) { toast.success('Share config updated!'); setConfig(data.config); }
      else toast.error(data.message);
    } catch { toast.error('Save failed.'); }
    setSaving(false);
  };

  if (loading) return <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">📲 WhatsApp Share Configuration</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="font-semibold text-white mb-4">Current Poster</h2>
          {config?.posterUrl ? <img src={config.posterUrl} alt="Poster" className="w-full rounded-xl mb-4" /> : <div className="w-full h-48 bg-slate-900 rounded-xl flex items-center justify-center text-slate-500">No poster uploaded</div>}
          <p className="text-slate-400 text-sm">Poster is shared along with the WhatsApp referral message.</p>
        </div>
        <form onSubmit={handleSave} className="glass-card p-6 space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Upload New Poster (JPG/PNG)</label>
            <input type="file" accept="image/*" onChange={e => setPosterFile(e.target.files[0])} className="w-full text-slate-400 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Poster Title</label>
            <input value={posterTitle} onChange={e => setPosterTitle(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-2">Message Template</label>
            <p className="text-slate-500 text-xs mb-2">Variables: {'{{MEMBER_NAME}}'}, {'{{REFERRAL_CODE}}'}, {'{{REFERRAL_LINK}}'}</p>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={10} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Share Config'}
          </button>
        </form>
      </div>
    </div>
  );
}
