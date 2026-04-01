import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const parents = await prisma.parent.findMany({
      include: {
        students: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(parents);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch parents" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, address } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const parent = await prisma.parent.create({
      data: { name, email, phone: phone || null, address: address || null },
      include: { students: true },
    });

    return NextResponse.json(parent, { status: 201 });
  } catch (error: unknown) {
    console.error(error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create parent" }, { status: 500 });
  }
}
