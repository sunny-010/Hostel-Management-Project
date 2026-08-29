import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

import { requireSuperAdmin } from "@/lib/auth";

import { createAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    const currentUser = await requireSuperAdmin();

    if (!currentUser) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 403 }
      );
    }

    const admins = await prisma.user.findMany({
      where: {
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(admins);
  } catch (error) {
    console.error(
      "SuperAdmin admins GET error:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to fetch administrators",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireSuperAdmin();

    if (!currentUser) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 403 }
      );
    }

    /*
     * --------------------------------------------------
     * Check whether Admin creation is enabled.
     * --------------------------------------------------
     */

    const settings =
      await prisma.systemSettings.findUnique({
        where: {
          id: 1,
        },
        select: {
          allowAdminCreation: true,
        },
      });

    if (
      settings &&
      settings.allowAdminCreation === false
    ) {
      return NextResponse.json(
        {
          message:
            "Admin account creation is currently disabled by the SuperAdmin",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const name = String(
      body.name || ""
    ).trim();

    const email = String(
      body.email || ""
    )
      .trim()
      .toLowerCase();

    const phone =
      body.phone !== undefined &&
      body.phone !== null
        ? String(body.phone).trim()
        : "";

    const password = String(
      body.password || ""
    );

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          message:
            "Name, email and password are required",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          message:
            "Password must be at least 8 characters",
        },
        { status: 400 }
      );
    }

    /*
     * --------------------------------------------------
     * Validate phone if provided.
     * --------------------------------------------------
     */

    if (phone.length > 30) {
      return NextResponse.json(
        {
          message:
            "Phone number cannot exceed 30 characters",
        },
        { status: 400 }
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
            "An account with this email already exists",
        },
        { status: 409 }
      );
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const result =
      await prisma.$transaction(
        async (tx) => {
          const admin =
            await tx.user.create({
              data: {
                name,
                email,
                password: hashedPassword,
                role: "ADMIN",
                status: "ACTIVE",
                phone: phone || null,
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
            action: "CREATE",
            entity: "USER",
            entityId: admin.id,
            description:
              `Created administrator "${admin.name}" (${admin.email})` +
              `${
                admin.phone
                  ? ` with phone number "${admin.phone}".`
                  : "."
              }`,
          });

          return admin;
        }
      );

    return NextResponse.json(
      {
        message:
          "Administrator created successfully",
        admin: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "SuperAdmin admins POST error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to create administrator",
      },
      { status: 500 }
    );
  }
}