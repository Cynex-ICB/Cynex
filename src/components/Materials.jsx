import { useEffect, useState } from "react";
import { BookOpen, Download, FileText, Calendar, ExternalLink, Filter, AlertCircle } from "lucide-react";
import { API_BASE_URL, downloadApiFile, readApiJson } from "../utils/api.js";

const categoryLabels = {
  assignment: "Assignment",
  note: "Lecture Note",
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

  const downloadMaterialFile = async (material) => {
    try {
      await downloadApiFile(
        `${API_BASE_URL}/materials/${material._id}/file`,
        token,
        material.file?.originalName || "material-file"
      );
    } catch (error) {
      console.error(error);
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
    <div className="py-12 px-4 sm:px-6 max-w-7xl mx-auto space-y-12 text-academic-text">
      
      {/* Header Banner */}
      <section className="page-hero">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-academic-navy text-white text-xs font-mono font-semibold uppercase tracking-wider mb-3">
            <BookOpen className="w-3.5 h-3.5 text-academic-gold-light" />
            <span>Academic Curriculum Repository</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-academic-navy tracking-tight">
            Study Materials, Syllabus &amp; Lab Manuals
          </h1>
          <p className="text-sm sm:text-base text-academic-text-secondary mt-2 leading-relaxed">
            Authorized VTU CBCS syllabus copies, lecture courseware, assignment problems, and laboratory procedure manuals for Department of CSE (ICB).
          </p>
        </div>
      </section>

      {/* Semester Controls */}
      <div className="institutional-card p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-academic-navy">
          <Filter className="w-4 h-4 text-academic-accent" />
          <span>Curriculum Filtering:</span>
        </div>

        {isAdmin ? (
          <div className="flex items-center gap-3">
            <label htmlFor="sem-select" className="text-xs font-medium text-academic-text-secondary">
              Select Semester:
            </label>
            <select
              id="sem-select"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-3 py-1.5 rounded border border-academic-border bg-white text-xs font-semibold text-academic-navy focus:outline-none focus:ring-2 focus:ring-academic-navy/20"
            >
              {semesterOptions.map((semester) => (
                <option key={semester} value={semester}>
                  Semester {semester}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
            <span>Enrolled Semester:</span>
            <strong className="text-academic-navy font-bold">Semester {studentSemester}</strong>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="institutional-card p-12 text-center">
          <p className="text-sm font-medium text-academic-text-muted">Loading semester curriculum resources...</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Notifications Section */}
          {generalMaterials.some((m) => m.category === "notification") && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-academic-navy border-b border-academic-border pb-2">
                Semester Notifications &amp; Circulars
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generalMaterials
                  .filter((m) => m.category === "notification")
                  .map((material) => (
                    <article className="institutional-card p-5 space-y-2 border-l-4 border-l-academic-accent" key={material._id}>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-800 uppercase">
                        {categoryLabels[material.category]}
                      </span>
                      <h3 className="text-base font-bold text-academic-navy">{material.title}</h3>
                      <p className="text-xs text-academic-text-secondary leading-relaxed">{material.description}</p>
                      {material.link && (
                        <a
                          href={material.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-academic-accent hover:underline pt-2"
                        >
                          <span>Open external link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
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
                <div className="space-y-4" key={subject._id}>
                  <div className="border-b border-academic-border pb-2 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <h2 className="text-lg font-bold text-academic-navy">
                      <span className="font-mono text-academic-accent mr-2">{subject.code}</span>
                      {subject.name}
                    </h2>
                    {subject.instructor && (
                      <span className="text-xs text-academic-text-muted">
                        Course Instructor: <strong className="text-academic-navy font-semibold">{subject.instructor}</strong>
                      </span>
                    )}
                  </div>

                  {subjectMaterials.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {subjectMaterials.map((material) => (
                        <article className="institutional-card p-5 flex flex-col justify-between" key={material._id}>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                                {categoryLabels[material.category] || "Material"}
                              </span>
                              {material.dueDate && (
                                <span className="text-[11px] font-mono text-amber-700 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>Due: {new Date(material.dueDate).toLocaleDateString()}</span>
                                </span>
                              )}
                            </div>

                            <h3 className="text-sm font-bold text-academic-navy">{material.title}</h3>
                            <p className="text-xs text-academic-text-secondary leading-relaxed">{material.description}</p>
                          </div>

                          <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
                            {material.link && (
                              <a
                                href={material.link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-academic-accent hover:underline block"
                              >
                                <span>Open Resource URL</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {material.file?.url && (
                              <button
                                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-academic-navy hover:bg-academic-navy-light text-white text-xs font-semibold transition-colors"
                                type="button"
                                onClick={() => downloadMaterialFile(material)}
                              >
                                <Download className="w-3.5 h-3.5 text-academic-gold-light" />
                                <span>Download {material.file.originalName || "Document"}</span>
                              </button>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-md bg-white border border-academic-border text-center">
                      <p className="text-xs text-academic-text-muted">No materials posted for this course module yet.</p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="institutional-card p-8 text-center space-y-2">
              <h3 className="text-base font-bold text-academic-navy">No Subjects Configured for Semester {visibleSemester}</h3>
              <p className="text-xs text-academic-text-muted">Faculty administrators will upload course schemas and materials prior to session commencement.</p>
            </div>
          )}

          {/* General non-subject materials */}
          {generalMaterials.filter((m) => m.category !== "notification").length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-academic-navy border-b border-academic-border pb-2">
                General Academic References
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generalMaterials
                  .filter((m) => m.category !== "notification")
                  .map((material) => (
                    <article className="institutional-card p-5 flex flex-col justify-between" key={material._id}>
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                          {categoryLabels[material.category]}
                        </span>
                        <h3 className="text-sm font-bold text-academic-navy">{material.title}</h3>
                        <p className="text-xs text-academic-text-secondary">{material.description}</p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-100">
                        {material.file?.url && (
                          <button
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-academic-navy hover:bg-academic-navy-light text-white text-xs font-semibold"
                            type="button"
                            onClick={() => downloadMaterialFile(material)}
                          >
                            <Download className="w-3.5 h-3.5 text-academic-gold-light" />
                            <span>Download {material.file.originalName || "File"}</span>
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default Materials;

