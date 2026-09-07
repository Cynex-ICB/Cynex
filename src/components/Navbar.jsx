import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  LogIn,
  Home,
  Info,
  Layers,
  Users,
  FlaskConical,
  Briefcase,
  Award,
  Calendar,
  BookOpen,
  PhoneCall,
} from 'lucide-react';

const mainNavLinks = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'About', to: '/about', icon: Info },
  { label: 'Programs', to: '/programs', icon: Layers },
  { label: 'Faculty', to: '/faculty', icon: Users },
  { label: 'Research', to: '/research', icon: FlaskConical },
  { label: 'Placements', to: '/placements-internships', icon: Briefcase },
  { label: 'Achievements', to: '/achievements', icon: Award },
  { label: 'News & Events', to: '/news-events', icon: Calendar },
  { label: 'Study Materials', to: '/materials', icon: BookOpen },
  { label: 'Contact', to: '/contact', icon: PhoneCall },
];

function Navbar({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => {
    setIsOpen(false);
  };

  const isAdmin = ['admin', 'master-admin'].includes(user?.role);

  return (
    <nav className="sticky top-0 z-40 bg-academic-navy border-b border-academic-navy-light/90 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
          
          {/* Brand Identity - Cynex */}
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center text-white hover:opacity-90 transition-opacity flex-shrink-0"
          >
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Cynex
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-1.5">
            {mainNavLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `px-2 xl:px-2.5 py-1.5 rounded text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'text-white bg-academic-navy-light border-b-2 border-academic-accent shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Desktop Sticky Right Utility (Compact Portal Status) */}
          {/* Desktop Sticky Right Utility (Compact Portal Status) */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-sm transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </Link>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-academic-navy-light border border-slate-700 text-slate-200 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="max-w-[100px] truncate">{user.name?.split(' ')[0]}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onLogout?.()}
                  title="Sign Out"
                  className="p-1.5 rounded text-slate-400 hover:text-red-300 hover:bg-white/10 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : user ? (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-academic-navy-light hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
                  title="View Student CIE Marks"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="max-w-[90px] truncate">{user.name?.split(' ')[0]}</span>
                  <span className="text-[10px] text-academic-gold-light font-mono">(CIE)</span>
                </Link>
                <button
                  type="button"
                  onClick={() => onLogout?.()}
                  title="Sign Out"
                  className="p-1.5 rounded text-slate-400 hover:text-red-300 hover:bg-white/10 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-academic-accent hover:bg-academic-accent-hover text-white text-xs font-semibold shadow-sm transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Portal Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Right Controls: Login icon + Hamburger */}
          <div className="flex items-center gap-2 lg:hidden">
            {isAdmin ? (
              <Link
                to="/admin"
                onClick={closeMenu}
                className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-1"
              >
                <LayoutDashboard className="w-3 h-3" />
                <span>Admin</span>
              </Link>
            ) : user ? (
              <Link
                to="/profile"
                onClick={closeMenu}
                className="px-2 py-1 rounded bg-academic-navy-light text-slate-200 text-xs font-medium flex items-center gap-1"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>CIE</span>
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={closeMenu}
                className="px-2.5 py-1 rounded bg-academic-accent text-white text-xs font-semibold flex items-center gap-1"
              >
                <LogIn className="w-3 h-3" />
                <span>Login</span>
              </Link>
            )}

            <button
              type="button"
              className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-academic-navy-light transition-colors"
              aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-5 h-5 text-academic-gold-light" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile & Tablet Drawer Menu */}
      {isOpen && (
        <div className="lg:hidden bg-academic-navy border-t border-academic-navy-light/80 px-4 py-4 space-y-3 shadow-lg">
          {user ? (
            <div className="p-3 rounded-lg bg-academic-navy-light border border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">
                  Signed in as
                </span>
                <p className="text-sm font-bold text-white leading-tight">{user.name}</p>
                {user.usn && (
                  <span className="text-xs text-academic-gold-light font-mono">
                    USN: {user.usn}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <Link
                    to="/admin"
                    onClick={closeMenu}
                    className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold text-xs"
                  >
                    Admin Panel
                  </Link>
                ) : (
                  <Link
                    to="/profile"
                    onClick={closeMenu}
                    className="px-2.5 py-1 rounded bg-academic-accent text-white text-xs font-bold"
                  >
                    CIE Marks
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-academic-navy-light/80 border border-slate-700/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Student &amp; Faculty Portal</p>
                <p className="text-[11px] text-slate-400">Access CIE marks &amp; internal evaluations</p>
              </div>
              <Link
                to="/login"
                onClick={closeMenu}
                className="px-3 py-1.5 rounded bg-academic-accent hover:bg-academic-accent-hover text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </Link>
            </div>
          )}

          {/* Navigation Links Grid */}
          <div className="grid grid-cols-2 gap-1 pt-1">
            {mainNavLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={closeMenu}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-academic-navy-light text-white font-bold border-l-[3px] border-academic-accent'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5 opacity-80" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </div>

          {user && (
            <div className="pt-2 border-t border-slate-700/80">
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  onLogout?.();
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-md bg-red-900/30 text-red-300 hover:bg-red-900/50 font-semibold text-xs border border-red-800/40 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out of Portal</span>
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
