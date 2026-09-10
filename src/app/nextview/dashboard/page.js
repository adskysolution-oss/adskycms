'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  Award,
  Users,
  Network,
  Share2,
  Copy,
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  CreditCard,
  Building2,
  ShieldCheck,
  AlertCircle,
  FileCheck,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Clock,
  Layers,
  GraduationCap,
  Megaphone,
  LifeBuoy,
  Lock,
  Unlock,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import MlmMemberLayout from '@/components/features/mlm/MlmMemberLayout';
import { DEFAULT_SHARE_MESSAGE } from '@/constants/mlmShare';

export default function NextViewDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [matrixData, setMatrixData] = useState(null);
  const [rewardsData, setRewardsData] = useState(null);
  const [shareConfig, setShareConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const fetchJson = async (url) => {
        try {
          const res = await fetch(url);
          if (!res.ok) return { success: false, message: `Status ${res.status}` };
          return res.json();
        } catch {
          return { success: false };
        }
      };

      const [profRes, wallRes, matRes, rewRes, shareRes] = await Promise.all([
        fetchJson('/api/mlm/profile'),
        fetchJson('/api/mlm/wallet'),
        fetchJson('/api/mlm/matrix'),
        fetchJson('/api/mlm/rewards'),
        fetchJson('/api/mlm/share-config'),
      ]);

      let userProfile = null;
      if (profRes?.success && profRes.data) {
        userProfile = profRes.data;
      } else if (profRes?.success && profRes.member) {
        userProfile = profRes.member;
      } else {
        // Fallback to me
        const meRes = await fetchJson('/api/mlm/auth/me');
        if (meRes?.success && meRes.member) {
          userProfile = meRes.member;
        }
      }

      if (!userProfile) {
        router.push('/nextview/login');
        return;
      }

      // Check onboarding & KYC gating: If not active or KYC not verified, redirect to onboarding
      if (userProfile.status !== 'ACTIVE' || userProfile.kycStatus !== 'VERIFIED' || !userProfile.platformFeePaid) {
        // Only allow root admin or fully active members to bypass
        if (userProfile.mlmCode !== 'NEX-ROOT-001') {
          router.push('/nextview/onboarding');
          return;
        }
      }

      setProfile(userProfile);
      if (wallRes?.success && (wallRes.data?.wallet || wallRes.wallet)) {
        setWallet(wallRes.data?.wallet || wallRes.wallet);
      }
      if (matRes?.success && (matRes.data || matRes)) {
        setMatrixData(matRes.data || matRes);
      }
      if (rewRes?.success && (rewRes.data || rewRes)) {
        setRewardsData(rewRes.data || rewRes);
      }
      if (shareRes?.success) {
        setShareConfig(shareRes.data || shareRes.config || shareRes);
      }
    } catch (err) {
      console.error('Error loading NextView dashboard:', err);
      setError('Unable to load your dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getReferralShareText = () => {
    if (!profile?.mlmCode) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.adskysolution.com';
    const url = `${origin}/nextview/register?sponsor=${profile.mlmCode}`;
    const template = shareConfig?.messageTemplate || DEFAULT_SHARE_MESSAGE;

    let text = template
      .replace(/\{\{REFERRAL_LINK\}\}/g, url)
      .replace(/\*?\{\{REFERRAL_CODE\}\}\*?/g, `*${profile.mlmCode}*`)
      .replace(/\{\{MEMBER_NAME\}\}/g, profile.fullName || 'NEXVIA Member');

    if (shareConfig?.includePosterUrlInText && shareConfig?.posterUrl && !text.includes(shareConfig.posterUrl)) {
      text += `\n\n🖼️ Official Campaign Poster:\n${shareConfig.posterUrl}`;
    }

    return text;
  };

  const copyReferralLink = () => {
    if (!profile?.mlmCode) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.adskysolution.com';
    const url = `${origin}/nextview/register?sponsor=${profile.mlmCode}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success('Referral link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const copyShareMessage = () => {
    if (!profile?.mlmCode) return;
    const text = getReferralShareText();
    navigator.clipboard.writeText(text);
    setCopiedMessage(true);
    toast.success('WhatsApp referral message copied to clipboard!');
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  const shareReferralWhatsapp = () => {
    if (!profile?.mlmCode) {
      toast.error('Member profile is loading...');
      return;
    }
    const text = getReferralShareText();
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Skeleton Loader
  if (loading) {
    return (
      <MlmMemberLayout activePath="/nextview/dashboard">
        <div className="space-y-6 animate-pulse">
          <div className="h-32 bg-slate-200/70 rounded-3xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-36 bg-slate-200/70 rounded-3xl" />
            ))}
          </div>
          <div className="h-28 bg-slate-200/70 rounded-3xl" />
          <div className="h-44 bg-slate-200/70 rounded-3xl" />
        </div>
      </MlmMemberLayout>
    );
  }

  if (error && !profile) {
    return (
      <MlmMemberLayout activePath="/nextview/dashboard">
        <div className="p-8 bg-white border border-red-200 rounded-3xl text-center space-y-4 shadow-sm max-w-lg mx-auto mt-10">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">Dashboard Unavailable</h2>
          <p className="text-xs text-slate-500">{error}</p>
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Loading</span>
          </button>
        </div>
      </MlmMemberLayout>
    );
  }

  // Calculated Values
  const withdrawableBalance = wallet?.currentBalance ?? wallet?.balance ?? rewardsData?.withdrawableRewards ?? 0;
  const lockedBalance = wallet?.lockedBalance ?? wallet?.pendingBalance ?? rewardsData?.lockedRewards ?? 0;
  const directCount = matrixData?.directSponsoredCount ?? matrixData?.directCount ?? matrixData?.directSponsored?.length ?? 0;
  const networkCount = matrixData?.totalDescendantsCount ?? matrixData?.totalDownline ?? matrixData?.networkCount ?? 0;

  // Direct 3 slots data
  const directSlots = (matrixData?.directChildren || []).slice(0, 3);
  while (directSlots.length < 3) {
    directSlots.push({ position: directSlots.length + 1, status: 'VACANT' });
  }

  // Generate 15 levels structure if not provided
  const levelOccupancies = matrixData?.levelOccupancies || rewardsData?.levelOccupancies || [
    { level: 1, capacity: 3, filledCount: directSlots.filter(s => s.status !== 'VACANT').length, isComplete: directSlots.filter(s => s.status !== 'VACANT').length >= 3 },
    { level: 2, capacity: 9, filledCount: 0, isComplete: false },
    { level: 3, capacity: 27, filledCount: 0, isComplete: false },
    { level: 4, capacity: 81, filledCount: 0, isComplete: false },
    { level: 5, capacity: 243, filledCount: 0, isComplete: false },
  ];

  const originUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const referralUrl = profile?.mlmCode
    ? `${originUrl}/nextview/register?sponsor=${profile.mlmCode}`
    : '';

  return (
    <MlmMemberLayout activePath="/nextview/dashboard">
      <div className="space-y-6">
        {/* ── 1. WELCOME BANNER (LIGHT THEME) ────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50/40 to-amber-50/60 p-6 sm:p-8 text-slate-900 shadow-xs border border-slate-200/80">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Welcome back, {profile?.fullName || 'Member'}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                <p>
                  Member ID: <span className="font-mono font-bold text-amber-700">{profile?.mlmCode || '—'}</span>
                </p>
                <span className="text-slate-300">•</span>
                <p>
                  Sponsor: <span className="font-mono font-bold text-slate-800">{profile?.sponsorCode || (profile?.sponsorId?.mlmCode) || 'NEX-ROOT-001'}</span>
                </p>
                <span className="text-slate-300">•</span>
                <p>
                  KYC: <span className="font-bold text-emerald-700">{profile?.kycStatus || 'VERIFIED'}</span>
                </p>
              </div>
            </div>

            {/* Quick action buttons in banner */}
            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                href="/nextview/network"
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold transition inline-flex items-center gap-2 shadow-xs"
              >
                <Network className="w-4 h-4 text-blue-600" />
                <span>View Network</span>
              </Link>
              <Link
                href="/nextview/fd-card"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-extrabold transition inline-flex items-center gap-2 shadow-md shadow-amber-500/20"
              >
                <CreditCard className="w-4 h-4" />
                <span>Explore FD</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── 2. FOUR SUMMARY CARDS (EXACT VISUAL HIERARCHY) ────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CARD 1: Withdrawable Balance */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Withdrawable Balance
              </span>
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
                <Unlock className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                ₹{Number(withdrawableBalance).toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Unlocked &amp; Eligible for Payout</span>
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <Link
                href="/nextview/withdrawals"
                className="text-xs font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1"
              >
                <span>Withdraw</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/nextview/wallet"
                className="text-[11px] font-semibold text-slate-400 hover:text-slate-600"
              >
                Ledger
              </Link>
            </div>
          </div>

          {/* CARD 2: Locked Rewards */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Locked Rewards
              </span>
              <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
                <Lock className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-black text-amber-700 tracking-tight">
                ₹{Number(lockedBalance).toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Pending Level Completion (3^L)</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <Link
                href="/nextview/rewards"
                className="text-xs font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1"
              >
                <span>View Level Status</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-[10px] font-mono text-slate-400">Auto-unlocks</span>
            </div>
          </div>

          {/* CARD 3: Direct Sponsored */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Direct Sponsored
              </span>
              <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {directCount}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Personally Referred Members</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <Link
                href="/nextview/network"
                className="text-xs font-bold text-purple-600 hover:text-purple-700 inline-flex items-center gap-1"
              >
                <span>Direct Team</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-[10px] font-mono text-slate-400">Unlimited Directs</span>
            </div>
          </div>

          {/* CARD 4: Network Downline */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                3×15 Network
              </span>
              <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
                <Network className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {networkCount}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Total Downline Nodes</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <Link
                href="/nextview/network"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                <span>Tree Explorer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-[10px] font-mono text-slate-400">15 Levels</span>
            </div>
          </div>
        </div>

        {/* ── 3. YOUR PERSONAL REFERRAL LINK CARD ───────────────────────────── */}
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-white border border-amber-300/80 rounded-3xl p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-900">
                  Your Personal Referral Link
                </h3>
              </div>
              <p className="text-xs text-slate-600">
                Share your referral link to sponsor new members. 3 direct slots sit in Level 1; subsequent referrals automatically spillover to grow your 15-tier network.
              </p>
              <div className="pt-2 flex items-center">
                <div className="flex-1 min-w-0 flex items-center gap-2 bg-white px-3.5 py-2.5 rounded-xl border border-amber-200 shadow-2xs font-mono text-xs text-slate-800 break-all select-all">
                  <span className="truncate">{referralUrl || 'Loading referral URL...'}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={copyReferralLink}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-amber-300 text-amber-900 text-xs font-bold transition shadow-2xs"
                title="Copy registration link"
              >
                <Copy className="w-3.5 h-3.5 text-amber-600" />
                <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
              </button>

              <button
                type="button"
                onClick={copyShareMessage}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-bold transition shadow-2xs"
                title="Copy entire WhatsApp message"
              >
                <Copy className="w-3.5 h-3.5 text-amber-600" />
                <span>{copiedMessage ? 'Message Copied!' : 'Copy Message'}</span>
              </button>

              <button
                type="button"
                onClick={shareReferralWhatsapp}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── 4. LEVEL COMPLETION & UNLOCK PROGRESS (15 LEVELS SNAPSHOT) ────── */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                Level Completion &amp; Unlock Progress
              </h3>
            </div>
            <Link href="/nextview/rewards" className="text-xs font-bold text-amber-600 hover:text-amber-700">
              View All 15 Levels
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {levelOccupancies.slice(0, 5).map((lvl) => {
              const percentage = Math.min(100, Math.round((lvl.filledCount / lvl.capacity) * 100));
              const isComplete = lvl.isComplete;

              return (
                <div
                  key={lvl.level}
                  className={`p-4 rounded-2xl border transition ${
                    isComplete
                      ? 'bg-emerald-50/60 border-emerald-300 shadow-2xs'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="font-mono">Level {lvl.level}</span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isComplete
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isComplete ? 'Unlocked' : 'In Progress'}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                      <span>Occupancy</span>
                      <span className="font-mono">{lvl.filledCount} / {lvl.capacity}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isComplete ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 5. DIRECT TEAM (3 SLOTS) & FD OVERVIEW ────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Direct 3-Slot Tree Preview */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">My Direct Slots</h3>
                  <p className="text-[11px] text-slate-400">Immediate level 1 placement (Max 3 Direct Children)</p>
                </div>
              </div>

              <Link
                href="/nextview/network"
                className="text-xs font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1"
              >
                <span>View Full Network</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {directSlots.map((slot, idx) => {
                const isOccupied = slot.status !== 'VACANT' && (slot.member || slot.mlmCode);
                const slotMember = slot.member || slot;

                return (
                  <div
                    key={idx}
                    className={`rounded-2xl p-4 border transition ${
                      isOccupied
                        ? 'bg-amber-50/50 border-amber-200 shadow-2xs'
                        : 'bg-slate-50/60 border-dashed border-slate-200 text-center flex flex-col justify-center items-center py-6'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        Slot #{slot.position || idx + 1}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          isOccupied
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isOccupied ? 'Occupied' : 'Vacant'}
                      </span>
                    </div>

                    {isOccupied ? (
                      <div className="space-y-1 mt-1 text-left w-full">
                        <p className="text-xs font-black text-slate-900 truncate">
                          {slotMember?.fullName || 'Direct Member'}
                        </p>
                        <p className="text-[10px] font-mono text-amber-700 font-semibold truncate">
                          {slotMember?.mlmCode || '—'}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Status: <span className="font-bold text-emerald-600">{slotMember?.status || 'ACTIVE'}</span>
                        </p>
                      </div>
                    ) : (
                      <div className="text-center space-y-1 mt-1">
                        <p className="text-xs font-bold text-slate-400">Slot Available</p>
                        <p className="text-[10px] text-slate-400">Share referral link to fill</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* FD Smart Card Promo Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 rounded-3xl p-6 text-white border border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-white tracking-tight">
                Smart FD &amp; Credit Card
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Book a high-yield Fixed Deposit starting at ₹5,000 and get an instant pre-approved RuPay Credit Card with guaranteed cashback.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/nextview/fd-card"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition"
              >
                <span>Apply for Smart FD Card</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MlmMemberLayout>
  );
}
