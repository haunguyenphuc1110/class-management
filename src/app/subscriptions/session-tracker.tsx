"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { Subscription } from "./types";
import { formatDate } from "./constants";

const DOT_THRESHOLD = 24;

interface SessionTrackerProps {
  subscription: Subscription;
  onLog: (subId: string) => void;
  onUndo: (subId: string, sessionId: string) => void;
  logging: boolean;
}

export function SessionTracker({
  subscription,
  onLog,
  onUndo,
  logging,
}: SessionTrackerProps) {
  const { totalSessions, sessions, status } = subscription;
  const used = sessions.length;
  const remaining = totalSessions > 0 ? Math.max(0, totalSessions - used) : null;
  const isFull = totalSessions > 0 && used >= totalSessions;
  const canLog = status === "active" && !isFull;
  const lastSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;

  // No session tracking configured
  if (totalSessions === 0) {
    return (
      <div className="mt-3 flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          Sessions used: <span className="font-semibold text-foreground">{used}</span>
        </span>
        {status === "active" && (
          <Button
            size="xs"
            variant="outline"
            disabled={logging}
            onClick={() => onLog(subscription.id)}
            className="gap-1 h-7 text-xs"
          >
            <CheckCircle2 className="size-3" />
            Mark Session
          </Button>
        )}
        {lastSession && (
          <button
            onClick={() => onUndo(subscription.id, lastSession.id)}
            className="text-xs text-muted-foreground hover:text-red-600 flex items-center gap-1 transition-colors"
            title="Undo last session"
          >
            <RotateCcw className="size-3" /> Undo
          </button>
        )}
      </div>
    );
  }

  const pct = Math.min(100, (used / totalSessions) * 100);

  return (
    <div className="mt-3 space-y-2">
      {/* Header row */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Sessions:{" "}
          <span className={`font-semibold ${isFull ? "text-red-600" : "text-foreground"}`}>
            {used}
          </span>
          <span className="text-muted-foreground"> / {totalSessions}</span>
          {remaining !== null && !isFull && (
            <span className="ml-1 text-muted-foreground">({remaining} left)</span>
          )}
          {isFull && <span className="ml-1 text-red-600 font-medium"> · Full</span>}
        </span>
        <div className="flex items-center gap-2">
          {lastSession && (
            <button
              onClick={() => onUndo(subscription.id, lastSession.id)}
              className="text-muted-foreground hover:text-red-600 flex items-center gap-1 transition-colors"
              title={`Undo last session (${formatDate(lastSession.date)})`}
            >
              <RotateCcw className="size-3" />
              <span>Undo</span>
            </button>
          )}
          {canLog && (
            <Button
              size="xs"
              variant="outline"
              disabled={logging}
              onClick={() => onLog(subscription.id)}
              className="gap-1 h-6 text-xs px-2"
            >
              <CheckCircle2 className="size-3" />
              Mark
            </Button>
          )}
        </div>
      </div>

      {/* Dot grid (compact) */}
      {totalSessions <= DOT_THRESHOLD ? (
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: totalSessions }).map((_, i) => {
            const isUsed = i < used;
            const session = isUsed ? sessions[i] : null;
            return (
              <button
                key={i}
                type="button"
                disabled={!isUsed}
                onClick={() => session && onUndo(subscription.id, session.id)}
                title={
                  isUsed
                    ? `Session ${i + 1} — ${formatDate(sessions[i].date)} · Click to undo`
                    : `Session ${i + 1} — not yet used`
                }
                className={`w-5 h-5 rounded-full border transition-all ${
                  isUsed
                    ? "bg-indigo-600 border-indigo-600 hover:bg-red-500 hover:border-red-500 cursor-pointer"
                    : "bg-muted border-border cursor-default"
                }`}
              />
            );
          })}
        </div>
      ) : (
        /* Progress bar for larger session counts */
        <div className="space-y-1">
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isFull ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-indigo-500"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
