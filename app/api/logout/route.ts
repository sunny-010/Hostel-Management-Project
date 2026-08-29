import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const response = NextResponse.redirect(
      new URL("/login", request.url)
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
