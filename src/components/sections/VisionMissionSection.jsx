import Image from 'next/image';
import { FaEye, FaBullseye } from 'react-icons/fa';

export default function VisionMissionSection() {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* LEFT — Text + Cards */}
          <div className="order-1 lg:order-1">
            <h2 className="section-title mb-4">
              Vision & <span className="gradient-text">Mission</span>
            </h2>
            <p className="text-text-secondary leading-relaxed mb-10">
              We empower businesses with innovative digital solutions that drive growth, efficiency, and long-term success. Our mission is to deliver scalable, user-focused technology that transforms ideas into impactful results.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Vision Card */}
              <div className="glass-card-hover p-6 group">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:from-primary/30 group-hover:to-secondary/30 transition-all">
                  <FaEye className="text-primary-light" size={18} />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Vision</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  To become a leading digital solutions provider, helping businesses scale through innovation, automation, and cutting-edge technology.
                </p>
              </div>

              {/* Mission Card */}
              <div className="glass-card-hover p-6 group">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:from-primary/30 group-hover:to-secondary/30 transition-all">
                  <FaBullseye className="text-primary-light" size={18} />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Mission</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  To build reliable, scalable, and user-centric digital products that solve real-world problems and create measurable business value.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT — Image */}
          <div className="order-2 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md lg:max-w-lg">
              <Image
                src="/mission-vision.png"
                alt="Vision and Mission illustration"
                width={550}
                height={450}
                className="relative z-10 w-full h-auto object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.04)]"
              />
              <div className="absolute inset-0 -m-4 rounded-3xl bg-white/[0.02] blur-2xl pointer-events-none" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
