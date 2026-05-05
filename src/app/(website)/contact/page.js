import ContactForm from '@/components/ContactForm';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';

export const metadata = {
  title: 'Contact - AdSky Solution',
  description: 'Contact us for premium IT and digital services',
};

export default function ContactPage() {
  return (
    <>
      {/* Hero (Hardcoded) */}
      <section className="relative pt-32 pb-20">
        <div className="glow-dot bg-primary top-20 right-0 animate-pulse-slow" />
        <div className="container-custom relative z-10 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6">
            Our <span className="gradient-text">Contact</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">Have a project or question? Send us a message and we'll get back to you shortly.</p>
        </div>
      </section>

      <section className="min-h-screen section-padding">
        <div className="container-custom grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div>
            {/* <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-text-primary mb-3">Contact Us</h1>
              <p className="text-text-secondary">Have a project or question? Send us a message and we'll get back to you shortly.</p>
            </div> */}

            <div className="p-6">
              <div className='p-2'>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Email & Phone</h3>
                <p className="text-text-secondary text-sm mb-2">info@adskysolution.com</p>
                <p className="text-text-secondary text-sm">8076611842</p>
              </div>

              <hr className="my-6 border-border" />

              <div className='p-2'>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Our Location</h3>
                <p className="text-text-secondary text-sm">AD Sky Solution, 126 Satyam Enclave Sahibabad, Ghaziabad UTTAR PRADESH 201003</p>
              </div>


              <hr className="my-6 border-border" />

              <div className='p-2'>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Get in Touch</h3>
                <p className="text-text-secondary text-sm">www.adskysolution.com</p>
              </div>

            </div>
          </div>

          <div>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
