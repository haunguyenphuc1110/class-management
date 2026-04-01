"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Teacher, ClassFormValues } from "./types";
import { DAYS, COLORS } from "./constants";

interface NewClassDialogProps {
  open: boolean;
  teachers: Teacher[];
  classForm: ClassFormValues;
  loading: boolean;
  error: string;
  onClose: () => void;
  onFormChange: (form: ClassFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function NewClassDialog({
  open,
  teachers,
  classForm,
  loading,
  error,
  onClose,
  onFormChange,
  onSubmit,
}: NewClassDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader
        title="Create New Class"
        description="Fill in the details for the new class."
        onClose={onClose}
      />
      <DialogBody>
        <form id="new-class-form" onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cn">Class Name *</Label>
              <Input
                id="cn"
                placeholder="e.g. Math Beginners"
                value={classForm.name}
                onChange={(e) => onFormChange({ ...classForm, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="csubject">Subject</Label>
              <Input
                id="csubject"
                placeholder="e.g. Mathematics"
                value={classForm.subject}
                onChange={(e) => onFormChange({ ...classForm, subject: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cteacher">Teacher *</Label>
              {teachers.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  No teachers. Add a teacher first.
                </p>
              ) : (
                <Select
                  id="cteacher"
                  value={classForm.teacherId}
                  onChange={(e) => onFormChange({ ...classForm, teacherId: e.target.value })}
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
                onChange={(e) => onFormChange({ ...classForm, dayOfWeek: e.target.value })}
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
                onChange={(e) => onFormChange({ ...classForm, startTime: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cend">End Time *</Label>
              <Input
                id="cend"
                type="time"
                value={classForm.endTime}
                onChange={(e) => onFormChange({ ...classForm, endTime: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="croom">Room</Label>
              <Input
                id="croom"
                placeholder="e.g. Room 101"
                value={classForm.room}
                onChange={(e) => onFormChange({ ...classForm, room: e.target.value })}
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
                onChange={(e) => onFormChange({ ...classForm, maxStudents: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cstartdate">Start Date</Label>
              <Input
                id="cstartdate"
                type="date"
                value={classForm.startDate}
                onChange={(e) => onFormChange({ ...classForm, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cenddate">End Date (Expiry)</Label>
              <Input
                id="cenddate"
                type="date"
                value={classForm.endDate}
                min={classForm.startDate || undefined}
                onChange={(e) => onFormChange({ ...classForm, endDate: e.target.value })}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => onFormChange({ ...classForm, color: c.value })}
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
        <Button variant="outline" onClick={onClose}>
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
  );
}
