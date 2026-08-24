import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await requireAdmin();

  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);

    const roomId = Number(searchParams.get("roomId"));

    if (!Number.isInteger(roomId) || roomId <= 0) {
      return NextResponse.json(
        { message: "Valid room ID is required" },
        { status: 400 }
      );
    }

    const room = await prisma.room.findUnique({
      where: {
        id: roomId,
      },
      include: {
        hostel: true,
        block: true,
        allocations: {
          include: {
            student: {
              select: {
                id: true,
                studentId: true,
                name: true,
                email: true,
                phone: true,
                department: true,
                year: true,
              },
            },
          },
          orderBy: {
            allocatedAt: "asc",
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

    const students = room.allocations.map(
      (allocation) => allocation.student
    );

    return NextResponse.json({
      room: {
        id: room.id,
        roomNumber: room.roomNumber,
        capacity: room.capacity,
        occupied: room.occupied,
        available: Math.max(
          room.capacity - room.occupied,
          0
        ),
      },

      hostel: {
        id: room.hostel.id,
        name: room.hostel.name,
      },

      block: {
        id: room.block.id,
        name: room.block.name,
      },

      students,
    });
  } catch (error) {
    console.error("Room details error:", error);

    return NextResponse.json(
      { message: "Failed to fetch room details" },
      { status: 500 }
    );
  }
}