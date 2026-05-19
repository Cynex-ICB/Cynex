import { useEffect, useRef, useState } from "react";
import { Link, Navigate, NavLink, Route, Routes } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const initialMaterialForm = {
  title: "",
  category: "assignment",
  description: "",
  link: "",
  dueDate: "",
  subject: "",
  semester: "1",
};

const initialSubjectForm = {
  code: "",
  name: "",
  semester: "1",
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
  imageUrl: "",
  link: "",
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

const semesterOptions = Array.from({ length: 8 }, (_, index) => String(index + 1));

function getAuthHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

async function readJson(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

function AdminDashboard({ user, token, onLogout }) {
  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <p className="eyebrow">Professor Dashboard</p>
          <h1>Admin Panel</h1>
          <span>
            {user?.name} - {user?.collegeEmail || user?.email}
          </span>
        </div>
        <div className="admin-header-actions">
          <Link className="nav-logout admin-back-link" to="/">
            Back to Website
          </Link>
          <button className="nav-logout admin-logout" type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <nav className="admin-dashboard-nav" aria-label="Admin dashboard">
        <NavLink to="/admin/academic">Academic Content</NavLink>
        <NavLink to="/admin/activity-alerts">Activity Alerts</NavLink>
        <NavLink to="/admin/showcase">Showcase Pages</NavLink>
        <NavLink to="/admin/subjects">Subjects</NavLink>
      </nav>

      <Routes>
        <Route index element={<Navigate to="academic" replace />} />
        <Route path="academic" element={<AcademicContentPage token={token} />} />
        <Route path="activity-alerts" element={<ActivityAlertsPage token={token} />} />
        <Route path="showcase" element={<ShowcaseContentPage token={token} />} />
        <Route path="subjects" element={<SubjectsPage token={token} />} />
        <Route path="*" element={<Navigate to="academic" replace />} />
      </Routes>
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
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleMaterialSubmit = async (event) => {
    event.preventDefault();
    setStatus("");
    setError("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
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
      setStatus("Academic post published.");
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

        <label>
          Due date
          <input name="dueDate" type="date" value={form.dueDate} onChange={updateField} />
        </label>

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

function ContentManager({ token, fixedType, allowTypeChoice = false, eyebrow, title, description }) {
  const [form, setForm] = useState(() => ({ ...initialContentForm, type: fixedType || "achievement" }));
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
      const data = await readJson(
        await fetch(`${API_BASE_URL}/content`, {
          method: "POST",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...form, type: fixedType || form.type }),
        })
      );

      setPosts((currentPosts) => [data.post, ...currentPosts]);
      setForm({ ...initialContentForm, type: fixedType || "achievement" });
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

        <label>
          Image URL
          <input
            name="imageUrl"
            type="url"
            value={form.imageUrl}
            onChange={updateField}
            placeholder="[image]"
          />
        </label>

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
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState("1");
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

function ContentList({ eyebrow, title, items, getTypeLabel, onDelete }) {
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
              {item.description ? <p>{item.description}</p> : null}
              {item.dueDate ? <small>Due: {new Date(item.dueDate).toLocaleDateString()}</small> : null}
              {item.link ? (
                <a href={item.link} target="_blank" rel="noreferrer">
                  Open link
                </a>
              ) : null}
              {item.file?.url ? (
                <a href={`${API_ORIGIN}${item.file.url}`} target="_blank" rel="noreferrer">
                  Download {item.file.originalName || "file"}
                </a>
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
