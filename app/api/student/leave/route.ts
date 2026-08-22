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

    const leaves = await prisma.leaveApplication.findMany({
      where: {
        studentId: student.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(leaves);
  } catch (error) {
    console.error("Get student leave error:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch leave applications",
      },
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

    const { fromDate, toDate, reason } = body;

    if (!fromDate || !toDate || !reason) {
      return NextResponse.json(
        { message: "All fields are required" },
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

    const from = new Date(fromDate);
    const to = new Date(toDate);

    if (
      Number.isNaN(from.getTime()) ||
      Number.isNaN(to.getTime())
    ) {
      return NextResponse.json(
        { message: "Invalid date" },
        { status: 400 }
      );
    }

    if (to < from) {
      return NextResponse.json(
        {
          message:
            "To date cannot be before from date",
        },
        { status: 400 }
      );
    }

    const leave = await prisma.leaveApplication.create({
      data: {
        fromDate: from,
        toDate: to,
        reason,
        studentId: student.id,
      },
    });

    return NextResponse.json(leave, {
      status: 201,
    });
  } catch (error) {
    console.error("Create leave error:", error);

    return NextResponse.json(
      {
        message: "Failed to submit leave application",
      },
      { status: 500 }
    );
  }
}