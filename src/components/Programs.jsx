import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Clock,
  Award,
  BookOpen,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  Boxes,
  Layers,
  ArrowRight,
  FileText,
  FlaskConical,
} from 'lucide-react';

const programHighlights = [
  {
    degree: 'Bachelor of Engineering (B.E.)',
    department: 'Computer Science & Engineering',
    specialization: 'IoT, Cyber Security including Blockchain Technology',
    duration: '4 Years (8 Semesters)',
    intake: '60 Seats',
    affiliation: 'Visvesvaraya Technological University (VTU), Belagavi',
    approval: 'AICTE, New Delhi • Govt. of Karnataka Recognized',
    schemes: '2021 & 2022 Scheme CBCS',
  },
];

const semesterCurriculum = [
  {
    phase: 'Years 1 & 2 • Semesters 1 to 4',
    title: 'Foundational Engineering & Core Computing',
    description: 'Mathematics for Computing, Physics/Chemistry of Electronic Materials, Problem Solving through C, Object Oriented Programming with Java/C++, Data Structures & Algorithms, Computer Organization & Architecture, Operating Systems, and Discrete Mathematics.',
    tags: ['C/C++', 'Java', 'Data Structures', 'Operating Systems', 'Discrete Math'],
  },
  {
    phase: 'Year 3 • Semesters 5 & 6',
    title: 'Specialized Hardware & Security Engineering',
    description: 'Embedded Systems & Microcontroller Programming (ARM/ESP32), Computer Networks & Protocols, Cryptography & Network Security, Internet of Things (IoT) Sensor Architecture, Database Management Systems, Theory of Computation, and VAPT Laboratory.',
    tags: ['Embedded Systems', 'IoT Architecture', 'Network Security', 'VAPT Lab', 'DBMS'],
  },
  {
    phase: 'Year 4 • Semesters 7 & 8',
    title: 'Decentralized Systems, Advanced Defense & Capstone',
    description: 'Blockchain Technology & Distributed Ledgers, Smart Contract Development (Solidity/EVM), Penetration Testing & Ethical Hacking, Cloud Computing & Edge AI, Professional Ethics, Major Capstone Industry Project, and Full-time Technical Internship.',
    tags: ['Blockchain & EVM', 'Smart Contracts', 'Ethical Hacking', 'Capstone Project', 'Internship'],
  },
];

const laboratories = [
  {
    name: 'IoT & Embedded Hardware Lab',
    desc: 'Equipped with ARM Cortex development boards, ESP32 Wi-Fi/BLE nodes, sensor modules (environmental, motion, biometric), oscilloscopes, and IoT telemetry testbenches.',
    icon: Cpu,
  },
  {
    name: 'Cybersecurity & VAPT Defense Sandbox',
    desc: 'Isolated network environment configured for ethical penetration testing, vulnerability assessment, Wireshark packet capture, Snort IDS configuration, and malware analysis.',
    icon: ShieldCheck,
  },
  {
    name: 'Blockchain & Distributed Computing Lab',
    desc: 'High-performance nodes running private Ethereum testnets, Hyperledger Fabric instances, IPFS decentralized storage nodes, and smart contract audit suites.',
    icon: Boxes,
  },
  {
    name: 'Advanced Computing & Project Laboratory',
    desc: 'Dedicated workstation clusters configured for final year capstone engineering projects, machine learning model training, and competitive programming.',
    icon: FlaskConical,
  },
];

