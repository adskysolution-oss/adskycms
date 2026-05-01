export default function OurJourneySection() {
  const milestones = [
    {
      year: '2023',
      description:
        'AD Sky Solution was founded in Delhi with a vision to empower businesses through IT development, digital solutions, and recruitment services across India.',
    },
    {
      year: '2024',
      description:
        'Expanded operations by building a strong Pan-India recruitment vendor network and delivering high-quality IT solutions.',
    },
    {
      year: '2025',
      description:
        'Strengthened client relationships and established AD Sky Solution as a reliable technology partner.',
    },
    {
      year: '2026',
      description:
        'Continuing growth with scalable solutions and long-term partnerships across India.',
    },
  ];

  return (
    <section className="section-padding relative">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="section-title">
            Our <span className="gradient-text">Journey</span>
          </h2>
          <p className="section-subtitle">
            From a startup vision to a growing digital solutions company — our journey is driven by innovation and impact.
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical line (Desktop only) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 bg-gradient-to-b from-primary/40 via-secondary/30 to-primary/40" />

          <div className="flex flex-col md:block">
            {milestones.map((item, i) => {
              const isLeft = i % 2 === 0;

              return (
                <div key={i} className={`w-full relative flex flex-col ${isLeft ? 'items-start' : 'items-end'} md:block`}>
                  {/* Dot (Desktop only) */}
                  <div className="hidden md:block absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-primary-light to-secondary border-[3px] border-dark z-10" />

                  {/* Card */}
                  <div
                    className={`
                      w-[92%] md:w-[calc(50%-40px)] mb-8 md:mb-20
                      ${isLeft ? 'md:mr-auto md:pr-6' : 'md:ml-auto md:pl-6'}
                    `}
                  >
                    <div className="glass-card p-6 lg:p-8 transition-all duration-300 hover:border-white/10">
                      <div className="flex items-center justify-between mb-3 md:block">
                        <h3 className="text-xl font-bold gradient-text">
                          {item.year}
                        </h3>
                        {/* Dot (Mobile only - next to year) */}
                        <div className="md:hidden w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                      </div>

                      <p className="text-text-secondary text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Vertical Line Segment (Mobile only - between cards) */}
                  {i < milestones.length - 1 && (
                    <div className="md:hidden self-center w-[2px] h-12 bg-gradient-to-b from-primary/40 to-secondary/40 mb-8" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}