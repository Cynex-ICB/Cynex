import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, FileText, Gauge, Minus, Plus, Sparkles, Target, Users } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { apiFetch } from "../utils/api";

const concepts = [
  "All Concepts",
  "Percentages",
  "Profit and Loss",
  "Ratio and Proportion",
  "Time and Work",
  "Time, Speed and Distance",
  "Number System",
  "Simplification",
  "Averages",
  "Mixtures and Allegations",
  "Permutation and Combination",
  "Probability",
  "Simple Interest",
  "Compound Interest",
  "Data Interpretation",
  "Logical Reasoning",
  "Verbal Ability",
  "Coding-Decoding",
  "Blood Relations",
  "Seating Arrangement",
  "Puzzles",
];

const singleConceptCount = concepts.length - 1;

const sectionStyle = {
  borderTop: "1px solid var(--color-line)",
  paddingTop: "1.25rem",
  display: "grid",
  gap: "1rem",
};

const sectionHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  color: "var(--color-ink)",
};

const sectionTitleStyle = {
  fontSize: "0.85rem",
  fontWeight: 850,
  textTransform: "uppercase",
  letterSpacing: "0.02em",
  color: "var(--color-muted)",
};

const stepperStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  marginTop: "0.45rem",
};

const stepperBtnStyle = {
  width: "2.5rem",
  height: "2.5rem",
  display: "grid",
  placeItems: "center",
  borderRadius: "8px",
  border: "1px solid var(--color-line)",
  background: "#fff",
  cursor: "pointer",
  fontSize: "1rem",
  color: "var(--color-ink)",
  transition: "background 0.15s",
};

const stepperCountStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "3.5rem",
  height: "2.5rem",
  borderRadius: "8px",
  border: "1px solid var(--color-line)",
  background: "#fff",
  fontSize: "1.05rem",
  fontWeight: 850,
  color: "var(--color-ink)",
};

const totalHintStyle = {
  fontSize: "0.85rem",
  color: "var(--color-muted)",
  fontWeight: 700,
};

const fileLabelStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  color: "var(--color-ink)",
  fontWeight: 850,
  marginBottom: "0.45rem",
};

