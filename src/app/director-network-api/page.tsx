import type { Metadata } from "next";
import KeySignupForm from "@/components/KeySignupForm";

export const metadata: Metadata = {
  title: "Director Network API — Companies House Connections | Registrum",
  description:
    "Discover UK company networks via shared directors. One API call traverses the full director graph to 2 degrees. Built on Companies House data.",
};

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#060D1B]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="/" className="text-lg font-semibold tracking-tight text-white hover:text-[#E8F0FE]">
          Registrum
        </a>
        <nav className="flex items-center gap-6">
          <a
            href="/#demo"
            className="text-sm text-[#7A8FAD] transition-colors hover:text-white"
          >
            Company Search
          </a>
          <a
            href="/quickstart"
            className="text-sm text-[#7A8FAD] transition-colors hover:text-white"
          >
            Quickstart
          </a>
          <a
            href="https://api.registrum.co.uk/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#7A8FAD] transition-colors hover:text-white"
          >
            Docs
          </a>
          <a
            href="/#pricing"
            className="text-sm text-[#7A8FAD] transition-colors hover:text-white"
          >
            Pricing
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

export default function DirectorNetworkApiPage() {
  return (
    <div className="min-h-screen bg-[#060D1B] text-[#E8F0FE] font-[family-name:var(--font-geist-sans)]">
      <Nav />

      <main>
        {/* Hero */}
        <section className="px-6 pb-16 pt-20">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#22D3A0]/20 bg-[#22D3A0]/10 px-3 py-1 text-xs font-medium text-[#22D3A0]">
              Director Networks
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Director Network API — Map Company Connections via Shared Directors
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-[#7A8FAD]">
              UK company directors are public record. When the same person sits on multiple
              boards, those companies are connected. One API call traverses that graph and
              returns every related company — sorted by strength of connection.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="px-6 pb-20">
          <div className="mx-auto max-w-3xl space-y-10">

            <div>
              <h2 className="mb-3 text-xl font-semibold text-white">
                What the director network shows
              </h2>
              <p className="text-[#7A8FAD] leading-relaxed">
                Every UK company must register its directors with Companies House. That data is
                public. When person A sits on the board of Company X and also Company Y, those
                two companies share a director — they are one degree apart in the network. If
                Company Y in turn shares a director with Company Z, that is two degrees from your
                starting point.
              </p>
              <p className="mt-3 text-[#7A8FAD] leading-relaxed">
                This graph structure reveals information that is not visible from looking at any
                single company record: holding structures, affiliate networks, whether a business
                shares management with its competitors, and whether a counterparty&apos;s directors
                have a track record of involvement in dissolved or struck-off companies.
              </p>
              <p className="mt-3 text-[#7A8FAD] leading-relaxed">
                The Registrum network endpoint builds this graph for any company number, traverses
                it to the requested depth, and returns a ranked list of connected companies. No
                graph database setup required on your end — it is a single HTTP call.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-white">
                Use cases
              </h2>
              <ul className="space-y-3 text-[#7A8FAD] leading-relaxed">
                <li className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#22D3A0]" />
                  <span>
                    <strong className="text-[#E8F0FE]">KYB (Know Your Business) checks.</strong> Before
                    onboarding a business customer, map their full corporate network to identify
                    related entities, beneficial owners, and any companies that share management
                    with sanctioned or dissolved firms.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#22D3A0]" />
                  <span>
                    <strong className="text-[#E8F0FE]">Due diligence.</strong> An acquisition or partnership
                    target&apos;s directors may have material involvement in other companies — competitors,
                    conflicts of interest, or businesses with a history of regulatory issues. Surface
                    these connections before signing.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#22D3A0]" />
                  <span>
                    <strong className="text-[#E8F0FE]">Fraud detection.</strong> Phoenix company patterns —
                    where a director closes one company and immediately opens another — are visible
                    in the director graph. So are networks of companies that share management and
                    may be operating as a single undisclosed entity.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#22D3A0]" />
                  <span>
                    <strong className="text-[#E8F0FE]">Ownership research.</strong> Complex group structures
                    are often not apparent from a single company record. Traversing two degrees of
                    director connections frequently reveals the full group — subsidiaries, holding
                    companies, and sister entities — that a company is part of.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#22D3A0]" />
                  <span>
                    <strong className="text-[#E8F0FE]">Competitive intelligence.</strong> Identify companies
                    whose management overlaps with a competitor, revealing potential strategic
                    relationships, shared investors, or informal coordination.
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-white">
                How graph traversal works
              </h2>
              <p className="text-[#7A8FAD] leading-relaxed">
                The <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">depth</code> parameter controls how far the traversal goes:
              </p>
              <div className="mt-4 space-y-3">
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-5 py-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 rounded bg-[#4F7BFF]/20 px-2 py-0.5 font-[family-name:var(--font-geist-mono)] text-xs text-[#4F7BFF]">
                      depth=1
                    </span>
                    <p className="text-sm text-[#7A8FAD]">
                      Returns all companies that share at least one current director with the target
                      company. This is the direct connection layer — the companies most likely to be
                      related entities, subsidiaries, or managed by the same people.
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-5 py-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 rounded bg-[#4F7BFF]/20 px-2 py-0.5 font-[family-name:var(--font-geist-mono)] text-xs text-[#4F7BFF]">
                      depth=2
                    </span>
                    <p className="text-sm text-[#7A8FAD]">
                      Extends the traversal one level further — takes every company found at depth 1
                      and finds their connections too. This surfaces the broader network: companies
                      two hops away that have an indirect management link to the starting point.
                    </p>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-[#7A8FAD] leading-relaxed">
                Results are sorted by <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">shared_directors_count</code> descending, so the
                most tightly connected companies appear first. Companies sharing three directors
                are more likely to be genuinely related than companies sharing one.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-white">
                What the response contains
              </h2>
              <p className="text-[#7A8FAD] leading-relaxed">
                Each entry in the <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">companies</code> array includes the company name,
                number, status, and incorporation date from Companies House. The
                <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]"> shared_directors</code> array lists the names of the directors
                who create the connection, so you can immediately see which person links the
                two companies. The <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">connection_depth</code> field tells you whether
                a company was found at depth 1 or 2.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-xl font-semibold text-white">
                Example: mapping Tesco&apos;s director network
              </h2>
              <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A1628]">
                <div className="border-b border-white/[0.06] px-4 py-2.5 text-xs text-[#3D5275]">
                  bash
                </div>
                <pre className="overflow-x-auto px-5 py-4 font-[family-name:var(--font-geist-mono)] text-sm leading-relaxed text-[#7A8FAD]">
{`curl -H "X-API-Key: reg_live_..." \\
  "https://api.registrum.co.uk/v1/company/00445790/network?depth=1"

# Response (abbreviated):
{
  "status": "ok",
  "data": {
    "company_number": "00445790",
    "company_name": "TESCO PLC",
    "depth": 1,
    "total_connections": 14,
    "companies": [
      {
        "company_number": "00519500",
        "company_name": "TESCO STORES LIMITED",
        "company_status": "active",
        "incorporated_on": "1954-04-21",
        "connection_depth": 1,
        "shared_directors_count": 4,
        "shared_directors": [
          "Ken Murphy",
          "Imran Nawaz",
          "Melissa Bethell",
          "Byron Grote"
        ]
      },
      {
        "company_number": "02947650",
        "company_name": "TESCO PROPERTY FINANCE 1 PLC",
        "company_status": "active",
        "incorporated_on": "1994-06-14",
        "connection_depth": 1,
        "shared_directors_count": 2,
        "shared_directors": [
          "Ken Murphy",
          "Imran Nawaz"
        ]
      }
    ]
  },
  "meta": {
    "cached": true,
    "cache_ttl_seconds": 86400
  }
}`}
                </pre>
              </div>
              <p className="mt-3 text-sm text-[#3D5275]">
                Director data is cached for 24 hours. Large networks (depth=2 on a company with
                many directors) may return dozens of connected companies — use{" "}
                <code className="font-[family-name:var(--font-geist-mono)]">depth=1</code> first to understand the immediate connections before
                expanding the traversal.
              </p>
            </div>

          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-white/[0.06] bg-white/[0.02] px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Get your free API key
            </h2>
            <p className="mt-4 text-[#7A8FAD]">
              50 free calls per month. No credit card required.
            </p>
            <KeySignupForm />
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] px-6 py-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-[#3D5275]">
          © {new Date().getFullYear()} Registrum. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
