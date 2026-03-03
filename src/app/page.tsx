import type { ReactNode } from "react";
import KeySignupForm from "@/components/KeySignupForm";
import Demo from "@/components/Demo";
import Link from "next/link";
import CheckoutButton from "@/components/CheckoutButton";

export default function Home() {
  return (
    <div className="overflow-x-hidden bg-[#060D1B] text-[#E8F0FE] font-[family-name:var(--font-geist-sans)]">
      <Nav />
      <Hero />
      <DemoSection />
      <Features />
      <EnrichmentTeaser />
      <HowItWorks />
      <StarterKits />
      <Pricing />
      <CtaBand />
      <Footer />
    </div>
  );
}

/* ─── Nav ─────────────────────────────────────────────────────────────────── */

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#060D1B]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <span className="text-lg font-semibold tracking-tight text-white">
          Registrum
        </span>
        <nav className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/quickstart"
            className="hidden text-sm text-[#7A8FAD] transition-colors hover:text-white sm:block"
          >
            Quickstart
          </Link>
          <a
            href="https://api.registrum.co.uk/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-sm text-[#7A8FAD] transition-colors hover:text-white sm:block"
          >
            Docs
          </a>
          <Link
            href="/use-cases"
            className="hidden text-sm text-[#7A8FAD] transition-colors hover:text-white sm:block"
          >
            Use Cases
          </Link>
          <Link
            href="/integrations"
            className="hidden text-sm text-[#7A8FAD] transition-colors hover:text-white sm:block"
          >
            Integrations
          </Link>
          <a
            href="#pricing"
            className="hidden text-sm text-[#7A8FAD] transition-colors hover:text-white sm:block"
          >
            Pricing
          </a>
          <a
            href="#get-key"
            className="rounded-md bg-[#4F7BFF] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6B93FF]"
          >
            Get API Key
          </a>
        </nav>
      </div>
    </header>
  );
}

