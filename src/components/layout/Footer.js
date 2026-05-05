'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaArrowUp } from 'react-icons/fa';

import { usePathname } from 'next/navigation';

const footerLinks = [
  {
    title: 'Services',
    links: [
      { label: 'Web Development', href: '/services' },
      { label: 'App Development', href: '/services' },
      { label: 'Recruitment & Hiring', href: '/services' },
      { label: 'Business Consulting', href: '/services' },
      { label: 'More Services...', href: '/services' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Projects', href: '/projects' },
      { label: 'Contact', href: '/contact' },
      { label: 'Careers', href: '/careers' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', href: '/blogs' },
      // { label: 'Gallery', href: '/gallery' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Refund Policy', href: '/refund-policy' },
      { label: 'Terms & Conditions', href: '/terms-and-conditions' },
    ],
  },
];

const socialIcons = [
  { icon: FaFacebook, href: '#', label: 'Facebook' },
  { icon: FaTwitter, href: '#', label: 'Twitter' },
  { icon: FaLinkedin, href: '#', label: 'LinkedIn' },
  { icon: FaInstagram, href: '#', label: 'Instagram' },
];

export default function Footer() {
  const pathname = usePathname();
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    return null;
  }

  return (

    <footer className="bg-dark-light border-t border-border">
      <div className="container-custom py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-y-12 gap-x-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/logo.png"
                alt="AdSky Solution Logo"
                width={150}
                height={50}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed mb-6 max-w-xs">
              Transforming businesses through innovative digital solutions. We build, market, and scale global brands.
            </p>
            <div className="flex gap-3">
              {socialIcons.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 rounded-xl bg-surface border border-border/50 flex items-center justify-center text-text-secondary hover:text-primary-light hover:border-primary-light/30 transition-all hover:-translate-y-1"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((group) => (
            <div key={group.title} className="flex flex-col">
              <h4 className="text-text-primary font-bold mb-6 text-sm uppercase tracking-widest">
                {group.title}
              </h4>
              <ul className="space-y-4">
                {group.links.map((link, index) => (
                  <li key={`${group.title}-${index}`}>
                    <Link
                      href={link.href}
                      className="text-text-secondary text-sm hover:text-primary-light transition-all flex items-center group"
                    >
                      <span className="w-0 h-[1px] bg-primary-light mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300"></span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div className="col-span-2 md:col-span-1 flex flex-col">
            <h4 className="text-text-primary font-bold mb-6 text-sm uppercase tracking-widest">
              Contact
            </h4>
            <ul className="space-y-4 text-sm text-text-secondary">
              <li className="flex flex-col gap-1">
                <span className="text-text-muted text-[10px] uppercase font-bold tracking-tighter">Email</span>
                <a href="mailto:info@adskysolution.com" className="hover:text-primary-light transition-colors">info@adskysolution.com</a>
              </li>
              <li className="flex flex-col gap-1">
                <span className="text-text-muted text-[10px] uppercase font-bold tracking-tighter">Phone</span>
                <a href="tel:8076611842" className="hover:text-primary-light transition-colors">8076611842</a>
              </li>
              <li className="flex flex-col gap-1">
                <span className="text-text-muted text-[10px] uppercase font-bold tracking-tighter">Office</span>
                <span>AD Sky Solution, 126 Satyam Enclave Sahibabad, Ghaziabad UTTAR PRADESH 201003</span>
              </li>
            </ul>

          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container-custom py-5 flex items-center justify-between">
          <p className="text-text-muted text-sm">© 2026 AdSky Solution. All rights reserved.</p>
          <button
            onClick={scrollToTop}
            className="w-9 h-9 rounded-lg bg-surface hover:bg-primary/20 flex items-center justify-center text-text-secondary hover:text-primary-light transition-all"
            aria-label="Scroll to top"
          >
            <FaArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
}
