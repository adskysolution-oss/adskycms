'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaSave, FaTimes, FaStar } from 'react-icons/fa';

export default function AdminPricingPage() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const empty = { name: '', price: '', currency: '₹', period: 'monthly', description: '', features: '', highlighted: false, order: 0, isActive: true };

  const fetchAll = async () => {
    setLoading(true);
    try { const res = await fetch('/api/pricing'); const data = await res.json(); setItems(data.plans || []); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const save = async () => {
    setSaving(true); setMsg('');
    try {
      const payload = { ...editing, price: Number(editing.price), features: typeof editing.features === 'string' ? editing.features.split(',').map(s => s.trim()).filter(Boolean) : editing.features };
      const method = editing._id ? 'PUT' : 'POST';
      if (editing._id) payload.id = editing._id;
      const res = await fetch('/api/pricing', { method, credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Save failed');
      setMsg('Saved!'); setEditing(null); fetchAll();
    } catch (err) { setMsg('Error: ' + err.message); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this plan?')) return;
    try { await fetch(`/api/pricing?id=${id}`, { method: 'DELETE', credentials: 'include' }); fetchAll(); } catch {}
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Pricing Plans</h1>
          <p className="text-text-secondary text-sm mt-1">Manage pricing tiers</p>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="btn-primary text-sm"><FaPlus size={12} /> Add Plan</button>
      </div>

      {msg && <div className={`mb-4 p-3 rounded-lg text-sm ${msg.includes('Error') ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>{msg}</div>}

      {editing && (
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-text-primary">{editing._id ? 'Edit' : 'New'} Plan</h2>
            <button onClick={() => setEditing(null)} className="text-text-muted hover:text-text-primary"><FaTimes size={18} /></button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-text-secondary text-sm mb-1 block">Plan Name *</label>
                <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-text-secondary text-sm mb-1 block">Price *</label>
                <input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-text-secondary text-sm mb-1 block">Currency</label>
                <input value={editing.currency} onChange={(e) => setEditing({ ...editing, currency: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary" />
              </div>
            </div>
            <div>
              <label className="text-text-secondary text-sm mb-1 block">Description</label>
              <input value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-text-secondary text-sm mb-1 block">Features (comma-separated)</label>
              <input value={Array.isArray(editing.features) ? editing.features.join(', ') : editing.features} onChange={(e) => setEditing({ ...editing, features: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-text-secondary text-sm mb-1 block">Period</label>
                <select value={editing.period} onChange={(e) => setEditing({ ...editing, period: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary">
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="text-text-secondary text-sm mb-1 block">Order</label>
                <input type="number" value={editing.order} onChange={(e) => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary" />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-text-secondary text-sm cursor-pointer">
                  <input type="checkbox" checked={editing.highlighted} onChange={(e) => setEditing({ ...editing, highlighted: e.target.checked })} className="accent-primary" /> Highlighted
                </label>
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
        <div className="glass-card p-12 text-center text-text-muted">No pricing plans yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item._id} className="glass-card p-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-text-primary font-medium text-sm">{item.name}</h3>
                  {item.highlighted && <FaStar className="text-accent" size={12} />}
                  <span className="text-xs text-text-muted">{item.currency}{item.price?.toLocaleString()}/{item.period}</span>
                </div>
                <p className="text-text-muted text-xs mt-1">{item.features?.length || 0} features</p>
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
