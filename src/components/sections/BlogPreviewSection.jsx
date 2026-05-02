import Link from 'next/link';
import { FaArrowRight, FaClock } from 'react-icons/fa';

export default function BlogPreviewSection({ blogs = [] }) {
  if (blogs.length === 0) return null;

  return (
    <section className="section-padding relative">
      <div className="container-custom">
        <div className="flex items-end justify-between mb-16">
          <div>
            <h2 className="section-title">
              Latest from <span className="gradient-text">Our Blog</span>
            </h2>
            <p className="text-text-secondary mt-2">Insights, tips, and industry trends</p>
          </div>
          <Link href="/blogs" className="btn-secondary text-sm hidden sm:inline-flex">
            View All <FaArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Link key={blog._id} href={`/blogs/${blog.slug}`} className="glass-card-hover overflow-hidden group">
              <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
                {blog.coverImage ? (
                  <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold gradient-text">
                    {blog.title?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 text-text-muted text-xs mb-3">
                  <span className="px-2 py-1 rounded-md bg-primary/10 text-primary-light">{blog.category}</span>
                  <span className="flex items-center gap-1"><FaClock size={10} /> {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}</span>
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

        <div className="text-center mt-8 sm:hidden">
          <Link href="/blogs" className="btn-secondary text-sm">View All Posts</Link>
        </div>
      </div>
    </section>
  );
}
