import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-academic-navy text-slate-300 font-sans border-t border-academic-navy-light mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-academic-navy-light/80">
          
          {/* Brand Information */}
          <div className="space-y-3">
            <Link to="/" className="inline-block">
              <span className="text-2xl font-extrabold tracking-tight text-white">
                Cynex
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Department of Computer Science &amp; Engineering (IoT, Cyber Security &amp; Blockchain Technology). Dedicated to computing excellence, technical rigor, and student innovation.
            </p>
          </div>

          {/* Academic Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Academics
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about" className="text-slate-300 hover:text-white transition-colors">
                  About Department
                </Link>
              </li>
              <li>
                <Link to="/programs" className="text-slate-300 hover:text-white transition-colors">
                  Academic Programs
                </Link>
              </li>
              <li>
                <Link to="/materials" className="text-slate-300 hover:text-white transition-colors">
                  Study Materials
                </Link>
              </li>
              <li>
                <Link to="/faculty" className="text-slate-300 hover:text-white transition-colors">
                  Faculty Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Department Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Portals &amp; Careers
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/profile" className="text-slate-300 hover:text-white transition-colors">
                  Student CIE Portal
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-300 hover:text-white transition-colors">
                  Portal Login
                </Link>
              </li>
              <li>
                <Link to="/placements-internships" className="text-slate-300 hover:text-white transition-colors">
                  Placements &amp; Internships
                </Link>
              </li>
              <li>
                <Link to="/achievements" className="text-slate-300 hover:text-white transition-colors">
                  Achievements
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Contact & Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Connect
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/news-events" className="text-slate-300 hover:text-white transition-colors">
                  News &amp; Events
                </Link>
              </li>
              <li>
                <Link to="/research" className="text-slate-300 hover:text-white transition-colors">
                  Research &amp; Labs
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-300 hover:text-white transition-colors">
                  Contact Department
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Cynex &bull; Department of CSE (IoT, Cyber Security &amp; Blockchain Technology).</p>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-slate-400 transition-colors">Home</Link>
            <span>&bull;</span>
            <Link to="/about" className="hover:text-slate-400 transition-colors">About</Link>
            <span>&bull;</span>
            <Link to="/contact" className="hover:text-slate-400 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
