"use client";

import { useState } from "react";

export default function KeySignupForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Could not reach the server. Check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="mt-8 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-[#22D3A0]/30 bg-[#22D3A0]/10 px-4 py-2.5 text-sm font-medium text-[#22D3A0]">
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
          </svg>
          Account created — check your inbox for your API key.
        </div>
        <p className="text-xs text-[#3D5275]">
          Your email is your login. Use it at{" "}
          <a href="/dashboard" className="text-[#4F7BFF] hover:underline">registrum.co.uk/dashboard</a>{" "}
          to manage your key and look up companies.
        </p>
        <a
          href="/search"
          className="mt-1 rounded-md border border-white/10 px-5 py-2 text-sm font-medium text-[#E8F0FE] transition-colors hover:border-white/20 hover:bg-white/5"
        >
          While you wait — search live company data →
        </a>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-2">
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full rounded-md border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white placeholder-[#3D5275] outline-none transition-colors focus:border-[#4F7BFF]/50 focus:bg-white/[0.08] sm:w-72"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-md bg-[#4F7BFF] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#6B93FF] disabled:opacity-60"
        >
          {status === "loading" ? "Creating account..." : "Create free account →"}
        </button>
      </form>
      {status === "error" && (
        <p className="text-xs text-red-400">{errorMsg}</p>
      )}
    </div>
  );
}
