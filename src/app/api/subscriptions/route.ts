import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    const subscriptions = await prisma.subscription.findMany({
      where: studentId ? { studentId } : {},
      include: {
        student: { include: { parent: true } },
        sessions: {
          orderBy: { date: "asc" },
          select: { id: true, date: true, classId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      studentId,
      plan,
      startDate,
      endDate,
      amount,
      totalSessions,
      notes,
    } = body;

    if (!studentId || !plan || !startDate || !endDate || amount === undefined) {
      return NextResponse.json(
        { error: "studentId, plan, startDate, endDate, amount are required" },
        { status: 400 },
      );
    }

    const subscription = await prisma.subscription.create({
      data: {
        studentId,
        plan,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        amount: Number(amount),
        totalSessions: totalSessions ? Number(totalSessions) : 0,
        notes: notes || null,
        status: "active",
      },
      include: {
        student: { include: { parent: true } },
        sessions: { select: { id: true, date: true, classId: true } },
      },
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 },
    );
  }
}
