import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: {
        parent: true,
        enrollments: {
          include: { class: true },
        },
        subscriptions: {
          where: { status: "active" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(students);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, dateOfBirth, notes, parentId } = body;

    if (!name || !parentId) {
      return NextResponse.json({ error: "Name and parentId are required" }, { status: 400 });
    }

    const student = await prisma.student.create({
      data: {
        name,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        notes: notes || null,
        parentId,
      },
      include: {
        parent: true,
        enrollments: { include: { class: true } },
        subscriptions: true,
      },
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}
