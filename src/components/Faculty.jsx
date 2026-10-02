import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone } from 'lucide-react';

const facultyMembers = [
  {
    name: 'Prof. Vasudev Shahapur',
    role: 'Associate Professor & HOD',
    qualification: 'MTech (Ph.D)',
    focus: 'Internet of Things, Embedded Hardware & Sensor Telemetry',
    experience: '26+ Years of academic teaching, leadership & research',
    initials: 'VS',
    image: '/faculty/hod.png',
    photoPosition: 'object-[65%_25%]',
    email: 'vasu.shahapur@aiet.org.in',
    phone: '+91 9008811246',
    quote: 'Welcome to the Department of Computer Science & Engineering (IoT, Cybersecurity & Blockchain). We blend IoT connectivity, resilient cybersecurity, and decentralized blockchain architecture to provide an elite, industry-aligned ecosystem for innovation. Join us in architecting a smarter, safer, and decentralized tomorrow.',
    isLabAssistant: false,
    isHead: true,
  },
  {
    name: 'Prof. Jyotibha R Chinchankar',
    role: 'Assistant Professor',
    qualification: 'M.Tech (Computer Science & Engineering)',
    focus: 'Artificial Intelligence, Computer Vision, NSS & Theory of Computation',
    experience: '7+ Years of academic instruction and algorithmic research',
    initials: 'JC',
    image: '/faculty/jyothibha.png',
    email: 'jyotibha.icb@aiet.org.in',
    isLabAssistant: false,
  },
  {
    name: 'Prof. Fayaz Ahamed Shaikh',
    role: 'Assistant Professor',
    qualification: 'M.Tech (Computer Science & Engineering)',
    focus: 'Theory of Computation, Web Technologies, Database Systems & Blockchain',
    experience: '8+ Years of academic instruction, industry mentorship & project guidance',
    initials: 'FS',
    image: '/faculty/fayaz.jpeg',
    email: 'fayaz.icb@aiet.org.in',
    isLabAssistant: false,
  },
  {
    name: 'Prof. Savita S K',
    role: 'Assistant Professor',
    qualification: 'M.Tech (Information Technology & Cybersecurity)',
    focus: 'Cybersecurity, Network Vulnerability Assessment & Blockchain Technology',
    experience: '6+ Years in security research, blockchain systems & lab direction',
    initials: 'SK',
    image: '/faculty/savita.jpeg',
    email: 'savita.sk@aiet.org.in',
    isLabAssistant: false,
  },
  {
    name: 'Prof. Shibu Chacko',
    role: 'Assistant Professor',
    qualification: 'Ph.D. (Computer Science & Engineering)',
    focus: 'IoT Communication Protocols, Cloud Computing & Edge AI',
    experience: '11+ Years in distributed architecture research and teaching',
    initials: 'SC',
    image: '/faculty/shibu.jpeg',
    email: 'shibu.chacko@aiet.org.in',
    isLabAssistant: false,
  },
  {
    name: 'Prof. Namratha H N',
    role: 'Assistant Professor',
    qualification: 'Ph.D. (Electronics & Communication)',
    focus: 'Software Engineering & Project Management, Signal Processing & ML',
    experience: '10+ Years in signal processing research and academic guidance',
    initials: 'NH',
    image: '/faculty/namratha.jpeg',
    email: 'namratha.hn@aiet.org.in',
    isLabAssistant: false,
  },
  {
    name: 'Pranitha',
    role: 'Laboratory Assistant',
    qualification: 'B.E. (Computer Science & Engineering)',
    focus: 'Hardware Telemetry, Embedded IoT Lab, Network Protocols',
    initials: 'PA',
    image: '/faculty/praneetha.jpeg',
    photoPosition: 'object-top',
    isLabAssistant: true,
  },
  {
    name: 'Anitha',
    role: 'Laboratory Assistant',
    qualification: 'Diploma in Electronics & Communication',
    focus: 'Digital Electronics, Microcontroller Systems, Circuit Debugging',
    initials: 'AN',
    image: '/faculty/anitha.jpeg',
    photoPosition: 'object-top',
    isLabAssistant: true,
  },
  {
    name: 'Gayitri',
    role: 'Laboratory Assistant',
    qualification: 'B.E. (Computer Science & Engineering)',
    focus: 'System Software, Network Simulation, Database Administration',
    initials: 'GA',
    image: '/faculty/gayitri.jpeg',
    photoPosition: 'object-top',
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

function Photo({ member, large, vertical = false }) {
  const hasPhoto = Boolean(member.image);

  return (
    <div
      className={`w-full ${
        vertical
          ? 'h-72'
          : large
          ? 'h-72 md:h-full md:min-h-[280px] md:w-72'
          : 'h-64 md:h-full md:min-h-[280px] md:w-60'
      } shrink-0 overflow-hidden bg-slate-100 relative flex items-center justify-center`}
    >
      {hasPhoto ? (
        <img
          src={member.image}
          alt={member.name}
          className={`w-full h-full object-cover ${member.photoPosition || 'object-top'}`}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.parentElement?.querySelector('.photo-fallback');
            if (fallback) fallback.style.display = 'flex';
          }}
        />
      ) : null}

      <div
        className={`photo-fallback ${hasPhoto ? 'hidden' : 'flex'} flex-col items-center justify-center h-full w-full p-6 bg-slate-100 text-slate-700 text-center relative`}
      >
        <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 text-slate-800 flex items-center justify-center text-xl font-bold font-mono shadow-xs mb-2">
          {member.initials}
        </div>
        <span className="text-xs font-medium text-slate-500">
          Faculty Member
        </span>
      </div>

      {member.isHead && (
        <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 text-xs font-bold shadow-xs">
          Head of Department
        </div>
      )}
    </div>
  );
}

