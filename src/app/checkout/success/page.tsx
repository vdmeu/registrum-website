"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [plan, setPlan] = useState<"pro" | "web" | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setReady(true);
      return;
    }

    fetch("/api/web-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.token) {
          // Web plan — set wsid cookie
          document.cookie = `wsid=${data.token}; max-age=${60 * 60 * 24 * 365}; path=/; samesite=lax`;
          setPlan("web");
        } else {
          setPlan("pro");
        }
      })
      .catch(() => {
        setPlan("pro");
      })
      .finally(() => {
        setReady(true);
      });
  }, [sessionId]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#060D1B] flex items-center justify-center">
        <svg className="h-6 w-6 animate-spin text-[#4F7BFF]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060D1B] text-[#E8F0FE] flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#22D3A0]/10">
            <svg className="h-8 w-8 text-[#22D3A0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {plan === "web" ? (
          <>
            <h1 className="text-2xl font-semibold text-white mb-3">
              Unlimited lookups unlocked
            </h1>
            <p className="text-[#7A8FAD] mb-8">
              Your Web subscription is active. You can now look up any UK company without limits.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/"
                className="rounded-md bg-[#4F7BFF] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#6B93FF] transition-colors"
              >
                Search companies
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-white mb-3">{"You're on Pro"}</h1>
            <p className="text-[#7A8FAD] mb-8">
              Check your inbox — your Pro API key is on its way. It might take a minute to arrive.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/quickstart"
                className="rounded-md bg-[#4F7BFF] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#6B93FF] transition-colors"
              >
                Quickstart guide
              </Link>
              <Link
                href="/"
                className="rounded-md border border-white/10 px-6 py-2.5 text-sm font-medium text-[#E8F0FE] hover:border-white/20 hover:bg-white/5 transition-colors"
              >
                Back to home
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function CheckoutSuccess() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#060D1B] flex items-center justify-center">
          <svg className="h-6 w-6 animate-spin text-[#4F7BFF]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
