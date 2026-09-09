'use client';

import Link from 'next/link';
import { FaUserTie, FaBriefcase, FaArrowRight } from 'react-icons/fa';

export default function JoinPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="w-full max-w-5xl relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter uppercase">
            Partner With <span className="gradient-text">AdSky</span>
          </h1>
          <p className="text-slate-600 text-lg font-medium">Choose an account type to get started on your journey.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Candidate Card */}
          <Link href="/auth/register?role=candidate" className="group">
            <div className="glass-card p-10 h-full border border-slate-200/80 hover:border-primary/40 shadow-xs hover:shadow-lg transition-all flex flex-col items-center text-center group-hover:-translate-y-2 bg-white rounded-2xl">
              <div className="w-20 h-20 rounded-3xl bg-blue-50 border border-blue-200 flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform shadow-sm">
                <FaUserTie size={36} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">I am a Candidate</h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-8 flex-grow">
                Create a profile to apply for jobs and track applications.
              </p>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary group-hover:gap-4 transition-all">
                JOIN NOW <FaArrowRight size={12} />
              </div>
            </div>
          </Link>

          {/* Employer Card */}
          <Link href="/auth/register?role=employer" className="group">
            <div className="glass-card p-10 h-full border border-slate-200/80 hover:border-amber-500/40 shadow-xs hover:shadow-lg transition-all flex flex-col items-center text-center group-hover:-translate-y-2 bg-white rounded-2xl">
              <div className="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-8 group-hover:scale-110 transition-transform shadow-sm">
                <FaBriefcase size={36} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">I am an Employer</h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-8 flex-grow">
                Post jobs, manage hiring, and consult with our experts.
              </p>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-600 group-hover:gap-4 transition-all">
                JOIN NOW <FaArrowRight size={12} />
              </div>
            </div>
          </Link>
        </div>

        <div className="text-center">
          <p className="text-slate-500 text-sm font-medium">
            Already have an account? <Link href="/auth/login" className="text-primary hover:underline font-bold ml-1">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
