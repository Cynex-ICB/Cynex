import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import QuestionList from "../../components/QuestionList";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import { useToast } from "../../context/ToastContext";
import { apiFetch } from "../../utils/api";

export default function QuestionReview() {
  const { id } = useParams();
  const toast = useToast();
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);

  async function load() {
    const data = await apiFetch(`/aptitude/admin/assessments/${id}`);
    setAssessment(data.assessment);
    setQuestions(data.questions);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function save(status = null) {
    setSaving(true);
    try {
      const data = await apiFetch(`/aptitude/admin/assessments/${id}/questions`, {
        method: "PUT",
        body: JSON.stringify({ questions }),
      });
      setAssessment(data.assessment);
      setQuestions(data.questions);
      if (status) {
        const updated = await apiFetch(`/aptitude/admin/assessments/${id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status }),
        });
        setAssessment(updated.assessment);
      }
      toast.success(status === "published" ? "Saved and published" : "Questions saved");
    } catch (error) {
      toast.error(error.details?.join(", ") || error.message);
    } finally {
      setSaving(false);
    }
  }

  if (!assessment) return <LoadingSkeleton label="Loading questions" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-accent">Question Review</p>
          <h2 className="mt-2 text-3xl font-black text-ink">{assessment.title}</h2>
          <p className="text-sm text-slate-500">
            {questions.length} questions &middot; {assessment.status}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            disabled={saving}
            onClick={() => save()}
            className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-bold text-ink hover:bg-surface focus:outline-none focus:ring-2 focus:ring-line disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save edits"}
          </button>
          <button
            disabled={saving}
            onClick={() => save("published")}
            className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-60"
          >
            Publish assessment
          </button>
        </div>
      </div>
      <QuestionList
        questions={questions}
        setQuestions={setQuestions}
        defaults={{ concept: assessment.concept, difficulty: assessment.difficulty }}
      />
    </div>
  );
}
