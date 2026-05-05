import React from 'react';

const LegalContent = ({ title, lastUpdated, sections }) => {
  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-32 pb-8 overflow-hidden flex items-center justify-center">
        <div className="glow-dot  top-20 right-0 animate-pulse-slow" />
        <div className="glow-dot  bottom-0 left-0 opacity-10" />

        <div className="container-custom relative z-10 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6">
              <span className="gradient-text">{title}</span>
            </h1>
            <p className="text-text-muted text-sm flex items-center justify-center gap-2">
              <span className="w-8 h-[1px] bg-border"></span>
              Last Updated: {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="pb-24">
        <div className="container-custom">
          <div className=" p-8 md:p-12 lg:p-16 border-border/40">
            <div className="max-w-4xl space-y-12">
              {sections.map((section, index) => (
                <div key={index} className="animate-fade-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
                    <span className="text-primary-light/30 text-lg font-mono">0{index + 1}</span>
                    {section.title}
                  </h2>
                  <div className="space-y-4 text-text-secondary leading-relaxed">
                    {section.content.map((item, i) => {
                      if (typeof item === 'string') {
                        return <p key={i}>{item}</p>;
                      }
                      if (item.type === 'list') {
                        return (
                          <ul key={i} className="space-y-3 pl-5 list-disc marker:text-primary-light">
                            {item.items.map((listItem, j) => (
                              <li key={j} className="pl-2">{listItem}</li>
                            ))}
                          </ul>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Footer in Legal */}
            <div className="mt-16 pt-12 border-t border-border/40">
              <p className="text-text-secondary">
                If you have any questions about this {title}, please contact us at{' '}
                <a href="mailto:info@adskysolution.com" className="text-primary-light hover:underline font-medium">
                  info@adskysolution.com
                </a>

              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default LegalContent;
