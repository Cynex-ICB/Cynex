import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import CadenceLogo from './CadenceLogo.jsx';
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  LogIn,
  Home,
  Info,
  Users,
  User,
  UserCheck,
  Award,
  BookOpen,
  Calendar,
  PhoneCall,
  Brain,
  Bell,
} from 'lucide-react';

const mainNavLinks = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'About', to: '/about', icon: Info },
  { label: 'Faculty', to: '/faculty', icon: Users },
  { label: 'Achievements', to: '/achievements', icon: Award },
  { label: 'News & Events', to: '/news-events', icon: Calendar },
  { label: 'Contact', to: '/contact', icon: PhoneCall },
];

const studentNavLinks = [
  { label: 'Dashboard', to: '/portal', icon: LayoutDashboard },
  { label: 'Study Materials', to: '/materials', icon: BookOpen },
  { label: 'CyAI', to: '/cynai', icon: Brain },
  { label: 'Marks', to: '/marks', icon: Award },
  { label: 'Attendance', to: '/attendance', icon: UserCheck },
  { label: 'Profile', to: '/profile', icon: User },
];

function Navbar({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => {
    setIsOpen(false);
  };

  const isAdmin = ['admin', 'master-admin'].includes(user?.role);
  const isStudent = Boolean(user) && !isAdmin;
  const navLinks = isStudent ? studentNavLinks : mainNavLinks;

  return (
    <nav className="sticky top-0 z-40 bg-[#0B1F3A] border-b border-slate-800 shadow-xs h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full">
        <div className="flex items-center justify-between h-full gap-4">
          
          {/* Brand Identity - Cadence */}
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center hover:opacity-90 transition-opacity flex-shrink-0"
          >
            <CadenceLogo size={36} />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/' || link.to === '/portal'}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'text-white bg-white/10 shadow-xs border border-white/15'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Desktop Sticky Right Utility */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-xs transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </Link>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-slate-700 text-slate-200 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="max-w-[100px] truncate">{user.name?.split(' ')[0]}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onLogout?.()}
                  title="Sign Out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-300 hover:bg-white/10 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : user ? (
              <div className="flex items-center gap-2.5">
                {/* Notification Bell */}
                <button
                  type="button"
                  className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-400 ring-2 ring-[#0B1F3A]" />
                </button>

                {/* Student Avatar + Name */}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 py-1 px-2.5 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
                  title="View Profile"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <span className="text-xs font-semibold text-slate-200 max-w-[110px] truncate">
                    {user?.name?.split(' ')[0] || 'Student'}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => onLogout?.()}
                  title="Sign Out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-300 hover:bg-white/10 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-all"
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
                to="/portal"
                onClick={closeMenu}
                className="px-2.5 py-1 rounded bg-academic-accent text-white text-xs font-semibold flex items-center gap-1"
              >
                <LayoutDashboard className="w-3 h-3" />
                <span>Portal</span>
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
               className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-academic-navy-light transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
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
        <div className="lg:hidden bg-academic-navy border-t border-academic-navy-light/80 px-3 py-4 space-y-4 shadow-lg">
          {user ? (
            <div className="p-3 rounded-lg bg-academic-navy-light border border-slate-700 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">
                  Signed in as
                </span>
                <p className="text-sm font-bold text-white leading-tight truncate">{user.name}</p>
                {user.usn && (
                  <span className="text-xs text-academic-gold-light font-mono">
                    USN: {user.usn}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {isAdmin ? (
                  <Link
                    to="/admin"
                    onClick={closeMenu}
                    className="px-3 py-2 rounded bg-amber-500 text-slate-950 font-bold text-xs min-h-[44px] flex items-center"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </Link>
                ) : (
                  <Link
                    to="/portal"
                    onClick={closeMenu}
                    className="px-3 py-2 rounded bg-academic-accent text-white text-xs font-bold min-h-[44px] flex items-center gap-1.5"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Portal</span>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-academic-navy-light/80 border border-slate-700/60 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white">Student &amp; Faculty Portal</p>
                <p className="text-[11px] text-slate-400">Access CIE marks &amp; internal evaluations</p>
              </div>
              <Link
                to="/login"
                onClick={closeMenu}
                className="px-3 py-2 rounded bg-academic-accent hover:bg-academic-accent-hover text-white text-xs font-semibold flex items-center gap-1 shadow-sm min-h-[44px]"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </Link>
            </div>
          )}

          {/* Navigation Links Grid */}
          <div className="grid grid-cols-2 gap-0.5 pt-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={closeMenu}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-3 rounded-md text-sm font-semibold transition-colors min-h-[48px] ${
                      isActive
                        ? 'bg-academic-navy-light text-white font-bold border-l-[3px] border-academic-accent'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 opacity-80 flex-shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </div>

          {user && (
            <div className="pt-3 border-t border-slate-700/80">
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  onLogout?.();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-md bg-red-900/30 text-red-300 hover:bg-red-900/50 font-semibold text-sm border border-red-800/40 transition-colors min-h-[48px]"
              >
                <LogOut className="w-4 h-4" />
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
