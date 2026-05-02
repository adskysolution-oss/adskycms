import { FaArrowRight } from 'react-icons/fa';
import IconByName from '@/components/IconByName';
import { HoverEffect } from '../ui/card-hover-effect';

export default function ServicesSection({ services = [] }) {
  if (services.length === 0) return null;

  return (
    <section className="section-padding relative">
      <div className="glow-dot bg-primary top-0 right-0 animate-pulse-slow" />
      <div className="container-custom relative z-10">
        <div className="text-center mb-16">
          <h2 className="section-title"><span className="gradient-text">Our Services</span></h2>
          <p className="section-subtitle">Comprehensive digital solutions tailored to your needs</p>
        </div>

        <HoverEffect
          items={services.map((svc, i) => ({
            id: svc._id,
            content: (
              <div className="group" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-5 group-hover:from-primary/30 group-hover:to-secondary/30 transition-all">
                  <IconByName name={svc.icon} className="text-primary-light" size={22} />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{svc.name}</h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-4">{svc.description}</p>
                <div className="flex items-center gap-2 text-primary-light text-sm font-medium opacity-0 group-hover:opacity-100 transition-all">
                  Learn more <FaArrowRight size={12} />
                </div>
              </div>
            )
          }))}
        />
      </div>
    </section>
  );
}
