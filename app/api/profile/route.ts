import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/*
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

/*
 * PATCH
 *
 * Used for:
 * - Changing email
 * - Changing phone number
 * - Changing profile picture
 *
 * SuperAdmin can also change their name.
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

    const name =
      body.name !== undefined
        ? String(body.name).trim()
        : undefined;

    /*
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

    /*
     * Only SuperAdmin can change their name.
     */
    if (
      name !== undefined &&
      user.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        {
          message:
            "You are not allowed to change your name",
        },
        { status: 403 }
      );
    }

    /*
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

    /*
     * Validate email.
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

      /*
       * The new email must be different from
       * the current email.
       */
      if (email === user.email.toLowerCase()) {
        return NextResponse.json(
          {
            message:
              "The new email must be different from your current email",
          },
          { status: 400 }
        );
      }

      /*
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

      /*
       * Students have a separate Student.email field.
       * Make sure it is not already used by another
       * student.
       */
      if (user.role === "STUDENT") {
        const existingStudent =
          await prisma.student.findUnique({
            where: {
              email,
            },
            select: {
              userId: true,
            },
          });

        if (
          existingStudent &&
          existingStudent.userId !== user.id
        ) {
          return NextResponse.json(
            {
              message:
                "This email address is already used by another student",
            },
            { status: 409 }
          );
        }
      }
    }

    /*
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

    /*
     * Build User update.
     */
    const userData: {
      name?: string;
      email?: string;
      phone?: string | null;
      profileImage?: string | null;
    } = {};

    if (
      name !== undefined &&
      user.role === "SUPER_ADMIN"
    ) {
      userData.name = name;
    }

    if (email !== undefined) {
      userData.email = email;
    }

    if (phone !== undefined) {
      userData.phone = phone || null;
    }

    if (profileImage !== undefined) {
      userData.profileImage =
        profileImage || null;
    }

    /*
     * Update User and Student together
     * in one transaction.
     */
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: user.id,
        },
        data: userData,
      });

      /*
       * Keep Student.email and Student.phone
       * synchronized with the User profile.
       */
      if (
        user.role === "STUDENT" &&
        (email !== undefined ||
          phone !== undefined)
      ) {
        const studentData: {
          email?: string;
          phone?: string | null;
        } = {};

        if (email !== undefined) {
          studentData.email = email;
        }

        if (phone !== undefined) {
          studentData.phone = phone || null;
        }

        await tx.student.update({
          where: {
            userId: user.id,
          },
          data: studentData,
        });
      }
    });

    /*
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
