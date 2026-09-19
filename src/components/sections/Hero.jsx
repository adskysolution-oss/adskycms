'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Briefcase, Star, Zap, Users } from 'lucide-react';
import PremiumImage from '../ui/PremiumImage';
import { FloatingOrb, DottedGrid, CurvedLine, GeometricAccent, GlowBlob } from '../ui/BackgroundEffects';

export default function Hero() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const dashboardHref =
    user?.role === 'admin'
      ? '/admin/dashboard'
      : user?.role === 'employer'
        ? '/dashboard/employer'
        : user?.role === 'mlm_member'
          ? '/nextview/dashboard'
          : '/dashboard/candidate';

  // LOGGED IN VIEW
  if (user) {
    return (
      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="deco-blob deco-blob-blue w-[500px] h-[500px] top-0 -right-40 animate-blob" />
        <div className="deco-blob deco-blob-purple w-[300px] h-[300px] bottom-0 -left-20 animate-blob" style={{ animationDelay: '4s' }} />

        <div className="container-custom relative z-10 min-h-[calc(80vh-80px)] flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200/60 bg-blue-50/80 text-primary text-xs font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>Welcome Back</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Welcome back,{' '}
                <span className="gradient-text">{user.name || user.fullName || 'Member'}</span> 👋
              </h1>

              <p className="text-slate-500 text-lg sm:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Ready to continue your journey with AdSky?
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link href={dashboardHref} className="btn-primary !rounded-xl !px-8 !py-3.5 text-base font-semibold w-full sm:w-auto justify-center">
                  Go to Dashboard <ArrowRight size={16} />
                </Link>
                <Link href={user?.role === 'mlm_member' ? '/nextview/gallery' : '/careers'} className="btn-secondary !rounded-xl !px-8 !py-3.5 text-base font-semibold w-full sm:w-auto justify-center">
                  {user?.role === 'mlm_member' ? 'Marketing Library' : 'Explore Careers'}
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative flex items-center justify-center">
              <PremiumImage src="/hero1.png" alt="Welcome Back" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // LOGGED OUT — FUNKY PREMIUM HERO
  return (
    <section className="relative pt-28 pb-20 lg:pt-32 lg:pb-28 overflow-hidden">
      {/* === FUNKY BACKGROUND DECORATIONS === */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Ambient Glows */}
        <GlowBlob color="blue" size="w-[600px] h-[600px]" className="-top-40 -right-40" opacity={0.13} />
        <GlowBlob color="purple" size="w-[450px] h-[450px]" className="top-1/3 -left-40" opacity={0.11} delay="5s" />
        <GlowBlob color="warm" size="w-[300px] h-[300px]" className="bottom-10 right-1/4" opacity={0.06} delay="3s" />

        {/* Floating 3D Gradient Orbs */}
        <FloatingOrb variant="peach" size={48} className="top-24 left-8 hidden md:block" animation="float-slow" delay="0.5s" />
        <FloatingOrb variant="cyan" size={36} className="top-36 right-12 hidden lg:block" animation="float-reverse" delay="2s" />

        {/* Dotted Grids */}
        <DottedGrid cols={6} rows={5} spacing={18} color="#3B82F6" opacity={0.28} className="top-20 right-1/4 hidden lg:block" />
        <DottedGrid cols={5} rows={5} spacing={16} color="#8B5CF6" opacity={0.22} className="bottom-20 left-10 hidden md:block" />

        {/* Thin Curved SVG Line */}
        <CurvedLine variant="wave" width={280} height={70} color="#3B82F6" opacity={0.22} className="top-1/2 -left-8 hidden xl:block" />

        {/* Geometric Accents */}
        <GeometricAccent type="sparkle" size={16} color="#8B5CF6" opacity={0.35} className="top-28 right-1/3 hidden md:block" delay="1s" />
        <GeometricAccent type="plus" size={14} color="#3B82F6" opacity={0.3} className="bottom-28 right-1/4 hidden lg:block" delay="2.5s" />
        <GeometricAccent type="diamond" size={12} color="#06B6D4" opacity={0.35} className="top-1/3 left-1/4 hidden lg:block" delay="3s" />

        {/* Subtle light wash */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/25" />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[calc(82vh-100px)]">

          {/* LEFT — EXACT CONTENT */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200/60 bg-blue-50/80 text-primary text-xs font-bold uppercase tracking-wider">
              <Zap size={13} />
              <span>Premium Digital Support</span>
            </div>

            {/* H1 — EXACT WORDS */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              Build Scalable Digital{' '}
              <span className="gradient-text">Solutions</span>
              <br className="hidden sm:block" />
              {' '}With Smart{' '}
              <span className="gradient-text">Technology</span> &amp; Talent
            </h1>

            {/* Description — EXACT WORDS */}
            <p className="text-slate-500 text-lg sm:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0">
              We help businesses grow faster with IT development, web solutions, and recruitment services across India.
            </p>

            {/* CTAs — EXACT WORDS & LINKS */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3">
              <Link href="/auth/join" className="btn-primary !rounded-xl !px-8 !py-4 text-base font-semibold w-full sm:w-auto justify-center">
                Get Started <ArrowRight size={16} />
              </Link>
              <Link href="/services" className="btn-secondary !rounded-xl !px-8 !py-4 text-base font-semibold w-full sm:w-auto justify-center">
                View Services
              </Link>
            </div>

            {/* Mini Stats Strip */}
            <div className="pt-8 flex flex-wrap items-center justify-center lg:justify-start gap-6 sm:gap-10">
              {[
                { icon: Users, value: '100+', label: 'Happy Clients' },
                { icon: Briefcase, value: '500+', label: 'Projects Delivered' },
                { icon: Star, value: '50+', label: 'Team Members' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="icon-box icon-box-blue !w-10 !h-10 !rounded-xl">
                    <stat.icon size={18} />
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-slate-900 leading-none">{stat.value}</p>
                    <p className="text-xs text-slate-400 font-medium">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — EXISTING HERO PNG WITH FUNKY FRAME */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-md lg:max-w-none">

              {/* Glow behind image */}
              <div className="absolute inset-0 m-8 bg-gradient-to-tr from-primary/10 via-secondary/8 to-accent/5 rounded-3xl blur-3xl animate-pulse-slow" />

              {/* Floating pill 1 */}
              <div className="deco-pill top-2 -right-2 sm:top-4 sm:-right-4 animate-float z-20 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                <span>Technology</span>
              </div>

              {/* Floating pill 2 */}
              <div className="deco-pill bottom-8 -left-2 sm:bottom-12 sm:-left-6 animate-float z-20" style={{ animationDelay: '2s' }}>
                <span className="flex items-center gap-1.5">
                  <Star size={11} className="text-amber-400" />
                  <span>4.8/5 Client Satisfaction</span>
                </span>
              </div>

              {/* EXACT PNG */}
              <div className="relative z-10">
                <PremiumImage src="/hero1.png" alt="Hero Image" />
              </div>

              {/* Decorative ring around image area */}
              <div className="absolute -top-6 -right-6 w-20 h-20 border-2 border-dashed border-primary/10 rounded-full animate-spin-slow hidden lg:block" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}