import { cookies, headers } from "next/headers";
import { createHash } from "crypto";
import { notFound } from "next/navigation";
import Link from "next/link";
import DirectorGraph from "@/components/DirectorGraph";
import { getSupabase } from "@/lib/supabase";
import { verifySessionCookie, SESSION_COOKIE } from "@/lib/dashboard-auth";

const API_URL = "https://api.registrum.co.uk/v1";
const FREE_DAILY_LIMIT = 10;

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface CompanyProfile {
  company_number: string;
  company_name: string;
  company_status: string;
  company_type: string;
  date_of_creation: string;
  company_age_years: number;
  registered_office_address?: {
    address_line_1?: string;
    locality?: string;
    postal_code?: string;
  };
  accounts?: { overdue: boolean; next_accounts_due?: string };
  confirmation_statement?: { overdue: boolean };
  sic_codes?: string[];
}

interface FinancialValue {
  current?: number | null;
  prior?: number | null;
}

interface Financials {
  period_end?: string;
  accounts_type?: string;
  profit_and_loss?: {
    turnover?: FinancialValue | null;
    gross_profit?: FinancialValue | null;
    profit_before_tax?: FinancialValue | null;
  };
  balance_sheet?: {
    net_assets?: FinancialValue | null;
    fixed_assets?: FinancialValue | null;
  };
  other?: {
    employees?: FinancialValue | null;
  };
  data_quality?: {
    completeness?: number;
    accounts_type?: string;
    has_profit_loss?: boolean;
  };
}

interface Director {
  name: string;
  role: string;
  appointed_on?: string;
  other_appointments: Array<{ company_number: string; company_name: string; role: string }>;
}

