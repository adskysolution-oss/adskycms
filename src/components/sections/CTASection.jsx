import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { FloatingOrb, CurvedLine } from '../ui/BackgroundEffects';

export default function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Premium gradient bg */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700" />

      {/* Decorative overlay pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl" />

        <FloatingOrb variant="peach" size={40} className="top-12 left-12 hidden md:block" animation="float-slow" delay="1s" />
        <FloatingOrb variant="cyan" size={32} className="bottom-12 right-14 hidden lg:block" animation="float-reverse" delay="2.5s" />
        <CurvedLine variant="wave" width={260} height={60} color="#FFFFFF" opacity={0.18} className="top-1/3 -right-6 hidden xl:block" />
      </div>

      <div className="container-custom relative z-10 text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 text-white text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur-sm">
          <Sparkles size={13} />
          <span>Let&apos;s Build Together</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 leading-tight tracking-tight max-w-3xl mx-auto">
          Ready to Transform <br className="hidden sm:block" />Your Business?
        </h2>

        <p className="text-blue-100/80 text-lg max-w-xl mx-auto mb-10">
          Let us help you achieve your digital goals with premium solutions
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Link
            href="/auth/join"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-700 font-bold rounded-xl hover:bg-blue-50 transition-all hover:shadow-xl hover:shadow-white/20 hover:-translate-y-0.5 text-base"
          >
            Partner With Us <ArrowRight size={16} />
          </Link>
          <Link
            href="/careers"
            className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-all hover:-translate-y-0.5 text-base backdrop-blur-sm"
          >
            Explore Careers
          </Link>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6">
          {[
            { icon: ShieldCheck, text: 'Enterprise Security' },
            { icon: Zap, text: 'Fast Delivery' },
            { icon: Sparkles, text: '24/7 Support' },
          ].map((badge) => (
            <div key={badge.text} className="flex items-center gap-2 text-blue-100/70 text-xs font-medium">
              <badge.icon size={14} />
              <span>{badge.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
