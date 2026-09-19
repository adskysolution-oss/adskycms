import Link from 'next/link';
import { FaClock, FaEye } from 'react-icons/fa';
import { BookOpen, ArrowRight } from 'lucide-react';
import { getPublishedBlogs } from '@/lib/data';

export const metadata = { title: 'Blog - AdSky Solution' };

export default async function BlogsPage() {
  const blogs = await getPublishedBlogs(20);

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="deco-blob deco-blob-blue w-[500px] h-[500px] -top-32 -right-32 animate-blob" />
        <div className="deco-blob deco-blob-purple w-[400px] h-[400px] top-1/2 -left-32 animate-blob" style={{ animationDelay: '5s' }} />

        <div className="container-custom relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200/60 bg-blue-50/80 text-primary text-xs font-bold uppercase tracking-wider mb-5">
            <BookOpen size={13} />
            <span>Articles &amp; Insights</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
            Our <span className="gradient-text">Blog</span>
          </h1>

          <p className="text-slate-500 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Insights, tips, and trends from our team
          </p>
        </div>
      </section>

      {/* Blogs Grid */}
      <section className="section-padding !pt-0 relative overflow-hidden pb-28">
        <div className="deco-dot top-[20%] right-[10%] w-3 h-3 bg-secondary opacity-25 hidden lg:block" />
        <div className="deco-ring w-20 h-20 bottom-[15%] left-[6%] hidden lg:block" />

        <div className="container-custom relative z-10">
          {blogs.length === 0 ? (
            <div className="glass-card p-16 text-center max-w-xl mx-auto">
              <p className="text-slate-600 text-lg font-semibold">No blog posts yet. Check back soon!</p>
              <p className="text-slate-400 text-sm mt-2">Admin can add blog posts from the dashboard.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <Link
                  key={blog._id}
                  href={`/blogs/${blog.slug}`}
                  className="glass-card-hover overflow-hidden group flex flex-col justify-between"
                >
                  <div>
                    <div className="h-52 bg-gradient-to-br from-blue-500/15 to-purple-500/15 relative overflow-hidden rounded-t-[19px]">
                      {blog.coverImage ? (
                        <img
                          src={blog.coverImage}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl font-extrabold gradient-text opacity-30">
                          {blog.title?.charAt(0)}
                        </div>
                      )}
                      {blog.category && (
                        <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold text-primary shadow-sm">
                          {blog.category}
                        </span>
                      )}
                    </div>

                    <div className="p-7">
                      <div className="flex items-center gap-4 text-slate-400 text-xs mb-3">
                        <span className="flex items-center gap-1.5">
                          <FaClock size={11} className="text-primary/70" />
                          {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FaEye size={11} className="text-primary/70" />
                          {blog.views || 0}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {blog.title}
                      </h3>

                      <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                        {blog.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="px-7 pb-6 pt-0">
                    <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-primary text-xs font-bold group-hover:gap-3 transition-all">
                      <span>Read Full Story</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
