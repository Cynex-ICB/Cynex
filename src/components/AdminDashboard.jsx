import { useEffect, useRef, useState } from "react";
import { Link, Navigate, NavLink, Route, Routes } from "react-router-dom";
import { API_BASE_URL, downloadApiFile, readApiJson } from "../utils/api.js";
import { ToastProvider } from "../vithai/context/ToastContext.jsx";
import AptCreateAssessment from "../vithai/pages/admin/CreateAssessment.jsx";
import AptAdminAssessments from "../vithai/pages/admin/AdminAssessments.jsx";
import AptQuestionReview from "../vithai/pages/admin/QuestionReview.jsx";
import AptAssessmentResults from "../vithai/pages/admin/AssessmentResults.jsx";

const initialMaterialForm = {
  title: "",
  category: "note",
  description: "",
  link: "",
  dueDate: "",
  subject: "",
  semester: "3",
};

const initialSubjectForm = {
  code: "",
  name: "",
  semester: "3",
  credits: "3",
  instructor: "",
  description: "",
};

const initialContentForm = {
  type: "achievement",
  title: "",
  description: "",
  name: "",
  roleTitle: "",
  ctcLpa: "",
  link: "",
};

const initialStudentProfileForm = {
  studentId: "",
  semester: "3",
  classCoordinatorName: "",
  mentorName: "",
};

const initialCieForm = {
  semester: "3",
  subject: "",
  cieNumber: "1",
  maxMarks: "50",
};

const initialCoordinatorForm = {
  teacherUserId: "",
  teacherId: "",
  semester: "3",
};

const initialMentorForm = {
  teacherUserId: "",
  teacherId: "",
  startUsn: "",
  endUsn: "",
};

const initialTeacherAdminForm = {
  name: "",
  collegeEmail: "",
  teacherId: "",
  role: "admin",
  password: "",
};

const initialStudentAccountForm = {
  name: "",
  collegeEmail: "",
  usn: "",
  semester: "3",
  password: "",
};

const initialStudentBulkForm = {
  semester: "3",
};

const categoryLabels = {
  assignment: "Assignment",
  note: "Note",
  "study-material": "Study Material",
  notification: "Notification",
};

const contentTypeLabels = {
  achievement: "Achievement",
  placement: "Placement",
  internship: "Internship",
  "activity-alert": "Activity Alert",
};

const semesterOptions = Array.from({ length: 6 }, (_, index) => String(index + 3));
const masterCieSemesterOptions = semesterOptions;

function getAuthHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

function formatSemesterList(semesters = []) {
  const uniqueSemesters = Array.from(new Set(semesters))
    .map(Number)
    .filter(Boolean)
    .sort((first, second) => first - second);

  return uniqueSemesters.length
    ? uniqueSemesters.map((semester) => `Semester ${semester}`).join(", ")
    : "Not assigned";
}

async function readJson(response) {
  return readApiJson(response);
}

