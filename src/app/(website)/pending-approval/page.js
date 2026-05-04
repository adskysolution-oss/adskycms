'use client';

import { FaHourglassHalf, FaCheckCircle, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,1)_0%,rgba(0,0,0,1)_100%)]" />
      <div className="glow-dot bg-secondary bottom-1/4 right-1/4 opacity-20" />
      
      <div className="w-full max-w-2xl relative z-10">
        <div className="glass-card p-12 text-center border border-white/10 shadow-2xl">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-500/20 flex items-center justify-center mx-auto mb-8 shadow-inner border border-yellow-400/20">
            <FaHourglassHalf size={40} className="text-yellow-400 animate-pulse" />
          </div>
          
          <h1 className="text-3xl font-bold text-text-primary mb-4 italic uppercase tracking-widest">Verification in Progress</h1>
          <p className="text-text-secondary mb-10 leading-relaxed text-lg">
            Our admin team is currently reviewing your company profile. <br />
            Once verified, you'll receive full access to the Employer Dashboard.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <FaCheckCircle className="text-success mx-auto mb-2" size={20} />
              <p className="text-xs font-bold text-text-muted uppercase">Register</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-lg shadow-yellow-400/5">
              <FaHourglassHalf className="text-yellow-400 mx-auto mb-2" size={20} />
              <p className="text-xs font-bold text-yellow-400 uppercase">Verification</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 opacity-50">
              <FaExclamationTriangle className="text-text-muted mx-auto mb-2" size={20} />
              <p className="text-xs font-bold text-text-muted uppercase">Onboarding</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="btn-secondary !py-3 !px-8 text-sm font-bold flex items-center gap-2">
              <FaArrowLeft size={12} /> Back to Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
