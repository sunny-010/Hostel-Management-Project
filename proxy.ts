import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const userId = request.cookies.get("userId")?.value;
  const role = request.cookies.get("role")?.value;

  const isLoggedIn = !!userId && !!role;

  const isSuperAdminRoute =
    pathname.startsWith("/superadmin");

  const isAdminRoute =
    pathname.startsWith("/admin");

  const isStudentRoute =
    pathname.startsWith("/student");

  const isAdminApiRoute =
    pathname.startsWith("/api/admin");

  const isStudentApiRoute =
    pathname.startsWith("/api/student");

  const isProtectedRoute =
    isSuperAdminRoute ||
    isAdminRoute ||
    isStudentRoute ||
    isAdminApiRoute ||
    isStudentApiRoute;

  /*
   * Not logged in
   */
  if (isProtectedRoute && !isLoggedIn) {
    if (isAdminApiRoute || isStudentApiRoute) {
      return NextResponse.json(
        {
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  /*
   * Maintenance Mode
   *
   * SuperAdmin is always allowed through so the
   * system can be restored from maintenance mode.
   */
  if (
    isLoggedIn &&
    role !== "SUPER_ADMIN" &&
    (isAdminRoute ||
      isStudentRoute ||
      isAdminApiRoute ||
      isStudentApiRoute)
  ) {
    try {
      const settings =
        await prisma.systemSettings.findUnique({
          where: {
            id: 1,
          },
          select: {
            maintenanceMode: true,
          },
        });

      if (settings?.maintenanceMode === true) {
        /*
         * API requests receive JSON instead of being
         * redirected to an HTML page.
         */
        if (
          isAdminApiRoute ||
          isStudentApiRoute
        ) {
          return NextResponse.json(
            {
              message:
                "The system is currently under maintenance. Please try again later.",
              maintenanceMode: true,
            },
            { status: 503 }
          );
        }

        /*
         * Prevent redirect loop if the user is already
         * on the maintenance page.
         */
        if (pathname !== "/maintenance") {
          return NextResponse.redirect(
            new URL("/maintenance", request.url)
          );
        }
      }
    } catch (error) {
      /*
       * If the settings lookup fails, do not lock the
       * entire application. Existing authentication
       * and role protection should continue to work.
       */
      console.error(
        "Maintenance mode check error:",
        error
      );
    }
  }

  /*
   * SuperAdmin routes
   */
  if (
    isSuperAdminRoute &&
    role !== "SUPER_ADMIN"
  ) {
    if (role === "ADMIN") {
      return NextResponse.redirect(
        new URL("/admin/dashboard", request.url)
      );
    }

    if (role === "STUDENT") {
      return NextResponse.redirect(
        new URL("/student/dashboard", request.url)
      );
    }

    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  /*
   * Admin routes
   */
  if (
    isAdminRoute &&
    role !== "ADMIN"
  ) {
    if (role === "SUPER_ADMIN") {
      return NextResponse.redirect(
        new URL(
          "/superadmin/dashboard",
          request.url
        )
      );
    }

    if (role === "STUDENT") {
      return NextResponse.redirect(
        new URL(
          "/student/dashboard",
          request.url
        )
      );
    }

    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  /*
   * Student routes
   */
  if (
    isStudentRoute &&
    role !== "STUDENT"
  ) {
    if (role === "SUPER_ADMIN") {
      return NextResponse.redirect(
        new URL(
          "/superadmin/dashboard",
          request.url
        )
      );
    }

    if (role === "ADMIN") {
      return NextResponse.redirect(
        new URL(
          "/admin/dashboard",
          request.url
        )
      );
    }

    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/superadmin/:path*",
    "/admin/:path*",
    "/student/:path*",
    "/api/admin/:path*",
    "/api/student/:path*",
  ],
};
