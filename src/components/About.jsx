import { Link } from 'react-router-dom';
import {
  BookOpen,
  GraduationCap,
  Users,
  Briefcase,
  ShieldCheck,
  Cpu,
  Boxes,
  ArrowRight,
  Compass,
  Target,
  CheckCircle2,
} from 'lucide-react';

const portals = [
  {
    title: 'Study Materials',
    desc: 'Access semester-wise lecture notes, course syllabus, laboratory manuals, and question papers.',
    icon: BookOpen,
    to: '/materials',
    badge: 'Notes & Resources',
  },
  {
    title: 'Student CIE Portal',
    desc: 'Continuous Internal Evaluation (CIE) score tracking, proctored test assessments, and performance history.',
    icon: GraduationCap,
    to: '/profile',
    badge: 'CIE Marks',
  },
  {
    title: 'Faculty & Mentors',
    desc: 'Connect with department faculty, academic advisors, and proctoring mentors.',
    icon: Users,
    to: '/faculty',
    badge: 'Faculty Roster',
  },
  {
    title: 'Placements & Internships',
    desc: 'Review campus placement drives, recruiting partners, internship notifications, and achievements.',
    icon: Briefcase,
    to: '/placements-internships',
    badge: 'Career Tracks',
  },
];

const specializations = [
  {
    title: 'Internet of Things & Embedded Systems',
    icon: Cpu,
    desc: 'Covers microcontroller architectures, sensor telemetry, edge computing, wireless IoT communication protocols, and embedded firmware development.',
    points: ['Sensor Telemetry & Automation', 'Embedded C/C++ & MicroPython', 'Edge Computing & Hardware Prototyping'],
  },
  {
    title: 'Cybersecurity & Defense',
    icon: ShieldCheck,
    desc: 'Focuses on network security protocols, vulnerability assessment and penetration testing (VAPT), ethical hacking, digital forensics, and defensive systems.',
    points: ['Network Security Architecture', 'Vulnerability Assessment & Penetration Testing', 'Applied Cryptography & Digital Forensics'],
  },
  {
    title: 'Blockchain & Distributed Computing',
    icon: Boxes,
    desc: 'Covers decentralized consensus algorithms, smart contract development, cryptographic ledgers, distributed systems security, and decentralized applications.',
    points: ['Smart Contracts & Solidity Development', 'Consensus Protocols & Ledgers', 'Web3 & Distributed Architectures'],
  },
];

function About() {
  return (
    <div className="space-y-16 py-14 px-4 sm:px-6 max-w-7xl mx-auto text-academic-text">
      
      {/* 1. Introduction & Overview */}
      <section className="institutional-card p-6 sm:p-10">
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-academic-gold-dark uppercase tracking-widest mb-2 font-mono">
            <span>Department Overview</span>
            <span>&bull;</span>
            <span>Cynex</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-academic-navy tracking-tight">
            Cultivating Engineering Rigor in Modern Computing Paradigms
          </h2>
          <p className="text-sm sm:text-base text-academic-text-secondary mt-3 leading-relaxed">
            The Department of Computer Science and Engineering (IoT, Cyber Security &amp; Blockchain Technology) provides students with a solid foundation in software systems, intelligent physical computing, defensive cyber infrastructure, and decentralized ledgers.
          </p>
        </div>

        {/* Vision & Mission Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-academic-border">
          <div className="p-6 rounded-lg bg-academic-bg border border-academic-border space-y-3">
            <div className="w-9 h-9 rounded-md bg-academic-navy text-white flex items-center justify-center">
              <Compass className="w-5 h-5 text-academic-gold-light" />
            </div>
            <h3 className="text-lg font-bold text-academic-navy">Department Vision</h3>
            <p className="text-xs sm:text-sm text-academic-text-secondary leading-relaxed">
              To be a premier center of technical learning and innovation in Internet of Things, Cybersecurity, and Blockchain Technology, developing skilled, ethical, and forward-thinking engineers.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-academic-bg border border-academic-border space-y-3">
            <div className="w-9 h-9 rounded-md bg-academic-navy text-white flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-academic-navy">Department Mission</h3>
            <ul className="text-xs sm:text-sm text-academic-text-secondary space-y-2 list-disc pl-4 leading-relaxed">
              <li>Provide rigorous education combined with practical, project-based laboratory experimentation.</li>
              <li>Maintain dedicated laboratory infrastructure for hardware prototyping, security defense, and distributed software.</li>
              <li>Foster analytical problem-solving, collaboration, and industry readiness through continuous learning.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 2. Quick Portals */}
      <section>
        <div className="border-b border-academic-border pb-4 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-mono font-semibold text-academic-gold-dark uppercase tracking-wider block">
              Quick Portals
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-academic-navy mt-1">
              Academic &amp; Student Resources
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-academic-text-muted">
            Direct access to department modules and student tools
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {portals.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                to={item.to}
                className="institutional-card-hover p-5 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-md bg-slate-100 border border-slate-200 text-academic-navy flex items-center justify-center group-hover:bg-academic-navy group-hover:text-white transition-colors duration-150">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-academic-navy group-hover:text-academic-accent transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-academic-text-secondary mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-academic-accent">
                  <span>Enter</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Core Disciplines */}
      <section>
        <div className="border-b border-academic-border pb-4 mb-6">
          <span className="text-xs font-mono font-semibold text-academic-gold-dark uppercase tracking-wider block">
            Focus Areas
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-academic-navy mt-1">
            Department Core Technical Pillars
          </h2>
          <p className="text-xs sm:text-sm text-academic-text-muted mt-1">
            Deepening expertise across key technological disciplines
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {specializations.map((spec) => {
            const Icon = spec.icon;
            return (
              <div
                key={spec.title}
                className="institutional-card p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-md bg-academic-navy text-white flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-academic-gold-light" />
                  </div>
                  <h3 className="text-base font-bold text-academic-navy mb-2">
                    {spec.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-academic-text-secondary leading-relaxed mb-4">
                    {spec.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  {spec.points.map((pt) => (
                    <div key={pt} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}

export default About;
