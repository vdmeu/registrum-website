import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export function proxy(req: NextRequest) {
  const res = NextResponse.next();

  // Set an anonymous fingerprint cookie if not present
  if (!req.cookies.get("rid")) {
    res.cookies.set("rid", uuidv4(), {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
      httpOnly: false, // readable by JS so client can pass it if needed
      path: "/",
    });
  }

  return res;
}

export const config = {
  matcher: ["/company/:path*"],
};
