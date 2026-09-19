import { FaUsers, FaRocket, FaHeart, FaGlobe } from 'react-icons/fa';
import { Sparkles } from 'lucide-react';
import { getTeamMembers } from '@/lib/data';
import MeetTeamSection from '@/components/sections/MeetTeamSection';
import VisionMissionSection from '@/components/sections/VisionMissionSection';
import OurJourneySection from '@/components/sections/OurJourneySection';
import AboutCompanySection from '@/components/sections/AboutCompanySection';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = { title: 'About Us - AdSky Solution' };

const values = [
  { icon: FaRocket, title: 'Innovation', desc: 'We push boundaries and embrace new technologies.', color: 'from-blue-500 to-cyan-400' },
  { icon: FaHeart, title: 'Passion', desc: 'We love what we do and it shows in our work.', color: 'from-pink-500 to-rose-400' },
  { icon: FaUsers, title: 'Collaboration', desc: 'We work as one team with our clients.', color: 'from-violet-500 to-purple-400' },
  { icon: FaGlobe, title: 'Impact', desc: 'We create solutions that make a real difference.', color: 'from-amber-500 to-orange-400' },
];

export default async function AboutPage() {
  const team = await getTeamMembers();

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="deco-blob deco-blob-blue w-[500px] h-[500px] -top-32 -right-32 animate-blob" />
        <div className="deco-blob deco-blob-purple w-[400px] h-[400px] top-1/2 -left-32 animate-blob" style={{ animationDelay: '4s' }} />

        <div className="container-custom relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200/60 bg-blue-50/80 text-primary text-xs font-bold uppercase tracking-wider mb-5">
            <Sparkles size={13} />
            <span>Discover Our Story</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
            About <span className="gradient-text">AdSky Solution</span>
          </h1>

          <p className="text-slate-500 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            We are a team of passionate technologists, designers, and strategists dedicated to helping businesses thrive in the digital age.
          </p>
        </div>
      </section>

      {/* About Company Intro */}
      <AboutCompanySection />

      {/* Vision & Mission Bento */}
      <VisionMissionSection />

      {/* Core Values */}
      <section className="section-padding relative overflow-hidden">
        <div className="deco-blob deco-blob-warm w-[350px] h-[350px] bottom-0 right-0 opacity-10 animate-blob" />
        
        <div className="container-custom relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="section-title">
              Our <span className="gradient-text">Core Values</span>
            </h2>
            <p className="text-slate-500 text-base">
              The foundational principles guiding every solution we architect and partnership we cultivate.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc, color }, i) => (
              <div key={i} className="glass-card-hover p-8 text-center group">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} mx-auto mb-6 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">
                  {title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <OurJourneySection />

      {/* Team */}
      <MeetTeamSection team={team} />
    </>
  );
}
