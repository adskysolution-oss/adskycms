import { Users } from 'lucide-react';
import { FloatingOrb, CurvedLine, GlowBlob } from '../ui/BackgroundEffects';

export default function MeetTeamSection({ team = [] }) {
  if (team.length === 0) return null;

  return (
    <section className="section-padding relative overflow-hidden section-bg-light">
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200/60 bg-blue-50/80 text-primary text-xs font-bold uppercase tracking-wider mb-5">
              <Users size={13} />
              <span>Our People</span>
            </div>

            <h2 className="section-title mb-4">
              Meet Our <span className="gradient-text">Team</span>
            </h2>
            <p className="text-slate-500 leading-relaxed text-base">
              At AdSky Solution, our team is our greatest asset. We are a diverse group of designers, developers, and strategists committed to delivering excellence. Each member brings unique expertise and passion to every project, ensuring that we don&apos;t just meet expectations—we exceed them.
            </p>

            {/* Mini team stats */}
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="glass-card px-5 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-sm">
                  <Users size={16} />
                </div>
                <div>
                  <p className="text-lg font-extrabold text-slate-900 leading-none">{team.length}+</p>
                  <p className="text-[11px] text-slate-400 font-medium">Team Members</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — 2×2 Photo Grid */}
          <div className="grid grid-cols-2 gap-4">
            {team.slice(0, 4).map((member, i) => (
              <div key={member._id} className="glass-card-hover overflow-hidden group" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="aspect-square relative overflow-hidden">
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

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="px-4 py-3 text-center">
                  <h4 className="text-sm font-bold text-slate-900">{member.name}</h4>
                  {member.role && <p className="text-slate-400 text-xs mt-0.5">{member.role}</p>}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
