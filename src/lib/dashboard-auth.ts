/**
 * Dashboard magic-link authentication.
 *
 * Flow:
 *   1. User enters email → POST /api/dashboard/send-link → Resend email with link
 *   2. User clicks link → GET /dashboard/verify?token=xxx → cookie set → redirect to /dashboard
 *   3. /dashboard reads cookie → show usage or redirect to /dashboard (unauthenticated)
 *
 * Token format: base64url(JSON payload) + "." + HMAC-SHA256 signature
 * Cookie: "dash_session" HttpOnly Secure SameSite=Lax, 7-day expiry
 */

import { createHmac } from "crypto";

const SECRET = process.env.DASHBOARD_SECRET ?? "";
const TOKEN_TTL_SECONDS = 60 * 60 * 24; // magic link valid for 24 hours
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // session cookie valid for 7 days

export const SESSION_COOKIE = "dash_session";

// ── Token generation ─────────────────────────────────────────────────────────

export function createMagicToken(email: string): string {
  const payload = Buffer.from(
    JSON.stringify({ email: email.toLowerCase(), exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS }),
  ).toString("base64url");
  const sig = hmac(payload);
  return `${payload}.${sig}`;
}

export function verifyMagicToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  if (!timingSafeEqual(sig, hmac(payload))) return null;
  try {
    const { email, exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (!email || typeof exp !== "number" || Date.now() / 1000 > exp) return null;
    return email as string;
  } catch {
    return null;
  }
}

// ── Session cookie ────────────────────────────────────────────────────────────

export function createSessionValue(email: string): string {
  const payload = Buffer.from(
    JSON.stringify({ email: email.toLowerCase(), exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS }),
  ).toString("base64url");
  const sig = hmac(payload);
  return `${payload}.${sig}`;
}

export function verifySessionCookie(value: string): string | null {
  const parts = value.split(".");
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  if (!timingSafeEqual(sig, hmac(payload))) return null;
  try {
    const { email, exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (!email || typeof exp !== "number" || Date.now() / 1000 > exp) return null;
    return email as string;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: SESSION_TTL_SECONDS,
  path: "/",
};

// ── Internals ─────────────────────────────────────────────────────────────────

function hmac(data: string): string {
  return createHmac("sha256", SECRET).update(data).digest("base64url");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
