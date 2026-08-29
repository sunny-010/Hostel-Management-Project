import { prisma } from "@/lib/prisma";

type PrismaTransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "DEACTIVATE"
  | "ACTIVATE"
  | "APPROVE"
  | "REJECT"
  | "ALLOCATE"
  | "LOGIN"
  | "LOGOUT";

type AuditEntity =
  | "USER"
  | "STUDENT"
  | "HOSTEL"
  | "BLOCK"
  | "ROOM"
  | "ROOM_ALLOCATION"
  | "FEE"
  | "COMPLAINT"
  | "LEAVE"
  | "NOTICE"
  | "SYSTEM_SETTINGS";

interface CreateAuditLogParams {
  actorId?: number | null;

  actorName: string;

  actorEmail: string;

  action: AuditAction;

  entity: AuditEntity;

  entityId?: number | null;

  description: string;

  db?: PrismaTransactionClient;
}

export async function createAuditLog({
  actorId = null,
  actorName,
  actorEmail,
  action,
  entity,
  entityId = null,
  description,
  db,
}: CreateAuditLogParams) {
  const client = db ?? prisma;

  await client.auditLog.create({
    data: {
      actorId,
      actorName,
      actorEmail,
      action,
      entity,
      entityId,
      description,
    },
  });
}