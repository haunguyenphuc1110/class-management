import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, dateOfBirth, parentId, notes } = await request.json();

    if (!name || !parentId) {
      return NextResponse.json({ error: "name and parentId are required" }, { status: 400 });
    }

    const student = await prisma.student.update({
      where: { id },
      data: {
        name,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        parentId,
        notes: notes || null,
      },
      include: {
        parent: true,
        enrollments: { include: { class: true } },
        subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    return NextResponse.json(student);
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}
