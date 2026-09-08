'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  FaTachometerAlt, FaCog, FaBlog, FaImage, FaUsers, FaProjectDiagram,
  FaDollarSign, FaUserFriends, FaSignOutAlt, FaBars, FaTimes, FaChevronLeft, 
  FaEye, FaEnvelope, FaBriefcase, FaFileAlt, FaTags, FaFolder, FaChevronDown,
  FaBuilding, FaCheckCircle, FaMoneyBillWave, FaShareAlt, FaAward, FaSlidersH,
  FaWallet, FaCreditCard, FaChartBar, FaGraduationCap, FaFileSignature, FaBell,
  FaHistory, FaShieldAlt
} from 'react-icons/fa';

const menuGroups = [
  {
    title: 'Dashboard',
    icon: FaTachometerAlt,
    href: '/admin/dashboard',
  },
  {
    title: 'MLM & FD PLATFORM',
    icon: FaProjectDiagram,
    items: [
      { href: '/admin/mlm', icon: FaTachometerAlt, label: 'MLM Overview' },
      { href: '/admin/mlm/members', icon: FaUsers, label: 'MLM Members' },
      { href: '/admin/mlm/kyc', icon: FaShieldAlt, label: 'KYC Verification' },
      { href: '/admin/mlm/fd', icon: FaCreditCard, label: 'FD Applications' },
      { href: '/admin/mlm/matrix', icon: FaProjectDiagram, label: '3×15 Matrix' },
      { href: '/admin/mlm/rewards', icon: FaAward, label: 'MLM Rewards' },
      { href: '/admin/mlm/levels', icon: FaSlidersH, label: 'Level 1–15 Config' },
      { href: '/admin/mlm/wallet', icon: FaWallet, label: 'MLM Wallet' },
      { href: '/admin/mlm/withdrawals', icon: FaMoneyBillWave, label: 'Withdrawal Payouts' },
      { href: '/admin/mlm/payments', icon: FaDollarSign, label: 'Platform Payments' },
      { href: '/admin/mlm/configuration', icon: FaCog, label: 'Payment Config' },
      { href: '/admin/mlm/reports', icon: FaChartBar, label: 'MLM Reports' },
      { href: '/admin/mlm/training', icon: FaGraduationCap, label: 'Training & Marketing' },
      { href: '/admin/mlm/cms', icon: FaFileSignature, label: 'MLM CMS' },
      { href: '/admin/mlm/notifications', icon: FaBell, label: 'MLM Notifications' },
      { href: '/admin/mlm/audit-logs', icon: FaHistory, label: 'MLM Audit Logs' },
    ],
  },
  {
    title: 'Agency Recruitment',
    icon: FaBriefcase,
    items: [
      { href: '/admin/recruitment', icon: FaTachometerAlt, label: 'Recruitment Overview' },
      { href: '/admin/recruitment/partners', icon: FaBuilding, label: 'Partner Agencies' },
      { href: '/admin/recruitment/candidates', icon: FaUserFriends, label: 'Candidates Pipeline' },
      { href: '/admin/recruitment/jobs', icon: FaBriefcase, label: 'Client Openings' },
    ],
  },
  {
    title: 'Content Management',
    icon: FaFolder,
    items: [
      { href: '/admin/services', icon: FaBriefcase, label: 'Services' },
      { href: '/admin/projects', icon: FaProjectDiagram, label: 'Projects' },
      { href: '/admin/blog', icon: FaBlog, label: 'Blog Posts' },
      { href: '/admin/categories', icon: FaTags, label: 'Categories' },
      { href: '/admin/media', icon: FaImage, label: 'Media Library' },
      { href: '/admin/legal-pages', icon: FaFileAlt, label: 'Legal Pages' },
      { href: '/admin/users', icon: FaUsers, label: 'Users' },
    ],
  },
  {
    title: 'Inquiries',
    icon: FaEnvelope,
    href: '/admin/contacts',
  },
  {
    title: 'Settings',
    icon: FaCog,
    href: '/admin/settings',
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState({
    'MLM & FD PLATFORM': true,
    'Agency Recruitment': false,
    'Content Management': false,
  });

  // Expand group if active page is within it
  useEffect(() => {
    menuGroups.forEach((group) => {
      if (group.items) {
        const hasActive = group.items.some((item) => pathname === item.href || (item.href !== '/admin/mlm' && pathname.startsWith(item.href)));
        if (hasActive) {
          setOpenGroups((prev) => ({ ...prev, [group.title]: true }));
        }
      }
    });
  }, [pathname]);

  const toggleGroup = (title) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed bottom-5 right-5 z-50 p-3 bg-amber-500 text-slate-950 rounded-full shadow-lg hover:bg-amber-600 transition"
      >
        {mobileOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
      </button>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 left-0 h-screen z-40 flex flex-col bg-slate-950 border-r border-slate-800/80 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-72'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Top Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 shrink-0">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <Image
              src="/logoTitle.png"
              alt="AdSky Logo"
              width={32}
              height={32}
              className="w-8 h-8 rounded-xl object-contain shadow-xs shrink-0"
            />
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-sm text-white tracking-tight leading-none">
                  AdSky Solution
                </span>
                <span className="text-[10px] text-amber-400 font-mono font-bold mt-0.5">
                  Admin Command Center
                </span>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <FaChevronLeft className={`w-3.5 h-3.5 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2 select-none">
          {menuGroups.map((group) => {
            const Icon = group.icon;
            const isSingle = !group.items;
            const isActive = isSingle && pathname === group.href;
            const isOpen = openGroups[group.title];

            if (isSingle) {
              return (
                <Link
                  key={group.title}
                  href={group.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  } ${collapsed ? 'justify-center px-0' : ''}`}
                  title={collapsed ? group.title : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>{group.title}</span>}
                </Link>
              );
            }

            return (
              <div key={group.title} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.title)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-extrabold text-slate-400 hover:text-white hover:bg-slate-900/60 transition ${
                    collapsed ? 'justify-center px-0' : ''
                  }`}
                  title={collapsed ? group.title : undefined}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-amber-400 shrink-0" />
                    {!collapsed && <span>{group.title}</span>}
                  </div>
                  {!collapsed && (
                    <FaChevronDown className={`w-2.5 h-2.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {(!collapsed || mobileOpen) && isOpen && (
                  <div className="pl-3 space-y-0.5 border-l border-slate-800 ml-5 my-1">
                    {group.items.map((item) => {
                      const SubIcon = item.icon;
                      const isSubActive = pathname === item.href || (item.href !== '/admin/mlm' && pathname.startsWith(item.href));

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition ${
                            isSubActive
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                          }`}
                        >
                          <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-amber-400' : 'text-slate-500'}`} />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800/80 shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition ${
              collapsed ? 'justify-center px-0' : ''
            }`}
            title={collapsed ? 'Logout' : undefined}
          >
            <FaSignOutAlt className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
