import Link from 'next/link';
import { FaClock, FaEye, FaArrowRight } from 'react-icons/fa';
import { getPublishedBlogs } from '@/lib/data';

export const metadata = { title: 'Blog - AdSky Solution' };

export default async function BlogsPage() {
  const blogs = await getPublishedBlogs(20);

  return (
    <>
      <section className="relative pt-32 pb-20">
        <div className="glow-dot bg-secondary top-20 left-0 animate-pulse-slow" />
        <div className="container-custom relative z-10 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6">
            Our <span className="gradient-text">Blog</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">Insights, tips, and trends from our team</p>
        </div>
      </section>

      <section className="section-padding !pt-0">
        <div className="container-custom">
          {blogs.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <p className="text-text-secondary text-lg">No blog posts yet. Check back soon!</p>
              <p className="text-text-muted text-sm mt-2">Admin can add blog posts from the dashboard.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <Link key={blog._id} href={`/blogs/${blog.slug}`} className="glass-card-hover overflow-hidden group">
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
                    {blog.coverImage ? (
                      <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl font-bold gradient-text opacity-30">
                        {blog.title?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-text-muted text-xs mb-3">
                      <span className="px-2 py-1 rounded-md bg-primary/10 text-primary-light">{blog.category}</span>
                      <span className="flex items-center gap-1"><FaClock size={10} /> {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><FaEye size={10} /> {blog.views}</span>
                    </div>
                    <h3 className="text-text-primary font-semibold mb-2 group-hover:text-primary-light transition-colors line-clamp-2">{blog.title}</h3>
                    <p className="text-text-secondary text-sm line-clamp-2">{blog.excerpt}</p>
                    <div className="mt-4 flex items-center gap-2 text-primary-light text-sm font-medium group-hover:gap-3 transition-all">
                      Read More <FaArrowRight size={12} />
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
