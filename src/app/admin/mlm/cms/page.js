'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { FileText, Plus, RefreshCw, Edit2, X } from 'lucide-react';
import AdminMlmShareSettingsCard from '@/components/features/admin/AdminMlmShareSettingsCard';
export default function AdminMlmCmsPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form, setForm] = useState({
        key: '',
        title: '',
        content: '',
        section: 'GENERAL',
    });
    const [saving, setSaving] = useState(false);
    const loadCms = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/mlm/cms');
            const json = await res.json();
            if (res.ok && json.success) {
                setItems(json.data || []);
            }
        }
        catch (e) {
            console.error('Failed to load MLM CMS:', e);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadCms();
    }, []);
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/admin/mlm/cms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const json = await res.json();
            if (!res.ok)
                throw new Error(json.message || 'Failed to save');
            alert('Content saved successfully!');
            setShowModal(false);
            setEditingItem(null);
            setForm({ key: '', title: '', content: '', section: 'GENERAL' });
            loadCms();
        }
        catch (err) {
            alert(err.message || 'Error saving content');
        }
        finally {
            setSaving(false);
        }
    };
    return (<DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <FileText className="w-5 h-5"/>
              </span>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                MLM Content &amp; CMS
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Manage MLM portal FAQs, rules, guidelines, and member notices.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={loadCms} disabled={loading} className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}/>
              <span>Refresh</span>
            </button>

            <button onClick={() => {
            setEditingItem(null);
            setForm({ key: '', title: '', content: '', section: 'GENERAL' });
            setShowModal(true);
        }} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition shadow-md shadow-amber-500/20">
              <Plus className="w-3.5 h-3.5"/>
              <span>Add Content Block</span>
            </button>
          </div>
        </div>

        {/* Dynamic WhatsApp Share & Poster Configuration */}
        <AdminMlmShareSettingsCard />

        {/* Content Table */}
        <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider text-[10px] border-b border-gray-200 font-bold">
                <tr>
                  <th className="p-4">Content Identifier (Key)</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Section</th>
                  <th className="p-4">Preview</th>
                  <th className="p-4">Last Updated</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.length === 0 ? (<tr>
                    <td colSpan={6} className="p-12 text-center text-gray-400">
                      No custom MLM CMS blocks configured.
                    </td>
                  </tr>) : (items.map((item) => (<tr key={item._id} className="hover:bg-gray-50/60 transition">
                      <td className="p-4 font-mono font-bold text-amber-700">{item.key}</td>
                      <td className="p-4 font-bold text-gray-900">{item.title}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px] font-bold">
                          {item.section || 'GENERAL'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 max-w-xs truncate">{item.content}</td>
                      <td className="p-4 text-gray-500">
                        {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => {
                setEditingItem(item);
                setForm({
                    key: item.key,
                    title: item.title,
                    content: item.content,
                    section: item.section || 'GENERAL',
                });
                setShowModal(true);
            }} className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[11px] transition inline-flex items-center gap-1">
                          <Edit2 className="w-3 h-3"/>
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>)))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-black text-gray-900 text-sm">
                  {editingItem ? 'Edit CMS Block' : 'Create CMS Block'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-1 text-gray-400">
                  <X className="w-5 h-5"/>
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Key (Identifier) *</label>
                  <input type="text" required readOnly={!!editingItem} value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} placeholder="e.g. FAQ_REWARD_RULE" className="w-full px-3 py-2 border rounded-xl font-mono"/>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Title *</label>
                  <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Display Title" className="w-full px-3 py-2 border rounded-xl"/>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Section</label>
                  <input type="text" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} placeholder="e.g. FAQ, TERMS, ANNOUNCEMENT" className="w-full px-3 py-2 border rounded-xl"/>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Content</label>
                  <textarea rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Body text or markdown content..." className="w-full px-3 py-2 border rounded-xl"/>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 rounded-xl font-bold">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="px-4 py-2 bg-amber-500 text-white rounded-xl font-bold shadow-sm">
                    {saving ? 'Saving...' : 'Save Content'}
                  </button>
                </div>
              </form>
            </div>
          </div>)}
      </div>
    </DashboardLayout>);
}
