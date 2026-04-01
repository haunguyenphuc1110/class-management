"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Plus } from "lucide-react";
import { ClassItem } from "./types";
import {
  WEEK_ORDER,
  DAY_LABELS,
  HOUR_LABELS,
  TOTAL_HOURS,
  HOUR_START,
  getColorClasses,
  timeToMinutes,
  formatTime,
  isExpired,
  isFull,
} from "./constants";

const GRID_HEIGHT_PX = 800;
const PX_PER_MINUTE = GRID_HEIGHT_PX / (TOTAL_HOURS * 60);

function getBlockStyle(cls: ClassItem) {
  const startMins = timeToMinutes(cls.startTime) - HOUR_START * 60;
  const endMins = timeToMinutes(cls.endTime) - HOUR_START * 60;
  const top = Math.max(0, startMins * PX_PER_MINUTE);
  const height = Math.max(24, (endMins - startMins) * PX_PER_MINUTE);
  return { top: `${top}px`, height: `${height}px` };
}

interface WeekGridProps {
  classes: ClassItem[];
  onSelectClass: (cls: ClassItem) => void;
  onNewClass: () => void;
}

export function WeekGrid({
  classes,
  onSelectClass,
  onNewClass,
}: WeekGridProps) {
  const classesByDay: Record<number, ClassItem[]> = {};
  WEEK_ORDER.forEach((d) => {
    classesByDay[d] = classes.filter((c) => c.dayOfWeek === d);
  });

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="size-4 text-indigo-600" />
          Weekly Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        {classes.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center px-6">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
              <CalendarDays className="size-7 text-emerald-500" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">
              No classes yet
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first class to see the weekly schedule.
            </p>
            <Button
              onClick={onNewClass}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border-0"
            >
              <Plus className="size-4" /> New Class
            </Button>
          </div>
        ) : (
          <div className="flex min-w-[700px]">
            {/* Time axis */}
            <div className="w-14 shrink-0 border-r border-border">
              <div className="h-10 border-b border-border" />
              <div
                className="relative"
                style={{ height: `${GRID_HEIGHT_PX}px` }}
              >
                {HOUR_LABELS.map((label, i) => (
                  <div
                    key={label}
                    className="absolute right-2 text-xs text-muted-foreground leading-none"
                    style={{
                      top: `${(i / TOTAL_HOURS) * 100}%`,
                      transform: "translateY(-50%)",
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Day columns */}
            {WEEK_ORDER.map((day) => (
              <div
                key={day}
                className="flex-1 border-r border-border last:border-r-0 min-w-0"
              >
                <div className="h-10 flex items-center justify-center border-b border-border bg-muted/40 px-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {DAY_LABELS[day].slice(0, 3)}
                  </span>
                </div>

                <div
                  className="relative"
                  style={{ height: `${GRID_HEIGHT_PX}px` }}
                >
                  {/* Hour lines */}
                  {Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => (
                    <div
                      key={i}
                      className="absolute left-0 right-0 border-t border-border/50"
                      style={{ top: `${(i / TOTAL_HOURS) * 100}%` }}
                    />
                  ))}

                  {/* Class blocks */}
                  {classesByDay[day].map((cls) => {
                    const colorCls = getColorClasses(cls.color);
                    const expired = isExpired(cls.endDate);
                    const full = isFull(
                      cls.enrollments.length,
                      cls.maxStudents,
                    );
                    return (
                      <button
                        key={cls.id}
                        onClick={() => onSelectClass(cls)}
                        className={`absolute left-0.5 right-0.5 rounded-md border px-1.5 py-1 text-left cursor-pointer hover:shadow-md transition-shadow overflow-hidden ${
                          expired
                            ? "bg-gray-100 border-gray-200 text-gray-400 opacity-60"
                            : `${colorCls.bg} ${colorCls.border} ${colorCls.text}`
                        }`}
                        style={getBlockStyle(cls)}
                      >
                        <p className="text-xs font-semibold leading-tight truncate">
                          {cls.name}
                        </p>
                        <p className="text-[10px] leading-tight opacity-75 truncate">
                          {formatTime(cls.startTime)}–{formatTime(cls.endTime)}
                        </p>
                        <p className="text-[10px] leading-tight opacity-75 truncate">
                          {cls.teacher.name}
                        </p>
                        {expired && (
                          <p className="text-[10px] font-semibold leading-tight text-gray-500">
                            Expired
                          </p>
                        )}
                        {!expired && full && (
                          <p className="text-[10px] font-semibold leading-tight">
                            Full
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
