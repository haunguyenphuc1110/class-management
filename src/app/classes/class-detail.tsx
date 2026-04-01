"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { CalendarDays, Clock, MapPin, Users, UserPlus, Trash2, CheckSquare } from "lucide-react";
import { ClassItem } from "./types";
import { DAY_LABELS, formatTime, isExpired, isFull } from "./constants";

interface ClassDetailProps {
  selectedClass: ClassItem | null;
  deletingId: string | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onAssign: (cls: ClassItem) => void;
  onAttendance: (cls: ClassItem) => void;
  onRemoveEnrollment: (enrollmentId: string) => void;
}

export function ClassDetail({
  selectedClass,
  deletingId,
  onClose,
  onDelete,
  onAssign,
  onAttendance,
  onRemoveEnrollment,
}: ClassDetailProps) {
  return (
    <Dialog open={!!selectedClass} onClose={onClose} className="max-w-2xl">
      {selectedClass && (
        <>
          <DialogHeader
            title={selectedClass.name}
            description={selectedClass.subject ?? undefined}
            onClose={onClose}
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
                <span
                  className={`flex items-center gap-1.5 ${
                    isExpired(selectedClass.endDate) ? "text-red-500 font-medium" : ""
                  }`}
                >
                  Until {new Date(selectedClass.endDate).toLocaleDateString()}
                  {isExpired(selectedClass.endDate) && " · Expired"}
                </span>
              )}
            </div>

            {/* Capacity bar */}
            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span className="font-semibold text-foreground">
                  Enrolled Students ({selectedClass.enrollments.length}/{selectedClass.maxStudents})
                </span>
                {isFull(selectedClass.enrollments.length, selectedClass.maxStudents) ? (
                  <span className="text-red-600 font-semibold">Full</span>
                ) : (
                  <span>
                    {selectedClass.maxStudents - selectedClass.enrollments.length} spots left
                  </span>
                )}
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isFull(selectedClass.enrollments.length, selectedClass.maxStudents)
                      ? "bg-red-500"
                      : selectedClass.enrollments.length / selectedClass.maxStudents >= 0.8
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      (selectedClass.enrollments.length / selectedClass.maxStudents) * 100
                    )}%`,
                  }}
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
                      onClick={() => onRemoveEnrollment(enr.id)}
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
              onClick={() => onDelete(selectedClass.id)}
              disabled={deletingId === selectedClass.id}
              className="mr-auto text-muted-foreground hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="size-3.5 mr-1.5" />
              Delete
            </Button>
            <Button
              onClick={() => onAttendance(selectedClass)}
              size="sm"
              disabled={selectedClass.enrollments.length === 0 || isExpired(selectedClass.endDate)}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckSquare className="size-3.5" />
              Take Attendance
            </Button>
            <Button
              onClick={() => onAssign(selectedClass)}
              size="sm"
              disabled={
                isExpired(selectedClass.endDate) ||
                isFull(selectedClass.enrollments.length, selectedClass.maxStudents)
              }
              className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="size-3.5" />
              {isFull(selectedClass.enrollments.length, selectedClass.maxStudents)
                ? "Class Full"
                : isExpired(selectedClass.endDate)
                ? "Expired"
                : "Assign Students"}
            </Button>
          </DialogFooter>
        </>
      )}
    </Dialog>
  );
}
