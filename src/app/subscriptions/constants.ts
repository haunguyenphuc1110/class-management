export const PLANS = ["Monthly", "Quarterly", "Yearly", "Custom"];

export const PLAN_DEFAULT_SESSIONS: Record<string, string> = {
  Monthly: "4",
  Quarterly: "12",
  Yearly: "48",
  Custom: "0",
};

export const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "success" | "warning" | "destructive" | "gray" }
> = {
  active: { label: "Active", variant: "success" },
  paused: { label: "Paused", variant: "warning" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  expired: { label: "Expired", variant: "gray" },
};

export function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
