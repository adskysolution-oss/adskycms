'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Layers,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Zap,
  Clock,
  X,
  ArrowUpRight,
  Cpu
} from 'lucide-react';
import IconByName from '@/components/ui/IconByName';

// 9 Rich, Distinct Color Palettes for each Service
export const SERVICE_THEMES = [
  {
    category: 'Strategic Advisory',
    badge: 'Enterprise IT',
    theme: 'blue',
    cardBg: 'bg-gradient-to-br from-blue-100/90 via-indigo-50/70 to-white',
    border: 'border-blue-300/90 hover:border-blue-500',
    borderActive: 'border-blue-600 ring-2 ring-blue-500/40 shadow-xl shadow-blue-500/20',
    iconBg: 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/35',
    pillBg: 'bg-blue-600 text-white border-blue-600',
    buttonBg: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-600/30',
    lightAccent: 'bg-blue-50/90 text-blue-900 border-blue-200',
    dotColor: 'bg-blue-600',
    glowColor: 'rgba(37, 99, 235, 0.22)',
    cornerBlob: 'from-blue-500/30 to-indigo-500/20',
    techStack: ['Enterprise Roadmap', 'Cloud Governance', 'TOGAF', 'Risk Assessment', 'Budget Optimization'],
    timeline: '2–4 Weeks Strategic Roadmap',
    impact: '⚡ Up to 40% Reduction in IT Operational Friction',
    workflow: [
      { step: '01', title: 'Audit & Analysis', desc: 'Current infrastructure & security benchmark' },
      { step: '02', title: 'Target Architecture', desc: 'Custom blueprint for scalable enterprise growth' },
      { step: '03', title: 'Roadmap Execution', desc: 'Milestone-based tech rollout and migration' },
      { step: '04', title: 'Continuous Governance', desc: 'SLA alignment and cost-benefit tracking' },
    ],
  },
  {
    category: 'Custom Engineering',
    badge: 'Software Dev',
    theme: 'emerald',
    cardBg: 'bg-gradient-to-br from-emerald-100/90 via-teal-50/70 to-white',
    border: 'border-emerald-300/90 hover:border-emerald-500',
    borderActive: 'border-emerald-600 ring-2 ring-emerald-500/40 shadow-xl shadow-emerald-500/20',
    iconBg: 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/35',
    pillBg: 'bg-emerald-600 text-white border-emerald-600',
    buttonBg: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-600/30',
    lightAccent: 'bg-emerald-50/90 text-emerald-900 border-emerald-200',
    dotColor: 'bg-emerald-600',
    glowColor: 'rgba(16, 185, 129, 0.22)',
    cornerBlob: 'from-emerald-500/30 to-teal-500/20',
    techStack: ['Node.js', 'Python', 'Microservices', 'REST & GraphQL', 'PostgreSQL'],
    timeline: '4–12 Weeks Production Sprints',
    impact: '🛡 99.9% High-Availability Enterprise Architecture',
    workflow: [
      { step: '01', title: 'Requirements Spec', desc: 'System scope, data models, and API design' },
      { step: '02', title: 'Agile Development', desc: 'Bi-weekly sprint demos and code reviews' },
      { step: '03', title: 'Rigorous QA', desc: 'Automated integration & stress testing' },
      { step: '04', title: 'Production Deploy', desc: 'Zero-downtime launch with complete docs' },
    ],
  },
  {
    category: 'Modern Web',
    badge: 'Web Experience',
    theme: 'violet',
    cardBg: 'bg-gradient-to-br from-purple-100/90 via-violet-50/70 to-white',
    border: 'border-purple-300/90 hover:border-purple-500',
    borderActive: 'border-purple-600 ring-2 ring-purple-500/40 shadow-xl shadow-purple-500/20',
    iconBg: 'bg-gradient-to-br from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/35',
    pillBg: 'bg-purple-600 text-white border-purple-600',
    buttonBg: 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-md shadow-purple-600/30',
    lightAccent: 'bg-purple-50/90 text-purple-900 border-purple-200',
    dotColor: 'bg-purple-600',
    glowColor: 'rgba(147, 51, 234, 0.22)',
    cornerBlob: 'from-purple-500/30 to-violet-500/20',
    techStack: ['Next.js', 'React', 'Tailwind CSS', 'Headless CMS', 'Core Web Vitals'],
    timeline: '2–4 Weeks Delivery',
    impact: '🚀 95+ Google PageSpeed & Conversion-Driven UX',
    workflow: [
      { step: '01', title: 'Design & Wireframe', desc: 'Conversion-centered layout & UI mockups' },
      { step: '02', title: 'Full Responsive Dev', desc: 'Mobile-first pixel-perfect development' },
      { step: '03', title: 'SEO & Performance', desc: 'Semantic markup, caching, and Lighthouse audit' },
      { step: '04', title: 'Go Live & CMS', desc: 'Client CMS training and DNS cutover' },
    ],
  },
  {
    category: 'Full-Stack SaaS',
    badge: 'Web Application',
    theme: 'cyan',
    cardBg: 'bg-gradient-to-br from-cyan-100/90 via-sky-50/70 to-white',
    border: 'border-cyan-300/90 hover:border-cyan-500',
    borderActive: 'border-cyan-600 ring-2 ring-cyan-500/40 shadow-xl shadow-cyan-500/20',
    iconBg: 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/35',
    pillBg: 'bg-cyan-600 text-white border-cyan-600',
    buttonBg: 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-md shadow-cyan-600/30',
    lightAccent: 'bg-cyan-50/90 text-cyan-900 border-cyan-200',
    dotColor: 'bg-cyan-600',
    glowColor: 'rgba(8, 145, 178, 0.22)',
    cornerBlob: 'from-cyan-500/30 to-blue-500/20',
    techStack: ['MERN Stack', 'PostgreSQL', 'WebSockets', 'RBAC Auth', 'Payment APIs'],
    timeline: '4–8 Weeks Agile Build',
    impact: '🔒 Scalable Multi-Tenant Architecture & Real-Time Sync',
    workflow: [
      { step: '01', title: 'System Blueprint', desc: 'Database schema, user flows, and state machine' },
      { step: '02', title: 'Core Logic Build', desc: 'Authentication, dashboards, and integrations' },
      { step: '03', title: 'Pen-Test & Audit', desc: 'Security headers, session handling & data safety' },
      { step: '04', title: 'Cloud Launch', desc: 'Automated CI/CD with database backups' },
    ],
  },
  {
    category: 'Talent Acquisition',
    badge: 'Scale Hiring',
    theme: 'amber',
    cardBg: 'bg-gradient-to-br from-amber-100/90 via-orange-50/70 to-white',
    border: 'border-amber-300/90 hover:border-amber-500',
    borderActive: 'border-amber-600 ring-2 ring-amber-500/40 shadow-xl shadow-amber-500/20',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/35',
    pillBg: 'bg-amber-600 text-white border-amber-600',
    buttonBg: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md shadow-amber-600/30',
    lightAccent: 'bg-amber-50/90 text-amber-900 border-amber-200',
    dotColor: 'bg-amber-600',
    glowColor: 'rgba(217, 119, 6, 0.22)',
    cornerBlob: 'from-amber-500/30 to-orange-500/20',
    techStack: ['PAN India Sourcing', 'Pre-Screening AI', 'Technical Interviews', 'HRMS Sync'],
    timeline: '7–14 Days First Candidate Batch',
    impact: '⏱ 60% Faster Time-to-Hire Across Tech & Operations',
    workflow: [
      { step: '01', title: 'Role Profiling', desc: 'Detailed skill matrix and hiring SLA definition' },
      { step: '02', title: 'Broad Talent Scout', desc: 'Multi-channel sourcing across PAN India network' },
      { step: '03', title: 'Technical Filter', desc: 'Strict screening, background and competence check' },
      { step: '04', title: 'Final Onboarding', desc: 'Offer management and induction facilitation' },
    ],
  },
  {
    category: 'Partner Governance',
    badge: 'Talent Ecosystem',
    theme: 'rose',
    cardBg: 'bg-gradient-to-br from-rose-100/90 via-pink-50/70 to-white',
    border: 'border-rose-300/90 hover:border-rose-500',
    borderActive: 'border-rose-600 ring-2 ring-rose-500/40 shadow-xl shadow-rose-500/20',
    iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/35',
    pillBg: 'bg-rose-600 text-white border-rose-600',
    buttonBg: 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-md shadow-rose-600/30',
    lightAccent: 'bg-rose-50/90 text-rose-900 border-rose-200',
    dotColor: 'bg-rose-600',
    glowColor: 'rgba(225, 29, 72, 0.22)',
    cornerBlob: 'from-rose-500/30 to-pink-500/20',
    techStack: ['Vendor Management', 'SLA Tracking', 'Performance KPIs', 'Rate Benchmarking'],
    timeline: 'Ongoing Managed Ecosystem',
    impact: '📊 100% SLA Compliance & Consolidated Partner Billing',
    workflow: [
      { step: '01', title: 'Partner Onboarding', desc: 'Vendor vetting, compliance, and legal frameworks' },
      { step: '02', title: 'KPI Benchmarking', desc: 'Clear delivery milestones and rate stabilization' },
      { step: '03', title: 'Central Dispatch', desc: 'Unified requirement distribution & tracking' },
      { step: '04', title: 'Audit & Reporting', desc: 'Monthly performance scorecard and spend review' },
    ],
  },
  {
    category: 'Experience Design',
    badge: 'UI/UX & Brand',
    theme: 'fuchsia',
    cardBg: 'bg-gradient-to-br from-fuchsia-100/90 via-purple-50/70 to-white',
    border: 'border-fuchsia-300/90 hover:border-fuchsia-500',
    borderActive: 'border-fuchsia-600 ring-2 ring-fuchsia-500/40 shadow-xl shadow-fuchsia-500/20',
    iconBg: 'bg-gradient-to-br from-fuchsia-600 to-pink-600 text-white shadow-lg shadow-fuchsia-500/35',
    pillBg: 'bg-fuchsia-600 text-white border-fuchsia-600',
    buttonBg: 'bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 text-white shadow-md shadow-fuchsia-600/30',
    lightAccent: 'bg-fuchsia-50/90 text-fuchsia-900 border-fuchsia-200',
    dotColor: 'bg-fuchsia-600',
    glowColor: 'rgba(192, 38, 211, 0.22)',
    cornerBlob: 'from-fuchsia-500/30 to-pink-500/20',
    techStack: ['Figma Systems', 'Design Tokens', 'User Journey Mapping', 'Interactive Prototyping'],
    timeline: '2–3 Weeks Iterative Sprints',
    impact: '✨ +45% Improvement in User Retention & Engagement',
    workflow: [
      { step: '01', title: 'UX Research', desc: 'User persona definition and usability auditing' },
      { step: '02', title: 'Information Flow', desc: 'Wireframing and core journey mapping' },
      { step: '03', title: 'Visual Identity', desc: 'High-fidelity UI and comprehensive design tokens' },
      { step: '04', title: 'Handoff & Specs', desc: 'Developer-ready design files and assets library' },
    ],
  },
  {
    category: 'Strategic Growth',
    badge: 'Consulting',
    theme: 'indigo',
    cardBg: 'bg-gradient-to-br from-indigo-100/90 via-blue-50/70 to-white',
    border: 'border-indigo-300/90 hover:border-indigo-500',
    borderActive: 'border-indigo-600 ring-2 ring-indigo-500/40 shadow-xl shadow-indigo-500/20',
    iconBg: 'bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-lg shadow-indigo-500/35',
    pillBg: 'bg-indigo-600 text-white border-indigo-600',
    buttonBg: 'bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white shadow-md shadow-indigo-600/30',
    lightAccent: 'bg-indigo-50/90 text-indigo-900 border-indigo-200',
    dotColor: 'bg-indigo-600',
    glowColor: 'rgba(79, 70, 229, 0.22)',
    cornerBlob: 'from-indigo-500/30 to-blue-500/20',
    techStack: ['Process Automation', 'AI Workflows', 'Legacy Modernization', 'Data Intelligence'],
    timeline: 'Custom Advisory Roadmaps',
    impact: '📈 35%+ Increase in Operational Efficiency & ROI',
    workflow: [
      { step: '01', title: 'Bottleneck Audit', desc: 'Identifying legacy workflow inefficiencies' },
      { step: '02', title: 'Digital Strategy', desc: 'Prioritizing high-ROI automation & cloud paths' },
      { step: '03', title: 'Pilot Rollout', desc: 'Rapid proof-of-concept testing with real metrics' },
      { step: '04', title: 'Enterprise Scale', desc: 'Company-wide change management & staff training' },
    ],
  },
  {
    category: 'Cloud Infrastructure',
    badge: 'DevOps & Cloud',
    theme: 'teal',
    cardBg: 'bg-gradient-to-br from-teal-100/90 via-cyan-50/70 to-white',
    border: 'border-teal-300/90 hover:border-teal-500',
    borderActive: 'border-teal-600 ring-2 ring-teal-500/40 shadow-xl shadow-teal-500/20',
    iconBg: 'bg-gradient-to-br from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/35',
    pillBg: 'bg-teal-600 text-white border-teal-600',
    buttonBg: 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-md shadow-teal-600/30',
    lightAccent: 'bg-teal-50/90 text-teal-900 border-teal-200',
    dotColor: 'bg-teal-600',
    glowColor: 'rgba(13, 148, 136, 0.22)',
    cornerBlob: 'from-teal-500/30 to-cyan-500/20',
    techStack: ['AWS / GCP / Azure', 'Docker & Kubernetes', 'CI/CD Pipelines', 'Terraform', 'Grafana'],
    timeline: '2–4 Weeks Infrastructure Deployment',
    impact: '☁️ 99.99% Guaranteed Cloud SLA & Automated Rollbacks',
    workflow: [
      { step: '01', title: 'Cloud Audit', desc: 'Architecture evaluation, security, and spend review' },
      { step: '02', title: 'IaC & Containerize', desc: 'Dockerizing workloads and Terraform configs' },
      { step: '03', title: 'CI/CD Pipeline', desc: 'Automated test suites and zero-downtime deploy' },
      { step: '04', title: '24/7 Monitoring', desc: 'Live alerts, APM telemetry, and disaster recovery' },
    ],
  },
];

