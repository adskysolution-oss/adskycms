'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { FaBars, FaTimes, FaUserCircle, FaSignOutAlt, FaChevronDown, FaBriefcase, FaUserTie, FaCog, FaHistory, FaBookmark, FaUsers, FaSearch } from 'react-icons/fa';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
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
  const dropdownRef = useRef(null);
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
  }, [pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const getEmployerLinks = () => [
    { label: 'Intelligence Hub', href: '/dashboard/employer', icon: FaBriefcase },
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
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#020617]/55 backdrop-blur-xl">

      <div className="container-custom">
        <div className="flex h-20 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="AdSky Solution Logo"
              width={140}
              height={40}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>

          {/* Main Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 rounded-full border border-white/5 bg-white/5 px-2 py-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const isBlog = link.label === 'Blog';
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 text-[13px] font-medium transition-all duration-300 ${
                    active ? 'text-white' : 'text-text-secondary hover:text-white'
                  } ${isBlog ? 'hidden xl:block' : ''}`}
                >
                  {link.label}
                  <span
                    className={`absolute left-4 right-4 -bottom-0.5 h-0.5 rounded-full bg-white transition-all duration-300 ${
                      active ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right Section: Auth State */}
          <div className="flex items-center gap-4">
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

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-white/10 bg-[#0b1220]/95 p-2 shadow-2xl backdrop-blur-xl animate-fade-in">
                    <div className="px-3 py-2 mb-2 border-b border-white/5">
                      <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Account Menu</p>
                    </div>

                    {roleLinks.map((link, idx) => link.href ? (
                      <Link
                        key={idx}
                        href={link.href}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-secondary hover:text-white hover:bg-white/5 transition-all group"
                      >
                        <link.icon size={16} className="text-text-muted group-hover:text-primary-light transition-colors" />
                        {link.label}
                      </Link>
                    ) : (
                      <button
                        key={idx}
                        onClick={link.onClick}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group w-full ${link.danger ? 'text-danger hover:bg-danger/10' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
                      >
                        <link.icon size={16} className={`text-text-muted transition-colors ${link.danger ? 'group-hover:text-danger' : 'group-hover:text-primary-light'}`} />
                        {link.label}
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
              <div className="hidden md:block">
                <Link href="/auth/join" className="btn-primary !rounded-full !px-6 !py-2.5 text-sm">
                  Get Started
                </Link>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsOpen((value) => !value)}
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white"
              aria-label="Toggle navigation"
            >
              {isOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="lg:hidden pb-5">
            <div className="rounded-2xl border border-white/10 bg-[#0b1220]/95 p-3 shadow-lg shadow-black/20">
              <nav className="grid gap-1">

                {navLinks.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${active
                        ? 'bg-white/10 text-white'
                        : 'text-text-secondary hover:bg-white/5 hover:text-white'
                        }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                {!user && (
                  <Link href="/auth/join" className="btn-primary mt-2 w-full justify-center !rounded-xl">
                    Get Started
                  </Link>
                )}
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
