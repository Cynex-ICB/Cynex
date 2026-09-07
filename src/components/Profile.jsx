import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { GraduationCap, Award, BookOpen, User, Mail, Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { API_BASE_URL, readApiJson } from "../utils/api.js";

function profileValue(value) {
  return value ? value : "Not assigned yet";
}

function formatSemesterList(semesters = []) {
  const uniqueSemesters = Array.from(new Set(semesters))
    .map(Number)
    .filter(Boolean)
    .sort((first, second) => first - second);

  return uniqueSemesters.length
    ? uniqueSemesters.map((semester) => `Semester ${semester}`).join(", ")
    : "Not assigned yet";
}

function formatMentorRanges(assignments = []) {
  return assignments.length
    ? assignments.map((assignment) => `${assignment.startUsn} to ${assignment.endUsn}`).join(", ")
    : "Not assigned yet";
}

function groupMarksBySubject(marks) {
  return marks.reduce((groups, mark) => {
    const subjectId = mark.subject?._id || mark.subject?.id || "unknown";
    const existingGroup = groups[subjectId] || {
      subject: mark.subject,
      marks: [],
      totalObtained: 0,
      totalMax: 0,
    };

    existingGroup.marks.push(mark);
    existingGroup.totalObtained += Number(mark.marksObtained || 0);
    existingGroup.totalMax += Number(mark.maxMarks || 0);

    return {
      ...groups,
      [subjectId]: existingGroup,
    };
  }, {});
}

function Profile({ token, user, onUserUpdate }) {
  const [profile, setProfile] = useState(user);
  const [cieMarks, setCieMarks] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      if (!token) return;

      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await readApiJson(response);

        if (isMounted) {
          setProfile(data.user);
          onUserUpdate?.(data.user);
        }

        if (data.user?.role === "student") {
          const marksData = await readApiJson(
            await fetch(`${API_BASE_URL}/cie-marks/me`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
          );

          if (isMounted) {
            setCieMarks(marksData.marks || []);
          }
        }

      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [token, onUserUpdate]);

  const isTeacher = ["admin", "master-admin"].includes(profile?.role);
  const marksBySubject = Object.values(groupMarksBySubject(cieMarks));

  if (isTeacher) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="py-12 px-4 sm:px-6 max-w-7xl mx-auto space-y-12 text-academic-text">
      
      {/* Header Banner */}
      <section className="page-hero">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-academic-navy text-white text-xs font-mono font-semibold uppercase tracking-wider mb-3">
            <GraduationCap className="w-3.5 h-3.5 text-academic-gold-light" />
            <span>Academic Performance Record</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-academic-navy tracking-tight">
            Student CIE Portal &amp; Academic Identity
          </h1>
          <p className="text-sm sm:text-base text-academic-text-secondary mt-2 leading-relaxed">
            Continuous Internal Evaluation (CIE) test scores, attendance proctoring, class coordinator allocation, and student profile.
          </p>
        </div>
      </section>

      {/* Account / Student Card */}
      <div className="institutional-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-academic-border pb-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-academic-navy text-academic-gold-light font-extrabold text-xl flex items-center justify-center border-2 border-academic-gold/30">
              {profile?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-academic-navy">{profile?.name || "Student"}</h2>
              <p className="text-xs font-mono text-academic-text-muted mt-0.5">{profile?.collegeEmail}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-6 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-academic-text-muted uppercase tracking-wider block">Official Name</span>
            <p className="text-sm font-semibold text-academic-navy">{profile?.name || "Unavailable"}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-mono text-academic-text-muted uppercase tracking-wider block">Institutional Email</span>
            <p className="text-sm font-mono text-academic-navy">{profile?.collegeEmail || "Unavailable"}</p>
          </div>

            <>
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-academic-text-muted uppercase tracking-wider block">University Seat Number (USN)</span>
                <p className="text-sm font-mono font-bold text-academic-navy">{profile?.usn || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-academic-text-muted uppercase tracking-wider block">Enrolled Semester</span>
                <p className="text-sm font-semibold text-academic-navy">Semester {profile?.semester || 3}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-academic-text-muted uppercase tracking-wider block">Class Coordinator</span>
                <p className="text-sm font-semibold text-academic-navy">{profileValue(profile?.classCoordinatorName)}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-academic-text-muted uppercase tracking-wider block">Faculty Proctor / Mentor</span>
                <p className="text-sm font-semibold text-academic-navy">{profileValue(profile?.mentorName)}</p>
              </div>
            </>
        </div>
      </div>

      {/* CIE Marks Subject-wise Tables */}
        <div className="space-y-6">
          <div className="border-b border-academic-border pb-3">
            <span className="text-xs font-mono font-semibold text-academic-gold-dark uppercase tracking-wider block">
              Continuous Assessment
            </span>
            <h2 className="text-2xl font-bold text-academic-navy mt-0.5">
              Continuous Internal Evaluation (CIE) Marks
            </h2>
            <p className="text-xs sm:text-sm text-academic-text-muted">
              Official theory assessment scores and laboratory internal marks recorded by course instructors
            </p>
          </div>

          {marksBySubject.length > 0 ? (
            <div className="space-y-6">
              {marksBySubject.map((group) => (
                <div key={group.subject?._id || group.subject?.code} className="institutional-card overflow-hidden">
                  <div className="p-4 sm:p-5 bg-academic-bg border-b border-academic-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-academic-navy">
                        <span className="font-mono text-academic-accent mr-2">{group.subject?.code}</span>
                        {group.subject?.name}
                      </h3>
                      <span className="text-xs text-academic-text-muted">
                        Semester {group.subject?.semester || profile?.semester}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-academic-text-muted block">Cumulative Score</span>
                      <strong className="text-base font-mono font-extrabold text-academic-navy">
                        {group.totalObtained} / {group.totalMax}
                      </strong>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-academic-border text-academic-text-muted font-mono uppercase text-[11px]">
                        <tr>
                          <th className="py-3 px-4">Evaluation Phase</th>
                          <th className="py-3 px-4">Marks Obtained</th>
                          <th className="py-3 px-4">Maximum Marks</th>
                          <th className="py-3 px-4">Instructor Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-academic-border">
                        {group.marks
                          .sort((first, second) => first.cieNumber - second.cieNumber)
                          .map((mark) => (
                            <tr key={mark.id} className="hover:bg-slate-50/50">
                              <td className="py-3 px-4 font-semibold text-academic-navy">CIE Assessment {mark.cieNumber}</td>
                              <td className="py-3 px-4 font-mono font-bold text-emerald-700">{mark.marksObtained}</td>
                              <td className="py-3 px-4 font-mono text-academic-text-muted">{mark.maxMarks}</td>
                              <td className="py-3 px-4 text-academic-text-secondary">{mark.remarks || "Satisfactory"}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="institutional-card p-10 text-center space-y-2">
              <h3 className="text-base font-bold text-academic-navy">No Internal Assessment Marks Published</h3>
              <p className="text-xs text-academic-text-muted">
                Your subject teachers will update CIE assessment marks following proctored internal examination cycles.
              </p>
            </div>
          )}
        </div>

    </div>
  );
}

export default Profile;

