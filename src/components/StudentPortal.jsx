import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Award, BookOpen, Brain, GraduationCap, User, UserCheck } from "lucide-react";
import { API_BASE_URL, readApiJson } from "../utils/api.js";

const tiles = [
  {
    to: "/materials",
    icon: BookOpen,
    title: "Study Materials",
    description: "Syllabus, lecture notes, assignments and lab manuals for your semester.",
    accent: "bg-blue-50 text-blue-800",
  },
  {
    to: "/cynai",
    icon: Brain,
    title: "CynAI",
    description: "Your AI study companion for exam prep and VTU syllabus doubts.",
    accent: "bg-violet-50 text-violet-800",
  },
  {
    to: "/marks",
    icon: Award,
    title: "Marks",
    description: "CIE test scores across all subjects and evaluation phases.",
    accent: "bg-amber-50 text-amber-800",
  },
  {
    to: "/attendance",
    icon: UserCheck,
    title: "Attendance",
    description: "Subject-wise attendance percentage and daily records.",
    accent: "bg-emerald-50 text-emerald-800",
  },
  {
    to: "/profile",
    icon: User,
    title: "My Profile",
    description: "Academic identity, USN, mentor and coordinator details.",
    accent: "bg-slate-100 text-slate-700",
  },
];

function StudentPortal({ token, user }) {
  const [attendancePct, setAttendancePct] = useState(null);
  const [marksAvg, setMarksAvg] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const attendance = await readApiJson(
          await fetch(`${API_BASE_URL}/attendance/me`, { headers })
        );
        if (isMounted) setAttendancePct(attendance.overall?.percentage ?? null);
      } catch {
        // stats stay hidden
      }
      try {
        const marksData = await readApiJson(
          await fetch(`${API_BASE_URL}/cie-marks/me`, { headers })
        );
        const marks = marksData.marks || [];
        const obtained = marks.reduce((sum, m) => sum + Number(m.marksObtained || 0), 0);
        const max = marks.reduce((sum, m) => sum + Number(m.maxMarks || 0), 0);
        if (isMounted) setMarksAvg(max > 0 ? Math.round((obtained / max) * 100) : null);
      } catch {
        // stats stay hidden
      }
    }
    loadStats();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const stats = { Attendance: attendancePct, Marks: marksAvg };

  return (
    <div className="py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-8 text-academic-text">
      <section className="page-hero">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-academic-navy text-white text-xs font-mono font-semibold uppercase tracking-wider mb-3">
            <GraduationCap className="w-3.5 h-3.5 text-academic-gold-light" />
            <span>Student Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-academic-navy tracking-tight">
            Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""} 👋
          </h1>
          <p className="text-sm sm:text-base text-academic-text-secondary mt-2 leading-relaxed">
            {user?.usn ? `${user.usn} · ` : ""}Semester {user?.semester || "—"} · Everything
            academic in one place — materials, marks, attendance and CynAI.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiles.map(({ to, icon: Icon, title, description, accent }) => (
          <Link
            key={to}
            to={to}
            className="institutional-card-hover p-6 flex flex-col gap-3"
          >
            <span className={`inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold ${accent}`}>
              <Icon className="w-4 h-4" />
              {title}
            </span>
            <p className="text-sm text-academic-text-secondary leading-relaxed">{description}</p>
            {stats[title] !== undefined && stats[title] !== null && (
              <strong className="text-2xl font-extrabold text-academic-navy mt-auto">
                {stats[title]}%
                <span className="block text-[11px] font-mono font-semibold text-academic-text-muted uppercase">
                  {title === "Attendance" ? "Overall attendance" : "CIE average"}
                </span>
              </strong>
            )}
            <span className="text-xs font-bold text-academic-accent mt-auto">
              Open {title} →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default StudentPortal;
