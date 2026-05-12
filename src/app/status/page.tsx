import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "API Status · Registrum",
  description: "Registrum API uptime and status.",
};

// TODO: Replace with Better Stack public status page URL once account is created.
// e.g. https://registrum.betteruptime.com
const STATUS_PAGE_URL = "https://api.registrum.co.uk/v1/health";

export default function Status() {
  return (
    <div className="min-h-screen bg-[#060D1B] text-[#E8F0FE] font-[family-name:var(--font-geist-sans)] flex flex-col">
      <SiteNav maxWidth="6xl" />

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-6 flex items-center gap-2 rounded-full border border-[#22D3A0]/30 bg-[#22D3A0]/10 px-4 py-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22D3A0] opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#22D3A0]" />
          </span>
          <span className="text-sm font-medium text-[#22D3A0]">API Operational</span>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Registrum API Status
        </h1>
        <p className="mt-4 max-w-sm text-[#7A8FAD]">
          Check the live API health endpoint for current status. A full uptime dashboard
          is coming soon.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
          <a
            href={STATUS_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-[#4F7BFF] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#6B93FF]"
          >
            View live health check →
          </a>
          <Link
            href="/"
            className="rounded-md border border-white/10 px-5 py-2.5 text-sm font-medium text-[#E8F0FE] transition-colors hover:border-white/20 hover:bg-white/5"
          >
            Back to homepage
          </Link>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3 max-w-lg">
          {[
            { label: "API Endpoint", value: "api.registrum.co.uk" },
            { label: "Cache layer", value: "Supabase (EU)" },
            { label: "Hosting", value: "Railway (Frankfurt)" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4"
            >
              <div className="text-xs text-[#3D5275]">{item.label}</div>
              <div className="mt-1 text-sm font-medium text-white">{item.value}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
