"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import DirectorGraph from "./DirectorGraph";

type Feature = "financials" | "directors" | "psc";
type Phase = "gate" | "search" | "loading" | "result" | "error";

interface FinancialValue {
  current?: number | null;
  prior?: number | null;
}

interface FinancialsData {
  period_end?: string;
  accounts_type?: string;
  profit_and_loss?: {
    turnover?: FinancialValue | null;
    gross_profit?: FinancialValue | null;
    profit_before_tax?: FinancialValue | null;
  };
  balance_sheet?: {
    net_assets?: FinancialValue | null;
  };
  other?: {
    employees?: FinancialValue | null;
  };
  data_quality?: { completeness?: number; accounts_type?: string };
}

interface Director {
  name: string;
  role: string;
  appointed_on?: string;
  other_appointments: Array<{ company_number: string; company_name: string; role: string }>;
}

interface Psc {
  name: string;
  kind: string;
  natures_of_control_plain?: string[];
  ceased_on?: string;
}

interface SearchResult {
  company_number: string;
  company_name: string;
  company_status: string;
}

function fmt(n?: number | null): string {
  if (n == null) return "—";
  if (Math.abs(n) >= 1_000_000_000) return `£${(n / 1_000_000_000).toFixed(1)}bn`;
  if (Math.abs(n) >= 1_000_000) return `£${(n / 1_000_000).toFixed(1)}m`;
  if (Math.abs(n) >= 1_000) return `£${(n / 1_000).toFixed(0)}k`;
  return `£${n}`;
}

