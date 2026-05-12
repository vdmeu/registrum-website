import type { Metadata } from "next";
import Link from "next/link";
import PageFeedback from "@/app/components/PageFeedback";
import SiteNav from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "Registrum vs Companies House API — What Registrum adds",
  description:
    "See exactly what Registrum adds on top of the raw Companies House API: structured financial data, computed fields, director network traversal, caching, and stale fallback.",
};

/* ─── Comparison data ─────────────────────────────────────────────────────── */

const COMPARISON_ROWS = [
  {
    category: "Company name / number / status",
    ch: { has: true, label: "Raw" },
    reg: { has: true, label: "Same" },
    note: "",
  },
  {
    category: "Company age",
    ch: { has: false, label: "Must calculate from date_of_creation" },
    reg: { has: true, label: "company_age_years pre-computed" },
    note: "enriched",
  },
  {
    category: "Accounts overdue",
    ch: { has: false, label: "Must compare two date fields" },
    reg: { has: true, label: "accounts.overdue boolean" },
    note: "enriched",
  },
  {
    category: "Confirmation overdue",
    ch: { has: false, label: "Must compare two date fields" },
    reg: { has: true, label: "confirmation_statement.overdue boolean" },
    note: "enriched",
  },
  {
    category: "SIC code descriptions",
    ch: { has: false, label: "Codes only (e.g. 47110)" },
    reg: { has: true, label: "Human-readable descriptions included" },
    note: "enriched",
  },
  {
    category: "Revenue / turnover",
    ch: { has: false, label: "Link to iXBRL filing document only" },
    reg: { has: true, label: "Parsed JSON integer (actual GBP)" },
    note: "new",
  },
  {
    category: "Profit & loss statement",
    ch: { has: false, label: "Not available via API" },
    reg: { has: true, label: "Full P&L: gross profit, operating profit, PAT" },
    note: "new",
  },
  {
    category: "Balance sheet",
    ch: { has: false, label: "Not available via API" },
    reg: { has: true, label: "Assets, liabilities, equity, net assets" },
    note: "new",
  },
  {
    category: "Employee count",
    ch: { has: false, label: "Not available via API" },
    reg: { has: true, label: "average_employees from filings" },
    note: "new",
  },
  {
    category: "Prior year financials",
    ch: { has: false, label: "Not available via API" },
    reg: { has: true, label: "prior field on every financial value" },
    note: "new",
  },
  {
    category: "Director list",
    ch: { has: true, label: "Paginated (multiple calls required)" },
    reg: { has: true, label: "Deduplicated, single endpoint" },
    note: "improved",
  },
  {
    category: "Director appointments",
    ch: { has: false, label: "One API call per director" },
    reg: { has: true, label: "Included in directors response" },
    note: "new",
  },
  {
    category: "Director network (related companies)",
    ch: { has: false, label: "Many paginated calls, manual dedup required" },
    reg: { has: true, label: "One network endpoint, auto-traversal" },
    note: "new",
  },
  {
    category: "CH API key registration",
    ch: { has: false, label: "Register at CH developer portal, manage your own key" },
    reg: { has: true, label: "No CH key needed — one Registrum key covers everything" },
    note: "infra",
  },
  {
    category: "Rate limit protection",
    ch: { has: false, label: "600 req/5min, errors propagate to your app" },
    reg: { has: true, label: "Cached responses, shared budget shielded" },
    note: "infra",
  },
  {
    category: "Resilience on CH outage",
    ch: { has: false, label: "5xx errors propagate to your app" },
    reg: { has: true, label: "Stale cache served with X-Data-Stale header" },
    note: "infra",
  },
  {
    category: "Request tracing",
    ch: { has: false, label: "No correlation IDs" },
    reg: { has: true, label: "X-Request-Id on every response" },
    note: "infra",
  },
  {
    category: "Data quality signals",
    ch: { has: false, label: "None" },
    reg: { has: true, label: "data_quality block with completeness ratio" },
    note: "new",
  },
];

const noteConfig: Record<string, { label: string; color: string; bg: string }> = {
  enriched: { label: "enriched", color: "#4F7BFF", bg: "rgba(79,123,255,0.10)" },
  new: { label: "new field", color: "#22D3A0", bg: "rgba(34,211,160,0.08)" },
  improved: { label: "improved", color: "#F97316", bg: "rgba(249,115,22,0.08)" },
  infra: { label: "infrastructure", color: "#7A8FAD", bg: "rgba(255,255,255,0.06)" },
};

