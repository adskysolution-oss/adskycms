import Hero from '@/components/Hero';
import ServicesSection from '@/components/sections/ServicesSection';
import StrategySection from '@/components/sections/StrategySection';
import JobCategoriesSection from '@/components/sections/JobCategoriesSection';
import VisionMissionSection from '@/components/sections/VisionMissionSection';
import HowItWorksSection from '@/components/sections/HowItWorksSection';
import MeetTeamSection from '@/components/sections/MeetTeamSection';
import BlogPreviewSection from '@/components/sections/BlogPreviewSection';
import CTASection from '@/components/sections/CTASection';
import AboutCompanySection from '@/components/sections/AboutCompanySection';
import { getActiveServices, getPublishedBlogs, getTeamMembers } from '@/lib/data';
import ContactSection from '@/components/sections/ContactSection';

export const metadata = {
  title: 'AdSky Solution - Premium IT Solutions & Strategic Hiring',
  description: 'Elevate your business with premium IT development and an integrated hiring system. We build smart technology and connect you with top talent.',
};

export default async function HomePage() {
  // Fetch real data for sections
  const [services, blogs, team] = await Promise.all([
    getActiveServices(),
    getPublishedBlogs(3),
    getTeamMembers()
  ]);

  return (
    <>
      <Hero />

      <div className="relative z-10 bg-black">
        {/* <AboutCompanySection /> */}
        <ServicesSection services={services} />
        <StrategySection />
        <JobCategoriesSection />

        {/* Subtle separator */}
        <div className="container-custom">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>

        <VisionMissionSection />
        <HowItWorksSection />

        <BlogPreviewSection blogs={blogs} />
        <MeetTeamSection team={team} />
        <CTASection />
        <ContactSection />
      </div>
    </>
  );
}
