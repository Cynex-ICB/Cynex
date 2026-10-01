import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';

const facultyMembers = [
  {
    name: 'Prof. Vasudev S. Shahapur',
    role: 'Head of the Department & Associate Professor',
    qualification: 'M.Tech (Computer Science & Engineering)',
    focus: 'Internet of Things, Embedded Hardware & Sensor Telemetry',
    experience: '14+ years of academic teaching and research leadership',
    initials: 'VS',
    image: null,
    email: 'cadence.platform@gmail.com',
    isLabAssistant: false,
    isHead: true,
  },
  {
    name: 'Prof. Fayaz Ahmed Sheik',
    role: 'Assistant Professor & Class Coordinator',
    qualification: 'M.Tech (Computer Science & Engineering)',
    focus: 'Web Technologies, Database Systems & Distributed Ledgers',
    experience: '8+ years of teaching, industry mentorship & project guidance',
    initials: 'FS',
    image: '/faculty/fayaz.jpeg',
    email: 'fayaz.cse@aiet.org.in',
    isLabAssistant: false,
  },
  {
    name: 'Prof. Joytibha R. Chichankar',
    role: 'Assistant Professor',
    qualification: 'M.Tech (Computer Science & Engineering)',
    focus: 'Theory of Computation, Artificial Intelligence & Computer Vision',
    experience: '7+ years of academic instruction and algorithmic research',
    initials: 'JC',
    image: null,
    email: 'cadence.platform@gmail.com',
    isLabAssistant: false,
  },
  {
    name: 'Prof. Savitha S. K.',
    role: 'Assistant Professor',
    qualification: 'M.Tech (Information Technology & Cybersecurity)',
    focus: 'Cybersecurity, Network Vulnerability Assessment & Penetration Testing',
    experience: '6+ years in security research and specialized lab direction',
    initials: 'SS',
    image: '/faculty/savita.jpeg',
    email: 'savitha.sk@aiet.org.in',
    isLabAssistant: false,
  },
  {
    name: 'Prof. Shibu C',
    role: 'Assistant Professor',
    qualification: 'Ph.D. (Computer Science & Engineering)',
    focus: 'Cloud Computing, Distributed Systems & Edge AI',
    experience: '11+ years in distributed architecture research and teaching',
    initials: 'SC',
    image: '/faculty/shibu.jpeg',
    email: 'shibu.c@aiet.org.in',
    isLabAssistant: false,
  },
  {
    name: 'Prof. Namratha',
    role: 'Associate Professor',
    qualification: 'Ph.D. (Electronics & Communication)',
    focus: 'Signal Processing, Image Analysis & Machine Learning',
    experience: '10+ years in signal processing research and academic guidance',
    initials: 'ND',
    image: '/faculty/namratha.jpeg',
    email: 'namratha@aiet.org.in',
    isLabAssistant: false,
  },
  {
    name: 'Pranitha',
    role: 'Laboratory Assistant',
    qualification: 'B.E. (Computer Science & Engineering)',
    focus: 'Hardware Telemetry, Embedded IoT Lab, Network Protocols',
    initials: 'PA',
    image: null,
    isLabAssistant: true,
  },
  {
    name: 'Anitha',
    role: 'Laboratory Assistant',
    qualification: 'Diploma in Electronics & Communication',
    focus: 'Digital Electronics, Microcontroller Systems, Circuit Debugging',
    initials: 'AN',
    image: null,
    isLabAssistant: true,
  },
  {
    name: 'Gayitri',
    role: 'Laboratory Assistant',
    qualification: 'B.E. (Computer Science & Engineering)',
    focus: 'System Software, Network Simulation, Database Administration',
    initials: 'GA',
    image: null,
    isLabAssistant: true,
  },
];

const filters = [
  { id: 'all', label: 'Everyone' },
  { id: 'professors', label: 'Professors' },
  { id: 'lab', label: 'Lab staff' },
];

function focusChips(focus = '') {
  return focus
    .split(',')
    .map((chip) => chip.trim())
    .filter(Boolean);
}

function Photo({ member, large }) {
  const hasPhoto = Boolean(member.image);

  return (
    <div className={`w-full ${large ? 'md:w-72' : 'md:w-60'} shrink-0 overflow-hidden bg-slate-900 relative flex items-center justify-center`}>
      {hasPhoto ? (
        <img
          src={member.image}
          alt={member.name}
          className="h-64 w-full object-cover object-top md:h-full md:min-h-[280px]"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.parentElement?.querySelector('.photo-fallback');
            if (fallback) fallback.style.display = 'flex';
          }}
        />
      ) : null}

      <div
        className={`photo-fallback ${hasPhoto ? 'hidden' : 'flex'} flex-col items-center justify-center h-64 w-full md:h-full md:min-h-[280px] p-6 bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white text-center relative overflow-hidden`}
      >
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl font-black text-white tracking-wider font-mono shadow-xs mb-3">
          {member.initials}
        </div>
        <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
          Faculty Profile
        </span>
        <span className="text-[10px] text-slate-500 mt-0.5">
          CSE (IoT, CS &amp; BT)
        </span>
      </div>

      {member.isHead && (
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#0B1F3A]/90 border border-amber-400/40 text-amber-300 text-[11px] font-bold backdrop-blur-xs shadow-xs">
          Head of Department
        </div>
      )}
    </div>
  );
}

