import { redirect } from "next/navigation";

// Magic link verification moved to the Route Handler at /api/dashboard/verify
// (cookies can only be set in Route Handlers, not Server Component pages).
// This page forwards old-format email links so they still work.
export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const dest = token
    ? `/api/dashboard/verify?token=${encodeURIComponent(token)}`
    : "/api/dashboard/verify";
  redirect(dest);
}
