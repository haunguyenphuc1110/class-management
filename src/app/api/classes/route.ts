import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const classes = await prisma.class.findMany({
      include: {
        teacher: true,
        enrollments: {
          include: { student: true },
          where: { status: "active" },
        },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
    return NextResponse.json(classes);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, subject, teacherId, dayOfWeek, startTime, endTime, room, maxStudents, color, startDate, endDate } = body;

    if (!name || !teacherId || dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json(
        { error: "name, teacherId, dayOfWeek, startTime, endTime are required" },
        { status: 400 }
      );
    }

    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        subject: subject || null,
        teacherId,
        dayOfWeek: Number(dayOfWeek),
        startTime,
        endTime,
        room: room || null,
        maxStudents: maxStudents ? Number(maxStudents) : 20,
        color: color || "blue",
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
      include: {
        teacher: true,
        enrollments: { include: { student: true } },
      },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create class" }, { status: 500 });
  }
}
