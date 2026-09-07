import { Link } from 'react-router-dom';
import {
  BookOpen,
  GraduationCap,
  Users,
  ShieldCheck,
  Cpu,
  Boxes,
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronRight,
  FlaskConical,
} from 'lucide-react';

function Hero() {
  return (
    <section className="relative overflow-hidden bg-academic-navy text-white border-b border-academic-navy-light">
      {/* Subtle institutional architectural grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Subtle top accent gradient */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-academic-accent via-academic-gold to-academic-accent"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-16 md:pt-16 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Department Identity & Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="space-y-2">
              <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-academic-gold-light font-mono">
                Innovate &bull; Compute &bull; Build
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold text-white tracking-tight leading-[1.12]">
                Department of CSE
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl font-semibold text-blue-200 tracking-tight">
                IoT, Cyber Security &amp; Blockchain Technology
              </p>
            </div>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed font-normal">
              Welcome to Cynex — a dedicated learning space focused on computing fundamentals, intelligent connected systems, cybersecurity defense, and modern engineering practices.
            </p>

            {/* 3 Core Pillar Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 pb-1">
              <div className="p-3 rounded-lg bg-academic-navy-light/70 border border-slate-700/80 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-cyan-500/20 text-cyan-300 flex items-center justify-center flex-shrink-0">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">Internet of Things</h4>
                  <p className="text-[10px] text-slate-400">Embedded Systems &amp; Sensors</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-academic-navy-light/70 border border-slate-700/80 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-emerald-500/20 text-emerald-300 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">Cyber Security</h4>
                  <p className="text-[10px] text-slate-400">Network Defense &amp; VAPT</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-academic-navy-light/70 border border-slate-700/80 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-purple-500/20 text-purple-300 flex items-center justify-center flex-shrink-0">
                  <Boxes className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">Blockchain Tech</h4>
                  <p className="text-[10px] text-slate-400">Distributed Ledgers &amp; DApps</p>
                </div>
              </div>
            </div>

            {/* Action Group */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/about"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-academic-accent hover:bg-academic-accent-hover text-white text-sm font-semibold shadow-soft transition-all active:scale-[0.98]"
              >
                <span>Explore Department</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/materials"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-academic-navy-light hover:bg-slate-800 text-slate-200 hover:text-white text-sm font-medium border border-slate-700 transition-all active:scale-[0.98]"
              >
                <BookOpen className="w-4 h-4 text-academic-gold-light" />
                <span>Study Materials</span>
              </Link>
              <Link
                to="/profile"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-white text-sm font-medium border border-slate-800 transition-all active:scale-[0.98]"
              >
                <GraduationCap className="w-4 h-4 text-academic-accent" />
                <span>Student CIE Portal</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Focus Overview Card */}
          <div className="lg:col-span-5">
            <div className="p-6 sm:p-7 rounded-xl bg-academic-navy-light/90 border border-slate-700 shadow-elevated relative overflow-hidden">
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-4 mb-5">
                <div>
                  <span className="text-[11px] font-mono text-academic-gold-light uppercase tracking-wider block font-semibold">
                    Department Focus
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                    Engineering Excellence &amp; Practice
                  </h3>
                </div>
                <div className="w-9 h-9 rounded-md bg-academic-accent/20 border border-academic-accent/30 text-academic-accent flex items-center justify-center">
                  <Award className="w-5 h-5 text-blue-400" />
                </div>
              </div>

              {/* Department Highlights */}
              <div className="space-y-3.5 text-xs sm:text-sm text-slate-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">Comprehensive Curriculum</strong>
                    <span className="text-slate-400 text-xs">Strong fundamentals in algorithms, systems, networking, and security.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">Hands-on Laboratory Facilities</strong>
                    <span className="text-slate-400 text-xs">Dedicated IoT sensor benches, ethical security testbeds, and distributed software environments.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">Student Evaluation &amp; Mentorship</strong>
                    <span className="text-slate-400 text-xs">Transparent internal assessments (CIE), student mentoring, and project guidance.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">Cynex Technical Community</strong>
                    <span className="text-slate-400 text-xs">Active technical activities, peer learning, hackathons, and collaborative projects.</span>
                  </div>
                </div>
              </div>

              {/* Department Quick Links in Card */}
              <div className="mt-6 pt-4 border-t border-slate-700/80 flex items-center justify-between">
                <Link
                  to="/materials"
                  className="text-xs font-semibold text-academic-gold-light hover:text-amber-300 inline-flex items-center gap-1 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Study Notes</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/faculty"
                  className="text-xs font-semibold text-blue-300 hover:text-white inline-flex items-center gap-1 transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Faculty Directory</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Hero;
