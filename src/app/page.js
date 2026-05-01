import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/layout/Footer';
import ServicesSection from '@/components/sections/ServicesSection';
import StrategySection from '@/components/sections/StrategySection';
import VisionMissionSection from '@/components/sections/VisionMissionSection';
import MeetTeamSection from '@/components/sections/MeetTeamSection';
import HowItWorksSection from '@/components/sections/HowItWorksSection';
import BlogPreviewSection from '@/components/sections/BlogPreviewSection';
import CTASection from '@/components/sections/CTASection';
import ContactSection from '@/components/sections/ContactSection';
import { getActiveServices, getPublishedBlogs, getTeamMembers } from '@/lib/data';

export const metadata = {
  title: 'AdSky Solution - Premium IT Company',
  description: 'Premium IT support and scalable digital solutions for modern businesses.',
};

export default async function HomePage() {
  const [services, blogs, team] = await Promise.all([
    getActiveServices(),
    getPublishedBlogs(3),
    getTeamMembers(),
  ]);

  return (
    <>
      <Navbar />
      <Hero />
      <ServicesSection services={services} />
      <StrategySection />
      <VisionMissionSection />
      <MeetTeamSection team={team} />
      <HowItWorksSection />
      <BlogPreviewSection blogs={blogs} />
      <CTASection />
      <ContactSection />
      <Footer />
    </>
  );
}
