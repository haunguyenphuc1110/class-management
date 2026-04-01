"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, ChevronUp, DollarSign, Calendar, AlertCircle } from "lucide-react";

// ---- Types ----
interface Parent {
  id: string;
  name: string;
}

interface Student {
  id: string;
  name: string;
  parent: Parent;
}

interface Subscription {
  id: string;
  studentId: string;
  student: Student;
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
  amount: number;
  notes: string | null;
  createdAt: string;
}

const PLANS = ["Monthly", "Quarterly", "Yearly"];

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "success" | "warning" | "destructive" | "gray" }
> = {
  active: { label: "Active", variant: "success" },
  paused: { label: "Paused", variant: "warning" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  expired: { label: "Expired", variant: "gray" },
};

function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export default function SubscriptionsPage() {
  const router = useRouter();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    studentId: "",
    plan: "Monthly",
    startDate: "",
    endDate: "",
    amount: "",
    notes: "",
  });

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [subsRes, studRes] = await Promise.all([
        fetch("/api/subscriptions"),
        fetch("/api/students"),
      ]);
      const [subs, studs] = await Promise.all([subsRes.json(), studRes.json()]);
      setSubscriptions(Array.isArray(subs) ? subs : []);
      setStudents(Array.isArray(studs) ? studs : []);
    } catch {
      // silent
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: form.studentId,
          plan: form.plan,
          startDate: form.startDate,
          endDate: form.endDate,
          amount: Number(form.amount),
          notes: form.notes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create subscription");
        return;
      }
      setSubscriptions((prev) => [data, ...prev]);
      setForm({ studentId: "", plan: "Monthly", startDate: "", endDate: "", amount: "", notes: "" });
      setShowForm(false);
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSubscriptions((prev) => prev.map((s) => (s.id === id ? updated : s)));
        router.refresh();
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const activeCount = subscriptions.filter((s) => s.status === "active").length;
  const totalRevenue = subscriptions
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="flex-1 p-6 lg:p-8">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Subscriptions</h1>
          <p className="mt-1 text-muted-foreground">
            {subscriptions.length} subscription{subscriptions.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button
          onClick={() => { setShowForm(!showForm); setError(""); }}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border-0"
        >
          {showForm ? <ChevronUp className="size-4" /> : <Plus className="size-4" />}
          {showForm ? "Cancel" : "Add Subscription"}
        </Button>
      </div>

      {/* ---- Stats ---- */}
      {!loadingData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                <CreditCard className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-foreground">{activeCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                <DollarSign className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Revenue</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Calendar className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold text-foreground">
                  {new Set(subscriptions.map((s) => s.studentId)).size}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ---- Add Form ---- */}
      {showForm && (
        <Card className="mb-6 border-indigo-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">New Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="substudent">Student *</Label>
                  {students.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">
                      No students found. Please add a student first.
                    </p>
                  ) : (
                    <Select
                      id="substudent"
                      value={form.studentId}
                      onChange={(e) => setForm({ ...form, studentId: e.target.value })}
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
                    onChange={(e) => setForm({ ...form, plan: e.target.value })}
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
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="subend">End Date *</Label>
                  <Input
                    id="subend"
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
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
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="subnotes">Notes</Label>
                  <Textarea
                    id="subnotes"
                    placeholder="Optional notes..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowForm(false); setError(""); }}
                >
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
      )}

      {/* ---- Loading ---- */}
      {loadingData && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Loading subscriptions...</p>
          </div>
        </div>
      )}

      {/* ---- Empty state ---- */}
      {!loadingData && subscriptions.length === 0 && (
        <Card className="py-16">
          <CardContent className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-violet-50 flex items-center justify-center mb-4">
              <CreditCard className="size-7 text-violet-500" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">No subscriptions yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first subscription plan for a student.
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border-0"
            >
              <Plus className="size-4" /> Add Subscription
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ---- Subscriptions List ---- */}
      {!loadingData && subscriptions.length > 0 && (
        <div className="space-y-3">
          {subscriptions.map((sub) => {
            const statusConfig = STATUS_CONFIG[sub.status] ?? { label: sub.status, variant: "gray" as const };
            const isUpdating = updatingId === sub.id;

            return (
              <Card key={sub.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Student + Plan info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {sub.student.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground">{sub.student.name}</h3>
                          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                          <Badge variant="secondary">{sub.plan}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Parent: {sub.student.parent.name}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <DollarSign className="size-3.5" />
                            {formatCurrency(sub.amount)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="size-3.5" />
                            {formatDate(sub.startDate)} – {formatDate(sub.endDate)}
                          </span>
                        </div>
                        {sub.notes && (
                          <p className="mt-1.5 text-xs text-muted-foreground italic">{sub.notes}</p>
                        )}
                      </div>
                    </div>

                    {/* Quick actions */}
                    <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                      {sub.status === "active" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(sub.id, "paused")}
                            className="text-yellow-700 border-yellow-300 hover:bg-yellow-50"
                          >
                            Pause
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(sub.id, "cancelled")}
                            className="text-red-700 border-red-300 hover:bg-red-50"
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                      {sub.status === "paused" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(sub.id, "active")}
                            className="text-green-700 border-green-300 hover:bg-green-50"
                          >
                            Resume
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(sub.id, "cancelled")}
                            className="text-red-700 border-red-300 hover:bg-red-50"
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                      {(sub.status === "active" || sub.status === "paused") && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(sub.id, "expired")}
                          className="text-gray-700 border-gray-300 hover:bg-gray-50"
                        >
                          Mark Expired
                        </Button>
                      )}
                      {(sub.status === "cancelled" || sub.status === "expired") && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(sub.id, "active")}
                          className="text-green-700 border-green-300 hover:bg-green-50"
                        >
                          Reactivate
                        </Button>
                      )}
                      {isUpdating && (
                        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
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
