import { FaExternalLinkAlt } from 'react-icons/fa';
import { getProjects } from '@/lib/data';

export const metadata = { title: 'Projects - AdSky Solution' };

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <section className="relative pt-32 pb-20">
        <div className="glow-dot bg-primary top-20 right-0 animate-pulse-slow" />
        <div className="container-custom relative z-10 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6">
            Our <span className="gradient-text">Projects</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">A showcase of our finest work across industries</p>
        </div>
      </section>

      <section className="section-padding !pt-0">
        <div className="container-custom">
          {projects.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <p className="text-text-secondary text-lg">No projects yet.</p>
              <p className="text-text-muted text-sm mt-2">Admin can add projects from the dashboard.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p) => (
                <div key={p._id} className="glass-card-hover overflow-hidden group">
                  <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center relative overflow-hidden">
                    {p.image ? (
                      <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <span className="text-6xl font-extrabold gradient-text opacity-30 group-hover:opacity-50 transition-opacity">{p.title.charAt(0)}</span>
                    )}
                    {p.link && (
                      <a href={p.link} target="_blank" rel="noopener noreferrer" className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <FaExternalLinkAlt size={12} className="text-white" />
                      </a>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-primary-light transition-colors">{p.title}</h3>
                    <p className="text-text-secondary text-sm mb-4">{p.description}</p>
                    {p.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {p.technologies.map((t, j) => (
                          <span key={j} className="text-xs text-text-muted bg-surface px-2 py-1 rounded">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
