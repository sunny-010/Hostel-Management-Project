import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

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

    const hostelId = Number(body.hostelId);
    const name = String(body.name ?? "").trim();

    if (!Number.isInteger(hostelId) || hostelId <= 0) {
      return NextResponse.json(
        { message: "Invalid hostel ID" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { message: "Block name is required" },
        { status: 400 }
      );
    }

    const hostel = await prisma.hostel.findUnique({
      where: {
        id: hostelId,
      },
    });

    if (!hostel) {
      return NextResponse.json(
        { message: "Hostel not found" },
        { status: 404 }
      );
    }

    const block = await prisma.block.create({
      data: {
        name,
        hostelId,
      },
    });

    return NextResponse.json(block, {
      status: 201,
    });
  } catch (error: any) {
    console.error("Create block error:", error);

    if (error?.code === "P2002") {
      return NextResponse.json(
        {
          message:
            "This block already exists in this hostel",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Failed to create block" },
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

    const blockId = Number(body.id);

    if (!Number.isInteger(blockId) || blockId <= 0) {
      return NextResponse.json(
        { message: "Invalid block ID" },
        { status: 400 }
      );
    }

    const block = await prisma.block.findUnique({
      where: {
        id: blockId,
      },
      include: {
        _count: {
          select: {
            rooms: true,
          },
        },
      },
    });

    if (!block) {
      return NextResponse.json(
        { message: "Block not found" },
        { status: 404 }
      );
    }

    if (block._count.rooms > 0) {
      return NextResponse.json(
        {
          message:
            "This block cannot be deleted because it still contains rooms. Delete all rooms first.",
        },
        { status: 409 }
      );
    }

    await prisma.block.delete({
      where: {
        id: blockId,
      },
    });

    return NextResponse.json({
      message: "Block deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete block error:", error);

    if (error?.code === "P2003") {
      return NextResponse.json(
        {
          message:
            "This block cannot be deleted because it contains related data.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Failed to delete block" },
      { status: 500 }
    );
  }
}