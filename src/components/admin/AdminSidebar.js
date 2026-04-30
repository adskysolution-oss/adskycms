'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FaTachometerAlt, FaCog, FaBlog, FaImage, FaUsers, FaProjectDiagram,
  FaDollarSign, FaUserFriends, FaSignOutAlt, FaBars, FaTimes, FaChevronLeft, FaEye,
} from 'react-icons/fa';

const menuItems = [
  { href: '/admin/dashboard', icon: FaTachometerAlt, label: 'Dashboard' },
  { href: '/admin/services', icon: FaCog, label: 'Services' },
  { href: '/admin/team', icon: FaUserFriends, label: 'Team' },
  { href: '/admin/projects', icon: FaProjectDiagram, label: 'Projects' },
  { href: '/admin/pricing', icon: FaDollarSign, label: 'Pricing' },
  { href: '/admin/blogs', icon: FaBlog, label: 'Blogs' },
  { href: '/admin/media', icon: FaImage, label: 'Media' },
  { href: '/admin/users', icon: FaUsers, label: 'Users' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => {
      if (d.user) setUser(d.user);
    }).catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">AS</div>
          {!collapsed && <span className="text-sm font-bold text-text-primary">AdSky Admin</span>}
        </Link>
        <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:block text-text-muted hover:text-text-primary">
          <FaChevronLeft size={12} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              pathname.startsWith(href)
                ? 'bg-primary/15 text-primary-light'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
            }`}
          >
            <Icon size={16} />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all">
          <FaEye size={16} />
          {!collapsed && <span>View Site</span>}
        </a>
      </nav>

      <div className="p-3 border-t border-border space-y-1">
        {user && !collapsed && (
          <div className="px-3 py-2 text-xs text-text-muted truncate">{user.name} ({user.role})</div>
        )}
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-secondary hover:text-danger hover:bg-danger/10 w-full transition-all">
          <FaSignOutAlt size={16} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button onClick={() => setMobileOpen(true)} className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-surface border border-border text-text-primary">
        <FaBars size={18} />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-dark-light border-r border-border z-50">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-text-muted">
              <FaTimes size={18} />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      <aside className={`hidden lg:block fixed left-0 top-0 bottom-0 bg-dark-light border-r border-border transition-all duration-300 z-30 ${collapsed ? 'w-16' : 'w-60'}`}>
        {sidebarContent}
      </aside>
    </>
  );
}
