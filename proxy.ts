import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const userId = request.cookies.get("userId")?.value;
  const role = request.cookies.get("role")?.value;

  const isLoggedIn = !!userId && !!role;

  const isAdminRoute = pathname.startsWith("/admin");
  const isStudentRoute = pathname.startsWith("/student");

  // Not logged in
  if ((isAdminRoute || isStudentRoute) && !isLoggedIn) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  // Admin trying to access student pages
  if (isStudentRoute && role !== "STUDENT") {
    return NextResponse.redirect(
      new URL("/admin/dashboard", request.url)
    );
  }

  // Student trying to access admin pages
  if (isAdminRoute && role !== "ADMIN") {
    return NextResponse.redirect(
      new URL("/student/dashboard", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/student/:path*",
  ],
};