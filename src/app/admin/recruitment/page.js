'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Briefcase, Users, UserCheck, CheckCircle2, 
  Clock, ArrowUpRight, TrendingUp, Building2 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminRecruitmentOverviewPage() {
  const [stats, setStats] = useState({ partners: 0, candidates: 0, jobs: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/recruitment/admin/partners').then(r => r.json()),
      fetch('/api/recruitment/admin/candidates').then(r => r.json()),
      fetch('/api/recruitment/admin/jobs').then(r => r.json())
    ]).then(([partnersData, candidatesData, jobsData]) => {
      setStats({
        partners: partnersData.partners ? partnersData.partners.length : 0,
        candidates: candidatesData.candidates ? candidatesData.candidates.length : 0,
        jobs: jobsData.jobs ? jobsData.jobs.length : 0
      });
    }).catch(() => {
      toast.error('Failed to load recruitment metrics.');
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Briefcase className="w-6 h-6 text-blue-400" />
            <span>Recruitment Management</span>
          </h1>
          <p className="text-slate-400 text-sm">Oversee agency recruitment partners, candidate pipelines, and client job postings.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/recruitment/jobs" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-semibold text-white transition">
            Post New Job
          </Link>
          <Link href="/admin/recruitment/partners" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-white transition">
            Manage Partners
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Registered Partners</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 text-3xl font-black text-white">
            {loading ? '...' : stats.partners}
          </div>
          <Link href="/admin/recruitment/partners" className="mt-2 text-xs text-blue-400 hover:underline flex items-center space-x-1">
            <span>View Partner Agencies</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Submitted Candidates</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-3xl font-black text-purple-400">
            {loading ? '...' : stats.candidates}
          </div>
          <Link href="/admin/recruitment/candidates" className="mt-2 text-xs text-purple-400 hover:underline flex items-center space-x-1">
            <span>Review Candidate Pipeline</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Active Job Openings</span>
            <Briefcase className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-3xl font-black text-emerald-400">
            {loading ? '...' : stats.jobs}
          </div>
          <Link href="/admin/recruitment/jobs" className="mt-2 text-xs text-emerald-400 hover:underline flex items-center space-x-1">
            <span>Manage Job Postings</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/recruitment/partners" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-blue-500/50 transition space-y-3 block">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Partner Agencies</h3>
          <p className="text-xs text-slate-400">Verify new recruitment partner registrations, manage commission tiers, and review performance.</p>
        </Link>

        <Link href="/admin/recruitment/candidates" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-purple-500/50 transition space-y-3 block">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Candidate Tracker</h3>
          <p className="text-xs text-slate-400">Track candidate progression from submission to client interview, offer rollout, and placement commission.</p>
        </Link>

        <Link href="/admin/recruitment/jobs" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-emerald-500/50 transition space-y-3 block">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Client Job Openings</h3>
          <p className="text-xs text-slate-400">Post new job requirements with payout details, target locations, experience requirements, and status.</p>
        </Link>
      </div>
    </div>
  );
}