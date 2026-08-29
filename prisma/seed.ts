import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

  if (!superAdminEmail || !superAdminPassword) {
    throw new Error(
      "SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set in .env"
    );
  }

  const superAdminHashedPassword = await bcrypt.hash(
    superAdminPassword,
    10
  );

  const superAdmin = await prisma.user.upsert({
    where: {
      email: superAdminEmail,
    },
    update: {
      password: superAdminHashedPassword,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      name: "System Super Administrator",
    },
    create: {
      name: "System Super Administrator",
      email: superAdminEmail,
      password: superAdminHashedPassword,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
  });

  console.log("SuperAdmin created successfully:");
  console.log({
    id: superAdmin.id,
    name: superAdmin.name,
    email: superAdmin.email,
    role: superAdmin.role,
    status: superAdmin.status,
  });
}

main()
  .catch((error) => {
    console.error("Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });