export default function AboutCompanySection() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="glow-dot bg-primary top-20 -left-20 animate-pulse-slow" />
            
            <div className="container-custom relative z-10">
                {/* Decorative Top Line */}
                <div className="mb-6 flex">
                    <span className="h-px w-24 bg-white/30" />
                </div>

                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-text-secondary">
                    Who We Are
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                    <div>
                        <h2 className="text-4xl lg:text-6xl font-bold text-white mb-8 leading-[1.1]">
                            The Future of <span className="gradient-text">Digital Growth</span>
                        </h2>
                        
                        <div className="space-y-6">
                            <p className="text-text-secondary leading-relaxed text-lg">
                                AdSky Solution is a fast-growing digital solutions and recruitment powerhouse based in India. 
                                We don't just build products; we architect scalable futures.
                            </p>
                            <p className="text-text-secondary leading-relaxed text-base opacity-80">
                                Our mission is to bridge the gap between innovative technology and world-class talent. 
                                From startups to global enterprises, we provide the strategic backbone for measurable success.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mt-4">
                        {[
                            "IT Development & Software Solutions",
                            "Website & Application Development",
                            "Recruitment & Bulk Hiring Solutions",
                            "Vendor Network & Talent Management",
                            "Business Consulting & Digital Growth",
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="glass-card-hover flex items-center gap-4 px-6 py-4 transition-all duration-300"
                            >
                                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                <p className="text-sm font-medium text-text-primary">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}