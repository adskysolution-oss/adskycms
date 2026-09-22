import { Layers } from 'lucide-react';
import { getActiveServices } from '@/lib/data';
import ServicesInteractiveGrid from '@/components/sections/ServicesInteractiveGrid';

export const metadata = { title: 'Services - AdSky Solution' };

export default async function ServicesPage() {
  const services = await getActiveServices();

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-14 overflow-hidden bg-gradient-to-b from-slate-50/70 via-white to-slate-50/40">
        <div className="deco-blob deco-blob-blue w-[500px] h-[500px] -top-32 -right-32 animate-blob opacity-60" />
        <div className="deco-blob deco-blob-purple w-[400px] h-[400px] top-1/2 -left-32 animate-blob opacity-50" style={{ animationDelay: '6s' }} />

        <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200/80 bg-blue-50/90 text-primary text-xs font-bold uppercase tracking-wider mb-5 shadow-xs">
            <Layers size={13} className="text-blue-600" />
            <span>Comprehensive Solutions</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-5">
            Our <span className="gradient-text">Services</span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            From specialized workforce consulting to global IT strategy, we provide the architecture for high-growth businesses.
          </p>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="section-padding !pt-4 relative overflow-hidden pb-28 bg-slate-50/40">
        <div className="deco-dot top-[20%] left-[8%] w-3 h-3 bg-primary opacity-25 hidden lg:block" />
        <div className="deco-ring w-24 h-24 bottom-[15%] right-[6%] hidden lg:block" />

        <div className="container-custom relative z-10">
          {services.length === 0 ? (
            <div className="glass-card p-16 text-center max-w-xl mx-auto">
              <p className="text-slate-600 text-lg font-semibold">No services available yet.</p>
              <p className="text-slate-400 text-sm mt-2">Admin can add services from the dashboard.</p>
            </div>
          ) : (
            <ServicesInteractiveGrid services={services} />
          )}
        </div>
      </section>
    </>
  );
}
