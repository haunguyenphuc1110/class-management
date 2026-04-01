"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, ChevronUp } from "lucide-react";
import { Parent, Student, StudentFormValues } from "./types";
import { StudentForm } from "./student-form";
import { StudentList } from "./student-list";

interface StudentsClientProps {
  initialStudents: Student[];
  parents: Parent[];
}

export function StudentsClient({
  initialStudents,
  parents,
}: StudentsClientProps) {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const [form, setForm] = useState<StudentFormValues>({
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

  const handleSaveStudent = async (id: string, editForm: StudentFormValues) => {
    setSavingId(id);
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          dateOfBirth: editForm.dateOfBirth || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update student");
      setStudents((prev) => prev.map((s) => (s.id === id ? data : s)));
      router.refresh();
    } finally {
      setSavingId(null);
    }
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
          {showForm ? (
            <ChevronUp className="size-4" />
          ) : (
            <Plus className="size-4" />
          )}
          {showForm ? "Cancel" : "Add Student"}
        </Button>
      </div>

      {/* Add Form */}
      {showForm && (
        <StudentForm
          form={form}
          onChange={setForm}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setError("");
          }}
          parents={parents}
          loading={loading}
          error={error}
        />
      )}

      {/* Student List / Empty State */}
      <StudentList
        students={students}
        parents={parents}
        savingId={savingId}
        onSave={handleSaveStudent}
        onAddFirst={() => setShowForm(true)}
      />
    </div>
  );
}
