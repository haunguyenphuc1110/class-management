"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Trash2, Mail, Phone, MapPin, ChevronDown, ChevronUp } from "lucide-react";

interface Student {
  id: string;
  name: string;
}

interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  students: Student[];
  createdAt: Date | string;
}

interface ParentsClientProps {
  initialParents: Parent[];
}

export function ParentsClient({ initialParents }: ParentsClientProps) {
  const router = useRouter();
  const [parents, setParents] = useState<Parent[]>(initialParents);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState({
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

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this parent? This will also remove their students.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/parents/${id}`, { method: "DELETE" });
      if (res.ok) {
        setParents((prev) => prev.filter((p) => p.id !== id));
        router.refresh();
      }
    } finally {
      setDeletingId(null);
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
        <Button onClick={() => setShowForm(!showForm)} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border-0">
          {showForm ? <ChevronUp className="size-4" /> : <Plus className="size-4" />}
          {showForm ? "Cancel" : "Add Parent"}
        </Button>
      </div>

      {/* Add Form */}
      {showForm && (
        <Card className="mb-6 border-indigo-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">New Parent</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Jane Smith"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jane@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="+1 555 000 0000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="123 Main St, City"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
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
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white border-0"
                >
                  {loading ? "Saving..." : "Save Parent"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {parents.length === 0 && (
        <Card className="py-16">
          <CardContent className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <Users className="size-7 text-blue-500" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">No parents yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add your first parent to get started.
            </p>
            <Button onClick={() => setShowForm(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border-0">
              <Plus className="size-4" /> Add Parent
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Parents list */}
      {parents.length > 0 && (
        <div className="space-y-3">
          {parents.map((parent) => (
            <Card key={parent.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                      {parent.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{parent.name}</h3>
                        <Badge variant="blue">
                          {parent.students.length} student{parent.students.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Mail className="size-3.5" />
                          {parent.email}
                        </span>
                        {parent.phone && (
                          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Phone className="size-3.5" />
                            {parent.phone}
                          </span>
                        )}
                        {parent.address && (
                          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="size-3.5" />
                            {parent.address}
                          </span>
                        )}
                      </div>
                      {parent.students.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {parent.students.map((s) => (
                            <span
                              key={s.id}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(parent.id)}
                    disabled={deletingId === parent.id}
                    className="text-muted-foreground hover:text-red-600 hover:bg-red-50 shrink-0"
                    aria-label="Delete parent"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
