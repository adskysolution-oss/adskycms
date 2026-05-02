'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaSave, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import IconByName from '@/components/IconByName';

export default function AdminServicesPage() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const empty = { name: '', description: '', features: '', icon: 'FaCode', order: 0, isActive: true };

  const [iconValid, setIconValid] = useState(false);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      if (!editing?.icon) {
        if (mounted) setIconValid(false);
        return;
      }
      try {
        const mod = await import('react-icons/fa');
        if (!mounted) return;
        setIconValid(Boolean(mod[editing.icon]));
      } catch (e) {
        if (!mounted) return;
        setIconValid(false);
      }
    };
    check();
    return () => { mounted = false; };
  }, [editing?.icon]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      setItems(data.services || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const save = async () => {
    setSaving(true); setMsg('');
    try {
      const payload = { ...editing, features: typeof editing.features === 'string' ? editing.features.split(',').map(s => s.trim()).filter(Boolean) : editing.features };
      const method = editing._id ? 'PUT' : 'POST';
      if (editing._id) payload.id = editing._id;
      const res = await fetch('/api/services', { method, credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Save failed');
      setMsg('Saved!'); setEditing(null); fetchAll();
    } catch (err) { setMsg('Error: ' + err.message); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this service?')) return;
    try { await fetch(`/api/services?id=${id}`, { method: 'DELETE', credentials: 'include' }); fetchAll(); } catch {}
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Services</h1>
          <p className="text-text-secondary text-sm mt-1">Manage your service offerings</p>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="btn-primary text-sm"><FaPlus size={12} /> Add Service</button>
      </div>

      {msg && <div className={`mb-4 p-3 rounded-lg text-sm ${msg.includes('Error') ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>{msg}</div>}

      {editing && (
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-text-primary">{editing._id ? 'Edit' : 'New'} Service</h2>
            <button onClick={() => setEditing(null)} className="text-text-muted hover:text-text-primary"><FaTimes size={18} /></button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-text-secondary text-sm mb-1 block">Name *</label>
                <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-text-secondary text-sm mb-1 block">Icon Name (e.g. FaCode)</label>
                <div className="flex items-center gap-3">
                  <input value={editing.icon} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} placeholder="FaCode" className="flex-1 px-4 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary" />
                  <div className="w-12 h-12 flex items-center justify-center rounded-md border border-border bg-surface">
                    <IconByName name={editing.icon} size={20} fallbackToDefault={false} />
                  </div>
                  <div className="text-sm">
                    {editing.icon ? (
                      iconValid ? <span className="text-success">Icon found</span> : <span className="text-danger">Icon not found</span>
                    ) : (
                      <span className="text-text-muted">Enter icon name</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="text-text-secondary text-sm mb-1 block">Description *</label>
              <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary resize-y" />
            </div>
            <div>
              <label className="text-text-secondary text-sm mb-1 block">Features (comma-separated)</label>
              <input value={Array.isArray(editing.features) ? editing.features.join(', ') : editing.features} onChange={(e) => setEditing({ ...editing, features: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-text-secondary text-sm mb-1 block">Order</label>
                <input type="number" value={editing.order} onChange={(e) => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary" />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-text-secondary text-sm cursor-pointer">
                  <input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} className="accent-primary" /> Active
                </label>
              </div>
            </div>
            <button onClick={save} disabled={saving} className="btn-primary text-sm">
              {saving ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaSave /> Save</>}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-text-muted"><FaSpinner className="animate-spin mx-auto" size={24} /></div>
      ) : items.length === 0 ? (
        <div className="glass-card p-12 text-center text-text-muted">No services yet. Click &quot;Add Service&quot; to create one.</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item._id} className="glass-card p-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-text-primary font-medium text-sm truncate">{item.name}</h3>
                  {item.isActive ? <FaEye className="text-success flex-shrink-0" size={12} /> : <FaEyeSlash className="text-text-muted flex-shrink-0" size={12} />}
                </div>
                <p className="text-text-muted text-xs mt-1 truncate">{item.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing({ ...item, features: item.features?.join(', ') || '' })} className="p-2 rounded-lg bg-primary/10 text-primary-light hover:bg-primary/20"><FaEdit size={12} /></button>
                <button onClick={() => remove(item._id)} className="p-2 rounded-lg bg-danger/10 text-danger hover:bg-danger/20"><FaTrash size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
