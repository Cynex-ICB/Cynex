import { LogOut } from 'lucide-react';

export default function Navbar({ title, subtitle, onLogout }) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
      <div>
        <p className="text-xs font-semibold uppercase text-slate-500">{subtitle}</p>
        <h1 className="text-lg font-bold text-ink">{title}</h1>
      </div>
      {onLogout ? (
        <button
          onClick={onLogout}
          className="focus-ring inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      ) : null}
    </header>
  );
}
