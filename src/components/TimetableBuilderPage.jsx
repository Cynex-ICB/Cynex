import { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  Clock,
  Save,
  Printer,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  FileText,
  Download,
  Layers,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Edit2,
  UserCheck,
  X,
  Check,
} from "lucide-react";
import { API_BASE_URL, readApiJson } from "../utils/api.js";
import { exportTimetableToPdf, exportTimetableToDocx } from "../utils/timetableExport.js";

import {
  DEFAULT_TIME_SLOTS,
  DAYS,
  PRESET_TIMETABLES,
  COMMON_TAGS,
  createEmptyGrid,
} from "../utils/timetablePresets.js";

export default function TimetableBuilderPage({ token }) {
  const [selectedSemester, setSelectedSemester] = useState(5);
  const [selectedSection, setSelectedSection] = useState("A");
  const [academicYear, setAcademicYear] = useState("2026-27");
  const [scheme, setScheme] = useState("2022");
  const [classCoordinator, setClassCoordinator] = useState("Prof. JYOTHIBA R C");
  const [roomNo, setRoomNo] = useState("G04");
  const [effectiveDate, setEffectiveDate] = useState("10-08-2026");

  const [timeSlots, setTimeSlots] = useState(DEFAULT_TIME_SLOTS);
  const [grid, setGrid] = useState(() => PRESET_TIMETABLES[5]?.grid || createEmptyGrid());
  const [courses, setCourses] = useState(() => PRESET_TIMETABLES[5]?.courses || []);

  const [savedTimetables, setSavedTimetables] = useState([]);
  const [semesterSubjects, setSemesterSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [activeCell, setActiveCell] = useState(null); // { day, slotIndex }
  const [cellSubjectInput, setCellSubjectInput] = useState("");
  const [cellSpanInput, setCellSpanInput] = useState(1);
  const [printPreviewMode, setPrintPreviewMode] = useState(false);
  const editorPanelRef = useRef(null);

  // Auto-close editing panel when user clicks outside or hits Escape
  useEffect(() => {
    if (!activeCell) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setActiveCell(null);
      }
    };

    const handleClickOutside = (e) => {
      // Don't close if clicking inside the editor panel
      if (editorPanelRef.current && editorPanelRef.current.contains(e.target)) {
        return;
      }
      // Don't close if clicking another timetable cell (let handleCellClick take over)
      if (e.target.closest("td[data-cell='true']")) {
        return;
      }
      setActiveCell(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeCell]);

  // Load existing timetables & database subjects on mount or semester change
  useEffect(() => {
    loadSavedTimetables();
  }, [token]);

  useEffect(() => {
    setActiveCell(null);
    loadSemesterSubjects(selectedSemester);
    fetchOrLoadTimetable(selectedSemester, selectedSection, academicYear);
  }, [selectedSemester, selectedSection, academicYear, token]);

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  const loadSavedTimetables = async () => {
    try {
      const data = await readApiJson(
        await fetch(`${API_BASE_URL}/timetables`, { headers: authHeaders })
      );
      setSavedTimetables(data.timetables || []);
    } catch {
      // ignore
    }
  };

  const loadSemesterSubjects = async (sem) => {
    try {
      const data = await readApiJson(
        await fetch(`${API_BASE_URL}/subjects?semester=${sem}`, { headers: authHeaders })
      );
      setSemesterSubjects(data.subjects || []);
    } catch {
      setSemesterSubjects([]);
    }
  };

  const fetchOrLoadTimetable = async (sem, sec, year) => {
    setIsLoading(true);
    setStatusMessage("");
    setErrorMessage("");
    try {
      const data = await readApiJson(
        await fetch(`${API_BASE_URL}/timetables/by-semester/${sem}?section=${sec}`, {
          headers: authHeaders,
        })
      );
      if (data.timetable) {
        applyTimetableData(data.timetable);
        return;
      }
    } catch {
      // not saved yet, check presets
    } finally {
      setIsLoading(false);
    }

    // Fallback to preset or clean template
    loadPresetOrEmpty(sem);
  };

  const applyTimetableData = (tt) => {
    setAcademicYear(tt.academicYear || "2026-27");
    setScheme(tt.scheme || "2022");
    setClassCoordinator(tt.classCoordinator || "");
    setRoomNo(tt.roomNo || "");
    setEffectiveDate(tt.effectiveDate || "");
    if (Array.isArray(tt.timeSlots) && tt.timeSlots.length > 0) {
      setTimeSlots(tt.timeSlots);
    }
    if (tt.grid && Object.keys(tt.grid).length > 0) {
      setGrid(tt.grid);
    }
    if (Array.isArray(tt.courses)) {
      setCourses(tt.courses);
    }
  };

  const loadPresetOrEmpty = (sem) => {
    const preset = PRESET_TIMETABLES[sem];
    if (preset) {
      setAcademicYear(preset.academicYear);
      setScheme(preset.scheme);
      setClassCoordinator(preset.classCoordinator);
      setRoomNo(preset.roomNo);
      setEffectiveDate(preset.effectiveDate);
      setCourses(preset.courses);
      setGrid(preset.grid);
    } else {
      setClassCoordinator("");
      setRoomNo("");
      setEffectiveDate("");
      setCourses([]);
      setGrid(createEmptyGrid());
    }
  };

  const handleCellClick = (day, slotIndex) => {
    const slot = timeSlots[slotIndex];
    if (slot?.isBreak) return;

    const row = grid[day] || [];
    const cell = row[slotIndex] || { subject: "", span: 1 };
    setActiveCell({ day, slotIndex });
    setCellSubjectInput(cell.subject || "");
    setCellSpanInput(cell.span || 1);
  };

  const applyCellUpdate = (subjectName, spanCount) => {
    if (!activeCell) return;
    const { day, slotIndex } = activeCell;
    const span = Math.max(1, Math.min(Number(spanCount) || 1, timeSlots.length - slotIndex));

    setGrid((prev) => {
      const next = { ...prev };
      const row = [...(next[day] || [])];

      // Clean old spans for this cell
      const oldCell = row[slotIndex];
      const oldSpan = oldCell?.span || 1;
      for (let i = 1; i < oldSpan && slotIndex + i < row.length; i++) {
        if (row[slotIndex + i]) {
          row[slotIndex + i] = { ...row[slotIndex + i], isSpanned: false };
        }
      }

      // Apply new cell
      row[slotIndex] = {
        slotId: timeSlots[slotIndex]?.id || `s${slotIndex}`,
        subject: subjectName,
        span,
        isSpanned: false,
      };

      // Mark subsequent cells as spanned if span > 1
      for (let i = 1; i < span && slotIndex + i < row.length; i++) {
        row[slotIndex + i] = {
          slotId: timeSlots[slotIndex + i]?.id || `s${slotIndex + i}`,
          subject: subjectName,
          isSpanned: true,
        };
      }

      next[day] = row;
      return next;
    });

    setActiveCell(null);
  };

  const saveTimetable = async () => {
    setIsSaving(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      const payload = {
        academicYear,
        scheme,
        semester: Number(selectedSemester),
        section: selectedSection,
        classCoordinator,
        roomNo,
        effectiveDate,
        timeSlots,
        grid,
        courses,
      };

      const data = await readApiJson(
        await fetch(`${API_BASE_URL}/timetables`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify(payload),
        })
      );

      setStatusMessage(`Timetable for Semester ${selectedSemester} Section ${selectedSection} saved & published!`);
      loadSavedTimetables();
    } catch (err) {
      setErrorMessage(err.message || "Failed to save timetable.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTimetable = async (id) => {
    if (!window.confirm("Are you sure you want to remove this timetable?")) return;
    try {
      await readApiJson(
        await fetch(`${API_BASE_URL}/timetables/${id}`, {
          method: "DELETE",
          headers: authHeaders,
        })
      );
      setStatusMessage("Timetable deleted.");
      loadSavedTimetables();
    } catch (err) {
      setErrorMessage(err.message || "Failed to delete timetable.");
    }
  };

  // Sync courses with subjects from database
  const syncCoursesWithDb = () => {
    if (semesterSubjects.length === 0) {
      alert("No subjects found in database for Semester " + selectedSemester);
      return;
    }
    const mapped = semesterSubjects.map((sub) => {
      // Extract short name from subject name or code if available
      const match = sub.name.match(/\(([^)]+)\)$/);
      const shortName = match ? match[1] : sub.code.replace(/^[0-9]+|[0-9]+$/g, "");
      return {
        code: sub.code,
        shortName: shortName || sub.code,
        name: sub.name.replace(/\s*\([^)]*\)$/, ""),
        faculty: sub.instructor || "Faculty In-Charge",
        facultyInitial: (sub.instructor || "FAC")
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase(),
        credits: sub.credits || 3,
      };
    });
    setCourses(mapped);
    setStatusMessage(`Imported ${mapped.length} subjects from database into course allocation.`);
  };

  const addCourseRow = () => {
    setCourses((prev) => [
      ...prev,
      { code: "", shortName: "", name: "", faculty: "", facultyInitial: "", credits: 3 },
    ]);
  };

  const updateCourseRow = (index, field, value) => {
    setCourses((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeCourseRow = (index) => {
    setCourses((prev) => prev.filter((_, i) => i !== index));
  };

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  const handleExportPdf = () => {
    try {
      setIsExportingPdf(true);
      exportTimetableToPdf({
        academicYear,
        scheme,
        semester: selectedSemester,
        section: selectedSection,
        classCoordinator,
        roomNo,
        effectiveDate,
        timeSlots,
        grid,
        courses,
      });
      setStatusMessage(`PDF timetable for Semester ${selectedSemester} downloaded!`);
    } catch (err) {
      setErrorMessage("Failed to export PDF: " + err.message);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportDocx = async () => {
    try {
      setIsExportingDocx(true);
      await exportTimetableToDocx({
        academicYear,
        scheme,
        semester: selectedSemester,
        section: selectedSection,
        classCoordinator,
        roomNo,
        effectiveDate,
        timeSlots,
        grid,
        courses,
      });
      setStatusMessage(`Word (.docx) timetable for Semester ${selectedSemester} downloaded!`);
    } catch (err) {
      setErrorMessage("Failed to export DOCX: " + err.message);
    } finally {
      setIsExportingDocx(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="institutional-card p-5 sm:p-6 bg-gradient-to-r from-academic-navy to-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-white/10 text-academic-gold-light text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Master Timetable Builder</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Department Timetable &amp; Lab Allocation Studio
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Design, edit, and publish official college timetables with multi-period lab blocks and course allocation tables matching the VTU institutional format.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* PDF Export Button */}
          <button
            type="button"
            disabled={isExportingPdf}
            onClick={handleExportPdf}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-700/80 hover:bg-rose-700 text-white text-xs font-semibold shadow-soft transition-colors disabled:opacity-50"
            title="Download formatted PDF timetable document"
          >
            <Download className="w-3.5 h-3.5 text-rose-200" />
            <span>{isExportingPdf ? "Generating..." : "Export PDF"}</span>
          </button>

          {/* Word DOCX Export Button */}
          <button
            type="button"
            disabled={isExportingDocx}
            onClick={handleExportDocx}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-700/80 hover:bg-blue-700 text-white text-xs font-semibold shadow-soft transition-colors disabled:opacity-50"
            title="Download editable Microsoft Word (.docx) timetable"
          >
            <FileText className="w-3.5 h-3.5 text-blue-200" />
            <span>{isExportingDocx ? "Generating..." : "Export Word (.docx)"}</span>
          </button>

          <button
            type="button"
            onClick={() => setPrintPreviewMode((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-academic-gold-light" />
            <span>{printPreviewMode ? "Edit Mode" : "Official Print Preview"}</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={saveTimetable}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Saving..." : "Save & Publish"}</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage("")} className="text-emerald-700 hover:underline">
            ✕
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage("")} className="text-rose-700 hover:underline">
            ✕
          </button>
        </div>
      )}

      {/* Semester & Meta Selector Tabs */}
      <div className="institutional-card p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-academic-border pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-academic-navy uppercase tracking-wider font-mono">
              Active Semester:
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {[3, 5, 7].map((sem) => (
                <button
                  key={sem}
                  type="button"
                  onClick={() => setSelectedSemester(sem)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    selectedSemester === sem
                      ? "bg-academic-navy text-white shadow-soft"
                      : "text-slate-600 hover:text-academic-navy hover:bg-slate-200"
                  }`}
                >
                  Semester {sem}
                </button>
              ))}
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(Number(e.target.value))}
                className="text-xs font-bold bg-transparent border-0 px-2 py-1 text-slate-700 focus:outline-none"
              >
                {[1, 2, 4, 6, 8].map((s) => (
                  <option key={s} value={s}>
                    Sem {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadPresetOrEmpty(selectedSemester)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-academic-border bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-soft"
              title="Reset to uploaded timetable preset"
            >
              <RefreshCw className="w-3.5 h-3.5 text-academic-accent" />
              <span>Load Department Template</span>
            </button>
          </div>
        </div>

        {/* Timetable Header Metadata Form */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-academic-text-muted uppercase mb-1">
              Academic Year
            </label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded border border-academic-border bg-slate-50 font-semibold text-academic-navy"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-academic-text-muted uppercase mb-1">
              Scheme
            </label>
            <input
              type="text"
              value={scheme}
              onChange={(e) => setScheme(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded border border-academic-border bg-slate-50 font-semibold text-academic-navy"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-academic-text-muted uppercase mb-1">
              Section
            </label>
            <input
              type="text"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value.toUpperCase())}
              className="w-full px-2.5 py-1.5 rounded border border-academic-border bg-slate-50 font-semibold text-academic-navy"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-academic-text-muted uppercase mb-1">
              Room No
            </label>
            <input
              type="text"
              value={roomNo}
              onChange={(e) => setRoomNo(e.target.value)}
              placeholder="e.g. G04"
              className="w-full px-2.5 py-1.5 rounded border border-academic-border bg-slate-50 font-semibold text-academic-navy"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold text-academic-text-muted uppercase mb-1">
              Class Coordinator
            </label>
            <input
              type="text"
              value={classCoordinator}
              onChange={(e) => setClassCoordinator(e.target.value)}
              placeholder="e.g. Prof. JYOTHIBA R C"
              className="w-full px-2.5 py-1.5 rounded border border-academic-border bg-slate-50 font-semibold text-academic-navy"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-academic-text-muted uppercase mb-1">
              w.e.f. (Date)
            </label>
            <input
              type="text"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              placeholder="DD-MM-YYYY"
              className="w-full px-2.5 py-1.5 rounded border border-academic-border bg-slate-50 font-semibold text-academic-navy"
            />
          </div>
        </div>
      </div>

      {/* Main Timetable Matrix & Editing Panel Section (Left: Timetable, Right: Editing Options) */}
      <div className="flex flex-col xl:flex-row items-start gap-5">
        {/* Left Side: Timetable Matrix */}
        <div
          className={`institutional-card p-4 sm:p-6 overflow-hidden transition-all duration-200 ${
            activeCell ? "xl:flex-1 w-full min-w-0" : "w-full"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-academic-navy">
                Timetable Matrix — Sem {selectedSemester} (Sec {selectedSection})
              </h3>
              <p className="text-xs text-academic-text-muted">
                Click any period cell to open the editor on the right.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {activeCell && (
                <button
                  type="button"
                  onClick={() => setActiveCell(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 transition-colors inline-flex items-center gap-1"
                  title="Close cell editor (Esc)"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Close Editor</span>
                </button>
              )}
              <div className="text-xs font-mono text-academic-text-muted">
                w.e.f: <span className="font-bold text-academic-navy">{effectiveDate || "—"}</span>
              </div>
            </div>
          </div>

          {/* Timetable Grid Container */}
          <div className="overflow-x-auto border border-academic-navy rounded-lg shadow-sm">
            <table className="w-full border-collapse text-center text-xs">
              <thead>
                {/* Header row 1: Time range */}
                <tr className="bg-academic-navy text-white divide-x divide-academic-navy-light font-semibold">
                  <th className="py-2.5 px-3 w-16 bg-academic-navy">
                    <div className="text-[10px] text-slate-300">Time</div>
                    <div>Day</div>
                  </th>
                  {timeSlots.map((slot) => (
                    <th
                      key={slot.id}
                      className={`py-2 px-2 text-[11px] ${
                        slot.isBreak ? "bg-amber-900/60 w-14 font-mono" : "min-w-[95px]"
                      }`}
                    >
                      <div className="whitespace-pre-line leading-tight">{slot.time}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-academic-border bg-white">
                {DAYS.map((day) => {
                  const row = grid[day] || [];
                  return (
                    <tr key={day} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-2 font-bold text-academic-navy bg-slate-100 border-r border-academic-border">
                        {day}
                      </td>
                      {timeSlots.map((slot, slotIdx) => {
                        const cell = row[slotIdx] || { subject: "", span: 1 };
                        if (cell.isSpanned) return null; // already covered by a previous colSpan

                        const isBreak = slot.isBreak;
                        const hasSpan = (cell.span || 1) > 1;
                        const isCurrentActive =
                          activeCell?.day === day && activeCell?.slotIndex === slotIdx;

                        if (isBreak) {
                          return (
                            <td
                              key={slot.id}
                              className="bg-amber-50/80 text-amber-900 font-bold text-[10px] tracking-wider py-2 px-1 border-r border-academic-border select-none"
                              style={{ writingMode: "vertical-rl", textOrientation: "upright" }}
                            >
                              {cell.subject || slot.label.toUpperCase()}
                            </td>
                          );
                        }

                        return (
                          <td
                            key={slot.id}
                            data-cell="true"
                            colSpan={cell.span || 1}
                            onClick={() => handleCellClick(day, slotIdx)}
                            className={`py-2.5 px-2 border-r border-academic-border cursor-pointer transition-all select-none ${
                              hasSpan
                                ? "bg-blue-50/80 font-bold text-academic-navy border-2 border-blue-200"
                                : cell.subject
                                ? "font-semibold text-slate-800 hover:bg-blue-50/60"
                                : "text-slate-300 hover:bg-slate-100"
                            } ${
                              isCurrentActive
                                ? "ring-2 ring-academic-accent bg-blue-100/90 shadow-inner font-bold"
                                : ""
                            }`}
                          >
                            <div className="min-h-[36px] flex flex-col items-center justify-center">
                              <span className="text-xs break-words max-w-[160px]">
                                {cell.subject || "—"}
                              </span>
                              {hasSpan && (
                                <span className="text-[10px] text-blue-600 font-mono mt-0.5 font-bold">
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

        {/* Right Side: Quick Cell Editor Panel (Sidebar closes when not in use) */}
        {activeCell && (
          <aside
            ref={editorPanelRef}
            className="w-full xl:w-96 flex-shrink-0 institutional-card p-4 sm:p-5 border-2 border-academic-accent bg-slate-50/95 shadow-xl rounded-xl space-y-4 animate-in slide-in-from-right-4 duration-200 xl:sticky xl:top-6 z-20"
          >
            {/* Header with Title and close button */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-100 text-academic-accent">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-academic-navy uppercase tracking-wider">
                    Cell Editor
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {activeCell.day} · {timeSlots[activeCell.slotIndex]?.label} (
                    {timeSlots[activeCell.slotIndex]?.time})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveCell(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors"
                title="Close panel (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inputs: Subject & Period Span */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Subject / Lab / Activity Title
                </label>
                <input
                  type="text"
                  autoFocus
                  value={cellSubjectInput}
                  onChange={(e) => setCellSubjectInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      applyCellUpdate(cellSubjectInput, cellSpanInput);
                    }
                  }}
                  placeholder="e.g. AI, TOC, IOT LAB (G06)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-academic-navy focus:ring-2 focus:ring-academic-accent shadow-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Period Span (ColSpan)
                </label>
                <select
                  value={cellSpanInput}
                  onChange={(e) => setCellSpanInput(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-academic-navy focus:ring-2 focus:ring-academic-accent shadow-sm"
                >
                  <option value={1}>1 Period (Standard 50m)</option>
                  <option value={2}>2 Periods (Double Block)</option>
                  <option value={3}>3 Periods (Full Lab / Afternoon)</option>
                </select>
              </div>
            </div>

            {/* Database Subject Quick-Picks */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Database Subjects (Sem {selectedSemester}):
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                {courses.length > 0 ? (
                  courses.map((c) => (
                    <button
                      key={c.code || c.shortName}
                      type="button"
                      onClick={() => {
                        setCellSubjectInput(c.shortName || c.code);
                      }}
                      className="px-2 py-1 rounded bg-white hover:bg-blue-50 hover:border-blue-400 border border-slate-300 text-slate-800 text-[11px] font-bold transition-all shadow-2xs"
                      title={c.name}
                    >
                      {c.shortName} <span className="text-[10px] text-slate-400 font-normal">({c.facultyInitial || "FAC"})</span>
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No courses in allocation table</span>
                )}
              </div>
            </div>

            {/* Common Tags & Labs */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Activities &amp; Labs:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setCellSubjectInput(tag)}
                    className="px-2 py-0.5 rounded bg-slate-200/90 hover:bg-slate-300 text-slate-700 text-[11px] font-semibold transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons: Clear, Cancel, Apply */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => applyCellUpdate("", 1)}
                className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors"
              >
                Clear Slot
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCell(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => applyCellUpdate(cellSubjectInput, cellSpanInput)}
                  className="px-4 py-1.5 rounded-lg bg-academic-navy hover:bg-academic-navy-light text-white text-xs font-bold shadow-soft transition-colors inline-flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5 text-academic-gold-light" />
                  <span>Apply</span>
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Course Allocation Table */}
      <div className="institutional-card p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-academic-border pb-3">
          <div>
            <h3 className="text-base font-bold text-academic-navy">
              Allocation of Courses (Semester {selectedSemester})
            </h3>
            <p className="text-xs text-academic-text-muted">
              Course codes, full syllabus names, faculty in-charge allocations, and initials.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={syncCoursesWithDb}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-academic-border bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-soft"
            >
              <RefreshCw className="w-3.5 h-3.5 text-academic-accent" />
              <span>Auto-Fill from Database</span>
            </button>
            <button
              type="button"
              onClick={addCourseRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-academic-navy text-white text-xs font-semibold hover:bg-academic-navy-light transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Course</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-academic-border rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 border-b border-academic-border text-academic-text-muted font-mono uppercase text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Course Code</th>
                <th className="py-2.5 px-3">Short Tag</th>
                <th className="py-2.5 px-3">Course Name</th>
                <th className="py-2.5 px-3">Faculty In-Charge</th>
                <th className="py-2.5 px-3 text-center">Initial</th>
                <th className="py-2.5 px-3 text-center">Credits</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-academic-border bg-white">
              {courses.map((course, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-2 px-3 font-mono font-bold text-academic-navy">
                    <input
                      type="text"
                      value={course.code}
                      onChange={(e) => updateCourseRow(idx, "code", e.target.value)}
                      placeholder="BCS501"
                      className="w-24 px-2 py-1 border border-slate-200 rounded font-mono text-xs font-bold"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={course.shortName}
                      onChange={(e) => updateCourseRow(idx, "shortName", e.target.value)}
                      placeholder="SEPM"
                      className="w-20 px-2 py-1 border border-slate-200 rounded font-bold text-xs"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={course.name}
                      onChange={(e) => updateCourseRow(idx, "name", e.target.value)}
                      placeholder="Course Title"
                      className="w-full min-w-[200px] px-2 py-1 border border-slate-200 rounded text-xs"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={course.faculty}
                      onChange={(e) => updateCourseRow(idx, "faculty", e.target.value)}
                      placeholder="Prof. Name"
                      className="w-full min-w-[150px] px-2 py-1 border border-slate-200 rounded text-xs font-medium"
                    />
                  </td>
                  <td className="py-2 px-3 text-center">
                    <input
                      type="text"
                      value={course.facultyInitial}
                      onChange={(e) => updateCourseRow(idx, "facultyInitial", e.target.value)}
                      placeholder="NHN"
                      className="w-14 px-2 py-1 border border-slate-200 rounded text-center font-mono font-bold text-xs"
                    />
                  </td>
                  <td className="py-2 px-3 text-center">
                    <input
                      type="number"
                      value={course.credits}
                      onChange={(e) => updateCourseRow(idx, "credits", Number(e.target.value))}
                      className="w-12 px-2 py-1 border border-slate-200 rounded text-center text-xs font-bold"
                    />
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => removeCourseRow(idx)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove course"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Saved Department Timetables Registry */}
      <div className="institutional-card p-4 sm:p-6 space-y-3">
        <h3 className="text-sm font-bold text-academic-navy uppercase tracking-wider font-mono">
          Database Timetables Registry
        </h3>
        {savedTimetables.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {savedTimetables.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-lg border border-academic-border bg-slate-50 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-academic-navy block">
                    Semester {item.semester} — Section {item.section}
                  </span>
                  <span className="text-[11px] text-academic-text-muted">
                    {item.academicYear} · Room {item.roomNo || "—"} · w.e.f {item.effectiveDate || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSemester(item.semester);
                      setSelectedSection(item.section);
                      setAcademicYear(item.academicYear);
                      applyTimetableData(item);
                    }}
                    className="px-2.5 py-1 rounded bg-white border border-slate-300 text-xs font-semibold text-academic-navy hover:bg-slate-100 shadow-soft"
                  >
                    Load
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteTimetable(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-academic-text-muted">No timetables saved in database yet.</p>
        )}
      </div>

      {/* Official Print Preview Modal / Section */}
      {printPreviewMode && (
        <div className="institutional-card p-8 bg-white border-2 border-slate-300 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <span className="text-xs font-bold text-academic-navy uppercase font-mono">
              Official Institutional Document Preview
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isExportingPdf}
                onClick={handleExportPdf}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-soft transition-colors disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
              <button
                type="button"
                disabled={isExportingDocx}
                onClick={handleExportDocx}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-soft transition-colors disabled:opacity-50"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Export Word (.docx)</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 rounded-lg bg-academic-navy text-white text-xs font-bold hover:bg-academic-navy-light flex items-center gap-1.5 shadow-soft transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-academic-gold-light" />
                <span>Print Document</span>
              </button>
              <button
                type="button"
                onClick={() => setPrintPreviewMode(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
              >
                Close Preview
              </button>
            </div>
          </div>

          {/* Institutional Document Header */}
          <div className="text-center space-y-1">
            <h2 className="text-base font-extrabold text-academic-navy tracking-wide">
              ALVA'S INSTITUTE OF ENGINEERING &amp; TECHNOLOGY
            </h2>
            <p className="text-[11px] text-slate-600">
              Shobhavana Campus, Mijar, Moodbidri, D.K - 574225 (Accredited by NAAC with A+ Grade)
            </p>
            <p className="text-[11px] font-bold text-slate-800">
              DEPARTMENT OF CSE (IoT &amp; Cyber Security Including Blockchain)
            </p>
            <h3 className="text-sm font-extrabold underline tracking-wider pt-2">TIME TABLE</h3>
            <p className="text-xs font-semibold text-right">w.e.f: {effectiveDate || "—"}</p>
          </div>

          {/* Meta Table */}
          <table className="w-full border-collapse border border-slate-900 text-xs text-center font-medium">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-900">
                <th className="border-r border-slate-900 py-1.5 px-2">Academic Year</th>
                <th className="border-r border-slate-900 py-1.5 px-2">Scheme</th>
                <th className="border-r border-slate-900 py-1.5 px-2">Semester</th>
                <th className="border-r border-slate-900 py-1.5 px-2">Section</th>
                <th className="border-r border-slate-900 py-1.5 px-2">Class Coordinator</th>
                <th className="py-1.5 px-2">Room No</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-r border-slate-900 py-1.5 font-bold">{academicYear}</td>
                <td className="border-r border-slate-900 py-1.5 font-bold">{scheme}</td>
                <td className="border-r border-slate-900 py-1.5 font-bold">{selectedSemester}</td>
                <td className="border-r border-slate-900 py-1.5 font-bold">{selectedSection}</td>
                <td className="border-r border-slate-900 py-1.5 font-bold">{classCoordinator}</td>
                <td className="py-1.5 font-bold">{roomNo}</td>
              </tr>
            </tbody>
          </table>

          {/* Grid Table */}
          <table className="w-full border-collapse border border-slate-900 text-xs text-center font-medium">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-900">
                <th className="border-r border-slate-900 py-2 px-1">Day</th>
                {timeSlots.map((slot) => (
                  <th key={slot.id} className="border-r border-slate-900 py-2 px-1 text-[11px]">
                    {slot.time}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day) => {
                const row = grid[day] || [];
                return (
                  <tr key={day} className="border-b border-slate-900">
                    <td className="border-r border-slate-900 py-2 font-bold bg-slate-50">{day}</td>
                    {timeSlots.map((slot, idx) => {
                      const cell = row[idx] || { subject: "", span: 1 };
                      if (cell.isSpanned) return null;
                      if (slot.isBreak) {
                        return (
                          <td
                            key={slot.id}
                            className="border-r border-slate-900 font-bold text-[10px] bg-slate-100"
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
                          className="border-r border-slate-900 py-2 px-1 font-semibold"
                        >
                          {cell.subject || "—"}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Courses Table */}
          <div>
            <h4 className="text-xs font-bold text-center underline mb-2">Allocation of Courses</h4>
            <table className="w-full border-collapse border border-slate-900 text-xs text-left">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-900">
                  <th className="border-r border-slate-900 py-1.5 px-3">Course Code</th>
                  <th className="border-r border-slate-900 py-1.5 px-3">Short</th>
                  <th className="border-r border-slate-900 py-1.5 px-3">Course Name</th>
                  <th className="border-r border-slate-900 py-1.5 px-3">Faculty Name</th>
                  <th className="py-1.5 px-3 text-center">Initial</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c, i) => (
                  <tr key={i} className="border-b border-slate-900">
                    <td className="border-r border-slate-900 py-1.5 px-3 font-mono font-bold">{c.code}</td>
                    <td className="border-r border-slate-900 py-1.5 px-3 font-bold">{c.shortName}</td>
                    <td className="border-r border-slate-900 py-1.5 px-3">{c.name}</td>
                    <td className="border-r border-slate-900 py-1.5 px-3 font-medium">{c.faculty}</td>
                    <td className="py-1.5 px-3 text-center font-mono font-bold">{c.facultyInitial}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Official Signatures Row */}
          <div className="pt-10 flex items-center justify-between text-xs font-bold text-academic-navy">
            <div className="text-center">
              <div className="w-32 border-b border-slate-800 mb-1"></div>
              <span>COORDINATOR</span>
            </div>
            <div className="text-center">
              <div className="w-32 border-b border-slate-800 mb-1"></div>
              <span>HOD</span>
            </div>
            <div className="text-center">
              <div className="w-32 border-b border-slate-800 mb-1"></div>
              <span>PRINCIPAL</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
