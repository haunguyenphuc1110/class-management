import { prisma } from "@/lib/prisma";
import { StudentsClient } from "./students-client";

async function getData() {
  const [students, parents] = await Promise.all([
    prisma.student.findMany({
      include: {
        parent: true,
        enrollments: {
          include: { class: true },
          where: { status: "active" },
        },
        subscriptions: {
          where: { status: "active" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.parent.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { students, parents };
}

export default async function StudentsPage() {
  const { students, parents } = await getData();
  return <StudentsClient initialStudents={students} parents={parents} />;
}
