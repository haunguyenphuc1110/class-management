"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { ClassItem, AttendanceSubInfo } from "./types";
import { DAY_LABELS, formatTime } from "./constants";

interface AttendanceDialogProps {
  open: boolean;
  selectedClass: ClassItem | null;
  attendanceIds: string[];
  attendanceSubs: Record<string, AttendanceSubInfo | null>;
  attendanceResult: Record<string, "ok" | "error" | "no-sub">;
  submitting: boolean;
  onClose: () => void;
  onToggleStudent: (studentId: string) => void;
  onSubmit: () => void;
}

export function AttendanceDialog({
  open,
  selectedClass,
  attendanceIds,
  attendanceSubs,
  attendanceResult,
  submitting,
  onClose,
  onToggleStudent,
  onSubmit,
}: AttendanceDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader
        title={`Take Attendance — ${selectedClass?.name ?? ""}`}
        description={
          selectedClass
            ? `${DAY_LABELS[selectedClass.dayOfWeek]}, ${formatTime(selectedClass.startTime)}–${formatTime(selectedClass.endTime)}`
            : ""
        }
        onClose={onClose}
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
                      onChange={() => onToggleStudent(enr.studentId)}
                      className="rounded border-border accent-indigo-600"
                    />
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                      {enr.student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {enr.student.name}
                      </p>
                      {sub ? (
                        <p
                          className={`text-xs ${full ? "text-red-600" : "text-muted-foreground"}`}
                        >
                          Sessions: {used}
                          {total > 0 ? ` / ${total}` : " used"}
                          {full && " · No sessions left"}
                        </p>
                      ) : (
                        <p className="text-xs text-amber-600">
                          No active subscription
                        </p>
                      )}
                    </div>
                    {result === "ok" && (
                      <span className="text-xs text-emerald-600 font-medium shrink-0">
                        ✓ Marked
                      </span>
                    )}
                    {result === "error" && (
                      <span className="text-xs text-red-600 font-medium shrink-0">
                        Failed
                      </span>
                    )}
                    {result === "no-sub" && (
                      <span className="text-xs text-amber-600 font-medium shrink-0">
                        No subscription
                      </span>
                    )}
                  </label>
                </div>
              );
            })}
          </div>
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          {Object.keys(attendanceResult).length > 0 ? "Done" : "Cancel"}
        </Button>
        <Button
          onClick={onSubmit}
          disabled={submitting || attendanceIds.length === 0}
          className="bg-emerald-600 hover:bg-emerald-700 text-white border-0"
        >
          {submitting
            ? "Saving..."
            : `Mark ${attendanceIds.length > 0 ? `${attendanceIds.length} ` : ""}Present`}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
