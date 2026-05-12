"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchResult {
  company_number: string;
  company_name: string;
  company_status: string;
  registered_office_address?: {
    address_line_1?: string;
    locality?: string;
    postal_code?: string;
  };
}

function formatAddress(r: SearchResult): string {
  const a = r.registered_office_address;
  if (!a) return "";
  return [a.address_line_1, a.locality, a.postal_code].filter(Boolean).join(", ");
}

export default function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function doSearch(q: string) {
    if (q.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/lookup?q=${encodeURIComponent(q.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.data?.items ?? []);
      } else {
        setResults([]);
      }
      setSearched(true);
    } catch {
      setResults([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  // Auto-search on mount if q was in URL
  useEffect(() => {
    if (initialQ.trim().length >= 2) doSearch(initialQ);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(q), 350);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && results.length > 0) {
      router.push(`/company/${results[0].company_number}`);
    }
  }

  return (
    <div>
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
          onKeyDown={handleKeyDown}
          placeholder='Search by name or number — try "Tesco" or enter "00445790"'
          autoFocus
          className="w-full rounded-xl border border-white/10 bg-white/[0.06] py-4 pl-12 pr-4 text-sm text-white placeholder-[#3D5275] outline-none transition-colors focus:border-[#4F7BFF]/50 focus:bg-white/[0.08]"
        />
      </div>

      {results.length > 0 && (
        <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A1628]">
          {results.map((r, i) => {
            const addr = formatAddress(r);
            return (
              <button
                key={r.company_number}
                onClick={() => router.push(`/company/${r.company_number}`)}
                className={`w-full px-5 py-4 text-left transition-colors hover:bg-white/[0.05] ${i !== 0 ? "border-t border-white/[0.06]" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium text-white">{r.company_name}</span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                          r.company_status === "active"
                            ? "bg-[#22D3A0]/10 text-[#22D3A0]"
                            : "bg-white/5 text-[#3D5275]"
                        }`}
                      >
                        {r.company_status}
                      </span>
                    </div>
                    {addr && <div className="mt-0.5 truncate text-xs text-[#3D5275]">{addr}</div>}
                  </div>
                  <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-xs text-[#3D5275]">
                    {r.company_number}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {searched && results.length === 0 && !loading && (
        <p className="mt-6 text-center text-sm text-[#3D5275]">
          No companies found for &quot;{query}&quot;
        </p>
      )}

      {!searched && !loading && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {["Tesco", "Barclays", "ASOS", "Deliveroo", "Monzo"].map((name) => (
            <button
              key={name}
              onClick={() => {
                setQuery(name);
                doSearch(name);
              }}
              className="rounded-full border border-white/[0.06] px-3 py-1.5 text-xs text-[#3D5275] transition-colors hover:border-white/[0.15] hover:text-[#7A8FAD]"
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
