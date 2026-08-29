import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { requireAdmin } from "@/lib/auth";

import { createAuditLog } from "@/lib/audit";

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

    if (
      !Number.isInteger(leaveId) ||
      leaveId <= 0
    ) {
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
        include: {
          student: true,
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

    /*
     * If the requested status is the same as the
     * existing status, there is nothing to change.
     */
    if (leave.status === status) {
      const existingLeave =
        await prisma.leaveApplication.findUnique({
          where: {
            id: leaveId,
          },
          include: {
            student: {
              include: accommodationInclude,
            },
          },
        });

      return NextResponse.json(existingLeave);
    }

    /*
     * Determine audit action.
     *
     * APPROVED -> APPROVE
     * REJECTED -> REJECT
     *
     * PENDING is treated as UPDATE because it is not
     * an approval or rejection action.
     */
    let auditAction:
      | "APPROVE"
      | "REJECT"
      | "UPDATE";

    if (status === "APPROVED") {
      auditAction = "APPROVE";
    } else if (status === "REJECTED") {
      auditAction = "REJECT";
    } else {
      auditAction = "UPDATE";
    }

    const result =
      await prisma.$transaction(async (tx) => {
        /*
         * Update leave application.
         */
        const updatedLeave =
          await tx.leaveApplication.update({
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

        /*
         * Create audit log in the same transaction.
         *
         * If the audit log fails, the leave status
         * update is also rolled back.
         */
        await createAuditLog({
          db: tx,

          actorId: user.id,
          actorName: user.name,
          actorEmail: user.email,

          action: auditAction,
          entity: "LEAVE",
          entityId: leave.id,

          description:
            status === "APPROVED"
              ? `Approved leave application for student "${leave.student.name}" (${leave.student.email}).`
              : status === "REJECTED"
              ? `Rejected leave application for student "${leave.student.name}" (${leave.student.email}).`
              : `Changed leave application status for student "${leave.student.name}" (${leave.student.email}) from ${leave.status} to ${status}.`,
        });

        return updatedLeave;
      });

    return NextResponse.json(result);
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