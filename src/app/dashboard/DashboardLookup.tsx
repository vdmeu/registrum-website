"use client";

import { useState, useRef } from "react";

type Phase = "search" | "loading" | "result" | "error";
type Tab = "company" | "financials" | "directors" | "psc";

interface SearchResult {
  company_number: string;
  company_name: string;
  company_status: string;
}

interface CompanyData {
  company_name?: string;
  company_number?: string;
  company_status?: string;
  date_of_creation?: string;
  registered_office_address?: {
    address_line_1?: string;
    locality?: string;
    postal_code?: string;
  };
  sic_codes?: string[];
}

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
  balance_sheet?: { net_assets?: FinancialValue | null };
  other?: { employees?: FinancialValue | null };
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

const TABS: { id: Tab; label: string }[] = [
  { id: "company", label: "Overview" },
  { id: "financials", label: "Financials" },
  { id: "directors", label: "Directors" },
  { id: "psc", label: "Ownership" },
];

export default function DashboardLookup() {
  const [phase, setPhase] = useState<Phase>("search");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [companyNumber, setCompanyNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("company");
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [financialsData, setFinancialsData] = useState<FinancialsData | null>(null);
  const [directorsData, setDirectorsData] = useState<Director[] | null>(null);
  const [pscData, setPscData] = useState<Psc[] | null>(null);
  const [tabLoading, setTabLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function doSearch(q: string) {
    if (q.trim().length < 2) { setSearchResults([]); return; }
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

  async function selectCompany(number: string, name: string) {
    setCompanyNumber(number);
    setCompanyName(name);
    setSearchResults([]);
    setQuery("");
    setActiveTab("company");
    setCompanyData(null);
    setFinancialsData(null);
    setDirectorsData(null);
    setPscData(null);
    setError(null);
    setPhase("loading");

    try {
      const res = await fetch(`/api/lookup?company=${encodeURIComponent(number)}`);
      if (!res.ok) { setError("Could not load company data."); setPhase("error"); return; }
      const json = await res.json();
      setCompanyData(json.data ?? null);
      setPhase("result");
    } catch {
      setError("Network error. Try again.");
      setPhase("error");
    }
  }

  async function loadTab(tab: Tab) {
    if (tab === activeTab) return;
    setActiveTab(tab);
    if (tab === "company" && companyData) return;
    if (tab === "financials" && financialsData) return;
    if (tab === "directors" && directorsData) return;
    if (tab === "psc" && pscData) return;

    setTabLoading(true);
    setError(null);
    try {
      const paramMap: Record<Tab, string> = {
        company: `company=${companyNumber}`,
        financials: `financials=${companyNumber}`,
        directors: `directors=${companyNumber}`,
        psc: `psc=${companyNumber}`,
      };
      const res = await fetch(`/api/lookup?${paramMap[tab]}`);
      if (!res.ok) { setError("Data not available."); setTabLoading(false); return; }
      const json = await res.json();
      if (tab === "financials") setFinancialsData(json.data ?? null);
      if (tab === "directors") setDirectorsData(json.data?.current_directors ?? []);
      if (tab === "psc") setPscData(json.data?.active_pscs ?? json.data?.pscs ?? []);
    } catch {
      setError("Network error.");
    }
    setTabLoading(false);
  }

  function reset() {
    setPhase("search");
    setQuery("");
    setSearchResults([]);
    setCompanyData(null);
    setFinancialsData(null);
    setDirectorsData(null);
    setPscData(null);
    setError(null);
  }

  if (phase === "search") {
    return (
      <div className="relative">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={handleSearchInput}
            placeholder='e.g. "Tesco", "Monzo", or a company number'
            className="flex-1 rounded-lg border border-white/10 bg-[#060D1B] px-4 py-2.5 text-sm text-white placeholder-[#3D5275] outline-none transition-colors focus:border-[#4F7BFF]/50"
          />
          {searchLoading && (
            <div className="flex items-center px-3">
              <svg className="h-4 w-4 animate-spin text-[#4F7BFF]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}
        </div>
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-10 mt-1 overflow-hidden rounded-lg border border-white/[0.08] bg-[#0A1628]">
            {searchResults.slice(0, 6).map((r, i) => (
              <button
                key={r.company_number}
                onClick={() => selectCompany(r.company_number, r.company_name)}
                className={`w-full px-4 py-3 text-left text-sm transition-colors hover:bg-white/[0.05] ${i !== 0 ? "border-t border-white/[0.06]" : ""}`}
              >
                <span className="font-medium text-white">{r.company_name}</span>
                <span className="ml-2 font-mono text-xs text-[#3D5275]">{r.company_number}</span>
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
      <div className="flex items-center gap-2 py-4 text-sm text-[#7A8FAD]">
        <svg className="h-4 w-4 animate-spin text-[#4F7BFF]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading {companyName}...
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div>
        <p className="text-sm text-red-400">{error}</p>
        <button onClick={reset} className="mt-2 text-xs text-[#4F7BFF] hover:underline">Try another company →</button>
      </div>
    );
  }

  return (
    <div>
      {/* Company header + back */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-medium text-white">{companyName}</p>
          <p className="text-xs text-[#3D5275]">{companyNumber}</p>
        </div>
        <button onClick={reset} className="text-xs text-[#3D5275] hover:text-[#7A8FAD]">← New search</button>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-lg border border-white/[0.06] bg-[#060D1B] p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => loadTab(t.id)}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === t.id
                ? "bg-[#0A1628] text-white"
                : "text-[#3D5275] hover:text-[#7A8FAD]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tabLoading ? (
        <div className="flex items-center gap-2 py-4 text-sm text-[#7A8FAD]">
          <svg className="h-4 w-4 animate-spin text-[#4F7BFF]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading...
        </div>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : (
        <>
          {/* Overview tab */}
          {activeTab === "company" && companyData && (
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              {companyData.company_status && (
                <div>
                  <div className="text-xs text-[#3D5275]">Status</div>
                  <div className={`mt-0.5 font-medium ${companyData.company_status === "active" ? "text-[#22D3A0]" : "text-[#7A8FAD]"}`}>
                    {companyData.company_status}
                  </div>
                </div>
              )}
              {companyData.date_of_creation && (
                <div>
                  <div className="text-xs text-[#3D5275]">Incorporated</div>
                  <div className="mt-0.5 font-medium text-white">{companyData.date_of_creation}</div>
                </div>
              )}
              {companyData.registered_office_address && (
                <div className="col-span-2 sm:col-span-1">
                  <div className="text-xs text-[#3D5275]">Registered office</div>
                  <div className="mt-0.5 text-white">
                    {[companyData.registered_office_address.address_line_1, companyData.registered_office_address.locality, companyData.registered_office_address.postal_code]
                      .filter(Boolean).join(", ")}
                  </div>
                </div>
              )}
              {companyData.sic_codes && companyData.sic_codes.length > 0 && (
                <div className="col-span-2 sm:col-span-3">
                  <div className="text-xs text-[#3D5275]">SIC codes</div>
                  <div className="mt-0.5 text-white">{companyData.sic_codes.join(", ")}</div>
                </div>
              )}
            </div>
          )}

          {/* Financials tab */}
          {activeTab === "financials" && financialsData && (
            <div>
              {financialsData.period_end && (
                <p className="mb-3 text-xs text-[#3D5275]">Period ending {financialsData.period_end}</p>
              )}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  { label: "Turnover", val: financialsData.profit_and_loss?.turnover?.current, prior: financialsData.profit_and_loss?.turnover?.prior },
                  { label: "Gross profit", val: financialsData.profit_and_loss?.gross_profit?.current, prior: financialsData.profit_and_loss?.gross_profit?.prior },
                  { label: "Profit before tax", val: financialsData.profit_and_loss?.profit_before_tax?.current, prior: financialsData.profit_and_loss?.profit_before_tax?.prior },
                  { label: "Net assets", val: financialsData.balance_sheet?.net_assets?.current, prior: financialsData.balance_sheet?.net_assets?.prior },
                  { label: "Employees", val: financialsData.other?.employees?.current, prior: financialsData.other?.employees?.prior, raw: true },
                ].map(({ label, val, prior, raw }) =>
                  val != null ? (
                    <div key={label}>
                      <div className="text-xs text-[#3D5275]">{label}</div>
                      <div className="mt-0.5 text-base font-semibold text-white">
                        {raw ? (val as number).toLocaleString("en-GB") : fmt(val as number)}
                      </div>
                      {prior != null && <div className="text-xs text-[#7A8FAD]">{yoy(val as number, prior)}</div>}
                    </div>
                  ) : null
                )}
              </div>
              {financialsData.data_quality?.completeness != null && (
                <p className="mt-3 text-xs text-[#3D5275]">
                  Data quality: {Math.round(financialsData.data_quality.completeness * 100)}%
                  {financialsData.data_quality.accounts_type ? ` · ${financialsData.data_quality.accounts_type}` : ""}
                </p>
              )}
            </div>
          )}
          {activeTab === "financials" && !financialsData && (
            <p className="text-sm text-[#3D5275]">No financial data available for this company.</p>
          )}

          {/* Directors tab */}
          {activeTab === "directors" && directorsData && (
            directorsData.length === 0 ? (
              <p className="text-sm text-[#3D5275]">No active directors recorded.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {directorsData.map((d) => (
                  <div key={d.name} className="rounded-lg border border-white/[0.06] bg-[#060D1B] px-4 py-3">
                    <div className="flex items-baseline gap-3">
                      <span className="font-medium text-white">{d.name}</span>
                      <span className="text-xs text-[#7A8FAD]">{d.role}</span>
                    </div>
                    {d.appointed_on && (
                      <p className="mt-0.5 text-xs text-[#3D5275]">Appointed {d.appointed_on}</p>
                    )}
                    {d.other_appointments.length > 0 && (
                      <p className="mt-0.5 text-xs text-[#3D5275]">{d.other_appointments.length} other appointment{d.other_appointments.length !== 1 ? "s" : ""}</p>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

          {/* PSC tab */}
          {activeTab === "psc" && pscData && (
            (() => {
              const active = pscData.filter((p) => !p.ceased_on);
              return active.length === 0 ? (
                <p className="text-sm text-[#3D5275]">No active PSCs recorded.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {active.map((p) => (
                    <div key={p.name} className="rounded-lg border border-white/[0.06] bg-[#060D1B] px-4 py-3">
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
              );
            })()
          )}
        </>
      )}
    </div>
  );
}
