'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  FaRocket, FaBriefcase, FaUser, FaBookmark, 
  FaHistory, FaCog, FaSignOutAlt, FaChevronRight,
  FaBars, FaTimes, FaComments, FaChartLine
} from 'react-icons/fa';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      } else {
        router.push('/auth/login');
      }
    } catch {
      router.push('/auth/login');
    }
  };

  const getCandidateLinks = () => [
    { label: 'Overview', href: '/dashboard/candidate', icon: FaRocket },
    { label: 'My Applications', href: '/dashboard/candidate?tab=applications', icon: FaHistory },
    { label: 'Saved Jobs', href: '/dashboard/candidate?tab=saved', icon: FaBookmark },
    { label: 'Profile Settings', href: '/dashboard/candidate/profile', icon: FaUser },
  ];

  const getEmployerLinks = () => [
    { label: 'Overview', href: '/dashboard/employer', icon: FaChartLine },
    { label: 'Post a Job', href: '/dashboard/employer/jobs', icon: FaBriefcase },
    { label: 'Applicant Tracking', href: '/dashboard/employer?tab=ats', icon: FaHistory },
    { label: 'Company Profile', href: '/dashboard/employer/settings', icon: FaCog },
  ];

  const links = user?.role === 'employer' ? getEmployerLinks() : getCandidateLinks();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#020617] flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0b1220] border-r border-white/5 transition-transform duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-10">
            <Link href="/" className="text-xl font-black italic gradient-text">ADSKY DASH</Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-text-muted">
              <FaTimes />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {links.map((link) => {
              const active = pathname === link.href || (link.href.includes('tab') && pathname === link.href.split('?')[0]);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-all group ${
                    active 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'text-text-secondary hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <link.icon className={active ? 'text-white' : 'text-text-muted group-hover:text-primary-light'} size={18} />
                  {link.label}
                  {active && <FaChevronRight className="ml-auto opacity-50" size={10} />}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-white/5 space-y-2">
            <div className="flex items-center gap-3 px-4 py-3 mb-4 rounded-2xl bg-white/5">
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-black">
                 {user.name?.charAt(0)}
               </div>
               <div className="overflow-hidden">
                 <p className="text-sm font-bold text-white truncate">{user.name}</p>
                 <p className="text-[10px] text-text-muted uppercase tracking-widest">{user.role}</p>
               </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold text-danger hover:bg-danger/10 transition-all"
            >
              <FaSignOutAlt size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto">
        {/* Mobile Toggle */}
        <div className="lg:hidden p-4 sticky top-0 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 z-40">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg bg-white/5 text-white">
            <FaBars />
          </button>
        </div>
        
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
