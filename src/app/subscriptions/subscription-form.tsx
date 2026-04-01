"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Student, SubscriptionFormValues } from "./types";
import { PLANS } from "./constants";

interface SubscriptionFormProps {
  form: SubscriptionFormValues;
  students: Student[];
  submitting: boolean;
  error: string;
  onChange: (form: SubscriptionFormValues) => void;
  onPlanChange: (plan: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function SubscriptionForm({
  form,
  students,
  submitting,
  error,
  onChange,
  onPlanChange,
  onSubmit,
  onCancel,
}: SubscriptionFormProps) {
  return (
    <Card className="mb-6 border-indigo-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">New Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="substudent">Student *</Label>
              {students.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  No students found. Add a student first.
                </p>
              ) : (
                <Select
                  id="substudent"
                  value={form.studentId}
                  onChange={(e) =>
                    onChange({ ...form, studentId: e.target.value })
                  }
                  required
                >
                  <option value="">Select student...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.parent.name}
                    </option>
                  ))}
                </Select>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subplan">Plan *</Label>
              <Select
                id="subplan"
                value={form.plan}
                onChange={(e) => onPlanChange(e.target.value)}
              >
                {PLANS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="substart">Start Date *</Label>
              <Input
                id="substart"
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  onChange({ ...form, startDate: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subend">End Date *</Label>
              <Input
                id="subend"
                type="date"
                value={form.endDate}
                onChange={(e) => onChange({ ...form, endDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subamt">Amount (USD) *</Label>
              <Input
                id="subamt"
                type="number"
                min="0"
                step="0.01"
                placeholder="99.00"
                value={form.amount}
                onChange={(e) => onChange({ ...form, amount: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subsessions">
                Total Sessions
                <span className="ml-1 text-xs text-muted-foreground">
                  (0 = unlimited tracking)
                </span>
              </Label>
              <Input
                id="subsessions"
                type="number"
                min="0"
                max="200"
                placeholder="e.g. 8"
                value={form.totalSessions}
                onChange={(e) =>
                  onChange({ ...form, totalSessions: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="subnotes">Notes</Label>
              <Textarea
                id="subnotes"
                placeholder="Optional notes..."
                value={form.notes}
                onChange={(e) => onChange({ ...form, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          {error && (
            <p className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || students.length === 0}
              className="bg-indigo-600 hover:bg-indigo-700 text-white border-0"
            >
              {submitting ? "Saving..." : "Save Subscription"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
