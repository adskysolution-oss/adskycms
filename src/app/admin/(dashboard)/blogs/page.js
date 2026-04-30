'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaSave, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const emptyBlog = { title: '', excerpt: '', content: '', category: 'General', tags: '', coverImage: '', isPublished: false };

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/blogs?admin=true&limit=50');
      const data = await res.json();
      setBlogs(data.blogs || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchBlogs(); }, []);

  const saveBlog = async () => {
    setSaving(true);
    setMsg('');
    try {
      const payload = { ...editing, tags: typeof editing.tags === 'string' ? editing.tags.split(',').map((t) => t.trim()).filter(Boolean) : editing.tags };
      const method = editing._id ? 'PUT' : 'POST';
      if (editing._id) payload.id = editing._id;

      const res = await fetch('/api/blogs', {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setMsg('Blog saved!');
      setEditing(null);
      fetchBlogs();
    } catch (err) { setMsg('Error: ' + err.message); }
    finally { setSaving(false); }
  };

  const deleteBlog = async (id) => {
    if (!confirm('Delete this blog post?')) return;
    try {
      await fetch(`/api/blogs?id=${id}`, { method: 'DELETE', credentials: 'include' });
      fetchBlogs();
    } catch {}
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Blogs</h1>
          <p className="text-text-secondary text-sm mt-1">Manage blog posts</p>
        </div>
        <button onClick={() => setEditing({ ...emptyBlog })} className="btn-primary text-sm"><FaPlus size={12} /> New Post</button>
      </div>

      {msg && <div className={`mb-4 p-3 rounded-lg text-sm ${msg.includes('Error') ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>{msg}</div>}

      {/* Editor */}
      {editing && (
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-text-primary">{editing._id ? 'Edit' : 'New'} Blog Post</h2>
            <button onClick={() => setEditing(null)} className="text-text-muted hover:text-text-primary"><FaTimes size={18} /></button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-text-secondary text-sm mb-1 block">Title *</label>
              <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-text-secondary text-sm mb-1 block">Category</label>
                <input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-text-secondary text-sm mb-1 block">Tags (comma-separated)</label>
                <input value={Array.isArray(editing.tags) ? editing.tags.join(', ') : editing.tags} onChange={(e) => setEditing({ ...editing, tags: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary" />
              </div>
            </div>

            <div>
              <label className="text-text-secondary text-sm mb-1 block">Cover Image URL</label>
              <input value={editing.coverImage} onChange={(e) => setEditing({ ...editing, coverImage: e.target.value })} placeholder="Upload from Media library and paste URL" className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary" />
            </div>

            <div>
              <label className="text-text-secondary text-sm mb-1 block">Excerpt</label>
              <textarea value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} rows={2} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary resize-y" />
            </div>

            <div>
              <label className="text-text-secondary text-sm mb-1 block">Content *</label>
              <textarea value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} rows={10} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary resize-y font-mono" />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-text-secondary text-sm cursor-pointer">
                <input type="checkbox" checked={editing.isPublished} onChange={(e) => setEditing({ ...editing, isPublished: e.target.checked })} className="accent-primary" />
                Publish
              </label>
              <button onClick={saveBlog} disabled={saving} className="btn-primary text-sm">
                {saving ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaSave /> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blog List */}
      {loading ? (
        <div className="text-center py-20 text-text-muted"><FaSpinner className="animate-spin mx-auto" size={24} /></div>
      ) : blogs.length === 0 ? (
        <div className="glass-card p-12 text-center text-text-muted">No blog posts yet.</div>
      ) : (
        <div className="space-y-3">
          {blogs.map((blog) => (
            <div key={blog._id} className="glass-card p-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-text-primary font-medium text-sm truncate">{blog.title}</h3>
                  {blog.isPublished ? <FaEye className="text-success flex-shrink-0" size={12} /> : <FaEyeSlash className="text-text-muted flex-shrink-0" size={12} />}
                </div>
                <div className="flex items-center gap-3 text-text-muted text-xs mt-1">
                  <span>{blog.category}</span>
                  <span>{blog.views} views</span>
                  <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing({ ...blog, tags: blog.tags?.join(', ') || '' })} className="p-2 rounded-lg bg-primary/10 text-primary-light hover:bg-primary/20"><FaEdit size={12} /></button>
                <button onClick={() => deleteBlog(blog._id)} className="p-2 rounded-lg bg-danger/10 text-danger hover:bg-danger/20"><FaTrash size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
