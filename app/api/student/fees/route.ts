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
    // Find the student profile belonging to the logged-in user
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

    // Get only this student's fees
    const fees = await prisma.fee.findMany({
      where: {
        studentId: student.id,
      },
      orderBy: {
        dueDate: "desc",
      },
    });

    return NextResponse.json(fees);
  } catch (error) {
    console.error("Get student fees error:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch fees",
      },
      { status: 500 }
    );
  }
}