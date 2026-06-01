import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Plus, Rocket, Trash2 } from "lucide-react";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import { useToast } from "../../context/ToastContext";
import { apiFetch, formatDateTime } from "../../utils/api";

export default function AdminAssessments() {
  const toast = useToast();
  const [assessments, setAssessments] = useState(null);
  const [extendMinutes, setExtendMinutes] = useState({});
  const [savingId, setSavingId] = useState(null);

  async function load() {
    const data = await apiFetch("/aptitude/admin/assessments");
    setAssessments(data.assessments);
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id) {
    if (!window.confirm("Remove this assessment from active listings? Historical attempts stay saved.")) return;
    await apiFetch(`/aptitude/admin/assessments/${id}`, { method: "DELETE" });
    toast.success("Assessment deleted");
    load();
  }

  async function setStatus(id, status) {
    await apiFetch(`/aptitude/admin/assessments/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    toast.success(status === "published" ? "Assessment published" : "Assessment unpublished");
    load();
  }

  async function extendDuration(id) {
    const minutes = Number(extendMinutes[id] || 5);
    setSavingId(id);
    try {
      await apiFetch(`/aptitude/admin/assessments/${id}/extend-duration`, {
        method: "PATCH",
        body: JSON.stringify({ minutes }),
      });
      toast.success(`Duration extended by ${minutes} minutes`);
      load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSavingId(null);
    }
  }

  if (!assessments) return <LoadingSkeleton label="Loading assessments" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-accent">Assessment Library</p>
          <h2 className="mt-2 text-3xl font-black text-ink">Assessments</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Review, publish, edit questions, extend duration, and inspect results.
          </p>
        </div>
        <Link
          to="/admin/aptitude/assessments/create"
          className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-bold text-white hover:bg-accent-dark"
        >
          <Plus className="h-4 w-4" />
          Create Assessment
        </Link>
      </div>

      {!assessments.length ? (
        <div className="rounded-md border border-line bg-white p-12 text-center">
          <p className="text-sm font-semibold text-slate-500">No assessments yet.</p>
          <Link
            to="/admin/aptitude/assessments/create"
            className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-accent hover:text-accent-dark"
          >
            <Plus className="h-4 w-4" />
            Create your first assessment
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-line bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-surface">
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Title</th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Details</th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Created</th>
                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {assessments.map((assessment) => (
                  <tr key={assessment.id} className="hover:bg-surface/50">
                    <td className="px-5 py-4">
                      <p className="font-bold text-ink">{assessment.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {assessment.total_questions} questions &middot; {assessment.duration_minutes} min &middot; {assessment.total_marks} marks
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="rounded-md bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent">
                          {assessment.concept}
                        </span>
                        <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          {assessment.difficulty}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block rounded-md px-2.5 py-1 text-xs font-bold ${
                          assessment.status === "published"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-surface-alt text-slate-600"
                        }`}
                      >
                        {assessment.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                      {formatDateTime(assessment.created_at)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          title="Extend duration"
                          onClick={() => {
                            const minutes = prompt("Enter extra minutes:", String(extendMinutes[assessment.id] || 5));
                            if (minutes && !isNaN(minutes) && Number(minutes) > 0) {
                              setExtendMinutes((prev) => ({ ...prev, [assessment.id]: minutes }));
                              extendDuration(assessment.id);
                            }
                          }}
                          disabled={savingId === assessment.id}
                          className="rounded-md border border-line bg-white p-2 text-xs font-bold text-ink hover:bg-surface disabled:opacity-50"
                        >
                          +{extendMinutes[assessment.id] || 5}m
                        </button>
                        <Link
                          title="View results"
                          to={`/admin/aptitude/assessments/${assessment.id}/results`}
                          className="rounded-md border border-line bg-white p-2 hover:bg-surface"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          title="Edit questions"
                          to={`/admin/aptitude/assessments/${assessment.id}/questions`}
                          className="rounded-md border border-line bg-white p-2 hover:bg-surface"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          title={assessment.status === "published" ? "Unpublish" : "Publish"}
                          onClick={() => setStatus(assessment.id, assessment.status === "published" ? "draft" : "published")}
                          className="rounded-md border border-line bg-white p-2 hover:bg-surface"
                        >
                          <Rocket className="h-4 w-4" />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => remove(assessment.id)}
                          className="rounded-md border border-red-100 bg-white p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
