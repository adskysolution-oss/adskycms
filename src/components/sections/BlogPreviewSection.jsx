import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';
import { FloatingOrb, DottedGrid, GlowBlob } from '../ui/BackgroundEffects';
import BlogCard from '../ui/BlogCard';

export default function BlogPreviewSection({ blogs = [] }) {
  if (blogs.length === 0) return null;

  return (
    <section className="section-padding relative overflow-hidden bg-slate-50/40">
      {/* Background Effect Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <GlowBlob color="blue" size="w-[450px] h-[450px]" className="-top-20 -right-28" opacity={0.12} />
        <GlowBlob color="purple" size="w-[350px] h-[350px]" className="bottom-0 -left-20" opacity={0.10} delay="5s" />

        <FloatingOrb variant="purple" size={36} className="top-1/4 -left-4 hidden lg:block" animation="float-slow" delay="1s" />
        <DottedGrid cols={5} rows={4} spacing={16} color="#3B82F6" opacity={0.22} className="bottom-12 right-12 hidden lg:block" />
      </div>

      <div className="container-custom relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200/80 bg-blue-50/90 text-primary text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
              <BookOpen size={13} className="text-blue-600" />
              <span>Articles &amp; Insights</span>
            </div>
            <h2 className="section-title !text-left !mb-2">
              Latest from <span className="gradient-text">Our Blog</span>
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">Insights, tips, and industry trends from our team</p>
          </div>
          <Link href="/blogs" className="btn-secondary text-xs sm:text-sm hidden sm:inline-flex group !rounded-xl !px-5 !py-2.5">
            View All Articles <ArrowRight size={14} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Distinctly-Colored Blog Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-7">
          {blogs.map((blog, idx) => (
            <BlogCard key={blog._id} blog={blog} index={idx} />
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="text-center mt-8 sm:hidden">
          <Link href="/blogs" className="btn-secondary text-sm !rounded-xl">View All Articles</Link>
        </div>
      </div>
    </section>
  );
}
