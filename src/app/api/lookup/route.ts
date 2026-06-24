import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { getSupabase } from "@/lib/supabase";
import { verifySessionCookie, SESSION_COOKIE } from "@/lib/dashboard-auth";

const PLAN_QUOTAS: Record<string, number> = {
  free: 50,
  web: 500,
  pro: 4000,
  enterprise: Infinity,
};

const API_URL = "https://api.registrum.co.uk/v1";
const FREE_DAILY_LIMIT = 10;

async function checkLimit(ip: string, feature: string): Promise<{ allowed: boolean }> {
  const today = new Date().toISOString().slice(0, 10);
  const identifier = createHash("sha256").update(`${ip}:${feature}`).digest("hex");
  const { data, error } = await getSupabase().rpc("increment_web_lookup", {
    p_identifier: identifier,
    p_date: today,
  });
  if (error) return { allowed: true };
  return { allowed: (data as number) <= FREE_DAILY_LIMIT };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const company = searchParams.get("company");
  const financials = searchParams.get("financials");
  const directors = searchParams.get("directors");
  const psc = searchParams.get("psc");

  const apiKey = process.env.REGISTRUM_DEMO_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Not configured" }, { status: 500 });

  const apiHeaders = { "X-API-Key": apiKey };

  // Search queries are free — just discovery, no rate limit
  if (q) {
    const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(q)}&limit=10`, {
      headers: apiHeaders,
      next: { revalidate: 60 },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  }

  // Resolve feature type and endpoint
  let endpoint: string;
  let feature: string;
  if (company)     { endpoint = `company/${company}`;              feature = "company"; }
  else if (financials) { endpoint = `company/${financials}/financials`; feature = "financials"; }
  else if (directors)  { endpoint = `company/${directors}/directors`;   feature = "directors"; }
  else if (psc)        { endpoint = `company/${psc}/psc`;               feature = "psc"; }
  else return NextResponse.json({ error: "Missing param" }, { status: 400 });

  // Resolve authenticated session
  const sessionCookieValue = req.cookies.get(SESSION_COOKIE)?.value;
  const sessionEmail = sessionCookieValue ? verifySessionCookie(sessionCookieValue) : null;

  let userRecord: { plan: string; calls_this_month: number } | null = null;
  if (sessionEmail) {
    const { data } = await getSupabase()
      .from("api_keys")
      .select("plan, calls_this_month")
      .eq("label", sessionEmail)
      .eq("is_active", true)
      .maybeSingle();
    userRecord = data ?? null;
  }

  if (userRecord) {
    // Logged-in: check monthly plan quota
    const quota = PLAN_QUOTAS[userRecord.plan] ?? 50;
    if (userRecord.calls_this_month >= quota) {
      return NextResponse.json(
        {
          error: "QUOTA_EXCEEDED",
          message: `Monthly limit reached on your ${userRecord.plan} plan. Upgrade to continue.`,
        },
        { status: 429 }
      );
    }
  } else {
    // Anonymous: IP rate limit per feature
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";
    const { allowed } = await checkLimit(ip, feature);
    if (!allowed) {
      return NextResponse.json(
        {
          error: "RATE_LIMITED",
          message: `You've used your 10 free ${feature} lookups today. Sign up for a free API key to continue.`,
        },
        { status: 429 }
      );
    }
  }

  const res = await fetch(`${API_URL}/${endpoint}`, {
    headers: apiHeaders,
    cache: "no-store",
  });
  const data = await res.json();

  // Increment logged-in user's monthly quota after a successful fetch
  if (res.ok && userRecord && sessionEmail) {
    await getSupabase()
      .from("api_keys")
      .update({ calls_this_month: userRecord.calls_this_month + 1 })
      .eq("label", sessionEmail);
  }

  return NextResponse.json(data, { status: res.ok ? 200 : res.status });
}
