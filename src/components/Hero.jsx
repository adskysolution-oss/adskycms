'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowRight, FaRocket, FaBriefcase } from 'react-icons/fa';
import { TypingText } from './ui/typing-text';
import PremiumImage from './PremiumImage';

export default function Hero() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.success) setUser(data.user);
      })
      .catch(() => { });
  }, []);

  const dashboardHref = user?.role === 'admin'
    ? '/admin/dashboard'
    : user?.role === 'employer'
      ? '/dashboard/employer'
      : '/dashboard/candidate';

  // LOGGED IN VIEW
  if (user) {
    return (
      <section className="relative min-h-screen overflow-hidden flex items-center bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.03),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.02),transparent_35%)]" />
        <div className="container-custom relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center pt-32 lg:pt-0">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 bg-white/5 mb-8">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Welcome Back</span>
              </div>
              <div className="mb-8 animate-slide-up">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                  Welcome back, <span className="gradient-text">{user.name}</span> 👋
                </h2>
                <p className="text-text-secondary text-xl font-medium">Ready to continue your journey with AdSky?</p>
              </div>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                <Link href={dashboardHref} className="btn-primary !rounded-2xl !px-8 !py-4 shadow-2xl shadow-primary/20 group">
                  Go to Dashboard
                  <FaRocket size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>
                <Link href="/careers" className="btn-secondary !rounded-2xl !px-8 !py-4 backdrop-blur-md group">
                  Explore Careers
                  <FaBriefcase size={14} className="group-hover:scale-110 transition-transform" />
                </Link>
              </div>
            </div>
            <div className="relative group hidden lg:block">
              <PremiumImage src="/hero1.png" alt="Welcome Back" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // LOGGED OUT VIEW (As requested by user)
  return (
    <section className="relative min-h-screen overflow-hidden flex items-center" style={{ backgroundColor: '#000000' }}>
      {/* Dark overlay background */}
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.03),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.02),transparent_30%)]" />

      <div className="container-custom relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-24 sm:pt-28 lg:pt-0">

          {/* LEFT — Text content */}
          <div className="text-center lg:text-left">
            <div className="mb-6 flex justify-center lg:justify-start">
              <span className="h-px w-40 bg-white/30" />
            </div>

            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-text-secondary">
              Premium Digital Support
            </p>

            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl mb-6">
              <span className="bg-gradient-to-r from-gray-100 via-white to-gray-300 bg-clip-text text-transparent">
                <TypingText text="Build Scalable Digital Solutions" />
              </span>
              <br />
              <TypingText text="With Smart " delay={1.6} />
              <TypingText text="Technology" className="text-blue-500" delay={2.1} />
              <TypingText text=" & Talent" delay={2.6} />
            </h1>

            <p className="mt-6 max-w-xl mx-auto lg:mx-0 text-lg leading-8 text-text-secondary">
              We help businesses grow faster with IT development, web solutions, and recruitment services across India.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <Link href="/auth/join" className="btn-primary !rounded-xl !px-7 !py-3.5">
                Get Started
                <FaArrowRight size={14} />
              </Link>
              <Link href="/services" className="btn-secondary !rounded-xl !px-7 !py-3.5">
                View Services
              </Link>
            </div>
          </div>

          {/* RIGHT — Hero image */}
          <PremiumImage src="/hero1.png" alt="Hero Image" />

        </div>
      </div>
    </section>
  );
}