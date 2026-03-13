import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Intelligent Caching · Registrum",
  description:
    "How Registrum caches Companies House data: 24h company profiles, 7-day financials, stale-while-revalidate during outages. Never hit the 600 req/5min rate limit again.",
};

export default function Caching() {
  return (
    <div className="min-h-screen bg-[#060D1B] text-[#E8F0FE] font-[family-name:var(--font-geist-sans)]">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#060D1B]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight text-white">
            Registrum
          </Link>
          <nav className="flex items-center gap-6">
            <a
              href="https://api.registrum.co.uk/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden text-sm text-[#7A8FAD] transition-colors hover:text-white sm:block"
            >
              Docs
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
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#22D3A0]/30 bg-[#22D3A0]/10 px-3 py-1.5 text-xs font-medium text-[#22D3A0]">
            Infrastructure
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Intelligent caching — built in
          </h1>
          <p className="mt-4 text-[#7A8FAD]">
            Every Registrum response is cached automatically. You never hit the Companies House rate limit.
            Even when CH goes down, your app keeps working.
          </p>
        </div>
      </section>

      {/* Request flow comparison */}
      <section className="border-y border-white/[0.06] bg-white/[0.02] px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-xl font-semibold text-white">
            The same request — two very different experiences
          </h2>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Without Registrum */}
            <div className="rounded-xl border border-white/[0.06] bg-[#060D1B] p-6">
              <div className="mb-6 text-center text-sm font-medium text-[#7A8FAD]">
                Direct Companies House API
              </div>
              <FlowDiagram variant="raw" />
              <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/[0.06] p-4 text-xs text-[#7A8FAD]">
                <p className="font-medium text-red-400">Pain points</p>
                <ul className="mt-2 space-y-1">
                  <li>• 600 req / 5 min hard cap — one busy feature can exhaust it</li>
                  <li>• CH outages propagate directly to your users</li>
                  <li>• Financial data: separate iXBRL download + parse</li>
                  <li>• No caching — every call is a fresh upstream request</li>
                </ul>
              </div>
            </div>

            {/* With Registrum */}
            <div className="rounded-xl border border-[#22D3A0]/20 bg-[#060D1B] p-6">
              <div className="mb-6 text-center text-sm font-medium text-[#22D3A0]">
                Via Registrum
              </div>
              <FlowDiagram variant="registrum" />
              <div className="mt-6 rounded-lg border border-[#22D3A0]/20 bg-[#22D3A0]/[0.06] p-4 text-xs text-[#7A8FAD]">
                <p className="font-medium text-[#22D3A0]">What you get</p>
                <ul className="mt-2 space-y-1">
                  <li>• Cache hit: ~8 ms response time</li>
                  <li>• CH outage: stale cache served, X-Data-Stale header set</li>
                  <li>• Financial data: already parsed, in the same response</li>
                  <li>• Circuit breaker: bad upstream trips automatically</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cache TTL table */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-xl font-semibold text-white">Cache TTLs by endpoint</h2>
          <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                  <th className="px-5 py-3.5 font-medium text-white">Endpoint</th>
                  <th className="px-5 py-3.5 font-medium text-white">TTL</th>
                  <th className="px-5 py-3.5 font-medium text-white">Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-[#7A8FAD]">
                {[
                  ["/v1/company/{number}", "24 hours", "Company status changes infrequently; directors, SIC, addresses are stable day-to-day"],
                  ["/v1/company/{number}/financials", "7 days", "Accounts are filed annually; iXBRL parsing is expensive — no point re-parsing daily"],
                  ["/v1/company/{number}/directors", "24 hours", "Appointment changes are filed within days; a 24h window is accurate enough"],
                  ["/v1/company/{number}/network", "24 hours", "Network derives from director data — same cadence"],
                  ["/v1/company/{number}/psc", "24 hours", "PSC register changes are filed within days; active/ceased split is stable at this cadence"],
                  ["/v1/company/{number}/psc/chain", "fresh per call", "Chain traverses multiple companies — result depends on live PSC state at each node. Not cached."],
                  ["/v1/search", "1 hour", "Company name/status changes rarely; search index updates are gradual"],
                ].map(([endpoint, ttl, rationale]) => (
                  <tr key={endpoint} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-3.5 font-[family-name:var(--font-geist-mono)] text-xs text-[#E8F0FE]">
                      {endpoint}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-full border border-[#22D3A0]/20 bg-[#22D3A0]/10 px-2.5 py-0.5 text-xs font-medium text-[#22D3A0]">
                        {ttl}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs">{rationale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Stale-while-revalidate + outage story */}
      <section className="border-y border-white/[0.06] bg-white/[0.02] px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-xl font-semibold text-white">What happens during a CH outage?</h2>
          <p className="mb-8 text-[#7A8FAD]">
            Companies House goes down several times a year — for maintenance, deployments, or unexpectedly.
            With a direct integration, that outage becomes your problem. With Registrum, it doesn&apos;t.
          </p>

          <OutageTimeline />

          <div className="mt-8 rounded-xl border border-white/[0.06] bg-[#0A1628] p-5 font-[family-name:var(--font-geist-mono)] text-xs leading-relaxed">
            <p className="text-[#3D5275]"># Response during CH outage (stale cache served)</p>
            <p className="mt-2 text-[#7A8FAD]">HTTP/1.1 <span className="text-[#22D3A0]">200 OK</span></p>
            <p className="text-[#7A8FAD]">X-Data-Stale: <span className="text-[#F97316]">true</span></p>
            <p className="text-[#7A8FAD]">X-Cache-Age: <span className="text-[#F97316]">14423</span></p>
            <p className="text-[#7A8FAD]">X-Request-Id: <span className="text-[#4F7BFF]">a3f1...</span></p>
            <p className="mt-2 text-[#7A8FAD]">{"{"}</p>
            <p className="pl-4 text-[#7A8FAD]">
              <span className="text-[#4F7BFF]">&quot;company_name&quot;</span>: <span className="text-[#22D3A0]">&quot;TESCO PLC&quot;</span>,
            </p>
            <p className="pl-4 text-[#7A8FAD]">
              <span className="text-[#4F7BFF]">&quot;cached&quot;</span>: <span className="text-[#F97316]">true</span>
            </p>
            <p className="text-[#7A8FAD]">{"}"}</p>
          </div>
          <p className="mt-3 text-xs text-[#3D5275]">
            Your app receives data. The <code>X-Data-Stale: true</code> header tells you it&apos;s from cache, so you can surface
            that transparently to your users if needed — or silently absorb it.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold text-white">
            Stop worrying about rate limits
          </h2>
          <p className="mt-3 text-[#7A8FAD]">
            The free tier gives you 50 calls/month with caching and circuit breaker included.
            No extra configuration required.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/#get-key"
              className="rounded-md bg-[#4F7BFF] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#6B93FF]"
            >
              Get free API key →
            </Link>
            <a
              href="https://api.registrum.co.uk/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-white/10 px-5 py-2.5 text-sm font-medium text-[#E8F0FE] transition-colors hover:border-white/20 hover:bg-white/5"
            >
              API documentation
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── Flow diagram component ──────────────────────────────────────────────── */

function FlowDiagram({ variant }: { variant: "raw" | "registrum" }) {
  if (variant === "raw") {
    return (
      <div className="space-y-3">
        <FlowStep label="Your app" color="neutral" note="Makes request" />
        <FlowArrow latency="~480 ms" warning />
        <FlowStep label="Companies House API" color="orange" note="600 req/5min limit" />
        <FlowArrow latency="parse iXBRL yourself" warning />
        <FlowStep label="Your app" color="neutral" note="Handles errors, rate limits" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <FlowStep label="Your app" color="neutral" note="Makes request" />
      <FlowArrow latency="~8 ms (cache hit)" />
      <FlowStep label="Registrum cache" color="green" note="Supabase · 24h TTL" />
      <div className="ml-4 border-l-2 border-dashed border-white/10 pl-4">
        <p className="mb-2 text-xs text-[#3D5275]">Cache miss only (first request, or after TTL):</p>
        <FlowArrow latency="~480 ms" faded />
        <div className="mt-1">
          <FlowStep label="Companies House API" color="muted" note="Buffered via circuit breaker" />
        </div>
      </div>
      <FlowStep label="Your app" color="green" note="Clean JSON · no parsing" />
    </div>
  );
}

function FlowStep({
  label,
  note,
  color,
}: {
  label: string;
  note: string;
  color: "neutral" | "green" | "orange" | "muted";
}) {
  const border =
    color === "green"
      ? "border-[#22D3A0]/30 bg-[#22D3A0]/10"
      : color === "orange"
      ? "border-[#F97316]/30 bg-[#F97316]/[0.08]"
      : color === "muted"
      ? "border-white/[0.06] bg-white/[0.02]"
      : "border-white/[0.08] bg-white/[0.04]";

  const textColor =
    color === "green"
      ? "text-[#22D3A0]"
      : color === "orange"
      ? "text-[#F97316]"
      : "text-[#E8F0FE]";

  return (
    <div className={`rounded-lg border px-4 py-3 ${border}`}>
      <div className={`text-sm font-medium ${textColor}`}>{label}</div>
      <div className="mt-0.5 text-xs text-[#3D5275]">{note}</div>
    </div>
  );
}

function FlowArrow({
  latency,
  warning = false,
  faded = false,
}: {
  latency: string;
  warning?: boolean;
  faded?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 px-2 ${faded ? "opacity-50" : ""}`}>
      <div className="flex flex-col items-center">
        <div className={`h-6 w-px ${warning ? "bg-[#F97316]/40" : "bg-[#22D3A0]/40"}`} />
        <svg
          viewBox="0 0 10 6"
          className={`h-2 w-2 ${warning ? "text-[#F97316]/60" : "text-[#22D3A0]/60"}`}
          fill="currentColor"
        >
          <path d="M5 6L0 0h10z" />
        </svg>
      </div>
      <span
        className={`text-xs ${
          warning ? "text-[#F97316]/70" : "text-[#22D3A0]/70"
        }`}
      >
        {latency}
      </span>
    </div>
  );
}

/* ─── Outage timeline ─────────────────────────────────────────────────────── */

function OutageTimeline() {
  const events = [
    {
      time: "T+0",
      label: "CH goes down",
      desc: "Companies House returns 5xx errors",
      color: "orange",
    },
    {
      time: "T+0",
      label: "Circuit breaker trips",
      desc: "Registrum detects upstream failure, stops forwarding requests",
      color: "blue",
    },
    {
      time: "T+0 → T+outage",
      label: "Stale cache served",
      desc: "All requests return cached data with X-Data-Stale: true header",
      color: "green",
    },
    {
      time: "T+recovery",
      label: "CH recovers",
      desc: "Circuit breaker resets. Cache refreshes on next request per endpoint TTL",
      color: "green",
    },
  ];

  return (
    <div className="relative space-y-0 pl-6">
      <div className="absolute left-2 top-2 bottom-2 w-px bg-white/[0.08]" />
      {events.map((e, i) => {
        const dotColor =
          e.color === "green"
            ? "bg-[#22D3A0]"
            : e.color === "orange"
            ? "bg-[#F97316]"
            : "bg-[#4F7BFF]";
        return (
          <div key={i} className="relative pb-6">
            <div
              className={`absolute -left-6 top-1.5 h-3 w-3 rounded-full ring-2 ring-[#060D1B] ${dotColor}`}
            />
            <div className="mb-0.5 text-xs font-medium text-[#3D5275]">{e.time}</div>
            <div className="text-sm font-medium text-white">{e.label}</div>
            <div className="mt-0.5 text-xs text-[#7A8FAD]">{e.desc}</div>
          </div>
        );
      })}
    </div>
  );
}
