import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, CalendarDays, CreditCard, ArrowRight } from "lucide-react";

async function getStats() {
  const [totalParents, totalStudents, activeClasses, activeSubscriptions] = await Promise.all([
    prisma.parent.count(),
    prisma.student.count(),
    prisma.class.count(),
    prisma.subscription.count({ where: { status: "active" } }),
  ]);
  return { totalParents, totalStudents, activeClasses, activeSubscriptions };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const statCards = [
    {
      label: "Total Students",
      value: stats.totalStudents,
      icon: UserCheck,
      href: "/students",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Total Parents",
      value: stats.totalParents,
      icon: Users,
      href: "/parents",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Active Classes",
      value: stats.activeClasses,
      icon: CalendarDays,
      href: "/classes",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Active Subscriptions",
      value: stats.activeSubscriptions,
      icon: CreditCard,
      href: "/subscriptions",
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
  ];

  const quickLinks = [
    {
      href: "/parents",
      label: "Manage Parents",
      description: "Add and view parent profiles",
      icon: Users,
      color: "bg-blue-600",
    },
    {
      href: "/students",
      label: "Manage Students",
      description: "Enroll and track students",
      icon: UserCheck,
      color: "bg-indigo-600",
    },
    {
      href: "/classes",
      label: "Class Schedule",
      description: "Weekly schedule and enrollment",
      icon: CalendarDays,
      color: "bg-emerald-600",
    },
    {
      href: "/subscriptions",
      label: "Subscriptions",
      description: "Manage student plans",
      icon: CreditCard,
      color: "bg-violet-600",
    },
  ];

  return (
    <div className="flex-1 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Welcome back! Here&apos;s an overview of your class management system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.href} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="mt-1 text-3xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                      <Icon className="size-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`${link.color} text-white p-3 rounded-xl shadow-sm`}>
                      <Icon className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{link.label}</p>
                      <p className="text-sm text-muted-foreground truncate">{link.description}</p>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
