"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Plus, Trash2, BookOpen } from "lucide-react";
import { Student } from "./types";

function formatDate(date: Date | string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface StudentListProps {
  students: Student[];
  deletingId: string | null;
  onDelete: (id: string) => void;
  onAddFirst: () => void;
}

export function StudentList({
  students,
  deletingId,
  onDelete,
  onAddFirst,
}: StudentListProps) {
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
                  onClick={() => onDelete(student.id)}
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
  );
}
