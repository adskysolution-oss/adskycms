'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  User,
  CreditCard,
  Network,
  Award,
  Wallet,
  ArrowUpRight,
  Receipt,
  FileCheck,
  GraduationCap,
  Megaphone,
  LifeBuoy,
  Settings,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Copy,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const NAV_GROUPS = [
  {
    group: 'MAIN',
    items: [
      { name: 'Dashboard', href: '/nextview/dashboard', icon: LayoutDashboard },
      { name: 'My Profile', href: '/nextview/profile', icon: User },
    ]
  },
  {
    group: 'FD & NETWORK',
    items: [
      { name: 'FD / FD-Card', href: '/nextview/fd-card', icon: CreditCard },
      { name: 'My Network', href: '/nextview/network', icon: Network },
      { name: 'Level Rewards', href: '/nextview/rewards', icon: Award },
    ]
  },
  {
    group: 'FINANCE',
    items: [
      { name: 'Rewards Wallet', href: '/nextview/wallet', icon: Wallet },
      { name: 'Withdrawals', href: '/nextview/withdrawals', icon: ArrowUpRight },
      { name: 'Transactions', href: '/nextview/transactions', icon: Receipt },
    ]
  },
  {
    group: 'VERIFICATION',
    items: [
      { name: 'Verification & KYC', href: '/nextview/verification', icon: FileCheck },
    ]
  },
  {
    group: 'RESOURCES',
    items: [
      { name: 'Training', href: '/nextview/training', icon: GraduationCap },
      { name: 'Marketing & Posters', href: '/nextview/marketing', icon: Megaphone },
      { name: 'Support Desk', href: '/nextview/support', icon: LifeBuoy },
    ]
  },
  {
    group: 'ACCOUNT',
    items: [
      { name: 'Settings', href: '/nextview/settings', icon: Settings },
    ]
  }
];

export default function MlmMemberLayout({ children, activePath }) {
  const pathname = usePathname();
  const currentPath = activePath || pathname;
  const router = useRouter();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const [member, setMember] = useState(null);
  const [loadingMember, setLoadingMember] = useState(true);
  const [copiedReferral, setCopiedReferral] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/mlm/profile');
        if (!res.ok) {
          // fallback to auth/me
          const meRes = await fetch('/api/mlm/auth/me');
          if (meRes.ok) {
            const meJson = await meRes.json();
            if (meJson?.success && meJson?.member) {
              setMember(meJson.member);
              return;
            }
          }
          return;
        }
        const json = await res.json();
        if (json?.success && json?.data) {
          setMember(json.data);
        } else if (json?.success && json?.member) {
          setMember(json.member);
        }
      } catch (e) {
        console.error('Error fetching member profile:', e);
      } finally {
        setLoadingMember(false);
      }
    }
    fetchProfile();
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/mlm/auth/logout', { method: 'POST' });
      toast.success('Logged out.');
      router.push('/nextview/login');
    } catch (e) {
      router.push('/nextview/login');
    }
  };

  const copyReferralLink = () => {
    if (!member?.mlmCode) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/nextview/register?sponsor=${member.mlmCode}`;
    navigator.clipboard.writeText(url);
    setCopiedReferral(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopiedReferral(false), 2500);
  };

  const memberName = member?.fullName || 'Network Member';
  const memberCode = member?.mlmCode || 'NEX-MEMBER';
  const sponsorCode = member?.sponsorCode || (member?.sponsorId?.mlmCode) || 'NEX-ROOT-001';
  const initials = memberName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'NM';

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col antialiased text-slate-800">
      {/* ── TOP HEADER ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
        {/* Left: Mobile Toggle + Logo */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-none"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/nextview/dashboard" className="flex items-center gap-2.5 group">
            <Image
              src="/logoTitle.png"
              alt="NexVia Logo"
              width={32}
              height={32}
              className="w-8 h-8 rounded-xl object-contain shadow-xs"
            />
            <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight leading-none group-hover:text-amber-600 transition">
              NexVia
            </span>
          </Link>
        </div>

        {/* Right: Copy Referral + Profile Dropdown */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Quick Copy Link Chip (desktop) */}
          {member?.mlmCode && (
            <button
              type="button"
              onClick={copyReferralLink}
              title="Click to copy your personal referral link"
              className="hidden md:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50/80 hover:bg-amber-100 border border-amber-200/80 text-amber-900 text-xs font-semibold transition shadow-2xs"
            >
              <Copy className="w-3.5 h-3.5 text-amber-600" />
              <span>{copiedReferral ? 'Copied!' : 'Copy Referral'}</span>
              <span className="font-mono text-[11px] font-bold text-amber-800 bg-white px-1.5 py-0.5 rounded-md border border-amber-200">
                {member.mlmCode}
              </span>
            </button>
          )}

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-2xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition focus:outline-none"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                {initials}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-extrabold text-slate-800 leading-tight max-w-[140px] truncate">
                  {memberName}
                </span>
                <span className="text-[10px] font-mono font-semibold text-slate-500">
                  {memberCode}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200/90 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-black text-slate-900 truncate">{memberName}</p>
                    <p className="text-[11px] font-mono text-amber-600 font-semibold mt-0.5">{memberCode}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Sponsor: {sponsorCode}</p>
                  </div>

                  <div className="p-1 space-y-0.5 text-xs font-semibold text-slate-700">
                    <Link
                      href="/nextview/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 hover:text-amber-600 transition"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      href="/nextview/verification"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 hover:text-amber-600 transition"
                    >
                      <FileCheck className="w-4 h-4 text-slate-400" />
                      <span>Verification &amp; KYC</span>
                    </Link>
                    <Link
                      href="/nextview/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 hover:text-amber-600 transition"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Settings</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 transition text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── BODY: SIDEBAR + MAIN CONTENT ────────────────────────────────────── */}
      <div className="flex flex-1 w-full overflow-hidden">
        {/* DESKTOP SIDEBAR */}
        <aside
          className={`hidden lg:flex flex-col shrink-0 border-r border-slate-200/80 bg-white transition-all duration-300 ${
            sidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Collapse Toggle */}
          <div className="px-4 py-2.5 flex justify-end border-b border-slate-100">
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition text-xs flex items-center gap-1"
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            {NAV_GROUPS.map((group) => (
              <div key={group.group} className="space-y-1">
                {!sidebarCollapsed && (
                  <h4 className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {group.group}
                  </h4>
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPath === item.href || (item.href !== '/nextview/dashboard' && currentPath.startsWith(item.href));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                          isActive
                            ? 'bg-amber-50 text-amber-900 shadow-2xs font-extrabold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                        title={sidebarCollapsed ? item.name : undefined}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                        {!sidebarCollapsed && <span className="truncate">{item.name}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* MOBILE DRAWER SIDEBAR */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[80vw] bg-white h-full flex flex-col z-50 shadow-2xl animate-in slide-in-from-left duration-200">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Image
                    src="/logoTitle.png"
                    alt="NexVia Logo"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-xl object-contain shadow-xs"
                  />
                  <span className="font-black text-base text-slate-900">NexVia</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
                {NAV_GROUPS.map((group) => (
                  <div key={group.group} className="space-y-1">
                    <h4 className="px-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {group.group}
                    </h4>
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPath === item.href || (item.href !== '/nextview/dashboard' && currentPath.startsWith(item.href));

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                              isActive
                                ? 'bg-amber-50 text-amber-900 shadow-2xs font-extrabold'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                          >
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN VIEWPORT */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
