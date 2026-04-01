"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Plus, Trash2, ChevronUp, BookOpen } from "lucide-react";

interface Parent {
  id: string;
  name: string;
}

interface ClassItem {
  id: string;
  name: string;
}

interface Enrollment {
  id: string;
  class: ClassItem;
}

interface Subscription {
  id: string;
  status: string;
  plan: string;
}

interface Student {
  id: string;
  name: string;
  dateOfBirth: Date | string | null;
  notes: string | null;
  parentId: string;
  parent: Parent;
  enrollments: Enrollment[];
  subscriptions: Subscription[];
  createdAt: Date | string;
}

interface StudentsClientProps {
  initialStudents: Student[];
  parents: Parent[];
}

export function StudentsClient({ initialStudents, parents }: StudentsClientProps) {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    dateOfBirth: "",
    parentId: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          dateOfBirth: form.dateOfBirth || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create student");
        return;
      }
      setStudents((prev) => [data, ...prev]);
      setForm({ name: "", dateOfBirth: "", parentId: "", notes: "" });
      setShowForm(false);
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this student? Their enrollments and subscriptions will also be removed.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (res.ok) {
        setStudents((prev) => prev.filter((s) => s.id !== id));
        router.refresh();
      }
    } finally {
      setDeletingId(null);
    }
  };

  const getSubscriptionStatus = (student: Student) => {
    if (student.subscriptions.length === 0) return null;
    return student.subscriptions[0];
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="flex-1 p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Students</h1>
          <p className="mt-1 text-muted-foreground">
            {students.length} student{students.length !== 1 ? "s" : ""} enrolled
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border-0"
        >
          {showForm ? <ChevronUp className="size-4" /> : <Plus className="size-4" />}
          {showForm ? "Cancel" : "Add Student"}
        </Button>
      </div>

      {/* Add Form */}
      {showForm && (
        <Card className="mb-6 border-indigo-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">New Student</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="sname">Full Name *</Label>
                  <Input
                    id="sname"
                    placeholder="Alex Johnson"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="parentId">Parent *</Label>
                  {parents.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">
                      No parents found. Please add a parent first.
                    </p>
                  ) : (
                    <Select
                      id="parentId"
                      value={form.parentId}
                      onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                      required
                    >
                      <option value="">Select a parent...</option>
                      {parents.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </Select>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any relevant notes about the student..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowForm(false); setError(""); }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || parents.length === 0}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white border-0"
                >
                  {loading ? "Saving..." : "Save Student"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {students.length === 0 && (
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
              onClick={() => setShowForm(true)}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border-0"
            >
              <Plus className="size-4" /> Add Student
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Students list */}
      {students.length > 0 && (
        <div className="space-y-3">
          {students.map((student) => {
            const sub = getSubscriptionStatus(student);
            return (
              <Card key={student.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
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
                      onClick={() => handleDelete(student.id)}
                      disabled={deletingId === student.id}
                      className="text-muted-foreground hover:text-red-600 hover:bg-red-50 shrink-0"
                      aria-label="Delete student"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
