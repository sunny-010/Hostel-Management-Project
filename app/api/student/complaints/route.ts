import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/auth";

export async function GET() {
  const user = await requireStudent();

  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const student = await prisma.student.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!student) {
      return NextResponse.json(
        { message: "Student profile not found" },
        { status: 404 }
      );
    }

    const complaints = await prisma.complaint.findMany({
      where: {
        studentId: student.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(complaints);
  } catch (error) {
    console.error("Get student complaints error:", error);

    return NextResponse.json(
      { message: "Failed to fetch complaints" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const user = await requireStudent();

  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const { title, description } = body;

    if (!title || !description) {
      return NextResponse.json(
        { message: "Title and description are required" },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!student) {
      return NextResponse.json(
        { message: "Student profile not found" },
        { status: 404 }
      );
    }

    const complaint = await prisma.complaint.create({
      data: {
        studentId: student.id,
        title: String(title).trim(),
        description: String(description).trim(),
        status: "PENDING",
      },
    });

    return NextResponse.json(complaint, {
      status: 201,
    });
  } catch (error) {
    console.error("Create student complaint error:", error);

    return NextResponse.json(
      { message: "Failed to submit complaint" },
      { status: 500 }
    );
  }
}