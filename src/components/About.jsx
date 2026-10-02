import { Link } from 'react-router-dom';
import {
  Compass,
  Target,
  Mail,
} from 'lucide-react';

function About() {
  return (
    <div className="space-y-6 py-8 px-4 sm:px-6 max-w-7xl mx-auto text-slate-900 font-sans">
      
      {/* 1. Introduction & Overview */}
      <section className="bg-white rounded-xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl mb-6">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block mb-1">
            Department Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Academic Excellence in Modern Computing Systems
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
            The Department of Computer Science and Engineering (IoT, Cyber Security &amp; Blockchain Technology) provides students with a solid foundation in software systems, intelligent physical computing, defensive cyber infrastructure, and decentralized ledgers.
          </p>
        </div>

        {/* Vision & Mission Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100">
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Compass className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Department Vision</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              To be a premier center of technical learning and innovation in Internet of Things, Cybersecurity, and Blockchain Technology, developing skilled, ethical, and forward-thinking engineers.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Target className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Department Mission</h3>
            <ul className="text-xs sm:text-sm text-slate-600 space-y-1.5 list-disc pl-4 leading-relaxed">
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
