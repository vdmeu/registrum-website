import type { Metadata } from "next";
import Link from "next/link";
import KeySignupForm from "@/components/KeySignupForm";
import PageFeedback from "@/app/components/PageFeedback";

export const metadata: Metadata = {
  title: "UK Beneficial Ownership API — PSC Chain Resolution | Registrum",
  description:
    "Resolve ultimate beneficial owners for any UK company via the PSC register. Decoded control types, active/ceased split, and recursive chain traversal — one API call.",
};

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#060D1B]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="/" className="text-lg font-semibold tracking-tight text-white hover:text-[#E8F0FE]">
          Registrum
        </a>
        <nav className="flex items-center gap-6">
          <a href="/quickstart" className="hidden text-sm text-[#7A8FAD] transition-colors hover:text-white sm:block">
            Quickstart
          </a>
          <a
            href="https://api.registrum.co.uk/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-sm text-[#7A8FAD] transition-colors hover:text-white sm:block"
          >
            Docs
          </a>
          <a
            href="/#get-key"
            className="rounded-md bg-[#4F7BFF] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6B93FF]"
          >
            Get API Key
          </a>
        </nav>
      </div>
    </header>
  );
}

export default function BeneficialOwnershipApiPage() {
  return (
    <div className="min-h-screen bg-[#060D1B] text-[#E8F0FE] font-[family-name:var(--font-geist-sans)]">
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-20 pt-24">
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-[#4F7BFF] opacity-[0.06] blur-[120px]"
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#4F7BFF]/30 bg-[#4F7BFF]/10 px-3 py-1.5 text-xs font-medium text-[#4F7BFF]">
            PSC &amp; UBO API
          </div>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
            UK Beneficial Ownership API
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#7A8FAD]">
            Resolve the ultimate beneficial owners of any UK company — traversing corporate
            structures automatically, decoding control types to plain English, and splitting active
            from ceased PSCs. One API call.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="#get-key"
              className="rounded-md bg-[#4F7BFF] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#6B93FF]"
            >
              Get free API key →
            </a>
            <Link
              href="/psc-example"
              className="rounded-md border border-white/10 px-5 py-2.5 text-sm font-medium text-[#E8F0FE] transition-colors hover:border-white/20 hover:bg-white/5"
            >
              See live example
            </Link>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-y border-white/[0.06] bg-white/[0.02] px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Why the raw Companies House PSC data is hard to use
          </h2>
          <p className="mt-4 text-[#7A8FAD]">
            The Companies House PSC API returns the right data — but in a form that requires
            significant work before it&apos;s usable in a compliance or KYB workflow.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                problem: "Coded control strings",
                detail:
                  'Raw CH responses use codes like ownership-of-shares-25-to-50-percent. There are 80+ codes across shares, voting rights, director appointment, LLP membership, and influence. No human-readable decoding is provided.',
              },
              {
                problem: "Active and ceased entries mixed",
                detail:
                  "The CH API returns all PSCs in a single list — past and present — with no filtering. You have to check ceased and ceased_on on every item to determine who still controls the company.",
              },
              {
                problem: "Corporate entities need following",
                detail:
                  "If a corporate entity PSC is registered at CH, you need to fetch its PSCs separately. Then repeat. And handle cycles. The raw API has no chain-traversal capability.",
              },
            ].map((item) => (
              <div
                key={item.problem}
                className="rounded-xl border border-white/[0.06] bg-[#0A1628] p-5"
              >
                <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                  <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                    <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.75a.75.75 0 011.5 0v4a.75.75 0 01-1.5 0v-4zm.75 7.5a.875.875 0 110-1.75.875.875 0 010 1.75z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-white">{item.problem}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#7A8FAD]">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#22D3A0]/20 bg-[#22D3A0]/5 px-3 py-1 text-xs font-medium text-[#22D3A0]">
            What the Registrum PSC API does
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Clean beneficial ownership data, ready to use
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Decoded natures of control",
                body: "Every control code is translated to plain English. 'ownership-of-shares-25-to-50-percent' becomes 'Owns 25-50% of shares'. All 80+ codes across shares, voting, director appointment, LLP, and RLE are covered.",
                color: "#22D3A0",
              },
              {
                title: "Active / ceased split",
                body: "The response separates active_pscs from ceased_pscs automatically. No need to check ceased or ceased_on on every item — the active register is ready to use directly.",
                color: "#22D3A0",
              },
              {
                title: "Corporate entity company numbers extracted",
                body: "When a PSC is a UK corporate entity, its registration_number is surfaced as company_number at the top level. Pass it directly to the chain endpoint — no digging through identification objects.",
                color: "#4F7BFF",
              },
              {
                title: "PSC exemption detection",
                body: "Listed PLCs and other entities exempt from PSC filing are detected automatically. The response includes has_psc_exemption: true with an explanation — your code doesn't need to handle exemption links separately.",
                color: "#4F7BFF",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5"
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                </div>
                <p className="text-xs leading-relaxed text-[#7A8FAD]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chain resolution */}
      <section className="border-y border-white/[0.06] bg-white/[0.02] px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Ownership chain resolution
          </h2>
          <p className="mt-4 text-[#7A8FAD]">
            The{" "}
            <code className="rounded bg-white/[0.06] px-1.5 font-[family-name:var(--font-geist-mono)] text-xs text-[#E8F0FE]">
              /psc/chain
            </code>{" "}
            endpoint traverses the ownership structure recursively — following corporate entity
            PSCs to find the natural persons who ultimately control the company.
          </p>

          {/* Code */}
          <div className="mt-6 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A1628]">
            <div className="border-b border-white/[0.06] px-4 py-2.5 text-xs text-[#3D5275]">
              Example
            </div>
            <pre className="overflow-x-auto px-5 py-4 font-[family-name:var(--font-geist-mono)] text-xs leading-relaxed text-[#7A8FAD]">
{`# Flat PSC register — who controls the company?
GET /v1/company/12345678/psc

# Ownership chain — who ultimately controls?
GET /v1/company/12345678/psc/chain?max_depth=5

X-API-Key: reg_live_...`}
            </pre>
          </div>

          {/* Terminal reasons */}
          <h3 className="mt-10 text-base font-semibold text-white">
            Terminal reasons — why a branch stops
          </h3>
          <p className="mt-2 text-sm text-[#7A8FAD]">
            Every node in the chain has a{" "}
            <code className="font-[family-name:var(--font-geist-mono)] text-xs text-[#E8F0FE]">terminal_reason</code>{" "}
            that explains exactly why traversal ended there.
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                  <th className="px-4 py-3 font-medium text-white">terminal_reason</th>
                  <th className="px-4 py-3 font-medium text-white">Meaning</th>
                  <th className="px-4 py-3 font-medium text-white">UBO found?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-xs">
                {[
                  { reason: "natural_person", meaning: "An individual — ultimate beneficial owner identified", ubo: true },
                  { reason: "foreign_entity", meaning: "Corporate entity not registered at Companies House — no further traversal possible", ubo: false },
                  { reason: "legal_person", meaning: "Government body, charity, or similar legal entity", ubo: false },
                  { reason: "super_secure", meaning: "PSC details protected by court order", ubo: false },
                  { reason: "psc_exempt", meaning: "Company exempt from PSC filing (e.g. listed PLC)", ubo: false },
                  { reason: "depth_limit", meaning: "max_depth reached — increase to traverse further", ubo: false },
                  { reason: "not_found", meaning: "Company not found at Companies House or API error", ubo: false },
                  { reason: "cycle_detected", meaning: "Circular ownership detected — traversal stopped to prevent a loop", ubo: false },
                ].map((row) => (
                  <tr key={row.reason} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-[family-name:var(--font-geist-mono)] text-[#4F7BFF]">
                      {row.reason}
                    </td>
                    <td className="px-4 py-3 text-[#7A8FAD]">{row.meaning}</td>
                    <td className="px-4 py-3">
                      {row.ubo ? (
                        <span className="text-[#22D3A0]">Yes</span>
                      ) : (
                        <span className="text-[#3D5275]">No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Credit cost */}
          <div className="mt-6 rounded-lg border border-[#4F7BFF]/20 bg-[#4F7BFF]/5 px-4 py-3 text-sm text-[#7A8FAD]">
            <strong className="text-[#E8F0FE]">Credit cost:</strong> Each company resolved in the chain costs 1 API credit.
            A 3-company chain costs 3 credits. The response includes{" "}
            <code className="font-[family-name:var(--font-geist-mono)] text-xs text-[#E8F0FE]">chain_metadata.total_credits</code>{" "}
            so you always know the cost.
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Built for compliance and due diligence workflows
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "KYB onboarding",
                body: "Verify who controls a business before onboarding. Pull the UBO chain as part of your automated onboarding flow — no manual Companies House searches.",
              },
              {
                title: "AML screening",
                body: "Identify natural persons with significant control for PEP and sanctions screening. The chain endpoint returns individuals in a consistent format regardless of depth.",
              },
              {
                title: "PropTech due diligence",
                body: "Corporate landlords and SPVs are often controlled through multi-layer holding structures. Resolve the full chain to identify who ultimately owns the property portfolio.",
              },
              {
                title: "Credit risk",
                body: "Verify that the beneficial owners of a borrower match the loan application. Detect undisclosed related-party structures by comparing chains across applicants.",
              },
              {
                title: "Investor due diligence",
                body: "Identify who you are ultimately doing business with before signing term sheets or transferring funds.",
              },
              {
                title: "Regulatory reporting",
                body: "Many regulatory regimes require documentation of UBOs above a 25% threshold. The PSC chain gives you this in a machine-readable format ready for your compliance record.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5"
              >
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#7A8FAD]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="get-key"
        className="border-t border-white/[0.06] bg-white/[0.02] px-6 py-20 text-center"
      >
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Start resolving beneficial ownership
          </h2>
          <p className="mt-4 text-[#7A8FAD]">
            50 free calls per month. All endpoints included. No Companies House API key required.
          </p>
          <KeySignupForm />
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/psc-example" className="text-[#4F7BFF] hover:underline">
              See ownership chain example →
            </Link>
            <a
              href="https://api.registrum.co.uk/docs#/PSC"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4F7BFF] hover:underline"
            >
              PSC API reference →
            </a>
          </div>
          <p className="mt-4 text-xs text-[#3D5275]">
            By signing up you agree to our{" "}
            <a href="/terms" className="underline underline-offset-2 hover:text-[#7A8FAD]">
              terms of service
            </a>
            .
          </p>
        </div>
      </section>
      <PageFeedback pageUrl="/beneficial-ownership-api" />
    </div>
  );
}
