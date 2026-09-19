import Link from 'next/link';
import { FaArrowRight, FaClock } from 'react-icons/fa';
import { BookOpen, ArrowRight } from 'lucide-react';
import { FloatingOrb, DottedGrid, GlowBlob } from '../ui/BackgroundEffects';

export default function BlogPreviewSection({ blogs = [] }) {
  if (blogs.length === 0) return null;

  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background Effect Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <GlowBlob color="blue" size="w-[450px] h-[450px]" className="-top-20 -right-28" opacity={0.10} />
        <GlowBlob color="purple" size="w-[350px] h-[350px]" className="bottom-0 -left-20" opacity={0.08} delay="5s" />

        <FloatingOrb variant="purple" size={36} className="top-1/4 -left-4 hidden lg:block" animation="float-slow" delay="1s" />
        <DottedGrid cols={5} rows={4} spacing={16} color="#3B82F6" opacity={0.20} className="bottom-12 right-12 hidden lg:block" />
      </div>

      <div className="container-custom relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-14 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200/60 bg-blue-50/80 text-primary text-xs font-bold uppercase tracking-wider mb-4">
              <BookOpen size={13} />
              <span>Blog</span>
            </div>
            <h2 className="section-title !text-left !mb-2">
              Latest from <span className="gradient-text">Our Blog</span>
            </h2>
            <p className="text-slate-500">Insights, tips, and industry trends</p>
          </div>
          <Link href="/blogs" className="btn-secondary text-sm hidden sm:inline-flex group">
            View All <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Blog Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Link key={blog._id} href={`/blogs/${blog.slug}`} className="glass-card-hover overflow-hidden group">
              {/* Cover Image */}
              <div className="h-48 relative overflow-hidden">
                {blog.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={blog.coverImage}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 text-5xl font-black gradient-text">
                    {blog.title?.charAt(0)}
                  </div>
                )}

                {/* Category pill overlaid */}
                {blog.category && (
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-white/40 text-[11px] font-bold text-primary">
                    {blog.category}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                  <FaClock size={10} />
                  <span>{new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}</span>
                </div>

                <h3 className="text-slate-900 font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                  {blog.title}
                </h3>

                <p className="text-slate-500 text-sm line-clamp-2 mb-4">{blog.excerpt}</p>

                <div className="flex items-center gap-2 text-primary text-sm font-semibold group-hover:gap-3 transition-all">
                  Read More <FaArrowRight size={11} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="text-center mt-8 sm:hidden">
          <Link href="/blogs" className="btn-secondary text-sm">View All Posts</Link>
        </div>
      </div>
    </section>
  );
}
