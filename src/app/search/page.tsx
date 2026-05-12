import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import SearchClient from "./SearchClient";
import SiteNav from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "Search UK Companies · Registrum",
  description:
    "Search any UK company by name and get live data from Companies House — structured financials, director networks, and beneficial ownership.",
};

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-[#060D1B] text-[#E8F0FE] font-[family-name:var(--font-geist-sans)]">
      <SiteNav maxWidth="3xl" />

      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Search any UK company
          </h1>
          <p className="mt-3 text-[#7A8FAD]">
            Live data from Companies House — financials, director networks, and ownership.
          </p>
        </div>

        <Suspense>
          <SearchClient />
        </Suspense>

        <div className="mt-10 rounded-xl border border-white/[0.06] bg-white/[0.02] px-6 py-5 text-center">
          <p className="text-sm font-medium text-white">No account yet?</p>
          <p className="mt-1 text-sm text-[#7A8FAD]">
            Create a free account — 50 API calls/month, no credit card required.
            Or upgrade for up to 4,000 calls/month.
          </p>
          <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
            <a
              href="/#get-key"
              className="rounded-md bg-[#4F7BFF] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6B93FF]"
            >
              Create free account →
            </a>
            <Link
              href="/#pricing"
              className="text-sm text-[#7A8FAD] hover:text-white"
            >
              View pricing
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
