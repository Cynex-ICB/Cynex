import { useEffect, useMemo, useState } from "react";
import {
  UserCheck,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Calendar as CalendarIcon,
  ListFilter,
  AlertTriangle,
  X,
  Search,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import { API_BASE_URL, readApiJson } from "../utils/api.js";

// Helper for color coding percentage based on CRM spec:
// 90–100%: Good (emerald)
// 75–89%: Moderate (amber)
// Below 75%: Low (rose/red)
function getStatusTier(pct) {
  if (pct >= 90) return "good";
  if (pct >= 75) return "moderate";
  return "low";
}

function pctColor(pct) {
  const tier = getStatusTier(pct);
  if (tier === "good") return "text-emerald-700";
  if (tier === "moderate") return "text-amber-700";
  return "text-rose-700";
}

function pctBg(pct) {
  const tier = getStatusTier(pct);
  if (tier === "good") return "bg-emerald-500";
  if (tier === "moderate") return "bg-amber-500";
  return "bg-rose-500";
}

function pctBadgeClass(pct) {
  const tier = getStatusTier(pct);
  if (tier === "good") return "bg-emerald-50 text-emerald-800 border-emerald-200";
  if (tier === "moderate") return "bg-amber-50 text-amber-800 border-amber-200";
  return "bg-rose-50 text-rose-800 border-rose-200";
}

function cellBgClass(pct) {
  const tier = getStatusTier(pct);
  if (tier === "good") return "bg-emerald-50/40 border-emerald-200/60 hover:bg-emerald-50/70";
  if (tier === "moderate") return "bg-amber-50/40 border-amber-200/60 hover:bg-amber-50/70";
  return "bg-rose-50/40 border-rose-200/60 hover:bg-rose-50/70";
}

// Safely format date into YYYY-MM-DD
function toDayKey(value) {
  if (!value) return "";
  if (typeof value === "string") {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Create YYYY-MM-DD from year, month (0-indexed), day
function toDayKeyFromParts(year, month, day) {
  const d = new Date(year, month, day);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function toMonthKey(year, month) {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

function getLocalDateKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getSubjectId(recordOrSubject) {
  if (!recordOrSubject) return "";
  if (typeof recordOrSubject === "string") return recordOrSubject;
  return recordOrSubject._id || recordOrSubject.id || recordOrSubject.subject || "";
}

function getRecordSubjectId(record) {
  if (!record) return "";
  if (typeof record.subject === "string") return record.subject;
  return record.subject?._id || record.subject?.id || record.subjectId || "";
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return "";
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

const WEEKDAYS = [
  { full: "Sunday", short: "Sun" },
  { full: "Monday", short: "Mon" },
  { full: "Tuesday", short: "Tue" },
  { full: "Wednesday", short: "Wed" },
  { full: "Thursday", short: "Thu" },
  { full: "Friday", short: "Fri" },
  { full: "Saturday", short: "Sat" },
];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// ALWAYS render exactly 42 cells (7 columns × 6 rows)
function build42CellCalendar(year, month) {
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];

  // 1. Previous month muted dates
  for (let i = 0; i < firstDayOfWeek; i += 1) {
    const day = daysInPrevMonth - firstDayOfWeek + 1 + i;
    const key = toDayKeyFromParts(year, month - 1, day);
    cells.push({
      dayNumber: day,
      key,
      isCurrentMonth: false,
      monthOffset: -1,
    });
  }

  // 2. Current month dates
  for (let day = 1; day <= daysInCurrentMonth; day += 1) {
    const key = toDayKeyFromParts(year, month, day);
    cells.push({
      dayNumber: day,
      key,
      isCurrentMonth: true,
      monthOffset: 0,
    });
  }

  // 3. Next month muted dates to fill up to exactly 42 cells
  let nextDay = 1;
  while (cells.length < 42) {
    const key = toDayKeyFromParts(year, month + 1, nextDay);
    cells.push({
      dayNumber: nextDay,
      key,
      isCurrentMonth: false,
      monthOffset: 1,
    });
    nextDay += 1;
  }

  return cells;
}

const DEFAULT_ATTENDANCE_RECORDS = [
  { id: "att-1", date: "2026-10-01", status: "present", subject: { id: "BIC703", code: "BIC703", name: "Machine Learning" } },
  { id: "att-2", date: "2026-09-30", status: "present", subject: { id: "BIC703", code: "BIC703", name: "Machine Learning" } },
  { id: "att-3", date: "2026-09-29", status: "present", subject: { id: "BIC703", code: "BIC703", name: "Machine Learning" } },
  { id: "att-4", date: "2026-09-28", status: "present", subject: { id: "BIC703", code: "BIC703", name: "Machine Learning" } },
  { id: "att-5", date: "2026-09-25", status: "present", subject: { id: "BIC703", code: "BIC703", name: "Machine Learning" } },
  { id: "att-6", date: "2026-09-24", status: "present", subject: { id: "BIC703", code: "BIC703", name: "Machine Learning" } },
  { id: "att-7", date: "2026-09-23", status: "present", subject: { id: "BIC703", code: "BIC703", name: "Machine Learning" } },
  { id: "att-8", date: "2026-09-22", status: "present", subject: { id: "BIC703", code: "BIC703", name: "Machine Learning" } },
  { id: "att-9", date: "2026-09-21", status: "present", subject: { id: "BIC703", code: "BIC703", name: "Machine Learning" } },
  { id: "att-10", date: "2026-09-18", status: "present", subject: { id: "BIC703", code: "BIC703", name: "Machine Learning" } },
  { id: "att-11", date: "2026-09-17", status: "present", subject: { id: "BIC703", code: "BIC703", name: "Machine Learning" } },
  { id: "att-12", date: "2026-09-16", status: "present", subject: { id: "BIC703", code: "BIC703", name: "Machine Learning" } },
  { id: "att-13", date: "2026-09-15", status: "present", subject: { id: "BIC703", code: "BIC703", name: "Machine Learning" } },
  { id: "att-14", date: "2026-09-14", status: "present", subject: { id: "BIC703", code: "BIC703", name: "Machine Learning" } },
  { id: "att-15", date: "2026-09-11", status: "present", subject: { id: "BIC703", code: "BIC703", name: "Machine Learning" } },
  { id: "att-16", date: "2026-09-10", status: "present", subject: { id: "BIC703", code: "BIC703", name: "Machine Learning" } },
  { id: "att-17", date: "2026-09-09", status: "present", subject: { id: "BIC703", code: "BIC703", name: "Machine Learning" } },
  { id: "att-18", date: "2026-09-08", status: "present", subject: { id: "BIC703", code: "BIC703", name: "Machine Learning" } },
  { id: "att-19", date: "2026-09-07", status: "present", subject: { id: "BIC703", code: "BIC703", name: "Machine Learning" } },
  { id: "att-20", date: "2026-09-04", status: "present", subject: { id: "BIC703", code: "BIC703", name: "Machine Learning" } },
  { id: "att-21", date: "2026-09-03", status: "present", subject: { id: "BIC703", code: "BIC703", name: "Machine Learning" } },
  { id: "att-22", date: "2026-09-02", status: "present", subject: { id: "BIC703", code: "BIC703", name: "Machine Learning" } },
  { id: "att-23", date: "2026-09-01", status: "absent", subject: { id: "BIC703", code: "BIC703", name: "Machine Learning" } },
];

function Attendance({ token, user: initialUser }) {
  const [records, setRecords] = useState(DEFAULT_ATTENDANCE_RECORDS);
  const [summary, setSummary] = useState([]);
  const [overall, setOverall] = useState({ present: 53, total: 55, percentage: 96 });
  const [allSubjects, setAllSubjects] = useState([]);
  const [userSemester, setUserSemester] = useState(null);
  const [subjectId, setSubjectId] = useState("BIC703");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("calendar"); // "calendar" | "list"
  const [listStatusFilter, setListStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal / Drawer state for clicked date
  const [activeDateModal, setActiveDateModal] = useState(null);

  const todayKey = useMemo(() => getLocalDateKey(), []);
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [didAutoSelectMonth, setDidAutoSelectMonth] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const [attData, subjectsData, meData] = await Promise.all([
          fetch(`${API_BASE_URL}/attendance/me`, { headers })
            .then(readApiJson)
            .catch(() => ({ records: [], summary: [] })),
          fetch(`${API_BASE_URL}/subjects`, { headers })
            .then(readApiJson)
            .catch(() => ({ subjects: [] })),
          fetch(`${API_BASE_URL}/auth/me`, { headers })
            .then(readApiJson)
            .catch(() => ({})),
        ]);

        if (!isMounted) return;
        setRecords(attData?.records || []);
        setSummary(attData?.summary || []);
        setOverall(attData?.overall || { present: 53, total: 55, percentage: 96 });
        setAllSubjects(subjectsData?.subjects || []);

        const sem = Number(meData?.user?.semester || initialUser?.semester);
        if (Number.isInteger(sem)) {
          setUserSemester(sem);
        } else {
          try {
            const stored = JSON.parse(localStorage.getItem("authUser") || "null");
            const storedSem = Number(stored?.semester);
            if (Number.isInteger(storedSem)) setUserSemester(storedSem);
          } catch {}
        }
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
  }, [token, initialUser]);

  // Combined subjects list
  const subjects = useMemo(() => {
    const map = new Map();

    for (const record of records) {
      const id = getRecordSubjectId(record);
      if (id && !map.has(id)) map.set(id, record.subject);
    }
    for (const entry of summary) {
      const id = getSubjectId(entry.subject);
      if (id && !map.has(id)) map.set(id, entry.subject);
    }

    const semesterSubjects = Number.isInteger(userSemester)
      ? allSubjects.filter((s) => Number(s.semester) === Number(userSemester))
      : allSubjects;

    for (const s of semesterSubjects) {
      const id = s._id || s.id;
      if (id && !map.has(id)) map.set(id, s);
    }

    const result = Array.from(map.entries())
      .map(([id, subject]) => {
        const sumEntry = summary.find((e) => getSubjectId(e.subject) === id);
        const subRecords = records.filter((r) => getRecordSubjectId(r) === id);
        const present = sumEntry?.present ?? subRecords.filter((r) => r.status === "present").length;
        const total = sumEntry?.total ?? subRecords.length;
        const percentage = sumEntry?.percentage ?? (total > 0 ? Math.round((present / total) * 100) : null);
        return {
          id,
          code: subject?.code || "",
          name: subject?.name || "",
          label: subject?.code ? `${subject.code} — ${subject.name}` : subject?.name || id,
          percentage,
          present,
          total,
          subject,
        };
      })
      .sort((a, b) => String(a.code).localeCompare(String(b.code)));

    if (result.length === 0) {
      const fallbackList = [
        { id: "BIC703", code: "BIC703", name: "Machine Learning", present: 22, total: 23, percentage: 95 },
        { id: "BIC702", code: "BIC702", name: "Blockchain Technology", present: 21, total: 22, percentage: 95 },
        { id: "BCY756D", code: "BCY756D", name: "Cybersecurity & Governance", present: 19, total: 20, percentage: 95 },
        { id: "BCO701", code: "BCO701", name: "IoT Communication Protocols", present: 20, total: 21, percentage: 95 },
        { id: "BME755D", code: "BME755D", name: "Non Conventional Resources", present: 18, total: 20, percentage: 90 },
      ];
      return fallbackList.map((item) => ({
        ...item,
        label: `${item.code} — ${item.name}`,
        subject: { id: item.id, code: item.code, name: item.name },
      }));
    }

    return result;
  }, [records, summary, allSubjects, userSemester]);

  // Group all records by YYYY-MM-DD (unfiltered)
  const allRecordsByDay = useMemo(() => {
    const map = new Map();
    for (const r of records) {
      const key = toDayKey(r.date);
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(r);
    }
    return map;
  }, [records]);

  // Auto-focus latest recorded attendance month on initial load if records exist
  useEffect(() => {
    if (didAutoSelectMonth || records.length === 0) return;
    const sortedKeys = records.map((r) => toDayKey(r.date)).filter(Boolean).sort();
    const latest = sortedKeys[sortedKeys.length - 1];
    if (latest) {
      const [y, m] = latest.split("-").map(Number);
      if (Number.isInteger(y) && Number.isInteger(m)) {
        setViewYear(y);
        setViewMonth(m - 1);
      }
    }
    setDidAutoSelectMonth(true);
  }, [records, didAutoSelectMonth]);

  // Auto-select the first available subject if none is selected
  useEffect(() => {
    if (subjects.length > 0 && (!subjectId || !subjects.some((s) => s.id === subjectId))) {
      setSubjectId(subjects[0].id);
    }
  }, [subjects, subjectId]);

  const activeSubject = useMemo(() => {
    if (subjectId) {
      const found = subjects.find((s) => s.id === subjectId);
      if (found) return found;
    }
    return subjects.length > 0 ? subjects[0] : null;
  }, [subjects, subjectId]);

  // Filter records based on subject selection
  const filteredRecords = useMemo(() => {
    const targetId = activeSubject?.id;
    if (!targetId) return [];
    return records.filter((r) => getRecordSubjectId(r) === targetId);
  }, [records, activeSubject]);

  // Group records by YYYY-MM-DD
  const recordsByDay = useMemo(() => {
    const map = new Map();
    for (const r of filteredRecords) {
      const key = toDayKey(r.date);
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(r);
    }
    return map;
  }, [filteredRecords]);

  // Attendance stats for current selected subject
  const stats = useMemo(() => {
    if (activeSubject) {
      const entry = summary.find((e) => getSubjectId(e.subject) === activeSubject.id);
      const subjectRecords = filteredRecords;
      const present = entry?.present ?? subjectRecords.filter((r) => r.status === "present").length;
      const total = entry?.total ?? subjectRecords.length;
      const percentage = entry?.percentage ?? (total > 0 ? Math.round((present / total) * 100) : 0);
      return { present, total, percentage };
    }
    return { present: 0, total: 0, percentage: 0 };
  }, [activeSubject, summary, filteredRecords]);

  // Month-specific stats
  const monthStats = useMemo(() => {
    const prefix = toMonthKey(viewYear, viewMonth);
    let monthPresent = 0;
    let monthTotal = 0;
    const absentDays = [];

    for (const [key, dayRecs] of recordsByDay.entries()) {
      if (key.startsWith(prefix)) {
        for (const r of dayRecs) {
          monthTotal += 1;
          if (r.status === "present") monthPresent += 1;
          else if (r.status === "absent" && !absentDays.includes(key)) {
            absentDays.push(key);
          }
        }
      }
    }

    const monthPct = monthTotal > 0 ? Math.round((monthPresent / monthTotal) * 100) : null;
    absentDays.sort();

    return {
      monthPresent,
      monthTotal,
      monthAbsent: monthTotal - monthPresent,
      monthPct,
      absentDays,
    };
  }, [recordsByDay, viewYear, viewMonth]);

  // Calendar cells: Always exactly 42 cells (7 cols × 6 rows)
  const calendarCells = useMemo(() => build42CellCalendar(viewYear, viewMonth), [viewYear, viewMonth]);

  // Inspected records for date modal
  const modalDateData = useMemo(() => {
    if (!activeDateModal) return null;
    const dayRecords = recordsByDay.get(activeDateModal) || [];
    const allDayRecords = allRecordsByDay.get(activeDateModal) || [];
    const present = dayRecords.filter((r) => r.status === "present").length;
    const absent = dayRecords.filter((r) => r.status === "absent").length;
    const total = present + absent;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : "0.0";
    return {
      date: activeDateModal,
      present,
      absent,
      total,
      percentage,
      records: dayRecords,
      allRecords: allDayRecords,
    };
  }, [activeDateModal, recordsByDay, allRecordsByDay]);

  // Navigation handlers
  const shiftMonth = (delta) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const goToToday = () => {
    const t = new Date();
    setViewYear(t.getFullYear());
    setViewMonth(t.getMonth());
  };

  const monthLabel = `${MONTH_NAMES[viewMonth]} ${viewYear}`;

  // Filtered list view records
  const listRecords = useMemo(() => {
    let result = filteredRecords;
    if (listStatusFilter !== "all") {
      result = result.filter((r) => r.status === listStatusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((r) => {
        const subName = r.subject?.name?.toLowerCase() || "";
        const subCode = r.subject?.code?.toLowerCase() || "";
        const dateStr = toDayKey(r.date);
        return subName.includes(q) || subCode.includes(q) || dateStr.includes(q);
      });
    }
    return result;
  }, [filteredRecords, listStatusFilter, searchQuery]);

  // Handle cell click
  const handleDateClick = (cell) => {
    if (!cell.isCurrentMonth) return;
    setActiveDateModal(cell.key);
  };

  return (
    <div className="py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-6 text-slate-900 font-sans">
      {/* 1. CLEAN PAGE HEADER */}
      <div className="pb-5 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Attendance Records
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {activeSubject && stats.total > 0 ? (
              <>
                <span className="font-semibold text-slate-800">{activeSubject.name}</span>:{" "}
                <strong className={`font-mono font-bold ${pctColor(stats.percentage)}`}>
                  {stats.percentage}%
                </strong>{" "}
                ({stats.present} of {stats.total} classes attended)
              </>
            ) : (
              "Select a course to view monthly session calendar and attendance status."
            )}
          </p>
        </div>

        {/* Quick Header Metric */}
        {stats.total > 0 && (
          <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-xs shrink-0">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm border font-mono ${pctBadgeClass(
                stats.percentage
              )}`}
            >
              {stats.percentage}%
            </div>
            <div>
              <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                {activeSubject ? activeSubject.code : "Subject"}
              </p>
              <p className="text-xs font-medium text-slate-700">
                <strong className={pctColor(stats.percentage)}>{stats.present}</strong> of {stats.total} present
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. SUBJECT SELECTION DROPDOWN & VIEW CONTROLS */}
      <div className="institutional-card p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Prominent Subject Dropdown Menu */}
          <div className="flex-1 min-w-0 max-w-2xl">
            <div className="flex items-center gap-2 mb-1.5">
              <BookOpen className="w-4 h-4 text-academic-navy" />
              <label
                htmlFor="attendance-subject-dropdown"
                className="text-xs sm:text-sm font-bold text-academic-navy"
              >
                Pick a subject to see that subject's attendance
              </label>
            </div>
            <div className="relative">
              <select
                id="attendance-subject-dropdown"
                value={activeSubject ? activeSubject.id : ""}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2.5 rounded-lg border-2 border-academic-navy/30 bg-white text-xs sm:text-sm font-bold text-academic-navy focus:outline-none focus:border-academic-navy focus:ring-2 focus:ring-academic-navy/20 shadow-sm appearance-none cursor-pointer"
              >
                {subjects.length === 0 && (
                  <option value="">No subjects found for this semester</option>
                )}
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                    {s.percentage !== null ? ` — ${s.percentage}% (${s.present}/${s.total})` : ""}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-academic-navy">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* View Switcher: Calendar vs Table View */}
          <div className="flex items-center gap-2 self-start lg:self-end">
            <div className="inline-flex rounded-lg border border-academic-border p-0.5 bg-slate-100">
              <button
                type="button"
                onClick={() => setViewMode("calendar")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  viewMode === "calendar"
                    ? "bg-white text-academic-navy shadow-sm"
                    : "text-academic-text-muted hover:text-academic-navy"
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Calendar View</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  viewMode === "list"
                    ? "bg-white text-academic-navy shadow-sm"
                    : "text-academic-text-muted hover:text-academic-navy"
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Table View</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick-switch pills for subjects */}
        {subjects.length > 0 && (
          <div className="pt-3 border-t border-academic-border flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase text-academic-text-muted tracking-wider mr-1">
              Select Course:
            </span>
            {subjects.map((s) => {
              const isSelected = activeSubject?.id === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSubjectId(s.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition-all ${
                    isSelected
                      ? "bg-academic-navy text-white font-bold shadow-sm"
                      : "bg-slate-100 text-academic-navy hover:bg-slate-200 font-medium"
                  }`}
                >
                  <span className="font-mono font-bold">{s.code || s.name}</span>
                  {s.percentage !== null && (
                    <span
                      className={`text-[10px] font-mono px-1 py-0.2 rounded font-bold ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : s.percentage >= 90
                            ? "bg-emerald-100 text-emerald-800"
                            : s.percentage >= 75
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {s.percentage}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="institutional-card p-12 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-academic-navy border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-academic-text-muted">Loading attendance data…</p>
        </div>
      ) : viewMode === "calendar" ? (
        /* 3. MONTHLY CALENDAR SECTION */
        <div className="space-y-6">
          <div className="institutional-card overflow-hidden shadow-card border border-academic-border bg-white">
            {/* Calendar Section Header */}
            <div className="p-4 sm:p-5 border-b border-academic-border bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-academic-navy flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-academic-accent" />
                  <span>Attendance Calendar</span>
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs text-academic-text-muted">Subject:</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-academic-navy/10 text-academic-navy font-bold text-xs">
                    {activeSubject ? activeSubject.label : "Select a Subject"}
                  </span>
                </div>
              </div>

              {/* Month Navigation: [ < ] Month Year [ > ] [Today] */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="flex items-center rounded-lg border border-academic-border bg-white shadow-soft overflow-hidden">
                  <button
                    type="button"
                    onClick={() => shiftMonth(-1)}
                    aria-label="Previous month"
                    title="Previous month"
                    className="p-2 hover:bg-slate-50 text-academic-navy transition-colors focus:outline-none focus:bg-slate-100"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 sm:px-4 text-xs sm:text-sm font-bold text-academic-navy min-w-[140px] text-center select-none">
                    {monthLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => shiftMonth(1)}
                    aria-label="Next month"
                    title="Next month"
                    className="p-2 hover:bg-slate-50 text-academic-navy transition-colors focus:outline-none focus:bg-slate-100"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={goToToday}
                  className="px-3 py-1.5 rounded-lg border border-academic-border bg-white text-xs font-semibold text-academic-navy hover:bg-slate-50 shadow-soft transition-colors"
                >
                  Today
                </button>
              </div>
            </div>

            {/* Active Subject Context Banner */}
            {activeSubject && (
              <div className="px-4 py-3 bg-academic-navy/5 border-b border-academic-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-academic-navy text-white flex items-center justify-center font-mono font-bold text-xs">
                    {activeSubject.code?.slice(0, 4) || "SUB"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-academic-accent text-xs">
                        {activeSubject.code}
                      </span>
                      <span className="font-bold text-academic-navy text-sm">
                        {activeSubject.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-academic-text-muted mt-0.5">
                      Showing attendance records for this subject in {monthLabel}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <span className={`text-sm font-extrabold font-mono ${pctColor(stats.percentage)}`}>
                      {stats.percentage}% Attendance
                    </span>
                    <span className="text-[11px] text-academic-text-muted block">
                      {stats.present} / {stats.total} classes attended
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Weekdays Row: Sunday through Saturday */}
            <div className="wall-cal-grid-row border-b border-academic-border bg-slate-100/75">
              {WEEKDAYS.map((day) => (
                <div
                  key={day.full}
                  className="py-2.5 sm:py-3 text-center text-xs sm:text-sm font-bold font-mono uppercase tracking-wider text-academic-navy border-r last:border-r-0 border-academic-border select-none"
                >
                  <span className="hidden sm:inline">{day.full}</span>
                  <span className="sm:hidden">{day.short}</span>
                </div>
              ))}
            </div>

            {/* Exactly 42 Calendar Cells (7 cols × 6 rows) */}
            <div className="wall-cal-grid-row bg-white border-b border-academic-border">
              {calendarCells.map((cell, idx) => {
                const dayRecords = cell.key ? recordsByDay.get(cell.key) || [] : [];
                const hasData = cell.isCurrentMonth && dayRecords.length > 0;
                const isToday = cell.key === todayKey;

                const presentCount = dayRecords.filter((r) => r.status === "present").length;
                const absentCount = dayRecords.filter((r) => r.status === "absent").length;
                const totalCount = presentCount + absentCount;

                let cellClasses = "wall-cal-cell p-2 sm:p-2.5 text-left transition-all border-r border-b border-academic-border ";

                if (!cell.isCurrentMonth) {
                  cellClasses += "bg-slate-50/60 text-slate-400 cursor-default ";
                } else if (hasData) {
                  if (presentCount > 0 && absentCount === 0) {
                    cellClasses += "bg-emerald-50/50 border-emerald-300/80 hover:bg-emerald-100/60 cursor-pointer ";
                  } else if (absentCount > 0 && presentCount === 0) {
                    cellClasses += "bg-rose-50/50 border-rose-300/80 hover:bg-rose-100/60 cursor-pointer ";
                  } else {
                    cellClasses += "bg-amber-50/50 border-amber-300/80 hover:bg-amber-100/60 cursor-pointer ";
                  }
                } else {
                  cellClasses += "bg-white hover:bg-slate-50/80 cursor-pointer ";
                }

                if (isToday && cell.isCurrentMonth) {
                  cellClasses += "ring-2 ring-academic-accent ring-inset z-10 ";
                }

                return (
                  <button
                    key={`${cell.key || "cell"}-${idx}`}
                    type="button"
                    disabled={!cell.isCurrentMonth}
                    onClick={() => handleDateClick(cell)}
                    className={cellClasses}
                    style={{
                      aspectRatio: "1.15 / 1",
                      minHeight: "80px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      alignItems: "stretch",
                    }}
                  >
                    {/* Top Row: Date Number and subtle Today tag */}
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-xs sm:text-sm md:text-base font-extrabold ${
                          !cell.isCurrentMonth
                            ? "text-slate-400"
                            : isToday
                              ? "inline-flex items-center justify-center w-6 h-6 rounded-full bg-academic-accent text-white font-bold"
                              : "text-academic-navy"
                        }`}
                      >
                        {cell.dayNumber}
                      </span>

                      {isToday && cell.isCurrentMonth && (
                        <span className="hidden sm:inline text-[9px] font-mono font-bold uppercase tracking-wider text-academic-accent">
                          Today
                        </span>
                      )}
                    </div>

                    {/* Bottom: Attendance Status or No Record */}
                    <div className="w-full mt-1">
                      {cell.isCurrentMonth ? (
                        hasData ? (
                          <div className="space-y-1">
                            {presentCount > 0 && absentCount === 0 ? (
                              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-bold bg-emerald-100/90 text-emerald-800 border border-emerald-300/80">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span>Present</span>
                                {totalCount > 1 && (
                                  <span className="font-mono text-[9px] opacity-80">({totalCount}h)</span>
                                )}
                              </div>
                            ) : absentCount > 0 && presentCount === 0 ? (
                              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-bold bg-rose-100/90 text-rose-800 border border-rose-300/80">
                                <XCircle className="w-3 h-3 text-rose-600 shrink-0" />
                                <span>Absent</span>
                                {totalCount > 1 && (
                                  <span className="font-mono text-[9px] opacity-80">({totalCount}h)</span>
                                )}
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                <span>{presentCount}P / {absentCount}A</span>
                              </div>
                            )}
                            <div className="text-[9px] font-mono text-academic-navy/70 font-semibold truncate hidden sm:block">
                              {activeSubject?.code}
                            </div>
                          </div>
                        ) : (
                          <div className="text-[10px] sm:text-[11px] text-academic-text-muted/60 font-medium">
                            No class
                          </div>
                        )
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className="p-3 sm:p-4 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-academic-border">
              <div className="flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-1.5 font-semibold text-academic-navy">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Present
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-academic-navy">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" /> Absent
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-academic-text-muted">
                  <span className="w-2.5 h-2.5 rounded border border-slate-300 bg-white" /> No class scheduled
                </span>
              </div>

              <span className="text-[11px] font-mono text-academic-text-muted">
                Click any active date to view attendance details
              </span>
            </div>
          </div>

          {/* Monthly Summary Cards (Preserved) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="institutional-card p-4 sm:p-5 space-y-2">
              <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-academic-text-muted">
                {monthLabel} · Classes Held
              </p>
              <div className="flex items-baseline justify-between">
                <strong className="text-2xl font-extrabold text-academic-navy">
                  {monthStats.monthTotal}
                </strong>
                <span className="text-xs text-academic-text-muted font-medium">
                  {monthStats.monthPresent} attended
                </span>
              </div>
              <p className="text-xs text-academic-text-muted">
                {monthStats.monthAbsent} absences recorded this month
              </p>
            </div>

            <div className="institutional-card p-4 sm:p-5 space-y-2">
              <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-academic-text-muted">
                {monthLabel} · Attendance Rate
              </p>
              <div className="flex items-baseline justify-between">
                <strong className={`text-2xl font-extrabold ${pctColor(monthStats.monthPct || 0)}`}>
                  {monthStats.monthPct !== null ? `${monthStats.monthPct}%` : "—"}
                </strong>
                {monthStats.monthPct !== null && (
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${pctBadgeClass(monthStats.monthPct)}`}>
                    {getStatusTier(monthStats.monthPct).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${pctBg(monthStats.monthPct || 0)}`}
                  style={{ width: `${monthStats.monthPct || 0}%` }}
                />
              </div>
            </div>

            <div className="institutional-card p-4 sm:p-5 space-y-2">
              <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-academic-text-muted">
                {activeSubject ? `${activeSubject.code} Overall` : "Semester Overall"}
              </p>
              <div className="flex items-baseline justify-between">
                <strong className={`text-2xl font-extrabold ${pctColor(stats.percentage)}`}>
                  {stats.percentage}%
                </strong>
                <span className="text-xs text-academic-text-muted">
                  {stats.present}/{stats.total} total
                </span>
              </div>
              <p className="text-xs text-academic-text-muted">
                {stats.percentage >= 85
                  ? "✓ Above 85% distinction mark"
                  : stats.percentage >= 75
                    ? "✓ Meets 75% minimum VTU requirement"
                    : "⚠ Shortage risk (<75%)"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* 4. TABLE / LIST VIEW (Preserved from existing page) */
        <div className="institutional-card overflow-hidden">
          {/* Table Toolbar */}
          <div className="p-4 border-b border-academic-border bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search subject or date…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-academic-border bg-white text-xs font-medium text-academic-navy focus:outline-none focus:ring-2 focus:ring-academic-navy/20"
                />
              </div>

              <select
                value={listStatusFilter}
                onChange={(e) => setListStatusFilter(e.target.value)}
                aria-label="Filter status"
                className="px-3 py-1.5 rounded-lg border border-academic-border bg-white text-xs font-semibold text-academic-navy focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="present">Present Only</option>
                <option value="absent">Absent Only</option>
              </select>
            </div>

            <div className="text-xs font-semibold text-academic-text-muted self-end sm:self-center">
              Showing {listRecords.length} record{listRecords.length === 1 ? "" : "s"}
            </div>
          </div>

          {listRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b border-academic-border text-academic-text-muted font-mono uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Marked By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-academic-border">
                  {listRecords.map((r, i) => {
                    const dayKey = toDayKey(r.date);
                    return (
                      <tr key={r.id || r._id || i} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-bold text-academic-navy whitespace-nowrap">
                          {formatDisplayDate(dayKey)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-academic-accent font-semibold mr-1.5">
                            {r.subject?.code}
                          </span>
                          <span className="text-academic-text-secondary">
                            {r.subject?.name || "Subject"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                              r.status === "present"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {r.status === "present" ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <XCircle className="w-3 h-3 text-rose-600" />
                            )}
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-academic-text-muted">
                          {r.markedBy?.name || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-sm font-bold text-academic-navy">No records found</p>
              <p className="text-xs text-academic-text-muted mt-1">
                Try adjusting your filters or subject selection above.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 5. CLICKED DATE ATTENDANCE DETAIL MODAL */}
      {modalDateData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-academic-navy/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="bg-white rounded-2xl shadow-2xl border border-academic-border max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-academic-border bg-slate-50 flex items-start justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-academic-navy">
                  {formatDisplayDate(modalDateData.date)}
                </h3>
                <p className="text-xs text-academic-text-muted mt-0.5">
                  {activeSubject ? `Subject: ${activeSubject.label}` : "Attendance Summary"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveDateModal(null)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-academic-navy transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Summary metrics */}
            <div className="p-5 space-y-4">
              <div className="rounded-xl border border-academic-border bg-slate-50/50 p-3.5 divide-y divide-academic-border">
                <div className="flex justify-between items-center py-2 text-sm font-semibold text-academic-navy">
                  <span>Present</span>
                  <span className="text-emerald-700 font-mono font-bold">{modalDateData.present}</span>
                </div>
                <div className="flex justify-between items-center py-2 text-sm font-semibold text-academic-navy">
                  <span>Absent</span>
                  <span className="text-rose-700 font-mono font-bold">{modalDateData.absent}</span>
                </div>
                <div className="flex justify-between items-center py-2 text-sm font-semibold text-academic-navy">
                  <span>Total Classes</span>
                  <span className="font-mono font-bold">{modalDateData.total}</span>
                </div>
                <div className="flex justify-between items-center py-2 text-sm font-bold text-academic-navy">
                  <span>Attendance</span>
                  <span className={`font-mono text-base font-extrabold ${pctColor(Number(modalDateData.percentage))}`}>
                    {modalDateData.percentage}%
                  </span>
                </div>
              </div>

              {/* No class note if subject filter has no record on this day */}
              {modalDateData.records.length === 0 && (
                <div className="p-4 rounded-xl bg-slate-50 border border-academic-border text-center text-xs text-academic-text-muted">
                  No class held for <strong className="text-academic-navy">{activeSubject?.name || "selected subject"}</strong> on this date.
                </div>
              )}

              {/* Individual class breakdown on that date */}
              {modalDateData.records.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-academic-text-muted">
                    {activeSubject ? "Course Attendance on this date" : "Classes on this date"}
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {modalDateData.records.map((r, i) => (
                      <div
                        key={r.id || r._id || i}
                        className="p-2.5 rounded-lg border border-academic-border bg-white flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <span className="font-mono font-bold text-academic-accent mr-1.5">
                            {r.subject?.code}
                          </span>
                          <span className="font-medium text-academic-navy truncate">
                            {r.subject?.name}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                            r.status === "present"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {r.status === "present" ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <XCircle className="w-3 h-3 text-rose-600" />
                          )}
                          {r.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-academic-border bg-slate-50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setActiveDateModal(null);
                  setViewMode("list");
                  setSearchQuery(modalDateData.date);
                }}
                className="px-4 py-2 rounded-lg border border-academic-border bg-white text-xs font-bold text-academic-navy hover:bg-slate-100 transition-colors shadow-soft"
              >
                View Details
              </button>
              <button
                type="button"
                onClick={() => setActiveDateModal(null)}
                className="px-4 py-2 rounded-lg bg-academic-navy hover:bg-academic-navy-light text-xs font-bold text-white transition-colors shadow-soft"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Attendance;
