import type { Metadata } from "next";
import Link from "next/link";
import EcctaDemo from "@/components/EcctaDemo";

export const metadata: Metadata = {
  title: "ECCTA Identity Verification · Registrum",
  description:
    "Check ECCTA identity verification status for UK company directors and PSCs. The Economic Crime and Corporate Transparency Act 2023 mandates verification from November 2025, with enforcement from November 2026.",
};

const EXAMPLE_RESPONSE = `{
  "status": "success",
  "data": {
    "company_number": "10892514",
    "directors_total": 3,
    "directors_verified": 2,
    "directors_unverified": 1,
    "directors_unknown": 0,
    "pscs_total": 1,
    "pscs_verified": 1,
    "pscs_unverified": 0,
    "pscs_unknown": 0,
    "verification_rate": 0.75,
    "verification_risk": "partial",
    "unverified_persons": [
      {
        "name": "SMITH, John",
        "role": "director",
        "kind": "director"
      }
    ],
    "eccta_enforcement_deadline": "2026-11-18"
  },
  "cached": false,
  "credits_used": 1
}`;

const FIELD_DOCS = [
  {
    field: "verification_risk",
    type: "string",
    desc: '"compliant" | "partial" | "high_risk" | "unknown"',
  },
  {
    field: "verification_rate",
    type: "float",
    desc: "verified / (verified + unverified). Unknowns excluded from denominator.",
  },
  {
    field: "directors_verified",
    type: "int",
    desc: "Current directors with a confirmed identity_verified_on date at Companies House.",
  },
  {
    field: "directors_unverified",
    type: "int",
    desc: "Verification details present but no verified date — started but not complete.",
  },
  {
    field: "directors_unknown",
    type: "int",
    desc: "identity_verification_details entirely absent from CH API — pre-ECCTA data.",
  },
  {
    field: "unverified_persons",
    type: "array",
    desc: "Only persons with identity_verified=false. Unknowns (null) are excluded.",
  },
  {
    field: "eccta_enforcement_deadline",
    type: "string",
    desc: "Always 2026-11-18 — the date Companies House begins enforcement action.",
  },
];

const TIMELINE = [
  {
    date: "April 2025",
    event: "Voluntary verification opens",
    desc: "Companies House launched the digital ID verification portal. Directors and PSCs could optionally verify.",
    done: true,
  },
  {
    date: "November 2025",
    event: "Legally mandatory for new appointments",
    desc: "All new directors and PSCs must verify at point of incorporation or appointment. Existing directors entered a 12-month transition.",
    done: true,
  },
  {
    date: "November 2026",
    event: "Enforcement begins",
    desc: "Acting as an unverified director becomes a criminal offence. Companies House can remove non-compliant directors and strike off companies.",
    done: false,
  },
];

