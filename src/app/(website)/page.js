import HeroSection from '@/components/sections/HeroSection';
import ServicesSection from '@/components/sections/ServicesSection';
import StrategySection from '@/components/sections/StrategySection';
import CategoriesSection from '@/components/sections/CategoriesSection';
import WhyUsSection from '@/components/sections/WhyUsSection';
import HowItWorksSection from '@/components/sections/HowItWorksSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import BlogPreview from '@/components/sections/BlogPreview';
import CTASection from '@/components/sections/CTASection';

const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function getPageData() {
  try {
    const res = await fetch(`${BASE}/api/pages?slug=home`, { cache: 'no-store' });
    const data = await res.json();
    return data.page;
  } catch {
    return null;
  }
}

async function getBlogs() {
  try {
    const res = await fetch(`${BASE}/api/blogs?limit=3`, { cache: 'no-store' });
    const data = await res.json();
    return data.blogs || [];
  } catch {
    return [];
  }
}

function getSection(page, sectionId) {
  return page?.sections?.find((s) => s.sectionId === sectionId && s.isVisible);
}

export default async function HomePage() {
  const [page, blogs] = await Promise.all([getPageData(), getBlogs()]);

  return (
    <>
      <HeroSection data={getSection(page, 'hero')} />
      <ServicesSection data={getSection(page, 'services')} />
      <StrategySection data={getSection(page, 'strategy')} />
      <CategoriesSection data={getSection(page, 'categories')} />
      <WhyUsSection data={getSection(page, 'whyus')} />
      <HowItWorksSection data={getSection(page, 'howitworks')} />
      <TestimonialsSection data={getSection(page, 'testimonials')} />
      <BlogPreview blogs={blogs} />
      <CTASection data={getSection(page, 'cta')} />
    </>
  );
}