/* ─── Code comparison ─────────────────────────────────────────────────────── */

const CH_NETWORK_CODE = `# Python — director network with raw CH API
# Requires multiple paginated calls

import requests, base64

def get_network(company_number, ch_api_key):
    auth = base64.b64encode(f"{ch_api_key}:".encode()).decode()
    headers = {"Authorization": f"Basic {auth}"}
    base = "https://api.company-information.service.gov.uk"

    # Step 1: get officers
    officers = requests.get(
        f"{base}/company/{company_number}/officers",
        headers=headers
    ).json().get("items", [])

    network = {}
    seen_officers = set()

    for officer in officers:
        link = officer.get("links", {}).get("officer", {})
        appts_path = link.get("appointments", "")
        officer_id = appts_path.strip("/").split("/")[1]

        if officer_id in seen_officers:
            continue
        seen_officers.add(officer_id)

        # Step 2: one call per officer
        appts = requests.get(
            f"{base}/officers/{officer_id}/appointments",
            headers=headers
        ).json().get("items", [])

        for a in appts:
            cn = a.get("appointed_to", {}).get("company_number")
            if cn and cn != company_number:
                network.setdefault(cn, []).append(officer["name"])

    # Result: 1 + N calls (N = number of officers)
    # Tesco has ~15 officers = ~16 CH API calls
    # No caching. Rate limit consumed every time.
    return network`;

const REG_NETWORK_CODE = `# Python — director network with Registrum
# One call. Cached 24h. Rate-limit safe.

import requests

def get_network(company_number, api_key):
    r = requests.get(
        f"https://api.registrum.co.uk/v1/company/{company_number}/network",
        params={"depth": 1},
        headers={"X-API-Key": api_key},
    )
    data = r.json()["data"]
    return data["companies"]
    # Returns: list of connected companies
    # sorted by connection strength (shared directors)`;

/* ─── JSON diff panel ─────────────────────────────────────────────────────── */

