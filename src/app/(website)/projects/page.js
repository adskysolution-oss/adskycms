import { FaExternalLinkAlt } from 'react-icons/fa';
import { Briefcase, Sparkles, ArrowUpRight } from 'lucide-react';
import { getProjects } from '@/lib/data';

export const metadata = { title: 'Projects - AdSky Solution' };

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="deco-blob deco-blob-blue w-[500px] h-[500px] -top-32 -right-32 animate-blob" />
        <div className="deco-blob deco-blob-purple w-[400px] h-[400px] top-1/2 -left-32 animate-blob" style={{ animationDelay: '5s' }} />

        <div className="container-custom relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200/60 bg-blue-50/80 text-primary text-xs font-bold uppercase tracking-wider mb-5">
            <Briefcase size={13} />
            <span>Portfolio Showcase</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
            Our <span className="gradient-text">Projects</span>
          </h1>

          <p className="text-slate-500 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            A showcase of our finest work across industries
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="section-padding !pt-0 relative overflow-hidden pb-28">
        <div className="deco-dot top-[20%] left-[8%] w-3 h-3 bg-primary opacity-25 hidden lg:block" />
        <div className="deco-ring w-24 h-24 bottom-[15%] right-[6%] hidden lg:block" />

        <div className="container-custom relative z-10">
          {projects.length === 0 ? (
            <div className="glass-card p-16 text-center max-w-xl mx-auto">
              <p className="text-slate-600 text-lg font-semibold">No projects yet.</p>
              <p className="text-slate-400 text-sm mt-2">Admin can add projects from the dashboard.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((p) => (
                <div key={p._id} className="glass-card-hover overflow-hidden group flex flex-col justify-between">
                  <div>
                    <div className="h-52 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10 flex items-center justify-center relative overflow-hidden rounded-t-[19px]">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <span className="text-6xl font-extrabold gradient-text opacity-30 group-hover:opacity-60 transition-opacity">
                          {p.title?.charAt(0)}
                        </span>
                      )}
                      {p.link && (
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-slate-700 hover:text-primary transition-all opacity-0 group-hover:opacity-100"
                          aria-label={`Visit ${p.title}`}
                        >
                          <ArrowUpRight size={16} />
                        </a>
                      )}
                    </div>

                    <div className="p-7">
                      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">
                        {p.title}
                      </h3>
                      <p className="text-slate-500 text-sm mb-4 leading-relaxed line-clamp-3">
                        {p.description}
                      </p>
                    </div>
                  </div>

                  {p.technologies?.length > 0 && (
                    <div className="px-7 pb-6 pt-0">
                      <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                        {p.technologies.map((t, j) => (
                          <span
                            key={j}
                            className="text-[11px] font-semibold text-primary bg-blue-50/80 border border-blue-200/50 px-2.5 py-1 rounded-lg"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