function AdminDashboard({ user, token, onLogout }) {
  const [isAdminSidebarOpen, setIsAdminSidebarOpen] = useState(false);
  const closeAdminSidebar = () => setIsAdminSidebarOpen(false);
  const isMasterAdmin = user?.role === "master-admin";
  const dashboardTitle = isMasterAdmin ? "Master Admin Panel" : "Admin Panel";
  const dashboardEyebrow = isMasterAdmin ? "HOD Dashboard" : "Teacher Dashboard";
  const defaultRoute = isMasterAdmin ? "subjects" : "academic";

  return (
    <main className="admin-page">
      <button
        className={`admin-sidebar-toggle ${isAdminSidebarOpen ? "is-open" : ""}`}
        type="button"
        aria-label={isAdminSidebarOpen ? "Close admin sidebar" : "Open admin sidebar"}
        aria-controls="admin-sidebar"
        aria-expanded={isAdminSidebarOpen}
        onClick={() => setIsAdminSidebarOpen((current) => !current)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <button
        className={`admin-sidebar-backdrop ${isAdminSidebarOpen ? "show" : ""}`}
        type="button"
        aria-label="Close admin sidebar"
        aria-hidden={!isAdminSidebarOpen}
        tabIndex={isAdminSidebarOpen ? 0 : -1}
        onClick={closeAdminSidebar}
      />

      <div className="admin-shell">
        <aside
          className={`admin-sidebar ${isAdminSidebarOpen ? "show" : ""}`}
          id="admin-sidebar"
        >
          <div className="admin-sidebar-brand">
            <p className="eyebrow">{dashboardEyebrow}</p>
            <h2>{dashboardTitle}</h2>
            <span>{user?.name}</span>
          </div>

          <nav className="admin-dashboard-nav" aria-label="Admin dashboard">
            {isMasterAdmin ? (
              <>
                <NavLink to="/admin/subjects" onClick={closeAdminSidebar}>
                  Subject Declaration
                </NavLink>
                <NavLink to="/admin/admins" onClick={closeAdminSidebar}>
                  Teacher Admins
                </NavLink>
                <NavLink to="/admin/student-accounts" onClick={closeAdminSidebar}>
                  Student Accounts
                </NavLink>
                <NavLink to="/admin/coordinators" onClick={closeAdminSidebar}>
                  Class Coordinators
                </NavLink>
                <NavLink to="/admin/mentors" onClick={closeAdminSidebar}>
                  Mentor Assignment
                </NavLink>
                <NavLink to="/admin/cie-overview" onClick={closeAdminSidebar}>
                  CIE Marks Overview
                </NavLink>
                <NavLink to="/admin/aptitude/assessments/create" onClick={closeAdminSidebar}>
                  Create Assessment
                </NavLink>
                <NavLink to="/admin/aptitude/assessments" onClick={closeAdminSidebar}>
                  Assessment Library
                </NavLink>
                <NavLink to="/admin/assessment-analytics" onClick={closeAdminSidebar}>
                  Assessment Analytics
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/admin/academic" onClick={closeAdminSidebar}>
                  Academic Content
                </NavLink>
                <NavLink to="/admin/activity-alerts" onClick={closeAdminSidebar}>
                  Activity Alerts
                </NavLink>
                <NavLink to="/admin/showcase" onClick={closeAdminSidebar}>
                  Showcase Pages
                </NavLink>
                <NavLink to="/admin/cie-marks" onClick={closeAdminSidebar}>
                  CIE Marks
                </NavLink>
                <NavLink to="/admin/cie-overview" onClick={closeAdminSidebar}>
                  CIE Marks Overview
                </NavLink>
                <NavLink to="/admin/aptitude/assessments/create" onClick={closeAdminSidebar}>
                  Create Assessment
                </NavLink>
                <NavLink to="/admin/aptitude/assessments" onClick={closeAdminSidebar}>
                  Assessment Library
                </NavLink>
                <NavLink to="/admin/assessment-analytics" onClick={closeAdminSidebar}>
                  Assessment Analytics
                </NavLink>
              </>
            )}
          </nav>

          <div className="admin-sidebar-actions">
          <Link className="nav-logout admin-back-link" to="/" onClick={closeAdminSidebar}>
            Back to Website
          </Link>
          <button
            className="nav-logout admin-logout"
            type="button"
            onClick={() => {
              closeAdminSidebar();
              onLogout?.();
            }}
          >
            Logout
          </button>
          </div>
        </aside>

        <div className="admin-content">
          <header className="admin-header">
            <div>
              <p className="eyebrow">{dashboardEyebrow}</p>
              <h1>{dashboardTitle}</h1>
              <span>
                {user?.name} - {user?.collegeEmail || user?.email}
              </span>
            </div>
          </header>

          <Routes>
            <Route index element={<Navigate to={defaultRoute} replace />} />
            {isMasterAdmin ? (
              <>
                <Route path="subjects" element={<SubjectsPage token={token} />} />
                <Route path="admins" element={<TeacherAdminsPage token={token} />} />
                <Route path="student-accounts" element={<StudentAccountsPage token={token} />} />
                <Route path="coordinators" element={<CoordinatorAssignmentsPage token={token} />} />
                <Route path="mentors" element={<MentorAssignmentsPage token={token} />} />
                <Route path="cie-overview" element={<MasterCieOverviewPage token={token} />} />
                <Route path="assessment-analytics" element={<AssessmentAnalyticsPage token={token} />} />
              </>
            ) : (
              <>
                <Route path="academic" element={<AcademicContentPage token={token} />} />
                <Route path="activity-alerts" element={<ActivityAlertsPage token={token} />} />
                <Route path="showcase" element={<ShowcaseContentPage token={token} />} />
                <Route path="cie-marks" element={<CieMarksPage token={token} />} />
                <Route path="cie-overview" element={<MasterCieOverviewPage token={token} />} />
                <Route path="assessment-analytics" element={<AssessmentAnalyticsPage token={token} />} />
              </>
            )}
            <Route path="aptitude/assessments" element={<ToastProvider><AptAdminAssessments /></ToastProvider>} />
            <Route path="aptitude/assessments/create" element={<ToastProvider><AptCreateAssessment /></ToastProvider>} />
            <Route path="aptitude/assessments/:id/questions" element={<ToastProvider><AptQuestionReview /></ToastProvider>} />
            <Route path="aptitude/assessments/:id/results" element={<ToastProvider><AptAssessmentResults /></ToastProvider>} />
            <Route path="*" element={<Navigate to={defaultRoute} replace />} />
          </Routes>
        </div>
      </div>
    </main>
  );
}

function AcademicContentPage({ token }) {
  const [form, setForm] = useState(initialMaterialForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const authHeaders = getAuthHeaders(token);

  useEffect(() => {
    loadMaterials();
    loadSubjects();
  }, [token]);

  const loadMaterials = async () => {
    try {
      const data = await readJson(
        await fetch(`${API_BASE_URL}/materials`, {
          headers: authHeaders,
        })
      );
      setMaterials(data.materials || []);
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  const loadSubjects = async () => {
    try {
      const data = await readJson(
        await fetch(`${API_BASE_URL}/subjects`, {
          headers: authHeaders,
        })
      );
      setSubjects(data.subjects || []);
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
      ...(name === "category" && value !== "assignment" ? { dueDate: "" } : {}),
    }));
  };

  const handleMaterialSubmit = async (event) => {
    event.preventDefault();
    setStatus("");
    setError("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "dueDate" && form.category !== "assignment") return;
        if (value) formData.append(key, value);
      });

      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const data = await readJson(
        await fetch(`${API_BASE_URL}/materials`, {
          method: "POST",
          headers: authHeaders,
          body: formData,
        })
      );

      setMaterials((currentMaterials) => [data.material, ...currentMaterials]);
      setForm(initialMaterialForm);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (data.notification?.queued) {
        setStatus("Academic post published. Student email notification is being sent in the background.");
      } else if (data.notification?.error) {
        setStatus("Academic post published, but email notification failed.");
      } else if (data.notification?.previewOnly && data.notification?.notified) {
        setStatus(`Academic post published. Email preview generated for ${data.notification.notified} students.`);
      } else if (data.notification?.notified) {
        setStatus(`Academic post published. Email sent to ${data.notification.notified} students.`);
      } else {
        setStatus("Academic post published. No students were found for that semester.");
      }
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMaterial = async (materialId) => {
    setStatus("");
    setError("");

    try {
      await readJson(
        await fetch(`${API_BASE_URL}/materials/${materialId}`, {
          method: "DELETE",
          headers: authHeaders,
        })
      );
      setMaterials((currentMaterials) =>
        currentMaterials.filter((material) => material._id !== materialId)
      );
      setStatus("Academic post deleted.");
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  return (
    <section className="admin-grid admin-route-panel">
      <form className="card admin-form" onSubmit={handleMaterialSubmit}>
        <div>
          <p className="eyebrow">Academic Content</p>
          <h2>Post assignments, notes, and materials</h2>
        </div>

        <label>
          Title
          <input
            name="title"
            type="text"
            value={form.title}
            onChange={updateField}
            placeholder="Module 1 assignment"
            required
          />
        </label>

        <label>
          Type
          <select name="category" value={form.category} onChange={updateField}>
            <option value="assignment">Assignment</option>
            <option value="note">Note</option>
            <option value="study-material">Study Material</option>
            <option value="notification">Notification</option>
          </select>
        </label>

        <label>
          Subject
          <select name="subject" value={form.subject} onChange={updateField}>
            <option value="">General post</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.code} - {subject.name} (Sem {subject.semester})
              </option>
            ))}
          </select>
        </label>

        <label>
          Semester
          <select name="semester" value={form.semester} onChange={updateField}>
            {semesterOptions.map((semester) => (
              <option key={semester} value={semester}>
                Semester {semester}
              </option>
            ))}
          </select>
        </label>

        <label>
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={updateField}
            placeholder="Instructions, context, or reading details."
            rows="5"
            required
          />
        </label>

        <label>
          Resource link
          <input
            name="link"
            type="url"
            value={form.link}
            onChange={updateField}
            placeholder="https://..."
          />
        </label>

        <label>
          Upload file
          <input
            ref={fileInputRef}
            name="file"
            type="file"
            accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
          />
          <span className="admin-file-hint">
            {selectedFile ? selectedFile.name : "PDF, PPT, or PPTX up to 25 MB."}
          </span>
        </label>

        {form.category === "assignment" ? (
          <label>
            Due date
            <input name="dueDate" type="date" value={form.dueDate} onChange={updateField} />
          </label>
        ) : null}

        {status ? <p className="form-message success">{status}</p> : null}
        {error ? <p className="form-message error">{error}</p> : null}

        <button className="primary-button admin-submit" type="submit" disabled={isLoading}>
          {isLoading ? "Publishing..." : "Publish Academic Post"}
        </button>
      </form>

      <ContentList
        eyebrow="Posted Content"
        title="Academic posts"
        items={materials}
        getTypeLabel={(item) => categoryLabels[item.category]}
        onDelete={deleteMaterial}
        token={token}
      />
    </section>
  );
}

function ActivityAlertsPage({ token }) {
  return (
    <ContentManager
      token={token}
      fixedType="activity-alert"
      eyebrow="Activity Alerts"
      title="Post activity alerts"
      description="Create alerts for workshops, clubs, contests, seminars, and department events."
    />
  );
}

function ShowcaseContentPage({ token }) {
  return (
    <ContentManager
      token={token}
      eyebrow="Showcase Pages"
      title="Add achievements, placements, and internships"
      description="These posts appear dynamically on the public achievements and placements pages."
      allowTypeChoice
    />
  );
}

