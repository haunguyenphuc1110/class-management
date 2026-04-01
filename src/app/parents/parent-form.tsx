"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ParentFormValues } from "./types";

interface ParentFormProps {
  form: ParentFormValues;
  onChange: (form: ParentFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  loading: boolean;
  error: string;
}

export function ParentForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  loading,
  error,
}: ParentFormProps) {
  return (
    <Card className="mb-6 border-indigo-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">New Parent</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Jane Smith"
                value={form.name}
                onChange={(e) => onChange({ ...form, name: e.target.value })}
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
                onChange={(e) => onChange({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="+1 555 000 0000"
                value={form.phone}
                onChange={(e) => onChange({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="123 Main St, City"
                value={form.address}
                onChange={(e) => onChange({ ...form, address: e.target.value })}
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
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white border-0"
            >
              {loading ? "Saving..." : "Save Parent"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
