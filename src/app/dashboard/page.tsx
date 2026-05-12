import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { verifySessionCookie, SESSION_COOKIE } from "@/lib/dashboard-auth";
import { getSupabase } from "@/lib/supabase";
import DashboardClient from "./DashboardClient";
import DashboardLookup from "./DashboardLookup";
import SiteNav from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "Dashboard · Registrum",
  description: "Manage your Registrum API key, view usage, and rotate credentials.",
};

interface KeyRecord {
  id: string;
  key_prefix: string;
  plan: string;
  calls_this_month: number;
  month_reset_at: string;
  created_at: string;
  stripe_customer_id: string | null;
}

function planLimit(plan: string): number {
  const limits: Record<string, number> = { free: 50, pro: 2000, enterprise: 10000 };
  return limits[plan] ?? 50;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(SESSION_COOKIE)?.value;
  const email = sessionValue ? verifySessionCookie(sessionValue) : null;

  // ── Unauthenticated ────────────────────────────────────────────────────────
  if (!email) {
    return <LoginPage error={error} />;
  }

  // ── Fetch key record ───────────────────────────────────────────────────────
  const { data: keys } = await getSupabase()
    .from("api_keys")
    .select("id, key_prefix, plan, calls_this_month, month_reset_at, created_at, stripe_customer_id")
    .eq("label", email)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1);

  const key: KeyRecord | null = keys?.[0] ?? null;

  if (!key) {
    return <NoKeyPage email={email} />;
  }

  const limit = planLimit(key.plan);
  const pct = Math.min(100, Math.round((key.calls_this_month / limit) * 100));
  const resetDate = fmtDate(key.month_reset_at);

  return (
    <div className="min-h-screen bg-[#060D1B] text-[#E8F0FE] font-[family-name:var(--font-geist-sans)]">
      <SiteNav maxWidth="3xl" />

      <main className="mx-auto max-w-3xl px-6 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-[#7A8FAD]">Manage your API key and view usage.</p>
        </div>

        {/* Usage card */}
        <div className="rounded-xl border border-white/[0.08] bg-[#0A1628] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-[#7A8FAD]">Usage this month</div>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              key.plan === "pro" ? "bg-[#4F7BFF]/10 text-[#4F7BFF]" :
              key.plan === "enterprise" ? "bg-[#22D3A0]/10 text-[#22D3A0]" :
              "bg-white/[0.05] text-[#7A8FAD]"
            }`}>
              {key.plan}
            </span>
          </div>

          <div className="flex items-end gap-2 mb-3">
            <span className="text-3xl font-semibold text-white">{key.calls_this_month.toLocaleString()}</span>
            <span className="text-sm text-[#3D5275] mb-1">/ {limit.toLocaleString()} calls</span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all ${pct >= 90 ? "bg-red-400" : pct >= 70 ? "bg-amber-400" : "bg-[#4F7BFF]"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-[#3D5275]">
            <span>{pct}% used</span>
            <span>Resets {resetDate}</span>
          </div>

          {key.plan === "free" && (
            <div className="mt-4 rounded-lg border border-[#4F7BFF]/20 bg-[#4F7BFF]/5 px-4 py-3">
              <p className="text-sm text-[#7A8FAD]">
                Need more calls?{" "}
                <Link href="/#pricing" className="text-[#4F7BFF] hover:underline">
                  Upgrade to Pro — 2,000 calls/month for £49
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Live lookup panel */}
        <div className="rounded-xl border border-white/[0.08] bg-[#0A1628] p-6">
          <div className="text-sm font-medium text-[#7A8FAD] mb-1">Look up a company</div>
          <p className="text-xs text-[#3D5275] mb-4">
            Search live UK company data directly in your browser. Your API key gives you the same data programmatically.
          </p>
          <DashboardLookup />
        </div>

        {/* API key card */}
        <div className="rounded-xl border border-white/[0.08] bg-[#0A1628] p-6">
          <div className="text-sm font-medium text-[#7A8FAD] mb-4">API key</div>
          <div className="flex items-center gap-3 mb-4">
            <code className="flex-1 rounded-md border border-white/[0.06] bg-[#060D1B] px-3 py-2 font-[family-name:var(--font-geist-mono)] text-sm text-[#E8F0FE]">
              {key.key_prefix}••••••••••••••••••••••••••
            </code>
          </div>
          <p className="text-xs text-[#3D5275] mb-4">
            Your full key was shown once when created and is not stored in plaintext.
            If you've lost it, rotate it below to get a new one.
          </p>
          <DashboardClient />
        </div>

        {/* Key created */}
        <p className="text-xs text-[#3D5275]">Key created {fmtDate(key.created_at)}</p>
      </main>
    </div>
  );
}

/* ── Login page ────────────────────────────────────────────────────────────── */

function LoginPage({ error }: { error?: string }) {
  const errorMsg =
    error === "invalid_token" ? "That link has expired or already been used. Request a new one." :
    error === "missing_token" ? "Invalid link. Please request a new dashboard link." :
    null;

  return (
    <div className="min-h-screen bg-[#060D1B] text-[#E8F0FE] font-[family-name:var(--font-geist-sans)] flex flex-col">
      <SiteNav maxWidth="3xl" />
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-white mb-2">Your account</h1>
          <p className="text-sm text-[#7A8FAD] mb-6">
            Enter the email you signed up with. We'll send a one-click login link — no password needed.
          </p>
          {errorMsg && (
            <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {errorMsg}
            </div>
          )}
          <LoginForm />
        </div>
      </main>
    </div>
  );
}

/* ── No-key page ───────────────────────────────────────────────────────────── */

function NoKeyPage({ email }: { email: string }) {
  return (
    <div className="min-h-screen bg-[#060D1B] text-[#E8F0FE] font-[family-name:var(--font-geist-sans)] flex flex-col">
      <SiteNav maxWidth="3xl" />
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-xl font-semibold text-white mb-2">No active key found</h1>
          <p className="text-sm text-[#7A8FAD] mb-4">
            {email} doesn't have an active API key.
          </p>
          <Link
            href="/#get-key"
            className="inline-block rounded-md bg-[#4F7BFF] px-5 py-2 text-sm font-medium text-white hover:bg-[#6B93FF]"
          >
            Get a free API key →
          </Link>
        </div>
      </main>
    </div>
  );
}

/* ── Login form (client component) ─────────────────────────────────────────── */

import LoginForm from "./LoginForm";
