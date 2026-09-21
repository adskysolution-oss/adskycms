'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Share2,
  Download,
  CheckCircle2,
  Lock,
  Sparkles,
  RefreshCw,
  X,
  Camera,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import MlmMemberLayout from '@/components/features/mlm/MlmMemberLayout';
import { sharePosterDirectly } from '@/lib/mlm/posterShare';

export default function NextViewAchievementsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Per-level loading states for 1-click actions
  const [downloadingLevel, setDownloadingLevel] = useState(null);
  const [sharingLevel, setSharingLevel] = useState(null);
  const [generatingLevel, setGeneratingLevel] = useState(null);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/mlm/achievements');
      const json = await res.json();
      if (json?.success && json?.data) {
        setData(json.data);
      } else {
        toast.error(json?.message || 'Failed to load achievements');
      }
    } catch (err) {
      console.error('Achievements fetch error:', err);
      toast.error('Network error loading achievements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  // Open Lightbox Modal
  const openPosterModal = (lvl) => {
    if (!lvl.isCompleted) {
      toast.error(`Level ${lvl.level} is locked. Complete this level in your matrix first.`);
      return;
    }
    const imageUrl = lvl.posterUrl || `/api/mlm/achievements/${lvl.level}/image`;
    setSelectedLevel({ ...lvl, posterUrl: imageUrl });
    setModalOpen(true);
  };

  // Instant refresh / reload poster
  const handleRegeneratePoster = (lvl) => {
    if (!lvl?.level) return;
    const refreshedUrl = `/api/mlm/achievements/${lvl.level}/image?v=${Date.now()}`;
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        levels: prev.levels.map((l) =>
          l.level === lvl.level ? { ...l, posterUrl: refreshedUrl } : l
        ),
      };
    });
    if (selectedLevel?.level === lvl.level) {
      setSelectedLevel((prev) => (prev ? { ...prev, posterUrl: refreshedUrl } : null));
    }
    toast.success(`Level ${lvl.level} poster refreshed!`);
  };

  // 1-Click Direct Download
  const handleDirectDownload = async (lvl) => {
    if (!lvl.isCompleted) return;
    try {
      setDownloadingLevel(lvl.level);
      const fileName = `nexvia-level-${lvl.level}-${(lvl.title || 'achievement').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
      const downloadUrl = `/api/mlm/achievements/${lvl.level}/image?download=1`;

      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

      toast.success(`Level ${lvl.level} poster downloaded!`);

      // Track download metric in background
      fetch(`/api/mlm/achievements/${lvl.level}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'download' }),
      }).catch(() => { });
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Download failed. Please try again.');
    } finally {
      setDownloadingLevel(null);
    }
  };

  // 1-Click Direct Share (WhatsApp & Native Share Apps)
  const handleDirectShare = async (lvl) => {
    if (!lvl.isCompleted) return;
    try {
      setSharingLevel(lvl.level);
      const imageUrl = `/api/mlm/achievements/${lvl.level}/image`;

      const caption =
        lvl.defaultCaption ||
        `🏆 Proud Moment! Milestone Achieved!\n\nI have successfully achieved Level ${lvl.level} (${lvl.title}) in the NexVia Network!\n\nJoin my network: ${data?.member?.mlmCode || ''}`;

      await sharePosterDirectly({
        item: {
          fileUrl: imageUrl,
          imageUrl: imageUrl,
          title: `NexVia Level ${lvl.level} - ${lvl.title}`,
        },
        text: caption,
        member: data?.member,
        onAnalytics: async () => {
          fetch(`/api/mlm/achievements/${lvl.level}/share`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'share' }),
          }).catch(() => { });
        },
      });
    } catch (err) {
      console.error('Share error:', err);
      toast.error('Could not share poster. Please try again.');
    } finally {
      setSharingLevel(null);
    }
  };

  const completedLevelsCount = data?.levels?.filter((l) => l.isCompleted).length || 0;
  const totalSharesCount = data?.levels?.reduce((acc, l) => acc + (l.sharesCount || 0), 0) || 0;

  return (
    <MlmMemberLayout activePath="/nextview/achievements">
      <div className="space-y-8 pb-16">
        {/* ── 1. HEADER & HERO BANNER ────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 md:p-10 text-white shadow-xl border border-slate-700/50">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>NexVia Recognition System</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                Achievement Center
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Celebrate your milestones. Download and share official, high-resolution achievement certificates
                with your photo and partner QR code in 1 click across WhatsApp and social media.
              </p>
            </div>

            {/* Metric Highlights */}
            <div className="grid grid-cols-2 gap-3 shrink-0 sm:min-w-[260px]">
              <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex flex-col items-center justify-center text-center">
                <span className="text-2xl sm:text-3xl font-black text-amber-400">
                  {completedLevelsCount} <span className="text-sm font-normal text-slate-400">/ 15</span>
                </span>
                <span className="text-[11px] font-bold text-slate-300 mt-1 uppercase tracking-wider">
                  Milestones Unlocked
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex flex-col items-center justify-center text-center">
                <span className="text-2xl sm:text-3xl font-black text-blue-400">
                  {totalSharesCount}
                </span>
                <span className="text-[11px] font-bold text-slate-300 mt-1 uppercase tracking-wider">
                  Posters Shared
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. PROFILE PHOTO WARNING (If not uploaded) ─────────────────────── */}
        {data && !data.member?.hasProfilePhoto && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200/80 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-900">Profile Photo Required for Posters</h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  Your personalized achievement poster includes your profile photo. Please upload your photo to personalize your certificates.
                </p>
              </div>
            </div>
            <Link
              href="/nextview/profile"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shrink-0 shadow-xs"
            >
              <span>Upload Photo</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* ── 3. 15-LEVEL ACHIEVEMENT MILESTONES GRID ────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-600" />
              <span>15-Level Milestone Matrix</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Verified by Level Milestone Completion
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-80 rounded-3xl bg-slate-100 border border-slate-200 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {data?.levels?.map((lvl) => {
                const isCompleted = lvl.isCompleted;

                return (
                  <div
                    key={lvl.level}
                    className={`relative rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${isCompleted
                        ? 'bg-white border-amber-300/80 shadow-amber-500/5'
                        : 'bg-slate-50/60 border-slate-200/60 opacity-80'
                      }`}
                  >
                    {/* Top Level Banner & Info */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase ${isCompleted
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-slate-200 text-slate-600'
                            }`}
                        >
                          Level {lvl.level}
                        </span>

                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Unlocked</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-semibold">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Locked</span>
                          </span>
                        )}
                      </div>

                      <div>
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                          {lvl.badgeName}
                        </span>
                        <h3 className="text-base font-black text-slate-900 mt-0.5 leading-snug">
                          {lvl.title}
                        </h3>
                      </div>
                    </div>

                    {/* DIRECT POSTER IMAGE DISPLAY ON CARD (FOR COMPLETED LEVELS) */}
                    {isCompleted && (
                      <div className="px-5 pb-3">
                        {lvl.posterUrl ? (
                          <div
                            onClick={() => openPosterModal(lvl)}
                            className="group relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-md border border-slate-200/90 bg-slate-950 cursor-pointer transition-transform duration-300 hover:scale-[1.01]"
                          >
                            <img
                              src={lvl.posterUrl}
                              alt={`Level ${lvl.level} Achievement Poster`}
                              className="w-full h-full object-cover transition duration-300 group-hover:brightness-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 text-slate-900 text-xs font-black shadow-lg">
                                <Maximize2 className="w-3.5 h-3.5 text-amber-600" />
                                <span>Click to View Full Size</span>
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => openPosterModal(lvl)}
                            className="w-full aspect-[4/5] rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-amber-50 transition"
                          >
                            {generatingLevel === lvl.level ? (
                              <div className="space-y-2">
                                <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
                                <p className="text-xs font-bold text-amber-900">Rendering Poster with your photo...</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Sparkles className="w-8 h-8 text-amber-500 mx-auto" />
                                <p className="text-xs font-bold text-amber-900">Poster Ready to Render</p>
                                <span className="inline-block px-3 py-1 rounded-lg bg-amber-500 text-white text-[11px] font-bold shadow-xs">
                                  Generate Poster
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* LOCKED STATE DETAILS */}
                    {!isCompleted && (
                      <div className="px-5 pb-5 space-y-3">
                        <p className="text-xs text-slate-500 italic">
                          &ldquo;{lvl.motivationalMessage}&rdquo;
                        </p>
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                          <span>Matrix Capacity:</span>
                          <span className="font-bold text-slate-700">
                            {lvl.capacity?.toLocaleString('en-IN')} Members
                          </span>
                        </div>
                      </div>
                    )}

                    {/* 1-CLICK ACTION BUTTONS (NO CLUTTERED DETAILED PAGE) */}
                    <div className="p-3 sm:px-5 bg-slate-50/90 border-t border-slate-100">
                      {isCompleted ? (
                        <div className="flex items-center gap-2">
                          {/* 1-Click Direct Download */}
                          <button
                            type="button"
                            disabled={downloadingLevel === lvl.level || generatingLevel === lvl.level}
                            onClick={() => handleDirectDownload(lvl)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 active:scale-98 text-white text-xs font-extrabold transition cursor-pointer shadow-xs disabled:opacity-60"
                            title="Direct 1-Click Image Download"
                          >
                            {downloadingLevel === lvl.level ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Download className="w-3.5 h-3.5 text-amber-400" />
                            )}
                            <span>{downloadingLevel === lvl.level ? 'Downloading...' : 'Download'}</span>
                          </button>

                          {/* 1-Click Direct Share */}
                          <button
                            type="button"
                            disabled={sharingLevel === lvl.level || generatingLevel === lvl.level}
                            onClick={() => handleDirectShare(lvl)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-extrabold transition cursor-pointer shadow-xs disabled:opacity-60"
                            title="Direct 1-Click Share to WhatsApp & Apps"
                          >
                            {sharingLevel === lvl.level ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Share2 className="w-3.5 h-3.5" />
                            )}
                            <span>{sharingLevel === lvl.level ? 'Sharing...' : 'Share Poster'}</span>
                          </button>
                        </div>
                      ) : (
                        <div className="w-full flex items-center justify-between text-xs text-slate-400 font-semibold py-1">
                          <span className="flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Complete Level {lvl.level} to unlock</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 4. STREAMLINED POSTER SHOWCASE LIGHTBOX (NO CLUTTERED SIDE PANEL) ── */}
        {modalOpen && selectedLevel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            {/* Dark Backdrop */}
            <div
              className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm animate-in fade-in transition-opacity"
              onClick={() => setModalOpen(false)}
            />

            {/* Poster Showcase Dialog */}
            <div className="relative w-full max-w-lg bg-slate-900 rounded-3xl shadow-2xl border border-slate-700/80 overflow-hidden z-50 flex flex-col items-center p-4 sm:p-6 space-y-4 animate-in zoom-in-95">
              {/* Header */}
              <div className="w-full flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase">
                    Level {selectedLevel.level}
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold text-white">
                    {selectedLevel.title} Achievement Poster
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    title="Regenerate poster with latest photo/template"
                    disabled={generatingLevel === selectedLevel.level}
                    onClick={() => handleRegeneratePoster(selectedLevel)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 text-xs font-bold transition cursor-pointer disabled:opacity-60"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${generatingLevel === selectedLevel.level ? 'animate-spin text-amber-400' : ''}`} />
                    <span className="hidden sm:inline">Regenerate</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Full-Glory Poster Image Display */}
              <div className="w-full max-w-[360px] aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-black flex items-center justify-center relative">
                {selectedLevel.posterUrl ? (
                  <img
                    src={selectedLevel.posterUrl}
                    alt={`Level ${selectedLevel.level} Achievement Poster`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                    <p className="text-xs font-bold text-slate-300">Rendering high-resolution poster with your photo...</p>
                  </div>
                )}
              </div>

              {/* Direct 1-Click Action Buttons (Under the poster, zero form clutter) */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={sharingLevel === selectedLevel.level || !selectedLevel.posterUrl}
                  onClick={() => handleDirectShare(selectedLevel)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-98 text-white font-extrabold text-xs sm:text-sm transition shadow-lg cursor-pointer disabled:opacity-60"
                >
                  {sharingLevel === selectedLevel.level ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                  <span>Share to WhatsApp &amp; Apps</span>
                </button>

                <button
                  type="button"
                  disabled={downloadingLevel === selectedLevel.level || !selectedLevel.posterUrl}
                  onClick={() => handleDirectDownload(selectedLevel)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-98 text-white font-extrabold text-xs sm:text-sm transition shadow-lg cursor-pointer disabled:opacity-60"
                >
                  {downloadingLevel === selectedLevel.level ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>Download HD Poster</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MlmMemberLayout>
  );
}