function yoy(curr?: number | null, prior?: number | null): string {
  if (curr == null || prior == null || prior === 0) return "";
  const pct = ((curr - prior) / Math.abs(prior)) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(0)}% YoY`;
}

function FinancialsResult({ data, companyName }: { data: FinancialsData; companyName: string }) {
  const pl = data.profit_and_loss;
  const bs = data.balance_sheet;
  const metrics = [
    { label: "Turnover", val: pl?.turnover?.current, prior: pl?.turnover?.prior },
    { label: "Gross profit", val: pl?.gross_profit?.current, prior: pl?.gross_profit?.prior },
    { label: "Profit before tax", val: pl?.profit_before_tax?.current, prior: pl?.profit_before_tax?.prior },
    { label: "Net assets", val: bs?.net_assets?.current, prior: bs?.net_assets?.prior },
    { label: "Employees", val: data.other?.employees?.current, prior: data.other?.employees?.prior, isCurrency: false },
  ];

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0A1628] p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-medium text-white">{companyName}</p>
        {data.period_end && (
          <span className="text-xs text-[#3D5275]">Period: {data.period_end}</span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {metrics.map(({ label, val, prior, isCurrency }) => (
          val != null ? (
            <div key={label}>
              <div className="text-xs text-[#3D5275]">{label}</div>
              <div className="mt-0.5 text-base font-semibold text-white">
                {isCurrency === false ? (val as number).toLocaleString("en-GB") : fmt(val as number)}
              </div>
              {prior != null && (
                <div className="text-xs text-[#7A8FAD]">{yoy(val as number, prior)}</div>
              )}
            </div>
          ) : null
        ))}
      </div>
      {data.data_quality?.completeness != null && (
        <div className="mt-4 border-t border-white/[0.06] pt-3">
          <span className="rounded border border-white/[0.06] px-2 py-0.5 text-xs text-[#3D5275]">
            Data quality: {Math.round(data.data_quality.completeness * 100)}%
            {data.data_quality.accounts_type ? ` · ${data.data_quality.accounts_type}` : ""}
          </span>
        </div>
      )}
    </div>
  );
}

function DirectorsResult({ directors, companyName }: { directors: Director[]; companyName: string }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0A1628] p-5">
      <p className="mb-4 font-medium text-white">{companyName}</p>
      <DirectorGraph focalName={companyName} directors={directors} />
      {directors.length > 0 && (
        <div className="mt-4 border-t border-white/[0.06] pt-4">
          <div className="flex flex-col gap-2">
            {directors.map((d) => (
              <div key={d.name} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <span className="text-sm font-medium text-white">{d.name}</span>
                <span className="text-xs text-[#7A8FAD]">{d.role}</span>
                {d.other_appointments.length > 0 && (
                  <span className="text-xs text-[#3D5275]">
                    · {d.other_appointments.length} other co.
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PscResult({ pscs, companyName }: { pscs: Psc[]; companyName: string }) {
  const active = pscs.filter((p) => !p.ceased_on);
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0A1628] p-5">
      <p className="mb-4 font-medium text-white">{companyName} — PSC register</p>
      {active.length === 0 ? (
        <p className="text-sm text-[#3D5275]">No active PSCs recorded.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {active.map((p) => (
            <div key={p.name} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-white">{p.name}</p>
                <span className="shrink-0 rounded-full border border-white/[0.06] px-2 py-0.5 text-xs text-[#3D5275]">{p.kind}</span>
              </div>
              {(p.natures_of_control_plain ?? []).map((n) => (
                <p key={n} className="mt-1 text-xs text-[#7A8FAD]">{n}</p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface Props {
  feature: Feature;
  label: string;
  isAuthenticated?: boolean;
}

export default function LiveLookup({ feature, label, isAuthenticated = false }: Props) {
  const [phase, setPhase] = useState<Phase>(() => isAuthenticated ? "search" : "gate");

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [companyName, setCompanyName] = useState("");
  const [financialsData, setFinancialsData] = useState<FinancialsData | null>(null);
  const [directorsData, setDirectorsData] = useState<Director[] | null>(null);
  const [pscData, setPscData] = useState<Psc[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function doSearch(q: string) {
    if (q.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/lookup?q=${encodeURIComponent(q.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.data?.items ?? []);
      } else {
        setSearchResults([]);
      }
    } catch {
      setSearchResults([]);
    }
    setSearchLoading(false);
  }

  function handleSearchInput(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(q), 350);
  }

  async function handleCompanySelect(number: string, name: string) {
    setCompanyName(name);
    setSearchResults([]);
    setPhase("loading");

    try {
      const res = await fetch(`/api/lookup?${feature}=${encodeURIComponent(number)}`);
      if (!res.ok) {
        if (res.status === 429) {
          setError("Daily limit reached. Your free API key gives you more headroom — check your inbox.");
        } else {
          setError("Data not available for this company.");
        }
        setPhase("error");
        return;
      }
      const json = await res.json();
      if (feature === "financials") setFinancialsData(json.data ?? null);
      if (feature === "directors") setDirectorsData(json.data?.current_directors ?? []);
      if (feature === "psc") setPscData(json.data?.active_pscs ?? json.data?.pscs ?? []);
      setPhase("result");
    } catch {
      setError("Network error. Try again.");
      setPhase("error");
    }
  }

  function reset() {
    setPhase("search");
    setQuery("");
    setSearchResults([]);
    setFinancialsData(null);
    setDirectorsData(null);
    setPscData(null);
    setError(null);
    setCompanyName("");
  }

  if (phase === "gate") {
    return (
      <div className="rounded-xl border border-[#4F7BFF]/20 bg-[#4F7BFF]/[0.04] p-6" data-testid="lookup-gate">
        <p className="mb-1 text-sm font-medium text-white">Try live data — {label}</p>
        <p className="mb-5 text-xs text-[#7A8FAD]">
          Sign in to look up any UK company in real time using your free API key.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/dashboard"
            className="rounded-lg bg-[#4F7BFF] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#6B93FF] text-center"
          >
            Sign in to try live lookup →
          </Link>
          <a
            href="/#get-key"
            className="text-sm text-[#7A8FAD] transition-colors hover:text-white text-center"
          >
            No account? Get a free key
          </a>
        </div>
      </div>
    );
  }

  if (phase === "search") {
    return (
      <div className="rounded-xl border border-[#4F7BFF]/20 bg-[#4F7BFF]/[0.04] p-6">
        <p className="mb-3 text-sm font-medium text-white">Search any UK company by name</p>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleSearchInput}
            autoFocus
            placeholder='e.g. "Sonovate", "Monzo", "Tesco"'
            className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white placeholder-[#3D5275] outline-none transition-colors focus:border-[#4F7BFF]/50"
          />
          {searchLoading && (
            <div className="absolute right-3 top-3">
              <svg className="h-4 w-4 animate-spin text-[#4F7BFF]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}
        </div>
        {searchResults.length > 0 && (
          <div className="mt-2 overflow-hidden rounded-lg border border-white/[0.08] bg-[#0A1628]">
            {searchResults.slice(0, 6).map((r, i) => (
              <button
                key={r.company_number}
                onClick={() => handleCompanySelect(r.company_number, r.company_name)}
                className={`w-full px-4 py-3 text-left text-sm transition-colors hover:bg-white/[0.05] ${i !== 0 ? "border-t border-white/[0.06]" : ""}`}
              >
                <span className="font-medium text-white">{r.company_name}</span>
                <span className="ml-2 font-[family-name:var(--font-geist-mono)] text-xs text-[#3D5275]">
                  {r.company_number}
                </span>
                {r.company_status !== "active" && (
                  <span className="ml-2 text-xs text-[#3D5275]">· {r.company_status}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="rounded-xl border border-[#4F7BFF]/20 bg-[#4F7BFF]/[0.04] p-6 text-center">
        <svg className="mx-auto h-5 w-5 animate-spin text-[#4F7BFF]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="mt-2 text-sm text-[#7A8FAD]">Loading {feature} for {companyName}...</p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="rounded-xl border border-[#4F7BFF]/20 bg-[#4F7BFF]/[0.04] p-6">
        <p className="text-sm text-[#F97316]">{error}</p>
        <button onClick={reset} className="mt-3 text-sm text-[#4F7BFF] hover:underline">
          Try another company →
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#4F7BFF]/20 bg-[#4F7BFF]/[0.04] p-6">
      {financialsData && companyName && (
        <FinancialsResult data={financialsData} companyName={companyName} />
      )}
      {directorsData && companyName && (
        <DirectorsResult directors={directorsData} companyName={companyName} />
      )}
      {pscData && companyName && (
        <PscResult pscs={pscData} companyName={companyName} />
      )}
      <button onClick={reset} className="mt-4 text-xs text-[#3D5275] hover:text-[#7A8FAD]">
        ← Search another company
      </button>
    </div>
  );
}
