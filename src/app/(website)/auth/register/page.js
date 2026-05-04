'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaUser, FaEnvelope, FaLock, FaArrowRight, FaSpinner, FaExclamationCircle, FaBriefcase, FaUserTie } from 'react-icons/fa';

export default function RegisterPage() {
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
    <div className="min-h-screen flex items-center justify-center pt-24 pb-12 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,1)_0%,rgba(0,0,0,1)_100%)]" />
      <div className="glow-dot bg-primary top-1/4 right-1/4 opacity-20" />
      <div className="glow-dot bg-secondary bottom-1/4 left-1/4 opacity-20" />

      <div className="w-full max-w-lg relative z-10">
        <div className="glass-card p-6 md:p-10 border border-white/10 shadow-2xl">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg text-sm">AS</div>
              <span className="text-lg font-bold text-text-primary">AdSky Solution</span>
            </Link>
            <h1 className="text-2xl font-bold text-text-primary mb-1">Create Account</h1>
            <p className="text-text-secondary text-xs uppercase tracking-tighter font-bold">Join as a {role}</p>
          </div>

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <button
              onClick={() => setRole('candidate')}
              className={`p-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${role === 'candidate' ? 'bg-primary/20 border-primary text-primary-light' : 'bg-white/5 border-white/5 text-text-muted hover:bg-white/10'
                }`}
            >
              <FaUserTie size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Candidate</span>
            </button>
            <button
              onClick={() => setRole('employer')}
              className={`p-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${role === 'employer' ? 'bg-secondary/20 border-secondary text-secondary-light' : 'bg-white/5 border-white/5 text-text-muted hover:bg-white/10'
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
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
              <div className="relative group">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors text-xs" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full bg-dark border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm text-text-primary focus:outline-none focus:border-primary/50 transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

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
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">Password</label>
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
              {loading ? <FaSpinner className="animate-spin" /> : <>Create Account <FaArrowRight size={12} className="ml-2" /></>}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-text-secondary text-xs">
              Already have an account? <Link href="/auth/login" className="text-primary-light font-bold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
