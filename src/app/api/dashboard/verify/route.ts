import { type NextRequest, NextResponse } from "next/server";
import { verifyMagicToken, createSessionValue, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/dashboard-auth";

export function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const returnUrl = request.nextUrl.searchParams.get("returnUrl");

  if (!token) {
    return NextResponse.redirect(new URL("/dashboard?error=missing_token", request.url));
  }

  const email = verifyMagicToken(token);
  if (!email) {
    return NextResponse.redirect(new URL("/dashboard?error=invalid_token", request.url));
  }

  // Only allow safe internal company page redirects — everything else goes to /dashboard
  const destination =
    returnUrl && /^\/company\/\d{7,8}$/.test(returnUrl) ? returnUrl : "/dashboard";

  const response = NextResponse.redirect(new URL(destination, request.url));
  response.cookies.set(SESSION_COOKIE, createSessionValue(email), SESSION_COOKIE_OPTIONS);
  return response;
}
