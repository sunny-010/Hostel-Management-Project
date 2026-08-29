import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { requireAdmin } from "@/lib/auth";

import { createAuditLog } from "@/lib/audit";

export async function GET() {
  const user = await requireAdmin();

  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const notices = await prisma.notice.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(notices);
  } catch (error) {
    console.error(
      "Get notices error:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to fetch notices",
      },
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

    const title = String(
      body.title ?? ""
    ).trim();

    const description = String(
      body.description ?? ""
    ).trim();

    if (!title || !description) {
      return NextResponse.json(
        {
          message:
            "Title and description are required",
        },
        { status: 400 }
      );
    }

    const notice = await prisma.$transaction(
      async (tx) => {
        /*
         * Create notice
         */
        const newNotice =
          await tx.notice.create({
            data: {
              title,
              description,
            },
          });

        /*
         * Create audit log
         */
        await createAuditLog({
          db: tx,

          actorId: user.id,
          actorName: user.name,
          actorEmail: user.email,

          action: "CREATE",
          entity: "NOTICE",
          entityId: newNotice.id,

          description:
            `Created notice "${newNotice.title}".`,
        });

        return newNotice;
      }
    );

    return NextResponse.json(notice, {
      status: 201,
    });
  } catch (error) {
    console.error(
      "Create notice error:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to create notice",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request
) {
  const user = await requireAdmin();

  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const noticeId = Number(body.id);

    if (
      !Number.isInteger(noticeId) ||
      noticeId <= 0
    ) {
      return NextResponse.json(
        {
          message:
            "Valid notice ID is required",
        },
        { status: 400 }
      );
    }

    /*
     * Find notice before deleting it so we can
     * store its title in the audit log.
     */
    const notice = await prisma.notice.findUnique({
      where: {
        id: noticeId,
      },
    });

    if (!notice) {
      return NextResponse.json(
        {
          message: "Notice not found",
        },
        { status: 404 }
      );
    }

    await prisma.$transaction(
      async (tx) => {
        /*
         * Delete notice
         */
        await tx.notice.delete({
          where: {
            id: noticeId,
          },
        });

        /*
         * Create audit log
         *
         * The audit record survives the deletion
         * of the notice itself.
         */
        await createAuditLog({
          db: tx,

          actorId: user.id,
          actorName: user.name,
          actorEmail: user.email,

          action: "DELETE",
          entity: "NOTICE",
          entityId: notice.id,

          description:
            `Deleted notice "${notice.title}".`,
        });
      }
    );

    return NextResponse.json({
      message:
        "Notice deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete notice error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to delete notice",
      },
      { status: 500 }
    );
  }
}