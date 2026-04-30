import { FaCode, FaMobileAlt, FaBullhorn, FaPaintBrush, FaCloud, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';
import { getActiveServices } from '@/lib/data';

const iconMap = { FaCode, FaMobileAlt, FaBullhorn, FaPaintBrush, FaCloud, FaShieldAlt };

export const metadata = { title: 'Services - AdSky Solution' };

export default async function ServicesPage() {
  const services = await getActiveServices();

  return (
    <>
      {/* Hero (Hardcoded) */}
      <section className="relative pt-32 pb-20">
        <div className="glow-dot bg-primary top-20 right-0 animate-pulse-slow" />
        <div className="container-custom relative z-10 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6">
            Our <span className="gradient-text">Services</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">Comprehensive digital solutions tailored for your business</p>
        </div>
      </section>

      {/* Services Grid (DB) */}
      <section className="section-padding !pt-0">
        <div className="container-custom">
          {services.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <p className="text-text-secondary text-lg">No services available yet.</p>
              <p className="text-text-muted text-sm mt-2">Admin can add services from the dashboard.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((svc) => {
                const IconComp = iconMap[svc.icon] || FaCode;
                return (
                  <div key={svc._id} className="glass-card-hover p-8 group">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-6 group-hover:from-primary/30 group-hover:to-secondary/30 transition-all">
                      <IconComp className="text-primary-light" size={26} />
                    </div>
                    <h3 className="text-xl font-semibold text-text-primary mb-3">{svc.name}</h3>
                    <p className="text-text-secondary text-sm leading-relaxed mb-5">{svc.description}</p>
                    {svc.features?.length > 0 && (
                      <ul className="space-y-2">
                        {svc.features.map((f, j) => (
                          <li key={j} className="flex items-center gap-2 text-text-secondary text-sm">
                            <FaCheckCircle className="text-secondary flex-shrink-0" size={12} /> {f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
