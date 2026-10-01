import { Link } from 'react-router-dom';
import {
  Compass,
  Target,
  Mail,
} from 'lucide-react';

function About() {
  return (
    <div className="space-y-8 py-10 px-4 sm:px-6 max-w-7xl mx-auto text-academic-text">
      
      {/* 1. Introduction & Overview */}
      <section className="institutional-card p-6 sm:p-10">
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-academic-gold-dark uppercase tracking-widest mb-2 font-mono">
            <span>Department Overview</span>
            <span>&bull;</span>
            <span>Cadence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-academic-navy tracking-tight">
            Cultivating Engineering Rigor in Modern Computing Paradigms
          </h2>
          <p className="text-sm sm:text-base text-academic-text-secondary mt-3 leading-relaxed">
            The Department of Computer Science and Engineering (IoT, Cyber Security &amp; Blockchain Technology) provides students with a solid foundation in software systems, intelligent physical computing, defensive cyber infrastructure, and decentralized ledgers.
          </p>
        </div>

        {/* Vision & Mission Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-6 border-t border-academic-border">
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

      {/* Department Official Communications */}
      <section className="institutional-card p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-academic-navy">Department Communications Desk</h3>
          <p className="text-xs sm:text-sm text-academic-text-secondary mt-1">
            Official communications, admissions inquiries, and institutional correspondence:
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

export default About;
