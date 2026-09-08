'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaArrowUp } from 'react-icons/fa';
import { usePathname } from 'next/navigation';

const footerSections = [
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
    title: 'Partner Programs',
    links: [
      { label: 'Corporate Partner', href: '/corporate-partner' },
      { label: 'NexVia 3×15 Matrix', href: '/nextview-network' },
      { label: 'Recruitment Partner', href: '/recruitment/login' },
      { label: 'Join Network', href: '/nextview/register' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Projects', href: '/projects' },
      { label: 'Careers', href: '/careers' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Blog', href: '/blogs' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Refund Policy', href: '/refund-policy' },
      { label: 'Terms & Conditions', href: '/terms-and-conditions' },
      { label: 'Contact Us', href: '/contact' },
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
        {/* 6-Column Balanced Grid: 2 cols Brand + 4 x 1 col Links + 1 x 1.5 col Contact */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-12 gap-x-6 xl:gap-x-8">
          {/* Column 1 & 2: Brand & Social */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2 flex flex-col justify-between">
            <div>
              <Link href="/" className="inline-block mb-5">
                <Image
                  src="/logo.png"
                  alt="AdSky Solution Logo"
                  width={140}
                  height={45}
                  className="h-9 w-auto object-contain"
                />
              </Link>
              <p className="text-text-secondary text-xs sm:text-sm leading-relaxed mb-6 max-w-sm">
                Transforming businesses through innovative digital solutions, strategic talent acquisition, and sustainable referral ecosystems.
              </p>
            </div>
            <div className="flex gap-2.5">
              {socialIcons.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-surface border border-border/50 flex items-center justify-center text-text-secondary hover:text-primary-light hover:border-primary-light/30 transition-all hover:-translate-y-0.5"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Columns 3, 4, 5: Link Groups */}
          {footerSections.slice(0, 3).map((group) => (
            <div key={group.title} className="col-span-1 flex flex-col">
              <h4 className="text-text-primary font-bold mb-5 text-xs uppercase tracking-widest">
                {group.title}
              </h4>
              <ul className="space-y-3.5">
                {group.links.map((link, index) => (
                  <li key={`${group.title}-${index}`}>
                    <Link
                      href={link.href}
                      className="text-text-secondary text-xs hover:text-primary-light transition-all flex items-center group"
                    >
                      <span className="w-0 h-[1px] bg-primary-light mr-0 group-hover:w-2.5 group-hover:mr-1.5 transition-all duration-300"></span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Column 6: Contact Info (Always in top row) */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-1 flex flex-col">
            <h4 className="text-text-primary font-bold mb-5 text-xs uppercase tracking-widest">
              Contact
            </h4>
            <ul className="space-y-3.5 text-xs text-text-secondary">
              <li className="flex flex-col gap-0.5">
                <span className="text-text-muted text-[10px] uppercase font-bold tracking-wider">Email</span>
                <a href="mailto:info@adskysolution.com" className="hover:text-primary-light transition-colors break-all">
                  info@adskysolution.com
                </a>
              </li>
              <li className="flex flex-col gap-0.5">
                <span className="text-text-muted text-[10px] uppercase font-bold tracking-wider">Phone</span>
                <a href="tel:8076611842" className="hover:text-primary-light transition-colors">
                  +91 8076611842
                </a>
              </li>
              <li className="flex flex-col gap-0.5">
                <span className="text-text-muted text-[10px] uppercase font-bold tracking-wider">Office</span>
                <span className="leading-relaxed">126 Satyam Enclave Sahibabad, Ghaziabad, UP 201003</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Legal */}
      <div className="border-t border-border">
        <div className="container-custom py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
          <p>&copy; {new Date().getFullYear()} AdSky Solution. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/privacy-policy" className="hover:text-primary-light transition-colors">
              Privacy Policy
            </Link>
            <span>&bull;</span>
            <Link href="/terms-and-conditions" className="hover:text-primary-light transition-colors">
              Terms &amp; Conditions
            </Link>
            <span>&bull;</span>
            <Link href="/refund-policy" className="hover:text-primary-light transition-colors">
              Refund Policy
            </Link>
          </div>
          <button
            onClick={scrollToTop}
            className="w-8 h-8 rounded-lg bg-surface hover:bg-primary/20 flex items-center justify-center text-text-secondary hover:text-primary-light transition-all"
            aria-label="Scroll to top"
          >
            <FaArrowUp size={12} />
          </button>
        </div>
      </div>
    </footer>
  );
}
