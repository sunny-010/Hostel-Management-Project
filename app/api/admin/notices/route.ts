import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const user = await requireAdmin();

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
    console.error("Get notices error:", error);

    return NextResponse.json(
      { message: "Failed to fetch notices" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const user = await requireAdmin();

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
        {
          message:
            "Title and description are required",
        },
        { status: 400 }
      );
    }

    const notice = await prisma.notice.create({
      data: {
        title,
        description,
      },
    });

    return NextResponse.json(notice, {
      status: 201,
    });
  } catch (error) {
    console.error("Create notice error:", error);

    return NextResponse.json(
      { message: "Failed to create notice" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const user = await requireAdmin();

  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { message: "Notice ID is required" },
        { status: 400 }
      );
    }

    await prisma.notice.delete({
      where: {
        id: Number(id),
      },
    });

    return NextResponse.json({
      message: "Notice deleted successfully",
    });
  } catch (error) {
    console.error("Delete notice error:", error);

    return NextResponse.json(
      { message: "Failed to delete notice" },
      { status: 500 }
    );
  }
}