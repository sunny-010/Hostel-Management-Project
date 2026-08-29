import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

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

    const {
      hostelId,
      blockId,
      roomNumber,
      capacity,
    } = body;

    if (
      !hostelId ||
      !blockId ||
      !roomNumber ||
      !capacity
    ) {
      return NextResponse.json(
        {
          message:
            "Hostel, block, room number and capacity are required",
        },
        { status: 400 }
      );
    }

    const hostelIdNumber = Number(hostelId);
    const blockIdNumber = Number(blockId);
    const capacityNumber = Number(capacity);
    const cleanRoomNumber = String(roomNumber).trim();

    if (
      !Number.isInteger(hostelIdNumber) ||
      hostelIdNumber <= 0
    ) {
      return NextResponse.json(
        { message: "Invalid hostel ID" },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(blockIdNumber) ||
      blockIdNumber <= 0
    ) {
      return NextResponse.json(
        { message: "Invalid block ID" },
        { status: 400 }
      );
    }

    if (!cleanRoomNumber) {
      return NextResponse.json(
        { message: "Room number is required" },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(capacityNumber) ||
      capacityNumber < 1
    ) {
      return NextResponse.json(
        { message: "Capacity must be at least 1" },
        { status: 400 }
      );
    }

    const hostel = await prisma.hostel.findUnique({
      where: {
        id: hostelIdNumber,
      },
    });

    if (!hostel) {
      return NextResponse.json(
        { message: "Hostel not found" },
        { status: 404 }
      );
    }

    const block = await prisma.block.findUnique({
      where: {
        id: blockIdNumber,
      },
    });

    if (!block) {
      return NextResponse.json(
        { message: "Block not found" },
        { status: 404 }
      );
    }

    // Make sure the block actually belongs to the selected hostel.
    if (block.hostelId !== hostelIdNumber) {
      return NextResponse.json(
        {
          message:
            "Selected block does not belong to this hostel",
        },
        { status: 400 }
      );
    }

    const room = await prisma.$transaction(async (tx) => {
      const newRoom = await tx.room.create({
        data: {
          hostelId: hostelIdNumber,
          blockId: blockIdNumber,
          roomNumber: cleanRoomNumber,
          capacity: capacityNumber,
          occupied: 0,
        },
      });

      await createAuditLog({
        actorId: user.id,
        actorName: user.name,
        actorEmail: user.email,
        action: "CREATE",
        entity: "ROOM",
        entityId: newRoom.id,
        description: `Created room "${newRoom.roomNumber}" in block "${block.name}", hostel "${hostel.name}" with capacity ${newRoom.capacity}.`,
        db: tx,
      });

      return newRoom;
    });

    return NextResponse.json(room, {
      status: 201,
    });
  } catch (error: any) {
    console.error("Create room error:", error);

    if (error?.code === "P2002") {
      return NextResponse.json(
        {
          message:
            "This room already exists in this block",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Failed to create room" },
      { status: 500 }
    );
  }
}