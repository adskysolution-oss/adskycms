'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaEnvelope, FaLock, FaArrowRight, FaSpinner, FaExclamationCircle } from 'react-icons/fa';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      // Redirect based on role
      const role = data.user.role;
      if (role === 'admin') router.push('/admin');
      else if (role === 'employer') router.push('/dashboard/employer');
      else router.push('/dashboard/candidate');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm relative z-10">
      <div className="glass-card p-6 md:p-8 border border-white/10 shadow-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg text-sm">AS</div>
            <span className="text-lg font-bold text-text-primary">AdSky Solution</span>
          </Link>
          <h1 className="text-2xl font-bold text-text-primary mb-1 tracking-tight">Welcome Back</h1>
          <p className="text-text-secondary text-xs">Enter credentials to access account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-[10px] font-bold flex items-center gap-2">
            <FaExclamationCircle className="flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
            <div className="relative group">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors text-xs" />
              <input
                type="email"
                required
                placeholder="name@company.com"
                className="w-full bg-dark border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm text-text-primary focus:outline-none focus:border-primary/50 transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Password</label>
              <Link href="#" className="text-[10px] text-primary-light hover:underline font-bold">Forgot?</Link>
            </div>
            <div className="relative group">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors text-xs" />
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-dark border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm text-text-primary focus:outline-none focus:border-primary/50 transition-all"
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
            {loading ? <FaSpinner className="animate-spin" /> : <>Sign In <FaArrowRight size={12} className="ml-2" /></>}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-text-secondary text-xs">
            Don&apos;t have an account? <Link href="/auth/register" className="text-primary-light font-bold hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-20 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,1)_0%,rgba(0,0,0,1)_100%)]" />
      <div className="glow-dot bg-primary top-1/4 left-1/4 opacity-20" />
      <div className="glow-dot bg-secondary bottom-1/4 right-1/4 opacity-20" />

      <Suspense fallback={<div className="flex justify-center py-20"><FaSpinner className="animate-spin text-primary" size={32} /></div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