function FacultyCard({ member, featured }) {
  return (
    <motion.article
      className={`w-full min-w-0 overflow-hidden rounded-xl border bg-white shadow-xs transition-all hover:border-slate-300 flex flex-col md:flex-row ${
        featured ? 'border-indigo-200 ring-1 ring-indigo-100' : 'border-slate-200/80'
      }`}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.25 }}
    >
      <Photo member={member} large={featured} />

      <div className="min-w-0 flex-1 p-5 sm:p-6 flex flex-col justify-between">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-indigo-600">
              {member.role}
            </span>
            <div className="flex flex-wrap items-center gap-3">
              {member.email && (
                <a
                  href={`mailto:${member.email}`}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-mono transition-colors"
                  title="Send email"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{member.email}</span>
                </a>
              )}
              {member.phone && (
                <a
                  href={`tel:${member.phone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-mono transition-colors"
                  title="Call office"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{member.phone}</span>
                </a>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {member.name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
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
              {member.quote && (
                <blockquote className="mt-2.5 text-xs italic text-slate-600 border-l-2 border-indigo-400 pl-3 py-1 bg-indigo-50/30 rounded-r-md leading-relaxed">
                  &ldquo;{member.quote}&rdquo;
                </blockquote>
              )}
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
    <div className="py-8 px-4 sm:px-6 max-w-6xl mx-auto space-y-6 text-slate-900 font-sans">
      {/* Header */}
      <div className="pb-5 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Faculty Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Department educators, researchers, and technical instructors in CSE (IoT, Cyber Security &amp; Blockchain Technology).
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-slate-200/80 shadow-xs shrink-0 text-xs">
          <div>
            <span className="font-mono font-bold text-slate-900 text-sm">{professors.length}</span>
            <span className="text-slate-500 ml-1.5">Professors</span>
          </div>
          <span className="text-slate-300">|</span>
          <div>
            <span className="font-mono font-bold text-slate-900 text-sm">{labStaff.length}</span>
            <span className="text-slate-500 ml-1.5">Lab Staff</span>
          </div>
        </div>
      </div>

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
                  <Photo member={member} vertical={true} />
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
            Department of Computer Science &amp; Engineering (IoT, Cyber Security &amp; Blockchain Technology) • AIET Mijar
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="mailto:vasu.shahapur@aiet.org.in"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-academic-navy hover:bg-academic-navy-light text-white text-xs font-semibold shadow-soft transition-colors font-mono shrink-0"
          >
            <Mail className="w-4 h-4 text-academic-gold-light" />
            <span>vasu.shahapur@aiet.org.in</span>
          </a>
          <a
            href="tel:+919008811246"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors font-mono shrink-0"
          >
            <Phone className="w-4 h-4 text-slate-600" />
            <span>+91 9008811246</span>
          </a>
        </div>
      </section>
    </div>
  );
}

export default Faculty;