export default function ManualGenerationForm({ onFormChange }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    concept: "All Concepts",
    difficulty: "Mixed",
    perConcept: 5,
    totalQuestions: 30,
    duration_minutes: 60,
    marks_per_question: 1,
    negative_marks: 0.25,
    passing_marks: 20,
    start_time: "",
    end_time: "",
    status: "draft",
    generation_mode: "fast",
    file: null,
  });

  const questionCount = useMemo(
    () => (form.concept === "All Concepts" ? form.perConcept * singleConceptCount : form.totalQuestions),
    [form.concept, form.perConcept, form.totalQuestions],
  );

  useEffect(() => {
    onFormChange?.({ ...form, questionCount });
  }, [form, questionCount, onFormChange]);

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function step(key, delta, min = 1) {
    setField(key, Math.max(min, Number(form[key]) + delta));
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      const payload = new FormData();

      payload.append("title", form.title.trim());
      payload.append("concept", form.concept);
      payload.append("difficulty", form.difficulty);
      payload.append("question_count", String(questionCount));
      payload.append("questionCount", String(questionCount));

      if (form.concept === "All Concepts") {
        payload.append("questions_per_concept", String(form.perConcept));
      } else {
        payload.append("total_questions", String(form.totalQuestions));
      }

      payload.append("duration_minutes", String(form.duration_minutes));
      payload.append("marks_per_question", String(form.marks_per_question));
      payload.append("negative_marks", String(form.negative_marks));
      payload.append("passing_marks", String(form.passing_marks));
      payload.append("status", form.status);
      payload.append("generation_mode", form.generation_mode);

      if (form.start_time) payload.append("start_time", form.start_time);
      if (form.end_time) payload.append("end_time", form.end_time);
      if (form.file) payload.append("file", form.file);

      const data = await apiFetch("/aptitude/admin/assessments/generate", {
        method: "POST",
        body: payload,
      });

      toast.success("Questions generated and saved as an assessment");
      navigate(`/admin/aptitude/assessments/${data.assessment.id}/questions`);
    } catch (error) {
      toast.error(error.details?.join(", ") || error.message || "Failed to generate assessment");
    } finally {
      setLoading(false);
    }
  }

  const StepperField = ({ label, valueKey, value }) => (
    <label>
      {label}
      <div style={stepperStyle}>
        <button
          type="button"
          onClick={() => step(valueKey, -1)}
          style={stepperBtnStyle}
          onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-surface)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
          title="Decrease"
        >
          <Minus size={16} />
        </button>
        <span style={stepperCountStyle}>{value}</span>
        <button
          type="button"
          onClick={() => step(valueKey, 1)}
          style={stepperBtnStyle}
          onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-surface)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
          title="Increase"
        >
          <Plus size={16} />
        </button>
        <span style={totalHintStyle}>
          Total: <strong style={{ color: "var(--color-ink)" }}>{questionCount}</strong> questions
        </span>
      </div>
    </label>
  );

  return (
    <form className="card admin-form" onSubmit={submit}>
      <div>
        <p className="eyebrow">AI Builder</p>
        <h2>Create Assessment</h2>
        <span className="admin-file-hint">
          Select the assessment shape, then let the backend AI agent build editable MCQs.
        </span>
      </div>

      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <Target size={16} style={{ color: "var(--color-accent)" }} />
          <span style={sectionTitleStyle}>Assessment Details</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            Assessment Title
            <input
              required
              value={form.title}
              onChange={(event) => setField("title", event.target.value)}
            />
          </label>
          <label>
            Concept
            <select
              value={form.concept}
              onChange={(event) => setField("concept", event.target.value)}
            >
              {concepts.map((concept) => (
                <option key={concept}>{concept}</option>
              ))}
            </select>
          </label>
          <label>
            Difficulty
            <select
              value={form.difficulty}
              onChange={(event) => setField("difficulty", event.target.value)}
            >
              {["Easy", "Medium", "Hard", "Mixed"].map((difficulty) => (
                <option key={difficulty}>{difficulty}</option>
              ))}
            </select>
          </label>
          <StepperField
            label={form.concept === "All Concepts" ? "Questions Per Concept" : "Total Questions"}
            valueKey={form.concept === "All Concepts" ? "perConcept" : "totalQuestions"}
            value={form.concept === "All Concepts" ? form.perConcept : form.totalQuestions}
          />
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <Gauge size={16} style={{ color: "var(--color-accent)" }} />
          <span style={sectionTitleStyle}>Scoring & Timing</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <div style={fileLabelStyle}>
              <Clock size={14} />
              Duration (minutes)
            </div>
            <input
              type="number"
              min="0"
              value={form.duration_minutes}
              onChange={(event) => setField("duration_minutes", event.target.value)}
            />
          </label>
          <label>
            Marks per question
            <input
              type="number"
              min="0"
              step="0.25"
              value={form.marks_per_question}
              onChange={(event) => setField("marks_per_question", event.target.value)}
            />
          </label>
          <label>
            Negative marks
            <input
              type="number"
              min="0"
              step="0.25"
              value={form.negative_marks}
              onChange={(event) => setField("negative_marks", event.target.value)}
            />
          </label>
          <label>
            Passing marks
            <input
              type="number"
              min="0"
              step="0.25"
              value={form.passing_marks}
              onChange={(event) => setField("passing_marks", event.target.value)}
            />
          </label>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <Users size={16} style={{ color: "var(--color-accent)" }} />
          <span style={sectionTitleStyle}>Availability & Publishing</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            Status
            <select
              value={form.status}
              onChange={(event) => setField("status", event.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          <label>
            Generation Mode
            <select
              value={form.generation_mode}
              onChange={(event) => setField("generation_mode", event.target.value)}
            >
              <option value="fast">Fast</option>
              <option value="ai">AI Enhanced</option>
            </select>
          </label>
          <label>
            Start time
            <input
              type="datetime-local"
              value={form.start_time}
              onChange={(event) => setField("start_time", event.target.value)}
            />
          </label>
          <label>
            End time
            <input
              type="datetime-local"
              value={form.end_time}
              onChange={(event) => setField("end_time", event.target.value)}
            />
          </label>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <FileText size={16} style={{ color: "var(--color-accent)" }} />
          <span style={sectionTitleStyle}>Source Material</span>
        </div>
        <label>
          <span style={fileLabelStyle}>
            <FileText size={14} />
            Optional source file
          </span>
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={(event) => setField("file", event.target.files?.[0] || null)}
          />
          <span className="admin-file-hint">
            {form.file ? form.file.name : "Upload PDF, DOCX, or TXT as source material"}
          </span>
        </label>
      </div>

      <button className="primary-button admin-submit" type="submit" disabled={loading}>
        <Sparkles size={16} />
        {loading ? "Generating questions..." : "Generate Questions"}
      </button>
    </form>
  );
}
