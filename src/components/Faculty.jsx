import { motion } from 'framer-motion';
import { Mail, MapPin, GraduationCap, Award, BookOpen, Users } from 'lucide-react';

const facultyMembers = [
  {
    name: 'Prof. Vasudev S. Shahapur',
    role: 'Head of the Department & Associate Professor',
    qualification: 'M.Tech, Ph.D. (Pursuing)',
    focus: 'Internet of Things, Embedded Hardware & Sensor Telemetry',
    email: 'vasudev.shahapur@aiet.org.in',
    office: 'Room 204, Academic Block, AIET Campus',
    experience: '14+ Years in Teaching & Research',
    initials: 'VS',
  },
  {
    name: 'Prof. Fayaz Ahmed Sheik',
    role: 'Assistant Professor',
    qualification: 'M.Tech (Computer Science & Engineering)',
    focus: 'Web Technologies, Database Systems & Distributed Ledgers',
    email: 'fayaz.sheik@aiet.org.in',
    office: 'Room 206, Academic Block, AIET Campus',
    experience: '8+ Years in Teaching & Industry Mentorship',
    initials: 'FS',
  },
  {
    name: 'Prof. Joytibha R. Chichankar',
    role: 'Assistant Professor',
    qualification: 'M.Tech (Computer Science & Engineering)',
    focus: 'Theory of Computation, Artificial Intelligence & Computer Vision',
    email: 'joytibha.c@aiet.org.in',
    office: 'Room 208, Academic Block, AIET Campus',
    experience: '7+ Years in Academic Instruction',
    initials: 'JC',
  },
  {
    name: 'Prof. Savitha S. K.',
    role: 'Assistant Professor',
    qualification: 'M.Tech (Information Technology & Cybersecurity)',
    focus: 'Cybersecurity, Network Vulnerability Assessment & Penetration Testing',
    email: 'savitha.sk@aiet.org.in',
    office: 'Room 210, Academic Block, AIET Campus',
    experience: '6+ Years in Security Research & Laboratory Instruction',
    initials: 'SS',
  },
];

function Faculty() {
  return (
    <div className="py-12 px-4 sm:px-6 max-w-7xl mx-auto space-y-12 text-academic-text">
      
      {/* Header Banner */}
      <section className="page-hero">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-academic-navy text-white text-xs font-mono font-semibold uppercase tracking-wider mb-3">
            <Users className="w-3.5 h-3.5 text-academic-gold-light" />
            <span>Academic Faculty Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-academic-navy tracking-tight">
            Department Faculty &amp; Academic Mentors
          </h1>
          <p className="text-sm sm:text-base text-academic-text-secondary mt-2 leading-relaxed">
            Distinguished educators and researchers dedicated to technical rigor, hands-on laboratory instruction, and student mentorship in CSE (ICB).
          </p>
        </div>
      </section>

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {facultyMembers.map((member, index) => (
          <motion.article
            key={member.name}
            className="institutional-card p-6 sm:p-7 flex flex-col justify-between"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
          >
            <div>
              <div className="flex items-start gap-4 pb-4 border-b border-academic-border">
                {/* Academic Avatar Seal */}
                <div className="w-14 h-14 rounded-lg bg-academic-navy text-academic-gold-light font-bold text-lg flex items-center justify-center flex-shrink-0 shadow-soft border border-academic-gold/20">
                  {member.initials}
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-lg font-bold text-academic-navy leading-snug">
                    {member.name}
                  </h2>
                  <p className="text-xs font-semibold text-academic-gold-dark font-mono">
                    {member.role}
                  </p>
                  <p className="text-xs text-academic-text-muted">
                    {member.qualification}
                  </p>
                </div>
              </div>

              {/* Specialization & Experience */}
              <div className="py-4 space-y-3">
                <div>
                  <span className="text-[11px] font-mono text-academic-text-muted uppercase tracking-wider block">
                    Specialization &amp; Research Focus:
                  </span>
                  <p className="text-xs sm:text-sm font-medium text-academic-text mt-0.5">
                    {member.focus}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-mono text-academic-text-muted uppercase tracking-wider block">
                    Academic Experience:
                  </span>
                  <p className="text-xs text-academic-text-secondary mt-0.5">
                    {member.experience}
                  </p>
                </div>
              </div>
            </div>

            {/* Coordinates & Office Information */}
            <div className="pt-4 border-t border-academic-border space-y-2 text-xs text-academic-text-secondary">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-academic-accent flex-shrink-0" />
                <span>{member.office}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-academic-accent flex-shrink-0" />
                <a
                  href={`mailto:${member.email}`}
                  className="text-academic-accent hover:underline font-mono"
                >
                  {member.email}
                </a>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      {/* Office Hours & Academic Proctorship Note */}
      <section className="institutional-card p-6 sm:p-8 bg-academic-bg border-academic-border">
        <div className="max-w-3xl space-y-2">
          <h3 className="text-base font-bold text-academic-navy">
            Student Proctorship &amp; Office Hours
          </h3>
          <p className="text-xs sm:text-sm text-academic-text-secondary leading-relaxed">
            Every undergraduate student in the Department of CSE (ICB) is assigned a dedicated faculty mentor / proctor. Faculty office hours for project guidance, Continuous Internal Evaluation (CIE) reviews, and academic counseling are conducted between 3:30 PM – 4:30 PM on academic working days.
          </p>
        </div>
      </section>

    </div>
  );
}

export default Faculty;

