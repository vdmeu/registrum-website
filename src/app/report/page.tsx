"use client";

import { useState } from "react";
import Link from "next/link";

export default function ReportPage() {
  const [companyNumber, setCompanyNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const cn = companyNumber.trim();
    if (!cn) { setError("Enter a company number"); return; }
    if (!email.trim()) { setError("Enter your email address"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/report/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_number: cn, email: email.trim() }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#060D1B] text-[#E8F0FE] font-[family-name:var(--font-geist-sans)]">
      {/* Nav */}
      <header className="border-b border-white/[0.06] bg-[#060D1B]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight text-white">
            Registrum
          </Link>
          <Link href="/search" className="text-sm text-[#7A8FAD] hover:text-white">
            Search
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        {/* Hero */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 text-sm font-medium text-[#4F7BFF]">Pay once &middot; No account &middot; Instant delivery</p>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            UK Company Intelligence Report
          </h1>
          <p className="mt-5 text-lg text-[#7A8FAD] leading-relaxed">
            Director history, PSC ownership chain, filing compliance, risk flags,
            and a plain-English verdict from Claude. Delivered to your inbox in under 60 seconds.
          </p>
          <p className="mt-3 text-3xl font-bold text-white">
            £19.99 <span className="text-base font-normal text-[#7A8FAD]">per report</span>
          </p>
        </div>

        {/* Form */}
        <div className="mx-auto mt-12 max-w-lg rounded-xl border border-white/[0.08] bg-[#0A1628] p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="company_number" className="block text-sm font-medium text-white mb-2">
                Companies House number
              </label>
              <input
                id="company_number"
                type="text"
                placeholder="e.g. 00445790"
                value={companyNumber}
                onChange={(e) => setCompanyNumber(e.target.value)}
                className="w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-white placeholder-[#3D5275] focus:border-[#4F7BFF] focus:outline-none focus:ring-1 focus:ring-[#4F7BFF] font-mono"
                disabled={loading}
              />
              <p className="mt-1.5 text-xs text-[#3D5275]">
                Find it at{" "}
                <a
                  href="https://find-and-update.company-information.service.gov.uk"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#4F7BFF] hover:underline"
                >
                  Companies House
                </a>
              </p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-white placeholder-[#3D5275] focus:border-[#4F7BFF] focus:outline-none focus:ring-1 focus:ring-[#4F7BFF]"
                disabled={loading}
              />
              <p className="mt-1.5 text-xs text-[#3D5275]">
                Report delivered here within 60 seconds of payment.
              </p>
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#4F7BFF] py-3.5 text-base font-semibold text-white hover:bg-[#6B93FF] disabled:opacity-60 transition-colors"
            >
              {loading ? "Redirecting to payment…" : "Get Report — £19.99"}
            </button>

            <p className="text-center text-xs text-[#3D5275]">
              Secure payment via Stripe. VAT included.
            </p>
          </form>
        </div>

        {/* What's included */}
        <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6"
            >
              <div className="mb-3 text-2xl">{f.icon}</div>
              <h3 className="font-semibold text-white">{f.title}</h3>
              <p className="mt-1.5 text-sm text-[#7A8FAD] leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>

        {/* Who is this for */}
        <div className="mt-20 rounded-xl border border-white/[0.06] bg-white/[0.02] px-8 py-10">
          <h2 className="text-xl font-semibold text-white mb-6">Who pays for this?</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {USE_CASES.map((u) => (
              <div key={u.role} className="flex gap-3">
                <span className="mt-0.5 text-[#4F7BFF] shrink-0">&#10003;</span>
                <div>
                  <p className="text-sm font-medium text-white">{u.role}</p>
                  <p className="text-sm text-[#7A8FAD]">{u.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison */}
        <div className="mt-12 rounded-xl border border-white/[0.06] bg-white/[0.02] px-8 py-8">
          <h2 className="text-xl font-semibold text-white mb-6">vs. the alternatives</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="pb-3 text-left font-medium text-[#7A8FAD]">Option</th>
                <th className="pb-3 text-right font-medium text-[#7A8FAD]">Cost</th>
                <th className="pb-3 text-right font-medium text-[#7A8FAD]">Commitment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {COMPARISONS.map((c) => (
                <tr key={c.name}>
                  <td className={`py-3 ${c.highlight ? "text-[#4F7BFF] font-medium" : "text-white"}`}>{c.name}</td>
                  <td className="py-3 text-right text-[#7A8FAD]">{c.cost}</td>
                  <td className="py-3 text-right text-[#7A8FAD]">{c.commitment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FAQ */}
        <div className="mt-12 space-y-6">
          <h2 className="text-xl font-semibold text-white">Common questions</h2>
          {FAQ.map((q) => (
            <div key={q.q} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-6 py-5">
              <p className="font-medium text-white">{q.q}</p>
              <p className="mt-2 text-sm text-[#7A8FAD] leading-relaxed">{q.a}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="mt-24 border-t border-white/[0.06] py-8 text-center text-xs text-[#3D5275]">
        <p>Data sourced from Companies House under the Open Government Licence v3.0</p>
        <p className="mt-1">
          <Link href="/privacy" className="hover:text-white">Privacy</Link>
          {" · "}
          <Link href="/terms" className="hover:text-white">Terms</Link>
          {" · "}
          <a href="mailto:support@registrum.co.uk" className="hover:text-white">Support</a>
        </p>
      </footer>
    </div>
  );
}

const FEATURES = [
  {
    icon: "🏢",
    title: "Company profile",
    description:
      "Status, incorporation date, registered address, SIC codes, and age — everything from the official Companies House register.",
  },
  {
    icon: "⚠️",
    title: "Risk flags",
    description:
      "Overdue accounts, overdue confirmation statement, registered charges, insolvency history — instantly highlighted.",
  },
  {
    icon: "👥",
    title: "Director history",
    description:
      "Current and past directors with appointment dates and their other active appointments across Companies House.",
  },
  {
    icon: "🔗",
    title: "Ownership chain",
    description:
      "PSC beneficial ownership resolved to ultimate individuals or foreign entities, following the chain through corporate structures.",
  },
  {
    icon: "📊",
    title: "Financial summary",
    description:
      "Latest filed accounts — turnover, net assets, and cash position — where a digital filing exists at Companies House.",
  },
  {
    icon: "🤖",
    title: "AI verdict",
    description:
      "Plain-English assessment from Claude: who this company is, what the risk flags mean, and a clear LOW/MEDIUM/HIGH verdict.",
  },
];

const USE_CASES = [
  {
    role: "Startup founder",
    reason: "Vetting a supplier before signing a contract",
  },
  {
    role: "Freelancer",
    reason: "Checking a new client before starting work",
  },
  {
    role: "Accountant",
    reason: "Quick background check before onboarding a client",
  },
  {
    role: "Solicitor",
    reason: "Confirming company status before drafting",
  },
  {
    role: "Procurement manager",
    reason: "Supplier due diligence without a full KYB subscription",
  },
  {
    role: "Investor",
    reason: "Sanity check on a company before a meeting",
  },
];

const COMPARISONS = [
  { name: "Registrum — one report", cost: "£19.99", commitment: "None", highlight: true },
  { name: "Endole", cost: "£25–39/month", commitment: "Monthly subscription", highlight: false },
  { name: "Beauhurst", cost: "£500+/month", commitment: "Annual contract", highlight: false },
  {
    name: "Companies House (DIY)",
    cost: "Free",
    commitment: "Hours of manual work",
    highlight: false,
  },
];

const FAQ = [
  {
    q: "How long does it take?",
    a: "The report is delivered to your email within 60 seconds of payment completing. We pull live data from Companies House and run the AI analysis in parallel.",
  },
  {
    q: "What if the company doesn't exist or has no filings?",
    a: "We'll still send you a report with whatever is available from Companies House. If key sections (like financials) are unavailable, the report will say so clearly. You won't be charged more than £19.99 regardless.",
  },
  {
    q: "Is the data up to date?",
    a: "Yes. We query the Companies House API in real-time for every report. Some data points (like financials) are served from a short cache to stay within rate limits, but nothing is more than 7 days old.",
  },
  {
    q: "Can I buy multiple reports?",
    a: "Yes — just submit a separate order for each company number. If you need 10+ reports regularly, a Registrum API subscription will be more cost-effective.",
  },
  {
    q: "I need a VAT receipt.",
    a: "Stripe sends an automatic receipt to your email after payment. For a formal VAT invoice, email support@registrum.co.uk with your company details.",
  },
];
