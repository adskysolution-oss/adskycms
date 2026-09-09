'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/recruitment/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/recruitment/dashboard/jobs', label: 'Available Jobs', icon: '💼' },
  { href: '/recruitment/dashboard/candidates', label: 'My Candidates', icon: '👥' },
  { href: '/recruitment/dashboard/submit-candidate', label: 'Submit Candidate', icon: '➕' },
  { href: '/recruitment/dashboard/wallet', label: 'Wallet', icon: '💰' },
];

export default function RecruitmentDashboard() {
  const router = useRouter();
  const [partner, setPartner] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/recruitment/auth/partner/me').then(r => r.json()).then(d => {
      if (!d.success) { router.push('/recruitment/login'); return; }
      setPartner(d.partner); setWallet(d.wallet);
    }).catch(() => router.push('/recruitment/login')).finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/recruitment/auth/partner/logout', { method: 'POST' });
    router.push('/recruitment/login');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="min-h-screen flex bg-slate-50/50">
      <aside className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col fixed left-0 top-0 z-10 shadow-xs">
        <div className="p-6 border-b border-slate-200">
          <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">🤝 Recruitment</div>
          {partner && <div className="mt-2"><p className="text-slate-900 font-semibold text-sm">{partner.companyName}</p><p className="text-slate-500 text-xs font-mono">{partner.partnerCode}</p></div>}
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (<Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all text-sm font-medium"><span>{item.icon}</span><span>{item.label}</span></Link>))}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-rose-600 hover:bg-rose-50 transition-all w-full text-sm font-semibold">🚪 Logout</button>
        </div>
      </aside>
      <main className="ml-64 flex-1 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Welcome, {partner?.contactPerson}! 👋</h2>
            <div className={"inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full text-sm font-medium " + (partner?.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200')}>
              <span className="w-2 h-2 rounded-full bg-current"></span>{partner?.status === 'active' ? 'Active Partner' : 'Pending Approval'}
            </div>
          </div>
          {partner?.status !== 'active' && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
              <strong>⏳ Pending Approval</strong> — Your account is under review. You will be notified once approved.
            </div>
          )}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[{l:'Wallet Balance',v:'₹'+(wallet?.balance||0).toLocaleString(),c:'text-emerald-600'},{l:'Total Earned',v:'₹'+(wallet?.totalEarned||0).toLocaleString(),c:'text-blue-600'},{l:'Status',v:partner?.status||'N/A',c:'text-purple-600'},{l:'Partner Code',v:partner?.partnerCode||'N/A',c:'text-indigo-600'}].map(s => (
              <div key={s.l} className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-5 text-center"><div className={"text-lg font-bold " + s.c}>{s.v}</div><div className="text-slate-500 text-sm mt-1">{s.l}</div></div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/recruitment/dashboard/submit-candidate" className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 hover:border-purple-300 hover:shadow-md transition-all group">
              <div className="text-3xl mb-3">➕</div>
              <div className="font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">Submit a Candidate</div>
              <div className="text-slate-500 text-sm mt-1">Refer a candidate to an open job position</div>
            </Link>
            <Link href="/recruitment/dashboard/jobs" className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 hover:border-blue-300 hover:shadow-md transition-all group">
              <div className="text-3xl mb-3">💼</div>
              <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">View Open Jobs</div>
              <div className="text-slate-500 text-sm mt-1">Browse all active job openings</div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
