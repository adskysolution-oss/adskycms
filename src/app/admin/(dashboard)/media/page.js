'use client';

import { useState, useEffect, useRef } from 'react';
import { FaUpload, FaTrash, FaCopy, FaSpinner, FaCheck } from 'react-icons/fa';

export default function AdminMediaPage() {
  const [media, setMedia] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');
  const fileRef = useRef(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/upload?limit=50');
      const data = await res.json();
      setMedia(data.media || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchMedia(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'general');
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      fetchMedia();
    } catch (err) { alert(err.message); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const deleteMedia = async (id) => {
    if (!confirm('Delete this media?')) return;
    try {
      await fetch(`/api/upload?id=${id}`, { method: 'DELETE' });
      fetchMedia();
    } catch {}
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Media Library</h1>
          <p className="text-text-secondary text-sm mt-1">Upload and manage images</p>
        </div>
        <label className="btn-primary text-sm cursor-pointer">
          {uploading ? <><FaSpinner className="animate-spin" /> Uploading...</> : <><FaUpload size={12} /> Upload</>}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>

      {loading ? (
        <div className="text-center py-20"><FaSpinner className="animate-spin mx-auto text-text-muted" size={24} /></div>
      ) : media.length === 0 ? (
        <div className="glass-card p-16 text-center text-text-muted">No media uploaded yet. Click Upload to add images.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((item) => (
            <div key={item._id} className="glass-card overflow-hidden group">
              <div className="aspect-square relative bg-surface">
                <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-dark/70 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                  <button onClick={() => copyUrl(item.url)} className="p-2 rounded-lg bg-primary text-white hover:bg-primary-light">
                    {copied === item.url ? <FaCheck size={14} /> : <FaCopy size={14} />}
                  </button>
                  <button onClick={() => deleteMedia(item._id)} className="p-2 rounded-lg bg-danger text-white hover:bg-red-600">
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-text-primary text-xs truncate">{item.name}</p>
                <p className="text-text-muted text-xs">{item.format} · {item.width}×{item.height}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
