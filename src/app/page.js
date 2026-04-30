import Link from 'next/link';
import { FaArrowRight, FaPlay, FaCheckCircle, FaClock, FaCode, FaMobileAlt, FaBullhorn, FaPaintBrush, FaCloud, FaShieldAlt } from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/layout/Footer';
import { getActiveServices, getPublishedBlogs } from '@/lib/data';

const iconMap = { FaCode, FaMobileAlt, FaBullhorn, FaPaintBrush, FaCloud, FaShieldAlt };

export const metadata = {
  title: 'AdSky Solution - Premium IT Company',
  description: 'Premium IT support and scalable digital solutions for modern businesses.',
};

export default async function HomePage() {
  const [services, blogs] = await Promise.all([
    getActiveServices(),
    getPublishedBlogs(3),
  ]);

  return (
    <>
      <Navbar />
      <Hero />

      {services.length > 0 && (
        <section className="section-padding relative">
          <div className="glow-dot bg-primary top-0 right-0 animate-pulse-slow" />
          <div className="container-custom relative z-10">
            <div className="text-center mb-16">
              <h2 className="section-title"><span className="gradient-text">Our Services</span></h2>
              <p className="section-subtitle">Comprehensive digital solutions tailored to your needs</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((svc, i) => {
                const IconComp = iconMap[svc.icon] || FaCode;
                return (
                  <div key={svc._id} className="glass-card-hover p-7 group" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-5 group-hover:from-primary/30 group-hover:to-secondary/30 transition-all">
                      <IconComp className="text-primary-light" size={22} />
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">{svc.name}</h3>
                    <p className="text-text-secondary text-sm leading-relaxed mb-4">{svc.description}</p>
                    <div className="flex items-center gap-2 text-primary-light text-sm font-medium opacity-0 group-hover:opacity-100 transition-all">
                      Learn more <FaArrowRight size={12} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="section-padding relative overflow-hidden">
        <div className="glow-dot bg-secondary top-1/2 -left-20 animate-pulse-slow" />
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="glass-card p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
                <div className="relative grid grid-cols-2 gap-4">
                  {[
                    { value: '150%', label: 'Revenue Growth' },
                    { value: '3x', label: 'Lead Generation' },
                    { value: '85%', label: 'Cost Reduction' },
                    { value: '24/7', label: 'Support' },
                  ].map((s) => (
                    <div key={s.label} className="glass-card p-5 text-center">
                      <div className="text-3xl font-bold gradient-text mb-1">{s.value}</div>
                      <div className="text-text-muted text-xs">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <h2 className="section-title">Strategic Approach to Digital Growth</h2>
              <p className="text-text-secondary mb-8 leading-relaxed">
                We believe in a data-first approach. Every strategy we build is backed by thorough research, competitive analysis, and industry insights to ensure maximum impact.
              </p>
              <ul className="space-y-4 mb-8">
                {['Data-driven decision making', 'Competitive market analysis', 'Scalable growth strategies', 'Measurable ROI tracking'].map((point, i) => (
                  <li key={i} className="flex items-center gap-3 text-text-secondary">
                    <FaCheckCircle className="text-secondary flex-shrink-0" size={16} />
                    <span className="text-sm">{point}</span>
                  </li>
                ))}
              </ul>
              <Link href="/about" className="btn-primary">Learn More</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding relative">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="section-title"><span className="gradient-text">How It Works</span></h2>
            <p className="section-subtitle">Simple steps to get started</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-primary via-secondary to-primary opacity-30" />
            {[
              { title: 'Discovery', desc: 'We analyze your requirements and create a comprehensive project roadmap.' },
              { title: 'Development', desc: 'Our expert team builds your solution using cutting-edge technologies.' },
              { title: 'Delivery', desc: 'We deploy, test, and ensure everything works perfectly for your business.' },
            ].map((step, i) => (
              <div key={i} className="text-center relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary mx-auto mb-6 flex items-center justify-center text-white font-bold text-xl relative z-10 shadow-lg shadow-primary/20">
                  {i + 1}
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-3">{step.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {blogs.length > 0 && (
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
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8 sm:hidden">
              <Link href="/blogs" className="btn-secondary text-sm">View All Posts</Link>
            </div>
          </div>
        </section>
      )}

      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10" />
        <div className="glow-dot bg-primary top-0 left-1/4 animate-pulse-slow" />
        <div className="glow-dot bg-secondary bottom-0 right-1/4 animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="container-custom relative z-10 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-6 leading-tight">
            Ready to Transform Your Business?
          </h2>
          <p className="text-text-secondary text-lg max-w-xl mx-auto mb-10">Let us help you achieve your digital goals</p>
          <Link href="/about" className="btn-primary text-base !py-4 !px-10">
            Contact Us <FaArrowRight size={14} />
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
