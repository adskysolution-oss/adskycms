import Link from 'next/link';
import { FaArrowRight, FaPlay, FaCheckCircle, FaClock, FaCode, FaMobileAlt, FaBullhorn, FaPaintBrush, FaCloud, FaShieldAlt } from 'react-icons/fa';
import { getActiveServices, getPublishedBlogs } from '@/lib/data';

const iconMap = { FaCode, FaMobileAlt, FaBullhorn, FaPaintBrush, FaCloud, FaShieldAlt };

export default async function HomePage() {
  const [services, blogs] = await Promise.all([
    getActiveServices(),
    getPublishedBlogs(3),
  ]);

  return (
    <>
      {/* ── Hero (Hardcoded) ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="glow-dot bg-primary top-20 -left-32 animate-pulse-slow" />
        <div className="glow-dot bg-secondary bottom-20 -right-32 animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(108,60,225,0.08),transparent_70%)]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="container-custom relative z-10 pt-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-sm font-medium mb-8 animate-fade-up">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              Digital Solutions That Deliver
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              Transform Your Business{' '}
              <span className="gradient-text">With Digital Excellence</span>
            </h1>

            <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              We craft innovative digital solutions that drive growth, engagement, and measurable results for forward-thinking businesses.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <Link href="/services" className="btn-primary text-base !py-3.5 !px-8">
                Get Started <FaArrowRight size={14} />
              </Link>
              <button className="btn-secondary !py-3.5 !px-8">
                <FaPlay size={12} /> Watch Demo
              </button>
            </div>

            <div className="grid grid-cols-3 gap-8 mt-20 pt-10 border-t border-border animate-fade-up" style={{ animationDelay: '0.4s' }}>
              {[
                { value: '500+', label: 'Projects' },
                { value: '98%', label: 'Satisfaction' },
                { value: '50+', label: 'Team Members' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-text-muted text-sm mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Services (DB) ── */}
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

      {/* ── Strategy (Hardcoded) ── */}
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

      {/* ── How It Works (Hardcoded) ── */}
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

      {/* ── Blog Preview (DB) ── */}
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

      {/* ── CTA (Hardcoded) ── */}
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
    </>
  );
}
