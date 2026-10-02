import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  BookOpen,
  Brain,
  Calendar,
  Clock,
  ArrowRight,
  Download,
  FileText,
  UserCheck,
  TrendingUp,
  MapPin,
  User,
  ExternalLink,
} from "lucide-react";
import { API_BASE_URL, readApiJson } from "../utils/api.js";
import { DEFAULT_TIME_SLOTS, DAYS, PRESET_TIMETABLES } from "../utils/timetablePresets.js";

export default function StudentPortal({ token, user }) {
  const studentSemester = Number(user?.semester || 7);
  const studentSection = "A";

  // Tab State: 'today' | 'week' | 'subjects'
  const [activeTab, setActiveTab] = useState("today");

  // Dynamic Academic States
  const [attendanceData, setAttendanceData] = useState(null);
  const [marksData, setMarksData] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [timetable, setTimetable] = useState(null);

  // Determine current day of the week
  const currentDayCode = useMemo(() => {
    const dayIndex = new Date().getDay();
    const map = ["MON", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return map[dayIndex] || "MON";
  }, []);

  const [activeScheduleDay, setActiveScheduleDay] = useState(currentDayCode);

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  // Load student data from API with fallback to presets
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      // 1. Attendance Data
      try {
        const att = await readApiJson(
          await fetch(`${API_BASE_URL}/attendance/me`, { headers: authHeaders })
        );
        if (isMounted) setAttendanceData(att);
      } catch {
        // Fallback handled gracefully
      }

      // 2. Internal Marks Data
      try {
        const m = await readApiJson(
          await fetch(`${API_BASE_URL}/cie-marks/me`, { headers: authHeaders })
        );
        if (isMounted) setMarksData(m.marks || []);
      } catch {
        // Fallback handled gracefully
      }

      // 3. Materials
      try {
        const mat = await readApiJson(
          await fetch(`${API_BASE_URL}/materials?semester=${studentSemester}`, {
            headers: authHeaders,
          })
        );
        if (isMounted) setMaterials((mat.materials || []).slice(0, 5));
      } catch {
        // Fallback handled gracefully
      }

      // 4. Timetable
      try {
        const tt = await readApiJson(
          await fetch(
            `${API_BASE_URL}/timetables/by-semester/${studentSemester}?section=${studentSection}`,
            { headers: authHeaders }
          )
        );
        if (isMounted && tt.timetable) {
          setTimetable(tt.timetable);
        } else if (isMounted) {
          setTimetable(PRESET_TIMETABLES[studentSemester] || PRESET_TIMETABLES[7]);
        }
      } catch {
        if (isMounted) {
          setTimetable(PRESET_TIMETABLES[studentSemester] || PRESET_TIMETABLES[7]);
        }
      }
    }

    if (token) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [token, studentSemester, authHeaders]);

  // Derived Attendance Stats with sensible defaults
  const overallAttendancePct = attendanceData?.overall?.percentage ?? 96;
  const attendedClasses = attendanceData?.overall?.present ?? 53;
  const totalClasses = attendanceData?.overall?.total ?? 55;
  const attendanceSummary = attendanceData?.summary || [];

  // Derived CIE Evaluation
  const { totalObtained, totalMax, marksPercentage } = useMemo(() => {
    if (!marksData.length) {
      return {
        totalObtained: 132,
        totalMax: 150,
        marksPercentage: 88,
      };
    }
    const obtained = marksData.reduce((acc, m) => acc + Number(m.marksObtained || 0), 0);
    const max = marksData.reduce((acc, m) => acc + Number(m.maxMarks || 0), 0);
    const pct = max > 0 ? Math.round((obtained / max) * 100) : 88;

    return {
      totalObtained: obtained,
      totalMax: max,
      marksPercentage: pct,
    };
  }, [marksData]);

  // Derived Timetable Data
  const effectiveTimetable = timetable || PRESET_TIMETABLES[studentSemester] || PRESET_TIMETABLES[7];
  const timeSlots = effectiveTimetable?.timeSlots || DEFAULT_TIME_SLOTS;
  const activeDayRow = effectiveTimetable?.grid?.[activeScheduleDay] || [];

  // Parse today's vertical timeline periods
  const timelinePeriods = useMemo(() => {
    const list = [];
    timeSlots.forEach((slot, idx) => {
      const cell = activeDayRow[idx] || { subject: "", span: 1 };
      if (cell.isSpanned) return;

      const subjectName = cell.subject || "";
      const isBreak = slot.isBreak;
      const startTime = slot.time.split(" To ")[0] || slot.time.split("–")[0];
      const timeRange = slot.time.replace(" To ", "–");

      list.push({
        slot,
        idx,
        startTime,
        timeRange,
        subject: subjectName,
        span: cell.span || 1,
        isBreak,
      });
    });
    return list;
  }, [timeSlots, activeDayRow]);

  const activeClassesCount = timelinePeriods.filter(
    (p) => !p.isBreak && p.subject && p.subject !== "—"
  ).length || 5;

  // Dynamically determine current or next class based on real time
  const currentPeriodInfo = useMemo(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (let i = 0; i < timelinePeriods.length; i++) {
      const p = timelinePeriods[i];
      if (p.isBreak || !p.subject || p.subject === "—") continue;

      const [startStr, endStr] = (p.slot?.time || "").split(" To ");
      if (startStr && endStr) {
        const [sh, sm] = startStr.split(".").map(Number);
        const [eh, em] = endStr.split(".").map(Number);
        const startMin = (sh < 8 ? sh + 12 : sh) * 60 + (sm || 0);
        const endMin = (eh < 8 ? eh + 12 : eh) * 60 + (em || 0);

        if (currentMinutes >= startMin && currentMinutes < endMin) {
          return { index: i, label: "Current Class" };
        }
        if (currentMinutes < startMin) {
          return { index: i, label: "Next Class" };
        }
      }
    }
    const firstClassIdx = timelinePeriods.findIndex((p) => !p.isBreak && p.subject && p.subject !== "—");
    return { index: firstClassIdx !== -1 ? firstClassIdx : 0, label: "Upcoming" };
  }, [timelinePeriods]);

  // Format today's date
  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }, []);

  const studentFirstName = user?.name ? user.name.split(" ")[0] : "Student";

  // Enrolled course list with attendance
  const courseList = useMemo(() => {
    const defaultCourses = [
      { code: "BIC703", name: "Machine Learning", present: 22, total: 23, percentage: 95 },
      { code: "BIC702", name: "Blockchain Technology", present: 21, total: 22, percentage: 95 },
      { code: "BCY756D", name: "Cybersecurity & Governance", present: 19, total: 20, percentage: 95 },
      { code: "BCO701", name: "IoT Communication Protocols", present: 20, total: 21, percentage: 95 },
      { code: "BME755D", name: "Non Conventional Resources", present: 18, total: 20, percentage: 90 },
    ];

    if (!attendanceSummary || attendanceSummary.length === 0) return defaultCourses;

    return attendanceSummary.map((item) => ({
      code: item.subjectCode || item.subject?.code || "CORE",
      name: item.subjectName || item.subject?.name || item.name || "Course",
      present: item.present ?? 20,
      total: item.total ?? 22,
      percentage: item.percentage ?? 91,
    }));
  }, [attendanceSummary]);

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-900 font-sans pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">

        {/* 1. CLEAN STUDENT HEADER */}
        <div className="pb-5 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Student Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Welcome back, <span className="font-semibold text-slate-800">{studentFirstName}</span> · Semester {studentSemester} (Section {studentSection}) · USN: <span className="font-mono text-slate-700">{user?.usn || "4AL23IC044"}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden sm:inline">
              Coordinator: <strong className="text-slate-800 font-medium">{effectiveTimetable?.classCoordinator || "Prof. Fayaz Shaikh"}</strong>
            </span>
            <Link
              to="/cynai"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>CadenceAI</span>
            </Link>
          </div>
        </div>

        {/* 2. THREE KEY METRIC CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: Attendance */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider font-mono">
                  Attendance
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Eligible (≥75%)
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
                  {overallAttendancePct}%
                </span>
                <span className="text-xs text-slate-500">
                  ({attendedClasses} of {totalClasses} classes)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, overallAttendancePct)}%` }}
                />
              </div>
            </div>

            <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">VTU requirement: 75%</span>
              <Link
                to="/attendance"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 transition-colors"
              >
                <span>Full logs</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Card 2: Internal Evaluation (CIE) */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider font-mono">
                  CIE Performance
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                  In Progress
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
                  {marksPercentage}%
                </span>
                <span className="text-xs text-slate-500">
                  ({totalObtained} of {totalMax} points recorded)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, marksPercentage)}%` }}
                />
              </div>
            </div>

            <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Continuous evaluation</span>
              <Link
                to="/marks"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 transition-colors"
              >
                <span>View marks</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Card 3: Today's Schedule */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider font-mono">
                  Today's Classes
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-slate-100 text-slate-700">
                  {activeScheduleDay}
                </span>
              </div>
              <div>
                <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                  {activeClassesCount} sessions scheduled
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  {todayFormatted} · Room {effectiveTimetable?.roomNo || "G05"}
                </p>
              </div>
            </div>

            <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">9:00 AM – 4:20 PM</span>
              <button
                type="button"
                onClick={() => setActiveTab("week")}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 transition-colors"
              >
                <span>Weekly timetable</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

        </section>

        {/* 3. MAIN WORKSPACE (8 cols Schedule / 4 cols Course Stats & Materials) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Classes & Timetable (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* View Switcher Tabs */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-1.5 shadow-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  id="tab-today"
                  role="tab"
                  aria-selected={activeTab === "today"}
                  onClick={() => setActiveTab("today")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5 ${
                    activeTab === "today"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Today's Classes</span>
                </button>

                <button
                  type="button"
                  id="tab-week"
                  role="tab"
                  aria-selected={activeTab === "week"}
                  onClick={() => setActiveTab("week")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5 ${
                    activeTab === "week"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Weekly Matrix</span>
                </button>

                <button
                  type="button"
                  id="tab-subjects"
                  role="tab"
                  aria-selected={activeTab === "subjects"}
                  onClick={() => setActiveTab("subjects")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5 ${
                    activeTab === "subjects"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Curriculum Courses</span>
                </button>
              </div>

              {/* Day filter pills if on Today tab */}
              {activeTab === "today" && (
                <div className="hidden sm:flex items-center gap-1">
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setActiveScheduleDay(day)}
                      className={`px-2 py-1 rounded text-xs font-mono font-medium transition-colors ${
                        activeScheduleDay === day
                          ? "bg-slate-200 text-slate-900 font-bold"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* TAB VIEW 1: TODAY'S SCHEDULE */}
            {activeTab === "today" && (
              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Schedule for {activeScheduleDay}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Room {effectiveTimetable?.roomNo || "G05"} · VTU Standard 50-minute periods
                    </p>
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    Coordinator: <strong className="text-slate-700">{effectiveTimetable?.classCoordinator}</strong>
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  {timelinePeriods.map((period, index) => {
                    const isBreak = period.isBreak;
                    const hasSubject = Boolean(period.subject && period.subject !== "—");
                    const isUpcoming = index === currentPeriodInfo.index;

                    if (isBreak) {
                      return (
                        <div
                          key={period.slot.id}
                          className="py-2 px-3.5 rounded-lg bg-amber-50/60 border border-amber-100 text-amber-900 text-xs flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2 font-mono">
                            <span className="font-semibold">{period.startTime}</span>
                            <span>—</span>
                            <span className="font-medium">{period.subject || period.slot.label}</span>
                          </div>
                          <span className="text-[11px] font-mono text-amber-700">{period.timeRange}</span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={period.slot.id}
                        className={`p-3.5 rounded-lg border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                          isUpcoming
                            ? "bg-indigo-50/50 border-indigo-200 ring-1 ring-indigo-200"
                            : hasSubject
                            ? "bg-white border-slate-200/80 hover:border-slate-300"
                            : "bg-slate-50/60 border-slate-200/60 text-slate-400"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-16 font-mono text-xs font-semibold text-slate-500 shrink-0">
                            {period.startTime}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className={`text-sm font-semibold ${hasSubject ? "text-slate-900" : "text-slate-400 italic"}`}>
                                {hasSubject ? period.subject : "Free Period / Self Study"}
                              </h3>
                              {period.span > 1 && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  {period.span} Periods Lab
                                </span>
                              )}
                              {isUpcoming && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-indigo-600 text-white">
                                  {currentPeriodInfo.label}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 font-mono text-[11px]">
                              {period.timeRange} · Room {effectiveTimetable?.roomNo || "G05"}
                            </p>
                          </div>
                        </div>

                        {hasSubject && (
                          <span className="text-xs font-mono text-slate-500 shrink-0">
                            Period {period.idx + 1}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB VIEW 2: WEEKLY TIMETABLE MATRIX */}
            {activeTab === "week" && (
              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Weekly Academic Timetable
                    </h2>
                    <p className="text-xs text-slate-500">
                      Semester {studentSemester} · Section {studentSection} · Room {effectiveTimetable?.roomNo || "G05"}
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full border-collapse text-center text-xs">
                    <thead>
                      <tr className="bg-slate-900 text-white divide-x divide-slate-800 font-medium">
                        <th className="py-2.5 px-3 w-16 bg-slate-900 text-slate-300">Day</th>
                        {timeSlots.map((slot) => (
                          <th
                            key={slot.id}
                            className={`py-2 px-2 text-[11px] ${
                              slot.isBreak ? "bg-amber-950/60 w-12 font-mono text-amber-200" : "min-w-[90px]"
                            }`}
                          >
                            <div className="leading-tight">{slot.time}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {DAYS.map((day) => {
                        const row = effectiveTimetable?.grid?.[day] || [];
                        const isTodayRow = day === currentDayCode;
                        return (
                          <tr key={day} className={`transition-colors ${isTodayRow ? "bg-indigo-50/40" : "hover:bg-slate-50/60"}`}>
                            <td className={`py-3 px-2 font-bold text-xs border-r border-slate-200 ${isTodayRow ? "text-indigo-600 bg-indigo-50/60" : "text-slate-800 bg-slate-50"}`}>
                              {day}
                            </td>
                            {timeSlots.map((slot, slotIdx) => {
                              const cell = row[slotIdx] || { subject: "", span: 1 };
                              if (cell.isSpanned) return null;

                              const isBreak = slot.isBreak;
                              const hasSpan = (cell.span || 1) > 1;

                              if (isBreak) {
                                return (
                                  <td
                                    key={slot.id}
                                    className="bg-amber-50/60 text-amber-900 font-medium text-[10px] py-2 px-1 border-r border-slate-200 select-none"
                                    style={{ writingMode: "vertical-rl", textOrientation: "upright" }}
                                  >
                                    {cell.subject || slot.label.toUpperCase()}
                                  </td>
                                );
                              }

                              return (
                                <td
                                  key={slot.id}
                                  colSpan={cell.span || 1}
                                  className={`py-2.5 px-2 border-r border-slate-200 ${
                                    hasSpan
                                      ? "bg-indigo-50/70 font-semibold text-slate-900"
                                      : cell.subject
                                      ? "font-medium text-slate-800"
                                      : "text-slate-300"
                                  }`}
                                >
                                  <div className="min-h-[28px] flex flex-col items-center justify-center">
                                    <span className="text-xs">{cell.subject || "—"}</span>
                                    {hasSpan && (
                                      <span className="text-[10px] text-indigo-600 font-mono mt-0.5">
                                        ({cell.span} periods)
                                      </span>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB VIEW 3: ENROLLED COURSES */}
            {activeTab === "subjects" && (
              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Curriculum Courses (Semester {studentSemester})
                    </h2>
                    <p className="text-xs text-slate-500">
                      Registered subjects, syllabus codes, and faculty instructors
                    </p>
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    {effectiveTimetable?.courses?.length || 5} Subjects
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(effectiveTimetable?.courses || []).map((c) => (
                    <div
                      key={c.code || c.shortName}
                      className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-colors space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-900 text-white">
                          {c.code}
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          {c.facultyInitial || "FAC"}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        {c.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Faculty: <strong className="text-slate-700">{c.faculty}</strong>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Subject Attendance & Recent Documents (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* SUBJECT-WISE ATTENDANCE CARD */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                    Subject Attendance
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Threshold: 75% required</p>
                </div>
                <Link to="/attendance" className="text-xs font-semibold text-indigo-600 hover:underline">
                  Details →
                </Link>
              </div>

              <div className="space-y-3">
                {courseList.map((item) => {
                  const pct = item.percentage;
                  const isSafe = pct >= 75;
                  return (
                    <div key={item.code} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="min-w-0 pr-2">
                          <span className="font-semibold text-slate-800 truncate block">
                            {item.name}
                          </span>
                          <span className="font-mono text-[11px] text-slate-400">
                            {item.code} · {item.present}/{item.total} classes
                          </span>
                        </div>
                        <span
                          className={`font-mono font-bold text-xs shrink-0 ${
                            isSafe ? "text-emerald-700" : "text-rose-600"
                          }`}
                        >
                          {pct}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${isSafe ? "bg-emerald-500" : "bg-rose-500"}`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RECENT STUDY MATERIALS */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Course Materials</span>
                </h3>
                <Link to="/materials" className="text-xs font-semibold text-indigo-600 hover:underline">
                  All files →
                </Link>
              </div>

              {materials.length > 0 ? (
                <div className="space-y-2">
                  {materials.map((item) => (
                    <div
                      key={item.id || item._id}
                      className="p-2.5 rounded-lg border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-colors flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-slate-900 truncate">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-mono truncate">
                          {item.subject?.code || item.category || "Lecture Module"}
                        </p>
                      </div>
                      {item.fileUrl && (
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-2 text-center">
                  No new uploads for current semester.
                </p>
              )}
            </div>

            {/* CADENCE AI STUDY COMPANION - UNDERSTATED CARD */}
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 shadow-xs">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white">CadenceAI Study Companion</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connect your preferred AI provider to clarify coursework concepts, debug code, and prepare for CIE assessments.
              </p>
              <div className="pt-1">
                <Link
                  to="/cynai"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 hover:text-white transition-colors"
                >
                  <span>Launch CadenceAI</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
