"use client";

import { useState } from "react";

interface UnverifiedPerson {
  name: string;
  role: string;
  kind: string;
}

interface ComplianceData {
  company_number: string;
  directors_total: number;
  directors_verified: number;
  directors_unverified: number;
  directors_unknown: number;
  pscs_total: number;
  pscs_verified: number;
  pscs_unverified: number;
  pscs_unknown: number;
  verification_rate: number;
  verification_risk: "compliant" | "partial" | "high_risk" | "unknown";
  unverified_persons: UnverifiedPerson[];
  eccta_enforcement_deadline: string;
}

const RISK_CONFIG = {
  compliant: {
    label: "Compliant",
    bg: "bg-[#22D3A0]/10",
    border: "border-[#22D3A0]/30",
    text: "text-[#22D3A0]",
    dot: "bg-[#22D3A0]",
    bar: "bg-[#22D3A0]",
  },
  partial: {
    label: "Partial",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
    dot: "bg-amber-400",
    bar: "bg-amber-400",
  },
  high_risk: {
    label: "High Risk",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-400",
    dot: "bg-red-400",
    bar: "bg-red-400",
  },
  unknown: {
    label: "Unknown",
    bg: "bg-white/[0.06]",
    border: "border-white/[0.12]",
    text: "text-[#7A8FAD]",
    dot: "bg-[#7A8FAD]",
    bar: "bg-[#7A8FAD]",
  },
};

export default function EcctaDemo() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComplianceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    const company = input.trim();
    if (!company) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/eccta-demo?company=${encodeURIComponent(company)}`);
      const json = await res.json();
      if (!res.ok || json.status === "error") {
        setError(json.detail ?? "Something went wrong. Try again.");
      } else {
        setResult(json.data);
        setIsMock(!!json._mock);
      }
    } catch {
      setError("Demo unavailable. Try again shortly.");
    } finally {
      setLoading(false);
    }
  }

  const risk = result ? RISK_CONFIG[result.verification_risk] : null;
  const totalPersons = result ? result.directors_total + result.pscs_total : 0;
  const verifiedPersons = result ? result.directors_verified + result.pscs_verified : 0;
  const ratePercent = result ? Math.round(result.verification_rate * 100) : 0;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8">
      {/* Search form */}
      <form onSubmit={handleCheck} className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Company number (e.g. 00445790)"
          className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-[#E8F0FE] placeholder-[#3D5275] outline-none transition focus:border-[#4F7BFF]/50 focus:ring-1 focus:ring-[#4F7BFF]/30"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[#4F7BFF] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#6B93FF] disabled:opacity-60"
        >
          {loading ? "Checking..." : "Check"}
        </button>
      </form>

      {/* Quick examples */}
      <div className="mt-3 flex flex-wrap gap-2">
        {[
          { label: "Tesco PLC", num: "00445790" },
          { label: "M&S PLC", num: "00102498" },
          { label: "Sainsbury's", num: "00004366" },
        ].map((ex) => (
          <button
            key={ex.num}
            onClick={() => setInput(ex.num)}
            className="rounded-md border border-white/[0.06] px-3 py-1 text-xs text-[#7A8FAD] transition-colors hover:border-white/[0.12] hover:text-[#E8F0FE]"
          >
            {ex.label}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="mt-6 animate-pulse space-y-3">
          <div className="h-10 rounded-lg bg-white/[0.04]" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 rounded-lg bg-white/[0.04]" />
            ))}
          </div>
          <div className="h-4 w-3/4 rounded bg-white/[0.04]" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      {result && risk && (
        <div className="mt-6 space-y-5">
          {/* Header row */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs text-[#3D5275]">Company {result.company_number}</div>
              <div className="mt-0.5 text-sm text-[#7A8FAD]">
                {verifiedPersons} of {totalPersons} person{totalPersons !== 1 ? "s" : ""} verified
                {isMock && (
                  <span className="ml-2 text-xs text-[#3D5275]">(illustrative data)</span>
                )}
              </div>
            </div>
            <span
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${risk.bg} ${risk.border} ${risk.text}`}
            >
              {risk.label}
            </span>
          </div>

          {/* Progress bar */}
          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-[#3D5275]">Verification rate</span>
              <span className={risk.text}>{ratePercent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${risk.bar}`}
                style={{ width: `${ratePercent}%` }}
              />
            </div>
          </div>

          {/* Stat grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                label: "Directors verified",
                value: `${result.directors_verified} / ${result.directors_total}`,
              },
              {
                label: "PSCs verified",
                value: `${result.pscs_verified} / ${result.pscs_total}`,
              },
              {
                label: "Risk rating",
                value: risk.label,
              },
              {
                label: "Enforcement",
                value: "18 Nov 2026",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3"
              >
                <div className="text-base font-semibold text-white sm:text-lg">{stat.value}</div>
                <div className="mt-0.5 text-xs text-[#3D5275]">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Unverified persons */}
          {result.unverified_persons.length > 0 ? (
            <div>
              <div className="mb-2 text-xs font-medium text-[#7A8FAD]">
                Unverified persons ({result.unverified_persons.length})
              </div>
              <div className="divide-y divide-white/[0.04] rounded-xl border border-white/[0.06] bg-white/[0.02]">
                {result.unverified_persons.map((person, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                    <span className="flex-1 text-sm text-[#E8F0FE]">{person.name}</span>
                    <span className="text-xs text-[#3D5275] capitalize">{person.role}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : result.verification_risk === "compliant" ? (
            <div className="flex items-center gap-3 rounded-xl border border-[#22D3A0]/20 bg-[#22D3A0]/5 px-4 py-3">
              <span className="text-[#22D3A0]">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              <span className="text-sm text-[#22D3A0]">
                All directors and PSCs have completed identity verification.
              </span>
            </div>
          ) : null}

          {/* Disclaimer */}
          <p className="text-xs text-[#3D5275]">
            Verification data sourced from Companies House.
            Enforcement begins 18 November 2026.
          </p>
        </div>
      )}
    </div>
  );
}
