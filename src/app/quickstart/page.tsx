import type { Metadata } from "next";
import QuickstartClient from "./QuickstartClient";
import PageFeedback from "@/app/components/PageFeedback";
import SiteNav from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "Quickstart — Registrum API",
  description:
    "Integrate the Registrum Companies House API in 10 minutes. Step-by-step guide: register, make your first call, explore financials, deploy to production.",
};

export default function QuickstartPage() {
  return (
    <div className="min-h-screen bg-[#060D1B] text-[#E8F0FE] font-[family-name:var(--font-geist-sans)]">
      <QuickstartNav />
      <main className="mx-auto max-w-6xl px-6 pb-32 pt-16">
        <div className="mb-12">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#4F7BFF]/20 bg-[#4F7BFF]/10 px-3 py-1 text-xs font-medium text-[#4F7BFF]">
            Quickstart
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Integration in 10 minutes
          </h1>
          <p className="mt-3 max-w-xl text-[#7A8FAD]">
            Follow these steps to go from zero to a working API call. All examples use Tesco PLC
            (company number <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">00445790</code>) as the reference company.
          </p>
        </div>
        <QuickstartClient />
        <PageFeedback pageUrl="/quickstart" />
      </main>
    </div>
  );
}

function QuickstartNav() {
  return (
    <SiteNav maxWidth="6xl" />
  );
}
