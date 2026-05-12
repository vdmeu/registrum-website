import type { Metadata } from "next";
import KeySignupForm from "@/components/KeySignupForm";
import PageFeedback from "@/app/components/PageFeedback";
import SiteNav from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "Companies House Financial Data API — Structured JSON | Registrum",
  description:
    "Extract turnover, profit, net assets, and employee counts from Companies House iXBRL filings via a clean JSON API. No XBRL parsing required.",
};

function Nav() {
  return (
    <SiteNav maxWidth="6xl" />
  );
}

export default function CompaniesHouseFinancialDataPage() {
  return (
    <div className="min-h-screen bg-[#060D1B] text-[#E8F0FE] font-[family-name:var(--font-geist-sans)]">
      <Nav />

      <main>
        {/* Hero */}
        <section className="px-6 pb-16 pt-20">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#22D3A0]/20 bg-[#22D3A0]/10 px-3 py-1 text-xs font-medium text-[#22D3A0]">
              Financial Data
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Companies House Financial Data — Structured JSON API
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-[#7A8FAD]">
              Companies House holds annual accounts for millions of UK companies. Getting usable
              numbers out of them is the hard part. Here is what the data actually contains, what
              the raw API gives you, and how Registrum turns it into clean JSON you can use
              immediately.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="px-6 pb-20">
          <div className="mx-auto max-w-3xl space-y-10">

            <div>
              <h2 className="mb-3 text-xl font-semibold text-white">
                What financial data does Companies House actually hold?
              </h2>
              <p className="text-[#7A8FAD] leading-relaxed">
                UK companies are required to file annual accounts with Companies House. For most
                private companies, those accounts are submitted as <strong className="text-[#E8F0FE]">iXBRL documents</strong> —
                Inline XBRL files that embed structured financial tags inside human-readable HTML.
                HMRC has mandated iXBRL for corporation tax filings since 2011, which means a large
                proportion of accounts filed since then contain machine-readable data.
              </p>
              <p className="mt-3 text-[#7A8FAD] leading-relaxed">
                The data covers profit and loss (turnover, gross profit, operating profit,
                profit after tax) and balance sheet items (net assets, total equity, current
                liabilities). Employee headcount is included when the company reports it. Most
                filings contain both the current year and prior year comparatives in the same
                document.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-white">
                What the raw Companies House API returns
              </h2>
              <p className="text-[#7A8FAD] leading-relaxed">
                The Companies House API exposes a <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">/filing-history</code> endpoint
                that lists documents filed by a company. To get financial data, you retrieve the
                filing list, identify accounts documents, fetch the document metadata, then download
                the raw iXBRL file. The API gives you a link to a document — it does not parse the
                document for you.
              </p>
              <p className="mt-3 text-[#7A8FAD] leading-relaxed">
                That raw iXBRL file is an XML-embedded HTML document using XBRL namespaces and
                taxonomy references that vary by filing type. Extracting a single number like
                turnover requires: downloading the file, parsing the XML, resolving the taxonomy
                namespace, matching context references to the correct period, handling unit
                declarations, and dealing with variations between the UK GAAP, FRS 102, FRS 105,
                and IFRS taxonomy versions. It is several hundred lines of parsing code for a
                number you could express in one JSON field.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-white">
                What Registrum returns instead
              </h2>
              <p className="text-[#7A8FAD] leading-relaxed">
                Registrum fetches, parses, and caches the iXBRL filing so you never have to.
                A single GET request returns structured JSON with labelled fields, explicit currency
                and unit metadata, and a <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">data_quality</code> object documenting
                exactly which fields were found and which were absent. You get current year and
                prior year side by side, so you can calculate growth rates without making a second
                call.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  ["turnover", "Total revenue"],
                  ["gross_profit", "Revenue minus cost of sales"],
                  ["operating_profit", "Profit before interest and tax"],
                  ["profit_after_tax", "Bottom-line profit"],
                  ["net_assets", "Total equity / net worth"],
                  ["current_assets", "Short-term assets"],
                  ["current_liabilities", "Short-term liabilities"],
                  ["employees", "Average headcount"],
                ].map(([field, label]) => (
                  <div
                    key={field}
                    className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                  >
                    <div className="font-[family-name:var(--font-geist-mono)] text-sm text-[#4F7BFF]">
                      {field}
                    </div>
                    <div className="mt-0.5 text-xs text-[#7A8FAD]">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-white">
                Understanding the data_quality metadata
              </h2>
              <p className="text-[#7A8FAD] leading-relaxed">
                Not every company files iXBRL with every field populated. Micro-entity accounts
                under FRS 105 contain significantly less data than full accounts. Some companies
                only report a balance sheet, omitting profit and loss entirely. The
                <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]"> data_quality</code> object in every Registrum response
                tells you: which fields were successfully parsed, which were absent in the filing,
                whether the parser is confident in the values, and which taxonomy version was used.
                This lets you distinguish between a company that had zero turnover and a company
                whose filing simply did not include that figure.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-white">
                Limitations to know about
              </h2>
              <ul className="space-y-3 text-[#7A8FAD] leading-relaxed">
                <li className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#7A8FAD]" />
                  <span>
                    <strong className="text-[#E8F0FE]">Listed companies (PLCs)</strong> typically file
                    PDF annual reports rather than iXBRL, so financial data is not available for
                    most FTSE companies via this route.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#7A8FAD]" />
                  <span>
                    <strong className="text-[#E8F0FE]">Micro-entities</strong> filing under FRS 105 are
                    only required to include a balance sheet — turnover and profit figures are
                    optional and often absent.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#7A8FAD]" />
                  <span>
                    <strong className="text-[#E8F0FE]">Filing lag.</strong> Companies have up to 9 months
                    after their year-end to file accounts, so the most recent data may be up to a
                    year old.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#7A8FAD]" />
                  <span>
                    <strong className="text-[#E8F0FE]">Newly incorporated companies</strong> may not have
                    filed any accounts yet — Registrum returns a clear error rather than empty data
                    in this case.
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-4 text-xl font-semibold text-white">
                Example: Tesco PLC financials
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
    "period_end": "2024-02-24",
    "currency": "GBP",
    "profit_and_loss": {
      "turnover":         { "value": 68190000000, "prior_year": 65762000000 },
      "gross_profit":     { "value": 3820000000,  "prior_year": 3518000000  },
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
      "taxonomy": "uk-gaap-2009"
    }
  }
}`}
                </pre>
              </div>
              <p className="mt-3 text-sm text-[#3D5275]">
                Financial data is cached for 7 days. Company number <code className="font-[family-name:var(--font-geist-mono)]">00445790</code> is Tesco PLC — used here as a publicly available reference example.
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
      <PageFeedback pageUrl="/companies-house-financial-data" />
      </main>

      <footer className="border-t border-white/[0.06] px-6 py-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-[#3D5275]">
          © {new Date().getFullYear()} Registrum. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
