import { FaCheckCircle } from 'react-icons/fa';
import { Layers, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import IconByName from '@/components/ui/IconByName';
import { getActiveServices } from '@/lib/data';

export const metadata = { title: 'Services - AdSky Solution' };

export default async function ServicesPage() {
  const services = await getActiveServices();

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="deco-blob deco-blob-blue w-[500px] h-[500px] -top-32 -right-32 animate-blob" />
        <div className="deco-blob deco-blob-purple w-[400px] h-[400px] top-1/2 -left-32 animate-blob" style={{ animationDelay: '6s' }} />

        <div className="container-custom relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200/60 bg-blue-50/80 text-primary text-xs font-bold uppercase tracking-wider mb-5">
            <Layers size={13} />
            <span>Comprehensive Solutions</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
            Our <span className="gradient-text">Services</span>
          </h1>

          <p className="text-slate-500 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            From specialized workforce consulting to global IT strategy, we provide the architecture for high-growth businesses.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding !pt-0 relative overflow-hidden pb-28">
        <div className="deco-dot top-[20%] left-[8%] w-3 h-3 bg-primary opacity-25 hidden lg:block" />
        <div className="deco-ring w-24 h-24 bottom-[15%] right-[6%] hidden lg:block" />

        <div className="container-custom relative z-10">
          {services.length === 0 ? (
            <div className="glass-card p-16 text-center max-w-xl mx-auto">
              <p className="text-slate-600 text-lg font-semibold">No services available yet.</p>
              <p className="text-slate-400 text-sm mt-2">Admin can add services from the dashboard.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((svc) => (
                <div
                  key={svc._id}
                  className="glass-card-hover p-8 group flex flex-col justify-between"
                >
                  <div>
                    {/* Icon container */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/15 text-primary flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                      <IconByName name={svc.icon} className="transition-colors" size={26} />
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors">
                      {svc.name}
                    </h3>

                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                      {svc.description}
                    </p>

                    {svc.features?.length > 0 && (
                      <ul className="space-y-2.5 mb-6 pt-2 border-t border-slate-100">
                        {svc.features.map((f, j) => (
                          <li key={j} className="flex items-center gap-2.5 text-slate-600 text-sm">
                            <FaCheckCircle className="text-primary flex-shrink-0" size={13} />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="pt-4 mt-2 border-t border-slate-100/80 flex items-center justify-between">
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 text-xs font-bold text-primary group-hover:gap-3 transition-all"
                    >
                      <span>Inquire Now</span>
                      <ArrowRight size={13} />
                    </Link>
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
