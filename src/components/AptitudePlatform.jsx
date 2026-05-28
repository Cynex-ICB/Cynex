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
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [results, setResults] = useState([]);
  const [form, setForm] = useState(initialAssessmentForm);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const headers = useMemo(() => authHeaders(token), [token]);

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

  function updateQuestion(index, field, value) {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((question, questionIndex) =>
        questionIndex === index ? { ...question, [field]: value } : question
      ),
    }));
  }

  function addQuestion() {
    setForm((current) => ({
      ...current,
      questions: [...current.questions, { ...emptyQuestion, concept: current.concept }],
    }));
  }

  function removeQuestion(index) {
    setForm((current) => ({
      ...current,
      questions: current.questions.filter((_, questionIndex) => questionIndex !== index),
    }));
  }

  async function createAssessment(event) {
    event.preventDefault();
    setStatus("");
    setError("");
    setIsCreating(true);

    try {
      const payload = {
        ...form,
        durationMinutes: Number(form.durationMinutes),
        passingMarks: Number(form.passingMarks),
        startTime: form.startTime ? new Date(form.startTime).toISOString() : null,
        endTime: form.endTime ? new Date(form.endTime).toISOString() : null,
        questions: form.questions.map((question) => ({
          ...question,
          concept: question.concept || form.concept,
          marks: Number(question.marks),
          negativeMarks: Number(question.negativeMarks),
        })),
      };

      const data = await readApiJson(
        await fetch(`${API_BASE_URL}/aptitude/admin/assessments`, {
          method: "POST",
          headers: authHeaders(token, { "Content-Type": "application/json" }),
          body: JSON.stringify(payload),
        })
      );

      setAssessments((current) => [data.assessment, ...current]);
      setForm(initialAssessmentForm);
      setStatus("Aptitude assessment created.");
      loadAdminData();
    } catch (createError) {
      setError(createError.message);
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
      if (selectedAssessment?.id === assessmentId) {
        setSelectedAssessment(null);
        setResults([]);
      }
      setStatus("Assessment deleted.");
      loadAdminData();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  async function viewResults(assessment) {
    setSelectedAssessment(assessment);
    setStatus("");
    setError("");
    try {
      const data = await readApiJson(
        await fetch(`${API_BASE_URL}/aptitude/admin/assessments/${assessment.id}/results`, {
          headers,
        })
      );
      setResults(data.results || []);
    } catch (resultsError) {
      setError(resultsError.message);
    }
  }

  return (
    <div className="aptitude-layout">
      <div className="aptitude-stats">
        <StatTile label="Assessments" value={dashboard?.assessments ?? "-"} />
        <StatTile label="Published" value={dashboard?.published ?? "-"} />
        <StatTile label="Students" value={dashboard?.students ?? "-"} />
        <StatTile label="Submissions" value={dashboard?.submittedAttempts ?? "-"} />
      </div>

      <form className="card admin-form aptitude-form" onSubmit={createAssessment}>
        <div>
          <p className="eyebrow">Admin Console</p>
          <h2>Create aptitude assessment</h2>
        </div>

        <div className="aptitude-form-grid">
          <label>
            Title
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
            Duration (minutes)
            <input
              name="durationMinutes"
              type="number"
              min="1"
              value={form.durationMinutes}
              onChange={updateFormField}
              required
            />
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
            Status
            <select name="status" value={form.status} onChange={updateFormField}>
              {meta.statuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
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
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={updateFormField}
            rows="3"
            placeholder="Optional instructions for students."
          />
        </label>

        <div className="aptitude-question-builder">
          <div className="aptitude-builder-heading">
            <h3>Questions</h3>
            <button className="secondary-button" type="button" onClick={addQuestion}>
              Add Question
            </button>
          </div>

          {form.questions.map((question, index) => (
            <div className="aptitude-question-card" key={`question-${index + 1}`}>
              <div className="aptitude-question-top">
                <strong>Question {index + 1}</strong>
                {form.questions.length > 1 ? (
                  <button type="button" onClick={() => removeQuestion(index)}>
                    Remove
                  </button>
                ) : null}
              </div>
              <label>
                Question text
                <textarea
                  value={question.questionText}
                  onChange={(event) => updateQuestion(index, "questionText", event.target.value)}
                  rows="3"
                  required
                />
              </label>
              <div className="aptitude-options-grid">
                {optionKeys.map((key) => (
                  <label key={key}>
                    Option {key}
                    <input
                      value={question[`option${key}`]}
                      onChange={(event) => updateQuestion(index, `option${key}`, event.target.value)}
                      required
                    />
                  </label>
                ))}
              </div>
              <div className="aptitude-options-grid">
                <label>
                  Correct option
                  <select
                    value={question.correctOption}
                    onChange={(event) => updateQuestion(index, "correctOption", event.target.value)}
                  >
                    {optionKeys.map((key) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Marks
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={question.marks}
                    onChange={(event) => updateQuestion(index, "marks", event.target.value)}
                    required
                  />
                </label>
                <label>
                  Negative marks
                  <input
                    type="number"
                    min="0"
                    step="0.25"
                    value={question.negativeMarks}
                    onChange={(event) => updateQuestion(index, "negativeMarks", event.target.value)}
                    required
                  />
                </label>
              </div>
              <label>
                Explanation
                <textarea
                  value={question.explanation}
                  onChange={(event) => updateQuestion(index, "explanation", event.target.value)}
                  rows="2"
                  required
                />
              </label>
            </div>
          ))}
        </div>

        {status ? <p className="form-message success">{status}</p> : null}
        {error ? <p className="form-message error">{error}</p> : null}

        <button className="primary-button admin-submit" type="submit" disabled={isCreating}>
          {isCreating ? "Creating..." : "Create Assessment"}
        </button>
      </form>

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
                    <button
                      type="button"
                      onClick={() =>
                        changeStatus(
                          assessment,
                          assessment.status === "published" ? "draft" : "published"
                        )
                      }
                    >
                      {assessment.status === "published" ? "Unpublish" : "Publish"}
                    </button>
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

        <div className="card aptitude-list-panel">
          <div className="aptitude-panel-heading">
            <div>
              <p className="eyebrow">Results</p>
              <h3>{selectedAssessment ? selectedAssessment.title : "Select an assessment"}</h3>
            </div>
          </div>

          <div className="aptitude-result-list">
            {results.length ? (
              results.map((result) => (
                <article className="aptitude-result-row" key={result.id}>
                  <div>
                    <strong>{result.studentName}</strong>
                    <span>{result.collegeEmail || result.usn || "Student"}</span>
                  </div>
                  <div>
                    <strong>{result.score}</strong>
                    <span>{result.percentage}%</span>
                  </div>
                  <span className={`aptitude-pill ${result.passed ? "published" : "draft"}`}>
                    {result.passed ? "Passed" : result.status}
                  </span>
                </article>
              ))
            ) : (
              <div className="empty-state">
                <h3>No results selected</h3>
                <p>Open an assessment result list to view student scores.</p>
              </div>
            )}
          </div>
        </div>
      </div>
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
