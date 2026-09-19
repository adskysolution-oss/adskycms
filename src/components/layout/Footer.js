'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaArrowUp } from 'react-icons/fa';
import { usePathname } from 'next/navigation';
import logoImg from '../../../public/logo.png';
import { CurvedLine } from '../ui/BackgroundEffects';

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

  // Hide AdSky Footer on MLM member portal, admin, and dashboard pages (they have their own dedicated layouts)
  const isHiddenRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname === '/nextview' ||
    pathname.startsWith('/nextview/') ||
    pathname.startsWith('/recruitment/dashboard');

  if (isHiddenRoute) {
    return null;
  }

  return (
    <footer className="relative overflow-hidden bg-slate-900 text-white">
      {/* Decorative top gradient line */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-violet-500 to-cyan-400" />

      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-violet-500/5 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl pointer-events-none" />
      <CurvedLine variant="wave" width={300} height={60} color="#3B82F6" opacity={0.10} className="top-10 right-10 hidden xl:block" />

      <div className="container-custom py-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-12 gap-x-6 xl:gap-x-8">

          {/* Column 1 & 2: Brand & Social */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2 flex flex-col justify-between">
            <div>
              <Link href="/" className="inline-block mb-5">
                <Image
                  src={logoImg}
                  alt="AdSky Solution Logo"
                  className="h-10 w-auto object-contain brightness-0 invert"
                />
              </Link>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6 max-w-sm">
                Transforming businesses through innovative digital solutions, strategic talent acquisition, and sustainable referral ecosystems.
              </p>
            </div>
            <div className="flex gap-2.5">
              {socialIcons.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-primary/50 hover:bg-primary/10 transition-all hover:-translate-y-0.5"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Columns 3, 4, 5: Link Groups */}
          {footerSections.slice(0, 3).map((group) => (
            <div key={group.title} className="col-span-1 flex flex-col">
              <h4 className="text-white font-bold mb-5 text-xs uppercase tracking-widest">
                {group.title}
              </h4>
              <ul className="space-y-3.5">
                {group.links.map((link, index) => (
                  <li key={`${group.title}-${index}`}>
                    <Link
                      href={link.href}
                      className="text-slate-400 text-xs hover:text-white transition-all flex items-center group"
                    >
                      <span className="w-0 h-[1px] bg-primary mr-0 group-hover:w-2.5 group-hover:mr-1.5 transition-all duration-300"></span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Column 6: Contact Info */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-1 flex flex-col">
            <h4 className="text-white font-bold mb-5 text-xs uppercase tracking-widest">
              Contact
            </h4>
            <ul className="space-y-3.5 text-xs text-slate-400">
              <li className="flex flex-col gap-0.5">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Email</span>
                <a href="mailto:info@adskysolution.com" className="hover:text-white transition-colors break-all">
                  info@adskysolution.com
                </a>
              </li>
              <li className="flex flex-col gap-0.5">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Phone</span>
                <a href="tel:8076611842" className="hover:text-white transition-colors">
                  +91 8076611842
                </a>
              </li>
              <li className="flex flex-col gap-0.5">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Office</span>
                <span className="leading-relaxed">126 Satyam Enclave Sahibabad, Ghaziabad, UP 201003</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-custom py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} AdSky Solution. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>&bull;</span>
            <Link href="/terms-and-conditions" className="hover:text-white transition-colors">
              Terms &amp; Conditions
            </Link>
            <span>&bull;</span>
            <Link href="/refund-policy" className="hover:text-white transition-colors">
              Refund Policy
            </Link>
          </div>
          <button
            type="button"
            onClick={scrollToTop}
            suppressHydrationWarning
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-primary/20 hover:border-primary/40 flex items-center justify-center text-slate-400 hover:text-white transition-all"
            aria-label="Scroll to top"
          >
            <FaArrowUp size={12} />
          </button>
        </div>
      </div>
    </footer>
  );
}
