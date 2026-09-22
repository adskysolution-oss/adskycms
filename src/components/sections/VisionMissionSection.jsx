import { Eye, Target, CheckCircle2, Compass, Sparkles } from 'lucide-react';
import PremiumImage from '../ui/PremiumImage';
import { FloatingOrb, DottedGrid, CurvedLine, GlowBlob } from '../ui/BackgroundEffects';

export default function VisionMissionSection() {
  return (
    <section className="section-padding relative overflow-hidden bg-slate-50/40">
      {/* Background Effect Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <GlowBlob color="purple" size="w-[450px] h-[450px]" className="-top-10 -right-24" opacity={0.12} />
        <GlowBlob color="blue" size="w-[350px] h-[350px]" className="bottom-0 -left-20" opacity={0.10} delay="4s" />

        <FloatingOrb variant="purple" size={38} className="top-1/4 -right-4 hidden lg:block" animation="float-slow" delay="1s" />
        <FloatingOrb variant="ring" size={24} className="bottom-20 right-1/3 hidden md:block" animation="float" delay="2s" />

        <DottedGrid cols={5} rows={5} spacing={16} color="#8B5CF6" opacity={0.25} className="top-12 right-12 hidden lg:block" />
        <CurvedLine variant="arc" width={200} height={70} color="#3B82F6" opacity={0.22} className="bottom-10 left-12 hidden md:block" />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-14 items-center">

          {/* LEFT — Text + Cards */}
          <div className="order-1 lg:order-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200/80 bg-blue-50/90 text-primary text-xs font-bold uppercase tracking-wider mb-5 shadow-xs">
              <Eye size={13} className="text-blue-600" />
              <span>Our Purpose &amp; Values</span>
            </div>

            <h2 className="section-title text-left !mb-4">
              Vision &amp; <span className="gradient-text">Mission</span>
            </h2>
            <p className="text-slate-600 leading-relaxed mb-8 text-base">
              We empower businesses with innovative digital solutions that drive growth, efficiency, and long-term success. Our mission is to deliver scalable, user-focused technology that transforms ideas into impactful results.
            </p>

            {/* Distinctly-Colored Vision & Mission Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* Vision Card (Royal Ocean Blue) */}
              <div className="group relative rounded-3xl p-6 sm:p-7 border-2 border-blue-300/90 hover:border-blue-500 bg-gradient-to-br from-blue-100/90 via-indigo-50/70 to-white transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-[0_4px_20px_-6px_rgba(37,99,235,0.08)] hover:shadow-xl hover:shadow-blue-500/15 hover:-translate-y-1.5">
                {/* Top Accent Stripe */}
                <div className="h-1.5 w-full absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500" />

                {/* Ambient Corner Glow */}
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-400/25 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-2 transition-all shadow-md shadow-blue-500/30">
                      <Eye size={22} />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-600 text-white shadow-2xs">
                      Forward Horizon
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    Vision
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                    To become a leading digital solutions provider, helping businesses scale through innovation, automation, and cutting-edge technology.
                  </p>
                </div>

                <div className="relative z-10 pt-3 border-t border-blue-200/80 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/90 border border-blue-200/80 text-[11px] font-bold text-slate-800 shadow-2xs">
                    <CheckCircle2 size={12} className="text-blue-600" />
                    <span>Innovation-first</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/90 border border-blue-200/80 text-[11px] font-bold text-slate-800 shadow-2xs">
                    <CheckCircle2 size={12} className="text-blue-600" />
                    <span>Global scale</span>
                  </span>
                </div>
              </div>

              {/* Mission Card (Royal Purple / Violet) */}
              <div className="group relative rounded-3xl p-6 sm:p-7 border-2 border-purple-300/90 hover:border-purple-500 bg-gradient-to-br from-purple-100/90 via-violet-50/70 to-white transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-[0_4px_20px_-6px_rgba(147,51,234,0.08)] hover:shadow-xl hover:shadow-purple-500/15 hover:-translate-y-1.5">
                {/* Top Accent Stripe */}
                <div className="h-1.5 w-full absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 via-violet-600 to-pink-500" />

                {/* Ambient Corner Glow */}
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-purple-400/25 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-2 transition-all shadow-md shadow-purple-500/30">
                      <Target size={22} />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-600 text-white shadow-2xs">
                      Value Delivery
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">
                    Mission
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                    To build reliable, scalable, and user-centric digital products that solve real-world problems and create measurable business value.
                  </p>
                </div>

                <div className="relative z-10 pt-3 border-t border-purple-200/80 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/90 border border-purple-200/80 text-[11px] font-bold text-slate-800 shadow-2xs">
                    <CheckCircle2 size={12} className="text-purple-600" />
                    <span>User-centric</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/90 border border-purple-200/80 text-[11px] font-bold text-slate-800 shadow-2xs">
                    <CheckCircle2 size={12} className="text-purple-600" />
                    <span>Measurable impact</span>
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT — Image with funky frame */}
          <div className="order-2 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md lg:max-w-lg">
              {/* Glow behind */}
              <div className="absolute inset-0 m-6 bg-gradient-to-br from-blue-500/15 via-purple-500/10 to-transparent rounded-3xl blur-2xl animate-pulse-slow" />

              {/* Floating pill */}
              <div className="deco-pill top-4 -right-3 animate-float z-20 hidden sm:flex items-center gap-1.5 bg-white/90 shadow-md border border-blue-200">
                <Sparkles size={12} className="text-blue-600" />
                <span className="font-bold text-slate-800 text-xs">Future Ready</span>
              </div>

              <PremiumImage
                src="/mission-vision.png"
                alt="Vision and Mission illustration"
                width={550}
                height={450}
                className="w-full h-auto drop-shadow-md"
              />

              {/* Decorative spinning ring */}
              <div className="absolute -bottom-4 -left-4 w-16 h-16 border-2 border-dashed border-purple-300 rounded-full animate-spin-slow hidden lg:block" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
