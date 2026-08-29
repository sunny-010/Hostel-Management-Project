import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const currentPassword =
      body.currentPassword !== undefined
        ? String(body.currentPassword)
        : "";

    const newPassword =
      body.newPassword !== undefined
        ? String(body.newPassword)
        : "";

    const confirmPassword =
      body.confirmPassword !== undefined
        ? String(body.confirmPassword)
        : "";

    /*
     * Required fields
     */
    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return NextResponse.json(
        {
          message:
            "Current password, new password and confirmation are required",
        },
        { status: 400 }
      );
    }

    /*
     * Check current password.
     */
    const currentPasswordValid =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!currentPasswordValid) {
      return NextResponse.json(
        {
          message: "Current password is incorrect",
        },
        { status: 401 }
      );
    }

    /*
     * Password length.
     */
    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          message:
            "New password must be at least 6 characters long",
        },
        { status: 400 }
      );
    }

    /*
     * Confirm password.
     */
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        {
          message:
            "New password and confirmation password do not match",
        },
        { status: 400 }
      );
    }

    /*
     * Prevent using the same password.
     */
    const samePassword =
      await bcrypt.compare(
        newPassword,
        user.password
      );

    if (samePassword) {
      return NextResponse.json(
        {
          message:
            "New password must be different from your current password",
        },
        { status: 400 }
      );
    }

    /*
     * Hash the new password.
     */
    const hashedPassword =
      await bcrypt.hash(newPassword, 10);

    /*
     * Save password.
     */
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error(
      "Change password error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Something went wrong while changing your password",
      },
      { status: 500 }
    );
  }
}
