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

function Marks({ token }) {
  const [marks, setMarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
        if (isMounted) setMarks(data.marks || []);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const groups = Object.values(groupMarksBySubject(marks));
  const totalObtained = groups.reduce((sum, g) => sum + g.totalObtained, 0);
  const totalMax = groups.reduce((sum, g) => sum + g.totalMax, 0);

  return (
    <div className="py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-8 text-academic-text">
      <section className="page-hero">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-academic-navy text-white text-xs font-mono font-semibold uppercase tracking-wider mb-3">
            <Award className="w-3.5 h-3.5 text-academic-gold-light" />
            <span>Academic Performance Record</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-academic-navy tracking-tight">
            CIE Marks
          </h1>
          <p className="text-sm sm:text-base text-academic-text-secondary mt-2 leading-relaxed">
            Continuous Internal Evaluation scores across all subjects and assessment phases.
            {totalMax > 0 && (
              <>
                {" "}Overall:{" "}
                <strong className="text-academic-navy">
                  {totalObtained} / {totalMax} ({Math.round((totalObtained / totalMax) * 100)}%)
                </strong>
              </>
            )}
          </p>
        </div>
      </section>

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
