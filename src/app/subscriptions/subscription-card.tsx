"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calendar } from "lucide-react";
import { Subscription } from "./types";
import { STATUS_CONFIG, formatDate, formatCurrency } from "./constants";
import { SessionTracker } from "./session-tracker";

interface SubscriptionCardProps {
  subscription: Subscription;
  isUpdating: boolean;
  isLogging: boolean;
  onStatusChange: (id: string, status: string) => void;
  onLogSession: (subId: string) => void;
  onUndoSession: (subId: string, sessionId: string) => void;
}

export function SubscriptionCard({
  subscription: sub,
  isUpdating,
  isLogging,
  onStatusChange,
  onLogSession,
  onUndoSession,
}: SubscriptionCardProps) {
  const statusConfig = STATUS_CONFIG[sub.status] ?? {
    label: sub.status,
    variant: "gray" as const,
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Left: Student info + session tracker */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-sm shrink-0">
              {sub.student.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground">
                  {sub.student.name}
                </h3>
                <Badge variant={statusConfig.variant}>
                  {statusConfig.label}
                </Badge>
                <Badge variant="secondary">{sub.plan}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Parent: {sub.student.parent.name}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
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
                <p className="mt-1 text-xs text-muted-foreground italic">
                  {sub.notes}
                </p>
              )}

              {/* Session tracker */}
              <SessionTracker
                subscription={sub}
                onLog={onLogSession}
                onUndo={onUndoSession}
                logging={isLogging}
              />
            </div>
          </div>

          {/* Right: Quick actions */}
          <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
            {sub.status === "active" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isUpdating}
                  onClick={() => onStatusChange(sub.id, "paused")}
                  className="text-yellow-700 border-yellow-300 hover:bg-yellow-50"
                >
                  Pause
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isUpdating}
                  onClick={() => onStatusChange(sub.id, "cancelled")}
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
                  onClick={() => onStatusChange(sub.id, "active")}
                  className="text-green-700 border-green-300 hover:bg-green-50"
                >
                  Resume
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isUpdating}
                  onClick={() => onStatusChange(sub.id, "cancelled")}
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
                onClick={() => onStatusChange(sub.id, "expired")}
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
                onClick={() => onStatusChange(sub.id, "active")}
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
}
