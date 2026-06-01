import { CalendarClock, Clock, Trophy } from "lucide-react";
import { formatDateTime } from "../utils/api";

export default function AssessmentCard({ assessment, action }) {
  return (
    <article className="group rounded-md border border-line bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-accent hover:shadow-card-hover">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-ink">{assessment.title}</h3>
          <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="bg-accent/10 text-accent rounded-md px-2 py-1">{assessment.concept}</span>
            <span className="bg-emerald-50 text-emerald-700 rounded-md px-2 py-1">{assessment.difficulty}</span>
          </div>
        </div>
        {action}
      </div>
      <dl className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <div className="flex items-center gap-2 rounded-md bg-surface px-3 py-2">
          <Clock className="h-4 w-4 text-accent" />
          {assessment.duration_minutes} minutes
        </div>
        <div className="flex items-center gap-2 rounded-md bg-surface px-3 py-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          {assessment.total_marks} marks
        </div>
        <div className="flex items-center gap-2 rounded-md bg-surface px-3 py-2">
          <CalendarClock className="h-4 w-4 text-slate-400" />
          Starts {formatDateTime(assessment.start_time)}
        </div>
        <div className="flex items-center gap-2 rounded-md bg-surface px-3 py-2">
          <CalendarClock className="h-4 w-4 text-slate-400" />
          Ends {formatDateTime(assessment.end_time)}
        </div>
      </dl>
    </article>
  );
}
