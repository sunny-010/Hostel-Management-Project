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

    const {
      hostelId,
      roomNumber,
      capacity,
    } = body;

    if (!hostelId || !roomNumber || !capacity) {
      return NextResponse.json(
        {
          message:
            "Hostel, room number and capacity are required",
        },
        { status: 400 }
      );
    }

    const capacityNumber = Number(capacity);

    if (!Number.isInteger(capacityNumber) || capacityNumber < 1) {
      return NextResponse.json(
        {
          message: "Capacity must be at least 1",
        },
        { status: 400 }
      );
    }

    const hostel = await prisma.hostel.findUnique({
      where: {
        id: Number(hostelId),
      },
    });

    if (!hostel) {
      return NextResponse.json(
        { message: "Hostel not found" },
        { status: 404 }
      );
    }

    const room = await prisma.room.create({
      data: {
        hostelId: Number(hostelId),
        roomNumber: String(roomNumber).trim(),
        capacity: capacityNumber,
        occupied: 0,
      },
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
            "This room already exists in this hostel",
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
