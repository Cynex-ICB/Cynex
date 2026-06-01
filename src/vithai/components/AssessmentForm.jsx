export default function AssessmentForm({ form, setForm, onSubmit, loading }) {
  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-md border border-line bg-white p-5 md:grid-cols-2">
      <label className="text-sm font-semibold text-slate-700 md:col-span-2">
        Title
        <input
          required
          value={form.title || ""}
          onChange={(event) => update("title", event.target.value)}
          className="mt-1 w-full rounded-md border border-line px-3 py-2 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </label>
      <label className="text-sm font-semibold text-slate-700">
        Duration
        <input
          type="number"
          min="1"
          value={form.duration_minutes || 60}
          onChange={(event) => update("duration_minutes", Number(event.target.value))}
          className="mt-1 w-full rounded-md border border-line px-3 py-2 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </label>
      <label className="text-sm font-semibold text-slate-700">
        Passing Marks
        <input
          type="number"
          min="0"
          value={form.passing_marks || 0}
          onChange={(event) => update("passing_marks", Number(event.target.value))}
          className="mt-1 w-full rounded-md border border-line px-3 py-2 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </label>
      <button
        disabled={loading}
        className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-60 md:col-span-2"
      >
        {loading ? "Saving..." : "Save Assessment"}
      </button>
    </form>
  );
}
