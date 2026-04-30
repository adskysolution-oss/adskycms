import Image from 'next/image';
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden flex items-center">
      <div className="absolute inset-0">
        <Image
          src="/hero.png"
          alt="Customer support illustration"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/85 via-[#020617]/72 to-[#020617]/55" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(96,165,250,0.1),transparent_30%)]" />

      <div className="container-custom relative z-10 w-full">
        <div className="max-w-3xl mx-auto lg:ml-auto lg:mr-0 text-center lg:text-right pt-24 sm:pt-28 lg:pt-0">
          <div className="mb-6 flex justify-center lg:justify-end">
            <span className="h-px w-24 bg-blue-400/80" />
          </div>

          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-text-secondary">
            Premium Digital Support
          </p>

          <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-blue-300 via-blue-400 to-blue-500 bg-clip-text text-transparent">
              Customer Support:
            </span>
            <br />
            The Heart of Service Excellence
          </h1>

          <p className="mt-6 max-w-xl mx-auto lg:ml-auto lg:mr-0 text-lg leading-8 text-text-secondary">
            Delivering Excellence Through Customer Support
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-end">
            <Link href="/about" className="btn-primary !rounded-xl !px-7 !py-3.5">
              Get Started
              <FaArrowRight size={14} />
            </Link>
            <Link href="/services" className="btn-secondary !rounded-xl !px-7 !py-3.5">
              View Services
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}