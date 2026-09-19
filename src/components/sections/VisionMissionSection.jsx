import { FaEye, FaBullseye, FaCheckCircle } from 'react-icons/fa';
import { Eye, Target } from 'lucide-react';
import PremiumImage from '../ui/PremiumImage';
import { FloatingOrb, DottedGrid, CurvedLine, GlowBlob } from '../ui/BackgroundEffects';

export default function VisionMissionSection() {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background Effect Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <GlowBlob color="purple" size="w-[450px] h-[450px]" className="-top-10 -right-24" opacity={0.11} />
        <GlowBlob color="blue" size="w-[350px] h-[350px]" className="bottom-0 -left-20" opacity={0.09} delay="4s" />

        <FloatingOrb variant="purple" size={38} className="top-1/4 -right-4 hidden lg:block" animation="float-slow" delay="1s" />
        <FloatingOrb variant="ring" size={24} className="bottom-20 right-1/3 hidden md:block" animation="float" delay="2s" />

        <DottedGrid cols={5} rows={5} spacing={16} color="#8B5CF6" opacity={0.25} className="top-12 right-12 hidden lg:block" />
        <CurvedLine variant="arc" width={200} height={70} color="#3B82F6" opacity={0.22} className="bottom-10 left-12 hidden md:block" />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* LEFT — Text + Cards */}
          <div className="order-1 lg:order-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200/60 bg-blue-50/80 text-primary text-xs font-bold uppercase tracking-wider mb-5">
              <Eye size={13} />
              <span>Our Purpose</span>
            </div>

            <h2 className="section-title mb-4">
              Vision &amp; <span className="gradient-text">Mission</span>
            </h2>
            <p className="text-slate-500 leading-relaxed mb-10 text-base">
              We empower businesses with innovative digital solutions that drive growth, efficiency, and long-term success. Our mission is to deliver scalable, user-focused technology that transforms ideas into impactful results.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Vision Card */}
              <div className="glass-card-hover p-6 group">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform shadow-sm">
                  <Eye size={18} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Vision</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  To become a leading digital solutions provider, helping businesses scale through innovation, automation, and cutting-edge technology.
                </p>
                <ul className="mt-3 space-y-1.5">
                  {['Innovation-first', 'Global scale'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-slate-400">
                      <FaCheckCircle className="text-green-400" size={10} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mission Card */}
              <div className="glass-card-hover p-6 group">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform shadow-sm">
                  <Target size={18} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Mission</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  To build reliable, scalable, and user-centric digital products that solve real-world problems and create measurable business value.
                </p>
                <ul className="mt-3 space-y-1.5">
                  {['User-centric', 'Measurable impact'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-slate-400">
                      <FaCheckCircle className="text-green-400" size={10} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* RIGHT — Image with funky frame */}
          <div className="order-2 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md lg:max-w-lg">
              {/* Glow behind */}
              <div className="absolute inset-0 m-6 bg-gradient-to-br from-primary/8 via-secondary/5 to-transparent rounded-3xl blur-2xl animate-pulse-slow" />

              {/* Floating pill */}
              <div className="deco-pill top-4 -right-3 animate-float z-20 hidden sm:flex items-center gap-1.5">
                <Eye size={11} className="text-primary" />
                <span>Future Ready</span>
              </div>

              <PremiumImage
                src="/mission-vision.png"
                alt="Vision and Mission illustration"
                width={550}
                height={450}
                className="w-full h-auto"
              />

              {/* Decorative spinning ring */}
              <div className="absolute -bottom-4 -left-4 w-16 h-16 border-2 border-dashed border-secondary/15 rounded-full animate-spin-slow hidden lg:block" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
