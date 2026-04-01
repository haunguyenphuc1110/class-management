import { prisma } from "@/lib/prisma";
import { ClassesClient } from "./classes-client";

async function getData() {
  const [classes, teachers, students] = await Promise.all([
    prisma.class.findMany({
      include: {
        teacher: true,
        enrollments: {
          include: { student: true },
          where: { status: "active" },
        },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
    prisma.teacher.findMany({ orderBy: { name: "asc" } }),
    prisma.student.findMany({ orderBy: { name: "asc" } }),
  ]);

  // Serialize Date fields to ISO strings for the client component
  const serializedClasses = classes.map((c) => ({
    ...c,
    startDate: c.startDate?.toISOString() ?? null,
    endDate: c.endDate?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    enrollments: c.enrollments.map((e) => ({
      ...e,
      enrolledAt: e.enrolledAt.toISOString(),
    })),
  }));

  return { classes: serializedClasses, teachers, students };
}

export default async function ClassesPage() {
  const { classes, teachers, students } = await getData();
  return (
    <ClassesClient
      initialClasses={classes}
      initialTeachers={teachers}
      allStudents={students}
    />
  );
}
