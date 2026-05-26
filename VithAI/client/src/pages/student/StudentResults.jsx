import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { apiFetch, formatDateTime } from '../../utils/api';

export default function StudentResults() {
  const [results, setResults] = useState(null);

  useEffect(() => {
    apiFetch('/student/results').then((data) => setResults(data.results));
  }, []);

  if (!results) return <LoadingSkeleton label="Loading results" />;

  return (
    <section className="page-stack">
      <div className="page-hero">
        <p className="eyebrow">Performance Archive</p>
        <h2 className="mt-2 text-3xl font-black text-ink">My Results</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Review submitted attempts, scores, pass status, explanations, and topic analytics.
        </p>
      </div>
      <div className="grid gap-4">
        {results.map((result) => (
          <Link
            key={result.id}
            to={`/student/results/${result.id}`}
            className="rounded-md border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:shadow-soft"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-ink">{result.assessment_title}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {result.concept} · {result.difficulty} · {formatDateTime(result.submitted_at)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-ink">{result.percentage}%</p>
                <p className={result.passed ? 'text-sm font-bold text-emerald-700' : 'text-sm font-bold text-red-600'}>
                  {result.passed ? 'Passed' : 'Failed'}
                </p>
              </div>
            </div>
          </Link>
        ))}
        {!results.length ? (
          <div className="surface p-8 text-center text-sm font-semibold text-slate-500">
            No submitted attempts yet.
          </div>
        ) : null}
      </div>
    </section>
  );
}