/* ─── Hero ────────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-24 sm:pb-32 sm:pt-32">
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-[#4F7BFF] opacity-[0.07] blur-[120px]"
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Live badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#22D3A0]/30 bg-[#22D3A0]/10 px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22D3A0] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22D3A0]" />
          </span>
          <span className="text-xs font-medium text-[#22D3A0]">API Live</span>
        </div>

        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          {/* Left: copy */}
          <div>
            <h1 className="text-4xl font-semibold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-6xl">
              The dependable
              <br />
              Companies House API.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#7A8FAD]">
              Structured financials, director networks, and intelligent caching
              on top of Companies House. Stop wrestling with iXBRL and rate
              limits — get clean JSON in one call.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#get-key"
                className="rounded-md bg-[#4F7BFF] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#6B93FF]"
              >
                Get free API key →
              </a>
              <a
                href="https://api.registrum.co.uk/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-white/10 px-5 py-2.5 text-sm font-medium text-[#E8F0FE] transition-colors hover:border-white/20 hover:bg-white/5"
              >
                View documentation
              </a>
            </div>

            {/* Stats */}
            <div className="mt-12 flex gap-8 border-t border-white/[0.06] pt-8">
              {[
                { value: "24h", label: "Company cache" },
                { value: "7d", label: "Financials cache" },
                { value: "50", label: "Free calls/month" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-semibold text-white">
                    {stat.value}
                  </div>
                  <div className="mt-0.5 text-xs text-[#7A8FAD]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: code block */}
          <div className="min-w-0 rounded-xl border border-white/[0.08] bg-[#0A1628] p-1">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
              <div className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
              <div className="h-3 w-3 rounded-full bg-[#28C840]" />
              <span className="ml-2 text-xs text-[#3D5275]">terminal</span>
            </div>
            <div className="overflow-x-auto rounded-lg bg-[#060D1B] px-5 py-5 font-[family-name:var(--font-geist-mono)] text-sm leading-relaxed">
              <p className="text-[#3D5275]"># Request</p>
              <p className="mt-1 text-[#7A8FAD]">
                curl -H{" "}
                <span className="text-[#22D3A0]">
                  &quot;X-API-Key: rg_live_...&quot;
                </span>{" "}
                \
              </p>
              <p className="text-[#7A8FAD]">
                &nbsp;&nbsp;
                <span className="text-[#E8F0FE]">
                  &quot;https://api.registrum.co.uk/v1/company/00445790&quot;
                </span>
              </p>
              <p className="mt-4 text-[#3D5275]"># Response</p>
              <p className="mt-1 text-[#7A8FAD]">{"{"}</p>
              <p className="pl-4">
                <span className="text-[#4F7BFF]">&quot;company_name&quot;</span>
                <span className="text-[#7A8FAD]">: </span>
                <span className="text-[#22D3A0]">&quot;TESCO PLC&quot;</span>
                <span className="text-[#7A8FAD]">,</span>
              </p>
              <p className="pl-4">
                <span className="text-[#4F7BFF]">
                  &quot;company_age_years&quot;
                </span>
                <span className="text-[#7A8FAD]">: </span>
                <span className="text-[#F97316]">104</span>
                <span className="text-[#7A8FAD]">,</span>
              </p>
              <p className="pl-4">
                <span className="text-[#4F7BFF]">&quot;turnover&quot;</span>
                <span className="text-[#7A8FAD]">: </span>
                <span className="text-[#F97316]">68190000000</span>
                <span className="text-[#7A8FAD]">,</span>
              </p>
              <p className="pl-4">
                <span className="text-[#4F7BFF]">
                  &quot;accounts_overdue&quot;
                </span>
                <span className="text-[#7A8FAD]">: </span>
                <span className="text-[#F97316]">false</span>
                <span className="text-[#7A8FAD]">,</span>
              </p>
              <p className="pl-4">
                <span className="text-[#4F7BFF]">
                  &quot;credits_remaining&quot;
                </span>
                <span className="text-[#7A8FAD]">: </span>
                <span className="text-[#F97316]">49</span>
              </p>
              <p className="text-[#7A8FAD]">{"}"}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Demo ────────────────────────────────────────────────────────────────── */

function DemoSection() {
  return (
    <section className="border-y border-white/[0.06] bg-white/[0.02] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Try it now
          </h2>
          <p className="mt-4 text-[#7A8FAD]">
            Search any UK company. Click a result to see the enriched profile.
          </p>
        </div>
        <Demo />
      </div>
    </section>
  );
}

/* ─── Features ────────────────────────────────────────────────────────────── */

interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
  tag: string;
  link?: string;
  linkLabel?: string;
}

const features: Feature[] = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Structured Financials",
    description:
      "iXBRL filings parsed into clean JSON — turnover, net assets, profit/loss, employees. Current and prior year. All values in actual GBP. Explicit data_quality metadata explains exactly what's available and why.",
    tag: "7-day cache",
    link: "/financials-example",
    linkLabel: "See Tesco example →",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
    title: "Director Networks",
    description:
      "One endpoint traverses the full board network to 2 degrees. Returns all companies sharing directors, sorted by connection strength. Discover related entities that aren't obvious from a single filing.",
    tag: "24h cache",
    link: "/directors-example",
    linkLabel: "See Tesco network →",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    ),
    title: "Intelligent Caching",
    description:
      "24h company profiles, 7-day financials. Stale-while-revalidate during CH outages — you get data even when Companies House is down. Never hit the 600-request rate limit again.",
    tag: "Circuit breaker",
    link: "/caching",
    linkLabel: "How it works →",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
    title: "Fuzzy Company Search",
    description:
      "Name-to-number matching with optional enriched profiles on results. Pass enrich=true to return full company profiles in a single call — no second round-trip required.",
    tag: "1h cache",
    link: "https://api.registrum.co.uk/docs#/Search/search_companies_v1_search_get",
    linkLabel: "Search API docs →",
  },
];

