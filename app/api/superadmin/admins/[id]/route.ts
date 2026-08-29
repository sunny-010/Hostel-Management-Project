import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { requireSuperAdmin } from "@/lib/auth";

import { createAuditLog } from "@/lib/audit";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    // Only SUPER_ADMIN can manage administrators
    const currentUser = await requireSuperAdmin();

    if (!currentUser) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    const adminId = Number(id);

    if (
      !Number.isInteger(adminId) ||
      adminId <= 0
    ) {
      return NextResponse.json(
        {
          message: "Invalid administrator ID",
        },
        { status: 400 }
      );
    }

    // Prevent SuperAdmin from modifying their own account
    if (adminId === currentUser.id) {
      return NextResponse.json(
        {
          message:
            "You cannot modify your own SuperAdmin account from here",
        },
        { status: 400 }
      );
    }

    // Only normal ADMIN accounts can be managed here.
    // SUPER_ADMIN accounts cannot be modified.
    const admin = await prisma.user.findFirst({
      where: {
        id: adminId,
        role: "ADMIN",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        {
          message: "Administrator not found",
        },
        { status: 404 }
      );
    }

    const body = await request.json();

    /*
     * --------------------------------------------------
     * STATUS UPDATE
     * --------------------------------------------------
     *
     * Preserve the existing Activate / Deactivate
     * functionality.
     */
    if (body.status !== undefined) {
      const status = body.status;

      if (
        status !== "ACTIVE" &&
        status !== "DEACTIVATED"
      ) {
        return NextResponse.json(
          {
            message:
              "Status must be ACTIVE or DEACTIVATED",
          },
          { status: 400 }
        );
      }

      const result = await prisma.$transaction(
        async (tx) => {
          const updatedAdmin =
            await tx.user.update({
              where: {
                id: adminId,
              },
              data: {
                status,
              },
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true,
              },
            });

          await createAuditLog({
            db: tx,
            actorId: currentUser.id,
            actorName: currentUser.name,
            actorEmail: currentUser.email,
            action:
              status === "DEACTIVATED"
                ? "DEACTIVATE"
                : "ACTIVATE",
            entity: "USER",
            entityId: updatedAdmin.id,
            description:
              status === "DEACTIVATED"
                ? `Deactivated administrator "${updatedAdmin.name}" (${updatedAdmin.email}).`
                : `Reactivated administrator "${updatedAdmin.name}" (${updatedAdmin.email}).`,
          });

          return updatedAdmin;
        }
      );

      return NextResponse.json({
        message:
          status === "DEACTIVATED"
            ? "Administrator deactivated successfully"
            : "Administrator reactivated successfully",
        admin: result,
      });
    }

    /*
     * --------------------------------------------------
     * EDIT ADMINISTRATOR
     * --------------------------------------------------
     */

    const name =
      body.name !== undefined
        ? String(body.name).trim()
        : undefined;

    const email =
      body.email !== undefined
        ? String(body.email)
            .trim()
            .toLowerCase()
        : undefined;

    const phone =
      body.phone !== undefined
        ? String(body.phone).trim()
        : undefined;

    // At least one editable field is required.
    if (
      name === undefined &&
      email === undefined &&
      phone === undefined
    ) {
      return NextResponse.json(
        {
          message:
            "No administrator changes were provided",
        },
        { status: 400 }
      );
    }

    /*
     * Validate name
     */
    if (name !== undefined) {
      if (!name) {
        return NextResponse.json(
          {
            message: "Name cannot be empty",
          },
          { status: 400 }
        );
      }

      if (name.length > 100) {
        return NextResponse.json(
          {
            message:
              "Name cannot exceed 100 characters",
          },
          { status: 400 }
        );
      }
    }

    /*
     * Validate email
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
       * Check whether another account already
       * uses this email.
       */
      const existingUser =
        await prisma.user.findUnique({
          where: {
            email,
          },
          select: {
            id: true,
          },
        });

      if (
        existingUser &&
        existingUser.id !== adminId
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

    /*
     * Build update object.
     */
    const userData: {
      name?: string;
      email?: string;
      phone?: string | null;
    } = {};

    if (name !== undefined) {
      userData.name = name;
    }

    if (email !== undefined) {
      userData.email = email;
    }

    if (phone !== undefined) {
      userData.phone = phone || null;
    }

    /*
     * Update administrator and create audit log
     * inside the same transaction.
     */
    const result = await prisma.$transaction(
      async (tx) => {
        const updatedAdmin =
          await tx.user.update({
            where: {
              id: adminId,
            },
            data: userData,
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              status: true,
              createdAt: true,
              updatedAt: true,
            },
          });

        const changes: string[] = [];

        if (
          name !== undefined &&
          name !== admin.name
        ) {
          changes.push(
            `name from "${admin.name}" to "${name}"`
          );
        }

        if (
          email !== undefined &&
          email !== admin.email
        ) {
          changes.push(
            `email from "${admin.email}" to "${email}"`
          );
        }

        if (
          phone !== undefined &&
          phone !== (admin.phone || "")
        ) {
          changes.push(
            `phone number from "${admin.phone || "not set"}" to "${phone || "not set"}"`
          );
        }

        await createAuditLog({
          db: tx,
          actorId: currentUser.id,
          actorName: currentUser.name,
          actorEmail: currentUser.email,
          action: "UPDATE",
          entity: "USER",
          entityId: updatedAdmin.id,
          description:
            changes.length > 0
              ? `Updated administrator "${updatedAdmin.name}" (${updatedAdmin.email}): ${changes.join(
                  ", "
                )}.`
              : `Updated administrator "${updatedAdmin.name}" (${updatedAdmin.email}).`,
        });

        return updatedAdmin;
      }
    );

    return NextResponse.json({
      message:
        "Administrator updated successfully",
      admin: result,
    });
  } catch (error) {
    console.error(
      "SuperAdmin admin PATCH error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to update administrator",
      },
      { status: 500 }
    );
  }
}