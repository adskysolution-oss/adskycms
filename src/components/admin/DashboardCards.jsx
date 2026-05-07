import { 
  Users, 
  FileText, 
  Briefcase, 
  CheckCircle 
} from 'lucide-react';

export default function DashboardCards({ stats }) {
  const cards = [
    { 
      name: 'Total Users', 
      value: stats?.totalUsers || 0, 
      icon: Users, 
      color: 'blue' 
    },
    { 
      name: 'Total Blogs', 
      value: stats?.totalBlogs || 0, 
      icon: FileText, 
      color: 'purple' 
    },
    { 
      name: 'Active Jobs', 
      value: stats?.totalJobs || 0, 
      icon: Briefcase, 
      color: 'emerald' 
    },
    { 
      name: 'Applications', 
      value: stats?.totalApplications || 0, 
      icon: CheckCircle, 
      color: 'amber' 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div 
            key={card.name}
            className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">{card.name}</p>
                <h3 className="text-3xl font-bold text-white">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-xl bg-${card.color}-500/10 text-${card.color}-400`}>
                <Icon size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
