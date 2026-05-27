import { useEffect, useState } from "react";
import { API_BASE_URL, API_ORIGIN, readApiJson } from "../utils/api.js";

const categoryLabels = {
  assignment: "Assignment",
  note: "Note",
  "study-material": "Study Material",
  notification: "Notification",
};

const semesterOptions = Array.from({ length: 6 }, (_, index) => String(index + 3));

function Materials({ token, user }) {
  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(user?.semester || 3);
  const [isLoading, setIsLoading] = useState(true);
  const isAdmin = user?.role === "admin";
  const studentSemester = Number(user?.semester || 3);

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    if (!isAdmin) {
      setSelectedSemester(studentSemester);
    }
    loadMaterials();
    loadSubjects();
  }, [token, studentSemester, isAdmin, selectedSemester]);

  const loadMaterials = async () => {
    try {
      const semesterQuery = isAdmin ? `?semester=${selectedSemester}` : "";
      const response = await fetch(`${API_BASE_URL}/materials${semesterQuery}`, {
        headers: authHeaders,
      });
      const data = await readApiJson(response);
      setMaterials(data.materials || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/subjects`, {
        headers: authHeaders,
      });
      const data = await readApiJson(response);
      setSubjects(data.subjects || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Get materials for a specific subject
  const getMaterialsForSubject = (subjectId) => {
    return materials.filter(
      (material) =>
        material.subject === subjectId ||
        (material.subject?._id === subjectId)
    );
  };

  // Get subjects for selected semester
  const visibleSemester = isAdmin ? parseInt(selectedSemester) : studentSemester;
  const subjectsForSemester = subjects.filter((subject) => subject.semester === visibleSemester);

  // Get general materials (notifications) for the semester
  const generalMaterials = materials.filter(
    (material) =>
      (!material.subject || material.subject === null || material.subject === "") &&
      material.semester === visibleSemester
  );

  return (
    <section className="section" id="materials">
      <div className="section-heading">
        <p className="eyebrow">Resources</p>
        <h2>Assignments, Notes & Study Materials</h2>
      </div>

      <div className="semester-selector">
        {isAdmin ? (
          <label>
            Select Semester:
            <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
              {semesterOptions.map((semester) => (
                <option key={semester} value={semester}>
                  Semester {semester}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className="semester-lock-note">Showing materials for Semester {studentSemester} only.</p>
        )}
      </div>

      {isLoading ? (
        <div className="card empty-state">
          <h3>Loading...</h3>
        </div>
      ) : (
        <>
          {/* Notifications Section */}
          {generalMaterials.some((m) => m.category === "notification") && (
            <div className="materials-section">
              <h3 className="materials-section-title">Notifications</h3>
              <div className="material-list">
                {generalMaterials
                  .filter((m) => m.category === "notification")
                  .map((material) => (
                    <article className="card material-card notification-card" key={material._id}>
                      <div className="material-card-top">
                        <span>{categoryLabels[material.category]}</span>
                      </div>
                      <h3>{material.title}</h3>
                      <p>{material.description}</p>
                      {material.link ? (
                        <a href={material.link} target="_blank" rel="noreferrer">
                          Open resource
                        </a>
                      ) : null}
                    </article>
                  ))}
              </div>
            </div>
          )}

          {/* Subject-wise Materials */}
          {subjectsForSemester.length > 0 ? (
            subjectsForSemester.map((subject) => {
              const subjectMaterials = getMaterialsForSubject(subject._id);
              return (
                <div className="materials-section" key={subject._id}>
                  <h3 className="materials-section-title">
                    {subject.code} - {subject.name}
                  </h3>
                  {subject.instructor && (
                    <p className="subject-instructor">Instructor: {subject.instructor}</p>
                  )}

                  {subjectMaterials.length > 0 ? (
                    <div className="material-list">
                      {subjectMaterials.map((material) => (
                        <article className="card material-card" key={material._id}>
                          <div className="material-card-top">
                            <span>{categoryLabels[material.category]}</span>
                          </div>
                          <h3>{material.title}</h3>
                          <p>{material.description}</p>
                          {material.dueDate ? (
                            <small className="due-date">
                              Due: {new Date(material.dueDate).toLocaleDateString()}
                            </small>
                          ) : null}
                          {material.link ? (
                            <a href={material.link} target="_blank" rel="noreferrer">
                              Open resource
                            </a>
                          ) : null}
                          {material.file?.url ? (
                            <a
                              href={`${API_ORIGIN}${material.file.url}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Download {material.file.originalName || "file"}
                            </a>
                          ) : null}
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="card empty-state">
                      <p>No materials posted for this subject yet.</p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="card empty-state">
              <h3>No subjects configured</h3>
              <p>Subjects for this semester will appear here once configured by faculty.</p>
            </div>
          )}

          {/* General materials not linked to any subject */}
          {generalMaterials.filter((m) => m.category !== "notification").length > 0 && (
            <div className="materials-section">
              <h3 className="materials-section-title">General Materials</h3>
              <div className="material-list">
                {generalMaterials
                  .filter((m) => m.category !== "notification")
                  .map((material) => (
                    <article className="card material-card" key={material._id}>
                      <div className="material-card-top">
                        <span>{categoryLabels[material.category]}</span>
                      </div>
                      <h3>{material.title}</h3>
                      <p>{material.description}</p>
                      {material.dueDate ? (
                        <small>Due: {new Date(material.dueDate).toLocaleDateString()}</small>
                      ) : null}
                      {material.link ? (
                        <a href={material.link} target="_blank" rel="noreferrer">
                          Open resource
                        </a>
                      ) : null}
                      {material.file?.url ? (
                        <a href={`${API_ORIGIN}${material.file.url}`} target="_blank" rel="noreferrer">
                          Download {material.file.originalName || "file"}
                        </a>
                      ) : null}
                    </article>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default Materials;
