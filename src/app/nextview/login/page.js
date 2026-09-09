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
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50/50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 mb-4 p-2 shadow-sm">
            <Image
              src="/logoTitle.png"
              alt="NextView Logo"
              width={48}
              height={48}
              className="w-11 h-11 object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            NextView Login
          </h1>
          <p className="text-slate-600 mt-2">Sign in to your NextView account</p>
        </div>
        <div className="glass-card p-8 bg-white border border-slate-200/80 shadow-xl rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mobile or Email
              </label>
              <input
                type="text"
                value={form.identifier}
                required
                onChange={(e) => setForm((f) => ({ ...f, identifier: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
                placeholder="Enter mobile or email"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <Link
                  href={`/nextview/forgot-password${
                    form.identifier ? `?identifier=${encodeURIComponent(form.identifier.trim())}` : ''
                  }`}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition hover:underline"
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none pr-10 transition-colors"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-500/25 transition-all disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Login to NextView'}
            </button>
            <p className="text-center text-slate-600 text-sm">
              Not a member?{' '}
              <Link href="/nextview/register" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center px-4 text-slate-600">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
