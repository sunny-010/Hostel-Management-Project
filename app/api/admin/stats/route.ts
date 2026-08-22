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
    const totalStudents = await prisma.student.count();

    const totalRooms = await prisma.room.count();

    const rooms = await prisma.room.findMany({
      select: {
        capacity: true,
        occupied: true,
      },
    });

    const availableBeds = rooms.reduce(
      (total, room) =>
        total + Math.max(room.capacity - room.occupied, 0),
      0
    );

    const pendingFees = await prisma.fee.count({
      where: {
        status: "PENDING",
      },
    });

    return NextResponse.json({
      totalStudents,
      totalRooms,
      availableBeds,
      pendingFees,
    });
  } catch (error) {
    console.error("Failed to load dashboard stats:", error);

    return NextResponse.json(
      { message: "Failed to load dashboard statistics" },
      { status: 500 }
    );
  }
}