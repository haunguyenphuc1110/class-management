import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const studentId = searchParams.get("studentId");

    const enrollments = await prisma.enrollment.findMany({
      where: {
        ...(classId ? { classId } : {}),
        ...(studentId ? { studentId } : {}),
      },
      include: {
        student: true,
        class: { include: { teacher: true } },
      },
      orderBy: { enrolledAt: "desc" },
    });
    return NextResponse.json(enrollments);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch enrollments" }, { status: 500 });
  }
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function timesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return timeToMinutes(aStart) < timeToMinutes(bEnd) &&
         timeToMinutes(aEnd) > timeToMinutes(bStart);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, classId } = body;

    if (!studentId || !classId) {
      return NextResponse.json({ error: "studentId and classId are required" }, { status: 400 });
    }

    // Fetch the target class with its active enrollments
    const targetClass = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        enrollments: { where: { status: "active" } },
      },
    });

    if (!targetClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // 1. Check expiry
    if (targetClass.endDate && targetClass.endDate < new Date()) {
      return NextResponse.json(
        { error: "This class has expired and is no longer accepting new students." },
        { status: 422 }
      );
    }

    // 2. Check capacity
    const activeCount = targetClass.enrollments.length;
    if (activeCount >= targetClass.maxStudents) {
      return NextResponse.json(
        { error: `Class is full (${activeCount}/${targetClass.maxStudents} students).` },
        { status: 422 }
      );
    }

    // 3. Check calendar conflict — find any active class the student is in on the same day
    const existingEnrollments = await prisma.enrollment.findMany({
      where: { studentId, status: "active" },
      include: { class: true },
    });

    const conflict = existingEnrollments.find(
      (enr) =>
        enr.classId !== classId &&
        enr.class.dayOfWeek === targetClass.dayOfWeek &&
        timesOverlap(enr.class.startTime, enr.class.endTime, targetClass.startTime, targetClass.endTime)
    );

    if (conflict) {
      return NextResponse.json(
        {
          error: `Schedule conflict: student is already enrolled in "${conflict.class.name}" on ${
            ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][targetClass.dayOfWeek]
          } at ${conflict.class.startTime}–${conflict.class.endTime}.`,
        },
        { status: 422 }
      );
    }

    const enrollment = await prisma.enrollment.create({
      data: { studentId, classId },
      include: {
        student: true,
        class: { include: { teacher: true } },
      },
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error: unknown) {
    console.error(error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json({ error: "Student already enrolled in this class" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create enrollment" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { studentId, classId, id } = body;

    if (id) {
      await prisma.enrollment.delete({ where: { id } });
    } else if (studentId && classId) {
      await prisma.enrollment.deleteMany({ where: { studentId, classId } });
    } else {
      return NextResponse.json({ error: "id or (studentId and classId) required" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete enrollment" }, { status: 500 });
  }
}
