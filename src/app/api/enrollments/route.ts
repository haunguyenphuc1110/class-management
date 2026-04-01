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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, classId } = body;

    if (!studentId || !classId) {
      return NextResponse.json({ error: "studentId and classId are required" }, { status: 400 });
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
