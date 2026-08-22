import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const accommodationInclude = {
  allocations: {
    include: {
      room: {
        include: {
          hostel: true,
        },
      },
    },
    orderBy: {
      allocatedAt: "desc" as const,
    },
    take: 1,
  },
};

export async function GET() {
  const user = await requireAdmin();

  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Delete approved/rejected applications
    // that have been in that status for 24 hours.
    const twentyFourHoursAgo = new Date(
      Date.now() - 24 * 60 * 60 * 1000
    );

    await prisma.leaveApplication.deleteMany({
      where: {
        status: {
          in: ["APPROVED", "REJECTED"],
        },
        updatedAt: {
          lte: twentyFourHoursAgo,
        },
      },
    });

    const leaves =
      await prisma.leaveApplication.findMany({
        include: {
          student: {
            include: accommodationInclude,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json(leaves);
  } catch (error) {
    console.error(
      "Get leave applications error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to fetch leave applications",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const user = await requireAdmin();

  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        {
          message:
            "Leave ID and status are required",
        },
        { status: 400 }
      );
    }

    const validStatuses = [
      "PENDING",
      "APPROVED",
      "REJECTED",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          message: "Invalid leave status",
        },
        { status: 400 }
      );
    }

    const leaveId = Number(id);

    if (Number.isNaN(leaveId)) {
      return NextResponse.json(
        {
          message: "Invalid leave ID",
        },
        { status: 400 }
      );
    }

    const leave =
      await prisma.leaveApplication.findUnique({
        where: {
          id: leaveId,
        },
      });

    if (!leave) {
      return NextResponse.json(
        {
          message:
            "Leave application not found",
        },
        { status: 404 }
      );
    }

    const updatedLeave =
      await prisma.leaveApplication.update({
        where: {
          id: leaveId,
        },
        data: {
          status,
        },
        include: {
          student: {
            include: accommodationInclude,
          },
        },
      });

    return NextResponse.json(updatedLeave);
  } catch (error) {
    console.error(
      "Update leave error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to update leave application",
      },
      { status: 500 }
    );
  }
}