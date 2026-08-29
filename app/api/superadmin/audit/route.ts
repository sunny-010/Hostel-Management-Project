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

    const auditLogs = await prisma.auditLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(auditLogs);
  } catch (error) {
    console.error("SuperAdmin audit GET error:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch audit logs",
      },
      { status: 500 }
    );
  }
}