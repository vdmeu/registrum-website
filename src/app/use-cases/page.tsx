import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Use Cases — Registrum",
  description:
    "How PropTech, RegTech, and sales intelligence teams use the Registrum API for corporate due diligence, KYB compliance, and CRM enrichment.",
};

const cases = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
      </svg>
    ),
    sector: "PropTech",
    headline: "Verify corporate landlords and trace beneficial ownership",
    description:
      "Automated due diligence on corporate landlords, portfolio companies, and property SPVs. Resolve who ultimately controls a company using the PSC chain endpoint — without manual Companies House searches.",
    points: [
      "Resolve ultimate beneficial owners through multi-layer holding structures via /psc/chain",
      "Identify all companies sharing directors with a target landlord via /network",
      "Flag overdue accounts or dissolved subsidiaries in a portfolio",
    ],
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    sector: "RegTech / KYB",
    headline: "Know Your Business checks and AML screening at scale",
    description:
      "Structured company data for compliance workflows — KYB onboarding, AML screening, and sanctions checking. Pull verified financials, director history, and beneficial ownership in a single API call, ready for your compliance engine.",
    points: [
      "Resolve UBOs via /psc/chain — decoded control types, active/ceased split, cycle detection",
      "Retrieve structured financials for credit and risk assessment via /financials",
      "Director history across all appointments in one response via /directors",
    ],
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    sector: "Sales Intelligence",
    headline: "Enrich CRM leads and trigger on new company formations",
    description:
      "Turn a company name into a full profile — turnover, headcount, SIC codes, director names — and push it into your CRM automatically. Trigger outreach when new companies form in your target SIC codes.",
    points: [
      "Enrich inbound leads with verified turnover and employee data",
      "Score prospects by company age, size, and financial health",
      "Trigger sales sequences on new formations in your target sectors",
    ],
  },
];

export default function UseCasesPage() {
  return (
    <div className="min-h-screen bg-[#060D1B] text-[#E8F0FE] font-[family-name:var(--font-geist-sans)]">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#060D1B]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight text-white">
            Registrum
          </Link>
          <a
            href="/#get-key"
            className="rounded-md bg-[#4F7BFF] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6B93FF]"
          >
            Get API Key
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pb-16 pt-20 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#4F7BFF]/30 bg-[#4F7BFF]/10 px-3 py-1.5 text-xs font-medium text-[#4F7BFF]">
            Who uses Registrum
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Built for teams that work with UK companies
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-[#7A8FAD]">
            From PropTech due diligence to KYB compliance and sales prospecting —
            Registrum turns Companies House data into structured, actionable information.
          </p>
        </div>
      </section>

      {/* Cases */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl space-y-6">
          {cases.map((c) => (
            <div
              key={c.sector}
              className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-8"
            >
              <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
                <div>
                  <div className="mb-4 w-fit rounded-lg border border-[#4F7BFF]/20 bg-[#4F7BFF]/10 p-3 text-[#4F7BFF]">
                    {c.icon}
                  </div>
                  <div className="text-xs font-medium uppercase tracking-wider text-[#3D5275]">
                    {c.sector}
                  </div>
                  <h2 className="mt-2 text-xl font-semibold leading-snug text-white">
                    {c.headline}
                  </h2>
                </div>
                <div>
                  <p className="text-[#7A8FAD] leading-relaxed">{c.description}</p>
                  <ul className="mt-5 space-y-2.5">
                    {c.points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5 text-sm text-[#7A8FAD]">
                        <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#22D3A0]" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                        </svg>
                        {p}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex flex-wrap gap-4">
                    <Link
                      href="/quickstart"
                      className="text-sm text-[#4F7BFF] hover:underline"
                    >
                      See how in the quickstart →
                    </Link>
                    {c.sector === "RegTech / KYB" && (
                      <Link
                        href="/beneficial-ownership-api"
                        className="text-sm text-[#4F7BFF] hover:underline"
                      >
                        Beneficial ownership API →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/[0.06] bg-white/[0.02] px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Try it with your first 50 calls free
          </h2>
          <p className="mt-4 text-[#7A8FAD]">
            No credit card. Your API key arrives in seconds.
          </p>
          <a
            href="/#get-key"
            className="mt-8 inline-block rounded-md bg-[#4F7BFF] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#6B93FF]"
          >
            Get free API key →
          </a>
        </div>
      </section>
    </div>
  );
}
