"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/dialog";
import {
  CalendarDays,
  Plus,
  Trash2,
  Clock,
  MapPin,
  Users,
  UserPlus,
  Mail,
  Phone,
  CheckSquare,
} from "lucide-react";

// ---- Types ----
interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  classes?: { id: string }[];
}

interface Student {
  id: string;
  name: string;
}

interface Enrollment {
  id: string;
  studentId: string;
  student: Student;
  status: string;
}

interface ClassItem {
  id: string;
  name: string;
  subject: string | null;
  teacherId: string;
  teacher: Teacher;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string | null;
  maxStudents: number;
  color: string | null;
  startDate: string | null;
  endDate: string | null;
  enrollments: Enrollment[];
}

function isExpired(cls: ClassItem): boolean {
  return !!cls.endDate && new Date(cls.endDate) < new Date();
}

function isFull(cls: ClassItem): boolean {
  return cls.enrollments.length >= cls.maxStudents;
}

interface ClassesClientProps {
  initialClasses: ClassItem[];
  initialTeachers: Teacher[];
  allStudents: Student[];
}

// ---- Constants ----
const DAYS = [
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
  { label: "Sunday", value: 0 },
];

const DAY_LABELS: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

// Ordered Mon→Sun for the weekly view
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

const COLORS = [
  { value: "blue", label: "Blue", bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200", dot: "bg-blue-500" },
  { value: "indigo", label: "Indigo", bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-200", dot: "bg-indigo-500" },
  { value: "emerald", label: "Emerald", bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-200", dot: "bg-emerald-500" },
  { value: "violet", label: "Violet", bg: "bg-violet-100", text: "text-violet-800", border: "border-violet-200", dot: "bg-violet-500" },
  { value: "rose", label: "Rose", bg: "bg-rose-100", text: "text-rose-800", border: "border-rose-200", dot: "bg-rose-500" },
  { value: "amber", label: "Amber", bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-200", dot: "bg-amber-500" },
  { value: "teal", label: "Teal", bg: "bg-teal-100", text: "text-teal-800", border: "border-teal-200", dot: "bg-teal-500" },
  { value: "orange", label: "Orange", bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200", dot: "bg-orange-500" },
];

function getColorClasses(color: string | null) {
  return COLORS.find((c) => c.value === color) ?? COLORS[0];
}

// ---- Time helpers ----
const HOUR_START = 7; // 7am
const HOUR_END = 21;  // 9pm
const TOTAL_HOURS = HOUR_END - HOUR_START;

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")}${ampm}`;
}

// ---- Hour labels for the schedule grid ----
const HOUR_LABELS = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => {
  const h = HOUR_START + i;
  const ampm = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return `${hour}${ampm}`;
});

// ---- Main Component ----
export function ClassesClient({ initialClasses, initialTeachers, allStudents }: ClassesClientProps) {
  const router = useRouter();

  const [classes, setClasses] = useState<ClassItem[]>(initialClasses);
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);

  // Dialog states
  const [showNewClass, setShowNewClass] = useState(false);
  const [showNewTeacher, setShowNewTeacher] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const detailPanelRef = useRef<HTMLDivElement>(null);
  const [showAssign, setShowAssign] = useState(false);

  // Attendance state
  const [showAttendance, setShowAttendance] = useState(false);
  const [attendanceIds, setAttendanceIds] = useState<string[]>([]);
  const [attendanceSubs, setAttendanceSubs] = useState<Record<string, { id: string; totalSessions: number; sessionsUsed: number } | null>>({});
  const [submittingAttendance, setSubmittingAttendance] = useState(false);
  const [attendanceResult, setAttendanceResult] = useState<Record<string, "ok" | "error" | "no-sub">>({});

  useEffect(() => {
    if (selectedClass) {
      detailPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedClass]);

  // Loading / error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // New class form
  const [classForm, setClassForm] = useState({
    name: "",
    subject: "",
    teacherId: "",
    dayOfWeek: "1",
    startTime: "09:00",
    endTime: "10:00",
    room: "",
    maxStudents: "20",
    color: "blue",
    startDate: "",
    endDate: "",
  });

  // New teacher form
  const [teacherForm, setTeacherForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
  });

  // Assign students state
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [assignErrors, setAssignErrors] = useState<Record<string, string>>({});

  // ---- Handlers: classes ----
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...classForm,
          dayOfWeek: Number(classForm.dayOfWeek),
          maxStudents: Number(classForm.maxStudents),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create class");
        return;
      }
      setClasses((prev) => [...prev, data]);
      setClassForm({
        name: "",
        subject: "",
        teacherId: "",
        dayOfWeek: "1",
        startTime: "09:00",
        endTime: "10:00",
        room: "",
        maxStudents: "20",
        color: "blue",
        startDate: "",
        endDate: "",
      });
      setShowNewClass(false);
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm("Delete this class? All enrollments will be removed.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/classes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setClasses((prev) => prev.filter((c) => c.id !== id));
        setSelectedClass(null);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete class");
      }
    } finally {
      setDeletingId(null);
    }
  };

  // ---- Handlers: teachers ----
  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teacherForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create teacher");
        return;
      }
      setTeachers((prev) => [data, ...prev]);
      setTeacherForm({ name: "", email: "", phone: "", subject: "" });
      setShowNewTeacher(false);
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // ---- Handlers: enroll ----
  const openAssign = (cls: ClassItem) => {
    setSelectedClass(cls);
    setSelectedStudentIds([]);
    setAssignErrors({});
    setShowAssign(true);
  };

  const enrolledIds = new Set(selectedClass?.enrollments.map((e) => e.studentId) ?? []);
  const unenrolledStudents = allStudents.filter((s) => !enrolledIds.has(s.id));

  const toggleStudentSelect = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleAssign = async () => {
    if (!selectedClass || selectedStudentIds.length === 0) return;
    setAssigning(true);
    setAssignErrors({});
    try {
      const results = await Promise.all(
        selectedStudentIds.map(async (studentId) => {
          const res = await fetch("/api/enrollments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studentId, classId: selectedClass.id }),
          });
          const data = await res.json();
          return { studentId, ok: res.ok, data };
        })
      );

      const errors: Record<string, string> = {};
      const succeeded = results.filter((r) => {
        if (!r.ok) { errors[r.studentId] = r.data.error; return false; }
        return true;
      });

      if (Object.keys(errors).length > 0) setAssignErrors(errors);

      if (succeeded.length > 0) {
        const newEnrollments = succeeded.map((r) => ({
          id: r.data.id,
          studentId: r.data.studentId,
          student: r.data.student,
          status: r.data.status,
        }));
        setClasses((prev) =>
          prev.map((c) =>
            c.id === selectedClass.id
              ? { ...c, enrollments: [...c.enrollments, ...newEnrollments] }
              : c
          )
        );
        setSelectedClass((prev) =>
          prev ? { ...prev, enrollments: [...prev.enrollments, ...newEnrollments] } : prev
        );
        setSelectedStudentIds((prev) => prev.filter((id) => errors[id]));
        router.refresh();
      }

      if (Object.keys(errors).length === 0) setShowAssign(false);
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveEnrollment = async (enrollmentId: string) => {
    if (!selectedClass) return;
    try {
      const res = await fetch("/api/enrollments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: enrollmentId }),
      });
      if (res.ok) {
        const updatedEnrollments = selectedClass.enrollments.filter((e) => e.id !== enrollmentId);
        const updatedClass = { ...selectedClass, enrollments: updatedEnrollments };
        setSelectedClass(updatedClass);
        setClasses((prev) => prev.map((c) => (c.id === selectedClass.id ? updatedClass : c)));
        router.refresh();
      }
    } catch {
      // silent
    }
  };

  // ---- Handlers: attendance ----
  const openAttendance = async (cls: ClassItem) => {
    setSelectedClass(cls);
    setAttendanceIds([]);
    setAttendanceResult({});
    setShowAttendance(true);
    // Fetch each enrolled student's active subscription
    const subsMap: Record<string, { id: string; totalSessions: number; sessionsUsed: number } | null> = {};
    await Promise.all(
      cls.enrollments.map(async (enr) => {
        try {
          const res = await fetch(`/api/subscriptions?studentId=${enr.studentId}`);
          const subs = await res.json();
          const active = Array.isArray(subs) ? subs.find((s: { status: string }) => s.status === "active") : null;
          subsMap[enr.studentId] = active
            ? { id: active.id, totalSessions: active.totalSessions, sessionsUsed: active.sessions?.length ?? 0 }
            : null;
        } catch {
          subsMap[enr.studentId] = null;
        }
      })
    );
    setAttendanceSubs(subsMap);
  };

  const handleSubmitAttendance = async () => {
    if (!selectedClass || attendanceIds.length === 0) return;
    setSubmittingAttendance(true);
    const result: Record<string, "ok" | "error" | "no-sub"> = {};
    await Promise.all(
      attendanceIds.map(async (studentId) => {
        const sub = attendanceSubs[studentId];
        if (!sub) { result[studentId] = "no-sub"; return; }
        try {
          const res = await fetch("/api/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subscriptionId: sub.id, classId: selectedClass.id }),
          });
          result[studentId] = res.ok ? "ok" : "error";
          if (res.ok) {
            setAttendanceSubs((prev) => ({
              ...prev,
              [studentId]: prev[studentId] ? { ...prev[studentId]!, sessionsUsed: prev[studentId]!.sessionsUsed + 1 } : null,
            }));
          }
        } catch {
          result[studentId] = "error";
        }
      })
    );
    setAttendanceResult(result);
    setAttendanceIds([]);
    setSubmittingAttendance(false);
  };

  // ---- Weekly schedule rendering ----
  const classesByDay: Record<number, ClassItem[]> = {};
  WEEK_ORDER.forEach((d) => {
    classesByDay[d] = classes.filter((c) => c.dayOfWeek === d);
  });

  const GRID_HEIGHT_PX = 800;
  const PX_PER_MINUTE = GRID_HEIGHT_PX / (TOTAL_HOURS * 60);

  function getBlockStyle(cls: ClassItem) {
    const startMins = timeToMinutes(cls.startTime) - HOUR_START * 60;
    const endMins = timeToMinutes(cls.endTime) - HOUR_START * 60;
    const top = Math.max(0, startMins * PX_PER_MINUTE);
    const height = Math.max(24, (endMins - startMins) * PX_PER_MINUTE);
    return { top: `${top}px`, height: `${height}px` };
  }

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-8">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Classes</h1>
          <p className="mt-1 text-muted-foreground">
            {classes.length} class{classes.length !== 1 ? "es" : ""} scheduled
          </p>
        </div>
        <Button
          onClick={() => { setError(""); setSelectedClass(null); setShowNewClass(true); }}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border-0"
        >
          <Plus className="size-4" />
          New Class
        </Button>
      </div>

      {/* ---- Weekly Schedule ---- */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="size-4 text-indigo-600" />
            Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {classes.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center px-6">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                <CalendarDays className="size-7 text-emerald-500" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">No classes yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first class to see the weekly schedule.
              </p>
              <Button
                onClick={() => { setError(""); setSelectedClass(null); setShowNewClass(true); }}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border-0"
              >
                <Plus className="size-4" /> New Class
              </Button>
            </div>
          ) : (
            <div className="flex min-w-[700px]">
              {/* Time axis */}
              <div className="w-14 shrink-0 border-r border-border">
                <div className="h-10 border-b border-border" /> {/* header spacer */}
                <div className="relative" style={{ height: `${GRID_HEIGHT_PX}px` }}>
                  {HOUR_LABELS.map((label, i) => (
                    <div
                      key={label}
                      className="absolute right-2 text-xs text-muted-foreground leading-none"
                      style={{ top: `${(i / TOTAL_HOURS) * 100}%`, transform: "translateY(-50%)" }}
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Day columns */}
              {WEEK_ORDER.map((day) => (
                <div key={day} className="flex-1 border-r border-border last:border-r-0 min-w-0">
                  {/* Day header */}
                  <div className="h-10 flex items-center justify-center border-b border-border bg-muted/40 px-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {DAY_LABELS[day].slice(0, 3)}
                    </span>
                  </div>

                  {/* Time grid */}
                  <div className="relative" style={{ height: `${GRID_HEIGHT_PX}px` }}>
                    {/* Hour lines */}
                    {Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => (
                      <div
                        key={i}
                        className="absolute left-0 right-0 border-t border-border/50"
                        style={{ top: `${(i / TOTAL_HOURS) * 100}%` }}
                      />
                    ))}

                    {/* Class blocks */}
                    {classesByDay[day].map((cls) => {
                      const colorCls = getColorClasses(cls.color);
                      const expired = isExpired(cls);
                      const full = isFull(cls);
                      return (
                        <button
                          key={cls.id}
                          onClick={() => setSelectedClass(cls)}
                          className={`absolute left-0.5 right-0.5 rounded-md border px-1.5 py-1 text-left cursor-pointer hover:shadow-md transition-shadow overflow-hidden ${
                            expired ? "bg-gray-100 border-gray-200 text-gray-400 opacity-60" : `${colorCls.bg} ${colorCls.border} ${colorCls.text}`
                          }`}
                          style={getBlockStyle(cls)}
                        >
                          <p className="text-xs font-semibold leading-tight truncate">{cls.name}</p>
                          <p className="text-[10px] leading-tight opacity-75 truncate">
                            {formatTime(cls.startTime)}–{formatTime(cls.endTime)}
                          </p>
                          <p className="text-[10px] leading-tight opacity-75 truncate">
                            {cls.teacher.name}
                          </p>
                          {expired && (
                            <p className="text-[10px] font-semibold leading-tight text-gray-500">Expired</p>
                          )}
                          {!expired && full && (
                            <p className="text-[10px] font-semibold leading-tight">Full</p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---- Class Detail Dialog ---- */}
      <Dialog open={!!selectedClass} onClose={() => setSelectedClass(null)} className="max-w-2xl">
        {selectedClass && (
          <>
            <DialogHeader
              title={selectedClass.name}
              description={selectedClass.subject ?? undefined}
              onClose={() => setSelectedClass(null)}
            />
            <DialogBody className="space-y-5">
              {/* Meta info */}
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="size-4 text-indigo-500" />
                  {DAY_LABELS[selectedClass.dayOfWeek]}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="size-4 text-indigo-500" />
                  {formatTime(selectedClass.startTime)} – {formatTime(selectedClass.endTime)}
                </span>
                {selectedClass.room && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-4 text-indigo-500" />
                    {selectedClass.room}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Users className="size-4 text-indigo-500" />
                  {selectedClass.enrollments.length} / {selectedClass.maxStudents} students
                </span>
                {selectedClass.startDate && (
                  <span className="flex items-center gap-1.5">
                    From {new Date(selectedClass.startDate).toLocaleDateString()}
                  </span>
                )}
                {selectedClass.endDate && (
                  <span className={`flex items-center gap-1.5 ${isExpired(selectedClass) ? "text-red-500 font-medium" : ""}`}>
                    Until {new Date(selectedClass.endDate).toLocaleDateString()}
                    {isExpired(selectedClass) && " · Expired"}
                  </span>
                )}
              </div>

              {/* Capacity bar */}
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span className="font-semibold text-foreground">
                    Enrolled Students ({selectedClass.enrollments.length}/{selectedClass.maxStudents})
                  </span>
                  {isFull(selectedClass)
                    ? <span className="text-red-600 font-semibold">Full</span>
                    : <span>{selectedClass.maxStudents - selectedClass.enrollments.length} spots left</span>
                  }
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isFull(selectedClass) ? "bg-red-500" :
                      selectedClass.enrollments.length / selectedClass.maxStudents >= 0.8 ? "bg-amber-500" :
                      "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, (selectedClass.enrollments.length / selectedClass.maxStudents) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Student list */}
              {selectedClass.enrollments.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No students enrolled yet. Click &quot;Assign Students&quot; to add some.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedClass.enrollments.map((enr) => (
                    <div
                      key={enr.id}
                      className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                          {enr.student.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium truncate">{enr.student.name}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveEnrollment(enr.id)}
                        className="text-muted-foreground hover:text-red-600 transition-colors shrink-0"
                        title="Remove from class"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </DialogBody>
            <DialogFooter>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteClass(selectedClass.id)}
                disabled={deletingId === selectedClass.id}
                className="mr-auto text-muted-foreground hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="size-3.5 mr-1.5" />
                Delete
              </Button>
              <Button
                onClick={() => openAttendance(selectedClass)}
                size="sm"
                disabled={selectedClass.enrollments.length === 0 || isExpired(selectedClass)}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckSquare className="size-3.5" />
                Take Attendance
              </Button>
              <Button
                onClick={() => openAssign(selectedClass)}
                size="sm"
                disabled={isExpired(selectedClass) || isFull(selectedClass)}
                className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus className="size-3.5" />
                {isFull(selectedClass) ? "Class Full" : isExpired(selectedClass) ? "Expired" : "Assign Students"}
              </Button>
            </DialogFooter>
          </>
        )}
      </Dialog>

      {/* ---- Teachers Section ---- */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span>Teachers</span>
            <Badge variant="secondary">{teachers.length}</Badge>
          </h2>
          <Button
            onClick={() => { setError(""); setShowNewTeacher(true); }}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <Plus className="size-3.5" />
            Add Teacher
          </Button>
        </div>

        {teachers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                <Users className="size-6 text-blue-500" />
              </div>
              <p className="text-sm text-muted-foreground">No teachers yet. Add one to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {teachers.map((teacher) => (
              <Card key={teacher.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                      {teacher.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{teacher.name}</p>
                      {teacher.subject && (
                        <p className="text-xs text-muted-foreground mt-0.5">{teacher.subject}</p>
                      )}
                      <div className="mt-1.5 space-y-0.5">
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                          <Mail className="size-3 shrink-0" />
                          {teacher.email}
                        </p>
                        {teacher.phone && (
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Phone className="size-3 shrink-0" />
                            {teacher.phone}
                          </p>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {(teacher.classes?.length ?? 0)} class{(teacher.classes?.length ?? 0) !== 1 ? "es" : ""}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ---- Dialog: New Class ---- */}
      <Dialog open={showNewClass} onClose={() => { setShowNewClass(false); setError(""); }}>
        <DialogHeader
          title="Create New Class"
          description="Fill in the details for the new class."
          onClose={() => { setShowNewClass(false); setError(""); }}
        />
        <DialogBody>
          <form id="new-class-form" onSubmit={handleCreateClass} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cn">Class Name *</Label>
                <Input
                  id="cn"
                  placeholder="e.g. Math Beginners"
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="csubject">Subject</Label>
                <Input
                  id="csubject"
                  placeholder="e.g. Mathematics"
                  value={classForm.subject}
                  onChange={(e) => setClassForm({ ...classForm, subject: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cteacher">Teacher *</Label>
                {teachers.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">No teachers. Add a teacher first.</p>
                ) : (
                  <Select
                    id="cteacher"
                    value={classForm.teacherId}
                    onChange={(e) => setClassForm({ ...classForm, teacherId: e.target.value })}
                    required
                  >
                    <option value="">Select teacher...</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </Select>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cday">Day of Week *</Label>
                <Select
                  id="cday"
                  value={classForm.dayOfWeek}
                  onChange={(e) => setClassForm({ ...classForm, dayOfWeek: e.target.value })}
                >
                  {DAYS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cstart">Start Time *</Label>
                <Input
                  id="cstart"
                  type="time"
                  value={classForm.startTime}
                  onChange={(e) => setClassForm({ ...classForm, startTime: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cend">End Time *</Label>
                <Input
                  id="cend"
                  type="time"
                  value={classForm.endTime}
                  onChange={(e) => setClassForm({ ...classForm, endTime: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="croom">Room</Label>
                <Input
                  id="croom"
                  placeholder="e.g. Room 101"
                  value={classForm.room}
                  onChange={(e) => setClassForm({ ...classForm, room: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cmax">Max Students</Label>
                <Input
                  id="cmax"
                  type="number"
                  min="1"
                  max="100"
                  value={classForm.maxStudents}
                  onChange={(e) => setClassForm({ ...classForm, maxStudents: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cstartdate">Start Date</Label>
                <Input
                  id="cstartdate"
                  type="date"
                  value={classForm.startDate}
                  onChange={(e) => setClassForm({ ...classForm, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cenddate">End Date (Expiry)</Label>
                <Input
                  id="cenddate"
                  type="date"
                  value={classForm.endDate}
                  min={classForm.startDate || undefined}
                  onChange={(e) => setClassForm({ ...classForm, endDate: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setClassForm({ ...classForm, color: c.value })}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        classForm.color === c.value
                          ? `${c.bg} ${c.text} ${c.border} ring-2 ring-offset-1 ring-indigo-500`
                          : `bg-background border-border text-muted-foreground hover:bg-muted`
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
          </form>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => { setShowNewClass(false); setError(""); }}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="new-class-form"
            disabled={loading || teachers.length === 0}
            className="bg-indigo-600 hover:bg-indigo-700 text-white border-0"
          >
            {loading ? "Creating..." : "Create Class"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* ---- Dialog: New Teacher ---- */}
      <Dialog open={showNewTeacher} onClose={() => { setShowNewTeacher(false); setError(""); }}>
        <DialogHeader
          title="Add Teacher"
          description="Enter the teacher's information."
          onClose={() => { setShowNewTeacher(false); setError(""); }}
        />
        <DialogBody>
          <form id="new-teacher-form" onSubmit={handleCreateTeacher} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="tname">Full Name *</Label>
                <Input
                  id="tname"
                  placeholder="Ms. Johnson"
                  value={teacherForm.name}
                  onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="temail">Email *</Label>
                <Input
                  id="temail"
                  type="email"
                  placeholder="teacher@school.com"
                  value={teacherForm.email}
                  onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tphone">Phone</Label>
                <Input
                  id="tphone"
                  placeholder="+1 555 000 0000"
                  value={teacherForm.phone}
                  onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tsubject">Subject</Label>
                <Input
                  id="tsubject"
                  placeholder="e.g. Mathematics"
                  value={teacherForm.subject}
                  onChange={(e) => setTeacherForm({ ...teacherForm, subject: e.target.value })}
                />
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
          </form>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => { setShowNewTeacher(false); setError(""); }}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="new-teacher-form"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white border-0"
          >
            {loading ? "Saving..." : "Add Teacher"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* ---- Dialog: Assign Students ---- */}
      <Dialog open={showAssign} onClose={() => { setShowAssign(false); setSelectedStudentIds([]); setAssignErrors({}); }}>
        <DialogHeader
          title={`Assign Students to ${selectedClass?.name ?? ""}`}
          description="Select students to enroll in this class."
          onClose={() => { setShowAssign(false); setSelectedStudentIds([]); setAssignErrors({}); }}
        />
        <DialogBody>
          {unenrolledStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              All students are already enrolled in this class, or there are no students in the system yet.
            </p>
          ) : (
            <div className="space-y-2">
              {unenrolledStudents.map((student) => {
                const checked = selectedStudentIds.includes(student.id);
                const errMsg = assignErrors[student.id];
                return (
                  <div key={student.id} className="space-y-1">
                    <label
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                        errMsg
                          ? "bg-red-50 border-red-300"
                          : checked
                          ? "bg-indigo-50 border-indigo-300"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleStudentSelect(student.id)}
                        className="rounded border-border accent-indigo-600"
                      />
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-foreground flex-1">{student.name}</span>
                    </label>
                    {errMsg && (
                      <p className="text-xs text-red-600 pl-3">{errMsg}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => { setShowAssign(false); setSelectedStudentIds([]); }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={assigning || selectedStudentIds.length === 0}
            className="bg-indigo-600 hover:bg-indigo-700 text-white border-0"
          >
            {assigning
              ? "Enrolling..."
              : `Enroll ${selectedStudentIds.length > 0 ? `(${selectedStudentIds.length})` : ""}`}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* ---- Dialog: Take Attendance ---- */}
      <Dialog
        open={showAttendance}
        onClose={() => { setShowAttendance(false); setAttendanceIds([]); setAttendanceResult({}); }}
      >
        <DialogHeader
          title={`Take Attendance — ${selectedClass?.name ?? ""}`}
          description={selectedClass ? `${DAY_LABELS[selectedClass.dayOfWeek]}, ${formatTime(selectedClass.startTime)}–${formatTime(selectedClass.endTime)}` : ""}
          onClose={() => { setShowAttendance(false); setAttendanceIds([]); setAttendanceResult({}); }}
        />
        <DialogBody>
          {selectedClass?.enrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No enrolled students.</p>
          ) : (
            <div className="space-y-2">
              {selectedClass?.enrollments.map((enr) => {
                const checked = attendanceIds.includes(enr.studentId);
                const sub = attendanceSubs[enr.studentId];
                const result = attendanceResult[enr.studentId];
                const used = sub?.sessionsUsed ?? 0;
                const total = sub?.totalSessions ?? 0;
                const full = total > 0 && used >= total;

                return (
                  <div key={enr.studentId}>
                    <label
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                        result === "ok"
                          ? "bg-emerald-50 border-emerald-300"
                          : result === "error" || result === "no-sub"
                          ? "bg-red-50 border-red-200"
                          : checked
                          ? "bg-indigo-50 border-indigo-300"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={!!result || full}
                        onChange={() =>
                          setAttendanceIds((prev) =>
                            prev.includes(enr.studentId)
                              ? prev.filter((id) => id !== enr.studentId)
                              : [...prev, enr.studentId]
                          )
                        }
                        className="rounded border-border accent-indigo-600"
                      />
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {enr.student.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{enr.student.name}</p>
                        {sub ? (
                          <p className={`text-xs ${full ? "text-red-600" : "text-muted-foreground"}`}>
                            Sessions: {used}{total > 0 ? ` / ${total}` : " used"}
                            {full && " · No sessions left"}
                          </p>
                        ) : (
                          <p className="text-xs text-amber-600">No active subscription</p>
                        )}
                      </div>
                      {result === "ok" && <span className="text-xs text-emerald-600 font-medium shrink-0">✓ Marked</span>}
                      {result === "error" && <span className="text-xs text-red-600 font-medium shrink-0">Failed</span>}
                      {result === "no-sub" && <span className="text-xs text-amber-600 font-medium shrink-0">No subscription</span>}
                    </label>
                  </div>
                );
              })}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => { setShowAttendance(false); setAttendanceIds([]); setAttendanceResult({}); }}
          >
            {Object.keys(attendanceResult).length > 0 ? "Done" : "Cancel"}
          </Button>
          <Button
            onClick={handleSubmitAttendance}
            disabled={submittingAttendance || attendanceIds.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white border-0"
          >
            {submittingAttendance
              ? "Saving..."
              : `Mark ${attendanceIds.length > 0 ? `${attendanceIds.length} ` : ""}Present`}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
