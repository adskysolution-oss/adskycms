import { Users, Award, Sparkles } from 'lucide-react';
import { FloatingOrb, CurvedLine, GlowBlob } from '../ui/BackgroundEffects';

const TEAM_CARD_THEMES = [
  {
    cardBg: 'bg-gradient-to-b from-blue-100/80 via-indigo-50/50 to-white',
    border: 'border-blue-200/90 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/15',
    roleColor: 'text-blue-700 bg-blue-100/90 border-blue-200/90',
  },
  {
    cardBg: 'bg-gradient-to-b from-purple-100/80 via-violet-50/50 to-white',
    border: 'border-purple-200/90 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-500/15',
    roleColor: 'text-purple-700 bg-purple-100/90 border-purple-200/90',
  },
  {
    cardBg: 'bg-gradient-to-b from-emerald-100/80 via-teal-50/50 to-white',
    border: 'border-emerald-200/90 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/15',
    roleColor: 'text-emerald-700 bg-emerald-100/90 border-emerald-200/90',
  },
  {
    cardBg: 'bg-gradient-to-b from-amber-100/80 via-orange-50/50 to-white',
    border: 'border-amber-200/90 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/15',
    roleColor: 'text-amber-800 bg-amber-100/90 border-amber-200/90',
  },
];

export default function MeetTeamSection({ team = [] }) {
  if (team.length === 0) return null;

  return (
    <section className="section-padding relative overflow-hidden bg-slate-50/50 border-b border-slate-200/70">
      {/* Background Effect Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <GlowBlob color="purple" size="w-[400px] h-[400px]" className="-top-16 -left-24" opacity={0.10} />
        <GlowBlob color="cyan" size="w-[350px] h-[350px]" className="bottom-0 -right-24" opacity={0.09} delay="4s" />

        <FloatingOrb variant="purple" size={38} className="top-1/3 -right-4 hidden lg:block" animation="float-slow" delay="1s" />
        <FloatingOrb variant="ring" size={24} className="bottom-12 left-10 hidden md:block" animation="float" delay="2s" />
        <CurvedLine variant="arc" width={180} height={60} color="#06B6D4" opacity={0.22} className="top-12 left-1/4 hidden xl:block" />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* LEFT — Text */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200/80 bg-blue-50/90 text-primary text-xs font-bold uppercase tracking-wider mb-5 shadow-xs">
              <Users size={13} className="text-blue-600" />
              <span>Our Leadership &amp; Engineers</span>
            </div>

            <h2 className="section-title text-left !mb-4">
              Meet Our <span className="gradient-text">Team</span>
            </h2>
            <p className="text-slate-600 leading-relaxed text-base">
              At AdSky Solution, our team is our greatest asset. We are a diverse group of designers, developers, and strategists committed to delivering excellence. Each member brings unique expertise and passion to every project, ensuring that we don&apos;t just meet expectations—we exceed them.
            </p>

            {/* Mini team stats */}
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="rounded-2xl px-5 py-3.5 flex items-center gap-3 bg-white border border-slate-200/90 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
                  <Users size={18} />
                </div>
                <div>
                  <p className="text-xl font-black text-slate-900 leading-none">{team.length}+</p>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Specialists &amp; Engineers</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — 2×2 Distinctly-Colored Team Grid */}
          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            {team.slice(0, 4).map((member, i) => {
              const theme = TEAM_CARD_THEMES[i % TEAM_CARD_THEMES.length];
              return (
                <div
                  key={member._id}
                  className={`relative rounded-3xl overflow-hidden group border transition-all duration-300 flex flex-col justify-between shadow-sm hover:-translate-y-1 ${theme.cardBg} ${theme.border}`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="aspect-square relative overflow-hidden bg-slate-100">
                    {member.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 text-4xl font-black gradient-text">
                        {member.name?.charAt(0)}
                      </div>
                    )}

                    {/* Gradient Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <div className="p-4 text-center">
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900 mb-1">{member.name}</h4>
                    {member.role && (
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${theme.roleColor}`}>
                        {member.role}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
