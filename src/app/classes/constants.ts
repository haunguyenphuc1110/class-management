export const DAYS = [
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
  { label: "Sunday", value: 0 },
];

export const DAY_LABELS: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

// Ordered Mon→Sun for the weekly view
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export const COLORS = [
  { value: "blue", label: "Blue", bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200", dot: "bg-blue-500" },
  { value: "indigo", label: "Indigo", bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-200", dot: "bg-indigo-500" },
  { value: "emerald", label: "Emerald", bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-200", dot: "bg-emerald-500" },
  { value: "violet", label: "Violet", bg: "bg-violet-100", text: "text-violet-800", border: "border-violet-200", dot: "bg-violet-500" },
  { value: "rose", label: "Rose", bg: "bg-rose-100", text: "text-rose-800", border: "border-rose-200", dot: "bg-rose-500" },
  { value: "amber", label: "Amber", bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-200", dot: "bg-amber-500" },
  { value: "teal", label: "Teal", bg: "bg-teal-100", text: "text-teal-800", border: "border-teal-200", dot: "bg-teal-500" },
  { value: "orange", label: "Orange", bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200", dot: "bg-orange-500" },
];

export const HOUR_START = 7; // 7am
export const HOUR_END = 21;  // 9pm
export const TOTAL_HOURS = HOUR_END - HOUR_START;

export const HOUR_LABELS = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => {
  const h = HOUR_START + i;
  const ampm = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return `${hour}${ampm}`;
});

export function getColorClasses(color: string | null) {
  return COLORS.find((c) => c.value === color) ?? COLORS[0];
}

export function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")}${ampm}`;
}

export function isExpired(endDate: string | null): boolean {
  return !!endDate && new Date(endDate) < new Date();
}

export function isFull(enrollmentsCount: number, maxStudents: number): boolean {
  return enrollmentsCount >= maxStudents;
}
