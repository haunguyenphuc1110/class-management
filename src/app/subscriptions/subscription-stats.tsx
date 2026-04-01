"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, DollarSign, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "./constants";

interface SubscriptionStatsProps {
  activeCount: number;
  totalRevenue: number;
  totalSessionsUsed: number;
}

export function SubscriptionStats({
  activeCount,
  totalRevenue,
  totalSessionsUsed,
}: SubscriptionStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <CreditCard className="size-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-foreground">{activeCount}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
            <DollarSign className="size-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active Revenue</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Sessions Used</p>
            <p className="text-2xl font-bold text-foreground">{totalSessionsUsed}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
