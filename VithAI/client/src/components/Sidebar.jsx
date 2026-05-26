import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  BookOpenCheck,
  ClipboardList,
  FilePlus2,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/assessments/create', label: 'Create Assessment', icon: FilePlus2 },
  { to: '/admin/assessments', label: 'Assessments', icon: ClipboardList },
];

const studentLinks = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/assessments', label: 'Available Assessments', icon: BookOpenCheck },
  { to: '/student/results', label: 'Results', icon: BarChart3 },
];

export default function Sidebar({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = role === 'admin' ? adminLinks : studentLinks;
  const home = role === 'admin' ? '/admin/dashboard' : '/student/dashboard';

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function renderLinks(compact = false) {
    return links.map((item) => {
      const Icon = item.icon;
      return (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            compact
              ? `inline-flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-xs font-bold ${
                  isActive
                    ? 'border-blue-200 bg-blue-50 text-brand'
                    : 'border-slate-200 bg-white text-slate-600'
                }`
              : `group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-bold transition ${
                  isActive
                    ? 'bg-blue-50/10 text-white'
                    : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                }`
          }
        >
          {({ isActive }) => (
            <>
              {!compact ? (
                <span
                  className={`absolute left-0 h-6 w-1 rounded-r ${
                    isActive ? 'bg-blue-400' : 'bg-transparent'
                  }`}
                />
              ) : null}
              <Icon
                className={`h-4 w-4 ${
                  isActive
                    ? compact
                      ? 'text-brand'
                      : 'text-blue-300'
                    : compact
                      ? 'text-slate-500'
                      : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              <span>{item.label}</span>
            </>
          )}
        </NavLink>
      );
    });
  }

  return (
    <div className="min-h-screen bg-panel">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-800 bg-sidebar p-5 text-white shadow-lift lg:block">
        <Link to={home} className="flex items-center gap-3 rounded-md border border-slate-700/80 bg-slate-800/60 p-3">
          <span className="grid h-11 w-11 place-items-center rounded-md bg-blue-600 text-white shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span>
            <span className="text-lg font-black">VithAI</span>
            <span className="block text-xs font-semibold text-slate-300">
              {role === 'admin' ? 'Assessment Admin' : 'Student Prep'}
            </span>
          </span>
        </Link>

        <div className="mt-5 rounded-md border border-slate-700/80 bg-slate-900/50 p-4">
          <p className="text-xs font-bold uppercase text-slate-500">{role}</p>
          <p className="mt-1 truncate text-sm font-bold text-slate-100">{user?.name}</p>
          <p className="truncate text-xs text-slate-400">{user?.email}</p>
        </div>

        <div className="mt-7 border-t border-slate-800 pt-5">
          <p className="mb-3 px-3 text-xs font-bold uppercase text-slate-500">Navigation</p>
          <nav className="space-y-1.5">{renderLinks()}</nav>
        </div>

        <button
          onClick={handleLogout}
          className="focus-ring absolute bottom-5 left-5 right-5 flex items-center justify-center gap-2 rounded-md border border-slate-700 bg-slate-900/40 px-3 py-2.5 text-sm font-bold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </aside>

      <main className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">{role === 'admin' ? 'Admin Console' : 'Student Portal'}</p>
              <h1 className="text-lg font-black text-ink">{user?.name}</h1>
            </div>
            <button onClick={handleLogout} className="btn-secondary px-3 py-2 lg:hidden">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">{renderLinks(true)}</nav>
        </header>

        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
