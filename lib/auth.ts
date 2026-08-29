
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();

    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return null;
    }

    const parsedUserId = Number(userId);

    if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: parsedUserId,
      },
    });

    if (!user || user.status !== "ACTIVE") {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Get current user error:", error);

    return null;
  }
}

export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return user;
}

export async function requireSuperAdmin() {
  const user = await getCurrentUser();

  if (!user || user.role !== "SUPER_ADMIN") {
    return null;
  }

  return user;
}

export async function requireStudent() {
  const user = await getCurrentUser();

  if (!user || user.role !== "STUDENT") {
    return null;
  }

  return user;
}
