import type { Metadata } from "next";
import KeySignupForm from "@/components/KeySignupForm";
import PageFeedback from "@/app/components/PageFeedback";
import SiteNav from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "iXBRL Parser API for UK Company Accounts | Registrum",
  description:
    "Parse UK company iXBRL filings from Companies House into clean JSON. Structured turnover, profit, net assets — no XBRL expertise required.",
};

function Nav() {
  return (
    <SiteNav maxWidth="6xl" />
  );
}

export default function IxbrlParserApiPage() {
  return (
    <div className="min-h-screen bg-[#060D1B] text-[#E8F0FE] font-[family-name:var(--font-geist-sans)]">
      <Nav />

      <main>
        {/* Hero */}
        <section className="px-6 pb-16 pt-20">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#4F7BFF]/20 bg-[#4F7BFF]/10 px-3 py-1 text-xs font-medium text-[#4F7BFF]">
              iXBRL Parsing
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              iXBRL Parser API for UK Company Accounts
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-[#7A8FAD]">
              iXBRL is the filing format behind most UK company accounts. Parsing it yourself
              means handling multiple taxonomy versions, namespace resolution, and ambiguous
              context references. Registrum does all of that and returns clean JSON.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="px-6 pb-20">
          <div className="mx-auto max-w-3xl space-y-10">

            <div>
              <h2 className="mb-3 text-xl font-semibold text-white">
                What is iXBRL?
              </h2>
              <p className="text-[#7A8FAD] leading-relaxed">
                iXBRL stands for Inline XBRL. It is a document format that embeds XBRL
                (eXtensible Business Reporting Language) tags directly inside a human-readable
                HTML document. The same file serves two purposes: it renders as a normal web page
                when opened in a browser, and it contains machine-readable financial data via
                XML tags hidden within the markup.
              </p>
              <p className="mt-3 text-[#7A8FAD] leading-relaxed">
                HMRC made iXBRL mandatory for UK corporation tax returns in 2011, which means
                the majority of annual accounts filed with Companies House since that date contain
                structured financial data. For any company that files digitally — roughly all
                private limited companies and LLPs — iXBRL is the format their accountant
                produces and Companies House stores.
              </p>
              <p className="mt-3 text-[#7A8FAD] leading-relaxed">
                The XBRL taxonomy defines what each tag means. UK companies use one of several
                taxonomy versions — the UK GAAP taxonomy, FRS 102, FRS 105, or IFRS — and the
                tag names and structures vary across them. A turnover figure might be tagged
                as <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">uk-gaap:Turnover</code>, <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">core:Turnover</code>,
                or <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">bus:TurnoverRevenue</code> depending on the filing version and
                the software that produced it.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-white">
                Why parsing it yourself is harder than it looks
              </h2>
              <p className="text-[#7A8FAD] leading-relaxed">
                The first challenge is downloading the right file. Companies House stores multiple
                documents per filing — the iXBRL accounts, sometimes a separate directors&apos; report,
                and index metadata. You need to identify the correct document type from the filing
                history and follow several API calls to retrieve the actual file.
              </p>
              <p className="mt-3 text-[#7A8FAD] leading-relaxed">
                Once you have the file, the parsing challenges include:
              </p>
              <ul className="mt-3 space-y-3 text-[#7A8FAD] leading-relaxed">
                <li className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#4F7BFF]" />
                  <span>
                    <strong className="text-[#E8F0FE]">Namespace resolution.</strong> iXBRL documents
                    declare XML namespaces that map prefixes to taxonomy URIs. These vary between
                    filing software vendors and taxonomy versions — the same concept has different
                    tag names across filings.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#4F7BFF]" />
                  <span>
                    <strong className="text-[#E8F0FE]">contextRef matching.</strong> Each tagged value
                    references a context element that defines the period (start date, end date,
                    instant) and entity. You must match values to contexts to know whether a number
                    is the current year or prior year.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#4F7BFF]" />
                  <span>
                    <strong className="text-[#E8F0FE]">Unit handling.</strong> Values are declared with a
                    unitRef attribute pointing to a unit definition. Most are GBP but not all — and
                    employee counts have no monetary unit. You need to resolve and validate units
                    separately.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#4F7BFF]" />
                  <span>
                    <strong className="text-[#E8F0FE]">Scale attributes.</strong> Numbers in iXBRL can be
                    tagged with a <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">scale</code> attribute
                    (e.g., <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">3</code> means thousands). A raw value of
                    <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]"> 68190000</code> with scale 3 is actually £68.19 billion.
                    Missing this turns your turnover figures into nonsense.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#4F7BFF]" />
                  <span>
                    <strong className="text-[#E8F0FE]">Taxonomy version differences.</strong> FRS 105
                    micro-entity accounts use a different tag set from FRS 102 small company
                    accounts, which differ again from full IFRS filings. A parser that works for
                    one filing type frequently breaks on another.
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-white">
                What Registrum&apos;s parser extracts
              </h2>
              <p className="text-[#7A8FAD] leading-relaxed">
                The Registrum iXBRL parser handles namespace resolution, context matching,
                unit parsing, and scale normalisation across all major UK taxonomy versions.
                The output is a consistent JSON structure regardless of which taxonomy version or
                filing software produced the source document.
              </p>
              <p className="mt-3 text-[#7A8FAD] leading-relaxed">
                Every response includes both the current period and prior year comparatives where
                available. The <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">data_quality</code> block
                documents exactly what was found, what was missing, and whether the parser
                encountered any ambiguity — so you always know the confidence level of the data
                you are working with.
              </p>
              <p className="mt-3 text-[#7A8FAD] leading-relaxed">
                Fields extracted include: <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">profit_and_loss.turnover</code>,{" "}
                <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">profit_and_loss.gross_profit</code>,{" "}
                <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">profit_and_loss.operating_profit</code>,{" "}
                <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">profit_and_loss.profit_after_tax</code>,{" "}
                <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">balance_sheet.net_assets</code>,{" "}
                <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">balance_sheet.current_assets</code>,{" "}
                <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">balance_sheet.current_liabilities</code>, and{" "}
                <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">other.employees</code>.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-xl font-semibold text-white">
                Example API call and response
              </h2>
              <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A1628]">
                <div className="border-b border-white/[0.06] px-4 py-2.5 text-xs text-[#3D5275]">
                  bash
                </div>
                <pre className="overflow-x-auto px-5 py-4 font-[family-name:var(--font-geist-mono)] text-sm leading-relaxed text-[#7A8FAD]">
{`curl -H "X-API-Key: reg_live_..." \\
  "https://api.registrum.co.uk/v1/company/00445790/financials"

# Response (abbreviated):
{
  "status": "ok",
  "data": {
    "company_number": "00445790",
    "company_name": "TESCO PLC",
    "period_end": "2024-02-24",
    "currency": "GBP",
    "profit_and_loss": {
      "turnover":         { "value": 68190000000, "prior_year": 65762000000 },
      "profit_after_tax": { "value": 1000000000,  "prior_year": 852000000   }
    },
    "balance_sheet": {
      "net_assets": { "value": 8730000000, "prior_year": 8102000000 }
    },
    "other": {
      "employees": { "value": 295622, "prior_year": 300000 }
    },
    "data_quality": {
      "fields_found": 12,
      "fields_missing": 2,
      "confidence": "high",
      "taxonomy": "uk-gaap-2009",
      "missing_fields": ["gross_profit", "operating_profit"]
    }
  },
  "meta": {
    "cached": true,
    "cache_ttl_seconds": 604800
  }
}`}
                </pre>
              </div>
              <p className="mt-3 text-sm text-[#3D5275]">
                All values are returned in full units (pence are not used). Financial data is cached
                for 7 days. The <code className="font-[family-name:var(--font-geist-mono)]">data_quality.missing_fields</code> array
                tells you which concepts were absent in this filing — not parser failures, but
                genuinely absent data.
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
              50 free calls per month. No credit card required. No XBRL expertise needed.
            </p>
            <KeySignupForm />
          </div>
        </section>
      <PageFeedback pageUrl="/ixbrl-parser-api" />
      </main>

      <footer className="border-t border-white/[0.06] px-6 py-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-[#3D5275]">
          © {new Date().getFullYear()} Registrum. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
