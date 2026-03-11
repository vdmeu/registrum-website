import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyMagicToken, createSessionValue, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/dashboard-auth";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/dashboard?error=missing_token");
  }

  const email = verifyMagicToken(token);

  if (!email) {
    redirect("/dashboard?error=invalid_token");
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSessionValue(email), SESSION_COOKIE_OPTIONS);

  redirect("/dashboard");
}
