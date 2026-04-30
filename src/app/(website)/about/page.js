import { FaUsers, FaRocket, FaHeart, FaGlobe } from 'react-icons/fa';
import { getTeamMembers } from '@/lib/data';

export const metadata = { title: 'About Us - AdSky Solution' };

const values = [
  { icon: FaRocket, title: 'Innovation', desc: 'We push boundaries and embrace new technologies.' },
  { icon: FaHeart, title: 'Passion', desc: 'We love what we do and it shows in our work.' },
  { icon: FaUsers, title: 'Collaboration', desc: 'We work as one team with our clients.' },
  { icon: FaGlobe, title: 'Impact', desc: 'We create solutions that make a real difference.' },
];

export default async function AboutPage() {
  const team = await getTeamMembers();

  return (
    <>
      {/* Hero (Hardcoded) */}
      <section className="relative pt-32 pb-20">
        <div className="glow-dot bg-primary top-20 -left-20 animate-pulse-slow" />
        <div className="container-custom relative z-10 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6">
            About <span className="gradient-text">AdSky Solution</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            We are a team of passionate technologists, designers, and strategists dedicated to helping businesses thrive in the digital age.
          </p>
        </div>
      </section>

      {/* Mission (Hardcoded) */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="glass-card p-10 lg:p-16 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 gradient-text">Our Mission</h2>
            <p className="text-text-secondary text-lg leading-relaxed">
              To empower businesses with innovative digital solutions that drive growth and create lasting impact in an ever-evolving digital landscape.
            </p>
          </div>
        </div>
      </section>

      {/* Values (Hardcoded) */}
      <section className="section-padding">
        <div className="container-custom">
          <h2 className="section-title text-center mb-16">Our <span className="gradient-text">Core Values</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="glass-card-hover p-7 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 mx-auto mb-5 flex items-center justify-center">
                  <Icon className="text-primary-light" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
                <p className="text-text-secondary text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team (DB) */}
      {team.length > 0 && (
        <section className="section-padding">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="section-title"><span className="gradient-text">Meet Our Team</span></h2>
              <p className="section-subtitle">The brilliant minds behind AdSky Solution</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member) => (
                <div key={member._id} className="glass-card-hover p-7 text-center group">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-5 flex items-center justify-center text-2xl font-bold text-white group-hover:scale-110 transition-transform overflow-hidden">
                    {member.image ? (
                      <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      member.name?.charAt(0)
                    )}
                  </div>
                  <h3 className="text-text-primary font-semibold">{member.name}</h3>
                  <p className="text-text-muted text-sm">{member.role}</p>
                  {member.bio && <p className="text-text-secondary text-xs mt-2 line-clamp-2">{member.bio}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
