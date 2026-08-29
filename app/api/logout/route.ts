import { NextResponse } from "next/server";

export async function POST() {
try {
const response = NextResponse.redirect(
new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
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
