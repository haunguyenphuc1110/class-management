"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Parent, StudentFormValues } from "./types";

interface StudentFormProps {
  form: StudentFormValues;
  onChange: (form: StudentFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  parents: Parent[];
  loading: boolean;
  error: string;
}

export function StudentForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  parents,
  loading,
  error,
}: StudentFormProps) {
  return (
    <Card className="mb-6 border-indigo-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">New Student</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="sname">Full Name *</Label>
              <Input
                id="sname"
                placeholder="Alex Johnson"
                value={form.name}
                onChange={(e) => onChange({ ...form, name: e.target.value })}
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
                  onChange={(e) =>
                    onChange({ ...form, parentId: e.target.value })
                  }
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
                onChange={(e) =>
                  onChange({ ...form, dateOfBirth: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any relevant notes about the student..."
                value={form.notes}
                onChange={(e) => onChange({ ...form, notes: e.target.value })}
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
            <Button type="button" variant="outline" onClick={onCancel}>
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
  );
}
