import type { Metadata } from "next";
import Link from "next/link";
import { exampleFinancials, fmtGbp, fmtEmployees } from "@/lib/exampleFinancials";

export const metadata: Metadata = {
  title: "Financial Data Example — Registrum API",
  description:
    "See what structured financial data looks like for a real UK company. Codeweavers Limited (04092394) — net profit, balance sheet, employees, parsed from iXBRL filings into clean JSON.",
};

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function pct(value: number, total: number): number {
  return Math.round((Math.abs(value) / Math.abs(total)) * 100);
}

function yoyChange(current: number, prior: number): string {
  if (!prior) return "—";
  const change = ((current - prior) / Math.abs(prior)) * 100;
  return `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
}

/* ─── Balance sheet growth chart (replaces P&L waterfall) ────────────────── */

function BalanceSheetGrowth() {
  const bs = exampleFinancials.balance_sheet;
  const pl = exampleFinancials.profit_and_loss;
  const other = exampleFinancials.other;

  const rows: {
    label: string;
    current: number;
    prior: number;
    xbrl: string;
    type: "asset" | "liability" | "profit" | "people";
  }[] = [
    {
      label: "Net assets",
      current: bs.net_assets?.current ?? 0,
      prior: bs.net_assets?.prior ?? 0,
      xbrl: "uk-core:NetAssetsLiabilities",
      type: "asset",
    },
    {
      label: "Fixed assets",
      current: bs.fixed_assets?.current ?? 0,
      prior: bs.fixed_assets?.prior ?? 0,
      xbrl: "uk-core:FixedAssets",
      type: "asset",
    },
    {
      label: "Intangible assets",
      current: bs.intangible_assets?.current ?? 0,
      prior: bs.intangible_assets?.prior ?? 0,
      xbrl: "uk-core:IntangibleAssets",
      type: "asset",
    },
    {
      label: "Current assets",
      current: bs.current_assets?.current ?? 0,
      prior: bs.current_assets?.prior ?? 0,
      xbrl: "uk-core:CurrentAssets",
      type: "asset",
    },
    {
      label: "Net profit",
      current: pl.profit_after_tax?.current ?? 0,
      prior: pl.profit_after_tax?.prior ?? 0,
      xbrl: "uk-core:ProfitLoss",
      type: "profit",
    },
    {
      label: "Employees",
      current: other.employees?.current ?? 0,
      prior: other.employees?.prior ?? 0,
      xbrl: "uk-core:AverageNumberEmployeesDuringPeriod",
      type: "people",
    },
  ];

  const maxVal = Math.max(...rows.flatMap((r) => [r.current, r.prior]));

  const colours = {
    asset: "#4F7BFF",
    liability: "#F97316",
    profit: "#22D3A0",
    people: "#A78BFA",
  };

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A1628] p-6">
      <h3 className="mb-1 text-sm font-semibold text-white">Key metrics — FY2024 vs FY2023</h3>
      <p className="mb-6 text-xs text-[#3D5275]">
        Both years returned in a single API call. Hover for the XBRL taxonomy field name.
      </p>
      <div className="space-y-4">
        {rows.map((row) => {
          const change = yoyChange(row.current, row.prior);
          const positive = !change.startsWith("-");
          const colour = colours[row.type];
          const isEmployees = row.type === "people";
          return (
            <div key={row.label} className="group">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-[#7A8FAD]">{row.label}</span>
                <span
                  className="rounded-full px-1.5 py-0.5 text-xs"
                  style={{
                    color: positive ? "#22D3A0" : "#F97316",
                    background: positive ? "rgba(34,211,160,0.08)" : "rgba(249,115,22,0.08)",
                  }}
                >
                  {change}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-10 text-right font-[family-name:var(--font-geist-mono)] text-xs text-[#3D5275]">FY24</span>
                  <div className="relative flex-1 rounded-full bg-white/[0.04]">
                    <div
                      className="h-4 rounded-full transition-all"
                      style={{ width: `${pct(row.current, maxVal)}%`, background: colour }}
                    />
                    <span className="absolute left-0 -bottom-5 hidden whitespace-nowrap font-[family-name:var(--font-geist-mono)] text-xs text-[#3D5275] group-hover:block">
                      {row.xbrl}
                    </span>
                  </div>
                  <span className="w-20 text-right font-[family-name:var(--font-geist-mono)] text-xs text-[#E8F0FE]">
                    {isEmployees ? fmtEmployees(row.current) : fmtGbp(row.current)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-10 text-right font-[family-name:var(--font-geist-mono)] text-xs text-[#3D5275]">FY23</span>
                  <div className="flex-1 rounded-full bg-white/[0.04]">
                    <div
                      className="h-4 rounded-full bg-white/[0.15]"
                      style={{ width: `${pct(row.prior, maxVal)}%` }}
                    />
                  </div>
                  <span className="w-20 text-right font-[family-name:var(--font-geist-mono)] text-xs text-[#3D5275]">
                    {isEmployees ? fmtEmployees(row.prior) : fmtGbp(row.prior)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <LegendItem color="#4F7BFF" label="Balance sheet" />
        <LegendItem color="#22D3A0" label="Profit" />
        <LegendItem color="#A78BFA" label="Headcount" />
      </div>
    </div>
  );
}

/* ─── Balance sheet split ─────────────────────────────────────────────────── */

function BalanceSheetSplit() {
  const bs = exampleFinancials.balance_sheet;

  const totalAssets = (bs.fixed_assets?.current ?? 0) + (bs.current_assets?.current ?? 0);
  const totalLiabilities =
    (bs.creditors_within_one_year?.current ?? 0) + (bs.creditors_after_one_year?.current ?? 0);
  const netAssets = bs.net_assets?.current ?? 0;
  const totalRight = totalLiabilities + netAssets;

  const assetRows = [
    { label: "Fixed assets", value: bs.fixed_assets?.current ?? 0, color: "#4F7BFF" },
    { label: "Current assets", value: bs.current_assets?.current ?? 0, color: "#7B9FFF" },
  ];

  const rightRows = [
    { label: "Current liabilities", value: bs.creditors_within_one_year?.current ?? 0, color: "#F97316" },
    { label: "Net assets", value: netAssets, color: "#22D3A0" },
  ];

  function StackedBar({ rows, total }: { rows: { label: string; value: number; color: string }[]; total: number }) {
    return (
      <div className="flex flex-col gap-1">
        {rows.map((row) => {
          const h = Math.max(24, Math.round((row.value / total) * 200));
          return (
            <div key={row.label} className="group relative flex items-end gap-2">
              <div
                className="w-full rounded-sm"
                style={{ height: h, background: row.color, opacity: 0.85 }}
              />
              <div className="absolute inset-0 hidden items-center justify-center group-hover:flex">
                <span className="rounded bg-[#0A1628]/90 px-2 py-1 text-xs text-white shadow">
                  {row.label}: {fmtGbp(row.value)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A1628] p-6">
      <h3 className="mb-1 text-sm font-semibold text-white">Balance Sheet</h3>
      <p className="mb-6 text-xs text-[#3D5275]">
        Bar height is proportional. Hover for values.
      </p>
      <div className="grid grid-cols-2 gap-8">
        {/* Assets */}
        <div>
          <div className="mb-3 text-xs font-medium text-[#7A8FAD]">Assets</div>
          <StackedBar rows={assetRows} total={totalAssets} />
          <div className="mt-3 space-y-1">
            {assetRows.map((r) => (
              <div key={r.label} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-[#7A8FAD]">
                  <span className="inline-block h-2 w-2 rounded-sm" style={{ background: r.color }} />
                  {r.label}
                </span>
                <span className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">
                  {fmtGbp(r.value)}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-white/[0.06] pt-1 text-xs font-semibold">
              <span className="text-white">Total assets</span>
              <span className="font-[family-name:var(--font-geist-mono)] text-white">{fmtGbp(totalAssets)}</span>
            </div>
          </div>
        </div>

        {/* Liabilities + Net assets */}
        <div>
          <div className="mb-3 text-xs font-medium text-[#7A8FAD]">Liabilities &amp; Net assets</div>
          <StackedBar rows={rightRows} total={totalRight} />
          <div className="mt-3 space-y-1">
            {rightRows.map((r) => (
              <div key={r.label} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-[#7A8FAD]">
                  <span className="inline-block h-2 w-2 rounded-sm" style={{ background: r.color }} />
                  {r.label}
                </span>
                <span className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">
                  {fmtGbp(r.value)}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-white/[0.06] pt-1 text-xs font-semibold">
              <span className="text-white">Total</span>
              <span className="font-[family-name:var(--font-geist-mono)] text-white">{fmtGbp(totalRight)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Data quality grid ───────────────────────────────────────────────────── */

type FieldStatus = "extracted" | "missing" | "not_applicable";

interface GridField {
  label: string;
  key: string;
  section: string;
  value: string;
  status: FieldStatus;
}

function DataQualityGrid() {
  const dq = exampleFinancials.data_quality;
  const pl = exampleFinancials.profit_and_loss;
  const bs = exampleFinancials.balance_sheet;
  const other = exampleFinancials.other;

  const fields: GridField[] = [
    // P&L
    { label: "Revenue", key: "turnover", section: "P&L", value: fmtGbp(pl.turnover?.current ?? null), status: pl.turnover ? "extracted" : "missing" },
    { label: "Gross profit", key: "gross_profit", section: "P&L", value: fmtGbp(pl.gross_profit?.current ?? null), status: pl.gross_profit ? "extracted" : "missing" },
    { label: "Operating profit", key: "operating_profit", section: "P&L", value: fmtGbp(pl.operating_profit?.current ?? null), status: pl.operating_profit ? "extracted" : "missing" },
    { label: "Profit before tax", key: "profit_before_tax", section: "P&L", value: fmtGbp(pl.profit_before_tax?.current ?? null), status: pl.profit_before_tax ? "extracted" : "missing" },
    { label: "Tax", key: "tax", section: "P&L", value: fmtGbp(pl.tax?.current ?? null), status: pl.tax ? "extracted" : "missing" },
    { label: "Net profit", key: "profit_after_tax", section: "P&L", value: fmtGbp(pl.profit_after_tax?.current ?? null), status: pl.profit_after_tax ? "extracted" : "missing" },
    { label: "Depreciation", key: "depreciation", section: "P&L", value: fmtGbp(pl.depreciation?.current ?? null), status: pl.depreciation ? "extracted" : "missing" },
    // Balance sheet
    { label: "Fixed assets", key: "fixed_assets", section: "Balance sheet", value: fmtGbp(bs.fixed_assets?.current ?? null), status: bs.fixed_assets ? "extracted" : "missing" },
    { label: "Intangible assets", key: "intangible_assets", section: "Balance sheet", value: fmtGbp(bs.intangible_assets?.current ?? null), status: bs.intangible_assets ? "extracted" : "missing" },
    { label: "Current assets", key: "current_assets", section: "Balance sheet", value: fmtGbp(bs.current_assets?.current ?? null), status: bs.current_assets ? "extracted" : "missing" },
    { label: "Stocks", key: "stocks", section: "Balance sheet", value: "—", status: dq.missing_fields.includes("stocks") ? "missing" : "extracted" },
    { label: "Debtors", key: "debtors", section: "Balance sheet", value: fmtGbp(bs.debtors?.current ?? null), status: bs.debtors ? "extracted" : "missing" },
    { label: "Cash", key: "cash", section: "Balance sheet", value: fmtGbp(bs.cash?.current ?? null), status: bs.cash ? "extracted" : "missing" },
    { label: "Creditors ≤1yr", key: "creditors_within_one_year", section: "Balance sheet", value: fmtGbp(bs.creditors_within_one_year?.current ?? null), status: bs.creditors_within_one_year ? "extracted" : "missing" },
    { label: "Creditors >1yr", key: "creditors_after_one_year", section: "Balance sheet", value: fmtGbp(bs.creditors_after_one_year?.current ?? null), status: bs.creditors_after_one_year ? "extracted" : "missing" },
    { label: "Net assets", key: "net_assets", section: "Balance sheet", value: fmtGbp(bs.net_assets?.current ?? null), status: bs.net_assets ? "extracted" : "missing" },
    { label: "Equity", key: "equity", section: "Balance sheet", value: fmtGbp(bs.equity?.current ?? null), status: bs.equity ? "extracted" : "missing" },
    { label: "Share capital", key: "share_capital", section: "Balance sheet", value: fmtGbp(bs.share_capital?.current ?? null), status: bs.share_capital ? "extracted" : "missing" },
    { label: "Retained earnings", key: "retained_earnings", section: "Balance sheet", value: fmtGbp(bs.retained_earnings?.current ?? null), status: bs.retained_earnings ? "extracted" : "missing" },
    // Other
    { label: "Employees", key: "employees", section: "Other", value: fmtEmployees(other.employees?.current ?? null), status: other.employees ? "extracted" : "missing" },
  ];

  const statusConfig = {
    extracted: { dot: "#22D3A0", text: "#22D3A0", icon: "✓" },
    missing: { dot: "#3D5275", text: "#3D5275", icon: "⊘" },
    not_applicable: { dot: "#3D5275", text: "#3D5275", icon: "—" },
  };

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A1628] p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Data completeness</h3>
          <p className="mt-1 text-xs text-[#3D5275]">
            {dq.fields_extracted}/{dq.fields_attempted} fields extracted from the iXBRL filing.
            Revenue is not disclosed — permitted under FRS-102 for private companies.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[#22D3A0]/30 bg-[#22D3A0]/10 px-3 py-1">
          <span className="text-lg font-bold text-[#22D3A0]">{Math.round(dq.completeness * 100)}%</span>
          <span className="text-xs text-[#22D3A0]">complete</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {fields.map((f) => {
          const cfg = statusConfig[f.status];
          return (
            <div
              key={f.key}
              className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2.5"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="truncate text-xs text-[#7A8FAD]">{f.label}</span>
                <span className="shrink-0 text-xs" style={{ color: cfg.text }}>{cfg.icon}</span>
              </div>
              <div
                className="mt-1 font-[family-name:var(--font-geist-mono)] text-sm font-semibold"
                style={{ color: f.status === "extracted" ? "#E8F0FE" : "#3D5275" }}
              >
                {f.value}
              </div>
              <div className="mt-1 text-xs text-[#3D5275]">{f.section}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <LegendItem color="#22D3A0" label="Extracted ✓" />
        <LegendItem color="#3D5275" label="Not in this filing ⊘" />
      </div>
    </div>
  );
}

/* ─── Shared legend item ──────────────────────────────────────────────────── */

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[#7A8FAD]">
      <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function FinancialsExamplePage() {
  const dq = exampleFinancials.data_quality;

  return (
    <div className="min-h-screen bg-[#060D1B] text-[#E8F0FE] font-[family-name:var(--font-geist-sans)]">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#060D1B]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight text-white">
            Registrum
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/quickstart" className="text-sm text-[#7A8FAD] transition-colors hover:text-white">
              Quickstart
            </Link>
            <a href="https://api.registrum.co.uk/docs" target="_blank" rel="noopener noreferrer" className="text-sm text-[#7A8FAD] transition-colors hover:text-white">
              Docs
            </a>
            <Link href="/#get-key" className="rounded-md bg-[#4F7BFF] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6B93FF]">
              Get API Key
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-32 pt-16">
        {/* Header */}
        <div className="mb-10">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#4F7BFF]/20 bg-[#4F7BFF]/10 px-3 py-1 text-xs font-medium text-[#4F7BFF]">
              Real data — live from Companies House
            </span>
            <span className="text-xs text-[#3D5275]">
              Codeweavers Limited · Company 04092394 · Year ended 31 Dec 2024 · Accounts type: <strong className="text-[#7A8FAD]">full iXBRL</strong>
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Financial data, structured from iXBRL
          </h1>
          <p className="mt-3 max-w-2xl text-[#7A8FAD]">
            One API call to{" "}
            <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">
              GET /v1/company/04092394/financials
            </code>{" "}
            returns {dq.fields_extracted} structured fields parsed from the iXBRL filing — net profit,
            full balance sheet, employee headcount — all in actual GBP integers, with prior-year comparatives.
          </p>

          {/* Key metrics strip */}
          <div className="mt-8 grid grid-cols-2 gap-px border border-white/[0.06] bg-white/[0.06] sm:grid-cols-4">
            {[
              { label: "Net profit", value: "£4.6M", sub: "FY2024 (+94% YoY)" },
              { label: "Net assets", value: "£9.2M", sub: "balance sheet (+99% YoY)" },
              { label: "Fixed assets", value: "£3.9M", sub: "incl. £2.7M intangible" },
              { label: "Employees", value: "142", sub: "up from 128 in FY2023" },
            ].map((m) => (
              <div key={m.label} className="bg-[#060D1B] px-5 py-4">
                <div className="text-xs text-[#3D5275]">{m.label}</div>
                <div className="mt-0.5 text-2xl font-bold text-white">{m.value}</div>
                <div className="text-xs text-[#3D5275]">{m.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts grid */}
        <div className="space-y-6">
          <BalanceSheetGrowth />

          <div className="grid gap-6 lg:grid-cols-2">
            <BalanceSheetSplit />
            <DataQualityGrid />
          </div>
        </div>

        {/* Raw JSON section */}
        <div className="mt-8 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A1628]">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
            <span className="text-xs font-medium text-[#7A8FAD]">
              Raw API response — exactly what you&apos;d receive in your code
            </span>
            <span className="font-[family-name:var(--font-geist-mono)] text-xs text-[#3D5275]">
              GET /v1/company/04092394/financials
            </span>
          </div>
          <pre className="overflow-x-auto px-5 py-4 font-[family-name:var(--font-geist-mono)] text-xs leading-relaxed text-[#E8F0FE]">
            {JSON.stringify(
              {
                status: "success",
                cached: true,
                cache_age_seconds: 18432,
                credits_used: 1,
                credits_remaining: 49,
                data: {
                  company_name: exampleFinancials.company_name,
                  company_number: exampleFinancials.company_number,
                  accounts_type: exampleFinancials.accounts_type,
                  period_end: exampleFinancials.period_end,
                  period_start: exampleFinancials.period_start,
                  currency: "GBP",
                  data_quality: exampleFinancials.data_quality,
                  profit_and_loss: exampleFinancials.profit_and_loss,
                  balance_sheet: exampleFinancials.balance_sheet,
                  other: exampleFinancials.other,
                },
              },
              null,
              2
            )}
          </pre>
        </div>

        {/* CTA */}
        <div className="mt-10 rounded-xl border border-[#4F7BFF]/20 bg-[#4F7BFF]/5 p-8 text-center">
          <h2 className="text-xl font-semibold text-white">Try it with any UK company</h2>
          <p className="mt-2 text-[#7A8FAD]">
            Financial data is available for any company that files digitally with Companies House.
            Get a free API key — 50 calls per month, no credit card.
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
              View quickstart guide
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
