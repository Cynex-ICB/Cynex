import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Award,
  BookOpen,
  Brain,
  GraduationCap,
  User,
  UserCheck,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  Download,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Building,
  Mail,
  TrendingUp,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Layers,
  Send,
  MessageSquare,
  BookmarkCheck,
  HelpCircle,
  FileCheck,
} from "lucide-react";
import { API_BASE_URL, readApiJson } from "../utils/api.js";
import { DEFAULT_TIME_SLOTS, DAYS, PRESET_TIMETABLES } from "../utils/timetablePresets.js";

// Circular Attendance Progress Gauge
function CircularAttendanceGauge({ percentage = 96, size = 76, strokeWidth = 6.5 }) {
  const validPct = typeof percentage === "number" && !isNaN(percentage) ? Math.min(100, Math.max(0, percentage)) : 96;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (validPct / 100) * circumference;
  const isHealthy = validPct >= 75;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F1F5F9"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isHealthy ? "#10B981" : "#EF4444"}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-base font-black font-mono text-[#0F172A] tracking-tight">
          {validPct}%
        </span>
      </div>
    </div>
  );
}

// Circular Score Ring for CIE Evaluation
function CircularScoreGauge({ percentage = 88, size = 76, strokeWidth = 6.5 }) {
  const validPct = typeof percentage === "number" && !isNaN(percentage) ? Math.min(100, Math.max(0, percentage)) : 88;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (validPct / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F1F5F9"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#6366F1"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-base font-black font-mono text-[#0F172A] tracking-tight">
          {validPct}%
        </span>
      </div>
    </div>
  );
}

const CYAI_SUGGESTED_PROMPTS = [
  "Explain Dijkstra's algorithm",
  "Help me prepare for CIE",
  "Explain OS paging",
  "IoT communication protocols",
];

function getDynamicGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function StudentPortal({ token, user }) {
  const navigate = useNavigate();
  const studentSemester = Number(user?.semester || 7);
  const studentSection = "A";

  // Tab State: 'today' | 'week' | 'subjects' | 'attendance'
  const [activeTab, setActiveTab] = useState("today");

  // Dynamic Academic States
  const [attendanceData, setAttendanceData] = useState(null);
  const [marksData, setMarksData] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [timetable, setTimetable] = useState(null);
  const [cynaiInput, setCynaiInput] = useState("");

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
        if (isMounted) setMaterials((mat.materials || []).slice(0, 4));
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
  const { totalObtained, totalMax, marksPercentage, subjectMarksGroups } = useMemo(() => {
    if (!marksData.length) {
      return {
        totalObtained: 132,
        totalMax: 150,
        marksPercentage: 88,
        subjectMarksGroups: [],
      };
    }
    const obtained = marksData.reduce((acc, m) => acc + Number(m.marksObtained || 0), 0);
    const max = marksData.reduce((acc, m) => acc + Number(m.maxMarks || 0), 0);
    const pct = max > 0 ? Math.round((obtained / max) * 100) : 88;

    const groups = {};
    marksData.forEach((m) => {
      const code = m.subject?.code || m.subjectCode || "CORE";
      const name = m.subject?.name || m.subjectName || code;
      if (!groups[code]) {
        groups[code] = { code, name, obtained: 0, max: 0, count: 0 };
      }
      groups[code].obtained += Number(m.marksObtained || 0);
      groups[code].max += Number(m.maxMarks || 0);
      groups[code].count += 1;
    });

    return {
      totalObtained: obtained,
      totalMax: max,
      marksPercentage: pct,
      subjectMarksGroups: Object.values(groups),
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
    return { index: firstClassIdx !== -1 ? firstClassIdx : 0, label: "Next Scheduled Class" };
  }, [timelinePeriods]);

  // Format today's date
  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }, []);

  const studentFirstName = user?.name ? user.name.split(" ")[0] : "Santhosh";

  // Handle CyAI query submit
  const handleCyAISubmit = (e) => {
    e?.preventDefault();
    if (!cynaiInput.trim()) return;
    navigate(`/cynai?q=${encodeURIComponent(cynaiInput.trim())}`);
  };

  const handlePromptClick = (text) => {
    navigate(`/cynai?q=${encodeURIComponent(text)}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">

        {/* 1. COMPACT STUDENT HEADER (Modern SaaS Profile Summary) */}
        <section className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
              {getDynamicGreeting()}, {studentFirstName} 👋
            </h1>
            <p className="text-sm text-[#64748B]">
              Here's your academic overview for today.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#64748B]">
              <span className="font-semibold text-[#0F172A]">
                Semester {studentSemester} · Section {studentSection}
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-slate-600">
                USN: <strong className="text-[#0F172A] font-semibold">{user?.usn || "4AL23IC044"}</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600">
                Coordinator: <strong className="text-[#0F172A] font-semibold">{effectiveTimetable?.classCoordinator || "Prof. Fayaz Shaikh"}</strong>
              </span>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Link
              to="/cynai"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Ask CyAI</span>
            </Link>
          </div>
        </section>

        {/* 2. TOP OVERVIEW CARDS (Responsive 3 Equal-Height Columns) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          
          {/* Card 1 — Attendance */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider font-mono">
                  Attendance
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#10B981] border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  <span>Eligible</span>
                </span>
              </div>

              <div className="flex items-center gap-4">
                <CircularAttendanceGauge percentage={overallAttendancePct} />
                <div className="space-y-1">
                  <div className="text-base font-bold text-[#0F172A]">
                    {attendedClasses} of {totalClasses} sessions
                  </div>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    Above the 75% requirement
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setActiveTab("attendance")}
                className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] inline-flex items-center gap-1 transition-colors"
              >
                <span>View attendance</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Card 2 — Internal Assessment (CIE) */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider font-mono">
                  Internal Assessment
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#2563EB] border border-blue-100">
                  <TrendingUp className="w-3 h-3 text-[#2563EB]" />
                  <span>CIE Marks</span>
                </span>
              </div>

              <div className="flex items-center gap-4">
                <CircularScoreGauge percentage={marksPercentage} />
                <div className="space-y-1">
                  <div className="text-base font-bold text-[#0F172A]">
                    Evaluation in progress
                  </div>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {totalMax > 0 ? `${totalObtained} of ${totalMax} points scored` : "Evaluated across current semester"}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#E2E8F0]">
              <Link
                to="/marks"
                className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] inline-flex items-center gap-1 transition-colors"
              >
                <span>View marks</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Card 3 — Today's Schedule */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider font-mono">
                  Today's Schedule
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700">
                  {activeScheduleDay}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="text-xl font-extrabold text-[#0F172A] tracking-tight">
                  {activeClassesCount} classes today
                </div>
                <div className="text-xs text-[#64748B] space-y-0.5">
                  <p>{todayFormatted} · Room {effectiveTimetable?.roomNo || "G05"}</p>
                  <p className="font-mono text-[11px] text-slate-500">Class timing: 9:00 AM – 4:20 PM</p>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setActiveTab("week")}
                className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] inline-flex items-center gap-1 transition-colors"
              >
                <span>View full schedule</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

        </section>

        {/* 3. MAIN WORKSPACE AREA (12-Column Grid: 8 Main, 4 CyAI) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* MAIN COLUMN (~70% on desktop) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* View Switcher Tabs */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-2 shadow-xs flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  id="tab-today"
                  role="tab"
                  aria-selected={activeTab === "today"}
                  onClick={() => setActiveTab("today")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 ${
                    activeTab === "today"
                      ? "bg-[#0B1F3A] text-white shadow-xs"
                      : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Today</span>
                </button>

                <button
                  type="button"
                  id="tab-week"
                  role="tab"
                  aria-selected={activeTab === "week"}
                  onClick={() => setActiveTab("week")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 ${
                    activeTab === "week"
                      ? "bg-[#0B1F3A] text-white shadow-xs"
                      : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Week</span>
                </button>

                <button
                  type="button"
                  id="tab-subjects"
                  role="tab"
                  aria-selected={activeTab === "subjects"}
                  onClick={() => setActiveTab("subjects")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 ${
                    activeTab === "subjects"
                      ? "bg-[#0B1F3A] text-white shadow-xs"
                      : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Subjects</span>
                </button>

                <button
                  type="button"
                  id="tab-attendance"
                  role="tab"
                  aria-selected={activeTab === "attendance"}
                  onClick={() => setActiveTab("attendance")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 ${
                    activeTab === "attendance"
                      ? "bg-[#0B1F3A] text-white shadow-xs"
                      : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100"
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Attendance</span>
                </button>
              </div>

              {/* Day filter pills for Today view */}
              {activeTab === "today" && (
                <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setActiveScheduleDay(day)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        activeScheduleDay === day
                          ? "bg-white text-[#0F172A] shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      } ${day === currentDayCode ? "ring-1 ring-blue-300" : ""}`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* TAB VIEW 1: TODAY'S TIMELINE SCHEDULE */}
            {activeTab === "today" && (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                  <div>
                    <h2 className="text-base font-bold text-[#0F172A]">
                      Schedule for {activeScheduleDay}
                    </h2>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Classroom {effectiveTimetable?.roomNo || "G05"} · VTU 50-minute teaching intervals.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono font-semibold text-slate-600">Active Day</span>
                  </div>
                </div>

                {/* Vertical Timeline Structure */}
                <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E2E8F0]">
                  {timelinePeriods.map((period, index) => {
                    const isBreak = period.isBreak;
                    const hasSubject = Boolean(period.subject && period.subject !== "—");
                    const isUpcoming = index === currentPeriodInfo.index;
                    const statusLabel = currentPeriodInfo.label;

                    if (isBreak) {
                      return (
                        <div key={period.slot.id} className="relative flex items-center gap-3">
                          {/* Timeline node */}
                          <div className="absolute -left-[19px] sm:-left-[27px] w-4 h-4 rounded-full bg-amber-400 ring-4 ring-amber-100 flex items-center justify-center" />
                          <div className="w-full py-2 px-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between">
                            <div className="flex items-center gap-2 font-mono">
                              <span className="font-bold">{period.startTime}</span>
                              <span className="text-amber-600">—</span>
                              <span className="uppercase tracking-wider font-bold">{period.subject || period.slot.label}</span>
                            </div>
                            <span className="text-[11px] font-mono text-amber-700">{period.timeRange}</span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={period.slot.id} className="relative group">
                        {/* Timeline Node Icon */}
                        <div
                          className={`absolute -left-[21px] sm:-left-[29px] w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                            isUpcoming
                              ? "bg-[#2563EB] ring-4 ring-blue-100 text-white"
                              : hasSubject
                              ? "bg-slate-900 ring-4 ring-slate-100 text-white"
                              : "bg-slate-300 ring-4 ring-slate-100 text-slate-600"
                          }`}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        </div>

                        {/* Class Content Card */}
                        <div
                          className={`p-4 rounded-xl border transition-all ${
                            isUpcoming
                              ? "bg-blue-50/60 border-blue-200 ring-1 ring-blue-300 shadow-xs"
                              : hasSubject
                              ? "bg-white border-[#E2E8F0] hover:border-slate-300 hover:shadow-xs"
                              : "bg-slate-50/60 border-dashed border-slate-200 text-slate-400"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-[#64748B]">
                                  {period.startTime}
                                </span>
                                <span className="text-slate-300">•</span>
                                <h3 className={`text-sm font-bold ${hasSubject ? "text-[#0F172A]" : "text-slate-400 italic"}`}>
                                  {hasSubject ? period.subject : "Free Period / Self Study"}
                                </h3>
                                {period.span > 1 && (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-50 text-[#6366F1] border border-indigo-100">
                                    {period.span} Periods Lab
                                  </span>
                                )}
                                {isUpcoming && (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#2563EB] text-white">
                                    {statusLabel}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-xs text-[#64748B]">
                                <span>{period.timeRange}</span>
                                <span>•</span>
                                <span>Room {effectiveTimetable?.roomNo || "G05"}</span>
                                <span>•</span>
                                <span>Section {studentSection}</span>
                              </div>
                            </div>

                            {hasSubject && (
                              <div className="shrink-0 self-start sm:self-auto">
                                <span className="text-[11px] font-mono font-semibold px-2 py-1 rounded-md bg-slate-100 text-slate-700">
                                  Period {period.idx + 1}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB VIEW 2: WEEKLY SCHEDULE MATRIX (Modern Calendar View) */}
            {activeTab === "week" && (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-[#0F172A]">
                      Weekly Academic Timetable
                    </h2>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Semester {studentSemester} · Section {studentSection} · Room {effectiveTimetable?.roomNo || "G05"}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    Coordinator: <strong className="text-slate-800">{effectiveTimetable?.classCoordinator}</strong>
                  </span>
                </div>

                <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl shadow-2xs">
                  <table className="w-full border-collapse text-center text-xs">
                    <thead>
                      <tr className="bg-[#0B1F3A] text-white divide-x divide-slate-800 font-semibold">
                        <th className="py-2.5 px-3 w-16 bg-[#0B1F3A]">
                          <div className="text-[10px] text-slate-400">Day</div>
                        </th>
                        {timeSlots.map((slot) => (
                          <th
                            key={slot.id}
                            className={`py-2 px-2 text-[11px] ${
                              slot.isBreak ? "bg-amber-950/70 w-14 font-mono text-amber-200" : "min-w-[95px]"
                            }`}
                          >
                            <div className="whitespace-pre-line leading-tight">{slot.time}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] bg-white">
                      {DAYS.map((day) => {
                        const row = effectiveTimetable?.grid?.[day] || [];
                        const isTodayRow = day === currentDayCode;
                        return (
                          <tr key={day} className={`transition-colors ${isTodayRow ? "bg-blue-50/40" : "hover:bg-slate-50/70"}`}>
                            <td className={`py-3 px-2 font-bold text-xs border-r border-[#E2E8F0] ${isTodayRow ? "text-[#2563EB] bg-blue-50/70" : "text-[#0F172A] bg-slate-50"}`}>
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
                                    className="bg-amber-50/80 text-amber-900 font-bold text-[10px] tracking-wider py-2 px-1 border-r border-[#E2E8F0] select-none"
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
                                  className={`py-2.5 px-2 border-r border-[#E2E8F0] ${
                                    hasSpan
                                      ? "bg-indigo-50/80 font-bold text-[#0F172A] border-2 border-indigo-200"
                                      : cell.subject
                                      ? "font-semibold text-slate-800"
                                      : "text-slate-300"
                                  }`}
                                >
                                  <div className="min-h-[32px] flex flex-col items-center justify-center">
                                    <span className="text-xs break-words max-w-[130px]">
                                      {cell.subject || "—"}
                                    </span>
                                    {hasSpan && (
                                      <span className="text-[10px] text-indigo-600 font-mono mt-0.5 font-bold">
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

            {/* TAB VIEW 3: ENROLLED SUBJECTS & FACULTY */}
            {activeTab === "subjects" && (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                  <div>
                    <h2 className="text-base font-bold text-[#0F172A]">
                      Enrolled Courses (Semester {studentSemester})
                    </h2>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Curriculum courses, syllabus codes, and faculty in-charge.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-slate-500 font-semibold">
                    {effectiveTimetable?.courses?.length || 6} Subjects
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {(effectiveTimetable?.courses || []).map((c) => (
                    <div
                      key={c.code || c.shortName}
                      className="p-4 rounded-xl border border-[#E2E8F0] bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#0B1F3A] text-white">
                          {c.code}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-600">
                          {c.facultyInitial || "FAC"}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#0F172A] leading-snug">
                        {c.name}
                      </h4>
                      <p className="text-xs text-[#64748B]">
                        Faculty: <strong className="text-slate-800">{c.faculty}</strong>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB VIEW 4: ATTENDANCE UX (Horizontal Color-Coded Progress Bars) */}
            {activeTab === "attendance" && (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
                  <div>
                    <h2 className="text-base font-bold text-[#0F172A]">
                      Subject Attendance Overview
                    </h2>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      VTU Minimum Requirement: 75% per subject.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="inline-flex items-center gap-1.5 text-[#10B981] font-semibold">
                      <span className="w-2 h-2 rounded-full bg-[#10B981]" /> Safe (≥75%)
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[#F59E0B] font-semibold">
                      <span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Warning (65–74%)
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[#EF4444] font-semibold">
                      <span className="w-2 h-2 rounded-full bg-[#EF4444]" /> Critical (&lt;65%)
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {(attendanceSummary.length > 0
                    ? attendanceSummary
                    : [
                        { subjectName: "Machine Learning", subjectCode: "BIC703", present: 22, total: 23, percentage: 95 },
                        { subjectName: "Blockchain Technology", subjectCode: "BIC702", present: 21, total: 22, percentage: 95 },
                        { subjectName: "Cybersecurity & Governance", subjectCode: "BCY756D", present: 19, total: 20, percentage: 95 },
                        { subjectName: "IoT Communication Protocol", subjectCode: "BCO701", present: 20, total: 21, percentage: 95 },
                        { subjectName: "Non Conventional Resources", subjectCode: "BME755D", present: 18, total: 20, percentage: 90 },
                      ]
                  ).map((item) => {
                    const pct = item.percentage;
                    const isSafe = pct >= 75;
                    const isWarning = pct >= 65 && pct < 75;
                    const isCritical = pct < 65;

                    return (
                      <div
                        key={item.subjectCode || item.subjectName}
                        className="p-4 rounded-xl border border-[#E2E8F0] bg-white hover:border-slate-300 transition-all space-y-2.5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div>
                            <span className="text-sm font-bold text-[#0F172A]">
                              {item.subjectName || item.subject?.name || item.name || "Course"}
                            </span>
                            {(item.subjectCode || item.subject?.code) ? (
                              <span className="text-xs font-mono text-[#64748B] ml-2">
                                ({item.subjectCode || item.subject?.code})
                              </span>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-[#64748B]">
                              {item.present} of {item.total} classes attended
                            </span>
                            <span
                              className={`text-sm font-black font-mono px-2.5 py-0.5 rounded-lg border ${
                                isSafe
                                  ? "bg-emerald-50 text-[#10B981] border-emerald-200"
                                  : isWarning
                                  ? "bg-amber-50 text-[#F59E0B] border-amber-200"
                                  : "bg-rose-50 text-[#EF4444] border-rose-200"
                              }`}
                            >
                              {pct}%
                            </span>
                          </div>
                        </div>

                        {/* Horizontal Progress Bar */}
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              isSafe
                                ? "bg-[#10B981]"
                                : isWarning
                                ? "bg-[#F59E0B]"
                                : "bg-[#EF4444]"
                            }`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. QUICK ACTIONS SECTION */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider font-mono">
                Quick actions
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Link
                  to="/attendance"
                  className="p-3.5 rounded-xl border border-[#E2E8F0] hover:border-slate-300 hover:shadow-xs transition-all flex items-center gap-3 text-left group"
                >
                  <div className="p-2 rounded-lg bg-emerald-50 text-[#10B981] group-hover:scale-105 transition-transform">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">View attendance</span>
                    <span className="text-[11px] text-[#64748B]">Full logs</span>
                  </div>
                </Link>

                <Link
                  to="/marks"
                  className="p-3.5 rounded-xl border border-[#E2E8F0] hover:border-slate-300 hover:shadow-xs transition-all flex items-center gap-3 text-left group"
                >
                  <div className="p-2 rounded-lg bg-blue-50 text-[#2563EB] group-hover:scale-105 transition-transform">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">Check marks</span>
                    <span className="text-[11px] text-[#64748B]">CIE scores</span>
                  </div>
                </Link>

                <Link
                  to="/materials"
                  className="p-3.5 rounded-xl border border-[#E2E8F0] hover:border-slate-300 hover:shadow-xs transition-all flex items-center gap-3 text-left group"
                >
                  <div className="p-2 rounded-lg bg-indigo-50 text-[#6366F1] group-hover:scale-105 transition-transform">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">Study materials</span>
                    <span className="text-[11px] text-[#64748B]">Syllabus PDFs</span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("today");
                    window.scrollTo({ top: 300, behavior: "smooth" });
                  }}
                  className="p-3.5 rounded-xl border border-[#E2E8F0] hover:border-slate-300 hover:shadow-xs transition-all flex items-center gap-3 text-left group"
                >
                  <div className="p-2 rounded-lg bg-amber-50 text-[#F59E0B] group-hover:scale-105 transition-transform">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">Today's timetable</span>
                    <span className="text-[11px] text-[#64748B]">Active slots</span>
                  </div>
                </button>

                <Link
                  to="/cynai"
                  className="p-3.5 rounded-xl border border-[#E2E8F0] hover:border-slate-300 hover:shadow-xs transition-all flex items-center gap-3 text-left group"
                >
                  <div className="p-2 rounded-lg bg-purple-50 text-purple-600 group-hover:scale-105 transition-transform">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">Ask CyAI</span>
                    <span className="text-[11px] text-[#64748B]">Tutor assistant</span>
                  </div>
                </Link>

                <Link
                  to="/materials"
                  className="p-3.5 rounded-xl border border-[#E2E8F0] hover:border-slate-300 hover:shadow-xs transition-all flex items-center gap-3 text-left group"
                >
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-700 group-hover:scale-105 transition-transform">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">Download notes</span>
                    <span className="text-[11px] text-[#64748B]">Recent files</span>
                  </div>
                </Link>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (~30% on desktop: CyAI Assistant Panel) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* CyAI STUDY ENGINE CARD */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4 hover:border-slate-300 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#6366F1] flex items-center justify-center text-white shadow-xs">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0F172A]">CyAI</h3>
                    <p className="text-xs text-[#64748B]">Your academic study assistant</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Academic Engine
                </span>
              </div>

              {/* CyAI Input Field */}
              <form onSubmit={handleCyAISubmit} className="relative">
                <input
                  type="text"
                  value={cynaiInput}
                  onChange={(e) => setCynaiInput(e.target.value)}
                  placeholder="Ask anything about your subjects..."
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-50 border border-[#E2E8F0] focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-xs text-[#0F172A] placeholder-[#64748B] transition-all outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-2 p-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition-colors"
                  title="Send message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Suggested Prompts as Compact Chips */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider font-mono block">
                  Suggested topics:
                </span>
                <div className="flex flex-col gap-1.5">
                  {CYAI_SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handlePromptClick(prompt)}
                      className="text-left px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-medium text-slate-700 hover:text-[#0F172A] transition-colors flex items-center justify-between group"
                    >
                      <span className="truncate">{prompt}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-[#2563EB] transition-colors shrink-0 ml-1" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RECENT STUDY MATERIALS */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] font-mono flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Recent Materials</span>
                </h3>
                <Link
                  to="/materials"
                  className="text-xs font-bold text-[#2563EB] hover:underline"
                >
                  All files →
                </Link>
              </div>

              {materials.length > 0 ? (
                <div className="space-y-2">
                  {materials.map((item) => (
                    <div
                      key={item.id || item._id}
                      className="p-3 rounded-xl border border-[#E2E8F0] bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 shrink-0">
                          <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-[#0F172A] truncate">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-[#64748B] truncate font-mono">
                            {item.subject?.code || item.category || "Lecture Module"}
                          </p>
                        </div>
                      </div>
                      {item.fileUrl && (
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#0F172A] hover:bg-slate-100 transition-colors shrink-0"
                          title="Download document"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-[#64748B]">
                  No study notes uploaded for current semester yet.
                </div>
              )}
            </div>

            {/* DEPARTMENT CONTACT CARD */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-2">
              <span className="text-xs font-bold text-[#0F172A] block">Department Coordination</span>
              <p className="text-xs text-[#64748B] leading-relaxed">
                For attendance disputes or CIE verification, email department administration:
              </p>
              <a
                href="mailto:cadence.platform@gmail.com"
                className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#2563EB] hover:underline"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>cadence.platform@gmail.com</span>
              </a>
            </div>

          </div>

        </div>

      </div>

      {/* MOBILE FLOATING ASK CYAI BUTTON */}
      <div className="fixed bottom-5 right-5 lg:hidden z-40">
        <Link
          to="/cynai"
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#2563EB] text-white font-bold text-xs shadow-lg hover:bg-[#1D4ED8] transition-transform active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Ask CyAI</span>
        </Link>
      </div>
    </div>
  );
}
