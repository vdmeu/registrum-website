import type { Metadata } from "next";
import KeySignupForm from "@/components/KeySignupForm";
import PageFeedback from "@/app/components/PageFeedback";
import SiteNav from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "Companies House API Rate Limits — Avoid 429 Errors | Registrum",
  description:
    "The Companies House API allows 600 requests per 5 minutes. Learn how to stay under the limit — or use Registrum's cached API to never hit it.",
};

function Nav() {
  return (
    <SiteNav maxWidth="6xl" />
  );
}

export default function CompaniesHouseRateLimitPage() {
  return (
    <div className="min-h-screen bg-[#060D1B] text-[#E8F0FE] font-[family-name:var(--font-geist-sans)]">
      <Nav />

      <main>
        {/* Hero */}
        <section className="px-6 pb-16 pt-20">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#4F7BFF]/20 bg-[#4F7BFF]/10 px-3 py-1 text-xs font-medium text-[#4F7BFF]">
              Rate Limits
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Companies House API Rate Limits — and How to Never Hit Them
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-[#7A8FAD]">
              The Companies House API caps you at 600 requests per 5-minute window. Here is what
              that means in practice, why you keep hitting 429s, and how a caching layer eliminates
              the problem entirely.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="px-6 pb-20">
          <div className="mx-auto max-w-3xl space-y-10">

            <div>
              <h2 className="mb-3 text-xl font-semibold text-white">
                What is the actual rate limit?
              </h2>
              <p className="text-[#7A8FAD] leading-relaxed">
                Companies House enforces a limit of <strong className="text-[#E8F0FE]">600 requests per 5 minutes</strong> per
                API key. That works out to 2 requests per second on average. If you exceed this,
                the API returns an HTTP <strong className="text-[#E8F0FE]">429 Too Many Requests</strong> response and stops
                serving data until the window resets. There is no official burst allowance — the
                counter is a rolling window, not a fixed bucket, so sustained throughput matters
                more than short spikes.
              </p>
              <p className="mt-3 text-[#7A8FAD] leading-relaxed">
                The limit applies per key, not per IP. If you have multiple applications or
                services sharing one key, their usage is pooled. At 600 req/5 min, a batch job
                processing 1,000 companies would drain your entire allowance in under 9 minutes —
                and that assumes every call succeeds first time.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-white">
                What does a 429 response look like?
              </h2>
              <p className="text-[#7A8FAD] leading-relaxed">
                The Companies House API returns a plain <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">429</code> with
                no <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">Retry-After</code> header in most cases. You
                will not be told when the window resets. Your only option is to back off and retry
                after 5 minutes. In production systems without retry logic, a 429 usually manifests
                as a silent data gap — your app receives an error, logs it (or does not), and moves
                on, leaving you with incomplete records.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-white">
                Common causes of hitting the limit
              </h2>
              <ul className="space-y-3 text-[#7A8FAD] leading-relaxed">
                <li className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#4F7BFF]" />
                  <span>
                    <strong className="text-[#E8F0FE]">Bulk lookups.</strong> Enriching a CRM export or
                    screening a list of counterparties in one go. Even at modest scale — say, 200
                    companies — you will consume a third of your 5-minute budget in a single batch.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#4F7BFF]" />
                  <span>
                    <strong className="text-[#E8F0FE]">Polling for fresh data.</strong> If your application
                    re-fetches company records on every page load or request, you are burning quota
                    on data that almost certainly has not changed. Companies House records update
                    infrequently — most companies file once a year.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#4F7BFF]" />
                  <span>
                    <strong className="text-[#E8F0FE]">Multiple services sharing one key.</strong> A
                    backend API, a scheduled enrichment job, and an ad-hoc analyst script all hitting
                    Companies House under the same credential adds up fast.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#4F7BFF]" />
                  <span>
                    <strong className="text-[#E8F0FE]">Retry storms.</strong> Naive retry logic with no
                    exponential backoff turns a transient 429 into a cascade — every retry hits the
                    already-full window and generates another 429.
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-white">
                How caching eliminates the problem
              </h2>
              <p className="text-[#7A8FAD] leading-relaxed">
                The real solution is not smarter retry logic — it is not making the upstream call in
                the first place. Registrum sits between your application and Companies House,
                serving cached responses for the vast majority of requests. Company profiles are
                cached for 24 hours; financial data for 7 days. The underlying CH API is only called
                once per company per cache window, regardless of how many times your application
                requests the same company.
              </p>
              <p className="mt-3 text-[#7A8FAD] leading-relaxed">
                Every Registrum response includes an <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">X-Cache-Status</code> header
                so you can see exactly what happened. A value of <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">HIT</code> means
                the response came from cache and no CH API quota was consumed. <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">MISS</code> means
                Registrum fetched fresh data and cached it for subsequent callers. If the CH API is
                down or rate-limited, Registrum falls back to stale cache rather than returning an
                error — your application stays up.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-xl font-semibold text-white">
                Example: seeing the cache in action
              </h2>
              <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A1628]">
                <div className="border-b border-white/[0.06] px-4 py-2.5 text-xs text-[#3D5275]">
                  bash
                </div>
                <pre className="overflow-x-auto px-5 py-4 font-[family-name:var(--font-geist-mono)] text-sm leading-relaxed text-[#7A8FAD]">
{`# First call — fetches from Companies House, caches the result
curl -i -H "X-API-Key: reg_live_..." \\
  "https://api.registrum.co.uk/v1/company/00445790"

# Response headers include:
# X-Cache-Status: MISS
# X-Cache-TTL: 86400
# X-Request-ID: 7f3a9c...

# Second call to the same company — served from cache instantly
curl -i -H "X-API-Key: reg_live_..." \\
  "https://api.registrum.co.uk/v1/company/00445790"

# Response headers:
# X-Cache-Status: HIT
# X-Cache-TTL: 83147   (seconds remaining in cache window)
# X-Request-ID: 4e1b2d...`}
                </pre>
              </div>
              <p className="mt-3 text-sm text-[#3D5275]">
                A cache HIT consumes zero Companies House API quota. Your application can call the
                same endpoint thousands of times per day without touching the rate limit.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-white">
                Practical recommendations
              </h2>
              <p className="text-[#7A8FAD] leading-relaxed">
                If you are calling the Companies House API directly and need to stay within limits:
                implement exponential backoff with jitter on 429 responses, add a local in-memory
                cache for records fetched within the last hour, and split bulk jobs into batches
                of 100 with a 30-second pause between them. That keeps you under the rolling
                average without adding significant latency.
              </p>
              <p className="mt-3 text-[#7A8FAD] leading-relaxed">
                If you would rather not manage any of this, use Registrum. The caching, circuit
                breaking, and stale-fallback logic are built in. Your application calls one endpoint
                and gets a consistent response — no quota management required.
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
              50 free calls per month. No credit card required. Stop worrying about rate limits.
            </p>
            <KeySignupForm />
          </div>
        </section>
      <PageFeedback pageUrl="/companies-house-api-rate-limit" />
      </main>

      <footer className="border-t border-white/[0.06] px-6 py-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-[#3D5275]">
          © {new Date().getFullYear()} Registrum. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
