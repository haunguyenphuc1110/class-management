"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Plus, ChevronUp } from "lucide-react";
import { Subscription, Student, SubscriptionFormValues } from "./types";
import { PLAN_DEFAULT_SESSIONS } from "./constants";
import { SubscriptionStats } from "./subscription-stats";
import { SubscriptionForm } from "./subscription-form";
import { SubscriptionCard } from "./subscription-card";

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [loggingId, setLoggingId] = useState<string | null>(null);

  const [form, setForm] = useState<SubscriptionFormValues>({
    studentId: "",
    plan: "Monthly",
    startDate: "",
    endDate: "",
    amount: "",
    totalSessions: PLAN_DEFAULT_SESSIONS["Monthly"],
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
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePlanChange = (plan: string) => {
    setForm((f) => ({
      ...f,
      plan,
      totalSessions: PLAN_DEFAULT_SESSIONS[plan] ?? "0",
    }));
  };

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
          totalSessions: Number(form.totalSessions),
          notes: form.notes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create subscription");
        return;
      }
      setForm({
        studentId: "",
        plan: "Monthly",
        startDate: "",
        endDate: "",
        amount: "",
        totalSessions: "4",
        notes: "",
      });
      setShowForm(false);
      await fetchData();
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
        await fetchData();
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogSession = async (subscriptionId: string) => {
    setLoggingId(subscriptionId);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Could not log session");
        return;
      }
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.id === subscriptionId
            ? {
                ...s,
                sessions: [
                  ...s.sessions,
                  { id: data.id, date: data.date, classId: data.classId },
                ],
              }
            : s,
        ),
      );
    } finally {
      setLoggingId(null);
    }
  };

  const handleUndoSession = async (
    subscriptionId: string,
    sessionId: string,
  ) => {
    if (!confirm("Remove this session?")) return;
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSubscriptions((prev) =>
          prev.map((s) =>
            s.id === subscriptionId
              ? {
                  ...s,
                  sessions: s.sessions.filter((sess) => sess.id !== sessionId),
                }
              : s,
          ),
        );
      }
    } catch {
      /* silent */
    }
  };

  const activeCount = subscriptions.filter((s) => s.status === "active").length;
  const totalRevenue = subscriptions
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + s.amount, 0);
  const totalSessionsUsed = subscriptions.reduce(
    (sum, s) => sum + s.sessions.length,
    0,
  );

  return (
    <div className="flex-1 p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Subscriptions</h1>
          <p className="mt-1 text-muted-foreground">
            {subscriptions.length} subscription
            {subscriptions.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setError("");
          }}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border-0"
        >
          {showForm ? (
            <ChevronUp className="size-4" />
          ) : (
            <Plus className="size-4" />
          )}
          {showForm ? "Cancel" : "Add Subscription"}
        </Button>
      </div>

      {/* Stats */}
      {!loadingData && (
        <SubscriptionStats
          activeCount={activeCount}
          totalRevenue={totalRevenue}
          totalSessionsUsed={totalSessionsUsed}
        />
      )}

      {/* Add Form */}
      {showForm && (
        <SubscriptionForm
          form={form}
          students={students}
          submitting={submitting}
          error={error}
          onChange={setForm}
          onPlanChange={handlePlanChange}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setError("");
          }}
        />
      )}

      {/* Loading */}
      {loadingData && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">
              Loading subscriptions...
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loadingData && subscriptions.length === 0 && (
        <Card className="py-16">
          <CardContent className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-violet-50 flex items-center justify-center mb-4">
              <CreditCard className="size-7 text-violet-500" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">
              No subscriptions yet
            </h3>
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

      {/* Subscriptions List */}
      {!loadingData && subscriptions.length > 0 && (
        <div className="space-y-3">
          {subscriptions.map((sub) => (
            <SubscriptionCard
              key={sub.id}
              subscription={sub}
              isUpdating={updatingId === sub.id}
              isLogging={loggingId === sub.id}
              onStatusChange={handleStatusChange}
              onLogSession={handleLogSession}
              onUndoSession={handleUndoSession}
            />
          ))}
        </div>
      )}
    </div>
  );
}
