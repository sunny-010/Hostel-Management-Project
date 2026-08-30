import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET
 * Return the currently logged-in user's profile.
 */
export async function GET() {
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

    const student =
      user.role === "STUDENT"
        ? await prisma.student.findUnique({
            where: {
              userId: user.id,
            },
            select: {
              studentId: true,
              phone: true,
              department: true,
              year: true,
            },
          })
        : null;

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        role: user.role,
        status: user.status,
      },
      student,
    });
  } catch (error) {
    console.error("Profile GET error:", error);

    return NextResponse.json(
      {
        message: "Failed to load profile",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH
 *
 * Used for:
 * - Changing phone number
 * - Changing profile picture
 *
 * SUPER_ADMIN can also:
 * - Change name
 * - Change email
 *
 * ADMIN and STUDENT:
 * - Cannot change name
 * - Cannot change email
 */
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

    const name =
      body.name !== undefined
        ? String(body.name).trim()
        : undefined;

    const email =
      body.email !== undefined
        ? String(body.email).trim().toLowerCase()
        : undefined;

    const phone =
      body.phone !== undefined
        ? String(body.phone).trim()
        : undefined;

    const profileImage =
      body.profileImage !== undefined
        ? body.profileImage
        : undefined;

    /**
     * At least one supported field is required.
     */
    if (
      name === undefined &&
      email === undefined &&
      phone === undefined &&
      profileImage === undefined
    ) {
      return NextResponse.json(
        {
          message: "No profile changes were provided",
        },
        { status: 400 }
      );
    }

    /**
     * Only SUPER_ADMIN can change their name.
     */
    if (
      name !== undefined &&
      user.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        {
          message:
            "Only SuperAdmin can change their name",
        },
        { status: 403 }
      );
    }

    /**
     * Only SUPER_ADMIN can change their email.
     */
    if (
      email !== undefined &&
      user.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        {
          message:
            "Students and Admins are not allowed to change their email address",
        },
        { status: 403 }
      );
    }

    /**
     * Validate name.
     */
    if (name !== undefined && !name) {
      return NextResponse.json(
        {
          message: "Name cannot be empty",
        },
        { status: 400 }
      );
    }

    /**
     * Validate email.
     *
     * This applies only to SUPER_ADMIN because
     * other roles are blocked above.
     */
    if (email !== undefined) {
      if (!email) {
        return NextResponse.json(
          {
            message: "Email cannot be empty",
          },
          { status: 400 }
        );
      }

      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(email)) {
        return NextResponse.json(
          {
            message:
              "Please enter a valid email address",
          },
          { status: 400 }
        );
      }

      /**
       * The new email must be different from
       * the current email.
       */
      if (
        email === user.email.toLowerCase()
      ) {
        return NextResponse.json(
          {
            message:
              "The new email must be different from your current email",
          },
          { status: 400 }
        );
      }

      /**
       * Check whether another User already
       * uses this email.
       */
      const existingUser =
        await prisma.user.findUnique({
          where: {
            email,
          },
        });

      if (
        existingUser &&
        existingUser.id !== user.id
      ) {
        return NextResponse.json(
          {
            message:
              "This email address is already in use",
          },
          { status: 409 }
        );
      }
    }

    /**
     * Validate profile image.
     *
     * Profile images are stored as data URLs
     * in the existing TEXT column.
     */
    if (profileImage !== undefined) {
      if (
        profileImage !== null &&
        typeof profileImage !== "string"
      ) {
        return NextResponse.json(
          {
            message: "Invalid profile image",
          },
          { status: 400 }
        );
      }

      if (
        typeof profileImage === "string" &&
        profileImage.length > 60000
      ) {
        return NextResponse.json(
          {
            message:
              "Profile image is too large. Please choose a smaller image.",
          },
          { status: 400 }
        );
      }

      if (
        typeof profileImage === "string" &&
        profileImage &&
        !profileImage.startsWith("data:image/")
      ) {
        return NextResponse.json(
          {
            message:
              "Invalid profile image format",
          },
          { status: 400 }
        );
      }
    }

    /**
     * Build User update.
     */
    const userData: {
      name?: string;
      email?: string;
      phone?: string | null;
      profileImage?: string | null;
    } = {};

    /**
     * Only SUPER_ADMIN can update name.
     */
    if (
      name !== undefined &&
      user.role === "SUPER_ADMIN"
    ) {
      userData.name = name;
    }

    /**
     * Only SUPER_ADMIN can update email.
     */
    if (
      email !== undefined &&
      user.role === "SUPER_ADMIN"
    ) {
      userData.email = email;
    }

    /**
     * All roles can update phone.
     */
    if (phone !== undefined) {
      userData.phone = phone || null;
    }

    /**
     * All roles can update profile picture.
     */
    if (profileImage !== undefined) {
      userData.profileImage =
        profileImage || null;
    }

    /**
     * Update User.
     *
     * We intentionally DO NOT update Student.email
     * because Students are not allowed to change
     * their email from the profile page.
     *
     * Student.phone is kept synchronized with
     * User.phone.
     */
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: user.id,
        },
        data: userData,
      });

      /**
       * Keep Student.phone synchronized.
       */
      if (
        user.role === "STUDENT" &&
        phone !== undefined
      ) {
        await tx.student.update({
          where: {
            userId: user.id,
          },
          data: {
            phone: phone || null,
          },
        });
      }
    });

    /**
     * Return updated profile.
     */
    const updatedUser =
      await prisma.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profileImage: true,
          role: true,
          status: true,
        },
      });

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(
      "Profile PATCH error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Something went wrong while updating your profile",
      },
      { status: 500 }
    );
  }
}