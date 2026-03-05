"use client";

import { useState, useRef } from "react";
import DirectorGraph from "./DirectorGraph";

interface SearchResult {
  company_number: string;
  company_name: string;
  company_status: string;
  date_of_creation: string;
  registered_office_address?: {
    premises?: string;
    address_line_1?: string;
    locality?: string;
    postal_code?: string;
  };
}

interface CompanyDetail {
  company_number: string;
  company_name: string;
  company_status: string;
  company_type: string;
  date_of_creation: string;
  company_age_years: number;
  registered_office_address?: { address_line_1: string; locality: string; postal_code: string };
  accounts?: { overdue: boolean; next_accounts_due?: string };
  confirmation_statement?: { overdue: boolean };
  sic_codes: string[];
  company_category?: string;
}

interface Director {
  name: string;
  role: string;
  other_appointments: Array<{ company_number: string; company_name: string; role: string }>;
}

function formatAddress(r: SearchResult): string {
  const a = r.registered_office_address;
  if (!a) return "";
  return [a.premises, a.address_line_1, a.locality, a.postal_code].filter(Boolean).join(", ");
}

function errorMessage(status: number): string {
  if (status === 429) return "Demo is temporarily busy — try again in a moment.";
  if (status === 401 || status === 403) return "Demo key unavailable — showing sample data above.";
  if (status >= 500) return "Registrum is temporarily unavailable. Try again shortly.";
  if (status === 404) return "Company not found.";
  return "Something went wrong. Try again shortly.";
}

/* ─── Skeleton loader for company detail ─────────────────────────────────── */

function DetailSkeleton() {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A1628] animate-pulse">
      <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] px-5 py-4">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-40 rounded bg-white/[0.06]" />
          <div className="h-3 w-28 rounded bg-white/[0.04]" />
        </div>
        <div className="h-3 w-10 rounded bg-white/[0.04]" />
      </div>
      <div className="grid grid-cols-2 gap-px bg-white/[0.04] sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[#0A1628] px-4 py-3">
            <div className="h-2.5 w-16 rounded bg-white/[0.04]" />
            <div className="mt-1.5 h-4 w-20 rounded bg-white/[0.06]" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-px bg-white/[0.04]">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-[#0A1628] px-4 py-3">
            <div className="h-2.5 w-24 rounded bg-white/[0.04]" />
            <div className="mt-1.5 h-4 w-8 rounded bg-white/[0.06]" />
          </div>
        ))}
      </div>
      <div className="px-5 py-4">
        <div className="h-2.5 w-16 rounded bg-white/[0.04]" />
        <div className="mt-2 flex gap-1.5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-5 w-12 rounded bg-white/[0.06]" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── CTA overlay after 3 lookups ────────────────────────────────────────── */

