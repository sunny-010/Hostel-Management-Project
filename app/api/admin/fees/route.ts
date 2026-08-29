import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

/* ========================================================================== */
/* GET FEES                                                                   */
/* ========================================================================== */

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

    const search =
      searchParams.get("search")?.trim() || "";

    const hostelIdParam =
      searchParams.get("hostelId") || "";

    const blockIdParam =
      searchParams.get("blockId") || "";

    const roomIdParam =
      searchParams.get("roomId") || "";

    const status =
      searchParams.get("status") || "";

    const hostelId = hostelIdParam
      ? Number(hostelIdParam)
      : null;

    const blockId = blockIdParam
      ? Number(blockIdParam)
      : null;

    const roomId = roomIdParam
      ? Number(roomIdParam)
      : null;

    /*
     * ------------------------------------------------------------
     * BUILD FILTER CONDITIONS
     * ------------------------------------------------------------
     *
     * IMPORTANT:
     *
     * There is NO date-based PAID filter here.
     *
     * Therefore old PAID records remain available.
     */

    const andConditions: any[] = [];

    /* ------------------------------------------------------------
       TEXT SEARCH
    ------------------------------------------------------------ */

    if (search) {
      andConditions.push({
        OR: [
          {
            student: {
              name: {
                contains: search,
              },
            },
          },
          {
            student: {
              studentId: {
                contains: search,
              },
            },
          },
          {
            student: {
              email: {
                contains: search,
              },
            },
          },
          {
            student: {
              department: {
                contains: search,
              },
            },
          },
          {
            student: {
              allocations: {
                some: {
                  room: {
                    roomNumber: {
                      contains: search,
                    },
                  },
                },
              },
            },
          },
          {
            student: {
              allocations: {
                some: {
                  room: {
                    hostel: {
                      name: {
                        contains: search,
                      },
                    },
                  },
                },
              },
            },
          },
          {
            student: {
              allocations: {
                some: {
                  room: {
                    block: {
                      name: {
                        contains: search,
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      });
    }

    /* ------------------------------------------------------------
       STATUS FILTER
    ------------------------------------------------------------ */

    if (
      status === "PENDING" ||
      status === "PAID" ||
      status === "OVERDUE"
    ) {
      andConditions.push({
        status,
      });
    }

    /* ------------------------------------------------------------
       HOSTEL FILTER
    ------------------------------------------------------------ */

    if (
      hostelId !== null &&
      !Number.isNaN(hostelId)
    ) {
      andConditions.push({
        student: {
          allocations: {
            some: {
              room: {
                hostelId,
              },
            },
          },
        },
      });
    }

    /* ------------------------------------------------------------
       BLOCK FILTER
    ------------------------------------------------------------ */

    if (
      blockId !== null &&
      !Number.isNaN(blockId)
    ) {
      andConditions.push({
        student: {
          allocations: {
            some: {
              room: {
                blockId,
              },
            },
          },
        },
      });
    }

    /* ------------------------------------------------------------
       ROOM FILTER
    ------------------------------------------------------------ */

    if (
      roomId !== null &&
      !Number.isNaN(roomId)
    ) {
      andConditions.push({
        student: {
          allocations: {
            some: {
              roomId,
            },
          },
        },
      });
    }

    /*
     * ------------------------------------------------------------
     * FINAL WHERE
     * ------------------------------------------------------------
     *
     * No filters = ALL fee records.
     *
     * This is what allows historical PAID records to appear.
     */

    const whereCondition =
      andConditions.length > 0
        ? {
            AND: andConditions,
          }
        : {};

    /* ------------------------------------------------------------
       FETCH
    ------------------------------------------------------------ */

    const fees = await prisma.fee.findMany({
      where: whereCondition,
      include: {
        student: {
          include: {
            allocations: {
              include: {
                room: {
                  include: {
                    hostel: true,
                    block: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        dueDate: "desc",
      },
    });

    /* ------------------------------------------------------------
       FORMAT RESPONSE
    ------------------------------------------------------------ */

    const formattedFees = fees.map((fee) => {
      const allocation =
        fee.student.allocations[0];

      return {
        id: fee.id,

        amount: fee.amount.toString(),

        status: fee.status,

        dueDate: fee.dueDate,

        paidDate: fee.paidDate,

        createdAt: fee.createdAt,

        student: {
          id: fee.student.id,

          studentId:
            fee.student.studentId,

          name:
            fee.student.name,

          email:
            fee.student.email,

          phone:
            fee.student.phone,

          department:
            fee.student.department,

          year:
            fee.student.year,

          hostel:
            allocation?.room.hostel
              ? {
                  id:
                    allocation.room
                      .hostel.id,

                  name:
                    allocation.room
                      .hostel.name,
                }
              : null,

          block:
            allocation?.room.block
              ? {
                  id:
                    allocation.room
                      .block.id,

                  name:
                    allocation.room
                      .block.name,
                }
              : null,

          room:
            allocation?.room
              ? {
                  id:
                    allocation.room.id,

                  roomNumber:
                    allocation.room
                      .roomNumber,
                }
              : null,
        },
      };
    });

    return NextResponse.json(
      formattedFees
    );
  } catch (error) {
    console.error(
      "Get fees error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to fetch fees",
      },
      {
        status: 500,
      }
    );
  }
}

/* ========================================================================== */
/* CREATE FEE                                                                 */
/* ========================================================================== */

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
      studentId,
      amount,
      dueDate,
    } = body;

    if (
      !studentId ||
      !amount ||
      !dueDate
    ) {
      return NextResponse.json(
        {
          message:
            "Student, amount and due date are required",
        },
        {
          status: 400,
        }
      );
    }

    const studentIdNumber =
      Number(studentId);

    const amountNumber =
      Number(amount);

    if (
      Number.isNaN(studentIdNumber) ||
      Number.isNaN(amountNumber) ||
      amountNumber <= 0
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid student or amount",
        },
        {
          status: 400,
        }
      );
    }

    const parsedDueDate =
      new Date(dueDate);

    if (
      Number.isNaN(
        parsedDueDate.getTime()
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid due date",
        },
        {
          status: 400,
        }
      );
    }

    const student =
      await prisma.student.findUnique({
        where: {
          id: studentIdNumber,
        },
      });

    if (!student) {
      return NextResponse.json(
        {
          message:
            "Student not found",
        },
        {
          status: 404,
        }
      );
    }

    const fee =
      await prisma.$transaction(
        async (tx) => {
          const newFee =
            await tx.fee.create({
              data: {
                studentId:
                  studentIdNumber,

                amount:
                  amountNumber,

                dueDate:
                  parsedDueDate,

                status:
                  "PENDING",
              },

              include: {
                student: true,
              },
            });

          await createAuditLog({
            actorId: user.id,

            actorName:
              user.name,

            actorEmail:
              user.email,

            action:
              "CREATE",

            entity:
              "FEE",

            entityId:
              newFee.id,

            description:
              `Created fee of ${newFee.amount} for student "${student.name}" (${student.email}), due on ${newFee.dueDate.toISOString()}.`,

            db: tx,
          });

          return newFee;
        }
      );

    return NextResponse.json(
      {
        id: fee.id,
        amount: fee.amount.toString(),
        status: fee.status,
        dueDate: fee.dueDate,
        paidDate: fee.paidDate,
        createdAt: fee.createdAt,
        student: fee.student,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Create fee error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to create fee",
      },
      {
        status: 500,
      }
    );
  }
}

/* ========================================================================== */
/* UPDATE FEE                                                                 */
/* ========================================================================== */

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

    const {
      id,
      amount,
      dueDate,
      status,
    } = body;

    if (!id) {
      return NextResponse.json(
        {
          message:
            "Fee ID is required",
        },
        {
          status: 400,
        }
      );
    }

    const feeId = Number(id);

    if (Number.isNaN(feeId)) {
      return NextResponse.json(
        {
          message:
            "Invalid fee ID",
        },
        {
          status: 400,
        }
      );
    }

    const existingFee =
      await prisma.fee.findUnique({
        where: {
          id: feeId,
        },
        include: {
          student: true,
        },
      });

    if (!existingFee) {
      return NextResponse.json(
        {
          message:
            "Fee not found",
        },
        {
          status: 404,
        }
      );
    }

    /* ------------------------------------------------------------
       AMOUNT VALIDATION
    ------------------------------------------------------------ */

    let amountNumber:
      | number
      | undefined;

    if (
      amount !== undefined
    ) {
      amountNumber =
        Number(amount);

      if (
        Number.isNaN(
          amountNumber
        ) ||
        amountNumber <= 0
      ) {
        return NextResponse.json(
          {
            message:
              "Amount must be greater than 0",
          },
          {
            status: 400,
          }
        );
      }
    }

    /* ------------------------------------------------------------
       STATUS VALIDATION
    ------------------------------------------------------------ */

    if (
      status !== undefined &&
      status !== "PENDING" &&
      status !== "PAID" &&
      status !== "OVERDUE"
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid fee status",
        },
        {
          status: 400,
        }
      );
    }

    /* ------------------------------------------------------------
       DATE VALIDATION
    ------------------------------------------------------------ */

    let parsedDueDate:
      | Date
      | undefined;

    if (
      dueDate !== undefined
    ) {
      parsedDueDate =
        new Date(dueDate);

      if (
        Number.isNaN(
          parsedDueDate.getTime()
        )
      ) {
        return NextResponse.json(
          {
            message:
              "Invalid due date",
          },
          {
            status: 400,
          }
        );
      }
    }

    const finalStatus =
      status ??
      existingFee.status;

    /* ------------------------------------------------------------
       UPDATE
    ------------------------------------------------------------ */

    const updatedFee =
      await prisma.$transaction(
        async (tx) => {
          const fee =
            await tx.fee.update({
              where: {
                id: feeId,
              },

              data: {
                ...(amountNumber !==
                  undefined && {
                  amount:
                    amountNumber,
                }),

                ...(parsedDueDate !==
                  undefined && {
                  dueDate:
                    parsedDueDate,
                }),

                ...(status !==
                  undefined && {
                  status,
                }),

                /*
                 * PAID:
                 * keep existing paidDate if it exists.
                 * Otherwise create one now.
                 *
                 * PENDING / OVERDUE:
                 * remove paidDate.
                 */

                paidDate:
                  finalStatus ===
                  "PAID"
                    ? existingFee.paidDate ??
                      new Date()
                    : null,
              },

              include: {
                student: true,
              },
            });

          /* ------------------------------------------------------
             AUDIT DESCRIPTION
          ------------------------------------------------------ */

          const changes: string[] =
            [];

          if (
            amountNumber !==
              undefined &&
            Number(
              existingFee.amount
            ) !== amountNumber
          ) {
            changes.push(
              `amount from ${existingFee.amount} to ${amountNumber}`
            );
          }

          if (
            parsedDueDate !==
              undefined &&
            existingFee.dueDate.getTime() !==
              parsedDueDate.getTime()
          ) {
            changes.push(
              `due date from ${existingFee.dueDate.toISOString()} to ${parsedDueDate.toISOString()}`
            );
          }

          if (
            status !==
              undefined &&
            existingFee.status !==
              status
          ) {
            changes.push(
              `status from ${existingFee.status} to ${status}`
            );
          }

          if (
            changes.length ===
            0
          ) {
            changes.push(
              "fee details updated"
            );
          }

          await createAuditLog({
            actorId: user.id,

            actorName:
              user.name,

            actorEmail:
              user.email,

            action:
              "UPDATE",

            entity:
              "FEE",

            entityId:
              fee.id,

            description:
              `Updated fee for student "${existingFee.student.name}" (${existingFee.student.email}): ${changes.join(", ")}.`,

            db: tx,
          });

          return fee;
        }
      );

    return NextResponse.json(
      {
        id:
          updatedFee.id,

        amount:
          updatedFee.amount.toString(),

        status:
          updatedFee.status,

        dueDate:
          updatedFee.dueDate,

        paidDate:
          updatedFee.paidDate,

        createdAt:
          updatedFee.createdAt,

        student:
          updatedFee.student,
      }
    );
  } catch (error) {
    console.error(
      "Update fee error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to update fee",
      },
      {
        status: 500,
      }
    );
  }
}

