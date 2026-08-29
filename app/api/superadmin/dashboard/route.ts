import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth";

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

    const [
      totalAdmins,
      activeAdmins,
      deactivatedAdmins,
      totalStudents,
      settings,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          role: "ADMIN",
        },
      }),

      prisma.user.count({
        where: {
          role: "ADMIN",
          status: "ACTIVE",
        },
      }),

      prisma.user.count({
        where: {
          role: "ADMIN",
          status: "DEACTIVATED",
        },
      }),

      prisma.student.count(),

      prisma.systemSettings.findUnique({
        where: {
          id: 1,
        },
        select: {
          maintenanceMode: true,
          allowAdminCreation: true,
        },
      }),
    ]);

    return NextResponse.json({
      totalAdmins,
      activeAdmins,
      deactivatedAdmins,
      totalStudents,
      maintenanceMode:
        settings?.maintenanceMode ?? false,
      allowAdminCreation:
        settings?.allowAdminCreation ?? true,
    });
  } catch (error) {
    console.error(
      "SuperAdmin dashboard GET error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to fetch SuperAdmin dashboard statistics",
      },
      { status: 500 }
    );
  }
}