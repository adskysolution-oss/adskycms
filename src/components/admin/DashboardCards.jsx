'use client';
import { Users, FileText, Briefcase, ClipboardList, TrendingUp } from 'lucide-react';

export default function DashboardCards({ stats }) {
  const cards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'from-blue-600 to-blue-400',
      bgColor: 'bg-blue-900/20'
    },
    {
      label: 'Active Users',
      value: stats?.activeUsers || 0,
      icon: TrendingUp,
      color: 'from-green-600 to-green-400',
      bgColor: 'bg-green-900/20'
    },
    {
      label: 'Total Blogs',
      value: stats?.totalBlogs || 0,
      icon: FileText,
      color: 'from-purple-600 to-purple-400',
      bgColor: 'bg-purple-900/20'
    },
    {
      label: 'Total Jobs',
      value: stats?.totalJobs || 0,
      icon: Briefcase,
      color: 'from-orange-600 to-orange-400',
      bgColor: 'bg-orange-900/20'
    },
    {
      label: 'Applications',
      value: stats?.totalApplications || 0,
      icon: ClipboardList,
      color: 'from-pink-600 to-pink-400',
      bgColor: 'bg-pink-900/20'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`${card.bgColor} border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all duration-300`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">{card.label}</p>
                <h3 className="text-3xl font-bold mt-2">{card.value.toLocaleString()}</h3>
              </div>
              <div className={`bg-gradient-to-br ${card.color} p-3 rounded-xl`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
