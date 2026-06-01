import { useState } from "react";
import { Clock, FileText, Gauge, Sparkles, Target } from "lucide-react";
import ManualGenerationForm from "../../components/ManualGenerationForm";

export default function CreateAssessment() {
  const [form, setForm] = useState(null);

  return (
    <section className="admin-grid admin-route-panel">
      <div>
        <ManualGenerationForm onFormChange={setForm} />
      </div>
      <div>
        <AssessmentPreview form={form} />
      </div>
    </section>
  );
}

function AssessmentPreview({ form }) {
  const isEmpty = !form || !form.title?.trim();

  if (isEmpty) {
    return (
      <section className="card" style={{ padding: "clamp(1rem, 3vw, 1.4rem)" }}>
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--color-muted)" }}>
          <Sparkles size={32} style={{ opacity: 0.3, margin: "0 auto 0.75rem", display: "block" }} />
          <p style={{ fontWeight: 850, margin: 0 }}>No assessment configured</p>
          <p className="admin-file-hint" style={{ marginTop: "0.4rem" }}>
            Fill in the form to see a live preview.
          </p>
        </div>
      </section>
    );
  }

  const rowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.45rem 0",
    borderBottom: "1px solid var(--color-line)",
    fontSize: "0.9rem",
  };

  const labelStyle = {
    color: "var(--color-muted)",
    fontWeight: 700,
    fontSize: "0.82rem",
    textTransform: "uppercase",
    letterSpacing: "0.02em",
  };

  const valueStyle = {
    fontWeight: 850,
    color: "var(--color-ink)",
    textAlign: "right",
  };

  const badgeStyle = (variant) => ({
    display: "inline-block",
    padding: "0.125rem 0.5rem",
    borderRadius: "4px",
    fontSize: "0.75rem",
    fontWeight: 850,
    background: variant === "published" ? "rgba(5, 150, 105, 0.1)" : "rgba(148, 163, 184, 0.15)",
    color: variant === "published" ? "#059669" : "#64748b",
  });

  const iconStyle = { color: "var(--color-accent)", width: 16, height: 16 };

  const totalMarks = form.questionCount * Number(form.marks_per_question);

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "clamp(1rem, 3vw, 1.4rem)", borderBottom: "1px solid var(--color-line)" }}>
        <p className="eyebrow" style={{ marginBottom: "0.15rem" }}>Assessment Preview</p>
        <h2 style={{ margin: 0 }}>{form.title || "Untitled Assessment"}</h2>
        <span className="admin-file-hint">
          Review the configured settings before generating questions.
        </span>
      </div>

      <div style={{ padding: "clamp(1rem, 3vw, 1.4rem)", display: "grid", gap: "0.15rem" }}>
        <div style={rowStyle}>
          <span style={labelStyle}>Status</span>
          <span style={badgeStyle(form.status)}>
            {form.status === "published" ? "Published" : "Draft"}
          </span>
        </div>

        <div style={{ ...rowStyle, borderBottom: "1px solid var(--color-line)", marginBottom: "0.5rem", paddingBottom: "0.75rem" }}>
          <span style={labelStyle}>Mode</span>
          <span style={valueStyle}>{form.generation_mode === "ai" ? "AI Enhanced" : "Fast"}</span>
        </div>

        <div style={{ display: "grid", gap: "0.65rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Target style={iconStyle} />
            <span style={{ fontWeight: 850, fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.02em", color: "var(--color-muted)" }}>Assessment Details</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Concept</span>
            <span style={valueStyle}>{form.concept}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Difficulty</span>
            <span style={valueStyle}>{form.difficulty}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Questions</span>
            <span style={valueStyle}>{form.questionCount}</span>
          </div>
        </div>

        <div style={{ display: "grid", gap: "0.65rem", marginTop: "0.5rem", paddingTop: "0.75rem", borderTop: "1px solid var(--color-line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Gauge style={iconStyle} />
            <span style={{ fontWeight: 850, fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.02em", color: "var(--color-muted)" }}>Scoring & Timing</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Duration</span>
            <span style={valueStyle}>{form.duration_minutes} min</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Marks / Question</span>
            <span style={valueStyle}>{form.marks_per_question}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Negative / Question</span>
            <span style={valueStyle}>{form.negative_marks}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Passing Marks</span>
            <span style={valueStyle}>{form.passing_marks}</span>
          </div>
          <div style={rowStyle}>
            <span style={{ color: "var(--color-accent)", fontWeight: 850, fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.02em" }}>
              Total Marks
            </span>
            <span style={{ ...valueStyle, color: "var(--color-accent)" }}>{totalMarks}</span>
          </div>
        </div>

        {(form.start_time || form.end_time) ? (
          <div style={{ display: "grid", gap: "0.65rem", marginTop: "0.5rem", paddingTop: "0.75rem", borderTop: "1px solid var(--color-line)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Clock style={iconStyle} />
              <span style={{ fontWeight: 850, fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.02em", color: "var(--color-muted)" }}>Time Window</span>
            </div>
            {form.start_time ? (
              <div style={rowStyle}>
                <span style={labelStyle}>Starts</span>
                <span style={{ ...valueStyle, fontSize: "0.82rem" }}>
                  {new Date(form.start_time).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ) : null}
            {form.end_time ? (
              <div style={rowStyle}>
                <span style={labelStyle}>Ends</span>
                <span style={{ ...valueStyle, fontSize: "0.82rem" }}>
                  {new Date(form.end_time).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ) : null}
          </div>
        ) : null}

        {form.file ? (
          <div style={{ display: "grid", gap: "0.65rem", marginTop: "0.5rem", paddingTop: "0.75rem", borderTop: "1px solid var(--color-line)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <FileText style={iconStyle} />
              <span style={{ fontWeight: 850, fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.02em", color: "var(--color-muted)" }}>Source File</span>
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>File</span>
              <span style={{ ...valueStyle, fontSize: "0.82rem", maxWidth: "14rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {form.file.name}
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}