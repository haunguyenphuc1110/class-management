"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Pencil, Mail, Phone, MapPin } from "lucide-react";
import { Parent, ParentFormValues } from "./types";

interface ParentListProps {
  parents: Parent[];
  savingId: string | null;
  onSave: (id: string, form: ParentFormValues) => Promise<void>;
  onAddFirst: () => void;
}

export function ParentList({ parents, savingId, onSave, onAddFirst }: ParentListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ParentFormValues>({ name: "", email: "", phone: "", address: "" });
  const [editError, setEditError] = useState("");

  const startEdit = (parent: Parent) => {
    setEditingId(parent.id);
    setEditError("");
    setEditForm({
      name: parent.name,
      email: parent.email,
      phone: parent.phone ?? "",
      address: parent.address ?? "",
    });
  };

  const handleSave = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    setEditError("");
    try {
      await onSave(id, editForm);
      setEditingId(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  if (parents.length === 0) {
    return (
      <Card className="py-16">
        <CardContent className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <Users className="size-7 text-blue-500" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">No parents yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add your first parent to get started.
          </p>
          <Button
            onClick={onAddFirst}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border-0"
          >
            <Plus className="size-4" /> Add Parent
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {parents.map((parent) => (
        <Card key={parent.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            {editingId === parent.id ? (
              <form onSubmit={(e) => handleSave(e, parent.id)} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    placeholder="Full Name *"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Email *"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                  <Input
                    placeholder="Address"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  />
                </div>
                {editError && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {editError}
                  </p>
                )}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditingId(null)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={savingId === parent.id}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white border-0"
                  >
                    {savingId === parent.id ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            ) : (
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
                  onClick={() => startEdit(parent)}
                  className="text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 shrink-0"
                  aria-label="Edit parent"
                >
                  <Pencil className="size-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
