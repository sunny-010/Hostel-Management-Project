import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

/*
|--------------------------------------------------------------------------
| GET - Get complaints
|--------------------------------------------------------------------------
| Resolved complaints remain visible for 24 hours.
| After 24 hours they are hidden from the admin page,
| but they are NOT deleted from the database.
|--------------------------------------------------------------------------
*/

export async function GET() {
  const user = await requireAdmin();

  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // 24 hours ago
    const twentyFourHoursAgo = new Date(
      Date.now() - 24 * 60 * 60 * 1000
    );

    const complaints =
      await prisma.complaint.findMany({
        where: {
          OR: [
            // All complaints which are not resolved
            {
              status: {
                not: "RESOLVED",
              },
            },

            // Resolved complaints only for 24 hours
            {
              status: "RESOLVED",
              updatedAt: {
                gte: twentyFourHoursAgo,
              },
            },
          ],
        },

        include: {
          student: {
            include: {
              allocations: {
                include: {
                  room: {
                    include: {
                      hostel: true,
                    },
                  },
                },
              },
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json(complaints);
  } catch (error) {
    console.error(
      "Get complaints error:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to fetch complaints",
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| POST - Create complaint
|--------------------------------------------------------------------------
| This route is included for completeness.
| Normally students should create complaints through
| the student complaint API.
|--------------------------------------------------------------------------
*/

export async function POST(
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
    const body = await request.json();

    const {
      studentId,
      title,
      description,
    } = body;

    if (
      !studentId ||
      !title ||
      !description
    ) {
      return NextResponse.json(
        {
          message:
            "Student, title and description are required",
        },
        { status: 400 }
      );
    }

    const studentIdNumber =
      Number(studentId);

    if (
      Number.isNaN(studentIdNumber)
    ) {
      return NextResponse.json(
        {
          message: "Invalid student",
        },
        { status: 400 }
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
          message: "Student not found",
        },
        { status: 404 }
      );
    }

    const complaint =
      await prisma.complaint.create({
        data: {
          studentId: studentIdNumber,
          title: String(title).trim(),
          description:
            String(description).trim(),
          status: "PENDING",
        },

        include: {
          student: {
            include: {
              allocations: {
                include: {
                  room: {
                    include: {
                      hostel: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

    return NextResponse.json(
      complaint,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Create complaint error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to create complaint",
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| PATCH - Update complaint status
|--------------------------------------------------------------------------
| Supported statuses:
| PENDING
| IN_PROGRESS
| RESOLVED
| REJECTED
|
| When status becomes RESOLVED, Prisma automatically
| updates updatedAt because of @updatedAt in schema.prisma.
|
| The GET route uses updatedAt to determine the
| 24-hour visibility period.
|--------------------------------------------------------------------------
*/

export async function PATCH(
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
    const body = await request.json();

    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        {
          message:
            "Complaint ID and status are required",
        },
        { status: 400 }
      );
    }

    const validStatuses = [
      "PENDING",
      "IN_PROGRESS",
      "RESOLVED",
      "REJECTED",
    ];

    if (
      !validStatuses.includes(status)
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid complaint status",
        },
        { status: 400 }
      );
    }

    const complaintId = Number(id);

    if (
      Number.isNaN(complaintId)
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid complaint ID",
        },
        { status: 400 }
      );
    }

    const complaint =
      await prisma.complaint.findUnique({
        where: {
          id: complaintId,
        },
      });

    if (!complaint) {
      return NextResponse.json(
        {
          message: "Complaint not found",
        },
        { status: 404 }
      );
    }

    const updatedComplaint =
      await prisma.complaint.update({
        where: {
          id: complaintId,
        },

        data: {
          status,
        },

        include: {
          student: {
            include: {
              allocations: {
                include: {
                  room: {
                    include: {
                      hostel: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

    return NextResponse.json(
      updatedComplaint
    );
  } catch (error) {
    console.error(
      "Update complaint error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to update complaint",
      },
      { status: 500 }
    );
  }
}