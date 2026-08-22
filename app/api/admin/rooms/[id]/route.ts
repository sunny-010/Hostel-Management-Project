
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(
  request: Request,
  { params }: Params
) {
  const user = await requireAdmin();

  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const roomId = Number(id);

    if (!Number.isInteger(roomId) || roomId <= 0) {
      return NextResponse.json(
        { message: "Invalid room ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const roomNumber = String(
      body.roomNumber ?? ""
    ).trim();

    const capacity = Number(body.capacity);

    if (!roomNumber || !body.capacity) {
      return NextResponse.json(
        {
          message:
            "Room number and capacity are required",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(capacity) ||
      capacity < 1
    ) {
      return NextResponse.json(
        {
          message:
            "Capacity must be at least 1",
        },
        { status: 400 }
      );
    }

    const existingRoom =
      await prisma.room.findUnique({
        where: {
          id: roomId,
        },
      });

    if (!existingRoom) {
      return NextResponse.json(
        { message: "Room not found" },
        { status: 404 }
      );
    }

    // Never allow capacity below current occupancy
    if (capacity < existingRoom.occupied) {
      return NextResponse.json(
        {
          message: `Capacity cannot be less than current occupancy (${existingRoom.occupied})`,
        },
        { status: 400 }
      );
    }

    const duplicateRoom =
      await prisma.room.findFirst({
        where: {
          hostelId: existingRoom.hostelId,
          roomNumber,
          NOT: {
            id: roomId,
          },
        },
      });

    if (duplicateRoom) {
      return NextResponse.json(
        {
          message:
            "This room number already exists in this hostel",
        },
        { status: 409 }
      );
    }

    const updatedRoom =
      await prisma.room.update({
        where: {
          id: roomId,
        },
        data: {
          roomNumber,
          capacity,
        },
      });

    return NextResponse.json(updatedRoom);
  } catch (error: any) {
    console.error("Update room error:", error);

    if (error?.code === "P2002") {
      return NextResponse.json(
        {
          message:
            "This room already exists in this hostel",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update room" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: Params
) {
  const user = await requireAdmin();

  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const roomId = Number(id);

    if (!Number.isInteger(roomId) || roomId <= 0) {
      return NextResponse.json(
        { message: "Invalid room ID" },
        { status: 400 }
      );
    }

    const room = await prisma.room.findUnique({
      where: {
        id: roomId,
      },
      include: {
        _count: {
          select: {
            allocations: true,
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json(
        { message: "Room not found" },
        { status: 404 }
      );
    }

    if (
      room.occupied > 0 ||
      room._count.allocations > 0
    ) {
      return NextResponse.json(
        {
          message:
            "This room cannot be deleted because students are currently allocated to it",
        },
        { status: 409 }
      );
    }

    await prisma.room.delete({
      where: {
        id: roomId,
      },
    });

    return NextResponse.json({
      message: "Room deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete room error:", error);

    if (error?.code === "P2003") {
      return NextResponse.json(
        {
          message:
            "This room cannot be deleted because it has related allocations",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Failed to delete room" },
      { status: 500 }
    );
  }
}
