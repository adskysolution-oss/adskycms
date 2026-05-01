export default function MeetTeamSection({ team = [] }) {
  if (team.length === 0) return null;

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* LEFT — Text */}
          <div>
            <h2 className="section-title mb-4">
              Meet Our <span className="gradient-text">Team</span>
            </h2>
            <p className="text-text-secondary leading-relaxed">
              A project refers to a sequence of tasks that are carefully planned and executed to achieve a specific objective. Projects are essential in various fields, such as business, engineering, and education, and often require collaboration and resources. Each project has a start and an end, along with defined goals and deliverables. The success of a project is usually determined by how effectively the team meets the objectives within the allocated time and resources.
            </p>
          </div>

          {/* RIGHT — 2×2 Photo Grid */}
          <div className="grid grid-cols-2 gap-4">
            {team.slice(0, 4).map((member) => (
              <div key={member._id} className="glass-card overflow-hidden group">
                <div className="aspect-square relative overflow-hidden">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 text-4xl font-bold gradient-text">
                      {member.name?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="px-4 py-3 text-center">
                  <h4 className="text-sm font-semibold text-text-primary">{member.name}</h4>
                  {member.role && <p className="text-text-muted text-xs mt-0.5">{member.role}</p>}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
