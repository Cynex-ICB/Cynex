import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, BarChart3, BookOpenCheck } from "lucide-react";
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

export default function StudentDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    apiFetch("/aptitude/student/dashboard").then(setStats);
  }, []);

  if (!stats) return <LoadingSkeleton label="Loading dashboard" />;

  return (
    <section className="page-stack">
      <div className="page-hero flex flex-wrap items-center justify-between gap-4">
        <Link to="/aptitude" className="btn-secondary self-start">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <p className="eyebrow">Student Overview</p>
          <h2 className="mt-2 text-3xl font-black text-ink">Practice dashboard</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Track available assessments, score trends, topic strength, and recent submissions.
          </p>
        </div>
        <Link to="/aptitude/student/assessments" className="btn-primary">
          <BookOpenCheck className="h-4 w-4" />
          Start Practice
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Available Assessments" value={stats.available_assessments} />
        <StatCard label="Submitted Attempts" value={stats.submitted_attempts} tone="mint" />
        <StatCard label="Passed Attempts" value={stats.passed_attempts} tone="coral" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard label="Pass Rate" value={`${stats.pass_rate}%`} tone="mint" />
        <StatCard label="Average Score" value={`${stats.average_percentage}%`} tone="coral" />
      </div>

      <section className="surface p-5">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-accent" />
          <h3 className="text-lg font-black text-ink">Topic Performance</h3>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {stats.topic_analytics?.length ? (
            stats.topic_analytics.map((topic) => (
              <div key={topic.concept} className="rounded-md border border-line bg-surface/60 p-4">
                <div className="flex items-center justify-between gap-3 text-sm font-semibold">
                  <span>{topic.concept}</span>
                  <span>{topic.average_percentage}% avg</span>
                </div>
                <div className="mt-3 h-2 rounded bg-slate-100">
                  <div
                    className="h-2 rounded bg-accent"
                    style={{ width: `${Math.min(topic.average_percentage, 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {topic.attempts} attempts &middot; Best {topic.best_percentage}% &middot; Pass rate {topic.pass_rate}%
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No topic analytics yet.</p>
          )}
        </div>
      </section>

      <section className="table-shell">
        <div className="border-b border-line px-5 py-4">
          <h3 className="text-lg font-black text-ink">My Submission Analytics</h3>
          <p className="text-sm text-slate-500">Your latest submitted attempts</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-surface">
              <tr>
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
              {stats.recent_submissions?.length ? (
                stats.recent_submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-surface/70">
                    <td className="px-4 py-3 font-semibold text-ink">{submission.assessment_title}</td>
                    <td className="px-4 py-3">{submission.concept}</td>
                    <td className="px-4 py-3">{submission.difficulty}</td>
                    <td className="px-4 py-3">
                      {submission.score}/{submission.total_marks}
                      <p className="text-xs text-slate-500">Pass: {submission.passing_marks}</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-ink">{submission.percentage}%</td>
                    <td className="px-4 py-3">
                      {formatDuration(submission.time_taken_seconds)}
                      <p className="text-xs text-slate-500">Limit: {submission.duration_minutes}m</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${submission.passed ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                        {submission.passed ? "Passed" : "Failed"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{formatDateTime(submission.submitted_at)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-500" colSpan="8">
                    No submissions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}