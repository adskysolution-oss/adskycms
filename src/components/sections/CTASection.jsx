import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';

export default function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10" />
      <div className="glow-dot bg-primary top-0 left-1/4 animate-pulse-slow" />
      <div className="glow-dot bg-secondary bottom-0 right-1/4 animate-pulse-slow" style={{ animationDelay: '2s' }} />
      <div className="container-custom relative z-10 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-6 leading-tight">
          Ready to Transform Your Business?
        </h2>
        <p className="text-text-secondary text-lg max-w-xl mx-auto mb-10">Let us help you achieve your digital goals</p>
        <Link href="/about" className="btn-primary text-base !py-4 !px-10">
          Contact Us <FaArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
