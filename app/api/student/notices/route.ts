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
    const notices = await prisma.notice.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(notices);
  } catch (error) {
    console.error(
      "Get student notices error:",
      error
    );

    return NextResponse.json(
      { message: "Failed to fetch notices" },
      { status: 500 }
    );
  }
}