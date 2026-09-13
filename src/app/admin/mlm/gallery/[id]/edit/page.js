'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  UploadCloud,
  Sparkles,
  Check,
  X,
  MessageCircle,
  Calendar,
  Layers,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout.js';

export default function AdminEditGalleryPage({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Posters');
  const [contentType, setContentType] = useState('POSTER');
  const [status, setStatus] = useState('PUBLISHED');
  const [featured, setFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState('0');
  const [publishFrom, setPublishFrom] = useState('');
  const [publishUntil, setPublishUntil] = useState('');
  const [tags, setTags] = useState('');

  // Media
  const [currentFileUrl, setCurrentFileUrl] = useState('');
  const [newFile, setNewFile] = useState(null);
  const [newFilePreview, setNewFilePreview] = useState(null);

  const [currentThumbnailUrl, setCurrentThumbnailUrl] = useState('');
  const [newThumbnail, setNewThumbnail] = useState(null);

  // Captions
  const [caption, setCaption] = useState('');
  const [shareText, setShareText] = useState('');
  const [whatsappCaption, setWhatsappCaption] = useState('');
  const [instagramCaption, setInstagramCaption] = useState('');
  const [facebookCaption, setFacebookCaption] = useState('');
  const [youtubeCaption, setYoutubeCaption] = useState('');
  const [ctaText, setCtaText] = useState('');

  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    async function loadItem() {
      try {
        const res = await fetch(`/api/admin/mlm/gallery/${id}`);
        const data = await res.json();
        if (res.ok && data.success && data.item) {
          const m = data.item;
          setTitle(m.title || '');
          setDescription(m.description || '');
          setCategory(m.category || 'Posters');
          setContentType(m.contentType || 'POSTER');
          setStatus(m.status || (m.isActive ? 'PUBLISHED' : 'DRAFT'));
          setFeatured(!!m.featured);
          setSortOrder((m.sortOrder ?? m.displayOrder ?? 0).toString());
          setCurrentFileUrl(m.fileUrl || m.url || '');
          setCurrentThumbnailUrl(m.thumbnailUrl || '');
          setCaption(m.caption || '');
          setShareText(m.shareText || '');

          if (m.tags?.length) {
            setTags(Array.isArray(m.tags) ? m.tags.join(', ') : m.tags);
          }

          if (m.publishFrom) {
            setPublishFrom(new Date(m.publishFrom).toISOString().slice(0, 16));
          }
          if (m.publishUntil) {
            setPublishUntil(new Date(m.publishUntil).toISOString().slice(0, 16));
          }

          if (m.captions) {
            setWhatsappCaption(m.captions.whatsapp || '');
            setInstagramCaption(m.captions.instagram || '');
            setFacebookCaption(m.captions.facebook || '');
            setYoutubeCaption(m.captions.youtube || '');
            setCtaText(m.captions.ctaText || '');
          }
        } else {
          toast.error(data.message || 'Content not found.');
          router.push('/admin/mlm/gallery');
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load item for editing.');
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [id, router]);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setNewFile(selected);
    if (selected.type.startsWith('image/') || selected.type.startsWith('video/')) {
      setNewFilePreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required.');
      return;
    }

    setSaving(true);
    const toastId = toast.loading('Updating creative...');

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('contentType', contentType);
      formData.append('status', status);
      formData.append('featured', featured ? 'true' : 'false');
      formData.append('sortOrder', sortOrder || '0');
      formData.append('publishFrom', publishFrom);
      formData.append('publishUntil', publishUntil);
      formData.append('tags', tags.trim());
      formData.append('caption', caption.trim());
      formData.append('shareText', shareText.trim());

      const captionsObj = {
        whatsapp: whatsappCaption.trim() || undefined,
        instagram: instagramCaption.trim() || undefined,
        facebook: facebookCaption.trim() || undefined,
        youtube: youtubeCaption.trim() || undefined,
        ctaText: ctaText.trim() || undefined,
      };
      formData.append('captions', JSON.stringify(captionsObj));

      if (newFile) formData.append('file', newFile);
      if (newThumbnail) formData.append('thumbnail', newThumbnail);

      const res = await fetch(`/api/admin/mlm/gallery/${id}`, {
        method: 'PATCH',
        body: formData,
      });

      const data = await res.json();
      toast.dismiss(toastId);

      if (res.ok && data.success) {
        toast.success('Creative updated successfully!');
        router.push('/admin/mlm/gallery');
      } else {
        toast.error(data.message || 'Failed to update creative.');
      }
    } catch (err) {
      console.error(err);
      toast.dismiss(toastId);
      toast.error('Network error updating creative.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-500">Loading creative details...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-16 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <Link
            href="/admin/mlm/gallery"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft size={16} />
            <span>Back to Marketing Library</span>
          </Link>
          <span className="text-xs text-slate-400 font-semibold">Edit Content #{id.slice(-6)}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Content Info */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles size={18} className="text-amber-500" />
              <span>Edit Basic Information</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Creative Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white outline-none"
                  >
                    <option value="Posters">Posters</option>
                    <option value="Images">Images</option>
                    <option value="Videos">Videos</option>
                    <option value="Documents">Documents / Guides</option>
                    <option value="Banners">Banners</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Announcements">Announcements</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Content Type</label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white outline-none"
                  >
                    <option value="POSTER">POSTER</option>
                    <option value="IMAGE">IMAGE</option>
                    <option value="VIDEO">VIDEO</option>
                    <option value="DOCUMENT">DOCUMENT</option>
                    <option value="BANNER">BANNER</option>
                    <option value="CAPTION">CAPTION</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tags</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Media Management */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <UploadCloud size={18} className="text-blue-500" />
              <span>Current &amp; Replacement Media</span>
            </h2>

            <div className="space-y-4">
              {/* Existing file display */}
              {currentFileUrl && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Active File</label>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3 truncate">
                      {currentThumbnailUrl || currentFileUrl ? (
                        <img src={currentThumbnailUrl || currentFileUrl} alt="" className="w-12 h-10 object-cover rounded-lg" />
                      ) : (
                        <FileText size={20} className="text-slate-400" />
                      )}
                      <a
                        href={currentFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline truncate"
                      >
                        {currentFileUrl}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Replace file */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Upload Replacement File (Optional)
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full text-slate-600 text-xs file:mr-4 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200 cursor-pointer"
                  accept="image/*,video/*,application/pdf"
                />
                {newFilePreview && (
                  <div className="mt-2 w-28 h-18 rounded-lg overflow-hidden border border-slate-200">
                    <img src={newFilePreview} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Captions */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <MessageCircle size={18} className="text-emerald-500" />
              <span>Marketing Captions</span>
            </h2>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: 'general', label: 'General' },
                { id: 'whatsapp', label: 'WhatsApp' },
                { id: 'instagram', label: 'Instagram' },
                { id: 'facebook', label: 'Facebook' },
                { id: 'youtube', label: 'YouTube' },
                { id: 'cta', label: 'CTA Text' },
              ].map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'general' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">General Caption</label>
                  <textarea
                    rows={4}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Share Text</label>
                  <input
                    type="text"
                    value={shareText}
                    onChange={(e) => setShareText(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono outline-none"
                  />
                </div>
              </div>
            )}

            {activeTab === 'whatsapp' && (
              <textarea
                rows={5}
                value={whatsappCaption}
                onChange={(e) => setWhatsappCaption(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono outline-none"
              />
            )}

            {activeTab === 'instagram' && (
              <textarea
                rows={5}
                value={instagramCaption}
                onChange={(e) => setInstagramCaption(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono outline-none"
              />
            )}

            {activeTab === 'facebook' && (
              <textarea
                rows={5}
                value={facebookCaption}
                onChange={(e) => setFacebookCaption(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono outline-none"
              />
            )}

            {activeTab === 'youtube' && (
              <textarea
                rows={5}
                value={youtubeCaption}
                onChange={(e) => setYoutubeCaption(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono outline-none"
              />
            )}

            {activeTab === 'cta' && (
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono outline-none"
              />
            )}
          </div>

          {/* Card 4: Settings */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Calendar size={18} className="text-purple-500" />
              <span>Status &amp; Visibility</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white outline-none"
                >
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Display Order</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-5">
                <input
                  type="checkbox"
                  id="edit-featured-check"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded border-slate-300"
                />
                <label htmlFor="edit-featured-check" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Featured in Highlights
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/admin/mlm/gallery"
              className="px-5 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-lg shadow-amber-500/20 transition disabled:opacity-60 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