export default function EcctaVerificationPage() {
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

      {/* Hero */}
      <section className="border-b border-white/[0.06] px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-2 flex items-center gap-2 text-xs text-[#3D5275]">
            <Link href="/" className="hover:text-white">
              Back to Registrum
            </Link>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
            ECCTA 2023
          </span>

          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
            ECCTA Identity Verification
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-[#7A8FAD]">
            The Economic Crime and Corporate Transparency Act 2023 requires all UK company
            directors and individual PSCs to verify their identity with Companies House.
            Enforcement begins 18 November 2026. Registrum surfaces verification status
            in a single API call.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {[
              { label: "Mandatory from", value: "Nov 2025" },
              { label: "Who must verify", value: "All directors & individual PSCs" },
              { label: "Enforcement", value: "Nov 2026" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2.5"
              >
                <div className="text-base font-semibold text-white">{s.value}</div>
                <div className="text-xs text-[#3D5275]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive demo */}
      <section className="border-b border-white/[0.06] px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-2 text-2xl font-semibold text-white sm:text-3xl">
            Check any company&rsquo;s ECCTA status
          </h2>
          <p className="mb-8 text-[#7A8FAD]">
            Enter a Companies House company number to see the verification snapshot.
          </p>
          <EcctaDemo />
        </div>
      </section>

      {/* What is ECCTA */}
      <section className="border-b border-white/[0.06] px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-2xl font-semibold text-white sm:text-3xl">
            What is ECCTA identity verification?
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
              <div className="mb-3 text-sm font-semibold text-[#4F7BFF]">What changed</div>
              <p className="text-sm text-[#7A8FAD]">
                ECCTA 2023 introduced mandatory identity verification via the Companies House
                digital portal. Directors must photograph their face and identity document;
                CH issues an 11-character personal code (UVID) on success. Verified status
                is publicly visible on the CH register.
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
              <div className="mb-3 text-sm font-semibold text-[#22D3A0]">Who must verify</div>
              <p className="text-sm text-[#7A8FAD]">
                All directors of UK limited companies, PLCs, and LLPs. All individual PSCs
                (Persons with Significant Control) who are natural persons. Corporate entity
                and legal person PSCs are exempt. Sole traders are not affected.
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
              <div className="mb-3 text-sm font-semibold text-amber-400">Enforcement timeline</div>
              <div className="space-y-3">
                {TIMELINE.map((t) => (
                  <div key={t.date} className="flex gap-2.5">
                    <span
                      className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${t.done ? "bg-[#22D3A0]" : "bg-amber-400"}`}
                    />
                    <div>
                      <div className="text-xs font-medium text-[#E8F0FE]">{t.date}</div>
                      <div className="text-xs text-[#3D5275]">{t.event}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* API response anatomy */}
      <section className="border-b border-white/[0.06] px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-2 text-2xl font-semibold text-white sm:text-3xl">
            What the API returns
          </h2>
          <p className="mb-8 text-[#7A8FAD]">
            <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-[family-name:var(--font-geist-mono)] text-sm text-[#E8F0FE]">
              GET /v1/company/&#123;number&#125;/compliance
            </code>
          </p>

          <div className="mb-8 overflow-x-auto rounded-xl border border-white/[0.06] bg-[#0A1628] px-6 py-5 font-[family-name:var(--font-geist-mono)] text-sm leading-relaxed text-[#7A8FAD]">
            <pre>{EXAMPLE_RESPONSE}</pre>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/[0.06]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#3D5275]">Field</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#3D5275]">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#3D5275]">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {FIELD_DOCS.map((f) => (
                  <tr key={f.field} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-[family-name:var(--font-geist-mono)] text-xs text-[#4F7BFF]">
                      {f.field}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#3D5275]">{f.type}</td>
                    <td className="px-4 py-3 text-xs text-[#7A8FAD]">{f.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Verification fields on all plans */}
      <section className="border-b border-white/[0.06] px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
            <div className="mb-2 text-sm font-semibold text-amber-400">Plan availability</div>
            <p className="text-sm text-[#7A8FAD]">
              The{" "}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-[family-name:var(--font-geist-mono)] text-xs text-[#E8F0FE]">
                /compliance
              </code>{" "}
              endpoint requires a{" "}
              <span className="text-[#E8F0FE]">Pro or Enterprise</span> plan.
              The{" "}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-[family-name:var(--font-geist-mono)] text-xs text-[#E8F0FE]">
                identity_verified
              </code>{" "}
              and{" "}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-[family-name:var(--font-geist-mono)] text-xs text-[#E8F0FE]">
                identity_verified_on
              </code>{" "}
              fields on the existing directors and PSC endpoints are available on{" "}
              <span className="text-[#E8F0FE]">all plans</span>.
            </p>
            <div className="mt-4">
              <Link
                href="/#pricing"
                className="text-sm font-medium text-[#4F7BFF] hover:text-[#6B93FF]"
              >
                View pricing plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            Start monitoring ECCTA compliance
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[#7A8FAD]">
            Get a free API key and check verification status on your first call.
            No credit card required.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/#get-key"
              className="rounded-lg bg-[#4F7BFF] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#6B93FF]"
            >
              Get free API key
            </Link>
            <a
              href="https://api.registrum.co.uk/docs#/Compliance"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/[0.10] px-6 py-3 text-sm font-medium text-[#E8F0FE] transition-colors hover:border-white/20 hover:bg-white/[0.04]"
            >
              View API docs
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 text-center text-xs text-[#3D5275] sm:flex-row sm:justify-between">
          <span>2025 Registrum. Companies House data licensed under OGL v3.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