/* ========================================================================== */
/* DELETE FEE                                                                 */
/* ========================================================================== */

export async function DELETE(
  request: Request
) {
  const user = await requireAdmin();

  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body =
      await request.json();

    const { id } = body;

    if (!id) {
      return NextResponse.json(
        {
          message:
            "Fee ID is required",
        },
        {
          status: 400,
        }
      );
    }

    const feeId =
      Number(id);

    if (
      Number.isNaN(
        feeId
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid fee ID",
        },
        {
          status: 400,
        }
      );
    }

    const existingFee =
      await prisma.fee.findUnique({
        where: {
          id: feeId,
        },
        include: {
          student: true,
        },
      });

    if (!existingFee) {
      return NextResponse.json(
        {
          message:
            "Fee not found",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.$transaction(
      async (tx) => {
        await tx.fee.delete({
          where: {
            id: feeId,
          },
        });

        await createAuditLog({
          actorId:
            user.id,

          actorName:
            user.name,

          actorEmail:
            user.email,

          action:
            "DELETE",

          entity:
            "FEE",

          entityId:
            feeId,

          description:
            `Deleted fee of ${existingFee.amount} for student "${existingFee.student.name}" (${existingFee.student.email}).`,

          db: tx,
        });
      }
    );

    return NextResponse.json({
      message:
        "Fee deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete fee error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to delete fee",
      },
      {
        status: 500,
      }
    );
  }
}