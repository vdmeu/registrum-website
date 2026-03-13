import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Beneficial Ownership (PSC) Example · Registrum",
  description:
    "See the Registrum PSC API in action: decoded natures of control, active/ceased split, and ownership chain traversal to find ultimate beneficial owners.",
};

// ---------------------------------------------------------------------------
// Illustrative data — typical 2-level UK corporate ownership structure
// ---------------------------------------------------------------------------

const ROOT = {
  company_name: "CODECRAFT TECHNOLOGIES LIMITED",
  company_number: "12345678",
  active_pscs: [
    {
      kind: "corporate-entity" as const,
      name: "APEX DIGITAL HOLDINGS LIMITED",
      company_number: "08765432",
      natures_of_control: [
        "ownership-of-shares-75-to-100-percent",
        "voting-rights-75-to-100-percent",
        "right-to-appoint-and-remove-directors",
      ],
      natures_of_control_decoded: [
        "Owns 75-100% of shares",
        "Holds 75-100% of voting rights",
        "Right to appoint/remove directors",
      ],
      notified_on: "2019-06-15",
    },
    {
      kind: "individual" as const,
      name: "MR JAMES PEMBERTON",
      nationality: "British",
      country_of_residence: "England",
      natures_of_control: ["ownership-of-shares-25-to-50-percent"],
      natures_of_control_decoded: ["Owns 25-50% of shares"],
      notified_on: "2019-06-15",
    },
  ],
  ceased_pscs: [
    {
      kind: "individual" as const,
      name: "MRS SARAH CHEN",
      nationality: "British",
      natures_of_control: ["ownership-of-shares-25-to-50-percent"],
      natures_of_control_decoded: ["Owns 25-50% of shares"],
      notified_on: "2018-03-01",
      ceased_on: "2022-03-01",
    },
  ],
  total_active: 2,
  total_ceased: 1,
  has_psc_exemption: false,
};

