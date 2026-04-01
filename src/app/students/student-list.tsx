"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Plus, Pencil, BookOpen } from "lucide-react";
import { Parent, Student, StudentFormValues } from "./types";

function formatDate(date: Date | string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toDateInput(date: Date | string | null): string {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
}

interface StudentListProps {
  students: Student[];
  parents: Parent[];
  savingId: string | null;
  onSave: (id: string, form: StudentFormValues) => Promise<void>;
  onAddFirst: () => void;
}

export function StudentList({ students, parents, savingId, onSave, onAddFirst }: StudentListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<StudentFormValues>({ name: "", dateOfBirth: "", parentId: "", notes: "" });
  const [editError, setEditError] = useState("");

  const startEdit = (student: Student) => {
    setEditingId(student.id);
    setEditError("");
    setEditForm({
      name: student.name,
      dateOfBirth: toDateInput(student.dateOfBirth),
      parentId: student.parentId,
      notes: student.notes ?? "",
    });
  };

  const handleSave = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    setEditError("");
    try {
      await onSave(id, editForm);
      setEditingId(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  if (students.length === 0) {
    return (
      <Card className="py-16">
        <CardContent className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
            <UserCheck className="size-7 text-indigo-500" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">No students yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add your first student to get started.
          </p>
          <Button
            onClick={onAddFirst}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border-0"
          >
            <Plus className="size-4" /> Add Student
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {students.map((student) => {
        const sub = student.subscriptions.length > 0 ? student.subscriptions[0] : null;
        return (
          <Card key={student.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              {editingId === student.id ? (
                <form onSubmit={(e) => handleSave(e, student.id)} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      placeholder="Full Name *"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      required
                    />
                    <Select
                      value={editForm.parentId}
                      onChange={(e) => setEditForm({ ...editForm, parentId: e.target.value })}
                      required
                    >
                      <option value="">Select parent *</option>
                      {parents.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </Select>
                    <Input
                      type="date"
                      value={editForm.dateOfBirth}
                      onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                    />
                    <Textarea
                      placeholder="Notes"
                      value={editForm.notes}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      rows={1}
                    />
                  </div>
                  {editError && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      {editError}
                    </p>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={savingId === student.id}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white border-0"
                    >
                      {savingId === student.id ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{student.name}</h3>
                        {sub && (
                          <Badge
                            variant={
                              sub.status === "active"
                                ? "success"
                                : sub.status === "paused"
                                ? "warning"
                                : "gray"
                            }
                          >
                            {sub.plan}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Parent: {student.parent.name}
                        {student.dateOfBirth && (
                          <> · Born {formatDate(student.dateOfBirth)}</>
                        )}
                      </p>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <BookOpen className="size-3" />
                          {student.enrollments.length} class{student.enrollments.length !== 1 ? "es" : ""}
                        </span>
                        {student.enrollments.map((enr) => (
                          <span
                            key={enr.id}
                            className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full"
                          >
                            {enr.class.name}
                          </span>
                        ))}
                      </div>
                      {student.notes && (
                        <p className="mt-1.5 text-xs text-muted-foreground italic">
                          {student.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => startEdit(student)}
                    className="text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 shrink-0"
                    aria-label="Edit student"
                  >
                    <Pencil className="size-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
