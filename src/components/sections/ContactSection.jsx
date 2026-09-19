import ContactForm from '../forms/ContactForm';
import PremiumImage from '../ui/PremiumImage';
import { MessageCircle, Mail, Phone, MapPin } from 'lucide-react';
import { FloatingOrb, DottedGrid, GlowBlob } from '../ui/BackgroundEffects';

export default function ContactSection() {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background Effect Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <GlowBlob color="blue" size="w-[500px] h-[500px]" className="-top-20 -left-32" opacity={0.11} />
        <GlowBlob color="purple" size="w-[350px] h-[350px]" className="bottom-0 -right-20" opacity={0.08} delay="5s" />

        <FloatingOrb variant="cyan" size={38} className="top-1/4 -right-4 hidden lg:block" animation="float-slow" delay="1s" />
        <FloatingOrb variant="peach" size={30} className="bottom-1/3 -left-3 hidden md:block" animation="float-reverse" delay="2.5s" />
        <DottedGrid cols={6} rows={5} spacing={16} color="#3B82F6" opacity={0.24} className="bottom-6 left-6 hidden md:block" />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Side: Image + Contact Mini Cards */}
          <div className="relative order-2 lg:order-1 space-y-6">
            {/* Contact Image */}
            <div className="relative">
              <div className="absolute inset-0 m-8 bg-gradient-to-br from-primary/8 via-secondary/5 to-transparent rounded-3xl blur-2xl animate-pulse-slow" />
              <PremiumImage src="/contact.png" alt="contact section image" />
            </div>

            {/* Contact Info Mini Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="glass-card p-4 flex items-center gap-3 group hover:border-primary/30 transition-colors cursor-default">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                  <Mail size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email</p>
                  <a href="mailto:info@adskysolution.com" className="text-xs text-slate-700 hover:text-primary transition-colors truncate block">
                    info@adskysolution.com
                  </a>
                </div>
              </div>
              <div className="glass-card p-4 flex items-center gap-3 group hover:border-primary/30 transition-colors cursor-default">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center text-white flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                  <Phone size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Phone</p>
                  <a href="tel:8076611842" className="text-xs text-slate-700 hover:text-primary transition-colors">
                    +91 8076611842
                  </a>
                </div>
              </div>
              <div className="glass-card p-4 flex items-center gap-3 group hover:border-primary/30 transition-colors cursor-default">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center text-white flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                  <MapPin size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Office</p>
                  <p className="text-xs text-slate-700 truncate">Satyam Enclave, Ghaziabad</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="relative order-1 lg:order-2">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200/60 bg-blue-50/80 text-primary text-xs font-bold uppercase tracking-wider mb-4">
                <MessageCircle size={13} />
                <span>Direct Communication</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Get in Touch</h2>
              <p className="text-slate-500 text-sm">We&apos;d love to hear from you. Let&apos;s build something great together.</p>
            </div>

            {/* Form Card */}
            <div className="glass-card p-6 sm:p-8">
              <ContactForm />
            </div>

            {/* Response SLA */}
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span>Typically responds within 2 hours</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