function CtaOverlay({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-[#060D1B]/90 backdrop-blur-sm">
      <div className="mx-auto max-w-xs px-6 py-8 text-center">
        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#22D3A0]/30 bg-[#22D3A0]/10">
          <svg className="h-5 w-5 text-[#22D3A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-white">Enjoying the demo?</h3>
        <p className="mt-2 text-sm text-[#7A8FAD]">
          Get a free API key and query any UK company — 50 calls per month, no credit card.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <a
            href="#get-key"
            onClick={onDismiss}
            className="rounded-md bg-[#4F7BFF] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#6B93FF]"
          >
            Get your free key →
          </a>
          <button
            onClick={onDismiss}
            className="text-xs text-[#3D5275] transition-colors hover:text-[#7A8FAD]"
          >
            Continue exploring
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Demo() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isMock, setIsMock] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [tab, setTab] = useState<"overview" | "network">("overview");
  const [directorsData, setDirectorsData] = useState<Director[] | null>(null);
  const [directorsLoading, setDirectorsLoading] = useState(false);
  const [showCta, setShowCta] = useState(false);
  const lookupCount = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function search(q: string) {
    if (q.trim().length < 2) { setResults([]); setSearched(false); setSearchError(null); return; }
    setLoading(true);
    setSelected(null);
    setSearchError(null);
    try {
      const res = await fetch(`/api/demo?q=${encodeURIComponent(q)}`);
      if (!res.ok) {
        setSearchError(errorMessage(res.status));
        setResults([]);
      } else {
        const data = await res.json();
        setResults(data.data?.items ?? []);
        setIsMock(!!data._mock);
      }
      setSearched(true);
    } catch {
      setSearchError("Network error — check your connection and try again.");
      setResults([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(q), 400);
  }

  async function selectCompany(number: string) {
    setDetailLoading(true);
    setSelected(null);
    setDetailError(null);
    setTab("overview");
    setDirectorsData(null);
    setDirectorsLoading(false);
    try {
      const res = await fetch(`/api/demo?company=${number}`);
      if (!res.ok) {
        setDetailError(errorMessage(res.status));
      } else {
        const data = await res.json();
        setSelected(data.data);
        // Increment lookup count and show CTA after 3rd company detail view
        lookupCount.current += 1;
        if (lookupCount.current === 3) {
          setShowCta(true);
        }
      }
    } catch {
      setDetailError("Network error — check your connection and try again.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleTabChange(t: "overview" | "network") {
    setTab(t);
    if (t === "network" && directorsData === null && selected) {
      setDirectorsLoading(true);
      try {
        const res = await fetch(`/api/demo?directors=${selected.company_number}`);
        const data = await res.json();
        setDirectorsData(data.data?.current_directors ?? []);
      } finally {
        setDirectorsLoading(false);
      }
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Search input */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
          {loading ? (
            <svg className="h-4 w-4 animate-spin text-[#4F7BFF]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4 text-[#3D5275]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInput}
          placeholder="Search any UK company — try &quot;Tesco&quot; or &quot;Barclays&quot;"
          className="w-full rounded-xl border border-white/10 bg-white/[0.06] py-3.5 pl-11 pr-4 text-sm text-white placeholder-[#3D5275] outline-none transition-colors focus:border-[#4F7BFF]/50 focus:bg-white/[0.08]"
        />
      </div>

      {isMock && searched && (
        <p className="mt-2 text-center text-xs text-[#3D5275]">
          Showing sample data — live results available with an API key
        </p>
      )}

      {/* Search error */}
      {searchError && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#F97316]/20 bg-[#F97316]/5 px-4 py-3 text-sm text-[#F97316]">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          {searchError}
        </div>
      )}

      {/* Results list */}
      {results.length > 0 && !selected && (
        <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A1628]">
          {results.map((r, i) => (
            <button
              key={r.company_number}
              onClick={() => selectCompany(r.company_number)}
              className={`w-full px-5 py-4 text-left transition-colors hover:bg-white/[0.05] ${i !== 0 ? "border-t border-white/[0.06]" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-white">{r.company_name}</span>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${r.company_status === "active" ? "bg-[#22D3A0]/10 text-[#22D3A0]" : "bg-white/5 text-[#3D5275]"}`}>
                      {r.company_status}
                    </span>
                  </div>
                  <div className="mt-0.5 truncate text-xs text-[#3D5275]">{formatAddress(r)}</div>
                </div>
                <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-xs text-[#3D5275]">
                  {r.company_number}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {searched && results.length === 0 && !loading && !searchError && (
        <p className="mt-4 text-center text-sm text-[#3D5275]">No companies found for &quot;{query}&quot;</p>
      )}

      {/* Company detail skeleton */}
      {detailLoading && <DetailSkeleton />}

      {/* Company detail error */}
      {detailError && !detailLoading && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#F97316]/20 bg-[#F97316]/5 px-4 py-3 text-sm text-[#F97316]">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          {detailError}
        </div>
      )}

      {/* Company detail */}
      {selected && (
        <div className="relative mt-3 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A1628]">
          {/* CTA overlay */}
          {showCta && <CtaOverlay onDismiss={() => setShowCta(false)} />}

          <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] px-5 py-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{selected.company_name}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs ${selected.company_status === "active" ? "bg-[#22D3A0]/10 text-[#22D3A0]" : "bg-white/5 text-[#3D5275]"}`}>
                  {selected.company_status}
                </span>
              </div>
              <div className="mt-0.5 text-xs text-[#3D5275]">
                {[selected.registered_office_address?.address_line_1, selected.registered_office_address?.locality, selected.registered_office_address?.postal_code].filter(Boolean).join(", ")}
              </div>
              <div className="mt-2 flex gap-1">
                {(["overview", "network"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => handleTabChange(t)}
                    className={`rounded-full px-2.5 py-0.5 text-xs transition-colors ${
                      tab === t ? "bg-[#4F7BFF] text-white" : "text-[#3D5275] hover:text-white"
                    }`}
                  >
                    {t === "overview" ? "Overview" : "Director Network"}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <button onClick={() => { setSelected(null); setDetailError(null); }} className="text-xs text-[#3D5275] hover:text-white">
                ← Back
              </button>
              <a
                href={`/company/${selected.company_number}`}
                className="rounded-md bg-[#4F7BFF] px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-[#6B93FF]"
              >
                Full profile →
              </a>
            </div>
          </div>

          {tab === "overview" ? (
            <>
              <div className="grid grid-cols-2 gap-px bg-white/[0.04] sm:grid-cols-4">
                {[
                  { label: "Company no.", value: selected.company_number },
                  { label: "Age", value: selected.company_age_years ? `${selected.company_age_years} yrs` : "—" },
                  { label: "Type", value: selected.company_type?.replace(/_/g, " ") ?? "—" },
                  { label: "Incorporated", value: selected.date_of_creation ?? "—" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-[#0A1628] px-4 py-3">
                    <div className="text-xs text-[#3D5275]">{stat.label}</div>
                    <div className="mt-0.5 font-[family-name:var(--font-geist-mono)] text-sm text-white">{stat.value}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-px bg-white/[0.04]">
                <div className="bg-[#0A1628] px-4 py-3">
                  <div className="text-xs text-[#3D5275]">Accounts overdue</div>
                  <div className={`mt-0.5 text-sm font-medium ${selected.accounts?.overdue ? "text-red-400" : "text-[#22D3A0]"}`}>
                    {selected.accounts?.overdue ? "Yes" : "No"}
                  </div>
                </div>
                <div className="bg-[#0A1628] px-4 py-3">
                  <div className="text-xs text-[#3D5275]">Confirmation overdue</div>
                  <div className={`mt-0.5 text-sm font-medium ${selected.confirmation_statement?.overdue ? "text-red-400" : "text-[#22D3A0]"}`}>
                    {selected.confirmation_statement?.overdue ? "Yes" : "No"}
                  </div>
                </div>
              </div>

              <div className="px-5 py-4">
                <div className="text-xs text-[#3D5275]">SIC codes</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {(selected.sic_codes ?? []).map((c) => (
                    <span key={c} className="rounded-md border border-white/[0.06] px-2 py-0.5 font-[family-name:var(--font-geist-mono)] text-xs text-[#7A8FAD]">{c}</span>
                  ))}
                </div>
                <p className="mt-4 text-xs text-[#3D5275]">
                  Your API also returns financials, director networks, and filing history.{" "}
                  <a href="https://api.registrum.co.uk/docs" target="_blank" rel="noopener noreferrer" className="text-[#4F7BFF] hover:underline">
                    See full docs →
                  </a>
                </p>
              </div>
            </>
          ) : (
            <div className="px-5 py-4">
              {directorsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <svg className="h-5 w-5 animate-spin text-[#4F7BFF]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              ) : (
                <DirectorGraph
                  focalName={selected.company_name}
                  directors={directorsData ?? []}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
