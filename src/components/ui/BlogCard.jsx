import React from 'react';
import Link from 'next/link';
import { FaClock, FaEye } from 'react-icons/fa';
import { ArrowRight, Sparkles } from 'lucide-react';

export const BLOG_THEMES = [
  {
    theme: 'blue',
    cardBg: 'bg-gradient-to-br from-blue-50/95 via-indigo-50/50 to-white',
    border: 'border-blue-200/90 hover:border-blue-400',
    topBar: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500',
    blobColor: 'from-blue-500/25 to-indigo-500/15',
    categoryBg: 'bg-blue-600 text-white shadow-sm shadow-blue-500/25',
    accentText: 'text-blue-600 group-hover:text-blue-700',
    metaPill: 'bg-blue-100/80 text-blue-700 border-blue-200/80',
    shadowHover: 'hover:shadow-xl hover:shadow-blue-500/15',
  },
  {
    theme: 'emerald',
    cardBg: 'bg-gradient-to-br from-emerald-50/95 via-teal-50/50 to-white',
    border: 'border-emerald-200/90 hover:border-emerald-400',
    topBar: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500',
    blobColor: 'from-emerald-500/25 to-teal-500/15',
    categoryBg: 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/25',
    accentText: 'text-emerald-600 group-hover:text-emerald-700',
    metaPill: 'bg-emerald-100/80 text-emerald-700 border-emerald-200/80',
    shadowHover: 'hover:shadow-xl hover:shadow-emerald-500/15',
  },
  {
    theme: 'purple',
    cardBg: 'bg-gradient-to-br from-purple-50/95 via-violet-50/50 to-white',
    border: 'border-purple-200/90 hover:border-purple-400',
    topBar: 'bg-gradient-to-r from-purple-600 via-violet-600 to-pink-500',
    blobColor: 'from-purple-500/25 to-violet-500/15',
    categoryBg: 'bg-purple-600 text-white shadow-sm shadow-purple-500/25',
    accentText: 'text-purple-600 group-hover:text-purple-700',
    metaPill: 'bg-purple-100/80 text-purple-700 border-purple-200/80',
    shadowHover: 'hover:shadow-xl hover:shadow-purple-500/15',
  },
  {
    theme: 'amber',
    cardBg: 'bg-gradient-to-br from-amber-50/95 via-orange-50/50 to-white',
    border: 'border-amber-200/90 hover:border-amber-400',
    topBar: 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500',
    blobColor: 'from-amber-500/25 to-orange-500/15',
    categoryBg: 'bg-amber-600 text-white shadow-sm shadow-amber-500/25',
    accentText: 'text-amber-700 group-hover:text-amber-800',
    metaPill: 'bg-amber-100/80 text-amber-800 border-amber-200/80',
    shadowHover: 'hover:shadow-xl hover:shadow-amber-500/15',
  },
  {
    theme: 'rose',
    cardBg: 'bg-gradient-to-br from-rose-50/95 via-pink-50/50 to-white',
    border: 'border-rose-200/90 hover:border-rose-400',
    topBar: 'bg-gradient-to-r from-rose-500 via-pink-600 to-red-500',
    blobColor: 'from-rose-500/25 to-pink-500/15',
    categoryBg: 'bg-rose-600 text-white shadow-sm shadow-rose-500/25',
    accentText: 'text-rose-600 group-hover:text-rose-700',
    metaPill: 'bg-rose-100/80 text-rose-700 border-rose-200/80',
    shadowHover: 'hover:shadow-xl hover:shadow-rose-500/15',
  },
  {
    theme: 'cyan',
    cardBg: 'bg-gradient-to-br from-cyan-50/95 via-sky-50/50 to-white',
    border: 'border-cyan-200/90 hover:border-cyan-400',
    topBar: 'bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-500',
    blobColor: 'from-cyan-500/25 to-sky-500/15',
    categoryBg: 'bg-cyan-600 text-white shadow-sm shadow-cyan-500/25',
    accentText: 'text-cyan-600 group-hover:text-cyan-700',
    metaPill: 'bg-cyan-100/80 text-cyan-700 border-cyan-200/80',
    shadowHover: 'hover:shadow-xl hover:shadow-cyan-500/15',
  },
];

export default function BlogCard({ blog, index = 0 }) {
  const theme = BLOG_THEMES[index % BLOG_THEMES.length];

  return (
    <Link
      href={`/blogs/${blog.slug}`}
      className={`group relative rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-[0_4px_20px_-6px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 ${theme.cardBg} ${theme.border} ${theme.shadowHover}`}
    >
      {/* Top Accent Line */}
      <div className={`h-1.5 w-full ${theme.topBar}`} />

      {/* Ambient Corner Glow Blob */}
      <div
        className={`absolute -top-14 -right-14 w-40 h-40 bg-gradient-to-br ${theme.blobColor} rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500`}
      />

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          {/* Cover Image Container */}
          <div className="h-52 relative overflow-hidden bg-slate-100">
            {blog.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-indigo-500/15 text-5xl font-black gradient-text">
                {blog.title?.charAt(0)}
              </div>
            )}

            {/* Subtle Gradient Shadow at bottom of image */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

            {/* Category Pill Tag */}
            {blog.category && (
              <span className={`absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${theme.categoryBg}`}>
                {blog.category}
              </span>
            )}
          </div>

          {/* Content Body */}
          <div className="p-6 sm:p-7">
            {/* Metadata row: Date + Views */}
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-500 mb-3.5">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border ${theme.metaPill}`}>
                <FaClock size={10} />
                <span>{new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}</span>
              </span>

              {blog.views !== undefined && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white/80 border border-slate-200/80 text-slate-600">
                  <FaEye size={10} className="text-slate-400" />
                  <span>{blog.views} views</span>
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-2.5 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
              {blog.title}
            </h3>

            {/* Excerpt */}
            <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
              {blog.excerpt}
            </p>
          </div>
        </div>

        {/* Bottom Bar: Read Full Story */}
        <div className="px-6 sm:p-7 pt-0 pb-6 mt-auto">
          <div className="pt-4 border-t border-slate-200/70 flex items-center justify-between text-xs font-bold">
            <span className={`flex items-center gap-2 ${theme.accentText} transition-all`}>
              <span>Read Full Story</span>
              <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
            </span>
            <span className="text-[11px] text-slate-400 font-semibold group-hover:text-slate-600">
              5 min read
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