function MasterCieOverviewPage({ token }) {
  const [marks, setMarks] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const authHeaders = getAuthHeaders(token);

  useEffect(() => {
    loadMarks();
  }, [token]);

  const loadMarks = async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await readJson(
        await fetch(`${API_BASE_URL}/cie-marks`, {
          headers: authHeaders,
        })
      );
      setMarks(data.marks || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const semesterMarks = marks.filter((mark) => {
    const semester = Number(mark.semester);
    return semester >= 3 && semester <= 8 && String(semester) === selectedSemester;
  });

  const subjectOptions = Array.from(
    semesterMarks
      .reduce((subjectMap, mark) => {
        const subjectId = mark.subject?._id || mark.subject?.id;
        if (subjectId && !subjectMap.has(subjectId)) {
          subjectMap.set(subjectId, {
            id: subjectId,
            code: mark.subject?.code || "-",
            name: mark.subject?.name || "Subject",
          });
        }
        return subjectMap;
      }, new Map())
      .values()
  ).sort((firstSubject, secondSubject) =>
    String(firstSubject.code).localeCompare(String(secondSubject.code))
  );

  const filteredMarks =
    selectedSemester && selectedSubject
      ? semesterMarks.filter((mark) => {
          const subjectId = mark.subject?._id || mark.subject?.id;
          return subjectId === selectedSubject;
        })
      : [];

  const overviewRows = Array.from(
    filteredMarks
      .reduce((rowMap, mark) => {
        const studentId = mark.student?._id || mark.student?.id || "unknown-student";
        const subjectId = mark.subject?._id || mark.subject?.id || "unknown-subject";
        const key = `${studentId}-${subjectId}`;
        const currentRow =
          rowMap.get(key) || {
            key,
            semester: mark.semester,
            studentName: mark.student?.name || "Student",
            usn: mark.student?.usn || mark.student?.collegeEmail || "-",
            subjectCode: mark.subject?.code || "-",
            subjectName: mark.subject?.name || "Subject",
            cieMarks: {},
            totalObtained: 0,
            totalMax: 0,
          };

        currentRow.cieMarks[mark.cieNumber] = `${mark.marksObtained}/${mark.maxMarks}`;
        currentRow.totalObtained += Number(mark.marksObtained) || 0;
        currentRow.totalMax += Number(mark.maxMarks) || 0;
        rowMap.set(key, currentRow);
        return rowMap;
      }, new Map())
      .values()
  ).sort((firstRow, secondRow) => {
    const semesterSort = Number(firstRow.semester) - Number(secondRow.semester);
    if (semesterSort) return semesterSort;
    const usnSort = String(firstRow.usn).localeCompare(String(secondRow.usn));
    if (usnSort) return usnSort;
    return String(firstRow.subjectCode).localeCompare(String(secondRow.subjectCode));
  });

  const studentCount = new Set(
    filteredMarks.map((mark) => mark.student?._id || mark.student?.id).filter(Boolean)
  ).size;
  const subjectCount = new Set(
    filteredMarks.map((mark) => mark.subject?._id || mark.subject?.id).filter(Boolean)
  ).size;
  const hasSelectedFilters = selectedSemester && selectedSubject;

  return (
    <section className="admin-route-panel cie-overview-layout">
      <div className="card admin-form cie-overview-header">
        <div>
          <p className="eyebrow">CIE Marks Overview</p>
          <h2>Student-wise marks from semester 3 to 8</h2>
          <span className="admin-file-hint">
            Review all recorded CIE marks grouped by student and subject.
          </span>
        </div>

        <div className="cie-overview-controls">
          <label>
            Semester
            <select
              value={selectedSemester}
              onChange={(event) => {
                setSelectedSemester(event.target.value);
                setSelectedSubject("");
              }}
            >
              <option value="">Select semester</option>
              {masterCieSemesterOptions.map((semester) => (
                <option key={semester} value={semester}>
                  Semester {semester}
                </option>
              ))}
            </select>
          </label>

          <label>
            Subject
            <select
              value={selectedSubject}
              onChange={(event) => setSelectedSubject(event.target.value)}
              disabled={!selectedSemester}
            >
              <option value="">Select subject</option>
              {subjectOptions.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.code} - {subject.name}
                </option>
              ))}
            </select>
          </label>

          <button className="secondary-button" type="button" onClick={loadMarks} disabled={isLoading}>
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="cie-overview-stats">
        <article className="card">
          <span>Students</span>
          <strong>{studentCount}</strong>
        </article>
        <article className="card">
          <span>Subjects</span>
          <strong>{subjectCount}</strong>
        </article>
        <article className="card">
          <span>Records</span>
          <strong>{filteredMarks.length}</strong>
        </article>
      </div>

      {error ? <p className="form-message error">{error}</p> : null}

      <div className="card cie-overview-table-card">
        {!hasSelectedFilters ? (
          <div className="cie-overview-empty">slelect snenster and subject</div>
        ) : (
          <div className="cie-sheet-table-wrap">
            <table className="cie-sheet-table cie-overview-table">
              <thead>
                <tr>
                  <th>Semester</th>
                  <th>USN</th>
                  <th>Student</th>
                  <th>Subject</th>
                  <th>CIE 1</th>
                  <th>CIE 2</th>
                  <th>CIE 3</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {overviewRows.length ? (
                  overviewRows.map((row) => (
                    <tr key={row.key}>
                      <td>Sem {row.semester}</td>
                      <td>{row.usn}</td>
                      <td>{row.studentName}</td>
                      <td>
                        <span className="cie-overview-subject">
                          <strong>{row.subjectCode}</strong>
                          <span>{row.subjectName}</span>
                        </span>
                      </td>
                      <td>{row.cieMarks[1] || "-"}</td>
                      <td>{row.cieMarks[2] || "-"}</td>
                      <td>{row.cieMarks[3] || "-"}</td>
                      <td>
                        {row.totalMax ? `${row.totalObtained}/${row.totalMax}` : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8">
                      {isLoading ? "Loading CIE marks..." : "No CIE marks found for the selected semester and subject."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function CieMarksPage({ token }) {
  const [form, setForm] = useState(initialCieForm);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [marks, setMarks] = useState([]);
  const [markEntries, setMarkEntries] = useState({});
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const authHeaders = getAuthHeaders(token);

  useEffect(() => {
    loadOptions();
    loadMarks();
  }, [token]);

  const loadOptions = async () => {
    try {
      const data = await readJson(
        await fetch(`${API_BASE_URL}/cie-marks/options`, {
          headers: authHeaders,
        })
      );
      setStudents(data.students || []);
      setSubjects(data.subjects || []);
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  const loadMarks = async () => {
    try {
      const data = await readJson(
        await fetch(`${API_BASE_URL}/cie-marks`, {
          headers: authHeaders,
        })
      );
      setMarks(data.marks || []);
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
      ...(name === "semester" ? { subject: "" } : {}),
    }));
  };

  useEffect(() => {
    const nextEntries = {};

    students
      .filter((student) => student.semester === Number(form.semester))
      .forEach((student) => {
        const existingMark = marks.find(
          (mark) =>
            mark.student?._id === student._id &&
            mark.subject?._id === form.subject &&
            String(mark.cieNumber) === String(form.cieNumber)
        );

        nextEntries[student._id] = {
          marksObtained: existingMark ? String(existingMark.marksObtained) : "",
          remarks: existingMark?.remarks || "",
        };
      });

    setMarkEntries(nextEntries);
  }, [students, marks, form.semester, form.subject, form.cieNumber]);

  const updateMarkEntry = (studentId, field, value) => {
    setMarkEntries((currentEntries) => ({
      ...currentEntries,
      [studentId]: {
        ...(currentEntries[studentId] || { marksObtained: "", remarks: "" }),
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("");
    setError("");

    if (!form.subject) {
      setError("Select a subject before saving marks.");
      return;
    }

    setIsLoading(true);

    try {
      const data = await readJson(
        await fetch(`${API_BASE_URL}/cie-marks/bulk`, {
          method: "POST",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            entries: Object.entries(markEntries).map(([student, entry]) => ({
              student,
              marksObtained: entry.marksObtained,
              remarks: entry.remarks,
            })),
          }),
        })
      );

      setMarks((currentMarks) => {
        const savedIds = new Set((data.marks || []).map((mark) => mark.id));
        return [...(data.marks || []), ...currentMarks.filter((mark) => !savedIds.has(mark.id))];
      });
      setStatus(`Saved CIE marks for ${data.saved} students.`);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMark = async (markId) => {
    setStatus("");
    setError("");

    try {
      await readJson(
        await fetch(`${API_BASE_URL}/cie-marks/${markId}`, {
          method: "DELETE",
          headers: authHeaders,
        })
      );
      setMarks((currentMarks) => currentMarks.filter((mark) => mark.id !== markId));
      setStatus("CIE mark deleted.");
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const visibleSemester = Number(form.semester);
  const semesterStudents = students.filter((student) => student.semester === visibleSemester);
  const semesterSubjects = subjects.filter((subject) => subject.semester === visibleSemester);
  const visibleMarks = marks.filter(
    (mark) =>
      mark.semester === visibleSemester &&
      (!form.subject || mark.subject?._id === form.subject) &&
      String(mark.cieNumber) === String(form.cieNumber)
  );

  return (
    <section className="admin-route-panel cie-sheet-layout">
      <form className="card admin-form" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">CIE Marks</p>
          <h2>Bulk enter subject-wise CIE marks</h2>
          <span className="admin-file-hint">
            Select a semester, subject, and CIE number, then fill marks for all students like a sheet.
          </span>
        </div>

        <div className="cie-sheet-controls">
          <label>
            Semester
            <select name="semester" value={form.semester} onChange={updateField}>
              {semesterOptions.map((semester) => (
                <option key={semester} value={semester}>
                  Semester {semester}
                </option>
              ))}
            </select>
          </label>

          <label>
            Subject
            <select name="subject" value={form.subject} onChange={updateField} required>
              <option value="">Choose subject</option>
              {semesterSubjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.code} - {subject.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            CIE
            <select name="cieNumber" value={form.cieNumber} onChange={updateField}>
              <option value="1">CIE 1</option>
              <option value="2">CIE 2</option>
              <option value="3">CIE 3</option>
            </select>
          </label>

          <label>
            Max Marks
            <input
              name="maxMarks"
              type="number"
              min="1"
              value={form.maxMarks}
              onChange={updateField}
              required
            />
          </label>
        </div>

        <div className="cie-sheet-table-wrap">
          <table className="cie-sheet-table">
            <thead>
              <tr>
                <th>USN</th>
                <th>Name</th>
                <th>Marks</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {semesterStudents.length ? (
                semesterStudents.map((student) => (
                  <tr key={student._id}>
                    <td>{student.usn || "-"}</td>
                    <td>{student.name}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max={form.maxMarks}
                        value={markEntries[student._id]?.marksObtained || ""}
                        onChange={(event) =>
                          updateMarkEntry(student._id, "marksObtained", event.target.value)
                        }
                        placeholder="0"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={markEntries[student._id]?.remarks || ""}
                        onChange={(event) => updateMarkEntry(student._id, "remarks", event.target.value)}
                        placeholder="Optional"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No students found for this semester.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {status ? <p className="form-message success">{status}</p> : null}
        {error ? <p className="form-message error">{error}</p> : null}

        <button className="primary-button admin-submit" type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save All Marks"}
        </button>
      </form>

      <div className="admin-posts">
        <div className="admin-section-heading">
          <p className="eyebrow">Recorded Marks</p>
          <h2>Saved records</h2>
        </div>

        <div className="student-list">
          {visibleMarks.length ? (
            visibleMarks.map((mark) => (
              <article className="card student-card" key={mark.id}>
                <div className="student-card-top">
                  <span>CIE {mark.cieNumber}</span>
                  <button type="button" onClick={() => deleteMark(mark.id)}>
                    Delete
                  </button>
                </div>
                <h3>{mark.student?.name || "Student"}</h3>
                <small>{mark.student?.usn || mark.student?.collegeEmail}</small>
                <p>
                  {mark.subject?.code} - {mark.subject?.name}
                </p>
                <strong>
                  {mark.marksObtained}/{mark.maxMarks}
                </strong>
                {mark.remarks ? <p>{mark.remarks}</p> : null}
              </article>
            ))
          ) : (
            <div className="card empty-state">
              <h3>No CIE marks yet</h3>
              <p>Saved CIE marks for this semester will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function AssessmentAnalyticsPage({ token }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const authHeaders = getAuthHeaders(token);

  useEffect(() => {
    loadStats();
  }, [token]);

  const loadStats = async () => {
    setError("");
    try {
      const data = await readJson(
        await fetch(`${API_BASE_URL}/aptitude/admin/dashboard`, {
          headers: authHeaders,
        })
      );
      setStats(data);
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  function formatDuration(seconds) {
    if (!seconds) return "0m";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  }

  function formatDateTime(dateStr) {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <section className="admin-route-panel">
      <div className="card admin-form">
        <div>
          <p className="eyebrow">Assessment Analytics</p>
          <h2>Monitor aptitude assessment performance</h2>
          <span className="admin-file-hint">
            Overview of all assessments, submissions, pass rates, and student performance.
          </span>
        </div>
      </div>

      {error ? <p className="form-message error">{error}</p> : null}

      {!stats ? (
        <div className="card empty-state">
          <h3>Loading analytics...</h3>
        </div>
      ) : (
        <>
          <div className="cie-overview-stats">
            <article className="card">
              <span>Assessments</span>
              <strong>{stats.assessments}</strong>
            </article>
            <article className="card">
              <span>Published</span>
              <strong style={{ color: "var(--color-accent)" }}>{stats.published}</strong>
            </article>
            <article className="card">
              <span>Students</span>
              <strong>{stats.students}</strong>
            </article>
            <article className="card">
              <span>Submissions</span>
              <strong>{stats.submitted_attempts}</strong>
            </article>
          </div>
          <div className="cie-overview-stats">
            <article className="card">
              <span>In Progress</span>
              <strong>{stats.in_progress_attempts}</strong>
            </article>
            <article className="card">
              <span>Pass Rate</span>
              <strong style={{ color: "var(--color-accent)" }}>{stats.pass_rate}%</strong>
            </article>
            <article className="card">
              <span>Average Score</span>
              <strong>{stats.average_percentage}%</strong>
            </article>
          </div>

          <div className="card cie-overview-table-card">
            <div className="cie-overview-header" style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--color-line)" }}>
              <p className="eyebrow">Submissions</p>
              <h2>Latest student submissions</h2>
            </div>
            <div className="cie-sheet-table-wrap">
              <table className="cie-sheet-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Assessment</th>
                    <th>Concept</th>
                    <th>Marks</th>
                    <th>Percentage</th>
                    <th>Result</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.submissions?.length ? (
                    stats.submissions.map((submission) => (
                      <tr key={submission.id}>
                        <td>
                          <strong>{submission.student_name}</strong>
                          <br /><small>{submission.email}</small>
                        </td>
                        <td>{submission.assessment_title}</td>
                        <td>{submission.concept}</td>
                        <td>{submission.score}/{submission.total_marks}</td>
                        <td><strong>{submission.percentage}%</strong></td>
                        <td>
                          <span style={{
                            display: "inline-block",
                            padding: "0.125rem 0.5rem",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            borderRadius: "4px",
                            background: submission.passed ? "rgba(5, 150, 105, 0.1)" : "rgba(220, 38, 38, 0.1)",
                            color: submission.passed ? "#059669" : "#dc2626",
                          }}>
                            {submission.passed ? "Passed" : "Failed"}
                          </span>
                        </td>
                        <td>{formatDateTime(submission.submitted_at)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
                        No submissions yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function ContentManager({ token, fixedType, allowTypeChoice = false, eyebrow, title, description }) {
  const [form, setForm] = useState(() => ({ ...initialContentForm, type: fixedType || "achievement" }));
  const [selectedImage, setSelectedImage] = useState(null);
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const imageInputRef = useRef(null);
  const authHeaders = getAuthHeaders(token);
  const visibleTypes = fixedType ? [fixedType] : ["achievement", "placement", "internship"];

  useEffect(() => {
    loadPosts();
  }, [token, fixedType]);

  const loadPosts = async () => {
    try {
      const query = fixedType ? `?type=${fixedType}` : "";
      const data = await readJson(
        await fetch(`${API_BASE_URL}/content${query}`, {
          headers: authHeaders,
        })
      );
      setPosts((data.posts || []).filter((post) => visibleTypes.includes(post.type)));
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("");
    setError("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      Object.entries({ ...form, type: fixedType || form.type }).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const data = await readJson(
        await fetch(`${API_BASE_URL}/content`, {
          method: "POST",
          headers: authHeaders,
          body: formData,
        })
      );

      setPosts((currentPosts) => [data.post, ...currentPosts]);
      setForm({ ...initialContentForm, type: fixedType || "achievement" });
      setSelectedImage(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
      setStatus("Content published.");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deletePost = async (postId) => {
    setStatus("");
    setError("");

    try {
      await readJson(
        await fetch(`${API_BASE_URL}/content/${postId}`, {
          method: "DELETE",
          headers: authHeaders,
        })
      );
      setPosts((currentPosts) => currentPosts.filter((post) => post._id !== postId));
      setStatus("Content deleted.");
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  return (
    <section className="admin-grid admin-route-panel">
      <form className="card admin-form" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <span className="admin-file-hint">{description}</span>
        </div>

        {allowTypeChoice ? (
          <label>
            Page
            <select name="type" value={form.type} onChange={updateField}>
              <option value="achievement">Achievements</option>
              <option value="placement">Placements</option>
              <option value="internship">Internships</option>
            </select>
          </label>
        ) : null}

        <label>
          Title
          <input
            name="title"
            type="text"
            value={form.title}
            onChange={updateField}
            placeholder="Post title"
            required
          />
        </label>

        <label>
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={updateField}
            placeholder="Write the details students should see."
            rows="5"
          />
        </label>

        {form.type === "placement" || form.type === "internship" ? (
          <>
            <label>
              Student name
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={updateField}
                placeholder="[name]"
              />
            </label>

            <label>
              Role or company
              <input
                name="roleTitle"
                type="text"
                value={form.roleTitle}
                onChange={updateField}
                placeholder="[role]"
              />
            </label>

            <label>
              CTC / LPA
              <input
                name="ctcLpa"
                type="text"
                value={form.ctcLpa}
                onChange={updateField}
                placeholder="[CTC/LPA]"
              />
            </label>
          </>
        ) : null}

        {form.type === "placement" || form.type === "internship" ? (
          <label>
            Upload image
            <input
              ref={imageInputRef}
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => setSelectedImage(event.target.files?.[0] || null)}
            />
            <span className="admin-file-hint">
              {selectedImage ? selectedImage.name : "Allowed formats: JPG, PNG, WEBP up to 5 MB."}
            </span>
          </label>
        ) : null}

        <label>
          Link
          <input name="link" type="url" value={form.link} onChange={updateField} placeholder="https://..." />
        </label>

        {status ? <p className="form-message success">{status}</p> : null}
        {error ? <p className="form-message error">{error}</p> : null}

        <button className="primary-button admin-submit" type="submit" disabled={isLoading}>
          {isLoading ? "Publishing..." : "Publish Content"}
        </button>
      </form>

      <ContentList
        eyebrow="Published"
        title={fixedType ? contentTypeLabels[fixedType] : "Showcase content"}
        items={posts}
        getTypeLabel={(item) => contentTypeLabels[item.type]}
        onDelete={deletePost}
      />
    </section>
  );
}

function SubjectsPage({ token }) {
  const [subjectForm, setSubjectForm] = useState(initialSubjectForm);
  const [subjects, setSubjects] = useState([]);
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState("3");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const authHeaders = getAuthHeaders(token);

  useEffect(() => {
    loadSubjects();
  }, [token]);

  const loadSubjects = async () => {
    try {
      const data = await readJson(
        await fetch(`${API_BASE_URL}/subjects`, {
          headers: authHeaders,
        })
      );
      setSubjects(data.subjects || []);
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  const updateSubjectField = (event) => {
    const { name, value } = event.target;
    setSubjectForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleSubjectSubmit = async (event) => {
    event.preventDefault();
    setStatus("");
    setError("");
    setIsLoading(true);

    try {
      const data = await readJson(
        await fetch(`${API_BASE_URL}/subjects`, {
          method: "POST",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(subjectForm),
        })
      );

      setSubjects((currentSubjects) => [data.subject, ...currentSubjects]);
      setSubjectForm(initialSubjectForm);
      setStatus("Subject created.");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSubject = async (subjectId) => {
    setStatus("");
    setError("");

    try {
      await readJson(
        await fetch(`${API_BASE_URL}/subjects/${subjectId}`, {
          method: "DELETE",
          headers: authHeaders,
        })
      );
      setSubjects((currentSubjects) => currentSubjects.filter((subject) => subject._id !== subjectId));
      setStatus("Subject deleted.");
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const filteredSubjects = subjects.filter(
    (subject) => subject.semester === parseInt(selectedSemesterFilter)
  );

  return (
    <section className="admin-grid admin-route-panel">
      <form className="card admin-form" onSubmit={handleSubjectSubmit}>
        <div>
          <p className="eyebrow">Subjects</p>
          <h2>Set subjects for every semester</h2>
        </div>

        <label>
          Subject Code
          <input
            name="code"
            type="text"
            value={subjectForm.code}
            onChange={updateSubjectField}
            placeholder="CS101"
            required
          />
        </label>

        <label>
          Subject Name
          <input
            name="name"
            type="text"
            value={subjectForm.name}
            onChange={updateSubjectField}
            placeholder="Data Structures"
            required
          />
        </label>

        <label>
          Semester
          <select name="semester" value={subjectForm.semester} onChange={updateSubjectField}>
            {semesterOptions.map((semester) => (
              <option key={semester} value={semester}>
                Semester {semester}
              </option>
            ))}
          </select>
        </label>

        <label>
          Credits
          <input
            name="credits"
            type="number"
            min="1"
            max="6"
            value={subjectForm.credits}
            onChange={updateSubjectField}
            required
          />
        </label>

        <label>
          Instructor
          <input
            name="instructor"
            type="text"
            value={subjectForm.instructor}
            onChange={updateSubjectField}
            placeholder="Faculty name"
          />
        </label>

        <label>
          Description
          <textarea
            name="description"
            value={subjectForm.description}
            onChange={updateSubjectField}
            placeholder="Subject description"
            rows="4"
          />
        </label>

        {status ? <p className="form-message success">{status}</p> : null}
        {error ? <p className="form-message error">{error}</p> : null}

        <button className="primary-button admin-submit" type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Subject"}
        </button>
      </form>

      <div className="admin-posts">
        <div className="admin-section-heading">
          <p className="eyebrow">Configured Subjects</p>
          <h2>All subjects by semester</h2>
        </div>

        <label className="semester-filter">
          Filter by Semester
          <select value={selectedSemesterFilter} onChange={(event) => setSelectedSemesterFilter(event.target.value)}>
            {semesterOptions.map((semester) => (
              <option key={semester} value={semester}>
                Semester {semester}
              </option>
            ))}
          </select>
        </label>

        <div className="subject-list">
          {filteredSubjects.length ? (
            filteredSubjects.map((subject) => (
              <article className="card subject-card" key={subject._id}>
                <div className="subject-card-top">
                  <span className="subject-code">{subject.code}</span>
                  <button type="button" onClick={() => deleteSubject(subject._id)}>
                    Delete
                  </button>
                </div>
                <h3>{subject.name}</h3>
                <p>{subject.description}</p>
                <div className="subject-meta">
                  <small>Credits: {subject.credits}</small>
                  {subject.instructor ? <small>Instructor: {subject.instructor}</small> : null}
                </div>
              </article>
            ))
          ) : (
            <div className="card empty-state">
              <h3>No subjects for this semester</h3>
              <p>Add subjects for this semester using the form.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function CoordinatorAssignmentsPage({ token }) {
  const [form, setForm] = useState(initialCoordinatorForm);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [removingCoordinatorKey, setRemovingCoordinatorKey] = useState("");
  const authHeaders = getAuthHeaders(token);

  useEffect(() => {
    loadTeachers();
    loadStudents();
  }, [token]);

  const loadTeachers = async () => {
    try {
      const data = await readJson(
        await fetch(`${API_BASE_URL}/users/teachers`, {
          headers: authHeaders,
        })
      );
      setTeachers(data.teachers || []);
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  const loadStudents = async () => {
    try {
      const data = await readJson(
        await fetch(`${API_BASE_URL}/users/students`, {
          headers: authHeaders,
        })
      );
      setStudents(data.students || []);
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const selectTeacher = (teacherId) => {
    const teacher = teachers.find((currentTeacher) => currentTeacher.id === teacherId);
    setForm((currentForm) => ({
      ...currentForm,
      teacherUserId: teacherId,
      teacherId: teacher?.teacherId || currentForm.teacherId,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("");
    setError("");
    setIsLoading(true);

    try {
      const data = await readJson(
        await fetch(`${API_BASE_URL}/users/coordinators`, {
          method: "POST",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        })
      );

      setTeachers((currentTeachers) =>
        currentTeachers.map((teacher) => (teacher.id === data.teacher.id ? data.teacher : teacher))
      );
      setStatus(`Coordinator assigned. Updated ${data.updatedStudents} student profiles.`);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const removeCoordinator = async (teacherUserId, semester) => {
    setStatus("");
    setError("");
    setRemovingCoordinatorKey(`${teacherUserId}-${semester}`);

    try {
      const data = await readJson(
        await fetch(`${API_BASE_URL}/users/coordinators/${teacherUserId}/${semester}`, {
          method: "DELETE",
          headers: authHeaders,
        })
      );

      setTeachers((currentTeachers) =>
        currentTeachers.map((teacher) => (teacher.id === data.teacher.id ? data.teacher : teacher))
      );
      await loadStudents();
      setStatus(`Coordinator removed. Updated ${data.updatedStudents} student profiles.`);
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setRemovingCoordinatorKey("");
    }
  };

  const coordinatorSemesters = semesterOptions;
  const studentsBySemester = coordinatorSemesters.map((semester) => {
    const semesterNumber = Number(semester);
    const coordinator = teachers.find((teacher) =>
      (teacher.coordinatorSemesters || []).includes(semesterNumber)
    );

    return {
      semester,
      count: students.filter((student) => student.semester === semesterNumber).length,
      coordinator,
    };
  });
  const assignedCoordinatorSemesters = studentsBySemester.filter((item) => item.coordinator);

  return (
    <section className="admin-grid admin-route-panel">
      <form className="card admin-form" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">Class Coordinators</p>
          <h2>Assign coordinator for semesters 3 to 8</h2>
          <span className="admin-file-hint">
            Choose a teacher admin and assign them as class coordinator for a semester.
          </span>
        </div>

        <label>
          Teacher
          <select
            name="teacherUserId"
            value={form.teacherUserId}
            onChange={(event) => selectTeacher(event.target.value)}
            required
          >
            <option value="">Choose teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name} {teacher.teacherId ? `(${teacher.teacherId})` : ""}
              </option>
            ))}
          </select>
        </label>

        <label>
          Teacher ID
          <input
            name="teacherId"
            type="text"
            value={form.teacherId}
            onChange={updateField}
            placeholder="Teacher ID"
            required
          />
        </label>

        <label>
          Semester
          <select name="semester" value={form.semester} onChange={updateField}>
            {coordinatorSemesters.map((semester) => (
              <option key={semester} value={semester}>
                Semester {semester}
              </option>
            ))}
          </select>
        </label>

        {status ? <p className="form-message success">{status}</p> : null}
        {error ? <p className="form-message error">{error}</p> : null}

        <button className="primary-button admin-submit" type="submit" disabled={isLoading}>
          {isLoading ? "Assigning..." : "Assign Coordinator"}
        </button>
      </form>

      <div className="admin-posts">
        <div className="admin-section-heading">
          <p className="eyebrow">Semester List</p>
          <h2>Coordinator assignments</h2>
        </div>

        <div className="student-list">
          {assignedCoordinatorSemesters.length ? (
            assignedCoordinatorSemesters.map((item) => (
              <article className="card student-card" key={item.semester}>
                <div className="student-card-top">
                  <span>Semester {item.semester}</span>
                  <button
                    type="button"
                    onClick={() => removeCoordinator(item.coordinator.id, item.semester)}
                    disabled={removingCoordinatorKey === `${item.coordinator.id}-${item.semester}`}
                  >
                    {removingCoordinatorKey === `${item.coordinator.id}-${item.semester}`
                      ? "Removing..."
                      : "Delete"}
                  </button>
                </div>
                <h3>{item.coordinator.name}</h3>
                <small>{item.count} students</small>
                {item.coordinator.teacherId ? <small>ID: {item.coordinator.teacherId}</small> : null}
              </article>
            ))
          ) : (
            <div className="card empty-state">
              <h3>No coordinators assigned</h3>
              <p>Assigned semesters will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function TeacherAdminsPage({ token }) {
  const [form, setForm] = useState(initialTeacherAdminForm);
  const [admins, setAdmins] = useState([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const authHeaders = getAuthHeaders(token);

  useEffect(() => {
    loadAdmins();
  }, [token]);

  const loadAdmins = async () => {
    try {
      try {
        const data = await readJson(
          await fetch(`${API_BASE_URL}/users/admins`, {
            headers: authHeaders,
          })
        );
        setAdmins(data.admins || []);
        return;
      } catch (adminRouteError) {
        const data = await readJson(
          await fetch(`${API_BASE_URL}/users/teachers`, {
            headers: authHeaders,
          })
        );
        setAdmins(data.teachers || []);
      }
    } catch (loadError) {
      setError("Could not load teacher admins. Please deploy the latest backend routes and try again.");
    }
  };

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: name === "teacherId" ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("");
    setError("");
    setIsLoading(true);

    try {
      const data = await readJson(
        await fetch(`${API_BASE_URL}/users/admins`, {
          method: "POST",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        })
      );

      setAdmins((currentAdmins) => [data.admin, ...currentAdmins]);
      setForm(initialTeacherAdminForm);
      setStatus(data.warning || "Teacher admin created and notification email sent.");
    } catch (submitError) {
      setError(
        submitError.message.includes("Expected JSON")
          ? "The backend does not have the teacher admin creation route yet. Deploy the latest backend and try again."
          : submitError.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="admin-grid admin-route-panel">
      <form className="card admin-form" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">Teacher Admins</p>
          <h2>Create teacher access</h2>
          <span className="admin-file-hint">
            Add a teacher account with employee ID, portal role, and a temporary password.
          </span>
        </div>

        <label>
          Teacher Name
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={updateField}
            placeholder="Teacher full name"
            minLength="2"
            maxLength="80"
            required
          />
        </label>

        <label>
          Email
          <input
            name="collegeEmail"
            type="email"
            value={form.collegeEmail}
            onChange={updateField}
            placeholder="teacher@example.com"
            required
          />
        </label>

        <label>
          Teacher Employee ID
          <input
            name="teacherId"
            type="text"
            value={form.teacherId}
            onChange={updateField}
            placeholder="Employee ID"
            required
          />
        </label>

        <label>
          Role
          <select name="role" value={form.role} onChange={updateField} required>
            <option value="admin">Teacher Admin</option>
            <option value="master-admin">Master Admin</option>
          </select>
        </label>

        <label>
          Temporary Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={updateField}
            placeholder="At least 8 characters"
            minLength="8"
            required
          />
        </label>

        {status ? <p className="form-message success">{status}</p> : null}
        {error ? <p className="form-message error">{error}</p> : null}

        <button className="primary-button admin-submit" type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Teacher Admin"}
        </button>
      </form>

      <div className="admin-posts">
        <div className="admin-section-heading">
          <p className="eyebrow">Admin Accounts</p>
          <h2>Teachers with portal access</h2>
        </div>

        <div className="student-list">
          {admins.length ? (
            admins.map((admin) => (
              <article className="card student-card" key={admin.id}>
                <div className="student-card-top">
                  <span>{admin.role === "master-admin" ? "Master Admin" : "Teacher Admin"}</span>
                  {admin.teacherId ? <small>ID: {admin.teacherId}</small> : null}
                </div>
                <h3>{admin.name}</h3>
                <small>{admin.collegeEmail}</small>
                {admin.teacherId ? <small>Teacher Employee ID: {admin.teacherId}</small> : null}
                <p>Class Coordinator For: {formatSemesterList(admin.coordinatorSemesters)}</p>
                {(admin.mentorAssignments || []).length ? (
                  admin.mentorAssignments.map((assignment, index) => (
                    <p key={`${assignment.startUsn}-${assignment.endUsn}-${index}`}>
                      Mentor Range: {assignment.startUsn} to {assignment.endUsn}
                    </p>
                  ))
                ) : (
                  <p>Mentor Range: Not assigned</p>
                )}
              </article>
            ))
          ) : (
            <div className="card empty-state">
              <h3>No teacher admins yet</h3>
              <p>Create teacher access from the form.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function StudentAccountsPage({ token }) {
  const [form, setForm] = useState(initialStudentAccountForm);
  const [bulkForm, setBulkForm] = useState(initialStudentBulkForm);
  const [bulkFile, setBulkFile] = useState(null);
  const [students, setStudents] = useState([]);
  const [manualStatus, setManualStatus] = useState("");
  const [manualError, setManualError] = useState("");
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkError, setBulkError] = useState("");
  const [selectedStudentSemester, setSelectedStudentSemester] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const bulkFileInputRef = useRef(null);
  const authHeaders = getAuthHeaders(token);

  useEffect(() => {
    loadStudents();
  }, [token]);

  const loadStudents = async () => {
    try {
      const data = await readJson(
        await fetch(`${API_BASE_URL}/users/students`, {
          headers: authHeaders,
        })
      );
      setStudents(data.students || []);
    } catch (loadError) {
      setManualError(loadError.message);
    }
  };

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: name === "usn" ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setManualStatus("");
    setManualError("");
    setIsLoading(true);

    try {
      const data = await readJson(
        await fetch(`${API_BASE_URL}/users/students`, {
          method: "POST",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        })
      );

      setStudents((currentStudents) => [data.student, ...currentStudents]);
      setForm(initialStudentAccountForm);
      setManualStatus(data.warning || "Student account created and notification email sent.");
    } catch (submitError) {
      setManualError(submitError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkSubmit = async (event) => {
    event.preventDefault();
    setBulkStatus("");
    setBulkError("");

    if (!bulkFile) {
      setBulkError("Upload an Excel file before importing students.");
      return;
    }

    setIsImporting(true);

    try {
      const formData = new FormData();
      formData.append("semester", bulkForm.semester);
      formData.append("file", bulkFile);

      const data = await readJson(
        await fetch(`${API_BASE_URL}/users/students/bulk`, {
          method: "POST",
          headers: authHeaders,
          body: formData,
        })
      );

      setStudents((currentStudents) => [...(data.students || []), ...currentStudents]);
      setBulkForm(initialStudentBulkForm);
      setBulkFile(null);
      if (bulkFileInputRef.current) bulkFileInputRef.current.value = "";

      const skippedText = data.skipped ? ` ${data.skipped} row(s) skipped.` : "";
      setBulkStatus(`Created ${data.created || 0} student account(s).${skippedText}`);
    } catch (submitError) {
      setBulkError(submitError.message);
    } finally {
      setIsImporting(false);
    }
  };

  const visibleStudents = selectedStudentSemester
    ? students.filter((student) => String(student.semester) === selectedStudentSemester)
    : [];

  return (
    <section className="admin-grid admin-route-panel">
      <div className="student-account-forms">
        <form className="card admin-form" onSubmit={handleSubmit}>
          <div>
            <p className="eyebrow">Manual Addition</p>
            <h2>Create one student account</h2>
            <span className="admin-file-hint">
              Add a student account with USN, semester, and a temporary password.
            </span>
          </div>

          <label>
            Student Name
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={updateField}
              placeholder="Student full name"
              minLength="2"
              maxLength="80"
              required
            />
          </label>

          <label>
            College Email
            <input
              name="collegeEmail"
              type="email"
              value={form.collegeEmail}
              onChange={updateField}
              placeholder="student@aiet.org.in"
              required
            />
          </label>

          <label>
            USN
            <input
              name="usn"
              type="text"
              value={form.usn}
              onChange={updateField}
              placeholder="Student USN"
              required
            />
          </label>

          <label>
            Semester
            <select name="semester" value={form.semester} onChange={updateField} required>
              {semesterOptions.map((semester) => (
                <option key={semester} value={semester}>
                  Semester {semester}
                </option>
              ))}
            </select>
          </label>

          <label>
            Temporary Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              placeholder="At least 8 characters"
              minLength="8"
              required
            />
          </label>

          {manualStatus ? <p className="form-message success">{manualStatus}</p> : null}
          {manualError ? <p className="form-message error">{manualError}</p> : null}

          <button className="primary-button admin-submit" type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Student Account"}
          </button>
        </form>

        <form className="card admin-form" onSubmit={handleBulkSubmit}>
          <div>
            <p className="eyebrow">Excel Import</p>
            <h2>Add students in bulk</h2>
            <span className="admin-file-hint">
              Upload an Excel file with columns: student name, usn, emailid.
              Temporary password will be DeptICB@USN for every student.
            </span>
          </div>

          <label>
            Semester
            <select
              name="semester"
              value={bulkForm.semester}
              onChange={(event) =>
                setBulkForm((currentForm) => ({ ...currentForm, semester: event.target.value }))
              }
              required
            >
              {semesterOptions.map((semester) => (
                <option key={semester} value={semester}>
                  Semester {semester}
                </option>
              ))}
            </select>
          </label>

          <label>
            Excel File
            <input
              ref={bulkFileInputRef}
              type="file"
              accept=".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(event) => setBulkFile(event.target.files?.[0] || null)}
              required
            />
            <span className="admin-file-hint">
              {bulkFile ? bulkFile.name : "Use the exact column names: student name, usn, emailid."}
            </span>
          </label>

          {bulkStatus ? <p className="form-message success">{bulkStatus}</p> : null}
          {bulkError ? <p className="form-message error">{bulkError}</p> : null}

          <button className="primary-button admin-submit" type="submit" disabled={isImporting}>
            {isImporting ? "Importing..." : "Import Student Accounts"}
          </button>
        </form>
      </div>

      <div className="admin-posts">
        <div className="admin-section-heading">
          <p className="eyebrow">Student Accounts</p>
          <h2>Students with portal access</h2>
        </div>

        <div className="card student-filter-card">
          <label>
            Filter by semester
            <select
              value={selectedStudentSemester}
              onChange={(event) => setSelectedStudentSemester(event.target.value)}
            >
              <option value="">Select semester</option>
              {semesterOptions.map((semester) => (
                <option key={semester} value={semester}>
                  Semester {semester}
                </option>
              ))}
            </select>
          </label>
          <span>
            {selectedStudentSemester
              ? `Showing ${visibleStudents.length} student account(s) from Semester ${selectedStudentSemester}.`
              : "Choose a semester to view student accounts."}
          </span>
        </div>

        <div className="student-list">
          {!selectedStudentSemester ? (
            <div className="card empty-state">
              <h3>Select a semester</h3>
              <p>Student accounts will appear after choosing a semester.</p>
            </div>
          ) : visibleStudents.length ? (
            visibleStudents.map((student) => (
              <article className="card student-card" key={student.id}>
                <div className="student-card-top">
                  <span>Semester {student.semester}</span>
                  <small>{student.usn || "USN not set"}</small>
                </div>
                <h3>{student.name}</h3>
                <small>{student.collegeEmail}</small>
                <p>Class Coordinator: {student.classCoordinatorName || "Not assigned"}</p>
                <p>Mentor: {student.mentorName || "Not assigned"}</p>
              </article>
            ))
          ) : (
            <div className="card empty-state">
              <h3>No student accounts found</h3>
              <p>Create student access for this semester or choose another semester.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function MentorAssignmentsPage({ token }) {
  const [form, setForm] = useState(initialMentorForm);
  const [teachers, setTeachers] = useState([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const authHeaders = getAuthHeaders(token);

  useEffect(() => {
    loadTeachers();
  }, [token]);

  const loadTeachers = async () => {
    try {
      const data = await readJson(
        await fetch(`${API_BASE_URL}/users/teachers`, {
          headers: authHeaders,
        })
      );
      setTeachers(data.teachers || []);
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value.toUpperCase() }));
  };

  const selectTeacher = (teacherId) => {
    const teacher = teachers.find((currentTeacher) => currentTeacher.id === teacherId);
    setForm((currentForm) => ({
      ...currentForm,
      teacherUserId: teacherId,
      teacherId: teacher?.teacherId || currentForm.teacherId,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("");
    setError("");
    setIsLoading(true);

    try {
      const data = await readJson(
        await fetch(`${API_BASE_URL}/users/mentors`, {
          method: "POST",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        })
      );

      setTeachers((currentTeachers) =>
        currentTeachers.map((teacher) => (teacher.id === data.teacher.id ? data.teacher : teacher))
      );
      setStatus(`Mentor assigned to ${data.updatedStudents} students.`);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="admin-grid admin-route-panel">
      <form className="card admin-form" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">Mentor Assignment</p>
          <h2>Assign mentor by USN range</h2>
          <span className="admin-file-hint">
            Choose a teacher and enter the start and end USN for the student range.
          </span>
        </div>

        <label>
          Mentor
          <select
            name="teacherUserId"
            value={form.teacherUserId}
            onChange={(event) => selectTeacher(event.target.value)}
            required
          >
            <option value="">Choose teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name} {teacher.teacherId ? `(${teacher.teacherId})` : ""}
              </option>
            ))}
          </select>
        </label>

        <label>
          Teacher ID
          <input
            name="teacherId"
            type="text"
            value={form.teacherId}
            onChange={updateField}
            placeholder="Teacher ID"
            required
          />
        </label>

        <label>
          Start USN
          <input name="startUsn" type="text" value={form.startUsn} onChange={updateField} required />
        </label>

        <label>
          End USN
          <input name="endUsn" type="text" value={form.endUsn} onChange={updateField} required />
        </label>

        {status ? <p className="form-message success">{status}</p> : null}
        {error ? <p className="form-message error">{error}</p> : null}

        <button className="primary-button admin-submit" type="submit" disabled={isLoading}>
          {isLoading ? "Assigning..." : "Assign Mentor"}
        </button>
      </form>

      <div className="admin-posts">
        <div className="admin-section-heading">
          <p className="eyebrow">Teacher Profiles</p>
          <h2>Mentor ranges</h2>
        </div>

        <div className="student-list">
          {teachers.map((teacher) => (
            <article className="card student-card" key={teacher.id}>
              <h3>{teacher.name}</h3>
              {teacher.teacherId ? <small>ID: {teacher.teacherId}</small> : null}
              <p>Class Coordinator For: {formatSemesterList(teacher.coordinatorSemesters)}</p>
              {(teacher.mentorAssignments || []).length ? (
                teacher.mentorAssignments.map((assignment, index) => (
                  <p key={`${assignment.startUsn}-${assignment.endUsn}-${index}`}>
                    {assignment.startUsn} to {assignment.endUsn}
                  </p>
                ))
              ) : (
                <p>No mentor ranges assigned.</p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function StudentsPage({ token }) {
  const [form, setForm] = useState(initialStudentProfileForm);
  const [students, setStudents] = useState([]);
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState("all");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const authHeaders = getAuthHeaders(token);

  useEffect(() => {
    loadStudents();
  }, [token]);

  const loadStudents = async () => {
    try {
      const data = await readJson(
        await fetch(`${API_BASE_URL}/users/students`, {
          headers: authHeaders,
        })
      );
      setStudents(data.students || []);
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const selectStudent = (student) => {
    setForm({
      studentId: student.id,
      semester: String(student.semester || 3),
      classCoordinatorName: student.classCoordinatorName || "",
      mentorName: student.mentorName || "",
    });
    setStatus("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("");
    setError("");

    if (!form.studentId) {
      setError("Select a student before saving.");
      return;
    }

    setIsLoading(true);

    try {
      const data = await readJson(
        await fetch(`${API_BASE_URL}/users/students/${form.studentId}/profile`, {
          method: "PATCH",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            semester: form.semester,
            classCoordinatorName: form.classCoordinatorName,
            mentorName: form.mentorName,
          }),
        })
      );

      setStudents((currentStudents) =>
        currentStudents.map((student) => (student.id === data.student.id ? data.student : student))
      );
      setForm({
        studentId: data.student.id,
        semester: String(data.student.semester || 3),
        classCoordinatorName: data.student.classCoordinatorName || "",
        mentorName: data.student.mentorName || "",
      });
      setStatus("Student profile updated.");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedStudent = students.find((student) => student.id === form.studentId);
  const filteredStudents =
    selectedSemesterFilter === "all"
      ? students
      : students.filter((student) => student.semester === parseInt(selectedSemesterFilter));

  return (
    <section className="admin-grid admin-route-panel">
      <form className="card admin-form" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">Student Profiles</p>
          <h2>Assign coordinator and mentor</h2>
          <span className="admin-file-hint">
            Select a student, then save their class coordinator, mentor, and semester.
          </span>
        </div>

        <label>
          Student
          <select
            name="studentId"
            value={form.studentId}
            onChange={(event) => {
              const student = students.find((currentStudent) => currentStudent.id === event.target.value);
              if (student) {
                selectStudent(student);
              } else {
                setForm(initialStudentProfileForm);
              }
            }}
            required
          >
            <option value="">Choose student</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} - Sem {student.semester}
              </option>
            ))}
          </select>
        </label>

        {selectedStudent ? (
          <div className="student-selected-note">
            <strong>{selectedStudent.collegeEmail}</strong>
            {selectedStudent.usn ? <span>{selectedStudent.usn}</span> : null}
          </div>
        ) : null}

        <label>
          Semester
          <select name="semester" value={form.semester} onChange={updateField}>
            {semesterOptions.map((semester) => (
              <option key={semester} value={semester}>
                Semester {semester}
              </option>
            ))}
          </select>
        </label>

        <label>
          Class Coordinator Name
          <input
            name="classCoordinatorName"
            type="text"
            value={form.classCoordinatorName}
            onChange={updateField}
            placeholder="Faculty coordinator name"
            maxLength="80"
          />
        </label>

        <label>
          Mentor Name
          <input
            name="mentorName"
            type="text"
            value={form.mentorName}
            onChange={updateField}
            placeholder="Faculty mentor name"
            maxLength="80"
          />
        </label>

        {status ? <p className="form-message success">{status}</p> : null}
        {error ? <p className="form-message error">{error}</p> : null}

        <button className="primary-button admin-submit" type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Student Profile"}
        </button>
      </form>

      <div className="admin-posts">
        <div className="admin-section-heading">
          <p className="eyebrow">Students</p>
          <h2>Registered students</h2>
        </div>

        <label className="semester-filter">
          Filter by Semester
          <select
            value={selectedSemesterFilter}
            onChange={(event) => setSelectedSemesterFilter(event.target.value)}
          >
            <option value="all">All Semesters</option>
            {semesterOptions.map((semester) => (
              <option key={semester} value={semester}>
                Semester {semester}
              </option>
            ))}
          </select>
        </label>

        <div className="student-list">
          {filteredStudents.length ? (
            filteredStudents.map((student) => (
              <article className="card student-card" key={student.id}>
                <div className="student-card-top">
                  <span>Semester {student.semester}</span>
                  <button type="button" onClick={() => selectStudent(student)}>
                    Edit
                  </button>
                </div>
                <h3>{student.name}</h3>
                <small>{student.collegeEmail}</small>
                {student.usn ? <small>USN: {student.usn}</small> : null}
                <p>Coordinator: {student.classCoordinatorName || "Not assigned"}</p>
                <p>Mentor: {student.mentorName || "Not assigned"}</p>
              </article>
            ))
          ) : (
            <div className="card empty-state">
              <h3>No students found</h3>
              <p>Students will appear here after master admin creates accounts.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ContentList({ eyebrow, title, items, getTypeLabel, onDelete, token }) {
  const downloadContentFile = async (item) => {
    if (!token) return;

    try {
      await downloadApiFile(
        `${API_BASE_URL}/materials/${item._id}/file`,
        token,
        item.file?.originalName || "material-file"
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="admin-posts">
      <div className="admin-section-heading">
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>

      <div className="material-list">
        {items.length ? (
          items.map((item) => (
            <article className="card material-card" key={item._id}>
              <div className="material-card-top">
                <span>{getTypeLabel(item)}</span>
                <button type="button" onClick={() => onDelete(item._id)}>
                  Delete
                </button>
              </div>
              <h3>{item.title}</h3>
              {item.subject ? (
                <small>
                  {item.subject.code} - {item.subject.name}
                </small>
              ) : null}
              {item.name ? <small>Name: {item.name}</small> : null}
              {item.roleTitle ? <small>Role: {item.roleTitle}</small> : null}
              {item.ctcLpa ? <small>CTC/LPA: {item.ctcLpa}</small> : null}
              {item.image?.originalName ? <small>Image: {item.image.originalName}</small> : null}
              {item.description ? <p>{item.description}</p> : null}
              {item.dueDate ? <small>Due: {new Date(item.dueDate).toLocaleDateString()}</small> : null}
              {item.link ? (
                <a href={item.link} target="_blank" rel="noreferrer">
                  Open link
                </a>
              ) : null}
              {item.file?.url ? (
                <button
                  className="download-link-button"
                  type="button"
                  onClick={() => downloadContentFile(item)}
                  disabled={!token}
                >
                  Download {item.file.originalName || "file"}
                </button>
              ) : null}
            </article>
          ))
        ) : (
          <div className="card empty-state">
            <h3>No posts yet</h3>
            <p>Published content will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
