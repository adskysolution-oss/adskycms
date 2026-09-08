'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { Sparkles, Plus, RefreshCw, Video, FileText, X } from 'lucide-react';
export default function AdminMlmTrainingPage() {
    const [data, setData] = useState({
        trainings: [],
        materials: [],
    });
    const [activeTab, setActiveTab] = useState('TRAINING');
    const [loading, setLoading] = useState(true);
    // Form Modal
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        type: 'TRAINING',
        title: '',
        description: '',
        category: 'GENERAL',
        videoUrl: '',
        fileUrl: '',
        content: '',
    });
    const [saving, setSaving] = useState(false);
    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/mlm/training');
            const json = await res.json();
            if (res.ok && json.success) {
                setData(json.data);
            }
        }
        catch (e) {
            console.error('Failed to load MLM training:', e);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadData();
    }, []);
    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/admin/mlm/training', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const json = await res.json();
            if (!res.ok)
                throw new Error(json.message || 'Failed to save');
            alert('Asset created successfully!');
            setShowModal(false);
            setForm({
                type: activeTab,
                title: '',
                description: '',
                category: 'GENERAL',
                videoUrl: '',
                fileUrl: '',
                content: '',
            });
            loadData();
        }
        catch (err) {
            alert(err.message || 'Error saving asset');
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
                <Sparkles className="w-5 h-5"/>
              </span>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                MLM Training &amp; Marketing
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Manage member video tutorials, onboarding masterclasses, and downloadable marketing banners.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={loadData} disabled={loading} className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}/>
              <span>Refresh</span>
            </button>

            <button onClick={() => {
            setForm((prev) => ({ ...prev, type: activeTab }));
            setShowModal(true);
        }} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition shadow-md shadow-amber-500/20">
              <Plus className="w-3.5 h-3.5"/>
              <span>Add {activeTab === 'TRAINING' ? 'Training Module' : 'Marketing Asset'}</span>
            </button>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 border-b border-gray-200 text-xs font-bold">
          <button onClick={() => setActiveTab('TRAINING')} className={`px-4 py-2.5 rounded-xl transition ${activeTab === 'TRAINING'
            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            Training Modules ({data.trainings.length})
          </button>
          <button onClick={() => setActiveTab('MARKETING')} className={`px-4 py-2.5 rounded-xl transition ${activeTab === 'MARKETING'
            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            Marketing Collateral ({data.materials.length})
          </button>
        </div>

        {/* Content Section */}
        {activeTab === 'TRAINING' ? (<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.trainings.length === 0 ? (<div className="col-span-3 p-12 text-center text-gray-400 text-xs bg-white rounded-3xl border border-gray-200">
                No training modules created yet. Click "Add Training Module" to create one.
              </div>) : (data.trainings.map((t) => (<div key={t._id} className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                        {t.category || 'GENERAL'}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm">{t.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-3">{t.description}</p>
                  </div>

                  {t.videoUrl && (<a href={t.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition">
                      <Video className="w-3.5 h-3.5 text-red-500"/>
                      <span>Watch Training Video</span>
                    </a>)}
                </div>)))}
          </div>) : (<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.materials.length === 0 ? (<div className="col-span-3 p-12 text-center text-gray-400 text-xs bg-white rounded-3xl border border-gray-200">
                No marketing assets created yet. Click "Add Marketing Asset" to upload one.
              </div>) : (data.materials.map((m) => (<div key={m._id} className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-bold">
                      {m.type || 'BANNER'}
                    </span>
                    <h3 className="font-bold text-gray-900 text-sm">{m.title}</h3>
                    <p className="text-xs text-gray-500">{m.description}</p>
                  </div>

                  {m.fileUrl && (<a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition">
                      <FileText className="w-3.5 h-3.5 text-purple-600"/>
                      <span>Download Creative</span>
                    </a>)}
                </div>)))}
          </div>)}

        {/* Modal */}
        {showModal && (<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-black text-gray-900 text-sm">
                  Add {form.type === 'TRAINING' ? 'Training Video / Lesson' : 'Marketing Asset'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-1 text-gray-400">
                  <X className="w-5 h-5"/>
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Title *</label>
                  <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Enter descriptive title" className="w-full px-3 py-2 border rounded-xl"/>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Description</label>
                  <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description for members" className="w-full px-3 py-2 border rounded-xl"/>
                </div>

                {form.type === 'TRAINING' ? (<div>
                    <label className="block font-bold text-gray-700 mb-1">Video Embed / YouTube URL</label>
                    <input type="url" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://youtube.com/watch?v=..." className="w-full px-3 py-2 border rounded-xl"/>
                  </div>) : (<div>
                    <label className="block font-bold text-gray-700 mb-1">Asset Download URL</label>
                    <input type="url" value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 border rounded-xl"/>
                  </div>)}

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 rounded-xl font-bold">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="px-4 py-2 bg-amber-500 text-white rounded-xl font-bold shadow-sm">
                    {saving ? 'Creating...' : 'Create Asset'}
                  </button>
                </div>
              </form>
            </div>
          </div>)}
      </div>
    </DashboardLayout>);
}
