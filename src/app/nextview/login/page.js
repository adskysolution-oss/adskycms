'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialIdentifier = (searchParams?.get('identifier') || '').trim();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    identifier: initialIdentifier,
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/mlm/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Welcome back!');
        router.push('/nextview/dashboard');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch {
      toast.error('Network error.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/15 border border-blue-500/30 mb-4 p-2 shadow-lg shadow-blue-500/10">
            <Image
              src="/logoTitle.png"
              alt="NextView Logo"
              width={48}
              height={48}
              className="w-11 h-11 object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            NextView Login
          </h1>
          <p className="text-slate-400 mt-2">Sign in to your NextView account</p>
        </div>
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Mobile or Email
              </label>
              <input
                type="text"
                value={form.identifier}
                required
                onChange={(e) => setForm((f) => ({ ...f, identifier: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                placeholder="Enter mobile or email"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <Link
                  href={`/nextview/forgot-password${
                    form.identifier ? `?identifier=${encodeURIComponent(form.identifier.trim())}` : ''
                  }`}
                  className="text-xs font-medium text-blue-400 hover:text-blue-300 transition hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  required
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none pr-10"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Login to NextView'}
            </button>
            <p className="text-center text-slate-400 text-sm">
              Not a member?{' '}
              <Link href="/nextview/register" className="text-blue-400 hover:underline">
                Register here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function NextViewLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center px-4 text-white">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
