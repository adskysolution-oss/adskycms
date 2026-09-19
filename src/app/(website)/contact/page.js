import ContactForm from '@/components/forms/ContactForm';
import { Mail, Phone, MapPin, Globe, Sparkles, Clock, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Contact - AdSky Solution',
  description: 'Contact us for premium IT and digital services',
};

export default function ContactPage() {
  const contactDetails = [
    {
      title: 'Email & Phone',
      icon: Mail,
      accent: 'from-blue-500 to-cyan-400',
      lines: [
        { label: 'Email', value: 'info@adskysolution.com', href: 'mailto:info@adskysolution.com' },
        { label: 'Phone', value: '8076611842', href: 'tel:8076611842' },
      ],
    },
    {
      title: 'Our Location',
      icon: MapPin,
      accent: 'from-violet-500 to-purple-400',
      lines: [
        { label: 'Address', value: 'AD Sky Solution, 126 Satyam Enclave Sahibabad, Ghaziabad UTTAR PRADESH 201003' },
      ],
    },
    {
      title: 'Get in Touch',
      icon: Globe,
      accent: 'from-amber-500 to-orange-400',
      lines: [
        { label: 'Website', value: 'www.adskysolution.com', href: 'https://www.adskysolution.com' },
      ],
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="deco-blob deco-blob-blue w-[500px] h-[500px] -top-32 -right-32 animate-blob" />
        <div className="deco-blob deco-blob-purple w-[400px] h-[400px] top-1/2 -left-32 animate-blob" style={{ animationDelay: '5s' }} />

        <div className="container-custom relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200/60 bg-blue-50/80 text-primary text-xs font-bold uppercase tracking-wider mb-5">
            <Sparkles size={13} />
            <span>Direct Support Channel</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
            Our <span className="gradient-text">Contact</span>
          </h1>

          <p className="text-slate-500 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Have a project or question? Send us a message and we&apos;ll get back to you shortly.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding !pt-4 relative overflow-hidden pb-24">
        <div className="deco-dot top-[30%] right-[10%] w-3 h-3 bg-secondary opacity-25 hidden lg:block" />
        <div className="deco-ring w-20 h-20 bottom-[20%] left-[5%] hidden lg:block" />

        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Contact Info Cards */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-4">
                {contactDetails.map((item, idx) => (
                  <div key={idx} className="glass-card-hover p-6 group">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.accent} flex items-center justify-center text-white flex-shrink-0 shadow-md group-hover:scale-105 transition-transform`}>
                        <item.icon size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-slate-900 mb-2">
                          {item.title}
                        </h3>
                        <div className="space-y-1 text-sm text-slate-600">
                          {item.lines.map((line, lIdx) => (
                            <div key={lIdx}>
                              {line.href ? (
                                <a
                                  href={line.href}
                                  className="text-primary hover:underline font-medium break-all block"
                                >
                                  {line.value}
                                </a>
                              ) : (
                                <p className="leading-relaxed">{line.value}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Response SLA badge */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/70 to-indigo-50/50 border border-blue-100 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-xs flex-shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Swift Response Commitment</p>
                  <p className="text-[11px] text-slate-500">Typical response time is under 4 business hours.</p>
                </div>
              </div>
            </div>

            {/* Right Contact Form */}
            <div className="lg:col-span-7">
              <div className="glass-card p-8 sm:p-10 shadow-lg border border-slate-200/80">
                <div className="mb-6 flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                  <ShieldCheck size={14} />
                  <span>Verified Channel</span>
                </div>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
