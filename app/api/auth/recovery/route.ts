
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

type RecoveryAction = "PASSWORD" | "USER_ID";

type RecoveryRole =
  | "STUDENT"
  | "ADMIN"
  | "SUPER_ADMIN";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const action = String(body.action || "")
      .trim()
      .toUpperCase() as RecoveryAction;

    const role = String(body.role || "")
      .trim()
      .toUpperCase() as RecoveryRole;

    const name = String(body.name || "").trim();

    const phone = String(body.phone || "").trim();

    const studentId = String(body.studentId || "").trim();

    const newPassword = String(
      body.newPassword || ""
    );

    /*
     * --------------------------------------------------
     * Validate action
     * --------------------------------------------------
     */

    if (
      action !== "PASSWORD" &&
      action !== "USER_ID"
    ) {
      return NextResponse.json(
        {
          message: "Invalid recovery action.",
        },
        { status: 400 }
      );
    }

    /*
     * --------------------------------------------------
     * Validate role
     * --------------------------------------------------
     */

    const allowedRoles: RecoveryRole[] = [
      "STUDENT",
      "ADMIN",
      "SUPER_ADMIN",
    ];

    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        {
          message: "Invalid account role.",
        },
        { status: 400 }
      );
    }

    /*
     * --------------------------------------------------
     * Basic verification information
     * --------------------------------------------------
     */

    if (!name || !phone) {
      return NextResponse.json(
        {
          message:
            "Full name and registered phone number are required.",
        },
        { status: 400 }
      );
    }

    /*
     * --------------------------------------------------
     * Student ID is required for students
     * --------------------------------------------------
     */

    if (role === "STUDENT" && !studentId) {
      return NextResponse.json(
        {
          message:
            "Student ID is required for student account recovery.",
        },
        { status: 400 }
      );
    }

    /*
     * --------------------------------------------------
     * Password validation
     * --------------------------------------------------
     */

    if (action === "PASSWORD") {
      if (!newPassword) {
        return NextResponse.json(
          {
            message:
              "New password is required.",
          },
          { status: 400 }
        );
      }

      if (newPassword.length < 8) {
        return NextResponse.json(
          {
            message:
              "New password must be at least 8 characters long.",
          },
          { status: 400 }
        );
      }
    }

    /*
     * --------------------------------------------------
     * Find account
     * --------------------------------------------------
     *
     * For STUDENT:
     *   Match User + Student information.
     *
     * For ADMIN / SUPER_ADMIN:
     *   Match User information directly.
     *
     * Phone is matched against User.phone.
     * Student phone is also synchronized into the
     * User profile by the existing profile system,
     * so User.phone is the recovery source.
     *
     * --------------------------------------------------
     */

    let user;

    if (role === "STUDENT") {
      const student = await prisma.student.findFirst({
        where: {
          studentId,
          name,
          phone,
          user: {
            role: "STUDENT",
            status: "ACTIVE",
          },
        },
        include: {
          user: true,
        },
      });

      user = student?.user;
    } else {
      user = await prisma.user.findFirst({
        where: {
          name,
          phone,
          role,
          status: "ACTIVE",
        },
      });
    }

    /*
     * --------------------------------------------------
     * Do not reveal which individual detail failed.
     * --------------------------------------------------
     */

    if (!user) {
      return NextResponse.json(
        {
          message:
            "The information provided does not match an active account.",
        },
        { status: 401 }
      );
    }

    /*
     * --------------------------------------------------
     * FORGOT USER ID
     * --------------------------------------------------
     */

    if (action === "USER_ID") {
      return NextResponse.json({
        success: true,
        action: "USER_ID",
        user: {
          email: user.email,
        },
      });
    }

    /*
     * --------------------------------------------------
     * FORGOT PASSWORD
     * --------------------------------------------------
     */

    const hashedPassword = await bcrypt.hash(
      newPassword,
      12
    );

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      success: true,
      action: "PASSWORD",
      message:
        "Password changed successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error(
      "Account recovery error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Something went wrong during account recovery.",
      },
      { status: 500 }
    );
  }
}

