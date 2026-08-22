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
    const fees = await prisma.fee.findMany({
      include: {
        student: true,
      },
      orderBy: {
        dueDate: "desc",
      },
    });

    return NextResponse.json(fees);
  } catch (error) {
    console.error("Get fees error:", error);

    return NextResponse.json(
      { message: "Failed to fetch fees" },
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
      amount,
      dueDate,
    } = body;

    if (!studentId || !amount || !dueDate) {
      return NextResponse.json(
        {
          message:
            "Student, amount and due date are required",
        },
        { status: 400 }
      );
    }

    const studentIdNumber = Number(studentId);
    const amountNumber = Number(amount);

    if (
      Number.isNaN(studentIdNumber) ||
      Number.isNaN(amountNumber) ||
      amountNumber <= 0
    ) {
      return NextResponse.json(
        {
          message: "Invalid student or amount",
        },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
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

    const fee = await prisma.fee.create({
      data: {
        studentId: studentIdNumber,
        amount: amountNumber,
        dueDate: new Date(dueDate),
        status: "PENDING",
      },
      include: {
        student: true,
      },
    });

    return NextResponse.json(fee, {
      status: 201,
    });
  } catch (error) {
    console.error("Create fee error:", error);

    return NextResponse.json(
      {
        message: "Failed to create fee",
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| UPDATE FEE
|--------------------------------------------------------------------------
| Allows admin to modify:
| - amount
| - dueDate
| - status
*/
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
          message: "Fee ID is required",
        },
        { status: 400 }
      );
    }

    const feeId = Number(id);

    if (Number.isNaN(feeId)) {
      return NextResponse.json(
        {
          message: "Invalid fee ID",
        },
        { status: 400 }
      );
    }

    const existingFee = await prisma.fee.findUnique({
      where: {
        id: feeId,
      },
    });

    if (!existingFee) {
      return NextResponse.json(
        {
          message: "Fee not found",
        },
        { status: 404 }
      );
    }

    // Validate amount if provided
    let amountNumber: number | undefined;

    if (amount !== undefined) {
      amountNumber = Number(amount);

      if (
        Number.isNaN(amountNumber) ||
        amountNumber <= 0
      ) {
        return NextResponse.json(
          {
            message: "Amount must be greater than 0",
          },
          { status: 400 }
        );
      }
    }

    // Validate status
    if (
      status !== undefined &&
      status !== "PENDING" &&
      status !== "PAID" &&
      status !== "OVERDUE"
    ) {
      return NextResponse.json(
        {
          message: "Invalid fee status",
        },
        { status: 400 }
      );
    }

    // Validate due date
    if (dueDate !== undefined) {
      const parsedDate = new Date(dueDate);

      if (Number.isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          {
            message: "Invalid due date",
          },
          { status: 400 }
        );
      }
    }

    const finalStatus =
      status ?? existingFee.status;

    const updatedFee = await prisma.fee.update({
      where: {
        id: feeId,
      },
      data: {
        ...(amountNumber !== undefined && {
          amount: amountNumber,
        }),

        ...(dueDate !== undefined && {
          dueDate: new Date(dueDate),
        }),

        ...(status !== undefined && {
          status,
        }),

        paidDate:
          finalStatus === "PAID"
            ? existingFee.paidDate ?? new Date()
            : null,
      },
      include: {
        student: true,
      },
    });

    return NextResponse.json(updatedFee);
  } catch (error) {
    console.error("Update fee error:", error);

    return NextResponse.json(
      {
        message: "Failed to update fee",
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| DELETE FEE
|--------------------------------------------------------------------------
*/
export async function DELETE(request: Request) {
  const user = await requireAdmin();

  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const { id } = body;

    if (!id) {
      return NextResponse.json(
        {
          message: "Fee ID is required",
        },
        { status: 400 }
      );
    }

    const feeId = Number(id);

    if (Number.isNaN(feeId)) {
      return NextResponse.json(
        {
          message: "Invalid fee ID",
        },
        { status: 400 }
      );
    }

    const fee = await prisma.fee.findUnique({
      where: {
        id: feeId,
      },
    });

    if (!fee) {
      return NextResponse.json(
        {
          message: "Fee not found",
        },
        { status: 404 }
      );
    }

    await prisma.fee.delete({
      where: {
        id: feeId,
      },
    });

    return NextResponse.json({
      message: "Fee deleted successfully",
    });
  } catch (error) {
    console.error("Delete fee error:", error);

    return NextResponse.json(
      {
        message: "Failed to delete fee",
      },
      { status: 500 }
    );
  }
}