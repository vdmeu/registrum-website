"use client";

import { useState, useRef } from "react";

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

function formatAddress(r: SearchResult): string {
  const a = r.registered_office_address;
  if (!a) return "";
  return [a.premises, a.address_line_1, a.locality, a.postal_code].filter(Boolean).join(", ");
}

export default function Demo() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isMock, setIsMock] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function search(q: string) {
    if (q.trim().length < 2) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSelected(null);
    try {
      const res = await fetch(`/api/demo?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.data?.items ?? []);
      setIsMock(!!data._mock);
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
    try {
      const res = await fetch(`/api/demo?company=${number}`);
      const data = await res.json();
      setSelected(data.data);
    } finally {
      setDetailLoading(false);
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

      {searched && results.length === 0 && !loading && (
        <p className="mt-4 text-center text-sm text-[#3D5275]">No companies found for &quot;{query}&quot;</p>
      )}

      {/* Company detail loading */}
      {detailLoading && (
        <div className="mt-3 flex items-center justify-center rounded-xl border border-white/[0.08] bg-[#0A1628] py-10">
          <svg className="h-5 w-5 animate-spin text-[#4F7BFF]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      )}

      {/* Company detail */}
      {selected && (
        <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A1628]">
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
            </div>
            <button onClick={() => setSelected(null)} className="shrink-0 text-xs text-[#3D5275] hover:text-white">
              ← Back
            </button>
          </div>

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
        </div>
      )}
    </div>
  );
}
