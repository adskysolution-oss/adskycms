'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import {
  Search,
  Filter,
  Download,
  Share2,
  Copy,
  Check,
  Eye,
  Play,
  FileText,
  Sparkles,
  ArrowUpDown,
  ExternalLink,
  X,
  MessageCircle,
  Video,
  Layers,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Clock,
  Send,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import MlmMemberLayout from '@/components/features/mlm/MlmMemberLayout.js';
import { sharePosterDirectly, fetchMediaFile, downloadBlob, sanitizeFileName } from '@/lib/mlm/posterShare.js';

export default function NextViewGalleryPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });

  // Filters & State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('ALL');
  const [sort, setSort] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);

  // Authenticated Member Details for Personalization
  const [member, setMember] = useState(null);

  // Preview Modal State
  const [previewItem, setPreviewItem] = useState(null);
  const [activeCaptionTab, setActiveCaptionTab] = useState('general');
  const [copiedKey, setCopiedKey] = useState(null);
  const [sharingId, setSharingId] = useState(null);

  // Fetch Member Profile for Referral Info
  useEffect(() => {
    async function fetchMember() {
      try {
        const res = await fetch('/api/mlm/profile');
        if (res.ok) {
          const json = await res.json();
          if (json?.success && json?.data) {
            setMember(json.data);
            return;
          }
        }
        // Fallback
        const meRes = await fetch('/api/mlm/auth/me');
        if (meRes.ok) {
          const meJson = await meRes.json();
          if (meJson?.success && meJson?.member) {
            setMember(meJson.member);
          }
        }
      } catch (err) {
        console.warn('Failed to load profile for personalization:', err);
      }
    }
    fetchMember();
  }, []);

  // Fetch Gallery Items
  const loadGallery = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (selectedCategory && selectedCategory !== 'All') params.set('category', selectedCategory);
      if (selectedType && selectedType !== 'ALL') params.set('type', selectedType);
      if (sort) params.set('sort', sort);
      params.set('page', currentPage.toString());
      params.set('limit', '12');

      const res = await fetch(`/api/mlm/gallery?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setItems(data.items || []);
        setFeaturedItems(data.featuredItems || []);
        if (data.categories?.length) {
          setCategories(data.categories);
        }
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        toast.error(data.message || 'Failed to load marketing library.');
      }
    } catch (err) {
      console.error('[Gallery Load Error]', err);
      toast.error('Network error loading marketing content.');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedType, sort, currentPage]);

  useEffect(() => {
    (async () => {
      await loadGallery();
    })();
  }, [loadGallery]);

  // Personalize marketing text with member's referral details
  const personalizeText = useCallback(
    (rawText = '') => {
      if (!rawText) return '';
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.adskysolution.com';
      const memberCode = member?.mlmCode || '';
      const inviteLink = `${origin}/nextview/register?sponsor=${memberCode}`;
      const memberName = member?.fullName || 'NextView Community Member';

      return rawText
        .replace(/\{\{REFERRAL_LINK\}\}/g, inviteLink)
        .replace(/\*?\{\{REFERRAL_CODE\}\}\*?/g, memberCode ? `*${memberCode}*` : '')
        .replace(/\{\{MEMBER_NAME\}\}/g, memberName);
    },
    [member]
  );

  // Track Analytics
  const trackAction = async (itemId, action) => {
    if (!itemId) return;
    try {
      await fetch(`/api/mlm/gallery/${itemId}/${action}`, {
        method: 'POST',
      });
    } catch (err) {
      // Non-blocking analytics
      console.debug(`[Analytics track failed: ${action}]`, err);
    }
  };

  // Download Handler (CORS-safe with proxy fallback)
  const handleDownload = async (item, e) => {
    if (e) e.stopPropagation();
    const targetUrl = item.fileUrl || item.url;
    if (!targetUrl) {
      toast.error('No downloadable file available for this asset.');
      return;
    }

    toast.loading('Starting download...', { id: 'download-toast' });
    trackAction(item._id, 'download');

    try {
      const fileName = item.fileName || sanitizeFileName(item.title, 'jpg');
      const file = await fetchMediaFile(targetUrl, fileName, item.title);
      if (file) {
        downloadBlob(file, fileName);
        toast.success('Download completed!', { id: 'download-toast' });
        return;
      }
      // Fallback: direct window open
      window.open(targetUrl, '_blank');
      toast.success('Opened media in new tab.', { id: 'download-toast' });
    } catch {
      window.open(targetUrl, '_blank');
      toast.success('Opened media in new tab.', { id: 'download-toast' });
    }
  };

  // Direct Poster Share Handler (Web Share API Level 2 with Desktop Fallback)
  const handleShare = async (item, e, customText = '') => {
    if (e) e.stopPropagation();
    if (!item || sharingId) return;

    setSharingId(item._id);

    try {
      const shareText = customText || item.shareText || item.caption || item.title;
      await sharePosterDirectly({
        item,
        text: shareText,
        title: item.title,
        member,
        onAnalytics: (action) => trackAction(item._id, action),
      });
    } catch (err) {
      console.error('[Gallery handleShare Error]:', err);
      toast.error('Unable to prepare poster. Please try again.');
    } finally {
      setSharingId(null);
    }
  };

  // Copy Caption Handler
  const handleCopyCaption = (item, textToCopy, key = 'caption', e) => {
    if (e) e.stopPropagation();
    const personalized = personalizeText(textToCopy || item.caption || item.shareText || item.title);
    if (!personalized) {
      toast.error('No caption available to copy.');
      return;
    }

    navigator.clipboard.writeText(personalized);
    setCopiedKey(`${item._id}-${key}`);
    toast.success('Copied to clipboard!');
    trackAction(item._id, 'copy');

    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  // Format file size
  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <MlmMemberLayout activePath="/nextview/gallery">
      <div className="space-y-8 pb-16 max-w-7xl mx-auto">
        {/* ── HERO HEADER ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-8 sm:p-10 shadow-xl shadow-orange-500/10">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-amber-100 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} className="text-amber-200 animate-pulse" />
              <span>Marketing &amp; Media Toolkit</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Marketing Library
            </h1>
            <p className="text-sm sm:text-base text-amber-100/90 font-medium leading-relaxed">
              Ready-to-use posters, promotional videos, campaign graphics, and pre-written captions with your personal invite link embedded.
            </p>
          </div>

          <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 opacity-10 pointer-events-none hidden lg:block">
            <Layers size={320} />
          </div>
        </div>

        {/* ── SEARCH & FILTER CONTROLS ── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search posters, videos, keywords, hashtags..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-2">
              <div className="relative min-w-[170px]">
                <ArrowUpDown size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition appearance-none cursor-pointer outline-none focus:border-amber-500"
                >
                  <option value="latest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="downloads">Most Downloaded</option>
                  <option value="shares">Most Shared</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 pt-3">
            {(categories.length ? categories : ['All', 'Posters', 'Images', 'Videos', 'Documents', 'Banners', 'Social Media', 'Other']).map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    active
                      ? 'bg-amber-600 text-white shadow-xs shadow-amber-600/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Content Type Filter Pills */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Type:</span>
            {['ALL', 'POSTER', 'VIDEO', 'DOCUMENT', 'CAPTION'].map((t) => {
              const active = selectedType === t;
              return (
                <button
                  key={t}
                  onClick={() => {
                    setSelectedType(t);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition ${
                    active
                      ? 'bg-slate-900 text-white'
                      : 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  {t === 'ALL' ? 'All Formats' : t}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── FEATURED HIGHLIGHTS (If present and on Page 1) ── */}
        {currentPage === 1 && !search && selectedCategory === 'All' && featuredItems.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-amber-600" />
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Featured Campaigns
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredItems.map((item) => (
                <div
                  key={`feat-${item._id}`}
                  onClick={() => {
                    setPreviewItem(item);
                    trackAction(item._id, 'view');
                  }}
                  className="group relative bg-white border border-amber-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-16/10 bg-slate-900 overflow-hidden">
                    {item.thumbnailUrl || item.fileUrl ? (
                      <img
                        src={item.thumbnailUrl || item.fileUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                        <FileText size={40} />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <Sparkles size={11} />
                      Featured
                    </span>
                    {item.contentType === 'VIDEO' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition">
                        <div className="w-12 h-12 rounded-full bg-white/90 text-amber-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                          <Play size={20} className="fill-amber-600 translate-x-0.5" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-1">
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">
                          {item.category || 'General'}
                        </span>
                        <span>{formatBytes(item.fileSize)}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-amber-600 transition">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Quick Action Footer */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                      <button
                        onClick={(e) => handleCopyCaption(item, item.caption || item.shareText, 'caption', e)}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center gap-1 transition"
                      >
                        {copiedKey === `${item._id}-caption` ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        <span>{copiedKey === `${item._id}-caption` ? 'Copied' : 'Copy Caption'}</span>
                      </button>

                      <button
                        onClick={(e) => handleShare(item, e)}
                        disabled={sharingId === item._id}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition disabled:opacity-50"
                        title="Share poster directly"
                      >
                        {sharingId === item._id ? (
                          <Loader2 size={14} className="animate-spin text-amber-600" />
                        ) : (
                          <Share2 size={14} />
                        )}
                      </button>

                      {item.fileUrl && (
                        <button
                          onClick={(e) => handleDownload(item, e)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-black text-white transition"
                          title="Download asset"
                        >
                          <Download size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MAIN CONTENT GRID ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              {selectedCategory === 'All' ? 'All Marketing Creatives' : `${selectedCategory} (${pagination.total})`}
            </h2>
            <span className="text-xs font-bold text-slate-400">
              Showing {items.length} of {pagination.total}
            </span>
          </div>

          {loading ? (
            /* Skeleton Loading Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-16/10 bg-slate-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 w-1/3 bg-slate-200 rounded" />
                    <div className="h-4 w-3/4 bg-slate-200 rounded" />
                    <div className="h-3 w-full bg-slate-100 rounded" />
                    <div className="h-8 w-full bg-slate-200 rounded mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            /* Empty State */
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                <Search size={28} />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-black text-slate-900">No marketing assets found</h3>
                <p className="text-xs text-slate-500">
                  {search
                    ? `No matching materials found for "${search}". Try searching with another keyword.`
                    : 'There are no published marketing materials in this category yet.'}
                </p>
              </div>
              {(search || selectedCategory !== 'All' || selectedType !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearch('');
                    setSelectedCategory('All');
                    setSelectedType('ALL');
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
                >
                  Reset all filters
                </button>
              )}
            </div>
          ) : (
            /* Content Cards */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {items.map((item) => (
                <div
                  key={item._id}
                  onClick={() => {
                    setPreviewItem(item);
                    trackAction(item._id, 'view');
                  }}
                  className="group bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col cursor-pointer"
                >
                  {/* Card Media Preview */}
                  <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                    {item.thumbnailUrl || item.fileUrl ? (
                      <img
                        src={item.thumbnailUrl || item.fileUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 p-4 text-center">
                        <FileText size={32} className="mb-1" />
                        <span className="text-[10px] font-bold uppercase">{item.contentType || 'CREATIVE'}</span>
                      </div>
                    )}

                    {/* Media Type Badge */}
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider">
                      {item.contentType || 'CREATIVE'}
                    </span>

                    {item.contentType === 'VIDEO' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition">
                        <div className="w-10 h-10 rounded-full bg-white/90 text-amber-600 flex items-center justify-center shadow-md">
                          <Play size={16} className="fill-amber-600 translate-x-0.5" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-1">
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold">
                          {item.category || 'Posters'}
                        </span>
                        <span className="text-[10px]">{formatBytes(item.fileSize)}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-amber-600 transition">
                        {item.title}
                      </h3>
                      {item.description ? (
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                          {item.description}
                        </p>
                      ) : item.caption ? (
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 italic">
                          &ldquo;{item.caption}&rdquo;
                        </p>
                      ) : null}
                    </div>

                    {/* Card Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                      <button
                        onClick={(e) => handleCopyCaption(item, item.caption || item.shareText, 'caption', e)}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 transition"
                      >
                        {copiedKey === `${item._id}-caption` ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        <span>{copiedKey === `${item._id}-caption` ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        onClick={(e) => handleShare(item, e)}
                        disabled={sharingId === item._id}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition disabled:opacity-50"
                        title="Share poster directly"
                      >
                        {sharingId === item._id ? (
                          <Loader2 size={14} className="animate-spin text-amber-600" />
                        ) : (
                          <Share2 size={14} />
                        )}
                      </button>

                      {item.fileUrl && (
                        <button
                          onClick={(e) => handleDownload(item, e)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-black text-white transition"
                          title="Download original asset"
                        >
                          <Download size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── PAGINATION ── */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-slate-700 px-3 py-1.5 rounded-lg bg-slate-100">
                Page {currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={currentPage === pagination.totalPages}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── PREVIEW & SHARING MODAL ── */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div
            className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col md:flex-row max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Media Column */}
            <div className="md:w-1/2 bg-slate-950 flex flex-col items-center justify-center p-4 relative min-h-[260px] md:min-h-[450px]">
              {previewItem.contentType === 'VIDEO' && previewItem.fileUrl ? (
                <video
                  src={previewItem.fileUrl}
                  controls
                  autoPlay
                  className="max-h-[380px] w-full rounded-xl object-contain shadow-md"
                />
              ) : previewItem.fileUrl || previewItem.thumbnailUrl ? (
                <img
                  src={previewItem.fileUrl || previewItem.thumbnailUrl}
                  alt={previewItem.title}
                  className="max-h-[380px] w-full rounded-xl object-contain shadow-md"
                />
              ) : (
                <div className="text-slate-400 text-center p-8">
                  <FileText size={48} className="mx-auto mb-2 text-slate-500" />
                  <p className="text-xs">Document / Text Content Preview</p>
                </div>
              )}

              {/* Media Action Buttons */}
              <div className="flex items-center gap-2 mt-4 w-full">
                {previewItem.fileUrl && (
                  <button
                    onClick={(e) => handleDownload(previewItem, e)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition"
                  >
                    <Download size={15} />
                    <span>Download Asset</span>
                  </button>
                )}
                <button
                  onClick={(e) => handleShare(previewItem, e)}
                  disabled={sharingId === previewItem._id}
                  className="py-2.5 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center justify-center gap-1.5 backdrop-blur-sm transition disabled:opacity-50"
                >
                  {sharingId === previewItem._id ? (
                    <Loader2 size={15} className="animate-spin text-white" />
                  ) : (
                    <Share2 size={15} />
                  )}
                  <span>{sharingId === previewItem._id ? 'Preparing...' : 'Share Poster'}</span>
                </button>
              </div>
            </div>

            {/* Right Details & Ready-Made Captions Column */}
            <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto max-h-[500px] md:max-h-none space-y-4">
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      {previewItem.category || 'General'}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-1">
                      {previewItem.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setPreviewItem(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  >
                    <X size={20} />
                  </button>
                </div>

                {previewItem.description && (
                  <p className="text-xs text-slate-600 mt-2">
                    {previewItem.description}
                  </p>
                )}

                {/* Ready-Made Caption Tabs */}
                <div className="mt-4 space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Copy Pre-written Marketing Caption:
                  </span>

                  {/* Caption Channel Selector */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                    {[
                      { id: 'general', label: 'General', icon: MessageCircle },
                      { id: 'whatsapp', label: 'WhatsApp', icon: Send },
                      { id: 'instagram', label: 'Instagram', icon: Sparkles },
                      { id: 'facebook', label: 'Facebook', icon: Layers },
                      { id: 'cta', label: 'CTA Link', icon: ExternalLink },
                    ].map((tab) => {
                      const active = activeCaptionTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveCaptionTab(tab.id)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition whitespace-nowrap ${
                            active
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <tab.icon size={11} />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Caption Content Box */}
                  {(() => {
                    let text = '';
                    if (activeCaptionTab === 'general') {
                      text = previewItem.caption || previewItem.shareText || previewItem.title;
                    } else if (activeCaptionTab === 'whatsapp') {
                      text = previewItem.captions?.whatsapp || previewItem.caption || previewItem.shareText;
                    } else if (activeCaptionTab === 'instagram') {
                      text = previewItem.captions?.instagram || previewItem.caption;
                    } else if (activeCaptionTab === 'facebook') {
                      text = previewItem.captions?.facebook || previewItem.caption;
                    } else if (activeCaptionTab === 'cta') {
                      text = previewItem.captions?.ctaText || `Join NextView with my invite link: {{REFERRAL_LINK}}`;
                    }

                    const personalized = personalizeText(text);

                    return (
                      <div className="relative mt-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed max-h-[160px] overflow-y-auto">
                        {personalized || (
                          <span className="text-slate-400 italic">No specific caption configured for this platform.</span>
                        )}

                        {personalized && (
                          <div className="mt-3 space-y-2">
                            {previewItem.fileUrl && (
                              <button
                                onClick={(e) => handleShare(previewItem, e, text)}
                                disabled={sharingId === previewItem._id}
                                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition shadow-sm disabled:opacity-50"
                              >
                                {sharingId === previewItem._id ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Share2 size={14} />
                                )}
                                <span>{sharingId === previewItem._id ? 'Preparing Poster...' : 'Share Poster Directly on WhatsApp'}</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleCopyCaption(previewItem, text, activeCaptionTab)}
                              className="w-full py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                            >
                              {copiedKey === `${previewItem._id}-${activeCaptionTab}` ? (
                                <>
                                  <Check size={14} className="text-emerald-600" />
                                  <span>Copied to Clipboard!</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={14} />
                                  <span>Copy Caption Only</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Referral Notice */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900 flex items-center gap-2">
                <HelpCircle size={15} className="text-amber-600 shrink-0" />
                <span>
                  All copied captions automatically insert your invite code (<strong>{member?.mlmCode || 'NEXVIA'}</strong>) and link.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </MlmMemberLayout>
  );
}
