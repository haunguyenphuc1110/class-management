"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Trash2, Mail, Phone, MapPin } from "lucide-react";
import { Parent } from "./types";

interface ParentListProps {
  parents: Parent[];
  deletingId: string | null;
  onDelete: (id: string) => void;
  onAddFirst: () => void;
}

export function ParentList({
  parents,
  deletingId,
  onDelete,
  onAddFirst,
}: ParentListProps) {
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
                onClick={() => onDelete(parent.id)}
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
  );
}
