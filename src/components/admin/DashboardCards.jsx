'use client';
import { Users, FileText, Briefcase, ClipboardList, TrendingUp } from 'lucide-react';

export default function DashboardCards({ stats }) {
  const cards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'from-blue-600 to-blue-400',
      bgColor: 'bg-blue-50/60'
    },
    {
      label: 'Active Users',
      value: stats?.activeUsers || 0,
      icon: TrendingUp,
      color: 'from-emerald-600 to-emerald-400',
      bgColor: 'bg-emerald-50/60'
    },
    {
      label: 'Total Blogs',
      value: stats?.totalBlogs || 0,
      icon: FileText,
      color: 'from-purple-600 to-purple-400',
      bgColor: 'bg-purple-50/60'
    },
    {
      label: 'Total Jobs',
      value: stats?.totalJobs || 0,
      icon: Briefcase,
      color: 'from-amber-600 to-amber-400',
      bgColor: 'bg-amber-50/60'
    },
    {
      label: 'Applications',
      value: stats?.totalApplications || 0,
      icon: ClipboardList,
      color: 'from-rose-600 to-rose-400',
      bgColor: 'bg-rose-50/60'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`${card.bgColor} border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:border-slate-300 transition-all duration-300`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">{card.label}</p>
                <h3 className="text-3xl font-bold mt-2 text-slate-900">{card.value.toLocaleString()}</h3>
              </div>
              <div className={`bg-gradient-to-br ${card.color} p-3 rounded-xl shadow-xs`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
