import Link from 'next/link';
import { FaMapMarkerAlt, FaClock, FaBriefcase } from 'react-icons/fa';

export const metadata = { title: 'Careers - AdSky Solution' };

const openings = [
  { title: 'Senior Frontend Developer', dept: 'Engineering', location: 'Mumbai / Remote', type: 'Full-time', desc: 'Build performant web apps with React and Next.js.' },
  { title: 'UI/UX Designer', dept: 'Design', location: 'Mumbai', type: 'Full-time', desc: 'Create stunning user experiences for our clients.' },
  { title: 'Digital Marketing Manager', dept: 'Marketing', location: 'Remote', type: 'Full-time', desc: 'Lead marketing campaigns and strategies.' },
  { title: 'Backend Developer', dept: 'Engineering', location: 'Remote', type: 'Full-time', desc: 'Build scalable APIs with Node.js.' },
];

const perks = ['Flexible Hours', 'Remote Work', 'Health Insurance', 'Learning Budget', 'Team Outings'];

export default function CareersPage() {
  return (
    <>
      <section className="relative pt-32 pb-20">
        <div className="glow-dot bg-primary top-20 right-0 animate-pulse-slow" />
        <div className="container-custom relative z-10 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6">
            Join Our <span className="gradient-text">Team</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">Build the future of digital with us</p>
        </div>
      </section>

      <section className="pb-16">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center gap-4">
            {perks.map((p, i) => (
              <div key={i} className="glass-card px-5 py-3 text-sm text-text-secondary">✨ {p}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding !pt-0">
        <div className="container-custom max-w-3xl">
          <h2 className="text-2xl font-bold text-text-primary mb-8">Open Positions</h2>
          <div className="space-y-4">
            {openings.map((job, i) => (
              <div key={i} className="glass-card-hover p-6 group">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary-light transition-colors">{job.title}</h3>
                    <p className="text-text-secondary text-sm mt-1 mb-3">{job.desc}</p>
                    <div className="flex flex-wrap items-center gap-4 text-text-muted text-xs">
                      <span className="flex items-center gap-1"><FaBriefcase size={10} /> {job.dept}</span>
                      <span className="flex items-center gap-1"><FaMapMarkerAlt size={10} /> {job.location}</span>
                      <span className="flex items-center gap-1"><FaClock size={10} /> {job.type}</span>
                    </div>
                  </div>
                  <Link href="/about" className="btn-primary text-xs !py-2 !px-4">Apply</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
