"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface SearchResult {
  company_number: string;
  company_name: string;
  company_status: string;
  registered_office_address?: {
    locality?: string;
    postal_code?: string;
  };
}

interface SelectedCompany {
  number: string;
  name: string;
}

export default function ReportPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selected, setSelected] = useState<SelectedCompany | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isRawNumber = (s: string) => /^\d{6,8}$/.test(s.trim());

  // Debounced search
  useEffect(() => {
    const q = query.trim();
    if (!q || isRawNumber(q) || q.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/report/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.items ?? []);
        setShowDropdown(true);
      } finally {
        setSearching(false);
      }
    }, 320);
    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function pickResult(r: SearchResult) {
    setSelected({ number: r.company_number, name: r.company_name });
    setQuery("");
    setResults([]);
    setShowDropdown(false);
    setError("");
  }

  function clearSelected() {
    setSelected(null);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    let companyNumber: string;
    if (selected) {
      companyNumber = selected.number;
    } else if (isRawNumber(query)) {
      companyNumber = query.trim().padStart(8, "0");
    } else {
      setError("Search for a company and select it from the list, or enter an 8-digit company number.");
      return;
    }

    if (!email.trim()) { setError("Enter your email address"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/report/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_number: companyNumber, email: email.trim() }),
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
      <header className="border-b border-white/[0.06] bg-[#060D1B]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight text-white">Registrum</Link>
          <div className="flex items-center gap-5">
            <Link href="/search" className="text-sm text-[#7A8FAD] hover:text-white">Search</Link>
            <Link href="/dashboard" className="text-sm text-[#7A8FAD] hover:text-white">Sign in</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        {/* Hero */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 text-sm font-medium text-[#4F7BFF]">Pay once &middot; No account &middot; Instant delivery</p>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Find out who you&apos;re dealing with before you sign
          </h1>
          <p className="mt-5 text-lg text-[#7A8FAD] leading-relaxed">
            One report. Director network, PSC ownership chain, risk flags, and a plain-English
            AI verdict - LOW, MEDIUM, or HIGH risk with a one-sentence recommendation.
            Delivered to your inbox in under 60 seconds.
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <p className="text-3xl font-bold text-white">
              £4.99 <span className="text-base font-normal text-[#7A8FAD]">per report</span>
            </p>
            <a
              href="/sample-report.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#4F7BFF] hover:underline"
            >
              View sample report →
            </a>
          </div>
        </div>

        {/* Form */}
        <div className="mx-auto mt-12 max-w-lg rounded-xl border border-white/[0.08] bg-[#0A1628] p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Company search */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Company name or number</label>

              {selected ? (
                <div className="flex items-center gap-3 rounded-lg border border-[#4F7BFF]/30 bg-[#4F7BFF]/8 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{selected.name}</p>
                    <p className="text-xs text-[#7A8FAD]">{selected.number}</p>
                  </div>
                  <button
                    type="button"
                    onClick={clearSelected}
                    className="shrink-0 text-xs text-[#7A8FAD] hover:text-white"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="e.g. Tesco or 00445790"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setError(""); }}
                    onFocus={() => results.length > 0 && setShowDropdown(true)}
                    className="w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-white placeholder-[#3D5275] focus:border-[#4F7BFF] focus:outline-none focus:ring-1 focus:ring-[#4F7BFF]"
                    disabled={loading}
                    autoComplete="off"
                  />
                  {searching && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#3D5275]">Searching…</span>
                  )}

                  {showDropdown && results.length > 0 && (
                    <div
                      ref={dropdownRef}
                      className="absolute z-50 mt-1 w-full rounded-xl border border-white/[0.08] bg-[#0A1628] shadow-xl overflow-hidden"
                    >
                      {results.map((r) => {
                        const addr = [r.registered_office_address?.locality, r.registered_office_address?.postal_code]
                          .filter(Boolean).join(", ");
                        return (
                          <button
                            key={r.company_number}
                            type="button"
                            onClick={() => pickResult(r)}
                            className="w-full text-left px-4 py-3 hover:bg-white/[0.05] border-b border-white/[0.04] last:border-0 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium text-white leading-tight">{r.company_name}</p>
                              <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded ${r.company_status === "active" ? "text-[#22D3A0]" : "text-[#3D5275]"}`}>
                                {r.company_status}
                              </span>
                            </div>
                            <p className="text-xs text-[#3D5275] mt-0.5">{r.company_number}{addr ? ` · ${addr}` : ""}</p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {!selected && (
                <p className="mt-1.5 text-xs text-[#3D5275]">
                  Type to search by name, or enter the 8-digit number from{" "}
                  <a href="https://find-and-update.company-information.service.gov.uk" target="_blank" rel="noreferrer" className="text-[#4F7BFF] hover:underline">
                    Companies House
                  </a>
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-white placeholder-[#3D5275] focus:border-[#4F7BFF] focus:outline-none focus:ring-1 focus:ring-[#4F7BFF]"
                disabled={loading}
              />
              <p className="mt-1.5 text-xs text-[#3D5275]">Report delivered here within 60 seconds of payment.</p>
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#4F7BFF] py-3.5 text-base font-semibold text-white hover:bg-[#6B93FF] disabled:opacity-60 transition-colors"
            >
              {loading ? "Redirecting to payment…" : "Get Report — £4.99"}
            </button>

            <p className="text-center text-xs text-[#3D5275]">Secure payment via Stripe. VAT included.</p>
          </form>
        </div>

        {/* Sample report CTA */}
        <div className="mx-auto mt-8 max-w-lg rounded-xl border border-white/[0.06] bg-white/[0.02] px-6 py-5 text-center">
          <p className="text-sm font-medium text-white mb-1">Not sure what you get?</p>
          <p className="text-sm text-[#7A8FAD] mb-3">See a full example report for Tesco PLC — the same format you receive.</p>
          <a
            href="/sample-report.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-md border border-white/10 px-5 py-2 text-sm font-medium text-[#E8F0FE] hover:border-white/20 hover:bg-white/5 transition-colors"
          >
            View sample report (Tesco PLC)
          </a>
        </div>

        {/* What's included */}
        <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
              <div className="mb-3 text-[#4F7BFF]">{f.icon}</div>
              <h3 className="font-semibold text-white">{f.title}</h3>
              <p className="mt-1.5 text-sm text-[#7A8FAD] leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>

        {/* Who is this for */}
        <div className="mt-20 rounded-xl border border-white/[0.06] bg-white/[0.02] px-8 py-10">
          <h2 className="text-xl font-semibold text-white mb-6">Who orders this?</h2>
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

        {/* vs alternatives */}
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
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
    title: "Company profile",
    description: "Status, incorporation date, registered address, SIC codes, and age — straight from the live Companies House register.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    title: "Risk flags",
    description: "Overdue accounts, overdue confirmation statement, registered charges, insolvency history — instantly surfaced.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    title: "Director network",
    description: "Interactive graph of current directors and all their other directorships — see hidden connections at a glance.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    ),
    title: "Ownership chain",
    description: "PSC beneficial ownership resolved through corporate structures to ultimate individuals or foreign entities.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Financial summary",
    description: "Turnover, net assets, and employee headcount from the latest filed accounts where a digital filing exists.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    title: "AI verdict",
    description: "Plain-English assessment from Claude — who this company is, what the flags mean, and a clear LOW/MEDIUM/HIGH risk verdict.",
  },
];

const USE_CASES = [
  { role: "Startup founder", reason: "Vetting a supplier before signing a contract" },
  { role: "Freelancer", reason: "Checking a new client before starting work" },
  { role: "Accountant", reason: "Quick background check before onboarding a client" },
  { role: "Solicitor", reason: "Confirming company status before drafting" },
  { role: "Procurement manager", reason: "Supplier due diligence without a full KYB subscription" },
  { role: "Investor", reason: "Sanity check on a company before a meeting" },
];

const COMPARISONS = [
  { name: "Registrum — one report", cost: "£4.99", commitment: "None", highlight: true },
  { name: "Endole", cost: "£25–39/month", commitment: "Monthly subscription", highlight: false },
  { name: "Beauhurst", cost: "£500+/month", commitment: "Annual contract", highlight: false },
  { name: "Companies House (DIY)", cost: "Free", commitment: "Hours of manual work", highlight: false },
];

const FAQ = [
  {
    q: "How long does it take?",
    a: "The report is delivered to your email within 60 seconds of payment completing. We pull live data from Companies House and run the AI analysis in parallel.",
  },
  {
    q: "What if the company has no digital filings?",
    a: "We still send the report with everything available — profile, risk flags, directors, and PSC chain. The financial section will note that accounts are filed as image PDFs. You won't be charged more than £4.99 regardless.",
  },
  {
    q: "Is the data up to date?",
    a: "Yes. We query the Companies House API in real-time for every report. Nothing is more than 7 days old.",
  },
  {
    q: "Can I buy multiple reports?",
    a: "Yes — submit a separate order for each company. If you need 10+ reports regularly, a Registrum API subscription is more cost-effective.",
  },
  {
    q: "I need a VAT receipt.",
    a: "Stripe sends an automatic receipt to your email after payment. For a formal VAT invoice, email support@registrum.co.uk with your company details.",
  },
];
