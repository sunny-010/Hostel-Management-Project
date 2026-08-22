
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
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
    const students = await prisma.student.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error("Get students error:", error);

    return NextResponse.json(
      { message: "Failed to fetch students" },
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

    const {
      studentId,
      name,
      email,
      phone,
      department,
      year,
      password,
    } = body;

    if (!studentId || !name || !email || !password) {
      return NextResponse.json(
        {
          message:
            "Student ID, name, email and password are required",
        },
        { status: 400 }
      );
    }

    const existingStudent =
      await prisma.student.findFirst({
        where: {
          OR: [
            { studentId },
            { email },
          ],
        },
      });

    if (existingStudent) {
      return NextResponse.json(
        {
          message:
            "A student with this ID or email already exists",
        },
        { status: 409 }
      );
    }

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (existingUser) {
      return NextResponse.json(
        {
          message:
            "A user with this email already exists",
        },
        { status: 409 }
      );
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const student =
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role: "STUDENT",
          },
        });

        return tx.student.create({
          data: {
            studentId,
            name,
            email,
            phone: phone || null,
            department:
              department || null,
            year: year
              ? Number(year)
              : null,
            userId: user.id,
          },
        });
      });

    return NextResponse.json(student, {
      status: 201,
    });
  } catch (error) {
    console.error(
      "Create student error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to create student",
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| EDIT STUDENT
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

    const {
      id,
      studentId,
      name,
      email,
      phone,
      department,
      year,
      password,
    } = body;

    const studentDbId = Number(id);

    if (
      !Number.isInteger(studentDbId) ||
      studentDbId <= 0
    ) {
      return NextResponse.json(
        {
          message:
            "Valid student ID is required",
        },
        { status: 400 }
      );
    }

    if (
      !studentId ||
      !name ||
      !email
    ) {
      return NextResponse.json(
        {
          message:
            "Student ID, name and email are required",
        },
        { status: 400 }
      );
    }

    const existingStudent =
      await prisma.student.findUnique({
        where: {
          id: studentDbId,
        },
      });

    if (!existingStudent) {
      return NextResponse.json(
        {
          message:
            "Student not found",
        },
        { status: 404 }
      );
    }

    /*
     * Check whether another student
     * already uses the same student ID.
     */
    const duplicateStudentId =
      await prisma.student.findFirst({
        where: {
          studentId: String(studentId),
          NOT: {
            id: studentDbId,
          },
        },
      });

    if (duplicateStudentId) {
      return NextResponse.json(
        {
          message:
            "Another student already uses this Student ID",
        },
        { status: 409 }
      );
    }

    /*
     * Check whether another student
     * already uses the same email.
     */
    const duplicateStudentEmail =
      await prisma.student.findFirst({
        where: {
          email: String(email),
          NOT: {
            id: studentDbId,
          },
        },
      });

    if (duplicateStudentEmail) {
      return NextResponse.json(
        {
          message:
            "Another student already uses this email",
        },
        { status: 409 }
      );
    }

    /*
     * Check User table as email is also
     * unique there.
     */
    const existingUser =
      await prisma.user.findUnique({
        where: {
          email: String(email),
        },
      });

    if (
      existingUser &&
      existingUser.id !== existingStudent.userId
    ) {
      return NextResponse.json(
        {
          message:
            "Another account already uses this email",
        },
        { status: 409 }
      );
    }

    const updatedStudent =
      await prisma.$transaction(
        async (tx) => {
          /*
           * Update student record
           */
          const student =
            await tx.student.update({
              where: {
                id: studentDbId,
              },
              data: {
                studentId:
                  String(studentId).trim(),

                name:
                  String(name).trim(),

                email:
                  String(email).trim(),

                phone:
                  phone
                    ? String(phone).trim()
                    : null,

                department:
                  department
                    ? String(
                        department
                      ).trim()
                    : null,

                year:
                  year !== "" &&
                  year !== null &&
                  year !== undefined
                    ? Number(year)
                    : null,
              },
            });

          /*
           * Update login account
           */
          const userData: {
            name: string;
            email: string;
            password?: string;
          } = {
            name:
              String(name).trim(),

            email:
              String(email).trim(),
          };

          /*
           * Only change password if
           * admin entered a new password.
           */
          if (
            password &&
            String(password).trim()
              .length > 0
          ) {
            userData.password =
              await bcrypt.hash(
                String(password),
                10
              );
          }

          await tx.user.update({
            where: {
              id: existingStudent.userId,
            },
            data: userData,
          });

          return student;
        }
      );

    return NextResponse.json(
      updatedStudent
    );
  } catch (error) {
    console.error(
      "Update student error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to update student",
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| DELETE STUDENT
|--------------------------------------------------------------------------
*/

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
    const body = await request.json();

    const studentId = Number(
      body.id
    );

    if (
      !Number.isInteger(studentId) ||
      studentId <= 0
    ) {
      return NextResponse.json(
        {
          message:
            "Valid student ID is required",
        },
        { status: 400 }
      );
    }

    const student =
      await prisma.student.findUnique({
        where: {
          id: studentId,
        },
        include: {
          allocations: true,
        },
      });

    if (!student) {
      return NextResponse.json(
        {
          message:
            "Student not found",
        },
        { status: 404 }
      );
    }

    await prisma.$transaction(
      async (tx) => {
        /*
         * Decrease occupied count
         * for allocated rooms.
         */
        for (const allocation of student.allocations) {
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
        }

        /*
         * Delete room allocations
         */
        await tx.roomAllocation.deleteMany({
          where: {
            studentId: student.id,
          },
        });

        /*
         * Delete fees
         */
        await tx.fee.deleteMany({
          where: {
            studentId: student.id,
          },
        });

        /*
         * Delete complaints
         */
        await tx.complaint.deleteMany({
          where: {
            studentId: student.id,
          },
        });

        /*
         * Delete leave applications
         */
        await tx.leaveApplication.deleteMany({
          where: {
            studentId: student.id,
          },
        });

        /*
         * Delete student
         */
        await tx.student.delete({
          where: {
            id: student.id,
          },
        });

        /*
         * Delete login account
         */
        await tx.user.delete({
          where: {
            id: student.userId,
          },
        });
      }
    );

    return NextResponse.json({
      message:
        "Student deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete student error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to delete student",
      },
      { status: 500 }
    );
  }
}
