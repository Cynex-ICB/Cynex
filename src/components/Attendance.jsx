import { useEffect, useMemo, useState } from "react";
import { Calendar, UserCheck } from "lucide-react";
import { API_BASE_URL, readApiJson } from "../utils/api.js";

function formatDate(value) {
  try {
    return new Date(value).toLocaleDateString([], {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(value).slice(0, 10);
  }
}

function pctColor(pct) {
  if (pct >= 85) return "text-emerald-700";
  if (pct >= 75) return "text-amber-700";
  return "text-red-700";
}

function barColor(pct) {
  if (pct >= 85) return "bg-emerald-500";
  if (pct >= 75) return "bg-amber-500";
  return "bg-red-500";
}

function Attendance({ token }) {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState([]);
  const [overall, setOverall] = useState({ present: 0, total: 0, percentage: 0 });
  const [subjectFilter, setSubjectFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!token) return;
      try {
        const data = await readApiJson(
          await fetch(`${API_BASE_URL}/attendance/me`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        );
        if (!isMounted) return;
        setRecords(data.records || []);
        setSummary(data.summary || []);
        setOverall(data.overall || { present: 0, total: 0, percentage: 0 });
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const subjects = useMemo(() => {
    const map = new Map();
    for (const record of records) {
      const id = record.subject?._id || record.subject?.id || record.subject;
      if (id && !map.has(id)) map.set(id, record.subject);
    }
    return Array.from(map.entries()).map(([id, subject]) => ({
      id,
      label: subject?.code ? `${subject.code} · ${subject.name}` : subject?.name || id,
    }));
  }, [records]);

  const visibleRecords = subjectFilter
    ? records.filter((r) => (r.subject?._id || r.subject?.id || r.subject) === subjectFilter)
    : records;

  return (
    <div className="py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-8 text-academic-text">
      <section className="page-hero">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-academic-navy text-white text-xs font-mono font-semibold uppercase tracking-wider mb-3">
            <UserCheck className="w-3.5 h-3.5 text-academic-gold-light" />
            <span>Attendance Record</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-academic-navy tracking-tight">
            My Attendance
          </h1>
          <p className="text-sm sm:text-base text-academic-text-secondary mt-2 leading-relaxed">
            {overall.total > 0 ? (
              <>
                Overall:{" "}
                <strong className={`font-extrabold ${pctColor(overall.percentage)}`}>
                  {overall.percentage}%
                </strong>{" "}
                ({overall.present} of {overall.total} classes present)
              </>
            ) : (
              "Subject-wise attendance marked by your course instructors will appear here."
            )}
          </p>
        </div>
      </section>

      {error && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="institutional-card p-12 text-center">
          <p className="text-sm font-medium text-academic-text-muted">Loading attendance…</p>
        </div>
      ) : (
        <>
          {summary.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {summary.map((entry) => (
                <div key={entry.subject?._id || entry.subject?.id || entry.subject?.code} className="institutional-card p-5 space-y-2">
                  <h3 className="text-sm font-bold text-academic-navy">
                    <span className="font-mono text-academic-accent mr-2">{entry.subject?.code}</span>
                    {entry.subject?.name}
                  </h3>
                  <div className="flex items-baseline justify-between">
                    <strong className={`text-2xl font-extrabold ${pctColor(entry.percentage)}`}>
                      {entry.percentage}%
                    </strong>
                    <span className="text-xs text-academic-text-muted">
                      {entry.present}/{entry.total} present
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barColor(entry.percentage)}`}
                      style={{ width: `${entry.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="institutional-card overflow-hidden">
            <div className="p-4 border-b border-academic-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-bold text-academic-navy flex items-center gap-2">
                <Calendar className="w-4 h-4 text-academic-accent" />
                Daily Records
              </h2>
              {subjects.length > 0 && (
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  aria-label="Filter by subject"
                  className="px-3 py-1.5 rounded border border-academic-border bg-white text-xs font-semibold text-academic-navy focus:outline-none focus:ring-2 focus:ring-academic-navy/20"
                >
                  <option value="">All subjects</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {visibleRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-academic-border text-academic-text-muted font-mono uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-academic-border">
                    {visibleRecords.map((record) => (
                      <tr key={record.id || record._id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-semibold text-academic-navy">
                          {formatDate(record.date)}
                        </td>
                        <td className="py-3 px-4 text-academic-text-secondary">
                          <span className="font-mono text-academic-accent mr-1.5">
                            {record.subject?.code}
                          </span>
                          {record.subject?.name}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                              record.status === "present"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center">
                <p className="text-sm font-bold text-academic-navy">No attendance records yet</p>
                <p className="text-xs text-academic-text-muted mt-1">
                  Records appear here once your instructors start marking attendance.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Attendance;
