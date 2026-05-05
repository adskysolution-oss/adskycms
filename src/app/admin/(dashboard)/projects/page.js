'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaSave, FaTimes } from 'react-icons/fa';

export default function AdminProjectsPage() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const empty = { title: '', description: '', image: '', technologies: '', link: '', order: 0, isActive: true };

  const resetEditor = () => {
    setEditing(null);
    setImageFile(null);
    setImagePreview('');
  };

  const openNew = () => {
    setEditing({ ...empty });
    setImageFile(null);
    setImagePreview('');
  };

  const openEdit = (item) => {
    setEditing({ ...item, technologies: item.technologies?.join(', ') || '' });
    setImageFile(null);
    setImagePreview(item.image || '');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const fetchAll = async () => {
    setLoading(true);
    try { const res = await fetch('/api/projects'); const data = await res.json(); setItems(data.projects || []); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const save = async () => {
    setSaving(true); setMsg('');
    try {
      let image = editing.image || '';
      let imagePublicId = editing.imagePublicId || '';

      if (imageFile) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('folder', 'projects');

        const uploadRes = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');
        image = uploadData.media.url;
        imagePublicId = uploadData.media.publicId;
      }

      if (!image) throw new Error('Please choose a project image');

      const payload = { ...editing, technologies: typeof editing.technologies === 'string' ? editing.technologies.split(',').map(s => s.trim()).filter(Boolean) : editing.technologies };
      payload.image = image;
      payload.imagePublicId = imagePublicId;

      const method = editing._id ? 'PUT' : 'POST';
      if (editing._id) payload.id = editing._id;
      const res = await fetch('/api/projects', { method, credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Save failed');
      setMsg('Saved!'); resetEditor(); fetchAll();
    } catch (err) { setMsg('Error: ' + err.message); }
    finally { setSaving(false); setIsUploading(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this project?')) return;
    try { await fetch(`/api/projects?id=${id}`, { method: 'DELETE', credentials: 'include' }); fetchAll(); } catch {}
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Projects</h1>
          <p className="text-text-secondary text-sm mt-1">Manage your portfolio</p>
        </div>
        <button onClick={openNew} className="btn-primary text-sm"><FaPlus size={12} /> Add Project</button>
      </div>

      {msg && <div className={`mb-4 p-3 rounded-lg text-sm ${msg.includes('Error') ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>{msg}</div>}

      {editing && (
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-text-primary">{editing._id ? 'Edit' : 'New'} Project</h2>
            <button onClick={resetEditor} className="text-text-muted hover:text-text-primary"><FaTimes size={18} /></button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-text-secondary text-sm mb-1 block">Title *</label>
              <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-text-secondary text-sm mb-1 block">Description *</label>
              <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary resize-y" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-text-secondary text-sm mb-1 block">Image</label>
                <input type="file" accept="image/*" onChange={handleFileChange} className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text-primary file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-primary-dark" />
                {(imagePreview || editing.image) && (
                  <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-surface">
                    <img src={imagePreview || editing.image} alt="preview" className="h-40 w-full object-cover" />
                  </div>
                )}
              </div>
              <div>
                <label className="text-text-secondary text-sm mb-1 block">Link</label>
                <input value={editing.link} onChange={(e) => setEditing({ ...editing, link: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-text-secondary text-sm mb-1 block">Technologies (comma-separated)</label>
                <input value={Array.isArray(editing.technologies) ? editing.technologies.join(', ') : editing.technologies} onChange={(e) => setEditing({ ...editing, technologies: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-text-secondary text-sm mb-1 block">Order</label>
                <input type="number" value={editing.order} onChange={(e) => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="isActive" 
                checked={editing.isActive} 
                onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-border bg-surface text-primary focus:ring-primary" 
              />
              <label htmlFor="isActive" className="text-text-primary text-sm font-medium">Publicly Visible</label>
            </div>
            <button onClick={save} disabled={saving || isUploading} className="btn-primary text-sm">
              {saving || isUploading ? <><FaSpinner className="animate-spin" /> {isUploading ? 'Uploading...' : 'Saving...'}</> : <><FaSave /> Save</>}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-text-muted"><FaSpinner className="animate-spin mx-auto" size={24} /></div>
      ) : items.length === 0 ? (
        <div className="glass-card p-12 text-center text-text-muted">No projects yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item._id} className="glass-card p-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-text-primary font-medium text-sm truncate">{item.title}</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {item.technologies?.map((t, j) => <span key={j} className="text-xs text-text-muted bg-surface px-2 py-0.5 rounded">{t}</span>)}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${item.isActive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                  {item.isActive ? 'Active' : 'Inactive'}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(item)} className="p-2 rounded-lg bg-primary/10 text-primary-light hover:bg-primary/20"><FaEdit size={12} /></button>
                  <button onClick={() => remove(item._id)} className="p-2 rounded-lg bg-danger/10 text-danger hover:bg-danger/20"><FaTrash size={12} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
