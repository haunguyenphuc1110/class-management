"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  ClassItem,
  Teacher,
  Student,
  ClassFormValues,
  TeacherFormValues,
  AttendanceSubInfo,
} from "./types";
import { WeekGrid } from "./week-grid";
import { ClassDetail } from "./class-detail";
import { AssignDialog } from "./assign-dialog";
import { AttendanceDialog } from "./attendance-dialog";
import { TeacherSection } from "./teacher-section";
import { NewClassDialog } from "./new-class-dialog";

interface ClassesClientProps {
  initialClasses: ClassItem[];
  initialTeachers: Teacher[];
  allStudents: Student[];
}

export function ClassesClient({
  initialClasses,
  initialTeachers,
  allStudents,
}: ClassesClientProps) {
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
  const [attendanceSubs, setAttendanceSubs] = useState<
    Record<string, AttendanceSubInfo | null>
  >({});
  const [submittingAttendance, setSubmittingAttendance] = useState(false);
  const [attendanceResult, setAttendanceResult] = useState<
    Record<string, "ok" | "error" | "no-sub">
  >({});

  useEffect(() => {
    if (selectedClass) {
      detailPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedClass]);

  // Loading / error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // New class form
  const [classForm, setClassForm] = useState<ClassFormValues>({
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
  const [teacherForm, setTeacherForm] = useState<TeacherFormValues>({
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

  const enrolledIds = new Set(
    selectedClass?.enrollments.map((e) => e.studentId) ?? [],
  );
  const unenrolledStudents = allStudents.filter((s) => !enrolledIds.has(s.id));

  const toggleStudentSelect = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
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
        }),
      );

      const errors: Record<string, string> = {};
      const succeeded = results.filter((r) => {
        if (!r.ok) {
          errors[r.studentId] = r.data.error;
          return false;
        }
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
              : c,
          ),
        );
        setSelectedClass((prev) =>
          prev
            ? { ...prev, enrollments: [...prev.enrollments, ...newEnrollments] }
            : prev,
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
        const updatedEnrollments = selectedClass.enrollments.filter(
          (e) => e.id !== enrollmentId,
        );
        const updatedClass = {
          ...selectedClass,
          enrollments: updatedEnrollments,
        };
        setSelectedClass(updatedClass);
        setClasses((prev) =>
          prev.map((c) => (c.id === selectedClass.id ? updatedClass : c)),
        );
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
    const subsMap: Record<string, AttendanceSubInfo | null> = {};
    await Promise.all(
      cls.enrollments.map(async (enr) => {
        try {
          const res = await fetch(
            `/api/subscriptions?studentId=${enr.studentId}`,
          );
          const subs = await res.json();
          const active = Array.isArray(subs)
            ? subs.find((s: { status: string }) => s.status === "active")
            : null;
          subsMap[enr.studentId] = active
            ? {
                id: active.id,
                totalSessions: active.totalSessions,
                sessionsUsed: active.sessions?.length ?? 0,
              }
            : null;
        } catch {
          subsMap[enr.studentId] = null;
        }
      }),
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
        if (!sub) {
          result[studentId] = "no-sub";
          return;
        }
        try {
          const res = await fetch("/api/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              subscriptionId: sub.id,
              classId: selectedClass.id,
            }),
          });
          result[studentId] = res.ok ? "ok" : "error";
          if (res.ok) {
            setAttendanceSubs((prev) => ({
              ...prev,
              [studentId]: prev[studentId]
                ? {
                    ...prev[studentId]!,
                    sessionsUsed: prev[studentId]!.sessionsUsed + 1,
                  }
                : null,
            }));
          }
        } catch {
          result[studentId] = "error";
        }
      }),
    );
    setAttendanceResult(result);
    setAttendanceIds([]);
    setSubmittingAttendance(false);
  };

  const toggleAttendanceStudent = (studentId: string) => {
    setAttendanceIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Classes</h1>
          <p className="mt-1 text-muted-foreground">
            {classes.length} class{classes.length !== 1 ? "es" : ""} scheduled
          </p>
        </div>
        <Button
          onClick={() => {
            setError("");
            setSelectedClass(null);
            setShowNewClass(true);
          }}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border-0"
        >
          <Plus className="size-4" />
          New Class
        </Button>
      </div>

      {/* Weekly Schedule Grid */}
      <WeekGrid
        classes={classes}
        onSelectClass={setSelectedClass}
        onNewClass={() => {
          setError("");
          setSelectedClass(null);
          setShowNewClass(true);
        }}
      />

      {/* Class Detail Dialog */}
      <div ref={detailPanelRef}>
        <ClassDetail
          selectedClass={selectedClass}
          deletingId={deletingId}
          onClose={() => setSelectedClass(null)}
          onDelete={handleDeleteClass}
          onAssign={openAssign}
          onAttendance={openAttendance}
          onRemoveEnrollment={handleRemoveEnrollment}
        />
      </div>

      {/* Teachers Section */}
      <TeacherSection
        teachers={teachers}
        showNewTeacher={showNewTeacher}
        teacherForm={teacherForm}
        loading={loading}
        error={error}
        onOpenDialog={() => {
          setError("");
          setShowNewTeacher(true);
        }}
        onCloseDialog={() => {
          setShowNewTeacher(false);
          setError("");
        }}
        onFormChange={setTeacherForm}
        onSubmit={handleCreateTeacher}
      />

      {/* New Class Dialog */}
      <NewClassDialog
        open={showNewClass}
        teachers={teachers}
        classForm={classForm}
        loading={loading}
        error={error}
        onClose={() => {
          setShowNewClass(false);
          setError("");
        }}
        onFormChange={setClassForm}
        onSubmit={handleCreateClass}
      />

      {/* Assign Students Dialog */}
      <AssignDialog
        open={showAssign}
        selectedClass={selectedClass}
        unenrolledStudents={unenrolledStudents}
        selectedStudentIds={selectedStudentIds}
        assignErrors={assignErrors}
        assigning={assigning}
        onClose={() => {
          setShowAssign(false);
          setSelectedStudentIds([]);
          setAssignErrors({});
        }}
        onToggleStudent={toggleStudentSelect}
        onAssign={handleAssign}
      />

      {/* Attendance Dialog */}
      <AttendanceDialog
        open={showAttendance}
        selectedClass={selectedClass}
        attendanceIds={attendanceIds}
        attendanceSubs={attendanceSubs}
        attendanceResult={attendanceResult}
        submitting={submittingAttendance}
        onClose={() => {
          setShowAttendance(false);
          setAttendanceIds([]);
          setAttendanceResult({});
        }}
        onToggleStudent={toggleAttendanceStudent}
        onSubmit={handleSubmitAttendance}
      />
    </div>
  );
}
