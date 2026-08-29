import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const accept = request.headers.get("accept") || "";

    const isBrowserNavigation = accept.includes("text/html");

    if (isBrowserNavigation) {
      const response = NextResponse.redirect(
        new URL("/login", request.url),
        303
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
    }

    const response = NextResponse.json({
      message: "Logout successful",
    });

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
