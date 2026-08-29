import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { requireSuperAdmin } from "@/lib/auth";

import { createAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    const user = await requireSuperAdmin();

    if (!user) {
      return NextResponse.json(
        {
          message: "SuperAdmin access required",
        },
        { status: 403 }
      );
    }

    let settings =
      await prisma.systemSettings.findUnique({
        where: {
          id: 1,
        },
      });

    if (!settings) {
      settings =
        await prisma.systemSettings.create({
          data: {
            id: 1,
          },
        });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error(
      "Get system settings error:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to load system settings",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireSuperAdmin();

    if (!user) {
      return NextResponse.json(
        {
          message: "SuperAdmin access required",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      systemName,
      institutionName,
      contactEmail,
      contactPhone,
      maintenanceMode,
      allowAdminCreation,
    } = body;

    if (
      typeof systemName !== "string" ||
      systemName.trim().length === 0
    ) {
      return NextResponse.json(
        {
          message: "System name is required",
        },
        { status: 400 }
      );
    }

    if (
      typeof institutionName !== "string" ||
      institutionName.trim().length === 0
    ) {
      return NextResponse.json(
        {
          message: "Institution name is required",
        },
        { status: 400 }
      );
    }

    if (typeof maintenanceMode !== "boolean") {
      return NextResponse.json(
        {
          message:
            "Invalid maintenance mode value",
        },
        { status: 400 }
      );
    }

    if (
      typeof allowAdminCreation !== "boolean"
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid admin creation setting",
        },
        { status: 400 }
      );
    }

    const normalizedContactEmail =
      typeof contactEmail === "string" &&
      contactEmail.trim()
        ? contactEmail.trim()
        : null;

    const normalizedContactPhone =
      typeof contactPhone === "string" &&
      contactPhone.trim()
        ? contactPhone.trim()
        : null;

    /*
     * Get the current settings first so we can
     * determine exactly what changed.
     */
    const existingSettings =
      await prisma.systemSettings.findUnique({
        where: {
          id: 1,
        },
      });

    /*
     * Build a list of meaningful changes.
     */
    const changes: string[] = [];

    if (
      existingSettings &&
      existingSettings.systemName !==
        systemName.trim()
    ) {
      changes.push(
        `System name changed from "${existingSettings.systemName}" to "${systemName.trim()}".`
      );
    }

    if (
      existingSettings &&
      existingSettings.institutionName !==
        institutionName.trim()
    ) {
      changes.push(
        `Institution name changed from "${existingSettings.institutionName}" to "${institutionName.trim()}".`
      );
    }

    if (
      existingSettings &&
      existingSettings.contactEmail !==
        normalizedContactEmail
    ) {
      changes.push(
        `Contact email changed from "${existingSettings.contactEmail ?? "not set"}" to "${normalizedContactEmail ?? "not set"}".`
      );
    }

    if (
      existingSettings &&
      existingSettings.contactPhone !==
        normalizedContactPhone
    ) {
      changes.push(
        `Contact phone changed from "${existingSettings.contactPhone ?? "not set"}" to "${normalizedContactPhone ?? "not set"}".`
      );
    }

    if (
      existingSettings &&
      existingSettings.maintenanceMode !==
        maintenanceMode
    ) {
      changes.push(
        `Maintenance mode ${maintenanceMode ? "enabled" : "disabled"}.`
      );
    }

    if (
      existingSettings &&
      existingSettings.allowAdminCreation !==
        allowAdminCreation
    ) {
      changes.push(
        `Admin account creation ${allowAdminCreation ? "enabled" : "disabled"}.`
      );
    }

    /*
     * Use a transaction so the settings update and
     * audit entry succeed or fail together.
     */
    const result = await prisma.$transaction(
      async (tx) => {
        const settings =
          await tx.systemSettings.upsert({
            where: {
              id: 1,
            },
            create: {
              id: 1,
              systemName: systemName.trim(),
              institutionName:
                institutionName.trim(),
              contactEmail:
                normalizedContactEmail,
              contactPhone:
                normalizedContactPhone,
              maintenanceMode,
              allowAdminCreation,
            },
            update: {
              systemName: systemName.trim(),
              institutionName:
                institutionName.trim(),
              contactEmail:
                normalizedContactEmail,
              contactPhone:
                normalizedContactPhone,
              maintenanceMode,
              allowAdminCreation,
            },
          });

        /*
         * Only create an audit log when an existing
         * settings record actually changed.
         *
         * If the settings row was created for the first
         * time, record that as a CREATE action.
         */
        if (!existingSettings) {
          await createAuditLog({
            db: tx,
            actorId: user.id,
            actorName: user.name,
            actorEmail: user.email,
            action: "CREATE",
            entity: "SYSTEM_SETTINGS",
            entityId: settings.id,
            description:
              "Created the system settings configuration.",
          });
        } else if (changes.length > 0) {
          await createAuditLog({
            db: tx,
            actorId: user.id,
            actorName: user.name,
            actorEmail: user.email,
            action: "UPDATE",
            entity: "SYSTEM_SETTINGS",
            entityId: settings.id,
            description: changes.join(" "),
          });
        }

        return settings;
      }
    );

    return NextResponse.json({
      message:
        "System settings updated successfully",
      settings: result,
    });
  } catch (error) {
    console.error(
      "Update system settings error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to update system settings",
      },
      { status: 500 }
    );
  }
}