import Link from "next/link";

export default function ReportSuccessPage() {
  return (
    <div className="min-h-screen bg-[#060D1B] text-[#E8F0FE] font-[family-name:var(--font-geist-sans)] flex flex-col">
      {/* Nav */}
      <header className="border-b border-white/[0.06] bg-[#060D1B]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight text-white">
            Registrum
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <div className="mx-auto max-w-md text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10">
            <svg
              className="h-8 w-8 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-white">Payment complete</h1>
          <p className="mt-3 text-[#7A8FAD] leading-relaxed">
            Your report is being generated. Check your inbox - it will arrive within 60 seconds.
          </p>

          <div className="mt-8 rounded-xl border border-white/[0.06] bg-white/[0.02] px-6 py-5 text-left space-y-3">
            <div className="flex gap-3">
              <span className="shrink-0 text-green-400">&#10003;</span>
              <p className="text-sm text-[#7A8FAD]">Live data pulled from Companies House</p>
            </div>
            <div className="flex gap-3">
              <span className="shrink-0 text-green-400">&#10003;</span>
              <p className="text-sm text-[#7A8FAD]">Director history and PSC ownership chain</p>
            </div>
            <div className="flex gap-3">
              <span className="shrink-0 text-green-400">&#10003;</span>
              <p className="text-sm text-[#7A8FAD]">Risk flags and AI-generated verdict</p>
            </div>
          </div>

          <p className="mt-6 text-xs text-[#3D5275]">
            Didn&apos;t receive it after 2 minutes?{" "}
            <a href="mailto:support@registrum.co.uk" className="text-[#4F7BFF] hover:underline">
              Contact support
            </a>
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/report"
              className="rounded-lg bg-[#4F7BFF] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#6B93FF]"
            >
              Get another report
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-white/[0.1] px-5 py-2.5 text-sm font-medium text-[#7A8FAD] hover:text-white"
            >
              Back to home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
