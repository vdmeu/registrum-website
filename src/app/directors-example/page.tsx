import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import DirectorGraph from "@/components/DirectorGraph";
import { TESCO_DIRECTORS, TESCO_NETWORK_STATS } from "@/lib/tescoDirectors";
import LiveLookup from "@/components/LiveLookup";
import PageFeedback from "@/app/components/PageFeedback";
import SiteNav from "@/components/SiteNav";
import { verifySessionCookie, SESSION_COOKIE } from "@/lib/dashboard-auth";

export const metadata: Metadata = {
  title: "Director Network Example · TESCO PLC · Registrum",
  description:
    "See the Registrum director network API in action: TESCO PLC's full board network mapped in one API call — 12 directors, 26 connected companies.",
};

// Transform to the shape DirectorGraph expects
const directors = TESCO_DIRECTORS.map((d) => ({
  name: d.name,
  role: d.role,
  other_appointments: d.other_appointments.map((a) => ({
    company_number: a.company_number,
    company_name: a.company_name,
    role: a.role,
  })),
}));

export default async function DirectorsExample() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(SESSION_COOKIE)?.value;
  const isAuthenticated = Boolean(sessionValue && verifySessionCookie(sessionValue));

  return (
    <div className="min-h-screen bg-[#060D1B] text-[#E8F0FE] font-[family-name:var(--font-geist-sans)]">
      {/* Nav */}
      <SiteNav maxWidth="7xl" />

      {/* Company header */}
      <section className="border-b border-white/[0.06] px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-2 flex items-center gap-2 text-xs text-[#3D5275]">
            <Link href="/" className="hover:text-white">
              ← Back
            </Link>
            <span>/</span>
            <span>Director network example</span>
            <span className="rounded-full border border-[#4F7BFF]/20 bg-[#4F7BFF]/10 px-2 py-0.5 text-[#4F7BFF]">Demo data</span>
          </div>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white sm:text-3xl">TESCO PLC</h1>
              <p className="mt-1 text-sm text-[#3D5275]">
                Company 00445790 &middot; Active &middot; Director network (depth&nbsp;1)
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { label: "Directors", value: String(TESCO_NETWORK_STATS.nonExecDirectors + TESCO_NETWORK_STATS.executiveDirectors) },
                  { label: "Connected companies", value: String(TESCO_NETWORK_STATS.connectedCompanies) + "+" },
                  { label: "API calls", value: "1" },
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
            {/* API call snippet */}
            <div className="shrink-0 rounded-xl border border-white/[0.08] bg-[#0A1628] px-5 py-4 font-[family-name:var(--font-geist-mono)] text-xs leading-relaxed text-[#7A8FAD] sm:max-w-xs">
              <p className="text-[#3D5275]"># One call to build this graph</p>
              <p className="mt-1">
                GET{" "}
                <span className="text-[#E8F0FE]">
                  /v1/company/00445790<span className="text-[#22D3A0]">/network</span>
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

      {/* Live lookup */}
      <section className="border-b border-white/[0.06] px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <LiveLookup feature="directors" label="live director network for any UK company" isAuthenticated={isAuthenticated} />
        </div>
      </section>

      {/* Graph — full-width */}
      <section className="border-b border-white/[0.06] bg-white/[0.015] px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 flex items-center gap-2 rounded-lg border border-[#F97316]/20 bg-[#F97316]/5 px-4 py-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F97316]" />
            <span className="text-xs font-medium text-[#F97316]">Example data below</span>
            <span className="text-xs text-[#7A8FAD]">— TESCO PLC real data, shown to illustrate the API response. Use the widget above to try any company with your free API key.</span>
          </div>
          <div className="mb-6 flex flex-wrap items-center gap-4 text-xs text-[#3D5275]">
            <span className="font-medium text-[#7A8FAD]">Legend</span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#4F7BFF]" /> Tesco PLC (focal)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#22D3A0]" /> Director / officer
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full border border-[#4F7BFF]/40 bg-[#4F7BFF]/10" /> Connected company
            </span>
            <span className="ml-auto hidden text-[#3D5275] sm:block">Hover nodes for details</span>
          </div>

          {/* Graph: constrained to a max-width that still feels generous */}
          <div className="mx-auto max-w-4xl overflow-x-auto rounded-2xl border border-white/[0.06] bg-[#0A1628] p-2">
            <DirectorGraph focalName="TESCO PLC" directors={directors} />
          </div>
        </div>
      </section>

      {/* Director table */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-8 text-xl font-semibold text-white">Current board</h2>
          <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                  <th className="px-5 py-3.5 font-medium text-white">Name</th>
                  <th className="px-5 py-3.5 font-medium text-white">Role</th>
                  <th className="hidden px-5 py-3.5 font-medium text-white sm:table-cell">Nationality</th>
                  <th className="px-5 py-3.5 text-right font-medium text-white">Other active roles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {TESCO_DIRECTORS.map((d) => (
                  <tr key={d.name} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-3.5 font-medium text-white">{d.name}</td>
                    <td className="px-5 py-3.5 capitalize text-[#7A8FAD]">{d.role}</td>
                    <td className="hidden px-5 py-3.5 text-[#7A8FAD] sm:table-cell">
                      {d.nationality ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {d.other_appointments.length > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#22D3A0]/20 bg-[#22D3A0]/10 px-2.5 py-0.5 text-xs font-medium text-[#22D3A0]">
                          {d.other_appointments.length}
                        </span>
                      ) : (
                        <span className="text-xs text-[#3D5275]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-[#3D5275]">
            Data sourced from Companies House under the Open Government Licence v3.0. Fetched via Registrum API on{" "}
            {TESCO_NETWORK_STATS.fetchedAt}.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/[0.06] bg-white/[0.02] px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold text-white">
            Map any company&apos;s network in one call
          </h2>
          <p className="mt-3 text-[#7A8FAD]">
            The director network endpoint traverses to 2 degrees of separation — deduplicating,
            caching, and sorting by connection strength automatically.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/#get-key"
              className="rounded-md bg-[#4F7BFF] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#6B93FF]"
            >
              Get free API key →
            </Link>
            <a
              href="https://api.registrum.co.uk/docs#/Company%20Network/get_company_network_v1_company__company_number__network_get"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-white/10 px-5 py-2.5 text-sm font-medium text-[#E8F0FE] transition-colors hover:border-white/20 hover:bg-white/5"
            >
              View API docs
            </a>
          </div>
        </div>
      </section>
      <PageFeedback pageUrl="/directors-example" />
    </div>
  );
}