function Features() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Everything the raw API is missing
          </h2>
          <p className="mt-4 text-[#7A8FAD]">
            Built on top of the free Companies House API. We handle the hard
            parts.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-xl border border-white/[0.06] bg-white/[0.03] p-6 transition-colors hover:border-white/[0.12] hover:bg-white/[0.05]"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="rounded-lg border border-[#4F7BFF]/20 bg-[#4F7BFF]/10 p-2 text-[#4F7BFF]">
                  {f.icon}
                </div>
                <span className="rounded-full border border-white/[0.06] px-2.5 py-1 text-xs text-[#3D5275]">
                  {f.tag}
                </span>
              </div>
              <h3 className="mb-2 font-semibold text-white">{f.title}</h3>
              <p className="text-sm leading-relaxed text-[#7A8FAD]">
                {f.description}
              </p>
              {f.link && f.linkLabel && (
                f.link.startsWith("http") ? (
                  <a href={f.link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs text-[#4F7BFF] hover:underline">
                    {f.linkLabel}
                  </a>
                ) : (
                  <Link href={f.link} className="mt-3 inline-block text-xs text-[#4F7BFF] hover:underline">
                    {f.linkLabel}
                  </Link>
                )
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ────────────────────────────────────────────────────────── */

function HowItWorks() {
  return (
    <section className="border-y border-white/[0.06] bg-white/[0.02] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Integration in 10 minutes
          </h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {[
            {
              step: "01",
              title: "Get your API key",
              description:
                "Enter your email below. Your free key arrives instantly — no credit card, no forms.",
              code: "# 50 free calls per month\nX-API-Key: rg_live_...",
            },
            {
              step: "02",
              title: "Make your first call",
              description:
                "Pass the API key in the header. Any HTTP client works — curl, Python, Node, whatever you use.",
              code: 'curl -H "X-API-Key: rg_live_..." \\\n  ".../v1/company/00445790"',
            },
            {
              step: "03",
              title: "Get clean, structured data",
              description:
                "JSON back in milliseconds. Cached, enriched, with explicit metadata about what's available.",
              code: '{\n  "company_name": "TESCO PLC",\n  "turnover": 68190000000\n}',
            },
          ].map((item) => (
            <div key={item.step} className="flex flex-col gap-4">
              <div className="text-5xl font-bold text-white/[0.06]">
                {item.step}
              </div>
              <h3 className="font-semibold text-white">{item.title}</h3>
              <p className="text-sm leading-relaxed text-[#7A8FAD]">
                {item.description}
              </p>
              <pre className="mt-2 overflow-x-auto rounded-lg bg-[#0A1628] px-4 py-3 font-[family-name:var(--font-geist-mono)] text-xs leading-relaxed text-[#7A8FAD]">
                {item.code}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Starter Kits ────────────────────────────────────────────────────────── */

const starterKits = [
  {
    lang: "Python",
    githubUrl: "https://github.com/vdmeu/registrum-python",
    code: `import requests

res = requests.get(
    "https://api.registrum.co.uk/v1/company/00445790",
    headers={"X-API-Key": "rg_live_..."},
)
print(res.json())`,
  },
  {
    lang: "Node.js",
    githubUrl: "https://github.com/vdmeu/registrum-node",
    code: `const res = await fetch(
  "https://api.registrum.co.uk/v1/company/00445790",
  { headers: { "X-API-Key": "rg_live_..." } }
);
const data = await res.json();
console.log(data);`,
  },
  {
    lang: "cURL",
    githubUrl: null,
    code: `curl -H "X-API-Key: rg_live_..." \\
  "https://api.registrum.co.uk/v1/company/00445790"`,
  },
];

function StarterKits() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Start building in 5 lines
          </h2>
          <p className="mt-4 text-[#7A8FAD]">
            Copy-paste examples for the languages you already use.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {starterKits.map((kit) => (
            <div
              key={kit.lang}
              className="flex flex-col rounded-xl border border-white/[0.06] bg-[#0A1628]"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                <span className="text-sm font-medium text-white">{kit.lang}</span>
                {kit.githubUrl && (
                  <a
                    href={kit.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-[#3D5275] hover:text-[#7A8FAD]"
                  >
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
                      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                    </svg>
                    GitHub
                  </a>
                )}
              </div>
              <pre className="flex-1 overflow-x-auto px-4 py-4 font-[family-name:var(--font-geist-mono)] text-xs leading-relaxed text-[#7A8FAD]">
                {kit.code}
              </pre>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/quickstart"
            className="text-sm text-[#4F7BFF] hover:underline"
          >
            Full quickstart guide with response examples →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Beta Coupon ──────────────────────────────────────────────────────────── */

function BetaCoupon() {
  return (
    <div className="mb-8 rounded-lg border border-[#22D3A0]/20 bg-[#22D3A0]/5 px-5 py-4">
      <p className="text-sm text-[#22D3A0]">
        <span className="font-semibold">Beta access —</span> use code{" "}
        <span className="rounded bg-[#22D3A0]/15 px-1.5 py-0.5 font-[family-name:var(--font-geist-mono)] font-medium">
          BETA3
        </span>{" "}
        at checkout for 3 months free on Pro. First 20 sign-ups only.
      </p>
    </div>
  );
}

/* ─── Pricing ─────────────────────────────────────────────────────────────── */

const plans = [
  {
    name: "Free",
    price: "£0",
    period: "forever",
    calls: "50 calls / month",
    burst: "2 / min",
    highlight: false,
    cta: "Get started",
    features: ["All endpoints", "Financials + networks", "JSON responses", "Email support"],
  },
  {
    name: "Pro",
    price: "£49",
    period: "per month",
    calls: "2,000 calls / month",
    burst: "30 / min",
    highlight: true,
    cta: "Get started",
    features: ["Everything in Free", "40× the quota", "High burst rate", "SLA uptime commitment"],
  },
  {
    name: "Enterprise",
    price: "£149",
    period: "per month",
    calls: "10,000 calls / month",
    burst: "60 / min",
    highlight: false,
    cta: "Contact us",
    features: ["Everything in Pro", "5× the quota", "Custom integrations", "Dedicated support"],
  },
];

function Pricing() {
  return (
    <section id="pricing" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-[#7A8FAD]">
            No setup fees. No hidden costs. Upgrade or cancel any time.
          </p>
        </div>

        <BetaCoupon />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-xl border p-6 ${
                plan.highlight
                  ? "border-[#4F7BFF]/50 bg-[#4F7BFF]/10"
                  : "border-white/[0.06] bg-white/[0.03]"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#4F7BFF] px-3 py-1 text-xs font-medium text-white">
                  Most popular
                </div>
              )}
              <div className="mb-6">
                <div className="text-sm font-medium text-[#7A8FAD]">
                  {plan.name}
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-semibold text-white">
                    {plan.price}
                  </span>
                  <span className="text-sm text-[#3D5275]">/{plan.period}</span>
                </div>
                <div className="mt-3 text-sm font-medium text-[#E8F0FE]">
                  {plan.calls}
                </div>
                <div className="text-xs text-[#3D5275]">Burst: {plan.burst}</div>
              </div>

              <ul className="mb-6 flex flex-col gap-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[#7A8FAD]">
                    <svg className="h-3.5 w-3.5 shrink-0 text-[#22D3A0]" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              {plan.name === "Pro" ? (
                <CheckoutButton
                  className={`mt-auto w-full rounded-md py-2 text-center text-sm font-medium transition-colors bg-[#4F7BFF] text-white hover:bg-[#6B93FF]`}
                >
                  {plan.cta}
                </CheckoutButton>
              ) : (
                <a
                  href={plan.name === "Enterprise" ? "mailto:api@registrum.co.uk" : "#get-key"}
                  className={`mt-auto rounded-md py-2 text-center text-sm font-medium transition-colors ${
                    plan.highlight
                      ? "bg-[#4F7BFF] text-white hover:bg-[#6B93FF]"
                      : "border border-white/10 text-[#E8F0FE] hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  {plan.cta}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Enrichment Teaser ───────────────────────────────────────────────────── */

const ENRICHMENT_HIGHLIGHTS = [
  { label: "company_age_years", note: "Computed", color: "#4F7BFF", bg: "rgba(79,123,255,0.10)" },
  { label: "accounts.overdue", note: "Computed", color: "#4F7BFF", bg: "rgba(79,123,255,0.10)" },
  { label: "financials.turnover", note: "+new", color: "#22D3A0", bg: "rgba(34,211,160,0.08)" },
  { label: "financials.net_assets", note: "+new", color: "#22D3A0", bg: "rgba(34,211,160,0.08)" },
  { label: "financials.employees", note: "+new", color: "#22D3A0", bg: "rgba(34,211,160,0.08)" },
  { label: "network.companies", note: "+new", color: "#22D3A0", bg: "rgba(34,211,160,0.08)" },
  { label: "data_quality.completeness", note: "+new", color: "#7A8FAD", bg: "rgba(255,255,255,0.06)" },
  { label: "cached · credits_remaining", note: "infra", color: "#7A8FAD", bg: "rgba(255,255,255,0.06)" },
];

function EnrichmentTeaser() {
  return (
    <section className="border-y border-white/[0.06] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left: copy */}
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#22D3A0]/20 bg-[#22D3A0]/5 px-3 py-1 text-xs font-medium text-[#22D3A0]">
              Beyond Companies House
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              What you get that you can&apos;t get directly
            </h2>
            <p className="mt-4 text-[#7A8FAD]">
              The raw Companies House API returns about 10 fields. A Registrum response returns
              over 28 — with financial data, computed fields, and infrastructure built in.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-[#4F7BFF]/20 bg-[#4F7BFF]/10 px-3 py-1 text-xs text-[#4F7BFF]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4F7BFF]" />
                Computed field
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-[#22D3A0]/20 bg-[#22D3A0]/10 px-3 py-1 text-xs text-[#22D3A0]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22D3A0]" />
                New field (not in CH API)
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.04] px-3 py-1 text-xs text-[#7A8FAD]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#7A8FAD]" />
                Infrastructure
              </span>
            </div>
            <div className="mt-6">
              <Link
                href="/vs-companies-house"
                className="text-sm text-[#4F7BFF] hover:underline"
              >
                See the full field-by-field comparison →
              </Link>
            </div>
          </div>

          {/* Right: animated field chips */}
          <div className="rounded-xl border border-white/[0.08] bg-[#0A1628] p-6">
            <div className="mb-3 text-xs text-[#3D5275]">Registrum response fields — example</div>
            <div className="flex flex-wrap gap-2">
              {/* Standard CH fields (muted) */}
              {["company_name", "company_number", "company_status", "date_of_creation", "sic_codes"].map((f) => (
                <span
                  key={f}
                  className="rounded border border-white/[0.06] px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-xs text-[#3D5275]"
                >
                  {f}
                </span>
              ))}
              {/* Enriched / new fields */}
              {ENRICHMENT_HIGHLIGHTS.map((f) => (
                <span
                  key={f.label}
                  className="rounded border px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-xs"
                  style={{
                    color: f.color,
                    background: f.bg,
                    borderColor: `${f.color}30`,
                  }}
                >
                  {f.label}
                  <span className="ml-1.5 opacity-60">{f.note}</span>
                </span>
              ))}
            </div>
            <div className="mt-5 border-t border-white/[0.06] pt-4 text-xs text-[#3D5275]">
              5 standard fields (grey) · 8+ enriched/new fields (highlighted)
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── CTA Band ─────────────────────────────────────────────────────────────── */

function CtaBand() {
  return (
    <section
      id="get-key"
      className="border-y border-white/[0.06] bg-white/[0.02] px-6 py-24"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Get your free API key
        </h2>
        <p className="mt-4 text-[#7A8FAD]">
          50 free calls per month. Your key arrives in your inbox in seconds.
          No credit card required.
        </p>
        <KeySignupForm />
        <p className="mt-4 text-xs text-[#3D5275]">
          By signing up you agree to our{" "}
          <a href="/terms" className="underline underline-offset-2 hover:text-[#7A8FAD]">
            terms of service
          </a>
          .
        </p>
      </div>
    </section>
  );
}

/* ─── Footer ──────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-white">Registrum</div>
            <p className="mt-2 max-w-xs text-xs leading-relaxed text-[#3D5275]">
              Eugene Merwe-Chartier trading as Registrum. Data sourced under
              the{" "}
              <a
                href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-[#7A8FAD]"
              >
                Open Government Licence v3.0
              </a>
              .
            </p>
          </div>

          <div className="flex flex-wrap gap-x-10 gap-y-4 text-xs text-[#3D5275]">
            <div className="flex flex-col gap-2">
              <span className="font-medium text-[#7A8FAD]">Product</span>
              <a href="https://api.registrum.co.uk/docs" target="_blank" rel="noopener noreferrer" className="hover:text-white">Documentation</a>
              <a href="#pricing" className="hover:text-white">Pricing</a>
              <Link href="/use-cases" className="hover:text-white">Use Cases</Link>
              <Link href="/integrations" className="hover:text-white">Integrations</Link>
              <a href="https://status.registrum.co.uk" target="_blank" rel="noopener noreferrer" className="hover:text-white">API Status</a>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-medium text-[#7A8FAD]">Contact</span>
              <a href="mailto:api@registrum.co.uk" className="hover:text-white">api@registrum.co.uk</a>
              <a href="mailto:support@registrum.co.uk" className="hover:text-white">support@registrum.co.uk</a>
              <a href="mailto:billing@registrum.co.uk" className="hover:text-white">billing@registrum.co.uk</a>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-medium text-[#7A8FAD]">Legal</span>
              <a href="/terms" className="hover:text-white">Terms of Service</a>
              <a href="/privacy" className="hover:text-white">Privacy Policy</a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/[0.06] pt-6 text-xs text-[#3D5275]">
          © {new Date().getFullYear()} Registrum. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