function Programs() {
  return (
    <div className="py-12 px-4 sm:px-6 max-w-7xl mx-auto space-y-16 text-academic-text">
      
      {/* Header Banner */}
      <section className="page-hero">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-academic-navy text-white text-xs font-mono font-semibold uppercase tracking-wider mb-3">
            <GraduationCap className="w-3.5 h-3.5 text-academic-gold-light" />
            <span>Undergraduate Academic Program</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-academic-navy tracking-tight">
            Bachelor of Engineering in CSE (ICB)
          </h1>
          <p className="text-sm sm:text-base text-academic-text-secondary mt-2 leading-relaxed">
            A specialized 4-year undergraduate degree program combining the rigorous computer science foundation of VTU with high-demand proficiencies in connected physical devices, defensive security engineering, and distributed consensus ledgers.
          </p>
        </div>
      </section>

      {/* Program Summary Specifications */}
      <section className="institutional-card p-6 sm:p-8">
        <h2 className="text-xl font-bold text-academic-navy mb-6 border-b border-academic-border pb-3">
          Program Specifications &amp; Credentials
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1">
            <span className="text-xs font-mono text-academic-text-muted uppercase">Degree Awarded</span>
            <p className="text-sm font-bold text-academic-navy">Bachelor of Engineering (B.E.)</p>
            <span className="text-xs text-slate-500">4-Year Full-Time (8 Semesters)</span>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono text-academic-text-muted uppercase">Affiliating University</span>
            <p className="text-sm font-bold text-academic-navy">VTU Belagavi</p>
            <span className="text-xs text-slate-500">Choice Based Credit System (CBCS)</span>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono text-academic-text-muted uppercase">Regulatory Approvals</span>
            <p className="text-sm font-bold text-academic-navy">AICTE New Delhi</p>
            <span className="text-xs text-slate-500">Recognized by Govt. of Karnataka</span>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono text-academic-text-muted uppercase">Department Code</span>
            <p className="text-sm font-bold text-academic-navy font-mono">ICB • AIET Mijar</p>
            <span className="text-xs text-slate-500">Annual Intake: 60 Candidates</span>
          </div>
        </div>
      </section>

      {/* 8-Semester Curriculum Roadmap */}
      <section className="space-y-6">
        <div>
          <span className="text-xs font-mono font-semibold text-academic-gold-dark uppercase tracking-wider block">
            Curriculum Structure
          </span>
          <h2 className="text-2xl font-bold text-academic-navy mt-1">
            Four-Year Academic Progression
          </h2>
          <p className="text-xs sm:text-sm text-academic-text-muted">
            Aligned with VTU Scheme 2021 &amp; 2022 guidelines for Outcome-Based Education (OBE)
          </p>
        </div>

        <div className="space-y-4">
          {semesterCurriculum.map((sem, idx) => (
            <div key={sem.phase} className="institutional-card p-6 flex flex-col md:flex-row gap-6 items-start">
              <div className="w-full md:w-52 flex-shrink-0">
                <span className="inline-block px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-bold">
                  Phase 0{idx + 1}
                </span>
                <h3 className="text-xs font-bold text-academic-navy mt-2 uppercase tracking-wide">
                  {sem.phase}
                </h3>
              </div>

              <div className="space-y-3 flex-1">
                <h4 className="text-base font-bold text-academic-navy">{sem.title}</h4>
                <p className="text-xs sm:text-sm text-academic-text-secondary leading-relaxed">
                  {sem.description}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {sem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded bg-academic-bg border border-academic-border text-[11px] font-medium text-slate-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Laboratory Infrastructure */}
      <section className="space-y-6">
        <div>
          <span className="text-xs font-mono font-semibold text-academic-gold-dark uppercase tracking-wider block">
            Practical Training
          </span>
          <h2 className="text-2xl font-bold text-academic-navy mt-1">
            Department Laboratories &amp; Facilities
          </h2>
          <p className="text-xs sm:text-sm text-academic-text-muted">
            Dedicated laboratory environments for hands-on experiments, prototyping, and defense simulations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {laboratories.map((lab) => {
            const Icon = lab.icon;
            return (
              <div key={lab.name} className="institutional-card p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-md bg-academic-navy text-white flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-academic-gold-light" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-academic-navy mb-1.5">{lab.name}</h3>
                  <p className="text-xs sm:text-sm text-academic-text-secondary leading-relaxed">
                    {lab.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTAs */}
      <section className="p-8 rounded-lg bg-academic-navy text-white flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold text-white">Access Syllabus &amp; Study Notes</h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Download VTU subject schemas, laboratory procedure manuals, and lecture notes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/materials"
            className="px-5 py-2.5 rounded-md bg-academic-accent hover:bg-academic-accent-hover text-white text-xs font-semibold shadow-soft inline-flex items-center gap-2 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>Study Materials</span>
          </Link>
          <Link
            to="/contact"
            className="px-5 py-2.5 rounded-md bg-academic-navy-light hover:bg-slate-800 text-white text-xs font-semibold border border-slate-700 inline-flex items-center gap-2 transition-all"
          >
            <span>Admission Inquiries</span>
          </Link>
        </div>
      </section>

    </div>
  );
}

export default Programs;
