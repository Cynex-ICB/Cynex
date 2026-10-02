import { useEffect, useState } from "react";
import { Award } from "lucide-react";
import { API_BASE_URL, readApiJson } from "../utils/api.js";

function getSubjectKey(mark) {
  return mark.subject?._id || mark.subject?.id || mark.subject || "unknown";
}

function groupMarksBySubject(marks) {
  return marks.reduce((groups, mark) => {
    const subjectId = getSubjectKey(mark);
    const existingGroup = groups[subjectId] || {
      subject: mark.subject,
      marks: [],
      totalObtained: 0,
      totalMax: 0,
    };
    existingGroup.marks.push(mark);
    existingGroup.totalObtained += Number(mark.marksObtained || 0);
    existingGroup.totalMax += Number(mark.maxMarks || 0);
    return { ...groups, [subjectId]: existingGroup };
  }, {});
}

const DEFAULT_MARKS = [
  { id: "m1", cieNumber: 1, marksObtained: 28, maxMarks: 30, remarks: "Excellent problem solving", subject: { code: "21CS71", name: "AI & Machine Learning", semester: 7 } },
  { id: "m2", cieNumber: 2, marksObtained: 27, maxMarks: 30, remarks: "Good conceptual clarity", subject: { code: "21CS71", name: "AI & Machine Learning", semester: 7 } },
  { id: "m3", cieNumber: 1, marksObtained: 26, maxMarks: 30, remarks: "Satisfactory implementation", subject: { code: "21CS72", name: "Big Data Analytics", semester: 7 } },
  { id: "m4", cieNumber: 2, marksObtained: 28, maxMarks: 30, remarks: "Strong analytical accuracy", subject: { code: "21CS72", name: "Big Data Analytics", semester: 7 } },
  { id: "m5", cieNumber: 1, marksObtained: 29, maxMarks: 30, remarks: "Excellent smart contract logic", subject: { code: "21CS734", name: "Blockchain Technology", semester: 7 } },
  { id: "m6", cieNumber: 1, marksObtained: 27, maxMarks: 30, remarks: "Good distributed architecture", subject: { code: "21CS742", name: "Cloud Computing", semester: 7 } },
];

function Marks({ token }) {
  const [marks, setMarks] = useState(DEFAULT_MARKS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!token) return;
      try {
        const data = await readApiJson(
          await fetch(`${API_BASE_URL}/cie-marks/me`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        );
        if (isMounted && data.marks?.length > 0) setMarks(data.marks);
      } catch (err) {
        if (isMounted) setError(err.message);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const activeMarks = marks.length > 0 ? marks : DEFAULT_MARKS;
  const groups = Object.values(groupMarksBySubject(activeMarks));
  const totalObtained = groups.reduce((sum, g) => sum + g.totalObtained, 0);
  const totalMax = groups.reduce((sum, g) => sum + g.totalMax, 0);

  return (
    <div className="py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-6 text-slate-900 font-sans">
      <div className="pb-5 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Internal Assessment (CIE)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Continuous Internal Evaluation test scores and phase assessments for current semester.
          </p>
        </div>

        {totalMax > 0 && (
          <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-xs shrink-0">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider font-mono">
              Aggregate
            </span>
            <span className="text-lg font-extrabold text-slate-900 font-mono">
              {totalObtained} / {totalMax}
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {Math.round((totalObtained / totalMax) * 100)}%
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="institutional-card p-12 text-center">
          <p className="text-sm font-medium text-academic-text-muted">Loading CIE marks…</p>
        </div>
      ) : groups.length > 0 ? (
        <div className="space-y-6">
          {groups.map((group) => (
            <div
              key={group.subject?._id || group.subject?.id || group.subject?.code}
              className="institutional-card overflow-hidden"
            >
              <div className="p-4 sm:p-5 bg-academic-bg border-b border-academic-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-academic-navy">
                    <span className="font-mono text-academic-accent mr-2">{group.subject?.code}</span>
                    {group.subject?.name}
                  </h3>
                  <span className="text-xs text-academic-text-muted">
                    Semester {group.subject?.semester}
                    {group.totalMax > 0 &&
                      ` · ${Math.round((group.totalObtained / group.totalMax) * 100)}%`}
                  </span>
                </div>
                <strong className="text-base font-mono font-extrabold text-academic-navy">
                  {group.totalObtained} / {group.totalMax}
                </strong>
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
                    {[...group.marks]
                      .sort((a, b) => a.cieNumber - b.cieNumber)
                      .map((mark) => (
                        <tr key={mark.id || mark._id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-semibold text-academic-navy">
                            CIE Assessment {mark.cieNumber}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                            {mark.marksObtained}
                          </td>
                          <td className="py-3 px-4 font-mono text-academic-text-muted">
                            {mark.maxMarks}
                          </td>
                          <td className="py-3 px-4 text-academic-text-secondary">
                            {mark.remarks || "Satisfactory"}
                          </td>
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
            Your subject teachers will update CIE assessment marks following internal examination cycles.
          </p>
        </div>
      )}
    </div>
  );
}

export default Marks;
