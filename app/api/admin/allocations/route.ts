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
    const allocations = await prisma.roomAllocation.findMany({
      include: {
        student: true,
        room: {
          include: {
            hostel: true,
          },
        },
      },
      orderBy: {
        allocatedAt: "desc",
      },
    });

    return NextResponse.json(allocations);
  } catch (error) {
    console.error("Get allocations error:", error);

    return NextResponse.json(
      { message: "Failed to fetch allocations" },
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

    const { studentId, roomId } = body;

    if (!studentId || !roomId) {
      return NextResponse.json(
        {
          message: "Student and room are required",
        },
        { status: 400 }
      );
    }

    const studentIdNumber = Number(studentId);
    const roomIdNumber = Number(roomId);

    if (
      !Number.isInteger(studentIdNumber) ||
      !Number.isInteger(roomIdNumber)
    ) {
      return NextResponse.json(
        {
          message: "Invalid student or room",
        },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const student = await tx.student.findUnique({
        where: {
          id: studentIdNumber,
        },
      });

      if (!student) {
        throw new Error("STUDENT_NOT_FOUND");
      }

      const existingAllocation =
        await tx.roomAllocation.findFirst({
          where: {
            studentId: studentIdNumber,
          },
        });

      if (existingAllocation) {
        throw new Error("STUDENT_ALREADY_ALLOCATED");
      }

      const room = await tx.room.findUnique({
        where: {
          id: roomIdNumber,
        },
      });

      if (!room) {
        throw new Error("ROOM_NOT_FOUND");
      }

      if (room.occupied >= room.capacity) {
        throw new Error("ROOM_FULL");
      }

      const allocation = await tx.roomAllocation.create({
        data: {
          studentId: studentIdNumber,
          roomId: roomIdNumber,
        },
        include: {
          student: true,
          room: {
            include: {
              hostel: true,
            },
          },
        },
      });

      await tx.room.update({
        where: {
          id: roomIdNumber,
        },
        data: {
          occupied: {
            increment: 1,
          },
        },
      });

      return allocation;
    });

    return NextResponse.json(result, {
      status: 201,
    });
  } catch (error) {
    console.error("Create allocation error:", error);

    if (error instanceof Error) {
      if (error.message === "STUDENT_NOT_FOUND") {
        return NextResponse.json(
          { message: "Student not found" },
          { status: 404 }
        );
      }

      if (error.message === "STUDENT_ALREADY_ALLOCATED") {
        return NextResponse.json(
          {
            message:
              "This student is already allocated to a room",
          },
          { status: 409 }
        );
      }

      if (error.message === "ROOM_NOT_FOUND") {
        return NextResponse.json(
          { message: "Room not found" },
          { status: 404 }
        );
      }

      if (error.message === "ROOM_FULL") {
        return NextResponse.json(
          {
            message: "This room is already full",
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { message: "Failed to create allocation" },
      { status: 500 }
    );
  }
}

/*
 * MODIFY EXISTING ROOM ALLOCATION
 */
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

    const { allocationId, roomId } = body;

    if (!allocationId || !roomId) {
      return NextResponse.json(
        {
          message: "Allocation and room are required",
        },
        { status: 400 }
      );
    }

    const allocationIdNumber = Number(allocationId);
    const newRoomIdNumber = Number(roomId);

    if (
      !Number.isInteger(allocationIdNumber) ||
      !Number.isInteger(newRoomIdNumber)
    ) {
      return NextResponse.json(
        {
          message: "Invalid allocation or room",
        },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Find current allocation
      const allocation =
        await tx.roomAllocation.findUnique({
          where: {
            id: allocationIdNumber,
          },
        });

      if (!allocation) {
        throw new Error("ALLOCATION_NOT_FOUND");
      }

      // If admin selected the same room
      if (allocation.roomId === newRoomIdNumber) {
        throw new Error("SAME_ROOM");
      }

      // Find new room
      const newRoom = await tx.room.findUnique({
        where: {
          id: newRoomIdNumber,
        },
      });

      if (!newRoom) {
        throw new Error("ROOM_NOT_FOUND");
      }

      // Check capacity of new room
      if (newRoom.occupied >= newRoom.capacity) {
        throw new Error("ROOM_FULL");
      }

      // Decrease occupied count of old room
      await tx.room.update({
        where: {
          id: allocation.roomId,
        },
        data: {
          occupied: {
            decrement: 1,
          },
        },
      });

      // Increase occupied count of new room
      await tx.room.update({
        where: {
          id: newRoomIdNumber,
        },
        data: {
          occupied: {
            increment: 1,
          },
        },
      });

      // Update allocation
      const updatedAllocation =
        await tx.roomAllocation.update({
          where: {
            id: allocationIdNumber,
          },
          data: {
            roomId: newRoomIdNumber,
            allocatedAt: new Date(),
          },
          include: {
            student: true,
            room: {
              include: {
                hostel: true,
              },
            },
          },
        });

      return updatedAllocation;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Modify allocation error:", error);

    if (error instanceof Error) {
      if (error.message === "ALLOCATION_NOT_FOUND") {
        return NextResponse.json(
          { message: "Allocation not found" },
          { status: 404 }
        );
      }

      if (error.message === "SAME_ROOM") {
        return NextResponse.json(
          {
            message:
              "Student is already allocated to this room",
          },
          { status: 400 }
        );
      }

      if (error.message === "ROOM_NOT_FOUND") {
        return NextResponse.json(
          { message: "Room not found" },
          { status: 404 }
        );
      }

      if (error.message === "ROOM_FULL") {
        return NextResponse.json(
          {
            message:
              "The selected room is already full",
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      {
        message: "Failed to modify room allocation",
      },
      { status: 500 }
    );
  }
}