function JsonDiffPanel() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* CH API raw */}
      <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A1628]">
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#3D5275]" />
          </div>
          <span className="ml-2 text-xs text-[#3D5275]">Companies House API — raw</span>
        </div>
        <div className="px-5 py-4 font-[family-name:var(--font-geist-mono)] text-sm leading-relaxed">
          <p className="text-[#3D5275]">{"{"}</p>
          {[
            { key: '"company_name"', val: '"TESCO PLC"', dim: false },
            { key: '"company_number"', val: '"00445790"', dim: false },
            { key: '"company_status"', val: '"active"', dim: false },
            { key: '"type"', val: '"plc"', dim: false },
            { key: '"date_of_creation"', val: '"1947-11-27"', dim: false },
            { key: '"registered_office_address"', val: "{ ... }", dim: false },
            { key: '"sic_codes"', val: '["47110"]', dim: false },
            { key: '"accounts"', val: '{ "next_accounts": { "due_on": "2024-07-24" }, "last_accounts": { "made_up_to": "2024-02-24" } }', dim: false },
            { key: '"confirmation_statement"', val: '{ "next_due": "2025-06-15" }', dim: false },
            { key: '"links"', val: '{ "filing_history": "...", "officers": "..." }', dim: true },
          ].map((f) => (
            <p key={f.key} className={`pl-4 ${f.dim ? "opacity-40" : ""}`}>
              <span className="text-[#7A8FAD]">{f.key}</span>
              <span className="text-[#3D5275]">: </span>
              <span className="text-[#7A8FAD]">{f.val}</span>
              <span className="text-[#3D5275]">,</span>
            </p>
          ))}
          <p className="text-[#3D5275]">{"}"}</p>
          <div className="mt-4 border-t border-white/[0.06] pt-3">
            <p className="text-xs text-[#3D5275]">≈ 10 fields · No financial data · Dates require calculation · No quality signals</p>
          </div>
        </div>
      </div>

      {/* Registrum enriched */}
      <div className="overflow-hidden rounded-xl border border-[#22D3A0]/20 bg-[#0A1628]">
        <div className="flex items-center gap-2 border-b border-[#22D3A0]/10 px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
          </div>
          <span className="ml-2 text-xs text-[#22D3A0]">Registrum API — enriched</span>
          <span className="ml-auto rounded-full bg-[#22D3A0]/10 px-2 py-0.5 text-xs text-[#22D3A0]">
            +18 fields
          </span>
        </div>
        <div className="px-5 py-4 font-[family-name:var(--font-geist-mono)] text-sm leading-relaxed">
          <p className="text-[#7A8FAD]">{"{"}</p>
          {[
            { key: '"company_name"', val: '"TESCO PLC"', color: "#E8F0FE", badge: null },
            { key: '"company_number"', val: '"00445790"', color: "#E8F0FE", badge: null },
            { key: '"company_status"', val: '"active"', color: "#E8F0FE", badge: null },
            { key: '"company_age_years"', val: "78", color: "#4F7BFF", badge: "enriched" },
            { key: '"accounts"', val: '{ "overdue": false, "next_due": "2024-07-24" }', color: "#4F7BFF", badge: "enriched" },
            { key: '"sic_codes"', val: '["47110"]', color: "#E8F0FE", badge: null },
            { key: '"sic_descriptions"', val: '["Retail sale in non-specialised stores"]', color: "#4F7BFF", badge: "enriched" },
            { key: '"financials"', val: '{ "turnover": { "current": 68190000000 }, "profit_after_tax": { "current": 1400000000 }, ... }', color: "#22D3A0", badge: "new" },
            { key: '"cached"', val: "true", color: "#7A8FAD", badge: "meta" },
            { key: '"credits_remaining"', val: "49", color: "#7A8FAD", badge: "meta" },
          ].map((f) => {
            const nb = f.badge ? noteConfig[f.badge] : null;
            return (
              <p key={f.key} className="flex items-start gap-2 pl-4">
                <span className="shrink-0">
                  <span style={{ color: f.color }}>{f.key}</span>
                  <span className="text-[#7A8FAD]">: </span>
                  <span style={{ color: f.color, opacity: 0.9 }}>{f.val}</span>
                  <span className="text-[#7A8FAD]">,</span>
                </span>
                {nb && (
                  <span
                    className="mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-xs"
                    style={{ color: nb.color, background: nb.bg }}
                  >
                    {nb.label}
                  </span>
                )}
              </p>
            );
          })}
          <p className="text-[#7A8FAD]">{"}"}</p>
          <div className="mt-4 border-t border-[#22D3A0]/10 pt-3">
            <div className="flex flex-wrap gap-2 text-xs">
              {Object.entries(noteConfig).map(([key, val]) => (
                <span key={key} className="flex items-center gap-1" style={{ color: val.color }}>
                  <span className="inline-block h-2 w-2 rounded-sm" style={{ background: val.color }} />
                  {val.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Comparison table ────────────────────────────────────────────────────── */

function ComparisonTable() {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-white/[0.08] bg-white/[0.03]">
            <th className="px-5 py-3.5 text-left text-xs font-medium text-[#7A8FAD]">Data category</th>
            <th className="px-5 py-3.5 text-left text-xs font-medium text-[#7A8FAD]">Companies House (direct)</th>
            <th className="px-5 py-3.5 text-left text-xs font-medium text-[#22D3A0]">Registrum</th>
          </tr>
        </thead>
        <tbody>
          {COMPARISON_ROWS.map((row, i) => {
            const nb = row.note ? noteConfig[row.note] : null;
            return (
              <tr
                key={row.category}
                className={`border-b border-white/[0.04] ${i % 2 === 0 ? "bg-transparent" : "bg-white/[0.015]"}`}
              >
                <td className="px-5 py-3 text-xs text-[#7A8FAD]">{row.category}</td>
                <td className="px-5 py-3 text-xs">
                  {row.ch.has ? (
                    <span className="text-[#7A8FAD]">✓ {row.ch.label}</span>
                  ) : (
                    <span className="text-[#3D5275]">✗ {row.ch.label}</span>
                  )}
                </td>
                <td className="px-5 py-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[#22D3A0]">✓ {row.reg.label}</span>
                    {nb && (
                      <span
                        className="shrink-0 rounded px-1.5 py-0.5 text-xs"
                        style={{ color: nb.color, background: nb.bg }}
                      >
                        {nb.label}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Code comparison ─────────────────────────────────────────────────────── */

function CodeComparison() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A1628]">
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
          <div className="h-2 w-2 rounded-full bg-[#3D5275]" />
          <span className="text-xs text-[#3D5275]">Director network — raw CH API · ~16 API calls</span>
        </div>
        <pre className="overflow-x-auto px-5 py-4 font-[family-name:var(--font-geist-mono)] text-xs leading-relaxed text-[#7A8FAD]">
          {CH_NETWORK_CODE}
        </pre>
      </div>
      <div className="overflow-hidden rounded-xl border border-[#22D3A0]/20 bg-[#0A1628]">
        <div className="flex items-center gap-2 border-b border-[#22D3A0]/10 px-4 py-2.5">
          <div className="h-2 w-2 rounded-full bg-[#22D3A0]" />
          <span className="text-xs text-[#22D3A0]">Director network — Registrum · 1 API call</span>
        </div>
        <pre className="overflow-x-auto px-5 py-4 font-[family-name:var(--font-geist-mono)] text-xs leading-relaxed text-[#E8F0FE]">
          {REG_NETWORK_CODE}
        </pre>
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function VsCompaniesHousePage() {
  const newFieldCount = COMPARISON_ROWS.filter((r) => !r.ch.has).length;

  return (
    <div className="min-h-screen bg-[#060D1B] text-[#E8F0FE] font-[family-name:var(--font-geist-sans)]">
      <SiteNav maxWidth="6xl" />

      <main className="mx-auto max-w-6xl px-6 pb-32 pt-16">
        {/* Header */}
        <div className="mb-12">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#22D3A0]/20 bg-[#22D3A0]/5 px-3 py-1 text-xs font-medium text-[#22D3A0]">
            Registrum vs Companies House API
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            What Registrum adds on top of Companies House
          </h1>
          <p className="mt-3 max-w-2xl text-[#7A8FAD]">
            The Companies House API is free and official — but it returns raw metadata with no
            financial data, no computed fields, and no resilience. Registrum adds{" "}
            <strong className="text-white">{newFieldCount} data categories</strong> and the
            infrastructure to use it reliably in production.
          </p>
        </div>

        <div className="space-y-10">
          {/* JSON diff */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">The response, side by side</h2>
            <p className="mb-5 text-sm text-[#7A8FAD]">
              Same company (Tesco PLC, <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">00445790</code>), same instant.
              Highlighted fields are computed, derived, or entirely new.
            </p>
            <JsonDiffPanel />
          </section>

          {/* Comparison table */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">Field-by-field comparison</h2>
            <ComparisonTable />
          </section>

          {/* Code comparison */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">The real cost of doing it yourself</h2>
            <p className="mb-5 text-sm text-[#7A8FAD]">
              The director network endpoint collapses ~16 paginated CH API calls into one. Each of
              those raw calls counts toward your 600 req/5min limit — and produces no caching. With
              Registrum the result is cached for 24h and shared across all your requests.
            </p>
            <CodeComparison />
          </section>

          {/* CTA */}
          <section className="rounded-xl border border-[#4F7BFF]/20 bg-[#4F7BFF]/5 p-8 text-center">
            <h2 className="text-xl font-semibold text-white">Try it free</h2>
            <p className="mt-2 text-[#7A8FAD]">
              50 free calls per month. All endpoints. No credit card.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/#get-key"
                className="rounded-md bg-[#4F7BFF] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#6B93FF]"
              >
                Get free API key →
              </Link>
              <Link
                href="/quickstart"
                className="rounded-md border border-white/10 px-5 py-2.5 text-sm font-medium text-[#E8F0FE] transition-colors hover:border-white/20 hover:bg-white/5"
              >
                View quickstart
              </Link>
              <Link
                href="/financials-example"
                className="rounded-md border border-white/10 px-5 py-2.5 text-sm font-medium text-[#E8F0FE] transition-colors hover:border-white/20 hover:bg-white/5"
              >
                See financial data example
              </Link>
            </div>
          </section>
        </div>
      <PageFeedback pageUrl="/vs-companies-house" />
      </main>
    </div>
  );
}