interface Psc {
  name: string;
  kind: string;
  natures_of_control_plain?: string[];
  ceased_on?: string;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function fmt(n?: number): string {
  if (n == null) return "—";
  if (n >= 1_000_000_000) return `£${(n / 1_000_000_000).toFixed(1)}bn`;
  if (n >= 1_000_000) return `£${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000) return `£${(n / 1_000).toFixed(1)}k`;
  return `£${n}`;
}

function fmtNum(n?: number): string {
  if (n == null) return "—";
  return n.toLocaleString("en-GB");
}

function fmtType(t?: string): string {
  if (!t) return "—";
  return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function fmtYear(d?: string): string {
  if (!d) return "—";
  return d.slice(0, 4);
}

async function fetchReal(endpoint: string): Promise<Response> {
  const apiKey = process.env.REGISTRUM_DEMO_API_KEY;
  if (!apiKey) throw new Error("REGISTRUM_DEMO_API_KEY not set");
  return fetch(`${API_URL}/${endpoint}`, {
    headers: { "X-API-Key": apiKey },
    cache: "no-store",
  });
}

/* ─── Rate limit check ───────────────────────────────────────────────────── */

async function checkRateLimit(identifier: string): Promise<{ allowed: boolean; count: number }> {
  const today = new Date().toISOString().slice(0, 10);
  const supabase = getSupabase();

  const { data, error } = await supabase.rpc("increment_web_lookup", {
    p_identifier: identifier,
    p_date: today,
  });

  if (error) {
    console.error("increment_web_lookup error", error);
    // Fail open — don't block users on DB errors
    return { allowed: true, count: 0 };
  }

  const count = data as number;
  return { allowed: count <= FREE_DAILY_LIMIT, count };
}

async function checkWebSession(token: string): Promise<boolean> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("web_sessions")
    .select("id")
    .eq("token", token)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error) {
    console.error("web_sessions check error", error);
    return false;
  }
  return !!data;
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;

  // Validate company number format
  if (!/^\d{7,8}$/.test(number)) return notFound();

  const cookieStore = await cookies();
  const headerStore = await headers();

  const rid = cookieStore.get("rid")?.value ?? "anon";
  const wsid = cookieStore.get("wsid")?.value ?? null;
  const sessionEmail = (() => {
    const sv = cookieStore.get(SESSION_COOKIE)?.value;
    return sv ? verifySessionCookie(sv) : null;
  })();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "unknown";

  // Check paid session first
  let isUnlimited = false;
  if (wsid) {
    isUnlimited = await checkWebSession(wsid);
  }

  // Rate limit check for anonymous users
  let paywalled = false;
  if (!isUnlimited) {
    const identifier = createHash("sha256")
      .update(`${ip}:${rid}`)
      .digest("hex");
    const { allowed } = await checkRateLimit(identifier);
    paywalled = !allowed;
  }

  // Fetch company profile (always — needed for hero even when paywalled)
  const profileRes = await fetchReal(`company/${number}`);
  if (!profileRes.ok) return notFound();
  const profileJson = await profileRes.json();
  const company: CompanyProfile | null = profileJson.data ?? null;
  if (!company) return notFound();

  // Fetch financials + directors + PSC only when allowed
  let financials: Financials | null = null;
  let financialsError: string | null = null;
  let directors: Director[] = [];
  let pscs: Psc[] = [];

  if (!paywalled) {
    const [finRes, dirRes, pscRes] = await Promise.all([
      fetchReal(`company/${number}/financials`),
      fetchReal(`company/${number}/directors`),
      fetchReal(`company/${number}/psc`),
    ]);
    if (finRes.ok) {
      const finJson = await finRes.json();
      financials = finJson.data ?? null;
    } else {
      try {
        const finJson = await finRes.json();
        financialsError = finJson.detail ?? null;
      } catch {
        financialsError = null;
      }
    }
    if (dirRes.ok) {
      const dirJson = await dirRes.json();
      directors = dirJson.data?.current_directors ?? [];
    }
    if (pscRes.ok) {
      const pscJson = await pscRes.json();
      pscs = (pscJson.data?.active_pscs ?? pscJson.data?.pscs ?? []).filter(
        (p: Psc) => !p.ceased_on
      );
    }
  }

  const address = [
    company.registered_office_address?.address_line_1,
    company.registered_office_address?.locality,
    company.registered_office_address?.postal_code,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-[#060D1B] text-[#E8F0FE] font-[family-name:var(--font-geist-sans)]">
      {/* Mini nav */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#060D1B]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Link href="/search" className="text-sm text-[#7A8FAD] hover:text-white transition-colors">
              ← Search
            </Link>
            <span className="text-white/20">|</span>
            <Link href="/" className="text-sm font-semibold text-white">
              Registrum
            </Link>
          </div>
          {sessionEmail ? (
            <Link
              href="/dashboard"
              className="rounded-md border border-white/10 px-4 py-1.5 text-sm font-medium text-[#E8F0FE] transition-colors hover:border-white/20 hover:bg-white/5"
            >
              Dashboard
            </Link>
          ) : (
            <a
              href="/#get-key"
              className="rounded-md bg-[#4F7BFF] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#6B93FF]"
            >
              Get started free
            </a>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Hero */}
        <div className="mb-6 rounded-xl border border-white/[0.08] bg-[#0A1628] px-6 py-5">
          <div className="flex flex-wrap items-start gap-3">
            <span
              className={`mt-0.5 shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                company.company_status === "active"
                  ? "bg-[#22D3A0]/10 text-[#22D3A0]"
                  : "bg-white/5 text-[#3D5275]"
              }`}
            >
              {company.company_status}
            </span>
            <div>
              <h1 className="text-2xl font-semibold text-white">{company.company_name}</h1>
              <p className="mt-1 text-sm text-[#7A8FAD]">
                {company.company_number} · {fmtType(company.company_type)}
                {company.company_age_years ? ` · ${company.company_age_years} years old` : ""}
              </p>
              {address && (
                <p className="mt-1 text-sm text-[#7A8FAD]">{address}</p>
              )}
              {(company.sic_codes ?? []).length > 0 && (
                <p className="mt-1 text-sm text-[#3D5275]">
                  SIC {company.sic_codes!.join(", ")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 4 stat cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Type", value: fmtType(company.company_type) },
            { label: "Incorporated", value: fmtYear(company.date_of_creation) },
            {
              label: "Accounts",
              value: company.accounts?.overdue ? "Overdue" : "Up to date",
              color: company.accounts?.overdue ? "text-red-400" : "text-[#22D3A0]",
            },
            {
              label: "Conf. Statement",
              value: company.confirmation_statement?.overdue ? "Overdue" : "Up to date",
              color: company.confirmation_statement?.overdue ? "text-red-400" : "text-[#22D3A0]",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3"
            >
              <div className="text-xs text-[#3D5275]">{s.label}</div>
              <div className={`mt-1 text-sm font-medium ${s.color ?? "text-white"}`}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {paywalled ? (
          /* ─── Paywall ─────────────────────────────────────────────────── */
          <>
            {/* Blurred financials stub */}
            <div className="relative mb-6 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A1628]">
              {/* Blurred content behind */}
              <div className="blur-sm select-none pointer-events-none px-6 py-5">
                <div className="mb-4 text-sm font-medium text-[#7A8FAD]">Financials</div>
                <div className="grid grid-cols-3 gap-4">
                  {["Turnover", "Net Assets", "Employees"].map((l) => (
                    <div key={l}>
                      <div className="text-xs text-[#3D5275]">{l}</div>
                      <div className="mt-1 text-lg font-semibold text-white">£‒‒.‒bn</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Lock overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#060D1B]/70 px-6 text-center backdrop-blur-[2px]">
                <svg className="mb-3 h-6 w-6 text-[#3D5275]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <p className="text-sm font-medium text-white">
                  {"You've used your 10 free company lookups today."}
                </p>
                <p className="mt-1 text-sm text-[#7A8FAD]">
                  Create a free account — resets daily, no credit card.
                </p>
                <a
                  href="/#get-key"
                  className="mt-4 inline-block rounded-md bg-[#4F7BFF] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6B93FF]"
                >
                  Create free account →
                </a>
                <div className="mt-3 text-xs text-[#3D5275]">
                  Or unlock unlimited browsing from{" "}
                  <CheckoutButtonClient plan="web" className="text-[#4F7BFF] hover:underline">
                    £19/mo
                  </CheckoutButtonClient>
                </div>
              </div>
            </div>

            {/* Blurred director network stub */}
            <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A1628]">
              <div className="blur-sm select-none pointer-events-none px-6 py-5">
                <div className="mb-4 text-sm font-medium text-[#7A8FAD]">Director Network</div>
                <div className="h-40 rounded-lg bg-white/[0.03]" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-[#060D1B]/70 backdrop-blur-[2px]">
                <svg className="h-6 w-6 text-[#3D5275]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
            </div>
          </>
        ) : (
          /* ─── Full data ───────────────────────────────────────────────── */
          <>
            {/* Financials */}
            <div className="mb-6 rounded-xl border border-white/[0.08] bg-[#0A1628] px-6 py-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm font-medium text-[#7A8FAD]">Financials</div>
                {financials?.period_end && (
                  <div className="text-xs text-[#3D5275]">
                    Period: {financials.period_end}
                  </div>
                )}
              </div>
              {financials ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div>
                    <div className="text-xs text-[#3D5275]">Turnover</div>
                    <div className="mt-1 text-lg font-semibold text-white">
                      {fmt(financials.profit_and_loss?.turnover?.current ?? undefined)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#3D5275]">Net Assets</div>
                    <div className="mt-1 text-lg font-semibold text-white">
                      {fmt(financials.balance_sheet?.net_assets?.current ?? undefined)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#3D5275]">Employees</div>
                    <div className="mt-1 text-lg font-semibold text-white">
                      {fmtNum(financials.other?.employees?.current ?? undefined)}
                    </div>
                  </div>
                  {financials.data_quality?.completeness != null && (
                    <div className="col-span-2 sm:col-span-3">
                      <span className="rounded border border-white/[0.06] px-2 py-0.5 text-xs text-[#3D5275]">
                        Data quality: {Math.round(financials.data_quality.completeness * 100)}%
                        {financials.data_quality.accounts_type ? ` · ${financials.data_quality.accounts_type} accounts` : ""}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[#3D5275]">
                  {financialsError
                    ? financialsError.includes("image-based PDF")
                      ? "Accounts filed as image-based PDF — structured data not available."
                      : financialsError.includes("No parseable")
                        ? "No digital accounts filing found for this company."
                        : "Financial data not available."
                    : "No financial data available for this company."}
                </p>
              )}
            </div>

            {/* Director network */}
            <div className="mb-6 rounded-xl border border-white/[0.08] bg-[#0A1628] px-6 py-5">
              <div className="mb-4 text-sm font-medium text-[#7A8FAD]">Director Network</div>
              <DirectorGraph focalName={company.company_name} directors={directors} />

              {directors.length > 0 && (
                <div className="mt-6 border-t border-white/[0.06] pt-4">
                  <div className="text-xs text-[#3D5275] mb-3">Current directors</div>
                  <div className="flex flex-col gap-2">
                    {directors.map((d) => (
                      <div
                        key={d.name}
                        className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5"
                      >
                        <span className="text-sm font-medium text-white">{d.name}</span>
                        <span className="text-xs text-[#7A8FAD]">{d.role}</span>
                        {d.appointed_on && (
                          <span className="text-xs text-[#3D5275]">
                            since {d.appointed_on}
                          </span>
                        )}
                        {d.other_appointments.length > 0 && (
                          <span className="text-xs text-[#3D5275]">
                            · {d.other_appointments.length} other co.
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* PSC / Beneficial Ownership */}
            {pscs.length > 0 && (
              <div className="mb-6 rounded-xl border border-white/[0.08] bg-[#0A1628] px-6 py-5">
                <div className="mb-4 text-sm font-medium text-[#7A8FAD]">Persons with Significant Control</div>
                <div className="flex flex-col gap-3">
                  {pscs.map((p) => (
                    <div key={p.name} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-white">{p.name}</p>
                        <span className="shrink-0 rounded-full border border-white/[0.06] px-2 py-0.5 text-xs text-[#3D5275]">
                          {p.kind}
                        </span>
                      </div>
                      {(p.natures_of_control_plain ?? []).map((n) => (
                        <p key={n} className="mt-1 text-xs text-[#7A8FAD]">{n}</p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer CTA */}
        <div className="mt-8 rounded-xl border border-white/[0.06] bg-white/[0.02] px-6 py-5 text-center">
          <p className="text-sm text-[#7A8FAD]">
            Access this data programmatically via the Registrum API.
          </p>
          {sessionEmail ? (
            <Link
              href="/dashboard"
              className="mt-3 inline-block text-sm font-medium text-[#4F7BFF] hover:underline"
            >
              View your dashboard →
            </Link>
          ) : (
            <a
              href="/#get-key"
              className="mt-3 inline-block text-sm font-medium text-[#4F7BFF] hover:underline"
            >
              Create a free account →
            </a>
          )}
        </div>
      </main>
    </div>
  );
}

/* ─── Client component wrapper for CheckoutButton ───────────────────────── */

import CheckoutButton from "@/components/CheckoutButton";

function CheckoutButtonClient({
  plan,
  className,
  children,
}: {
  plan: "web" | "pro";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <CheckoutButton plan={plan} className={className}>
      {children}
    </CheckoutButton>
  );
}
