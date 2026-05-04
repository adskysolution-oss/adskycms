'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaEnvelope, FaLock, FaArrowRight, FaSpinner, FaExclamationCircle } from 'react-icons/fa';

export default function LoginPage() {
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
    <div className="min-h-screen flex items-center justify-center pt-20 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,1)_0%,rgba(0,0,0,1)_100%)]" />
      <div className="glow-dot bg-primary top-1/4 left-1/4 opacity-20" />
      <div className="glow-dot bg-secondary bottom-1/4 right-1/4 opacity-20" />

      <div className="w-full max-w-md relative z-10">
        <div className="glass-card p-8 md:p-10 border border-white/10 shadow-2xl">
          <div className="text-center mb-10">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg">AS</div>
              <span className="text-xl font-bold text-text-primary">AdSky Solution</span>
            </Link>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Welcome Back</h1>
            <p className="text-text-secondary">Enter your credentials to access your account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex items-center gap-3">
              <FaExclamationCircle className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative group">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                <input 
                  type="email" 
                  required
                  placeholder="name@company.com"
                  className="w-full bg-dark border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-text-primary focus:outline-none focus:border-primary/50 transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Password</label>
                <Link href="#" className="text-xs text-primary-light hover:underline">Forgot password?</Link>
              </div>
              <div className="relative group">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full bg-dark border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-text-primary focus:outline-none focus:border-primary/50 transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full justify-center !py-4 text-lg shadow-xl shadow-primary/20"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <>Sign In <FaArrowRight size={14} className="ml-2" /></>}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-text-secondary text-sm">
              Don&apos;t have an account? <Link href="/auth/register" className="text-primary-light font-bold hover:underline">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
