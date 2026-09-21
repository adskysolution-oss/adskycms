'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Video,
  Sparkles,
  Check,
  X,
  Layers,
  Send,
  MessageCircle,
  ExternalLink,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout.js';

export default function AdminNewGalleryPage() {
  const router = useRouter();

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
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  // Captions
  const [caption, setCaption] = useState('');
  const [shareText, setShareText] = useState('');
  const [whatsappCaption, setWhatsappCaption] = useState('');
  const [instagramCaption, setInstagramCaption] = useState('');
  const [facebookCaption, setFacebookCaption] = useState('');
  const [youtubeCaption, setYoutubeCaption] = useState('');
  const [ctaText, setCtaText] = useState('');

  const [activeTab, setActiveTab] = useState('general');

  // Handle Main File Selection
  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    // Check size limit (max 60MB)
    if (selected.size > 60 * 1024 * 1024) {
      toast.error('File exceeds maximum upload limit of 60MB.');
      return;
    }

    setFile(selected);

    // Auto-detect type
    if (selected.type.startsWith('image/')) {
      setContentType('POSTER');
      setFilePreview(URL.createObjectURL(selected));
    } else if (selected.type.startsWith('video/')) {
      setContentType('VIDEO');
      setFilePreview(URL.createObjectURL(selected));
    } else if (selected.type === 'application/pdf') {
      setContentType('DOCUMENT');
      setFilePreview(null);
    } else {
      setFilePreview(null);
    }
  };

  // Handle Thumbnail Selection
  const handleThumbnailChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setThumbnail(selected);
    if (selected.type.startsWith('image/')) {
      setThumbnailPreview(URL.createObjectURL(selected));
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Content title is required.');
      return;
    }

    if (!file && contentType !== 'CAPTION') {
      toast.error('Please select a media file to upload.');
      return;
    }

    setSaving(true);
    const toastId = toast.loading('Uploading media and saving creative...');

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('contentType', contentType);
      formData.append('status', status);
      formData.append('featured', featured ? 'true' : 'false');
      formData.append('sortOrder', sortOrder || '0');
      if (publishFrom) formData.append('publishFrom', publishFrom);
      if (publishUntil) formData.append('publishUntil', publishUntil);
      if (tags.trim()) formData.append('tags', tags.trim());

      // Captions
      if (caption.trim()) formData.append('caption', caption.trim());
      if (shareText.trim()) formData.append('shareText', shareText.trim());

      const captionsObj = {
        whatsapp: whatsappCaption.trim() || undefined,
        instagram: instagramCaption.trim() || undefined,
        facebook: facebookCaption.trim() || undefined,
        youtube: youtubeCaption.trim() || undefined,
        ctaText: ctaText.trim() || undefined,
      };
      formData.append('captions', JSON.stringify(captionsObj));

      // Files
      if (file) formData.append('file', file);
      if (thumbnail) formData.append('thumbnail', thumbnail);

      const res = await fetch('/api/admin/mlm/gallery', {
        method: 'POST',
        body: formData,
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        data = { message: 'Failed to process server response.' };
      }
      toast.dismiss(toastId);

      if (res.ok && data.success) {
        toast.success('Creative published successfully!');
        router.push('/admin/mlm/gallery');
      } else {
        toast.error(data.message || 'Failed to upload creative.');
      }
    } catch (err) {
      console.error(err);
      toast.dismiss(toastId);
      toast.error('Network error during upload.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-16 max-w-4xl mx-auto">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/mlm/gallery"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft size={16} />
            <span>Back to Marketing Library</span>
          </Link>
          <span className="text-xs text-slate-400 font-semibold">New Marketing Asset</span>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Content Information */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles size={18} className="text-amber-500" />
              <span>Basic Information</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Creative Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NextView Lifetime Membership Launch Poster"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-amber-500 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:border-amber-500 outline-none"
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Format / Content Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:border-amber-500 outline-none"
                  >
                    <option value="POSTER">POSTER (Image)</option>
                    <option value="IMAGE">IMAGE (Graphic)</option>
                    <option value="VIDEO">VIDEO (MP4 / WebM)</option>
                    <option value="DOCUMENT">DOCUMENT (PDF / Doc)</option>
                    <option value="BANNER">BANNER (Wide Header)</option>
                    <option value="CAPTION">CAPTION (Text Only)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Brief Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain when or where members should use this promotional asset..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. launch, referral, earnings, poster, network"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-amber-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Media Upload */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <UploadCloud size={18} className="text-blue-500" />
              <span>Media Assets</span>
            </h2>

            <div className="space-y-4">
              {/* Main File Dropzone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Main Media File (Image, Video, or Document) <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-6 text-center transition bg-slate-50/50 hover:bg-amber-50/20">
                  <input
                    type="file"
                    id="main-file-input"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,video/*,application/pdf,.doc,.docx,.ppt,.pptx"
                  />
                  <label htmlFor="main-file-input" className="cursor-pointer block space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                      <UploadCloud size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {file ? file.name : 'Click to select or drag and drop media file'}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Supports JPG, PNG, WEBP, MP4, WEBM, PDF (up to 60MB)
                      </p>
                    </div>
                  </label>
                </div>

                {/* Preview if available */}
                {filePreview && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {contentType === 'VIDEO' ? (
                        <video src={filePreview} className="w-16 h-12 object-cover rounded-lg bg-black" />
                      ) : (
                        <img src={filePreview} alt="Preview" className="w-16 h-12 object-cover rounded-lg" />
                      )}
                      <div>
                        <p className="text-xs font-bold text-slate-800">{file?.name}</p>
                        <p className="text-[10px] text-slate-500">{(file?.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setFilePreview(null);
                      }}
                      className="p-1 text-slate-400 hover:text-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Optional Thumbnail (useful for video/doc) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Optional Video/Document Thumbnail
                </label>
                <input
                  type="file"
                  onChange={handleThumbnailChange}
                  accept="image/*"
                  className="w-full text-slate-600 text-xs file:mr-4 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200 cursor-pointer"
                />
                {thumbnailPreview && (
                  <div className="mt-2 w-24 h-16 rounded-lg overflow-hidden border border-slate-200">
                    <img src={thumbnailPreview} alt="Thumb" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Marketing Captions & Platform Texts */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <MessageCircle size={18} className="text-emerald-500" />
                <span>Pre-Written Marketing Captions</span>
              </h2>
              <span className="text-[11px] text-slate-500">
                Supports <code className="text-amber-700 font-bold">{'{{REFERRAL_LINK}}'}</code>, <code className="text-amber-700 font-bold">{'{{REFERRAL_CODE}}'}</code>
              </span>
            </div>

            {/* Platform Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: 'general', label: 'General / Default' },
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
                      ? 'bg-emerald-600 text-white shadow-xs'
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Caption (Shown on Card &amp; Default Copy)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="e.g. 🚀 Join the revolutionary NextView referral network! Earn lifetime passive rewards. Join using my referral link: {{REFERRAL_LINK}}"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    One-Line Share Text
                  </label>
                  <input
                    type="text"
                    placeholder="Short message used when sharing directly via mobile"
                    value={shareText}
                    onChange={(e) => setShareText(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            )}

            {activeTab === 'whatsapp' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  WhatsApp Optimized Message
                </label>
                <textarea
                  rows={5}
                  placeholder="*NextView Platform Launch!* 🔥\n\nActivate your network position today.\nUse my sponsor code: {{REFERRAL_CODE}}\nJoin link: {{REFERRAL_LINK}}"
                  value={whatsappCaption}
                  onChange={(e) => setWhatsappCaption(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-emerald-500 outline-none"
                />
              </div>
            )}

            {activeTab === 'instagram' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Instagram Caption &amp; Hashtags
                </label>
                <textarea
                  rows={5}
                  placeholder="Unlock lifetime earnings with NextView. Link in bio or DM me for my referral code {{REFERRAL_CODE}}! #NextView #PassiveIncome #Network"
                  value={instagramCaption}
                  onChange={(e) => setInstagramCaption(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-emerald-500 outline-none"
                />
              </div>
            )}

            {activeTab === 'facebook' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Facebook Post Text
                </label>
                <textarea
                  rows={5}
                  placeholder="I'm excited to invite you to NextView! Register now at: {{REFERRAL_LINK}}"
                  value={facebookCaption}
                  onChange={(e) => setFacebookCaption(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-emerald-500 outline-none"
                />
              </div>
            )}

            {activeTab === 'youtube' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  YouTube Video Description
                </label>
                <textarea
                  rows={5}
                  placeholder="In this video we review NextView referral network opportunities...\n\nRegister: {{REFERRAL_LINK}}\nSponsor Code: {{REFERRAL_CODE}}"
                  value={youtubeCaption}
                  onChange={(e) => setYoutubeCaption(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-emerald-500 outline-none"
                />
              </div>
            )}

            {activeTab === 'cta' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Custom Call-to-Action Link Text
                </label>
                <input
                  type="text"
                  placeholder="e.g. Join {{MEMBER_NAME}}'s Team Now: {{REFERRAL_LINK}}"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:border-emerald-500 outline-none"
                />
              </div>
            )}
          </div>

          {/* Card 4: Publishing & Settings */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Calendar size={18} className="text-purple-500" />
              <span>Visibility &amp; Scheduling</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white outline-none"
                >
                  <option value="PUBLISHED">Published (Visible to Members)</option>
                  <option value="DRAFT">Draft (Admin Only)</option>
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
                  placeholder="0"
                />
              </div>

              <div className="flex items-center gap-3 pt-5">
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                />
                <label htmlFor="featured-check" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Featured in Highlights
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Publish From (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={publishFrom}
                  onChange={(e) => setPublishFrom(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Publish Until / Expiry (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={publishUntil}
                  onChange={(e) => setPublishUntil(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/admin/mlm/gallery"
              className="px-5 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
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
                  <span>Uploading &amp; Publishing...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Save &amp; Publish Creative</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
