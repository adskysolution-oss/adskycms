import Link from 'next/link';
import { BookOpen, Sparkles, Mail, ArrowRight } from 'lucide-react';
import { getPublishedBlogs } from '@/lib/data';
import BlogCard from '@/components/ui/BlogCard';
import { FloatingOrb, DottedGrid, GeometricAccent, GlowBlob } from '@/components/ui/BackgroundEffects';

export const metadata = {
  title: 'Blog & Industry Insights — AdSky Solution',
  description: 'Explore the latest articles, technology trends, business growth frameworks, and digital innovation insights from the AdSky Solution engineering and strategy team.',
};

export default async function BlogsPage() {
  const blogs = await getPublishedBlogs(24);

  return (
    <div className="min-h-screen bg-slate-50/40 text-slate-900">
      {/* ── HERO SECTION ─────────────────────────────────────────── */}
      <section className="relative pt-32 pb-16 overflow-hidden bg-gradient-to-b from-blue-50/60 via-white to-slate-50/40 border-b border-slate-200/70">
        {/* Background Ambient Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <GlowBlob color="blue" size="w-[520px] h-[520px]" className="-top-28 -right-32" opacity={0.15} />
          <GlowBlob color="purple" size="w-[420px] h-[420px]" className="bottom-0 -left-28" opacity={0.12} delay="4s" />
          <FloatingOrb variant="blue" size={38} className="top-1/4 -left-5 hidden lg:block" animation="float-slow" delay="1s" />
          <FloatingOrb variant="peach" size={32} className="bottom-1/3 -right-4 hidden lg:block" animation="float-reverse" delay="2.5s" />
          <DottedGrid cols={6} rows={6} spacing={16} color="#3B82F6" opacity={0.25} className="top-1/4 left-4 hidden md:block" />
          <GeometricAccent type="sparkle" size={14} color="#06B6D4" opacity={0.35} className="top-20 right-1/4 hidden md:block" delay="1.5s" />
        </div>

        <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200/80 bg-blue-50/90 text-primary text-xs font-bold uppercase tracking-wider mb-5 shadow-xs">
            <BookOpen size={13} className="text-blue-600" />
            <span>Knowledge Hub &amp; Insights</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-5">
            Our <span className="gradient-text">Blog</span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Practical strategies, high-impact tutorials, and digital innovation trends from our engineering and business consulting specialists.
          </p>

          {/* Quick Categories Bar */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
            <span className="px-3.5 py-1.5 rounded-full bg-blue-600 text-white shadow-sm shadow-blue-600/25">
              All Articles
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 text-slate-600 hover:border-blue-300 transition">
              Technology
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 text-slate-600 hover:border-emerald-300 transition">
              Business Growth
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 text-slate-600 hover:border-purple-300 transition">
              Career &amp; Skills
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 text-slate-600 hover:border-amber-300 transition">
              Partner Network
            </span>
          </div>
        </div>
      </section>

      {/* ── BLOGS GRID SECTION ───────────────────────────────────── */}
      <section className="section-padding !pt-12 relative overflow-hidden pb-24">
        <div className="container-custom relative z-10">
          {blogs.length === 0 ? (
            <div className="glass-card p-16 text-center max-w-xl mx-auto rounded-3xl bg-white border border-slate-200 shadow-md">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                <BookOpen size={28} />
              </div>
              <p className="text-slate-900 text-lg font-bold">No blog posts published yet.</p>
              <p className="text-slate-500 text-sm mt-1.5">Check back soon for new articles and technical updates.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {blogs.map((blog, idx) => (
                <BlogCard key={blog._id} blog={blog} index={idx} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── NEWSLETTER SUBSCRIPTION CTA ──────────────────────────── */}
      <section className="pb-24">
        <div className="container-custom">
          <div className="relative rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white shadow-2xl overflow-hidden text-center max-w-4xl mx-auto">
            {/* Ambient Lighting Circles inside Banner */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/15 border border-white/25 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={13} className="text-yellow-300" />
                <span>Stay Ahead</span>
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black">
                Get Weekly Tech &amp; Growth Insights
              </h3>
              <p className="text-blue-100 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto">
                Subscribe to our curated newsletter. Receive high-value architecture blueprints, business growth playbooks, and tech breakdowns straight to your inbox.
              </p>

              {/* Input Form */}
              <div className="pt-2 max-w-md mx-auto flex flex-col sm:flex-row gap-2.5">
                <input
                  type="email"
                  placeholder="Enter your business email"
                  aria-label="Email address"
                  className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/30 text-white placeholder-blue-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                />
                <button
                  type="button"
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-blue-50 text-blue-700 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-all shrink-0 cursor-pointer"
                >
                  <span>Subscribe</span>
                  <ArrowRight size={15} />
                </button>
              </div>
              <p className="text-[11px] text-blue-200 pt-1">
                Zero spam. Unsubscribe anytime with 1-click.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
