
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { email, password, role } = body;

    if (!email || !password || !role) {
      return NextResponse.json(
        {
          message:
            "Email, password and role are required",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email)
      .trim()
      .toLowerCase();

    const normalizedRole = String(role)
      .trim()
      .toUpperCase();

    const allowedRoles = [
      "SUPER_ADMIN",
      "ADMIN",
      "STUDENT",
    ];

    if (!allowedRoles.includes(normalizedRole)) {
      return NextResponse.json(
        {
          message: "Invalid login role",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    const passwordValid = await bcrypt.compare(
      String(password),
      user.password
    );

    if (!passwordValid) {
      return NextResponse.json(
        {
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    /*
     * Deactivated accounts cannot log in.
     *
     * This is especially important for ADMIN accounts
     * because SuperAdmin can deactivate them.
     */
    if (user.status === "DEACTIVATED") {
      return NextResponse.json(
        {
          message:
            "This account has been deactivated. Please contact the SuperAdmin.",
        },
        { status: 403 }
      );
    }

    if (user.role !== normalizedRole) {
      return NextResponse.json(
        {
          message: `This account is not registered as ${normalizedRole
            .toLowerCase()
            .replace("_", " ")}`,
        },
        { status: 403 }
      );
    }

    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });

    response.cookies.set(
      "userId",
      String(user.id),
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      }
    );

    response.cookies.set(
      "role",
      user.role,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      }
    );

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        message:
          "Something went wrong during login",
      },
      { status: 500 }
    );
  }
}
