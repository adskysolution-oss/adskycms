'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FaTachometerAlt, FaCog, FaBlog, FaImage, FaUsers, FaProjectDiagram,
  FaDollarSign, FaUserFriends, FaSignOutAlt, FaBars, FaTimes, FaChevronLeft, 
  FaEye, FaEnvelope, FaBriefcase, FaFileAlt, FaTags, FaFolder, FaChevronDown
} from 'react-icons/fa';

const menuGroups = [
  {
    title: 'Dashboard',
    icon: FaTachometerAlt,
    href: '/admin/dashboard',
  },
  {
    title: 'Content Management',
    icon: FaFolder,
    items: [
      { href: '/admin/services', icon: FaCog, label: 'Services' },
      { href: '/admin/projects', icon: FaProjectDiagram, label: 'Projects' },
      { href: '/admin/blogs', icon: FaBlog, label: 'Blogs' },
      { href: '/admin/team', icon: FaUserFriends, label: 'Team' },
    ],
  },
  {
    title: 'Careers Management',
    icon: FaBriefcase,
    items: [
      { href: '/admin/jobs', icon: FaBriefcase, label: 'Jobs' },
      { href: '/admin/applications', icon: FaFileAlt, label: 'Applications' },
      { href: '/admin/categories', icon: FaTags, label: 'Categories' },
    ],
  },
  {
    title: 'User Management',
    icon: FaUsers,
    items: [
      { href: '/admin/users', icon: FaUsers, label: 'Users' },
      { href: '/admin/contacts', icon: FaEnvelope, label: 'Contacts' },
    ],
  },
  {
    title: 'Media',
    icon: FaImage,
    href: '/admin/media',
  },
  {
    title: 'Settings',
    icon: FaCog,
    items: [
      { href: '/admin/pricing', icon: FaDollarSign, label: 'Pricing' },
      { href: '/admin/settings', icon: FaCog, label: 'General Settings' },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => {
      if (d.user) setUser(d.user);
    }).catch(() => {});
  }, []);

  // Role-based filtering logic
  const filteredGroups = menuGroups.filter(group => {
    if (!user) return false;
    const role = user.role;
    
    // Admin/Editor see everything
    if (role === 'admin' || role === 'editor') return true;
    
    // Employer view
    if (role === 'employer') {
      return ['Dashboard', 'Careers Management', 'Media'].includes(group.title);
    }
    
    // Candidate view (if applicable)
    if (role === 'candidate') {
      return ['Dashboard'].includes(group.title);
    }
    
    return false;
  }).map(group => {
    if (user?.role === 'employer' && group.title === 'Careers Management') {
      // Filter sub-items for employer
      return {
        ...group,
        items: group.items.filter(item => ['Jobs', 'Applications'].includes(item.label))
      };
    }
    return group;
  });

  // Initialize expanded groups based on current path
  useEffect(() => {
    const initialExpanded = {};
    menuGroups.forEach((group) => {
      if (group.items?.some(item => pathname.startsWith(item.href))) {
        initialExpanded[group.title] = true;
      }
    });
    setExpandedGroups(prev => ({ ...prev, ...initialExpanded }));
  }, [pathname]);

  const toggleGroup = (title) => {
    if (collapsed) {
      setCollapsed(false);
      setExpandedGroups({ [title]: true });
      return;
    }
    setExpandedGroups(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-dark-light select-none">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-primary/20">AS</div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-text-primary leading-tight">AdSky Solution</span>
              <span className="text-[10px] text-text-muted uppercase tracking-widest font-semibold">Admin Panel</span>
            </div>
          )}
        </Link>
        <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:block text-text-muted hover:text-text-primary transition-colors p-1.5 hover:bg-white/5 rounded-lg">
          <FaChevronLeft size={12} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {filteredGroups.map((group) => {
          const isSingle = !group.items;
          const isExpanded = expandedGroups[group.title];
          const isActive = isSingle ? pathname === group.href : group.items.some(item => pathname.startsWith(item.href));
          const Icon = group.icon;

          if (isSingle) {
            return (
              <Link
                key={group.title}
                href={group.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  pathname === group.href
                    ? 'bg-primary/20 text-primary-light shadow-sm shadow-primary/10'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}
              >
                <Icon size={18} className={pathname === group.href ? 'text-primary-light' : ''} />
                {!collapsed && <span>{group.title}</span>}
              </Link>
            );
          }

          return (
            <div key={group.title} className="space-y-1">
              <button
                onClick={() => toggleGroup(group.title)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive && !isExpanded
                    ? 'bg-primary/10 text-primary-light'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-primary-light' : ''} />
                  {!collapsed && <span>{group.title}</span>}
                </div>
                {!collapsed && (
                  <FaChevronDown size={10} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                )}
              </button>
              
              {!collapsed && isExpanded && (
                <div className="ml-4 pl-4 border-l border-white/5 space-y-1 mt-1 animate-fade-in">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                        pathname.startsWith(item.href)
                          ? 'text-primary-light bg-primary/10'
                          : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                      }`}
                    >
                      <item.icon size={14} />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <div className="pt-4 mt-4 border-t border-white/5">
          <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all">
            <FaEye size={18} />
            {!collapsed && <span>View Site</span>}
          </a>
        </div>
      </nav>

      <div className="p-4 border-t border-white/5 space-y-3 bg-dark/20">
        {user && !collapsed && (
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-surface border border-white/10 flex items-center justify-center text-[10px] font-bold text-primary-light">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-text-primary truncate">{user.name}</span>
              <span className="text-[10px] text-text-muted uppercase font-semibold">{user.role}</span>
            </div>
          </div>
        )}
        <button onClick={handleLogout} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-text-secondary hover:text-danger hover:bg-danger/10 w-full transition-all group">
          <FaSignOutAlt size={18} className="group-hover:scale-110 transition-transform" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button onClick={() => setMobileOpen(true)} className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-surface border border-white/10 text-text-primary shadow-xl">
        <FaBars size={18} />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-dark-light border-r border-white/10 z-50 animate-slide-right">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-text-muted hover:text-text-primary">
              <FaTimes size={18} />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      <aside className={`hidden lg:block fixed left-0 top-0 bottom-0 bg-dark-light border-r border-white/5 transition-all duration-300 z-30 ${collapsed ? 'w-20' : 'w-64'}`}>
        {sidebarContent}
      </aside>
    </>
  );
}
