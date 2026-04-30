'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaSave, FaTimes } from 'react-icons/fa';

export default function AdminTeamPage() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const empty = { name: '', role: '', image: '', bio: '', order: 0 };

  const fetchAll = async () => {
    setLoading(true);
    try { const res = await fetch('/api/team'); const data = await res.json(); setItems(data.members || []); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const save = async () => {
    setSaving(true); setMsg('');
    try {
      const method = editing._id ? 'PUT' : 'POST';
      const payload = { ...editing };
      if (editing._id) payload.id = editing._id;
      const res = await fetch('/api/team', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Save failed');
      setMsg('Saved!'); setEditing(null); fetchAll();
    } catch (err) { setMsg('Error: ' + err.message); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this member?')) return;
    try { await fetch(`/api/team?id=${id}`, { method: 'DELETE' }); fetchAll(); } catch {}
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Team Members</h1>
          <p className="text-text-secondary text-sm mt-1">Manage your team</p>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="btn-primary text-sm"><FaPlus size={12} /> Add Member</button>
      </div>

      {msg && <div className={`mb-4 p-3 rounded-lg text-sm ${msg.includes('Error') ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>{msg}</div>}

      {editing && (
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-text-primary">{editing._id ? 'Edit' : 'New'} Team Member</h2>
            <button onClick={() => setEditing(null)} className="text-text-muted hover:text-text-primary"><FaTimes size={18} /></button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-text-secondary text-sm mb-1 block">Name *</label>
                <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-text-secondary text-sm mb-1 block">Role *</label>
                <input value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary" />
              </div>
            </div>
            <div>
              <label className="text-text-secondary text-sm mb-1 block">Image URL</label>
              <input value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} placeholder="Upload from Media and paste URL" className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-text-secondary text-sm mb-1 block">Bio</label>
              <textarea value={editing.bio} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} rows={3} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary resize-y" />
            </div>
            <div>
              <label className="text-text-secondary text-sm mb-1 block">Order</label>
              <input type="number" value={editing.order} onChange={(e) => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })} className="w-32 px-4 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary" />
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
        <div className="glass-card p-12 text-center text-text-muted">No team members yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item._id} className="glass-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                  {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : item.name?.charAt(0)}
                </div>
                <div>
                  <div className="text-text-primary font-medium text-sm">{item.name}</div>
                  <div className="text-text-muted text-xs">{item.role}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing({ ...item })} className="p-2 rounded-lg bg-primary/10 text-primary-light hover:bg-primary/20"><FaEdit size={12} /></button>
                <button onClick={() => remove(item._id)} className="p-2 rounded-lg bg-danger/10 text-danger hover:bg-danger/20"><FaTrash size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
