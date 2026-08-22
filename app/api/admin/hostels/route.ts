
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
    const hostels = await prisma.hostel.findMany({
      include: {
        rooms: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(hostels);
  } catch (error) {
    console.error("Get hostels error:", error);

    return NextResponse.json(
      { message: "Failed to fetch hostels" },
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

    const name = String(body.name ?? "").trim();
    const block = String(body.block ?? "").trim();

    if (!name || !block) {
      return NextResponse.json(
        {
          message:
            "Hostel name and block are required",
        },
        { status: 400 }
      );
    }

    const hostel = await prisma.hostel.create({
      data: {
        name,
        block,
      },
    });

    return NextResponse.json(hostel, {
      status: 201,
    });
  } catch (error) {
    console.error("Create hostel error:", error);

    return NextResponse.json(
      { message: "Failed to create hostel" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const user = await requireAdmin();

  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const hostelId = Number(body.id);
    const name = String(body.name ?? "").trim();
    const block = String(body.block ?? "").trim();

    if (
      !Number.isInteger(hostelId) ||
      hostelId <= 0
    ) {
      return NextResponse.json(
        { message: "Invalid hostel ID" },
        { status: 400 }
      );
    }

    if (!name || !block) {
      return NextResponse.json(
        {
          message:
            "Hostel name and block are required",
        },
        { status: 400 }
      );
    }

    const hostel =
      await prisma.hostel.findUnique({
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

    const updatedHostel =
      await prisma.hostel.update({
        where: {
          id: hostelId,
        },
        data: {
          name,
          block,
        },
      });

    return NextResponse.json(updatedHostel);
  } catch (error) {
    console.error("Update hostel error:", error);

    return NextResponse.json(
      { message: "Failed to update hostel" },
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

    const hostelId = Number(body.id);

    if (
      !Number.isInteger(hostelId) ||
      hostelId <= 0
    ) {
      return NextResponse.json(
        { message: "Invalid hostel ID" },
        { status: 400 }
      );
    }

    const hostel =
      await prisma.hostel.findUnique({
        where: {
          id: hostelId,
        },
        include: {
          _count: {
            select: {
              rooms: true,
            },
          },
        },
      });

    if (!hostel) {
      return NextResponse.json(
        { message: "Hostel not found" },
        { status: 404 }
      );
    }

    if (hostel._count.rooms > 0) {
      return NextResponse.json(
        {
          message:
            "This hostel cannot be deleted because it still contains rooms. Delete all rooms first.",
        },
        { status: 409 }
      );
    }

    await prisma.hostel.delete({
      where: {
        id: hostelId,
      },
    });

    return NextResponse.json({
      message: "Hostel deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete hostel error:", error);

    if (error?.code === "P2003") {
      return NextResponse.json(
        {
          message:
            "This hostel cannot be deleted because it contains related data",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Failed to delete hostel" },
      { status: 500 }
    );
  }
}