const CHAIN = {
  company_number: "12345678",
  company_name: "CODECRAFT TECHNOLOGIES LIMITED",
  pscs: [
    {
      kind: "corporate-entity" as const,
      name: "APEX DIGITAL HOLDINGS LIMITED",
      company_number: "08765432",
      natures_of_control_decoded: [
        "Owns 75-100% of shares",
        "Holds 75-100% of voting rights",
        "Right to appoint/remove directors",
      ],
      terminal: false,
      terminal_reason: null as null | string,
      children: {
        company_number: "08765432",
        company_name: "APEX DIGITAL HOLDINGS LIMITED",
        pscs: [
          {
            kind: "individual" as const,
            name: "MR GEORGE WENTWORTH",
            nationality: "British",
            country_of_residence: "United Kingdom",
            natures_of_control_decoded: ["Owns 75-100% of shares"],
            terminal: true,
            terminal_reason: "natural_person",
          },
          {
            kind: "individual" as const,
            name: "MS PRIYA NAIR",
            nationality: "British",
            country_of_residence: "United Kingdom",
            natures_of_control_decoded: ["Owns 25-50% of shares"],
            terminal: true,
            terminal_reason: "natural_person",
          },
        ],
      },
    },
    {
      kind: "individual" as const,
      name: "MR JAMES PEMBERTON",
      nationality: "British",
      natures_of_control_decoded: ["Owns 25-50% of shares"],
      terminal: true,
      terminal_reason: "natural_person",
    },
  ],
  chain_metadata: {
    companies_resolved: 2,
    max_depth_reached: false,
    depth_used: 2,
    unresolved_branches: 0,
    total_credits: 2,
  },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PscExample() {
  const uboCount = 3; // George + Priya + James
  return (
    <div className="min-h-screen bg-[#060D1B] text-[#E8F0FE] font-[family-name:var(--font-geist-sans)]">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#060D1B]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
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

      {/* Company header */}
      <section className="border-b border-white/[0.06] px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-2 flex items-center gap-2 text-xs text-[#3D5275]">
            <Link href="/" className="hover:text-white">← Back</Link>
            <span>/</span>
            <span>PSC &amp; beneficial ownership example</span>
          </div>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                {ROOT.company_name}
              </h1>
              <p className="mt-1 text-sm text-[#3D5275]">
                Company {ROOT.company_number} &middot; Active &middot; Illustrative ownership structure
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { label: "Active PSCs", value: String(ROOT.total_active) },
                  { label: "Ultimate beneficial owners", value: String(uboCount) },
                  { label: "API calls (chain)", value: String(CHAIN.chain_metadata.total_credits) },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2"
                  >
                    <div className="text-lg font-semibold text-white">{s.value}</div>
                    <div className="text-xs text-[#3D5275]">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* API snippet */}
            <div className="shrink-0 rounded-xl border border-white/[0.08] bg-[#0A1628] px-5 py-4 font-[family-name:var(--font-geist-mono)] text-xs leading-relaxed text-[#7A8FAD] sm:max-w-sm">
              <p className="text-[#3D5275]"># Flat PSC register</p>
              <p className="mt-1">
                GET{" "}
                <span className="text-[#E8F0FE]">
                  /v1/company/12345678<span className="text-[#22D3A0]">/psc</span>
                </span>
              </p>
              <p className="mt-3 text-[#3D5275]"># Resolve to ultimate beneficial owners</p>
              <p className="mt-1">
                GET{" "}
                <span className="text-[#E8F0FE]">
                  /v1/company/12345678<span className="text-[#22D3A0]">/psc/chain</span>
                </span>
              </p>
              <p className="mt-1">
                <span className="text-[#3D5275]">X-API-Key:</span>{" "}
                <span className="text-[#4F7BFF]">reg_live_...</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ownership chain */}
      <section className="border-b border-white/[0.06] bg-white/[0.015] px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-2 flex items-center gap-3">
            <h2 className="text-xl font-semibold text-white">Ownership chain</h2>
            <span className="rounded-full border border-[#22D3A0]/20 bg-[#22D3A0]/10 px-2.5 py-0.5 text-xs text-[#22D3A0]">
              GET /psc/chain
            </span>
          </div>
          <p className="mb-8 text-sm text-[#7A8FAD]">
            The chain endpoint follows corporate entity PSCs recursively until it reaches natural persons.
            The UBOs (persons in green) are not directly visible from the flat PSC register.
          </p>

          <div className="overflow-x-auto">
            <ChainTree />
          </div>

          {/* Legend */}
          <div className="mt-8 flex flex-wrap gap-4 text-xs text-[#3D5275]">
            <span className="font-medium text-[#7A8FAD]">Legend</span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#4F7BFF]" /> Queried company
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm border border-[#7A8FAD]/40 bg-[#7A8FAD]/10" /> Corporate entity PSC
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#22D3A0]/80" /> Individual (UBO — terminal)
            </span>
          </div>
        </div>
      </section>

      {/* Flat PSC register — active */}
      <section className="px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-2 flex items-center gap-3">
            <h2 className="text-xl font-semibold text-white">Active PSCs</h2>
            <span className="rounded-full border border-[#4F7BFF]/20 bg-[#4F7BFF]/10 px-2.5 py-0.5 text-xs text-[#4F7BFF]">
              GET /psc
            </span>
          </div>
          <p className="mb-6 text-sm text-[#7A8FAD]">
            Natures of control decoded to plain English. Corporate entity PSCs include a{" "}
            <code className="rounded bg-white/[0.05] px-1 font-[family-name:var(--font-geist-mono)] text-xs">company_number</code>{" "}
            you can pass directly to the chain endpoint.
          </p>
          <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                  <th className="px-5 py-3.5 font-medium text-white">Name</th>
                  <th className="px-5 py-3.5 font-medium text-white">Kind</th>
                  <th className="hidden px-5 py-3.5 font-medium text-white sm:table-cell">Notified</th>
                  <th className="px-5 py-3.5 font-medium text-white">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {ROOT.active_pscs.map((psc) => (
                  <tr key={psc.name} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-white">{psc.name}</div>
                      {psc.kind === "corporate-entity" && (
                        <div className="mt-0.5 font-[family-name:var(--font-geist-mono)] text-xs text-[#4F7BFF]">
                          company_number: {psc.company_number}
                        </div>
                      )}
                      {psc.kind === "individual" && "nationality" in psc && (
                        <div className="mt-0.5 text-xs text-[#3D5275]">{psc.nationality} · {psc.country_of_residence}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <KindBadge kind={psc.kind} />
                    </td>
                    <td className="hidden px-5 py-3.5 text-[#7A8FAD] sm:table-cell">
                      {psc.notified_on}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {psc.natures_of_control_decoded.map((n) => (
                          <span
                            key={n}
                            className="rounded-full border border-white/[0.06] bg-white/[0.04] px-2 py-0.5 text-xs text-[#7A8FAD]"
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Flat PSC register — ceased */}
      <section className="border-t border-white/[0.06] px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-6 text-xl font-semibold text-white">
            Ceased PSCs{" "}
            <span className="text-sm font-normal text-[#3D5275]">({ROOT.total_ceased})</span>
          </h2>
          <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                  <th className="px-5 py-3.5 font-medium text-white">Name</th>
                  <th className="px-5 py-3.5 font-medium text-white">Kind</th>
                  <th className="hidden px-5 py-3.5 font-medium text-white sm:table-cell">Notified</th>
                  <th className="px-5 py-3.5 font-medium text-white">Ceased</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {ROOT.ceased_pscs.map((psc) => (
                  <tr key={psc.name} className="opacity-60 transition-colors hover:bg-white/[0.02] hover:opacity-80">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-white">{psc.name}</div>
                      {"nationality" in psc && (
                        <div className="mt-0.5 text-xs text-[#3D5275]">{psc.nationality}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <KindBadge kind={psc.kind} />
                    </td>
                    <td className="hidden px-5 py-3.5 text-[#7A8FAD] sm:table-cell">
                      {psc.notified_on}
                    </td>
                    <td className="px-5 py-3.5 text-[#7A8FAD]">
                      {"ceased_on" in psc ? psc.ceased_on : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-[#3D5275]">
            Illustrative data modelled on a typical UK private company ownership structure.
            The Registrum PSC API automatically splits active and ceased entries — the raw Companies House endpoint returns them mixed.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/[0.06] bg-white/[0.02] px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold text-white">
            Resolve beneficial ownership in one call
          </h2>
          <p className="mt-3 text-[#7A8FAD]">
            The PSC chain endpoint traverses corporate structures automatically — decoding control types,
            detecting cycles, and reporting exactly why each branch terminated.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/#get-key"
              className="rounded-md bg-[#4F7BFF] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#6B93FF]"
            >
              Get free API key →
            </Link>
            <a
              href="https://api.registrum.co.uk/docs#/PSC/get_psc_chain_v1_company__company_number__psc_chain_get"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-white/10 px-5 py-2.5 text-sm font-medium text-[#E8F0FE] transition-colors hover:border-white/20 hover:bg-white/5"
            >
              View API docs
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function KindBadge({ kind }: { kind: "individual" | "corporate-entity" }) {
  if (kind === "corporate-entity") {
    return (
      <span className="rounded-full border border-[#7A8FAD]/20 bg-[#7A8FAD]/10 px-2.5 py-0.5 text-xs text-[#7A8FAD]">
        corporate entity
      </span>
    );
  }
  return (
    <span className="rounded-full border border-[#22D3A0]/20 bg-[#22D3A0]/10 px-2.5 py-0.5 text-xs text-[#22D3A0]">
      individual
    </span>
  );
}

function ChainTree() {
  return (
    <div className="min-w-[560px]">
      {/* Root */}
      <div className="flex justify-center">
        <div className="rounded-xl border border-[#4F7BFF]/40 bg-[#4F7BFF]/10 px-5 py-3 text-center">
          <div className="text-xs font-medium text-[#4F7BFF]">Queried company</div>
          <div className="mt-1 font-semibold text-white">{CHAIN.company_name}</div>
          <div className="mt-0.5 font-[family-name:var(--font-geist-mono)] text-xs text-[#3D5275]">
            {CHAIN.company_number}
          </div>
        </div>
      </div>

      {/* Connector line down */}
      <div className="flex justify-center">
        <div className="h-6 w-px bg-white/10" />
      </div>

      {/* PSC row */}
      <div className="flex items-start justify-center gap-6">
        {CHAIN.pscs.map((psc, i) => (
          <div key={i} className="flex flex-col items-center">
            {/* Node */}
            {psc.terminal ? (
              <div className="rounded-xl border border-[#22D3A0]/30 bg-[#22D3A0]/8 px-4 py-3 text-center">
                <div className="text-xs font-medium text-[#22D3A0]">UBO</div>
                <div className="mt-1 font-medium text-white text-sm">{psc.name}</div>
                {"nationality" in psc && (
                  <div className="mt-0.5 text-xs text-[#3D5275]">{psc.nationality}</div>
                )}
                <div className="mt-1.5 flex flex-wrap justify-center gap-1">
                  {psc.natures_of_control_decoded.map((n) => (
                    <span key={n} className="rounded bg-white/[0.05] px-1.5 py-0.5 text-xs text-[#3D5275]">
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-center">
                  <div className="text-xs font-medium text-[#7A8FAD]">Corporate entity</div>
                  <div className="mt-1 font-medium text-white text-sm">{psc.name}</div>
                  {"company_number" in psc && (
                    <div className="mt-0.5 font-[family-name:var(--font-geist-mono)] text-xs text-[#4F7BFF]">
                      {psc.company_number}
                    </div>
                  )}
                  <div className="mt-1.5 flex flex-wrap justify-center gap-1">
                    {psc.natures_of_control_decoded.slice(0, 2).map((n) => (
                      <span key={n} className="rounded bg-white/[0.05] px-1.5 py-0.5 text-xs text-[#3D5275]">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Connector down to children */}
                {"children" in psc && psc.children && (
                  <>
                    <div className="h-6 w-px bg-white/10" />
                    <div className="flex items-start gap-4">
                      {psc.children.pscs.map((child, j) => (
                        <div key={j} className="flex flex-col items-center">
                          <div className="rounded-xl border border-[#22D3A0]/30 bg-[#22D3A0]/8 px-4 py-3 text-center">
                            <div className="text-xs font-medium text-[#22D3A0]">UBO</div>
                            <div className="mt-1 font-medium text-white text-sm">{child.name}</div>
                            {"nationality" in child && (
                              <div className="mt-0.5 text-xs text-[#3D5275]">{child.nationality}</div>
                            )}
                            <div className="mt-1.5 flex flex-wrap justify-center gap-1">
                              {child.natures_of_control_decoded.map((n) => (
                                <span key={n} className="rounded bg-white/[0.05] px-1.5 py-0.5 text-xs text-[#3D5275]">
                                  {n}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Chain metadata */}
      <div className="mt-8 flex justify-center">
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-5 py-3 font-[family-name:var(--font-geist-mono)] text-xs text-[#3D5275]">
          chain_metadata:{" "}
          <span className="text-[#7A8FAD]">
            companies_resolved: {CHAIN.chain_metadata.companies_resolved} ·
            depth_used: {CHAIN.chain_metadata.depth_used} ·
            total_credits: {CHAIN.chain_metadata.total_credits} ·
            unresolved_branches: {CHAIN.chain_metadata.unresolved_branches}
          </span>
        </div>
      </div>
    </div>
  );
}
