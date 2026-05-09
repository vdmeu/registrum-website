import type { Metadata } from "next";
import Link from "next/link";
import PageFeedback from "@/app/components/PageFeedback";

export const metadata: Metadata = {
  title: "Bulk Company Enrichment API · Registrum",
  description:
    "Enrich 500 UK companies with a single API call. Submit your list, we handle the Companies House rate limit automatically. Poll for results — no timeouts, no queueing logic required.",
};

export default function BulkEnrichment() {
  return (
    <div className="min-h-screen bg-[#060D1B] text-[#E8F0FE] font-[family-name:var(--font-geist-sans)]">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#060D1B]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight text-white">
            Registrum
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/#pricing"
              className="hidden text-sm text-[#7A8FAD] transition-colors hover:text-white sm:block"
            >
              Pricing
            </Link>
            <a
              href="https://api.registrum.co.uk/docs#/Batch"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden text-sm text-[#7A8FAD] transition-colors hover:text-white sm:block"
            >
              API Docs
            </a>
            <Link
              href="/#get-key"
              className="rounded-md bg-[#4F7BFF] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6B93FF]"
            >
              Get API Key
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pb-16 pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#4F7BFF]/30 bg-[#4F7BFF]/10 px-3 py-1.5 text-xs font-medium text-[#4F7BFF]">
              Async Batch API
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#22D3A0]/30 bg-[#22D3A0]/10 px-3 py-1.5 text-xs font-medium text-[#22D3A0]">
              Available on all plans
            </div>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Enrich 500 companies<br />with one API call
          </h1>
          <p className="mt-5 text-lg text-[#7A8FAD]">
            Submit your list. We enrich them in the background, automatically managing the Companies House rate limit.
            Poll for results — no timeouts, no queue logic, no rate-limit errors on your side.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/#get-key"
              className="rounded-md bg-[#4F7BFF] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#6B93FF]"
            >
              Get free API key →
            </Link>
            <a
              href="https://api.registrum.co.uk/docs#/Batch"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-white/10 px-5 py-2.5 text-sm font-medium text-[#E8F0FE] transition-colors hover:border-white/20 hover:bg-white/5"
            >
              API reference →
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-white/[0.06] bg-white/[0.02] px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-xl font-semibold text-white">
            Three steps. No rate-limit management required.
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="flex flex-col gap-4">
              <div className="text-5xl font-bold text-white/[0.06]">01</div>
              <h3 className="font-semibold text-white">Submit your list</h3>
              <p className="text-sm leading-relaxed text-[#7A8FAD]">
                POST a JSON array of up to 500 UK company numbers. You get a <code className="text-[#E8F0FE]">batch_id</code> back instantly — the job is queued and processing begins immediately.
              </p>
              <pre className="overflow-x-auto rounded-lg bg-[#0A1628] px-4 py-3 font-[family-name:var(--font-geist-mono)] text-xs leading-relaxed text-[#7A8FAD]">
{`POST /v1/batch
{
  "company_numbers": [
    "00445790",
    "03547512",
    ...499 more
  ]
}`}
              </pre>
            </div>

            <div className="flex flex-col gap-4">
              <div className="text-5xl font-bold text-white/[0.06]">02</div>
              <h3 className="font-semibold text-white">We handle the rate limiting</h3>
              <p className="text-sm leading-relaxed text-[#7A8FAD]">
                Our processor runs every 10 seconds, enriching companies in batches and automatically pausing when the shared Companies House budget is near its limit. You do nothing.
              </p>
              <div className="rounded-lg border border-[#22D3A0]/20 bg-[#22D3A0]/[0.06] p-4 text-xs text-[#7A8FAD]">
                <p className="font-medium text-[#22D3A0]">What we manage for you</p>
                <ul className="mt-2 space-y-1">
                  <li>• CH 600 req / 5 min rate limit</li>
                  <li>• Cache hits returned instantly (no CH call)</li>
                  <li>• Quota exhaustion → clean <code>quota_exceeded</code> status</li>
                  <li>• Invalid numbers → per-item error, rest still complete</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="text-5xl font-bold text-white/[0.06]">03</div>
              <h3 className="font-semibold text-white">Poll for results</h3>
              <p className="text-sm leading-relaxed text-[#7A8FAD]">
                GET the job status every few seconds. Results accumulate as companies are processed. Polling is always free — it never consumes credits. Results are kept for 7 days.
              </p>
              <pre className="overflow-x-auto rounded-lg bg-[#0A1628] px-4 py-3 font-[family-name:var(--font-geist-mono)] text-xs leading-relaxed text-[#7A8FAD]">
{`GET /v1/batch/{batch_id}

{
  "status": "complete",
  "completed": 500,
  "results": [...],
  "errors": {}
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Rate limit callout */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl border border-[#4F7BFF]/20 bg-[#4F7BFF]/[0.06] p-8">
            <h2 className="mb-3 text-xl font-semibold text-white">
              The Companies House rate limit problem — solved
            </h2>
            <p className="text-[#7A8FAD]">
              The Companies House API allows 600 requests every 5 minutes per account — roughly 2 companies per second.
              If you need to enrich a list of 500 companies, you&apos;re looking at 4+ minutes of careful rate management just to avoid 429 errors.
            </p>
            <p className="mt-4 text-[#7A8FAD]">
              With the Registrum batch API, you submit the list once and walk away. Our cache layer means many companies return instantly without touching Companies House at all. The rest are fetched at the correct pace, automatically. A 500-company batch typically completes in 30 seconds to 3 minutes depending on cache hit rate.
            </p>
          </div>
        </div>
      </section>

      {/* Who is this for */}
      <section className="border-y border-white/[0.06] bg-white/[0.02] px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-xl font-semibold text-white">Who uses batch enrichment</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "Lead generation agencies",
                body: "Upload your prospect list overnight. Wake up to 500 enriched company profiles — financials, director names, accounts status — ready for your CRM.",
              },
              {
                title: "Compliance & KYB teams",
                body: "Screen large portfolios in a single API call. Get ownership chains, PSC data, and insolvency flags without writing any rate-limiting logic.",
              },
              {
                title: "Data pipelines & ETL",
                body: "Enrich Companies House data as part of a nightly job. The async model fits naturally into any pipeline that already polls for results.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-6"
              >
                <h3 className="mb-2 font-semibold text-white">{card.title}</h3>
                <p className="text-sm leading-relaxed text-[#7A8FAD]">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code example */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-xl font-semibold text-white">Complete working example</h2>

          <p className="mb-4 text-sm text-[#7A8FAD]">Submit a batch and poll until complete — in under 20 lines of Python:</p>

          <pre className="overflow-x-auto rounded-xl border border-white/[0.06] bg-[#0A1628] p-6 font-[family-name:var(--font-geist-mono)] text-xs leading-relaxed text-[#7A8FAD]">
{`import time, requests

API_KEY = "reg_live_..."
BASE    = "https://api.registrum.co.uk/v1"
HEADERS = {"X-API-Key": API_KEY}

company_numbers = ["00445790", "03547512", "SC123456"]  # up to 500

# 1. Submit
r = requests.post(f"{BASE}/batch",
    json={"company_numbers": company_numbers},
    headers=HEADERS)
batch_id = r.json()["batch_id"]
print(f"Queued: {batch_id}")

# 2. Poll until done
while True:
    r = requests.get(f"{BASE}/batch/{batch_id}", headers=HEADERS)
    job = r.json()
    print(f"{job['status']} — {job['completed_companies']}/{job['total_companies']}")
    if job["status"] in ("complete", "partial", "failed", "quota_exceeded"):
        break
    time.sleep(5)

# 3. Use results
for item in job["results"]:
    print(item["company_number"], item["data"]["company_name"])
for number, error in job["errors"].items():
    print(number, "ERROR:", error)`}
          </pre>

          <p className="mt-4 text-xs text-[#3D5275]">
            Polling the GET endpoint is always free — it does not consume API credits.
            Credits are charged per company processed (1 credit each).
          </p>
        </div>
      </section>

      {/* Status reference */}
      <section className="border-y border-white/[0.06] bg-white/[0.02] px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-xl font-semibold text-white">Job status reference</h2>
          <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                  <th className="px-5 py-3.5 font-medium text-white">Status</th>
                  <th className="px-5 py-3.5 font-medium text-white">Meaning</th>
                  <th className="px-5 py-3.5 font-medium text-white">Terminal?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-[#7A8FAD]">
                {[
                  ["queued", "Job accepted, waiting to start", "No"],
                  ["processing", "Actively enriching companies", "No"],
                  ["complete", "All companies enriched successfully", "Yes"],
                  ["partial", "Finished — some successes, some errors (see errors field)", "Yes"],
                  ["quota_exceeded", "Monthly credit limit hit mid-batch; remaining companies in errors", "Yes"],
                  ["failed", "All companies errored (upstream issue)", "Yes"],
                ].map(([status, meaning, terminal]) => (
                  <tr key={status} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-3.5 font-[family-name:var(--font-geist-mono)] text-xs text-[#E8F0FE]">
                      {status}
                    </td>
                    <td className="px-5 py-3.5 text-xs">{meaning}</td>
                    <td className="px-5 py-3.5 text-xs">
                      <span className={terminal === "Yes"
                        ? "rounded-full border border-[#22D3A0]/20 bg-[#22D3A0]/10 px-2 py-0.5 text-xs text-[#22D3A0]"
                        : "rounded-full border border-white/[0.06] px-2 py-0.5 text-xs text-[#3D5275]"
                      }>
                        {terminal}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold text-white">
            Start enriching in minutes
          </h2>
          <p className="mt-3 text-[#7A8FAD]">
            Batch enrichment is available on all plans — quota-limited by your monthly allowance.
            Free gives 5 lookups/day. Web gives 500/month. Pro gives 4,000/month for production workloads.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/#get-key"
              className="rounded-md bg-[#4F7BFF] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#6B93FF]"
            >
              Get free API key →
            </Link>
            <Link
              href="/#pricing"
              className="rounded-md border border-white/10 px-5 py-2.5 text-sm font-medium text-[#E8F0FE] transition-colors hover:border-white/20 hover:bg-white/5"
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>
      <PageFeedback pageUrl="/bulk-enrichment" />
    </div>
  );
}
