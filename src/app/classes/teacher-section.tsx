"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Plus, Mail, Phone } from "lucide-react";
import { Teacher, TeacherFormValues } from "./types";

interface TeacherSectionProps {
  teachers: Teacher[];
  showNewTeacher: boolean;
  teacherForm: TeacherFormValues;
  loading: boolean;
  error: string;
  onOpenDialog: () => void;
  onCloseDialog: () => void;
  onFormChange: (form: TeacherFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function TeacherSection({
  teachers,
  showNewTeacher,
  teacherForm,
  loading,
  error,
  onOpenDialog,
  onCloseDialog,
  onFormChange,
  onSubmit,
}: TeacherSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span>Teachers</span>
          <Badge variant="secondary">{teachers.length}</Badge>
        </h2>
        <Button
          onClick={onOpenDialog}
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
                      {(teacher.classes?.length ?? 0)} class
                      {(teacher.classes?.length ?? 0) !== 1 ? "es" : ""}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog: New Teacher */}
      <Dialog open={showNewTeacher} onClose={onCloseDialog}>
        <DialogHeader
          title="Add Teacher"
          description="Enter the teacher's information."
          onClose={onCloseDialog}
        />
        <DialogBody>
          <form id="new-teacher-form" onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="tname">Full Name *</Label>
                <Input
                  id="tname"
                  placeholder="Ms. Johnson"
                  value={teacherForm.name}
                  onChange={(e) => onFormChange({ ...teacherForm, name: e.target.value })}
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
                  onChange={(e) => onFormChange({ ...teacherForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tphone">Phone</Label>
                <Input
                  id="tphone"
                  placeholder="+1 555 000 0000"
                  value={teacherForm.phone}
                  onChange={(e) => onFormChange({ ...teacherForm, phone: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tsubject">Subject</Label>
                <Input
                  id="tsubject"
                  placeholder="e.g. Mathematics"
                  value={teacherForm.subject}
                  onChange={(e) => onFormChange({ ...teacherForm, subject: e.target.value })}
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
          <Button variant="outline" onClick={onCloseDialog}>
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
    </div>
  );
}
