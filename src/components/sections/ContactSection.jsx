import ContactForm from '../ContactForm';
import Image from 'next/image';
import PremiumImage from '../PremiumImage';

export default function ContactSection() {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background decoration */}
      <div className="glow-dot bg-primary top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 opacity-20" />

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Side: Image (background removed) */}
          <div className="relative group order-2 lg:order-1">
            <PremiumImage src="/contact.png" alt="contact section image" />

          </div>

          {/* Right Side: Form */}
          <div className="relative order-1 lg:order-2">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Get in Touch</h2>
              <p className="text-text-secondary text-sm">We'd love to hear from you. Let's build something great together.</p>
            </div>
            <ContactForm />
          </div>

        </div>
      </div>
    </section>
  );
}
