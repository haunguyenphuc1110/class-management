import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get("subscriptionId");
    const studentId = searchParams.get("studentId");

    const sessions = await prisma.session.findMany({
      where: {
        ...(subscriptionId ? { subscriptionId } : {}),
        ...(studentId ? { studentId } : {}),
      },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(sessions);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subscriptionId, classId, notes, date } = body;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "subscriptionId is required" },
        { status: 400 },
      );
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { _count: { select: { sessions: true } } },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 },
      );
    }

    if (
      subscription.totalSessions > 0 &&
      subscription._count.sessions >= subscription.totalSessions
    ) {
      return NextResponse.json(
        { error: "No sessions remaining in this subscription." },
        { status: 422 },
      );
    }

    const session = await prisma.session.create({
      data: {
        subscriptionId,
        studentId: subscription.studentId,
        classId: classId ?? null,
        notes: notes ?? null,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to log session" },
      { status: 500 },
    );
  }
}
