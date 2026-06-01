import { Link } from "react-router-dom";
import { BarChart3, BookOpenCheck, ClipboardList, ShieldCheck } from "lucide-react";

export default function AptitudeLanding({ user }) {
  const isAdmin = user?.role === "admin" || user?.role === "master-admin";
  const isStudent = user?.role === "student";

  return (
    <div className="p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center gap-4 border-b border-line pb-6">
          <span className="grid h-14 w-14 place-items-center rounded-xl bg-accent text-white shadow-sm">
            <ShieldCheck className="h-7 w-7" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-accent">VithAI</p>
            <h1 className="text-3xl font-black text-ink">Aptitude Assessment Platform</h1>
            <p className="text-sm text-slate-500">AI-powered placement and interview preparation</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {isAdmin ? (
            <>
              <Link
                to="/aptitude/admin/dashboard"
                className="group rounded-md border border-line bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-accent hover:shadow-card-hover"
              >
                <BarChart3 className="h-8 w-8 text-accent" />
                <h3 className="mt-4 text-lg font-black text-ink group-hover:text-accent">Admin Dashboard</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Monitor assessments, submissions, pass rates, and student performance.
                </p>
              </Link>
            </>
          ) : null}
          {isStudent ? (
            <>
              <Link
                to="/aptitude/student/dashboard"
                className="group rounded-md border border-line bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-accent hover:shadow-card-hover"
              >
                <BarChart3 className="h-8 w-8 text-accent" />
                <h3 className="mt-4 text-lg font-black text-ink group-hover:text-accent">Student Dashboard</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Track your progress, score trends, and topic strength.
                </p>
              </Link>
              <Link
                to="/aptitude/student/assessments"
                className="group rounded-md border border-line bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-accent hover:shadow-card-hover"
              >
                <BookOpenCheck className="h-8 w-8 text-accent" />
                <h3 className="mt-4 text-lg font-black text-ink group-hover:text-accent">Available Assessments</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Take published aptitude assessments for placement practice.
                </p>
              </Link>
              <Link
                to="/aptitude/student/results"
                className="group rounded-md border border-line bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-accent hover:shadow-card-hover"
              >
                <ClipboardList className="h-8 w-8 text-accent" />
                <h3 className="mt-4 text-lg font-black text-ink group-hover:text-accent">My Results</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Review your submitted attempts, scores, and detailed feedback.
                </p>
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
