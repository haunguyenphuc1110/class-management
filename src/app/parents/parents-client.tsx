"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, ChevronUp } from "lucide-react";
import { Parent, ParentFormValues } from "./types";
import { ParentForm } from "./parent-form";
import { ParentList } from "./parent-list";

interface ParentsClientProps {
  initialParents: Parent[];
}

export function ParentsClient({ initialParents }: ParentsClientProps) {
  const router = useRouter();
  const [parents, setParents] = useState<Parent[]>(initialParents);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const [form, setForm] = useState<ParentFormValues>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/parents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create parent");
        return;
      }
      setParents((prev) => [data, ...prev]);
      setForm({ name: "", email: "", phone: "", address: "" });
      setShowForm(false);
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveParent = async (id: string, editForm: ParentFormValues) => {
    setSavingId(id);
    try {
      const res = await fetch(`/api/parents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update parent");
      setParents((prev) => prev.map((p) => (p.id === id ? data : p)));
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
          <h1 className="text-2xl font-bold text-foreground">Parents</h1>
          <p className="mt-1 text-muted-foreground">
            {parents.length} parent{parents.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border-0"
        >
          {showForm ? <ChevronUp className="size-4" /> : <Plus className="size-4" />}
          {showForm ? "Cancel" : "Add Parent"}
        </Button>
      </div>

      {/* Add Form */}
      {showForm && (
        <ParentForm
          form={form}
          onChange={setForm}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setError(""); }}
          loading={loading}
          error={error}
        />
      )}

      {/* Parent List / Empty State */}
      <ParentList
        parents={parents}
        savingId={savingId}
        onSave={handleSaveParent}
        onAddFirst={() => setShowForm(true)}
      />
    </div>
  );
}
