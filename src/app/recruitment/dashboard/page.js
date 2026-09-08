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
    <div className="min-h-screen flex">
      <aside className="w-64 bg-slate-950/80 border-r border-slate-800 min-h-screen flex flex-col fixed left-0 top-0 z-10">
        <div className="p-6 border-b border-slate-800">
          <div className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">🤝 Recruitment</div>
          {partner && <div className="mt-2"><p className="text-white font-medium text-sm">{partner.companyName}</p><p className="text-slate-400 text-xs">{partner.partnerCode}</p></div>}
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (<Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-sm font-medium"><span>{item.icon}</span><span>{item.label}</span></Link>))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-all w-full text-sm">🚪 Logout</button>
        </div>
      </aside>
      <main className="ml-64 flex-1 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Welcome, {partner?.contactPerson}! 👋</h2>
            <div className={"inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full text-sm " + (partner?.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400')}>
              <span className="w-2 h-2 rounded-full bg-current"></span>{partner?.status === 'active' ? 'Active Partner' : 'Pending Approval'}
            </div>
          </div>
          {partner?.status !== 'active' && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <strong>⏳ Pending Approval</strong> — Your account is under review. You will be notified once approved.
            </div>
          )}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[{l:'Wallet Balance',v:'₹'+(wallet?.balance||0).toLocaleString(),c:'text-green-400'},{l:'Total Earned',v:'₹'+(wallet?.totalEarned||0).toLocaleString(),c:'text-blue-400'},{l:'Status',v:partner?.status||'N/A',c:'text-purple-400'},{l:'Partner Code',v:partner?.partnerCode||'N/A',c:'text-pink-400'}].map(s => (
              <div key={s.l} className="glass-card p-5 text-center"><div className={"text-lg font-bold " + s.c}>{s.v}</div><div className="text-slate-400 text-sm mt-1">{s.l}</div></div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/recruitment/dashboard/submit-candidate" className="glass-card p-6 hover:border-purple-500/40 transition-all group">
              <div className="text-3xl mb-3">➕</div>
              <div className="font-semibold text-white group-hover:text-purple-400 transition-colors">Submit a Candidate</div>
              <div className="text-slate-400 text-sm mt-1">Refer a candidate to an open job position</div>
            </Link>
            <Link href="/recruitment/dashboard/jobs" className="glass-card p-6 hover:border-blue-500/40 transition-all group">
              <div className="text-3xl mb-3">💼</div>
              <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">View Open Jobs</div>
              <div className="text-slate-400 text-sm mt-1">Browse all active job openings</div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
