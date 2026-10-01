import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import CadenceLogo from './CadenceLogo.jsx';

function Footer() {
  return (
    <footer className="bg-academic-navy text-slate-300 font-sans border-t border-academic-navy-light mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-8 border-b border-academic-navy-light/80">
          
          {/* Brand Information */}
          <div className="space-y-3">
            <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
              <CadenceLogo size={30} />
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Department of Computer Science &amp; Engineering (IoT, Cyber Security &amp; Blockchain Technology). Dedicated to computing excellence, technical rigor, and student innovation.
            </p>
            <div className="pt-1">
              <a
                href="mailto:cadence.platform@gmail.com"
                className="inline-flex items-center gap-1.5 text-xs text-academic-gold-light hover:text-white transition-colors font-mono"
              >
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span>cadence.platform@gmail.com</span>
              </a>
            </div>
          </div>

          {/* Academic Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Academics
            </h4>
            <ul className="space-y-2 text-xs">
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
                <Link to="/contact" className="text-slate-300 hover:text-white transition-colors">
                  Contact Department
                </Link>
              </li>
              <li className="pt-1">
                <a
                  href="mailto:cadence.platform@gmail.com"
                  className="text-academic-accent hover:text-blue-300 transition-colors font-mono break-all inline-flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span>cadence.platform@gmail.com</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Cadence &bull; Department of CSE (IoT, Cyber Security &amp; Blockchain Technology).</p>
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
