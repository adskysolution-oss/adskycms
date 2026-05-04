'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaCheck, FaTimes, FaBriefcase, FaTruck, FaGlobe, FaPhoneAlt, FaUsers, FaSearch } from 'react-icons/fa';

const IconOptions = [
  { name: 'FaBriefcase', icon: FaBriefcase },
  { name: 'FaTruck', icon: FaTruck },
  { name: 'FaGlobe', icon: FaGlobe },
  { name: 'FaPhoneAlt', icon: FaPhoneAlt },
  { name: 'FaUsers', icon: FaUsers },
  { name: 'FaSearch', icon: FaSearch },
];

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', icon: 'FaBriefcase', tag: 'Remote', description: '' });

  const fetchCategories = async () => {
    const res = await fetch('/api/categories?type=job');
    const data = await res.json();
    setCategories(data.categories || []);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingCategory ? 'PUT' : 'POST';
    const url = editingCategory ? `/api/categories/${editingCategory._id}` : '/api/categories';
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', icon: 'FaBriefcase', tag: 'Remote', description: '' });
    fetchCategories();
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure?')) {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      fetchCategories();
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Job Categories</h1>
          <p className="text-text-muted">Manage categories for job listings</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <FaPlus size={14} className="mr-2" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const IconComp = IconOptions.find(i => i.name === cat.icon)?.icon || FaBriefcase;
          return (
            <div key={cat._id} className="glass-card p-6 border border-white/5 group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary-light">
                  <IconComp size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-text-primary">{cat.name}</h3>
                  <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">{cat.tag}</span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingCategory(cat); setFormData(cat); setIsModalOpen(true); }} className="p-2 text-text-muted hover:text-primary-light">
                    <FaEdit size={14} />
                  </button>
                  <button onClick={() => handleDelete(cat._id)} className="p-2 text-text-muted hover:text-danger">
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
                {cat.description || 'No description provided.'}
              </p>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative glass-card p-8 w-full max-w-md border border-white/10 shadow-2xl">
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Name</label>
                <input 
                  type="text" 
                  required 
                  className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 text-text-primary"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Tag</label>
                  <select 
                    className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 text-text-primary"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  >
                    <option value="Remote">Remote</option>
                    <option value="Field Work">Field Work</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Icon</label>
                  <select 
                    className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 text-text-primary"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  >
                    {IconOptions.map(opt => (
                      <option key={opt.name} value={opt.name}>{opt.name.replace('Fa', '')}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Description</label>
                <textarea 
                  className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 text-text-primary h-24 resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 btn-secondary justify-center">Cancel</button>
                <button type="submit" className="flex-1 btn-primary justify-center">
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
