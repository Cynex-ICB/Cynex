import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL, readApiJson } from "../utils/api.js";

const optionKeys = ["A", "B", "C", "D"];
const emptyQuestion = {
  questionText: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctOption: "A",
  explanation: "",
  concept: "",
  difficulty: "Medium",
  marks: "1",
  negativeMarks: "0.25",
};

const initialAssessmentForm = {
  title: "",
  description: "",
  concept: "Logical Reasoning",
  difficulty: "Medium",
  durationMinutes: "30",
  questionCount: "10",
  marks: "1",
  negativeMarks: "0.25",
  generationMode: "fast",
  passingMarks: "10",
  status: "draft",
  startTime: "",
  endTime: "",
  questions: [
    { ...emptyQuestion },
    { ...emptyQuestion },
    { ...emptyQuestion },
  ],
};

function authHeaders(token, extra = {}) {
  return {
    Authorization: `Bearer ${token}`,
    ...extra,
  };
}

function formatDateTime(value) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatSeconds(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatDuration(seconds) {
  if (!seconds) return "0m";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

function StatTile({ label, value }) {
  return (
    <div className="aptitude-stat card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function AptitudePlatform({ token, user }) {
  const isAdmin = ["admin", "master-admin"].includes(user?.role);

  return (
    <section className="section aptitude-page">
      <div className="section-heading aptitude-heading">
        <p className="eyebrow">VithAI Aptitude</p>
        <h2>Aptitude testing platform</h2>
        <span>
          {isAdmin
            ? "Create assessments, publish tests, and review student performance."
            : "Take department aptitude assessments and review your results."}
        </span>
      </div>

      {isAdmin ? <AdminAptitude token={token} /> : <StudentAptitude token={token} />}
    </section>
  );
}

export function AdminAptitude({ token }) {
  const [meta, setMeta] = useState({ concepts: [], difficulties: [], statuses: [] });
  const [dashboard, setDashboard] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [view, setView] = useState("dashboard");
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);
  const [form, setForm] = useState({
    title: "",
    concept: "All Concepts",
    difficulty: "Mixed",
    perConcept: "5",
    totalQuestions: "30",
    durationMinutes: "60",
    marks: "1",
    negativeMarks: "0.25",
    passingMarks: "20",
    startTime: "",
    endTime: "",
    status: "draft",
    generationMode: "fast",
  });
  const [sourceFile, setSourceFile] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [durationExtensions, setDurationExtensions] = useState({});
  const [attemptExtensions, setAttemptExtensions] = useState({});

  const headers = useMemo(() => authHeaders(token), [token]);
  const singleConceptCount = Math.max(1, (meta.concepts || []).filter((concept) => concept !== "All Concepts").length);
  const generatedQuestionCount =
    form.concept === "All Concepts"
      ? Number(form.perConcept || 0) * singleConceptCount
      : Number(form.totalQuestions || 0);

  useEffect(() => {
    loadAdminData();
  }, [token]);

  async function loadAdminData() {
    setIsLoading(true);
    setError("");
    try {
      const [metaData, dashboardData, assessmentData] = await Promise.all([
        readApiJson(await fetch(`${API_BASE_URL}/aptitude/meta`, { headers })),
        readApiJson(await fetch(`${API_BASE_URL}/aptitude/admin/dashboard`, { headers })),
        readApiJson(await fetch(`${API_BASE_URL}/aptitude/admin/assessments`, { headers })),
      ]);
      setMeta(metaData);
      setDashboard(dashboardData);
      setAssessments(assessmentData.assessments || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }

  function updateFormField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function stepQuestionCount(key, delta) {
    setForm((current) => ({
      ...current,
      [key]: String(Math.max(1, Number(current[key] || 1) + delta)),
    }));
  }

  async function createAssessment(event) {
    event.preventDefault();
    setStatus("");
    setError("");
    setIsCreating(true);

    try {
      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("concept", form.concept);
      formData.append("difficulty", form.difficulty);
      formData.append("question_count", String(generatedQuestionCount));
      formData.append("questionCount", String(generatedQuestionCount));
      formData.append("duration_minutes", String(Number(form.durationMinutes)));
      formData.append("durationMinutes", String(Number(form.durationMinutes)));
      formData.append("marks_per_question", String(Number(form.marks)));
      formData.append("marks", String(Number(form.marks)));
      formData.append("negative_marks", String(Number(form.negativeMarks)));
      formData.append("negativeMarks", String(Number(form.negativeMarks)));
      formData.append("passing_marks", String(Number(form.passingMarks)));
      formData.append("passingMarks", String(Number(form.passingMarks)));
      formData.append("status", form.status);
      formData.append("generation_mode", form.generationMode);
      formData.append("generationMode", form.generationMode);
      if (form.startTime) formData.append("start_time", form.startTime);
      if (form.endTime) formData.append("end_time", form.endTime);
      if (sourceFile) formData.append("file", sourceFile);

      const data = await readApiJson(
        await fetch(`${API_BASE_URL}/aptitude/admin/assessments/generate`, {
          method: "POST",
          headers: authHeaders(token),
          body: formData,
        })
      );

      setAssessments((current) => [data.assessment, ...current]);
      setSourceFile(null);
      setStatus("Questions generated and saved as an assessment.");
      await openQuestionReview(data.assessment.id);
      await loadAdminData();
    } catch (createError) {
      setError(createError.message);
    } finally {
      setIsCreating(false);
    }
  }

  async function openQuestionReview(assessmentId) {
    setStatus("");
    setError("");
    const data = await readApiJson(
      await fetch(`${API_BASE_URL}/aptitude/admin/assessments/${assessmentId}`, { headers })
    );
    setActiveAssessment(data.assessment);
    setQuestions(data.questions || []);
    setView("questions");
  }

  function updateQuestion(index, field, value) {
    setQuestions((current) =>
      current.map((question, questionIndex) =>
        questionIndex === index ? { ...question, [field]: value } : question
      )
    );
  }

  function addQuestion() {
    setQuestions((current) => [
      ...current,
      {
        question_text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_option: "A",
        explanation: "",
        shortcut: "",
        concept: activeAssessment?.concept || "",
        difficulty: activeAssessment?.difficulty || "Medium",
        marks: 1,
        negative_marks: 0.25,
      },
    ]);
  }

  async function saveQuestions(nextStatus = "") {
    if (!activeAssessment?.id) return;
    setIsCreating(true);
    setStatus("");
    setError("");

    try {
      const data = await readApiJson(
        await fetch(`${API_BASE_URL}/aptitude/admin/assessments/${activeAssessment.id}/questions`, {
          method: "PUT",
          headers: authHeaders(token, { "Content-Type": "application/json" }),
          body: JSON.stringify({ questions }),
        })
      );
      setActiveAssessment(data.assessment);
      setQuestions(data.questions || []);

      if (nextStatus) {
        await changeStatus(data.assessment, nextStatus);
      }

      setStatus(nextStatus === "published" ? "Saved and published." : "Questions saved.");
      await loadAdminData();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsCreating(false);
    }
  }

  async function changeStatus(assessment, nextStatus) {
    setStatus("");
    setError("");
    try {
      const data = await readApiJson(
        await fetch(`${API_BASE_URL}/aptitude/admin/assessments/${assessment.id}/status`, {
          method: "PATCH",
          headers: authHeaders(token, { "Content-Type": "application/json" }),
          body: JSON.stringify({ status: nextStatus }),
        })
      );
      setAssessments((current) =>
        current.map((item) => (item.id === assessment.id ? data.assessment : item))
      );
      setStatus(`Assessment moved to ${nextStatus}.`);
      loadAdminData();
    } catch (statusError) {
      setError(statusError.message);
    }
  }

  async function deleteAssessment(assessmentId) {
    setStatus("");
    setError("");
    try {
      await fetch(`${API_BASE_URL}/aptitude/admin/assessments/${assessmentId}`, {
        method: "DELETE",
        headers,
      });
      setAssessments((current) => current.filter((assessment) => assessment.id !== assessmentId));
      if (activeAssessment?.id === assessmentId) {
        setActiveAssessment(null);
        setResults([]);
      }
      setStatus("Assessment deleted.");
      loadAdminData();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  async function viewResults(assessment) {
    setActiveAssessment(assessment);
    setStatus("");
    setError("");
    try {
      const data = await readApiJson(
        await fetch(`${API_BASE_URL}/aptitude/admin/assessments/${assessment.id}/results`, {
          headers,
        })
      );
      setResults(data.results || []);
      setView("results");
    } catch (resultsError) {
      setError(resultsError.message);
    }
  }

  async function extendAssessmentDuration(assessmentId) {
    const minutes = Number(durationExtensions[assessmentId] || 5);
    setStatus("");
    setError("");
    try {
      await readApiJson(
        await fetch(`${API_BASE_URL}/aptitude/admin/assessments/${assessmentId}/extend-duration`, {
          method: "PATCH",
          headers: authHeaders(token, { "Content-Type": "application/json" }),
          body: JSON.stringify({ minutes }),
        })
      );
      setStatus(`Assessment duration extended by ${minutes} minutes.`);
      await loadAdminData();
    } catch (extendError) {
      setError(extendError.message);
    }
  }

  async function extendAttempt(attemptId) {
    const minutes = Number(attemptExtensions[attemptId] || 5);
    setStatus("");
    setError("");
    try {
      await readApiJson(
        await fetch(`${API_BASE_URL}/aptitude/admin/attempts/${attemptId}/extend`, {
          method: "PATCH",
          headers: authHeaders(token, { "Content-Type": "application/json" }),
          body: JSON.stringify({ minutes }),
        })
      );
      setStatus(`Added ${minutes} minutes.`);
      if (activeAssessment) await viewResults(activeAssessment);
    } catch (extendError) {
      setError(extendError.message);
    }
  }

  return (
    <div className="aptitude-layout vithai-admin-dashboard">
      <div className="vithai-admin-tabs">
        <button className={view === "dashboard" ? "active" : ""} type="button" onClick={() => setView("dashboard")}>
          Overview
        </button>
        <button className={view === "assessments" ? "active" : ""} type="button" onClick={() => setView("assessments")}>
          Assessments
        </button>
        <button className={view === "create" ? "active" : ""} type="button" onClick={() => setView("create")}>
          Create Assessment
        </button>
      </div>

      {status ? <p className="form-message success">{status}</p> : null}
      {error ? <p className="form-message error">{error}</p> : null}

      {view === "dashboard" ? (
      <>
      <div className="vithai-page-hero card">
        <div>
          <p className="eyebrow">Admin Overview</p>
          <h2>Assessment command center</h2>
          <p>Monitor publishing, submissions, pass rates, and student performance from one focused dashboard.</p>
        </div>
        <button className="primary-button" type="button" onClick={() => setView("create")}>
          Create Assessment
        </button>
      </div>

      <div className="aptitude-stats">
        <StatTile label="Assessments" value={dashboard?.assessments ?? "-"} />
        <StatTile label="Published" value={dashboard?.published ?? "-"} />
        <StatTile label="Students" value={dashboard?.students ?? "-"} />
        <StatTile label="Submissions" value={dashboard?.submitted_attempts ?? dashboard?.submittedAttempts ?? "-"} />
        <StatTile label="In Progress" value={dashboard?.in_progress_attempts ?? dashboard?.inProgressAttempts ?? "-"} />
        <StatTile label="Pass Rate" value={`${dashboard?.pass_rate ?? 0}%`} />
        <StatTile label="Average Score" value={`${dashboard?.average_percentage ?? 0}%`} />
      </div>

      <div className="card vithai-table-shell">
        <div className="aptitude-panel-heading">
          <div>
            <p className="eyebrow">Student Submission Analytics</p>
            <h3>Latest submitted attempts</h3>
          </div>
          <button type="button" onClick={() => setView("assessments")}>Manage assessments</button>
        </div>
        <div className="vithai-table-wrap">
          <table className="vithai-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Assessment</th>
                <th>Concept</th>
                <th>Difficulty</th>
                <th>Marks</th>
                <th>Percentage</th>
                <th>Time Taken</th>
                <th>Result</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {dashboard?.submissions?.length ? dashboard.submissions.map((submission) => (
                <tr key={submission.id}>
                  <td><strong>{submission.student_name}</strong><span>{submission.email}</span></td>
                  <td>{submission.assessment_title}</td>
                  <td>{submission.concept}</td>
                  <td>{submission.difficulty}</td>
                  <td>{submission.score}/{submission.total_marks}</td>
                  <td>{submission.percentage}%</td>
                  <td>{formatDuration(submission.time_taken_seconds)}</td>
                  <td>{submission.passed ? "Passed" : "Failed"}</td>
                  <td>{formatDateTime(submission.submitted_at)}</td>
                </tr>
              )) : (
                <tr><td colSpan="9">No submissions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      ) : null}

      {view === "create" ? (
      <form className="card admin-form aptitude-form" onSubmit={createAssessment}>
        <div>
          <p className="eyebrow">AI Builder</p>
          <h2>Create Assessment</h2>
          <span>Select the assessment shape, then let the backend AI agent build editable MCQs.</span>
        </div>

        <div className="aptitude-form-grid">
          <label>
            Assessment Title
            <input name="title" value={form.title} onChange={updateFormField} required />
          </label>
          <label>
            Concept
            <select name="concept" value={form.concept} onChange={updateFormField}>
              {meta.concepts.map((concept) => (
                <option key={concept} value={concept}>
                  {concept}
                </option>
              ))}
            </select>
          </label>
          <label>
            Difficulty
            <select name="difficulty" value={form.difficulty} onChange={updateFormField}>
              {meta.difficulties.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty}
                </option>
              ))}
            </select>
          </label>
          <label>
            Generation Mode
            <select name="generationMode" value={form.generationMode} onChange={updateFormField}>
              <option value="fast">Fast</option>
              <option value="ai">AI Enhanced</option>
            </select>
          </label>
        </div>

        <section className="vithai-count-box">
          <div>
            <strong>{form.concept === "All Concepts" ? "Questions Per Concept" : "Total Questions"}</strong>
            <span>Generated total: {generatedQuestionCount} questions</span>
          </div>
          <div>
            <button type="button" onClick={() => stepQuestionCount(form.concept === "All Concepts" ? "perConcept" : "totalQuestions", -1)}>-</button>
            <strong>{form.concept === "All Concepts" ? form.perConcept : form.totalQuestions}</strong>
            <button type="button" onClick={() => stepQuestionCount(form.concept === "All Concepts" ? "perConcept" : "totalQuestions", 1)}>+</button>
          </div>
        </section>

        <div className="aptitude-form-grid">
          <label>
            Duration in minutes
            <input name="durationMinutes" type="number" min="1" value={form.durationMinutes} onChange={updateFormField} required />
          </label>
          <label>
            Marks per question
            <input name="marks" type="number" min="0" step="0.25" value={form.marks} onChange={updateFormField} required />
          </label>
          <label>
            Negative marks
            <input name="negativeMarks" type="number" min="0" step="0.25" value={form.negativeMarks} onChange={updateFormField} required />
          </label>
          <label>
            Passing marks
            <input
              name="passingMarks"
              type="number"
              min="0"
              step="0.5"
              value={form.passingMarks}
              onChange={updateFormField}
              required
            />
          </label>
          <label>
            Start time
            <input
              name="startTime"
              type="datetime-local"
              value={form.startTime}
              onChange={updateFormField}
            />
          </label>
          <label>
            End time
            <input
              name="endTime"
              type="datetime-local"
              value={form.endTime}
              onChange={updateFormField}
            />
          </label>
        </div>

          <label>
          Optional source file
            <input
              type="file"
              accept=".pdf,.docx,.txt,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(event) => setSourceFile(event.target.files?.[0] || null)}
            />
            <span className="admin-file-hint">
              {sourceFile
                ? sourceFile.name
                : "Optional PDF, DOCX, or TXT context for VithAI question generation."}
            </span>
          </label>

        <button className="primary-button admin-submit" type="submit" disabled={isCreating}>
          {isCreating ? "Generating questions..." : "Generate Questions"}
        </button>
      </form>
      ) : null}

      {view === "assessments" ? (
      <div className="aptitude-panel-grid">
        <div className="card aptitude-list-panel">
          <div className="aptitude-panel-heading">
            <div>
              <p className="eyebrow">Assessments</p>
              <h3>Published and draft tests</h3>
            </div>
            {isLoading ? <span>Loading...</span> : null}
          </div>

          <div className="aptitude-card-list">
            {assessments.length ? (
              assessments.map((assessment) => (
                <article className="aptitude-mini-card" key={assessment.id}>
                  <div>
                    <h4>{assessment.title}</h4>
                    <p>
                      {assessment.concept} - {assessment.difficulty} - {assessment.totalQuestions} questions
                    </p>
                  </div>
                  <div className="aptitude-mini-meta">
                    <span className={`aptitude-pill ${assessment.status}`}>
                      {assessment.status}
                    </span>
                    <span>{assessment.durationMinutes} min</span>
                    <span>{assessment.totalMarks} marks</span>
                  </div>
                  <div className="aptitude-actions">
                    <button type="button" onClick={() => viewResults(assessment)}>
                      Results
                    </button>
                    <button type="button" onClick={() => openQuestionReview(assessment.id)}>Edit Questions</button>
                    <button type="button" onClick={() => changeStatus(assessment, assessment.status === "published" ? "draft" : "published")}>
                      {assessment.status === "published" ? "Unpublish" : "Publish"}
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={durationExtensions[assessment.id] ?? 5}
                      onChange={(event) => setDurationExtensions((current) => ({ ...current, [assessment.id]: event.target.value }))}
                    />
                    <button type="button" onClick={() => extendAssessmentDuration(assessment.id)}>Add min</button>
                    <button type="button" className="danger" onClick={() => deleteAssessment(assessment.id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-state">
                <h3>No assessments yet</h3>
                <p>Create the first VithAI aptitude test for students.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      ) : null}

      {view === "questions" && activeAssessment ? (
        <div className="card aptitude-list-panel">
          <div className="aptitude-panel-heading">
            <div>
              <p className="eyebrow">Question Review</p>
              <h3>{activeAssessment.title}</h3>
              <span>{questions.length} questions - {activeAssessment.status}</span>
            </div>
            <div className="aptitude-actions">
              <button type="button" onClick={() => saveQuestions()} disabled={isCreating}>Save edits</button>
              <button type="button" onClick={() => saveQuestions("published")} disabled={isCreating}>Publish assessment</button>
            </div>
          </div>
          <div className="aptitude-question-builder">
            {questions.map((question, index) => (
              <div className="aptitude-question-card" key={question.id || index}>
                <div className="aptitude-question-top">
                  <strong>Question {index + 1}</strong>
                  <button type="button" onClick={() => setQuestions((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Remove</button>
                </div>
                <label>Question text<textarea value={question.question_text || ""} onChange={(event) => updateQuestion(index, "question_text", event.target.value)} rows="3" /></label>
                <div className="aptitude-options-grid">
                  {["a", "b", "c", "d"].map((key) => (
                    <label key={key}>Option {key.toUpperCase()}<input value={question[`option_${key}`] || ""} onChange={(event) => updateQuestion(index, `option_${key}`, event.target.value)} /></label>
                  ))}
                </div>
                <div className="aptitude-options-grid">
                  <label>Correct option<select value={question.correct_option || "A"} onChange={(event) => updateQuestion(index, "correct_option", event.target.value)}>{optionKeys.map((key) => <option key={key}>{key}</option>)}</select></label>
                  <label>Concept<input value={question.concept || ""} onChange={(event) => updateQuestion(index, "concept", event.target.value)} /></label>
                  <label>Difficulty<select value={question.difficulty || "Medium"} onChange={(event) => updateQuestion(index, "difficulty", event.target.value)}>{["Easy", "Medium", "Hard", "Mixed"].map((difficulty) => <option key={difficulty}>{difficulty}</option>)}</select></label>
                  <label>Marks<input type="number" step="0.25" value={question.marks ?? 1} onChange={(event) => updateQuestion(index, "marks", event.target.value)} /></label>
                  <label>Negative marks<input type="number" step="0.25" value={question.negative_marks ?? 0.25} onChange={(event) => updateQuestion(index, "negative_marks", event.target.value)} /></label>
                </div>
                <label>Explanation<textarea value={question.explanation || ""} onChange={(event) => updateQuestion(index, "explanation", event.target.value)} rows="2" /></label>
                <label>Shortcut<textarea value={question.shortcut || ""} onChange={(event) => updateQuestion(index, "shortcut", event.target.value)} rows="2" /></label>
              </div>
            ))}
            <button className="secondary-button" type="button" onClick={addQuestion}>Add question</button>
          </div>
        </div>
      ) : null}

      {view === "results" ? (
        <div className="card vithai-table-shell">
          <div className="aptitude-panel-heading">
            <div>
              <p className="eyebrow">Attempt Monitor</p>
              <h3>Assessment Results</h3>
              <span>{activeAssessment?.title}</span>
            </div>
          </div>
          <div className="vithai-table-wrap">
            <table className="vithai-table">
              <thead><tr><th>Student Name</th><th>Email</th><th>Status</th><th>Score</th><th>Percentage</th><th>Result</th><th>Extra Time</th><th>Started At</th><th>Submitted At</th><th>Extend</th></tr></thead>
              <tbody>
                {results.length ? results.map((result) => (
                  <tr key={result.id}>
                    <td>{result.student_name || result.studentName}</td>
                    <td>{result.email || result.collegeEmail}</td>
                    <td>{result.status === "in_progress" ? "In progress" : "Submitted"}</td>
                    <td>{result.status === "submitted" ? result.score : "-"}</td>
                    <td>{result.status === "submitted" ? `${result.percentage}%` : "-"}</td>
                    <td>{result.status !== "submitted" ? "Pending" : result.passed ? "Passed" : "Failed"}</td>
                    <td>{result.extra_time_minutes || 0}m</td>
                    <td>{formatDateTime(result.started_at || result.startedAt)}</td>
                    <td>{formatDateTime(result.submitted_at || result.submittedAt)}</td>
                    <td>{result.status === "in_progress" ? <><input type="number" min="1" max="180" value={attemptExtensions[result.id] ?? 5} onChange={(event) => setAttemptExtensions((current) => ({ ...current, [result.id]: event.target.value }))} /><button type="button" onClick={() => extendAttempt(result.id)}>Add min</button></> : "Closed"}</td>
                  </tr>
                )) : <tr><td colSpan="10">No attempts yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StudentAptitude({ token }) {
  const [dashboard, setDashboard] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [results, setResults] = useState([]);
  const [activeTest, setActiveTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [resultDetail, setResultDetail] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const headers = useMemo(() => authHeaders(token), [token]);

  useEffect(() => {
    loadStudentData();
  }, [token]);

  useEffect(() => {
    if (!activeTest?.attempt?.startedAt) return undefined;

    const calculateRemaining = () => {
      const startedAt = new Date(activeTest.attempt.startedAt).getTime();
      const durationMs =
        (activeTest.assessment.durationMinutes + (activeTest.attempt.extraTimeMinutes || 0)) *
        60 *
        1000;
      return Math.max(0, Math.ceil((startedAt + durationMs - Date.now()) / 1000));
    };

    setRemainingSeconds(calculateRemaining());
    const intervalId = window.setInterval(() => {
      const nextRemaining = calculateRemaining();
      setRemainingSeconds(nextRemaining);
      if (nextRemaining <= 0 && !isSubmitting) {
        window.clearInterval(intervalId);
        submitAssessment();
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [activeTest?.attempt?.id, isSubmitting]);

  async function loadStudentData() {
    setError("");
    try {
      const [dashboardData, assessmentData, resultsData] = await Promise.all([
        readApiJson(await fetch(`${API_BASE_URL}/aptitude/student/dashboard`, { headers })),
        readApiJson(await fetch(`${API_BASE_URL}/aptitude/student/assessments`, { headers })),
        readApiJson(await fetch(`${API_BASE_URL}/aptitude/student/results`, { headers })),
      ]);
      setDashboard(dashboardData);
      setAssessments(assessmentData.assessments || []);
      setResults(resultsData.results || []);
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  async function startAssessment(assessmentId) {
    setStatus("");
    setError("");
    setResultDetail(null);
    try {
      const data = await readApiJson(
        await fetch(`${API_BASE_URL}/aptitude/student/assessments/${assessmentId}/start`, {
          method: "POST",
          headers,
        })
      );
      setActiveTest(data);
      setAnswers(data.selectedAnswers || {});
    } catch (startError) {
      setError(startError.message);
    }
  }

  async function selectAnswer(questionId, selectedOption) {
    setAnswers((current) => ({ ...current, [questionId]: selectedOption }));
    if (!activeTest?.attempt?.id) return;

    try {
      await readApiJson(
        await fetch(`${API_BASE_URL}/aptitude/student/attempts/${activeTest.attempt.id}/answers`, {
          method: "PUT",
          headers: authHeaders(token, { "Content-Type": "application/json" }),
          body: JSON.stringify({ questionId, selectedOption }),
        })
      );
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  async function submitAssessment() {
    if (!activeTest?.attempt?.id) return;
    setIsSubmitting(true);
    setStatus("");
    setError("");

    try {
      await readApiJson(
        await fetch(`${API_BASE_URL}/aptitude/student/attempts/${activeTest.attempt.id}/submit`, {
          method: "POST",
          headers,
        })
      );
      setStatus("Assessment submitted.");
      setActiveTest(null);
      await loadStudentData();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function openResult(attemptId) {
    setError("");
    try {
      const data = await readApiJson(
        await fetch(`${API_BASE_URL}/aptitude/student/results/${attemptId}`, { headers })
      );
      setResultDetail(data);
      setActiveTest(null);
    } catch (resultError) {
      setError(resultError.message);
    }
  }

  if (activeTest) {
    const answeredCount = Object.values(answers).filter(Boolean).length;
    return (
      <div className="aptitude-layout">
        <div className="card aptitude-test-shell">
          <div className="aptitude-test-heading">
            <div>
              <p className="eyebrow">Live Assessment</p>
              <h3>{activeTest.assessment.title}</h3>
              <span>
                {answeredCount} of {activeTest.questions.length} answered - Ends after{" "}
                {activeTest.assessment.durationMinutes} minutes
              </span>
            </div>
            <div className="aptitude-timer" aria-label="Time remaining">
              {formatSeconds(remainingSeconds)}
            </div>
            <button className="secondary-button" type="button" onClick={() => setActiveTest(null)}>
              Back
            </button>
          </div>

          <div className="aptitude-question-list">
            {activeTest.questions.map((question, index) => (
              <article className="aptitude-student-question" key={question.id}>
                <h4>
                  {index + 1}. {question.questionText}
                </h4>
                <div className="aptitude-choice-list">
                  {Object.entries(question.options).map(([key, value]) => (
                    <button
                      key={key}
                      type="button"
                      className={answers[question.id] === key ? "selected" : ""}
                      onClick={() => selectAnswer(question.id, key)}
                    >
                      <strong>{key}</strong>
                      <span>{value}</span>
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>

          {error ? <p className="form-message error">{error}</p> : null}
          <button className="primary-button admin-submit" type="button" onClick={submitAssessment} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Assessment"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="aptitude-layout">
      <div className="aptitude-stats">
        <StatTile label="Available tests" value={dashboard?.availableAssessments ?? "-"} />
        <StatTile label="Submitted tests" value={dashboard?.submittedAttempts ?? "-"} />
      </div>

      {status ? <p className="form-message success">{status}</p> : null}
      {error ? <p className="form-message error">{error}</p> : null}

      <div className="aptitude-panel-grid">
        <div className="card aptitude-list-panel">
          <div className="aptitude-panel-heading">
            <div>
              <p className="eyebrow">Assessments</p>
              <h3>Available aptitude tests</h3>
            </div>
          </div>

          <div className="aptitude-card-list">
            {assessments.length ? (
              assessments.map((assessment) => (
                <article className="aptitude-mini-card" key={assessment.id}>
                  <div>
                    <h4>{assessment.title}</h4>
                    <p>{assessment.description || `${assessment.concept} practice assessment`}</p>
                  </div>
                  <div className="aptitude-mini-meta">
                    <span>{assessment.difficulty}</span>
                    <span>{assessment.durationMinutes} min</span>
                    <span>{assessment.totalMarks} marks</span>
                    <span>{formatDateTime(assessment.endTime)}</span>
                  </div>
                  <div className="aptitude-actions">
                    <button type="button" onClick={() => startAssessment(assessment.id)}>
                      Start Test
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-state">
                <h3>No tests available</h3>
                <p>Published aptitude assessments will appear here.</p>
              </div>
            )}
          </div>
        </div>

        <div className="card aptitude-list-panel">
          <div className="aptitude-panel-heading">
            <div>
              <p className="eyebrow">Results</p>
              <h3>Your aptitude history</h3>
            </div>
          </div>

          <div className="aptitude-card-list">
            {results.length ? (
              results.map((result) => (
                <article className="aptitude-mini-card" key={result.id}>
                  <div>
                    <h4>{result.assessmentTitle}</h4>
                    <p>{result.concept} - {result.difficulty}</p>
                  </div>
                  <div className="aptitude-mini-meta">
                    <span>{result.score} marks</span>
                    <span>{result.percentage}%</span>
                    <span className={`aptitude-pill ${result.passed ? "published" : "draft"}`}>
                      {result.passed ? "Passed" : "Needs practice"}
                    </span>
                  </div>
                  <div className="aptitude-actions">
                    <button type="button" onClick={() => openResult(result.id)}>
                      Review
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-state">
                <h3>No results yet</h3>
                <p>Submitted aptitude tests will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {resultDetail ? (
        <div className="card aptitude-result-detail">
          <div className="aptitude-test-heading">
            <div>
              <p className="eyebrow">Review</p>
              <h3>{resultDetail.assessment.title}</h3>
              <span>
                Score {resultDetail.attempt.score} / {resultDetail.assessment.totalMarks}
              </span>
            </div>
            <button className="secondary-button" type="button" onClick={() => setResultDetail(null)}>
              Close
            </button>
          </div>

          <div className="aptitude-question-list">
            {resultDetail.answers.map((answer, index) => (
              <article className="aptitude-student-question" key={answer.id}>
                <h4>
                  {index + 1}. {answer.questionText}
                </h4>
                <p>
                  Selected: {answer.selectedOption || "Not answered"} - Correct: {answer.correctOption}
                </p>
                <p>{answer.explanation}</p>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default AptitudePlatform;