export default function ServicesInteractiveGrid({ services = [] }) {
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const detailRef = useRef(null);

  if (services.length === 0) return null;

  const toggleService = (id) => {
    setSelectedServiceId((prev) => (prev === id ? null : id));
  };

  const activeService = services.find((s) => s._id === selectedServiceId) || null;
  const activeServiceIndex = services.findIndex((s) => s._id === selectedServiceId);
  const activeTheme = activeServiceIndex !== -1 
    ? SERVICE_THEMES[activeServiceIndex % SERVICE_THEMES.length] 
    : null;

  return (
    <div className="w-full">
      {/* 3x3 Distinctly-Colored Interactive Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7 items-start">
        {services.map((svc, i) => {
          const theme = SERVICE_THEMES[i % SERVICE_THEMES.length];
          const isExpanded = selectedServiceId === svc._id;
          const features = (svc.features && svc.features.length > 0)
            ? svc.features
            : theme.techStack;

          return (
            <div
              key={svc._id || i}
              onClick={() => toggleService(svc._id)}
              className={`group relative rounded-3xl p-6 sm:p-7 transition-all duration-300 cursor-pointer border flex flex-col justify-between overflow-hidden ${
                theme.cardBg
              } ${
                isExpanded 
                  ? `${theme.borderActive} scale-[1.01]` 
                  : `${theme.border} shadow-[0_4px_20px_-6px_rgba(0,0,0,0.06)] hover:shadow-xl hover:-translate-y-1.5`
              }`}
              style={{
                boxShadow: isExpanded 
                  ? `0 20px 35px -10px ${theme.glowColor}, 0 2px 8px rgba(0,0,0,0.06)`
                  : undefined
              }}
            >
              {/* Vibrant Ambient Corner Glow Blob */}
              <div 
                className={`absolute -top-14 -right-14 w-44 h-44 bg-gradient-to-br ${theme.cornerBlob} rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500`} 
              />
              <div 
                className="absolute -bottom-14 -left-14 w-36 h-36 bg-white/40 rounded-full blur-xl pointer-events-none" 
              />

              <div className="relative z-10">
                {/* Top Row: Icon Badge & Category Pill */}
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className={`w-13 h-13 rounded-2xl ${theme.iconBg} flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-1`}>
                    <IconByName name={svc.icon} className="text-white" size={24} />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-2xs border ${theme.pillBg}`}>
                      {theme.badge}
                    </span>
                    {isExpanded && (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        Active
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Short Summary */}
                <h3 className="text-xl font-extrabold text-slate-900 mb-2 group-hover:text-primary transition-colors">
                  {svc.name}
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                  {svc.description}
                </p>

                {/* Quick Feature Chips Preview (Shown when collapsed to keep card compact) */}
                {!isExpanded && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {features.slice(0, 3).map((f, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-white/90 border border-slate-200/90 px-2.5 py-1 rounded-lg shadow-2xs"
                      >
                        <CheckCircle2 size={11} className="text-emerald-600 flex-shrink-0" />
                        <span className="truncate max-w-[170px]">{f}</span>
                      </span>
                    ))}
                    {features.length > 3 && (
                      <span className="text-[11px] font-bold text-slate-600 bg-white/80 px-2 py-1 rounded-lg border border-slate-200">
                        +{features.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Interactive Inline Drawer (Expands smoothly on click) */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key="expanded-content"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.35, ease: [0.04, 0.62, 0.23, 0.98] }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 border-t border-slate-200/80 space-y-4">
                        {/* Deliverables List */}
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                            <Sparkles size={13} className="text-primary" />
                            <span>Key Deliverables &amp; Scope</span>
                          </div>
                          <ul className="space-y-2">
                            {features.map((feat, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs text-slate-800 leading-snug">
                                <CheckCircle2 size={13} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Tech Stack Badges */}
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                            <Cpu size={13} className="text-slate-600" />
                            <span>Core Tooling &amp; Competencies</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {theme.techStack.map((tech, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] font-bold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Impact & Timeline Callout */}
                        <div className={`p-3 rounded-xl border text-xs font-medium space-y-1 ${theme.lightAccent}`}>
                          <div className="flex items-center gap-1.5 font-bold">
                            <Zap size={13} className="text-amber-500" />
                            <span>{theme.impact}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                            <Clock size={12} className="text-blue-500" />
                            <span>{theme.timeline}</span>
                          </div>
                        </div>

                        {/* Call To Action Direct Link */}
                        <div className="pt-1">
                          <Link
                            href={`/contact?service=${encodeURIComponent(svc.name)}`}
                            onClick={(e) => e.stopPropagation()}
                            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs inline-flex items-center justify-center gap-2 transition-all ${theme.buttonBg}`}
                          >
                            <span>Inquire About {svc.name}</span>
                            <ArrowRight size={13} />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Card Interactive Toggle Footer */}
              <div className="relative z-10 pt-4 mt-4 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-2 group-hover:text-primary transition-colors">
                  <span className={`w-2 h-2 rounded-full ${theme.dotColor} ${isExpanded ? 'animate-ping' : ''}`} />
                  <span>{isExpanded ? 'Hide Details' : 'Click To Explore Details'}</span>
                </span>
                <div className={`w-7 h-7 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center text-slate-700 transition-transform duration-300 shadow-2xs group-hover:border-primary/50 ${isExpanded ? 'rotate-180 bg-primary text-white border-primary' : ''}`}>
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dedicated "Selected Service Deep-Dive Blueprint" Dock (Appears when any card is active) */}
      <AnimatePresence>
        {activeService && activeTheme && (
          <motion.div
            ref={detailRef}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="mt-14 relative rounded-3xl bg-white border border-slate-200/90 shadow-2xl p-6 sm:p-10 overflow-hidden"
          >
            {/* Top Gradient Stripe */}
            <div className={`absolute top-0 left-0 right-0 h-2 ${activeTheme.iconBg}`} />

            {/* Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl ${activeTheme.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <IconByName name={activeService.icon} className="text-white" size={26} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-0.5 rounded-full border ${activeTheme.pillBg}`}>
                      {activeTheme.badge}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">• Service Blueprint</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {activeService.name}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <Link
                  href={`/contact?service=${encodeURIComponent(activeService.name)}`}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs inline-flex items-center gap-2 transition-all ${activeTheme.buttonBg}`}
                >
                  <span>Request Custom Proposal</span>
                  <ArrowUpRight size={14} />
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedServiceId(null)}
                  aria-label="Close details"
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* 3-Column Detailed Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
              {/* Column 1: Scope & What You Get */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-500" />
                  <span>Verified Deliverables</span>
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {activeService.description}
                </p>
                <ul className="space-y-2.5 pt-2">
                  {((activeService.features && activeService.features.length > 0)
                    ? activeService.features
                    : activeTheme.techStack
                  ).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 2: 4-Step Execution Lifecycle */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Layers size={15} className="text-primary" />
                  <span>Execution Methodology</span>
                </h4>
                <div className="space-y-3">
                  {activeTheme.workflow.map((w, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                      <span className="text-xs font-black text-primary bg-white border border-slate-200/80 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 shadow-2xs">
                        {w.step}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{w.title}</p>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{w.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 3: Tech Stack & Value Guarantees */}
              <div className="space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck size={15} className="text-blue-600" />
                    <span>Security &amp; Quality Guarantees</span>
                  </h4>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <Zap size={14} className="text-amber-500 flex-shrink-0" />
                      <span>{activeTheme.impact}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <Clock size={14} className="text-blue-500 flex-shrink-0" />
                      <span>{activeTheme.timeline}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <ShieldCheck size={14} className="text-emerald-500 flex-shrink-0" />
                      <span>100% IP Ownership &amp; Enterprise NDA</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                      Technologies &amp; Standards
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {activeTheme.techStack.map((tech, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Link
                    href={`/contact?service=${encodeURIComponent(activeService.name)}`}
                    className={`w-full py-3 px-5 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 transition-all ${activeTheme.buttonBg}`}
                  >
                    <span>Get Started with {activeService.name}</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Switcher Carousel at Bottom of Blueprint */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Switch Active Service:
              </span>
              <div className="flex flex-wrap gap-2">
                {services.map((svc, idx) => {
                  const isCur = svc._id === selectedServiceId;
                  const st = SERVICE_THEMES[idx % SERVICE_THEMES.length];
                  return (
                    <button
                      key={svc._id || idx}
                      type="button"
                      onClick={() => setSelectedServiceId(svc._id)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                        isCur
                          ? `${st.buttonBg} scale-105`
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {svc.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