function FacultyCard({ member, featured }) {
  return (
    <motion.article
      className={`w-full min-w-0 overflow-hidden rounded-2xl border bg-white shadow-xs transition-all hover:border-slate-300 hover:shadow-sm flex flex-col md:flex-row ${
        featured ? 'border-blue-200 ring-1 ring-blue-100' : 'border-[#E2E8F0]'
      }`}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.25 }}
    >
      <Photo member={member} large={featured} />

      <div className="min-w-0 flex-1 p-6 sm:p-7 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#2563EB] tracking-wide uppercase font-mono">
              {member.role}
            </span>
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0F172A] font-mono transition-colors"
                title="Send email"
              >
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{member.email}</span>
              </a>
            )}
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              {member.name}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-[#64748B] mt-0.5">
              {member.qualification}
            </p>
          </div>

          {!member.isLabAssistant && (
            <div className="space-y-2.5 pt-1">
              <div className="flex flex-wrap gap-1.5">
                {focusChips(member.focus).map((chip) => (
                  <span
                    key={chip}
                    className="rounded-lg bg-slate-100 border border-slate-200/80 px-2.5 py-1 text-xs font-medium text-slate-700"
                  >
                    {chip}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {member.experience}
              </p>
            </div>
          )}

          {member.isLabAssistant && (
            <div className="space-y-2 pt-1">
              <div className="flex flex-wrap gap-1.5">
                {focusChips(member.focus).map((chip) => (
                  <span
                    key={chip}
                    className="rounded-lg bg-slate-100 border border-slate-200/80 px-2.5 py-1 text-xs font-medium text-slate-700"
                  >
                    {chip}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Supervises practical sessions, instrumentation calibration, and student laboratory assignments.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function Faculty() {
  const [filter, setFilter] = useState('all');
  const professors = facultyMembers.filter((m) => !m.isLabAssistant);
  const labStaff = facultyMembers.filter((m) => m.isLabAssistant);

  const showProfessors = filter === 'all' || filter === 'professors';
  const showLab = filter === 'all' || filter === 'lab';

  return (
    <div className="py-8 px-4 sm:px-6 max-w-6xl mx-auto space-y-8 text-[#0F172A]">
      {/* Masthead */}
      <section className="overflow-hidden rounded-2xl bg-[#0B1F3A] text-white border border-slate-800 shadow-xs relative">
        <div className="p-6 sm:p-10 flex flex-col gap-6 md:flex-row md:items-end justify-between relative z-10">
          <div className="min-w-0 max-w-2xl">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-300">
              Department Faculty &amp; Staff
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-1 text-white">
              Faculty &amp; Academic Mentors
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Distinguished educators, researchers, and laboratory instructors guiding students in Computer Science &amp; Engineering (IoT, Cyber Security &amp; Blockchain Technology) at AIET.
            </p>
          </div>

          <div className="flex gap-6 sm:gap-8 shrink-0 border-t md:border-t-0 md:border-l border-slate-700/80 pt-4 md:pt-0 md:pl-8">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{professors.length}</p>
              <p className="text-xs text-slate-400 mt-0.5">Faculty Members</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{labStaff.length}</p>
              <p className="text-xs text-slate-400 mt-0.5">Technical Staff</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 rounded-xl border border-[#E2E8F0] bg-white p-1.5 w-fit shadow-2xs" role="tablist" aria-label="Filter faculty">
        {filters.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              filter === f.id
                ? 'bg-[#0B1F3A] text-white shadow-2xs'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lists */}
      <div key={filter} className="space-y-8 min-w-0">
        {showProfessors && (
          <section className="space-y-4 min-w-0">
            {filter === 'all' && (
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <h2 className="text-base font-bold text-[#0F172A]">Professors &amp; Lecturers</h2>
                <span className="text-xs font-mono text-slate-500">{professors.length} Members</span>
              </div>
            )}
            <div className="flex flex-col gap-4 w-full min-w-0">
              {professors.map((member) => (
                <FacultyCard key={member.name} member={member} featured={Boolean(member.isHead)} />
              ))}
            </div>
          </section>
        )}

        {showLab && (
          <section className="space-y-4 min-w-0">
            {filter === 'all' && (
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <h2 className="text-base font-bold text-[#0F172A]">Laboratory Staff &amp; Technical Support</h2>
                <span className="text-xs font-mono text-slate-500">{labStaff.length} Members</span>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {labStaff.map((member) => (
                <motion.article
                  key={member.name}
                  className="min-w-0 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xs hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.25 }}
                >
                  <Photo member={member} large={false} />
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[11px] font-bold text-[#2563EB] tracking-wide uppercase font-mono">
                        {member.role}
                      </span>
                      <h3 className="mt-1 text-base font-bold text-[#0F172A]">{member.name}</h3>
                      <p className="text-xs text-[#64748B] mt-0.5">{member.qualification}</p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <div className="flex flex-wrap gap-1">
                        {focusChips(member.focus).map((chip) => (
                          <span
                            key={chip}
                            className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                          >
                            {chip}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Department Office & Faculty Coordination */}
      <section className="institutional-card p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
        <div>
          <h3 className="text-base font-bold text-academic-navy">Department Coordination &amp; Faculty Inquiries</h3>
          <p className="text-xs sm:text-sm text-academic-text-secondary mt-1">
            For academic guidance, proctorship, or research consultation appointments:
          </p>
        </div>
        <a
          href="mailto:cadence.platform@gmail.com"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-academic-navy hover:bg-academic-navy-light text-white text-xs font-semibold shadow-soft transition-colors font-mono shrink-0"
        >
          <Mail className="w-4 h-4 text-academic-gold-light" />
          <span>cadence.platform@gmail.com</span>
        </a>
      </section>
    </div>
  );
}

export default Faculty;
