'use client';

import { FaHourglassHalf, FaCheckCircle, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="w-full max-w-2xl relative z-10">
        <div className="glass-card p-12 text-center border border-slate-200/80 shadow-xl bg-white rounded-2xl">
          <div className="w-24 h-24 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-8 border border-amber-200">
            <FaHourglassHalf size={40} className="text-amber-500 animate-pulse" />
          </div>
          
          <h1 className="text-3xl font-bold text-slate-900 mb-4 uppercase tracking-wide">Verification in Progress</h1>
          <p className="text-slate-600 mb-10 leading-relaxed text-lg">
            Our admin team is currently reviewing your company profile. <br />
            Once verified, you&apos;ll receive full access to the Employer Dashboard.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <FaCheckCircle className="text-green-600 mx-auto mb-2" size={20} />
              <p className="text-xs font-bold text-slate-500 uppercase">Register</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 shadow-sm">
              <FaHourglassHalf className="text-amber-600 mx-auto mb-2" size={20} />
              <p className="text-xs font-bold text-amber-700 uppercase">Verification</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 opacity-60">
              <FaExclamationTriangle className="text-slate-400 mx-auto mb-2" size={20} />
              <p className="text-xs font-bold text-slate-400 uppercase">Onboarding</p>
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
