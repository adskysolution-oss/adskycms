import { FaUsers, FaRocket, FaHeart, FaGlobe } from 'react-icons/fa';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { getTeamMembers } from '@/lib/data';
import MeetTeamSection from '@/components/sections/MeetTeamSection';
import VisionMissionSection from '@/components/sections/VisionMissionSection';
import OurJourneySection from '@/components/sections/OurJourneySection';
import AboutCompanySection from '@/components/sections/AboutCompanySection';
import { FloatingOrb, DottedGrid, GeometricAccent, GlowBlob } from '@/components/ui/BackgroundEffects';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = { title: 'About Us - AdSky Solution' };

const values = [
  {
    icon: FaRocket,
    title: 'Innovation',
    badge: 'Technology First',
    desc: 'We continuously push boundaries and engineer high-performance, modern architectures.',
    cardBg: 'bg-gradient-to-br from-blue-100/90 via-indigo-50/70 to-white',
    border: 'border-blue-300/90 hover:border-blue-500',
    topBar: 'bg-gradient-to-r from-blue-600 to-cyan-500',
    blobColor: 'from-blue-500/25 to-indigo-500/15',
    iconBg: 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/25',
    pillBg: 'bg-blue-600 text-white',
    hoverShadow: 'hover:shadow-xl hover:shadow-blue-500/15',
  },
  {
    icon: FaHeart,
    title: 'Passion & Craft',
    badge: 'Human Centric',
    desc: 'We are driven by excellence, treating every client project with care, quality, and dedication.',
    cardBg: 'bg-gradient-to-br from-rose-100/90 via-pink-50/70 to-white',
    border: 'border-rose-300/90 hover:border-rose-500',
    topBar: 'bg-gradient-to-r from-rose-500 to-pink-500',
    blobColor: 'from-rose-500/25 to-pink-500/15',
    iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/25',
    pillBg: 'bg-rose-600 text-white',
    hoverShadow: 'hover:shadow-xl hover:shadow-rose-500/15',
  },
  {
    icon: FaUsers,
    title: 'Collaboration',
    badge: 'Partner Synergy',
    desc: 'We work as an integrated engineering partner, aligning deeply with your core business vision.',
    cardBg: 'bg-gradient-to-br from-purple-100/90 via-violet-50/70 to-white',
    border: 'border-purple-300/90 hover:border-purple-500',
    topBar: 'bg-gradient-to-r from-purple-600 to-violet-600',
    blobColor: 'from-purple-500/25 to-violet-500/15',
    iconBg: 'bg-gradient-to-br from-purple-600 to-violet-600 text-white shadow-md shadow-purple-500/25',
    pillBg: 'bg-purple-600 text-white',
    hoverShadow: 'hover:shadow-xl hover:shadow-purple-500/15',
  },
  {
    icon: FaGlobe,
    title: 'Measurable Impact',
    badge: 'Results Driven',
    desc: 'We deliver scalable digital systems and recruitment solutions that yield real-world ROI.',
    cardBg: 'bg-gradient-to-br from-amber-100/90 via-orange-50/70 to-white',
    border: 'border-amber-300/90 hover:border-amber-500',
    topBar: 'bg-gradient-to-r from-amber-500 to-orange-500',
    blobColor: 'from-amber-500/25 to-orange-500/15',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/25',
    pillBg: 'bg-amber-600 text-white',
    hoverShadow: 'hover:shadow-xl hover:shadow-amber-500/15',
  },
];

export default async function AboutPage() {
  const team = await getTeamMembers();

  return (
    <div className="min-h-screen bg-slate-50/40 text-slate-900">
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden bg-gradient-to-b from-blue-50/60 via-white to-slate-50/40 border-b border-slate-200/70">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <GlowBlob color="blue" size="w-[520px] h-[520px]" className="-top-28 -right-32" opacity={0.15} />
          <GlowBlob color="purple" size="w-[420px] h-[420px]" className="bottom-0 -left-28" opacity={0.12} delay="4s" />
          <FloatingOrb variant="blue" size={38} className="top-1/4 -left-5 hidden lg:block" animation="float-slow" delay="1s" />
          <FloatingOrb variant="peach" size={32} className="bottom-1/3 -right-4 hidden lg:block" animation="float-reverse" delay="2.5s" />
          <DottedGrid cols={6} rows={6} spacing={16} color="#3B82F6" opacity={0.25} className="top-1/4 left-4 hidden md:block" />
          <GeometricAccent type="sparkle" size={14} color="#06B6D4" opacity={0.35} className="top-20 right-1/4 hidden md:block" delay="1.5s" />
        </div>

        <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200/80 bg-blue-50/90 text-primary text-xs font-bold uppercase tracking-wider mb-5 shadow-xs">
            <Sparkles size={13} className="text-blue-600" />
            <span>Discover Our Story</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-5">
            About <span className="gradient-text">AdSky Solution</span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            We are a team of passionate technologists, designers, and strategists dedicated to helping businesses thrive in the digital age.
          </p>
        </div>
      </section>

      {/* About Company Intro */}
      <AboutCompanySection />

      {/* Vision & Mission Bento */}
      <VisionMissionSection />

      {/* Core Values Section */}
      <section className="section-padding relative overflow-hidden bg-white border-b border-slate-200/80">
        <div className="container-custom relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
              <span>Principles</span>
            </div>
            <h2 className="section-title">
              Our <span className="gradient-text">Core Values</span>
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              The foundational principles guiding every solution we architect and partnership we cultivate.
            </p>
          </div>

          {/* 4 Distinctly-Colored Core Values Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, i) => {
              const Icon = val.icon;
              return (
                <div
                  key={i}
                  className={`group relative rounded-3xl p-7 border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-[0_4px_20px_-6px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 ${val.cardBg} ${val.border} ${val.hoverShadow}`}
                >
                  {/* Top Accent Stripe */}
                  <div className={`h-1.5 w-full absolute top-0 left-0 right-0 ${val.topBar}`} />

                  {/* Ambient Corner Glow */}
                  <div
                    className={`absolute -top-12 -right-12 w-36 h-36 bg-gradient-to-br ${val.blobColor} rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500`}
                  />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-2 mb-5">
                      <div className={`w-13 h-13 rounded-2xl ${val.iconBg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-2`}>
                        <Icon size={22} />
                      </div>
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-2xs ${val.pillBg}`}>
                        {val.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold text-slate-900 mb-2.5 group-hover:text-primary transition-colors">
                      {val.title}
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                      {val.desc}
                    </p>
                  </div>

                  <div className="relative z-10 pt-4 mt-5 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-500">
                    <span className="text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      <span>Value Principle</span>
                      <ArrowRight size={12} />
                    </span>
                    <span>0{i + 1}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <OurJourneySection />

      {/* Team */}
      <MeetTeamSection team={team} />
    </div>
  );
}
