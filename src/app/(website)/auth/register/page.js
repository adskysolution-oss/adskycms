'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaUser, FaEnvelope, FaLock, FaArrowRight, FaSpinner, FaExclamationCircle, FaBriefcase, FaUserTie } from 'react-icons/fa';
import Link from 'next/link';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState('candidate');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'employer' || roleParam === 'candidate') {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      // Redirect based on role
      if (role === 'employer') router.push('/dashboard/employer');
      else router.push('/dashboard/candidate');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg relative z-10">
      <div className="glass-card p-6 md:p-10 border border-slate-200/80 shadow-xl bg-white rounded-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg text-sm">AS</div>
            <span className="text-lg font-bold text-slate-900">AdSky Solution</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Create Account</h1>
          <p className="text-slate-600 text-xs uppercase tracking-tighter font-bold">Join as a {role}</p>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button
            onClick={() => setRole('candidate')}
            className={`p-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${
              role === 'candidate' ? 'bg-blue-50 border-primary text-primary font-bold shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FaUserTie size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Candidate</span>
          </button>
          <button
            onClick={() => setRole('employer')}
            className={`p-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${
              role === 'employer' ? 'bg-amber-50 border-amber-500 text-amber-700 font-bold shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FaBriefcase size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Employer</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex items-center gap-3">
            <FaExclamationCircle className="flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
            <div className="relative group">
              <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-xs" />
              <input
                type="text"
                required
                placeholder="John Doe"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-primary transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
            <div className="relative group">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-xs" />
              <input
                type="email"
                required
                placeholder="name@company.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-primary transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-1.5 ml-1">Password</label>
            <div className="relative group">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-xs" />
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-primary transition-all"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center !py-3 text-sm shadow-xl shadow-primary/20 mt-4"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <>Create Account <FaArrowRight size={12} className="ml-2" /></>}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-600 text-xs">
            Already have an account? <Link href="/auth/login" className="text-primary font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-12 px-4 bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <Suspense fallback={<div className="flex justify-center py-20"><FaSpinner className="animate-spin text-primary" size={32} /></div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
