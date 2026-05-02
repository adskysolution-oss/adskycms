import ContactForm from '../ContactForm';
import Image from 'next/image';

export default function ContactSection() {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background decoration */}
      <div className="glow-dot bg-primary top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 opacity-20" />

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Side: Image */}
          <div className="relative group order-2 lg:order-1">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-[2rem] blur-2xl  transition-duration-700" />
            <div className="relative aspect-square md:aspect-video lg:aspect-square overflow-hidden rounded-[2rem] glass-card border-none bg-white/[0.02]">
              <Image
                src="/contact.png"
                alt="Contact Us"
                fill
                className="object-contain p-8"
                priority
              />
            </div>
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
