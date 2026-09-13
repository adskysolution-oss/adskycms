'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Image as ImageIcon,
  Video,
  FileText,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  Download,
  Share2,
  Copy,
  Sparkles,
  CheckCircle2,
  Clock,
  Archive,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout.js';

export default function AdminMlmGalleryPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    archived: 0,
    images: 0,
    videos: 0,
    documents: 0,
    totalDownloads: 0,
    totalShares: 0,
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [contentType, setContentType] = useState('ALL');
  const [sort, setSort] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);

  // Actions state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (status && status !== 'ALL') params.set('status', status);
      if (category && category !== 'ALL') params.set('category', category);
      if (contentType && contentType !== 'ALL') params.set('contentType', contentType);
      if (sort) params.set('sort', sort);
      params.set('page', currentPage.toString());
      params.set('limit', '20');

      const res = await fetch(`/api/admin/mlm/gallery?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setItems(data.items || []);
        if (data.stats) setStats(data.stats);
        if (data.pagination) setPagination(data.pagination);
      } else {
        toast.error(data.message || 'Failed to load marketing content.');
      }
    } catch (err) {
      console.error('[Admin Gallery Error]', err);
      toast.error('Network error loading marketing content.');
    } finally {
      setLoading(false);
    }
  }, [search, status, category, contentType, sort, currentPage]);

  useEffect(() => {
    (async () => {
      await loadData();
    })();
  }, [loadData]);

  // Toggle Publish / Unpublish
  const handleToggleStatus = async (item) => {
    const nextStatus = item.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      const res = await fetch(`/api/admin/mlm/gallery/${item._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Content ${nextStatus === 'PUBLISHED' ? 'Published' : 'set to Draft'}`);
        loadData();
      } else {
        toast.error(data.message || 'Failed to update status.');
      }
    } catch {
      toast.error('Network error updating status.');
    }
  };

  // Toggle Featured
  const handleToggleFeatured = async (item) => {
    try {
      const res = await fetch(`/api/admin/mlm/gallery/${item._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !item.featured }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(item.featured ? 'Removed from Featured' : 'Marked as Featured');
        loadData();
      }
    } catch {
      toast.error('Error updating featured status.');
    }
  };

  // Archive / Delete Content
  const confirmDelete = async (permanent = false) => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/mlm/gallery/${deleteTarget._id}?permanent=${permanent}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(permanent ? 'Content permanently deleted.' : 'Content archived.');
        setDeleteTarget(null);
        loadData();
      } else {
        toast.error(data.message || 'Failed to delete content.');
      }
    } catch {
      toast.error('Network error deleting content.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <ImageIcon className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Marketing Library &amp; Gallery
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Upload, manage, and monitor promotional creatives, posters, videos, and multi-channel marketing campaigns.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <Link
              href="/admin/mlm/gallery/new"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl transition shadow-md shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Upload New Creative</span>
            </Link>
          </div>
        </div>

        {/* ── KPI STATISTICS CARDS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Items</span>
            <p className="text-xl font-black text-slate-900">{stats.total}</p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Published</span>
            <p className="text-xl font-black text-emerald-600">{stats.published}</p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Drafts</span>
            <p className="text-xl font-black text-amber-600">{stats.draft}</p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Archived</span>
            <p className="text-xl font-black text-slate-500">{stats.archived}</p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Images</span>
            <p className="text-xl font-black text-blue-600">{stats.images}</p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">Videos</span>
            <p className="text-xl font-black text-purple-600">{stats.videos}</p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block">Downloads</span>
            <p className="text-xl font-black text-orange-600">{stats.totalDownloads}</p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Shares</span>
            <p className="text-xl font-black text-indigo-600">{stats.totalShares}</p>
          </div>
        </div>

        {/* ── FILTER & SEARCH BAR ── */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search content by title, tags, description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            {/* Status Dropdown */}
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            {/* Category Dropdown */}
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Posters">Posters</option>
              <option value="Images">Images</option>
              <option value="Videos">Videos</option>
              <option value="Documents">Documents</option>
              <option value="Banners">Banners</option>
              <option value="Social Media">Social Media</option>
              <option value="Announcements">Announcements</option>
              <option value="Other">Other</option>
            </select>

            {/* Content Type Dropdown */}
            <select
              value={contentType}
              onChange={(e) => {
                setContentType(e.target.value);
                setCurrentPage(1);
              }}
              className="py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 outline-none"
            >
              <option value="ALL">All Formats</option>
              <option value="POSTER">Poster</option>
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Video</option>
              <option value="DOCUMENT">Document</option>
              <option value="BANNER">Banner</option>
              <option value="CAPTION">Caption</option>
            </select>
          </div>
        </div>

        {/* ── CONTENT TABLE ── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Media</th>
                  <th className="py-3.5 px-4">Title &amp; Category</th>
                  <th className="py-3.5 px-4">Format</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Featured</th>
                  <th className="py-3.5 px-4 text-center">Analytics</th>
                  <th className="py-3.5 px-4">Uploaded</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading marketing items...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <ImageIcon className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                      <p className="font-bold text-slate-600">No marketing content found</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Click &quot;Upload New Creative&quot; to add items.</p>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const isPublished = item.status === 'PUBLISHED' || (item.isActive && !item.status);
                    return (
                      <tr key={item._id} className="hover:bg-slate-50/70 transition">
                        {/* Media Thumbnail */}
                        <td className="py-3 px-4">
                          <div
                            onClick={() => setPreviewItem(item)}
                            className="w-14 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden cursor-pointer flex items-center justify-center shrink-0 relative group"
                          >
                            {item.thumbnailUrl || item.fileUrl ? (
                              <img
                                src={item.thumbnailUrl || item.fileUrl}
                                alt=""
                                className="w-full h-full object-cover group-hover:scale-110 transition"
                              />
                            ) : (
                              <FileText size={18} className="text-slate-400" />
                            )}
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
                              <Eye size={13} />
                            </div>
                          </div>
                        </td>

                        {/* Title & Category */}
                        <td className="py-3 px-4 max-w-[240px]">
                          <p className="font-bold text-slate-900 truncate" title={item.title}>
                            {item.title}
                          </p>
                          <span className="text-[10px] font-semibold text-slate-400">
                            {item.category || 'General'}
                          </span>
                        </td>

                        {/* Format / Type */}
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                            {item.contentType || 'POSTER'}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleStatus(item)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider transition ${
                              isPublished
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : item.status === 'ARCHIVED'
                                ? 'bg-slate-100 text-slate-600 border border-slate-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                            }`}
                            title="Click to toggle publish status"
                          >
                            {isPublished ? 'Published' : item.status || 'Draft'}
                          </button>
                        </td>

                        {/* Featured Toggle */}
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleFeatured(item)}
                            className={`p-1.5 rounded-lg transition ${
                              item.featured
                                ? 'text-amber-500 hover:text-amber-600 bg-amber-50'
                                : 'text-slate-300 hover:text-slate-400'
                            }`}
                            title={item.featured ? 'Featured item' : 'Mark as featured'}
                          >
                            <Sparkles size={16} className={item.featured ? 'fill-amber-500' : ''} />
                          </button>
                        </td>

                        {/* Analytics */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-3 text-[11px] text-slate-600 font-medium">
                            <span title="Downloads" className="flex items-center gap-1">
                              <Download size={11} className="text-slate-400" />
                              {item.downloadCount || 0}
                            </span>
                            <span title="Shares" className="flex items-center gap-1">
                              <Share2 size={11} className="text-slate-400" />
                              {item.shareCount || 0}
                            </span>
                          </div>
                        </td>

                        {/* Upload Date */}
                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setPreviewItem(item)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                              title="Preview"
                            >
                              <Eye size={14} />
                            </button>

                            <Link
                              href={`/admin/mlm/gallery/${item._id}/edit`}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                              title="Edit item"
                            >
                              <Edit size={14} />
                            </Link>

                            <button
                              onClick={() => setDeleteTarget(item)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                              title="Archive / Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing Page {currentPage} of {pagination.totalPages} ({pagination.total} total)
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── DELETE / ARCHIVE CONFIRMATION MODAL ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Manage Content Status</h3>
                <p className="text-xs text-slate-500">&ldquo;{deleteTarget.title}&rdquo;</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Choose whether to archive this item (hidden from members, preserves historical analytics) or permanently delete it.
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => confirmDelete(false)}
                disabled={deleting}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Archive size={14} />
                <span>Archive Content (Recommended)</span>
              </button>

              <button
                onClick={() => confirmDelete(true)}
                disabled={deleting}
                className="w-full py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Trash2 size={14} />
                <span>Permanently Delete</span>
              </button>

              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="w-full py-2 px-4 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── QUICK PREVIEW MODAL ── */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  {previewItem.category || 'General'}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">{previewItem.title}</h3>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="aspect-16/9 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center">
              {previewItem.contentType === 'VIDEO' && previewItem.fileUrl ? (
                <video src={previewItem.fileUrl} controls className="max-h-full max-w-full" />
              ) : previewItem.fileUrl || previewItem.thumbnailUrl ? (
                <img src={previewItem.fileUrl || previewItem.thumbnailUrl} alt="" className="max-h-full object-contain" />
              ) : (
                <p className="text-xs text-slate-400">No media preview available</p>
              )}
            </div>

            {previewItem.caption && (
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Marketing Caption:
                </span>
                <div className="p-3 bg-slate-50 rounded-xl text-xs font-mono text-slate-800 whitespace-pre-wrap">
                  {previewItem.caption}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
