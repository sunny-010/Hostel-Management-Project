import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProto = request.headers.get("x-forwarded-proto");

    const host =
      forwardedHost ||
      request.headers.get("host") ||
      new URL(request.url).host;

    const protocol =
      forwardedProto ||
      (process.env.NODE_ENV === "production" ? "https" : "http");

    const response = NextResponse.redirect(
      new URL("/login", `${protocol}://${host}`)
    );

    response.cookies.set("userId", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    response.cookies.set("role", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);

    return NextResponse.json(
      {
        message: "Something went wrong during logout",
      },
      { status: 500 }
    );
  }
}
