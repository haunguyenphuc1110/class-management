"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { ClassItem, Student } from "./types";

interface AssignDialogProps {
  open: boolean;
  selectedClass: ClassItem | null;
  unenrolledStudents: Student[];
  selectedStudentIds: string[];
  assignErrors: Record<string, string>;
  assigning: boolean;
  onClose: () => void;
  onToggleStudent: (id: string) => void;
  onAssign: () => void;
}

export function AssignDialog({
  open,
  selectedClass,
  unenrolledStudents,
  selectedStudentIds,
  assignErrors,
  assigning,
  onClose,
  onToggleStudent,
  onAssign,
}: AssignDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader
        title={`Assign Students to ${selectedClass?.name ?? ""}`}
        description="Select students to enroll in this class."
        onClose={onClose}
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
                      onChange={() => onToggleStudent(student.id)}
                      className="rounded border-border accent-indigo-600"
                    />
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-foreground flex-1">
                      {student.name}
                    </span>
                  </label>
                  {errMsg && <p className="text-xs text-red-600 pl-3">{errMsg}</p>}
                </div>
              );
            })}
          </div>
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={onAssign}
          disabled={assigning || selectedStudentIds.length === 0}
          className="bg-indigo-600 hover:bg-indigo-700 text-white border-0"
        >
          {assigning
            ? "Enrolling..."
            : `Enroll ${selectedStudentIds.length > 0 ? `(${selectedStudentIds.length})` : ""}`}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
