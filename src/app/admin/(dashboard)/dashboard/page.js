'use client';

import { useState, useEffect } from 'react';
import { FaCog, FaBlog, FaImage, FaUsers, FaProjectDiagram, FaDollarSign, FaUserFriends, FaArrowUp, FaEye } from 'react-icons/fa';

const statCards = [
  { key: 'services', icon: FaCog, label: 'Services', color: 'from-primary to-purple-500' },
  { key: 'blogs', icon: FaBlog, label: 'Blog Posts', color: 'from-secondary to-emerald-500' },
  { key: 'projects', icon: FaProjectDiagram, label: 'Projects', color: 'from-accent to-orange-500' },
  { key: 'team', icon: FaUserFriends, label: 'Team Members', color: 'from-pink-500 to-rose-500' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState({ services: 0, blogs: 0, projects: 0, team: 0 });

  useEffect(() => {
    Promise.all([
      fetch('/api/services').then((r) => r.json()),
      fetch('/api/blogs?admin=true').then((r) => r.json()),
      fetch('/api/projects').then((r) => r.json()),
      fetch('/api/team').then((r) => r.json()),
    ]).then(([s, b, p, t]) => {
      setStats({
        services: s.services?.length || 0,
        blogs: b.pagination?.total || b.blogs?.length || 0,
        projects: p.projects?.length || 0,
        team: t.members?.length || 0,
      });
    }).catch(() => {});
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary text-sm mt-1">Welcome back! Here&apos;s an overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map(({ key, icon: Icon, label, color }) => (
          <div key={key} className="glass-card p-6 hover:border-primary/20 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                <Icon className="text-white" size={18} />
              </div>
              <span className="flex items-center gap-1 text-success text-xs font-medium">
                <FaArrowUp size={10} /> Active
              </span>
            </div>
            <div className="text-3xl font-bold text-text-primary">{stats[key]}</div>
            <div className="text-text-muted text-sm mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Services', href: '/admin/services', icon: FaCog },
            { label: 'New Blog', href: '/admin/blogs', icon: FaBlog },
            { label: 'Upload Media', href: '/admin/media', icon: FaImage },
            { label: 'View Site', href: '/', icon: FaEye },
          ].map(({ label, href, icon: Icon }) => (
            <a key={href} href={href} className="flex items-center gap-3 p-4 rounded-xl bg-surface hover:bg-surface-light border border-border hover:border-primary/30 transition-all">
              <Icon className="text-primary-light" size={16} />
              <span className="text-text-secondary text-sm font-medium">{label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
