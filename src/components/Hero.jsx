import Image from 'next/image';
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';
import { TypingText } from './ui/typing-text';
import PremiumImage from './PremiumImage';

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden flex items-center" style={{ backgroundColor: '#000000' }}>
      {/* Dark overlay background */}
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.03),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.02),transparent_30%)]" />

      <div className="container-custom relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-24 sm:pt-28 lg:pt-0">

          {/* LEFT — Text content */}
          <div className="text-center lg:text-left">
            <div className="mb-6 flex justify-center lg:justify-start">
              <span className="h-px w-70 bg-white/30" />
            </div>

            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-text-secondary">
              Premium Digital Support
            </p>

            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl mb-6">
              <span className="bg-gradient-to-r from-gray-100 via-white to-gray-300 bg-clip-text text-transparent">
                <TypingText text="Build Scalable Digital Solutions" />
              </span>
              <br />
              <TypingText text="With Smart " delay={1.6} />
              <TypingText text="Technology" className="text-blue-500" delay={2.1} />
              <TypingText text=" & Talent" delay={2.6} />
            </h1>

            <p className="mt-6 max-w-xl mx-auto lg:mx-0 text-lg leading-8 text-text-secondary">
              We help businesses grow faster with IT development, web solutions, and recruitment services across India.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <Link href="/about" className="btn-primary !rounded-xl !px-7 !py-3.5">
                Get Started
                <FaArrowRight size={14} />
              </Link>
              <Link href="/services" className="btn-secondary !rounded-xl !px-7 !py-3.5">
                View Services
              </Link>
            </div>
          </div>

          {/* RIGHT — Hero image */}
          <PremiumImage src="/hero1.png" alt="Hero Image" />

        </div>
      </div>
    </section>
  );
}