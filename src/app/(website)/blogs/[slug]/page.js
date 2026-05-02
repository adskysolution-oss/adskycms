import Link from 'next/link';
import { FaClock, FaEye, FaUser, FaArrowLeft } from 'react-icons/fa';
import { getBlogBySlug } from '@/lib/data';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  return { title: blog?.title || 'Blog Post' };
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <Link href="/blogs" className="btn-primary">Back to Blog</Link>
        </div>
      </div>
    );
  }

  return (
    <section className="pt-28 pb-20">
      <div className="container-custom">
        <Link href="/blogs" className="inline-flex items-center gap-2 text-text-muted text-sm hover:text-primary-light transition-colors mb-8">
          <FaArrowLeft size={12} /> Back to Blog
        </Link>

        <span className="px-3 py-1 rounded-md bg-primary/10 text-primary-light text-xs font-medium">{blog.category}</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary mt-4 mb-4">{blog.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-text-muted text-sm mb-8">
          {blog.author && <span className="flex items-center gap-2"><FaUser size={12} /> {blog.author.name}</span>}
          <span className="flex items-center gap-2"><FaClock size={12} /> {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}</span>
          <span className="flex items-center gap-2"><FaEye size={12} /> {blog.views} views</span>
        </div>

        {blog.coverImage && (
          <div className="rounded-2xl overflow-hidden mb-10">
            <img src={blog.coverImage} alt={blog.title} className="w-full h-auto" />
          </div>
        )}

        <div className="prose prose-invert prose-lg max-w-none text-text-secondary leading-relaxed" dangerouslySetInnerHTML={{ __html: blog.content?.replace(/\n/g, '<br/>') }} />

        {blog.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-border">
            {blog.tags.map((tag, i) => (
              <span key={i} className="text-xs text-text-muted bg-surface px-3 py-1 rounded-lg">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
