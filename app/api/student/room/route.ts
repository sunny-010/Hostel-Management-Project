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
    const student = await prisma.student.findUnique({
      where: {
        userId: user.id,
      },
      include: {
        allocations: {
          include: {
            room: {
              include: {
                hostel: true,
                allocations: {
                  include: {
                    student: true,
                  },
                  orderBy: {
                    allocatedAt: "asc",
                  },
                },
              },
            },
          },
          orderBy: {
            allocatedAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!student) {
      return NextResponse.json(null);
    }

    const allocation = student.allocations[0];

    if (!allocation) {
      return NextResponse.json(null);
    }

    const roommates = allocation.room.allocations
      .filter(
        (roomAllocation) =>
          roomAllocation.studentId !== student.id
      )
      .map((roomAllocation) => ({
        id: roomAllocation.student.id,
        studentId: roomAllocation.student.studentId,
        name: roomAllocation.student.name,
        email: roomAllocation.student.email,
        phone: roomAllocation.student.phone,
        department: roomAllocation.student.department,
        year: roomAllocation.student.year,
        allocatedAt: roomAllocation.allocatedAt,
      }));

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name,
        studentId: student.studentId,
      },

      allocation: {
        id: allocation.id,
        allocatedAt: allocation.allocatedAt,
      },

      room: {
        id: allocation.room.id,
        roomNumber: allocation.room.roomNumber,
        capacity: allocation.room.capacity,
        occupied: allocation.room.occupied,
      },

      hostel: {
        id: allocation.room.hostel.id,
        name: allocation.room.hostel.name,
        block: allocation.room.hostel.block,
      },

      roommates,
    });
  } catch (error) {
    console.error("Get student room error:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch room information",
      },
      { status: 500 }
    );
  }
}