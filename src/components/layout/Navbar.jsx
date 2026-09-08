'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import logoImg from '../../../public/logo.png';
import {
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaChevronDown,
  FaBriefcase,
  FaCog,
  FaHistory,
  FaBookmark,
  FaUsers,
  FaSearch,
  FaUserCircle,
} from 'react-icons/fa';
import { Briefcase, TrendingUp, Users, ChevronDown, ArrowRight } from 'lucide-react';

const mainNavLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  {
    label: 'Partners',
    isDropdown: true,
    items: [
      {
        title: 'Corporate Partner',
        desc: 'Regional agency hierarchy & kiosk verification',
        href: '/corporate-partner',
        icon: Briefcase,
        color: 'text-primary-light',
        bg: 'bg-primary/10',
      },
      {
        title: 'NexVia 3×15 Matrix',
        desc: 'Deterministic multi-level rewards network',
        href: '/nextview-network',
        icon: TrendingUp,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
      },
      {
        title: 'Recruitment Partner',
        desc: 'Talent sourcing & hiring pipeline portal',
        href: '/recruitment/login',
        icon: Users,
        color: 'text-sky-400',
        bg: 'bg-sky-500/10',
      },
    ],
  },
  { href: '/pricing', label: 'Pricing' },
  { href: '/projects', label: 'Projects' },
  { href: '/blogs', label: 'Blog' },
  { href: '/careers', label: 'Careers' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [partnerNavOpen, setPartnerNavOpen] = useState(false);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const partnerNavRef = useRef(null);
  const portalRef = useRef(null);

  const pathname = usePathname();
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  useEffect(() => {
    setIsOpen(false);
    setDropdownOpen(false);
    setPartnerNavOpen(false);
    setPortalDropdownOpen(false);
  }, [pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (partnerNavRef.current && !partnerNavRef.current.contains(event.target)) {
        setPartnerNavOpen(false);
      }
      if (portalRef.current && !portalRef.current.contains(event.target)) {
        setPortalDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownRef, partnerNavRef, portalRef]);

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isPartnerActive = () => {
    return (
      pathname.startsWith('/corporate-partner') ||
      pathname.startsWith('/nextview-network') ||
      pathname.startsWith('/recruitment')
    );
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/');
    } catch (err) {
      console.error(err);
    }
  };

  const getEmployerLinks = () => [
    { label: 'Overview', href: '/dashboard/employer', icon: FaBriefcase },
    { label: 'Post a Job', href: '/dashboard/employer?tab=post-job', icon: FaBriefcase },
    { label: 'Hiring Pipeline', href: '/dashboard/employer?tab=ats', icon: FaUsers },
    { label: 'Job Inventory', href: '/dashboard/employer?tab=jobs', icon: FaBriefcase },
    { label: 'Talent Search', href: '/dashboard/employer?tab=search', icon: FaSearch },
    { label: 'Company Profile', href: '/dashboard/employer/settings', icon: FaCog },
  ];

  const getCandidateLinks = () => [
    { label: 'Dashboard', href: '/dashboard/candidate', icon: FaBriefcase },
    { label: 'Applied Jobs', href: '/dashboard/candidate?tab=applications', icon: FaHistory },
    { label: 'Saved Jobs', href: '/dashboard/candidate?tab=saved', icon: FaBookmark },
    { label: 'Profile', href: '/dashboard/candidate/profile', icon: FaUserCircle },
  ];

  const getAdminLinks = () => [
    { label: 'Admin Panel', href: '/admin/dashboard', icon: FaCog },
  ];

  const roleLinks = user?.role === 'employer'
    ? getEmployerLinks()
    : user?.role === 'admin'
      ? getAdminLinks()
      : getCandidateLinks();

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#020617]/75 backdrop-blur-xl">
      <div className="container-custom">
        <div className="flex h-20 items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image
              src={logoImg}
              alt="AdSky Solution Logo"
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>

          {/* Main Nav Links (Compact & Centered) */}
          <nav className="hidden lg:flex items-center gap-0.5 rounded-full border border-white/5 bg-white/5 px-2 py-1.5">
            {mainNavLinks.map((link) => {
              if (link.isDropdown) {
                const partnerActive = isPartnerActive();
                return (
                  <div
                    key={link.label}
                    className="relative"
                    ref={partnerNavRef}
                    onMouseEnter={() => setPartnerNavOpen(true)}
                    onMouseLeave={() => setPartnerNavOpen(false)}
                  >
                    <button
                      onClick={() => setPartnerNavOpen(!partnerNavOpen)}
                      className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all duration-300 rounded-full ${
                        partnerActive || partnerNavOpen
                          ? 'text-white bg-white/10'
                          : 'text-text-secondary hover:text-white'
                      }`}
                    >
                      <span>{link.label}</span>
                      <ChevronDown
                        size={12}
                        className={`transition-transform duration-300 ${partnerNavOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {/* Partners Dropdown */}
                    {partnerNavOpen && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 rounded-2xl border border-white/10 bg-[#0b1220]/95 p-2 shadow-2xl backdrop-blur-xl z-50 animate-fade-in space-y-1">
                        {link.items.map((item) => (
                          <Link
                            key={item.title}
                            href={item.href}
                            className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all group"
                          >
                            <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center ${item.color} shrink-0 mt-0.5 group-hover:scale-110 transition-transform`}>
                              <item.icon size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-white group-hover:text-primary-light transition-colors">
                                {item.title}
                              </p>
                              <p className="text-[10px] text-text-muted truncate">
                                {item.desc}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-1.5 text-xs font-semibold transition-all duration-300 whitespace-nowrap ${
                    active ? 'text-white' : 'text-text-secondary hover:text-white'
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute left-2.5 right-2.5 -bottom-0.5 h-0.5 rounded-full bg-primary-light transition-all duration-300 ${
                      active ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right Section: Auth / Portals */}
          <div className="flex items-center gap-2.5 shrink-0">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all group"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-white leading-none mb-0.5">{user.name}</p>
                    <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold leading-none">{user.role}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-black shadow-lg shadow-primary/20">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <FaChevronDown size={10} className={`text-text-muted transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Account Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-white/10 bg-[#0b1220]/95 p-2 shadow-2xl backdrop-blur-xl animate-fade-in">
                    <div className="px-3 py-2 mb-2 border-b border-white/5">
                      <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Account Menu</p>
                    </div>

                    {roleLinks.map((rLink, idx) => rLink.href ? (
                      <Link
                        key={idx}
                        href={rLink.href}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-secondary hover:text-white hover:bg-white/5 transition-all group"
                      >
                        <rLink.icon size={16} className="text-text-muted group-hover:text-primary-light transition-colors" />
                        {rLink.label}
                      </Link>
                    ) : (
                      <button
                        key={idx}
                        onClick={rLink.onClick}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group w-full ${rLink.danger ? 'text-danger hover:bg-danger/10' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
                      >
                        <rLink.icon size={16} className={`text-text-muted transition-colors ${rLink.danger ? 'group-hover:text-danger' : 'group-hover:text-primary-light'}`} />
                        {rLink.label}
                      </button>
                    ))}

                    <div className="mt-2 pt-2 border-t border-white/5">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-danger hover:bg-danger/10 transition-all"
                      >
                        <FaSignOutAlt size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                {/* Portals Button with Dropdown */}
                <div className="relative" ref={portalRef}>
                  <button
                    onClick={() => setPortalDropdownOpen(!portalDropdownOpen)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all"
                  >
                    <span>Portals</span>
                    <FaChevronDown size={9} className={`text-text-muted transition-transform duration-300 ${portalDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {portalDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-white/10 bg-[#0b1220]/95 p-3 shadow-2xl backdrop-blur-xl space-y-3 z-50 animate-fade-in">
                      {/* NexVia Matrix */}
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-amber-400 uppercase tracking-wider px-2">NexVia 3×15 Matrix</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          <Link href="/nextview/login" className="flex items-center justify-center py-2 px-2 rounded-xl text-text-secondary hover:text-white bg-white/5 hover:bg-white/10 transition-colors font-bold text-[11px] border border-white/5">
                            Login
                          </Link>
                          <Link href="/nextview/register" className="flex items-center justify-center py-2 px-2 rounded-xl text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-colors font-bold text-[11px]">
                            Join Network
                          </Link>
                        </div>
                      </div>

                      <div className="h-px bg-white/5"></div>

                      {/* Corporate Partner */}
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-primary-light uppercase tracking-wider px-2">Corporate Partner</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          <Link href="/corporate-partner" className="flex items-center justify-center py-2 px-2 rounded-xl text-text-secondary hover:text-white bg-white/5 hover:bg-white/10 transition-colors font-bold text-[11px] border border-white/5">
                            Details
                          </Link>
                          <Link href="/nextview/register" className="flex items-center justify-center py-2 px-2 rounded-xl text-white btn-primary transition-colors font-bold text-[11px]">
                            Register
                          </Link>
                        </div>
                      </div>

                      <div className="h-px bg-white/5"></div>

                      {/* Recruitment */}
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-wider px-2">Recruitment Partner</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          <Link href="/recruitment/login" className="flex items-center justify-center py-2 px-2 rounded-xl text-text-secondary hover:text-white bg-white/5 hover:bg-white/10 transition-colors font-bold text-[11px] border border-white/5">
                            Login
                          </Link>
                          <Link href="/recruitment/register" className="flex items-center justify-center py-2 px-2 rounded-xl text-text-secondary hover:text-white bg-white/5 hover:bg-white/10 transition-colors font-bold text-[11px] border border-white/5">
                            Register
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Link href="/auth/join" className="btn-primary !rounded-full !px-4 !py-1.5 text-xs font-bold">
                  Get Started
                </Link>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsOpen((value) => !value)}
              className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white"
              aria-label="Toggle navigation"
            >
              {isOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="lg:hidden pb-5">
            <div className="rounded-2xl border border-white/10 bg-[#0b1220]/95 p-4 shadow-lg shadow-black/20 space-y-4">
              <nav className="grid gap-1">
                {mainNavLinks.map((link) => {
                  if (link.isDropdown) {
                    return (
                      <div key={link.label} className="space-y-1 py-1">
                        <p className="px-4 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                          {link.label}
                        </p>
                        <div className="grid gap-1 pl-2">
                          {link.items.map((sub) => (
                            <Link
                              key={sub.title}
                              href={sub.href}
                              className="rounded-xl px-4 py-2 text-sm font-medium text-text-secondary hover:bg-white/5 hover:text-white flex items-center justify-between"
                            >
                              <span>{sub.title}</span>
                              <ArrowRight size={14} className="text-text-muted" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                        active
                          ? 'bg-primary/20 text-white border border-primary/30'
                          : 'text-text-secondary hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="h-px bg-white/5"></div>

              {/* Mobile Quick Portals */}
              <div className="space-y-3 pt-1">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-primary-light uppercase tracking-wider">Corporate Partner</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/corporate-partner" className="py-2 px-3 rounded-xl bg-white/5 text-center text-xs font-bold text-white border border-white/10">
                      Learn More
                    </Link>
                    <Link href="/nextview/register" className="py-2 px-3 rounded-xl btn-primary text-center text-xs font-bold">
                      Register
                    </Link>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-amber-400 uppercase tracking-wider">NexVia 3×15 Matrix</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/nextview/login" className="py-2 px-3 rounded-xl bg-white/5 text-center text-xs font-bold text-white border border-white/10">
                      Member Login
                    </Link>
                    <Link href="/nextview/register" className="py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-center text-xs font-bold text-white">
                      Join Network
                    </Link>
                  </div>
                </div>
              </div>

              {!user && (
                <Link href="/auth/join" className="btn-primary w-full justify-center !rounded-xl !py-2.5 text-sm font-bold mt-2">
                  Get Started
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
