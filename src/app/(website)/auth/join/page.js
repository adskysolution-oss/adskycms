'use client';

import Link from 'next/link';
import { FaUserTie, FaBriefcase, FaArrowRight } from 'react-icons/fa';

export default function JoinPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,1)_0%,rgba(0,0,0,1)_100%)]" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
      <div className="glow-dot bg-primary top-1/4 left-1/4 opacity-10 animate-pulse-slow" />
      <div className="glow-dot bg-secondary bottom-1/4 right-1/4 opacity-10 animate-pulse-slow" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-5xl relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black text-text-primary mb-6 tracking-tighter italic uppercase">
            Partner With <span className="gradient-text">AdSky</span>
          </h1>
          <p className="text-text-secondary text-lg font-medium">Choose an account type to get started on your journey.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Candidate Card */}
          <Link href="/auth/register?role=candidate" className="group">
            <div className="glass-card p-10 h-full border border-white/5 hover:border-primary/30 transition-all flex flex-col items-center text-center group-hover:-translate-y-2 bg-gradient-to-b from-white/5 to-transparent">
              <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-light mb-8 group-hover:scale-110 transition-transform shadow-xl shadow-primary/5">
                <FaUserTie size={36} />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-4">I am a Candidate</h2>
              <p className="text-text-secondary text-sm leading-relaxed mb-8 flex-grow">
                Create a profile to apply for jobs and track applications.
              </p>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary-light group-hover:gap-4 transition-all">
                JOIN NOW <FaArrowRight size={12} />
              </div>
            </div>
          </Link>

          {/* Employer Card */}
          <Link href="/auth/register?role=employer" className="group">
            <div className="glass-card p-10 h-full border border-white/5 hover:border-secondary/30 transition-all flex flex-col items-center text-center group-hover:-translate-y-2 bg-gradient-to-b from-white/5 to-transparent">
              <div className="w-20 h-20 rounded-3xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary-light mb-8 group-hover:scale-110 transition-transform shadow-xl shadow-secondary/5">
                <FaBriefcase size={36} />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-4">I am an Employer</h2>
              <p className="text-text-secondary text-sm leading-relaxed mb-8 flex-grow">
                Post jobs, manage hiring, and consult with our experts.
              </p>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-secondary-light group-hover:gap-4 transition-all">
                JOIN NOW <FaArrowRight size={12} />
              </div>
            </div>
          </Link>
        </div>

        <div className="text-center">
          <p className="text-text-muted text-sm font-medium">
            Already have an account? <Link href="/auth/login" className="text-primary-light hover:underline font-bold ml-1">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
