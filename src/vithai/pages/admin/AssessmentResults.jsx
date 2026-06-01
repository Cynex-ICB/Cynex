import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import { useToast } from "../../context/ToastContext";
import { apiFetch, formatDateTime } from "../../utils/api";

export default function AssessmentResults() {
  const { id } = useParams();
  const toast = useToast();
  const [results, setResults] = useState(null);
  const [extensions, setExtensions] = useState({});
  const [savingAttemptId, setSavingAttemptId] = useState(null);

  async function loadResults() {
    apiFetch(`/aptitude/admin/assessments/${id}/results`).then((data) => setResults(data.results));
  }

  useEffect(() => {
    loadResults();
  }, [id]);

  async function extendAttempt(attemptId) {
    const minutes = Number(extensions[attemptId] || 5);
    setSavingAttemptId(attemptId);
    try {
      await apiFetch(`/aptitude/admin/attempts/${attemptId}/extend`, {
        method: "PATCH",
        body: JSON.stringify({ minutes }),
      });
      toast.success(`Added ${minutes} minutes`);
      setExtensions((current) => ({ ...current, [attemptId]: 5 }));
      await loadResults();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSavingAttemptId(null);
    }
  }

  if (!results) return <LoadingSkeleton label="Loading results" />;

  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-accent">Attempt Monitor</p>
        <h2 className="mt-2 text-3xl font-black text-ink">Assessment Results</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Inspect started and submitted attempts, add extra time for active students, and review pass status.
        </p>
      </div>
      <div className="overflow-hidden rounded-md border border-line bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-surface">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Student Name</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Email</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Score</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Percentage</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Result</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Extra Time</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Started At</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Submitted At</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Extend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-alt">
              {results.map((result) => (
                <tr key={result.id} className="hover:bg-surface/70">
                  <td className="px-4 py-3 font-semibold">{result.student_name}</td>
                  <td className="px-4 py-3">{result.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-xs font-bold ${
                        result.status === "in_progress"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {result.status === "in_progress" ? "In progress" : "Submitted"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{result.status === "submitted" ? result.score : "-"}</td>
                  <td className="px-4 py-3">
                    {result.status === "submitted" ? `${result.percentage}%` : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        result.status !== "submitted"
                          ? "text-slate-500"
                          : result.passed
                            ? "text-emerald-700 font-bold"
                            : "text-red-600 font-bold"
                      }
                    >
                      {result.status !== "submitted" ? "Pending" : result.passed ? "Passed" : "Failed"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{result.extra_time_minutes || 0}m</td>
                  <td className="px-4 py-3">{formatDateTime(result.started_at)}</td>
                  <td className="px-4 py-3">{formatDateTime(result.submitted_at)}</td>
                  <td className="px-4 py-3">
                    {result.status === "in_progress" ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="180"
                          value={extensions[result.id] ?? 5}
                          onChange={(event) =>
                            setExtensions((current) => ({
                              ...current,
                              [result.id]: event.target.value,
                            }))
                          }
                          className="w-20 rounded-md border border-line px-2 py-1 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                        />
                        <button
                          onClick={() => extendAttempt(result.id)}
                          disabled={savingAttemptId === result.id}
                          className="rounded-md bg-accent px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-60"
                        >
                          {savingAttemptId === result.id ? "Adding..." : "Add min"}
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400">Closed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
