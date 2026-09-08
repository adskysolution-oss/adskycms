'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function RecruitmentLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ identifier: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch('/api/recruitment/auth/partner/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) { toast.success('Welcome back!'); router.push('/recruitment/dashboard'); }
      else toast.error(data.message);
    } catch { toast.error('Network error.'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/30 mb-4"><span className="text-3xl">🤝</span></div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Partner Login</h1>
          <p className="text-slate-400 mt-2">AdSky Recruitment Partner Portal</p>
        </div>
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div><label className="block text-sm font-medium text-slate-300 mb-1">Email or Mobile</label><input type="text" value={form.identifier} required onChange={e => setForm(f => ({...f, identifier: e.target.value}))} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none" placeholder="Enter email or mobile" /></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-1">Password</label><input type="password" value={form.password} required onChange={e => setForm(f => ({...f, password: e.target.value}))} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none" placeholder="Enter password" /></div>
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60">
              {loading ? 'Signing in...' : 'Login to Partner Portal'}
            </button>
            <p className="text-center text-slate-400 text-sm">New partner? <Link href="/recruitment/register" className="text-purple-400 hover:underline">Register here</Link></p>
          </form>
        </div>
      </div>
    </div>
  );
}
