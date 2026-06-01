import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, FilePlus2 } from "lucide-react";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import StatCard from "../../components/StatCard";
import { apiFetch, formatDateTime } from "../../utils/api";

function formatDuration(seconds) {
  if (!seconds) return "0m";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    apiFetch("/aptitude/admin/dashboard").then(setStats);
  }, []);

  if (!stats) return <LoadingSkeleton label="Loading dashboard" />;

  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-accent">Admin Overview</p>
            <h2 className="mt-2 text-3xl font-black text-ink">Assessment command center</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Monitor publishing, submissions, pass rates, and student performance from one focused dashboard.
            </p>
          </div>
          <Link to="/admin/aptitude/assessments/create" className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-accent/20">
            <FilePlus2 className="h-4 w-4" />
            Create Assessment
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Assessments" value={stats.assessments} />
        <StatCard label="Published" value={stats.published} tone="mint" />
        <StatCard label="Students" value={stats.students} tone="coral" />
        <StatCard label="Submissions" value={stats.submitted_attempts} tone="slate" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="In Progress" value={stats.in_progress_attempts} />
        <StatCard label="Pass Rate" value={`${stats.pass_rate}%`} tone="mint" />
        <StatCard label="Average Score" value={`${stats.average_percentage}%`} tone="coral" />
      </div>

      <div className="overflow-hidden rounded-md border border-line bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-accent" />
              <h3 className="text-lg font-black text-ink">Student Submission Analytics</h3>
            </div>
            <p className="text-sm text-slate-500">Latest submitted attempts across all assessments</p>
          </div>
          <Link to="/admin/aptitude/assessments" className="inline-flex items-center gap-1 text-sm font-black text-accent">
            Manage assessments <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-sm">
            <thead className="bg-surface">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Student</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Assessment</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Concept</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Difficulty</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Marks</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Percentage</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Time Taken</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Result</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-alt">
              {stats.submissions?.length ? (
                stats.submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-surface/70">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">{submission.student_name}</p>
                      <p className="text-xs text-slate-500">{submission.email}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold">{submission.assessment_title}</td>
                    <td className="px-4 py-3">{submission.concept}</td>
                    <td className="px-4 py-3">{submission.difficulty}</td>
                    <td className="px-4 py-3">
                      {submission.score}/{submission.total_marks}
                      <p className="text-xs text-slate-500">Pass: {submission.passing_marks}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-ink">{submission.percentage}%</span>
                    </td>
                    <td className="px-4 py-3">
                      {formatDuration(submission.time_taken_seconds)}
                      <p className="text-xs text-slate-500">Limit: {submission.duration_minutes}m</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-xs font-bold ${
                          submission.passed
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {submission.passed ? "Passed" : "Failed"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{formatDateTime(submission.submitted_at)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-500" colSpan="9">
                    No submissions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
