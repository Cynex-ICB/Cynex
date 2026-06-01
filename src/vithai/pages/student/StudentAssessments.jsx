import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import AssessmentCard from "../../components/AssessmentCard";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import { apiFetch } from "../../utils/api";

export default function StudentAssessments() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState(null);

  useEffect(() => {
    apiFetch("/aptitude/student/assessments").then((data) => setAssessments(data.assessments));
  }, []);

  if (!assessments) return <LoadingSkeleton label="Loading assessments" />;

  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-accent">Assessment Library</p>
        <h2 className="mt-2 text-3xl font-black text-ink">Available Assessments</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Choose a published assessment and continue with your latest in-progress attempt when available.
        </p>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {assessments.map((assessment) => (
          <AssessmentCard
            key={assessment.id}
            assessment={assessment}
            action={
              <button
                onClick={() => navigate(`/aptitude/student/assessments/${assessment.id}/start`)}
                className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                <Play className="h-4 w-4" />
                Start Assessment
              </button>
            }
          />
        ))}
        {!assessments.length ? (
          <div className="rounded-md border border-line bg-white p-8 text-center text-sm font-semibold text-slate-500">
            No published assessments are available right now.
          </div>
        ) : null}
      </div>
    </div>
  );
}
