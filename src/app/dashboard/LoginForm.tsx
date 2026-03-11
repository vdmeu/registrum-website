"use client";

import { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const res = await fetch("/api/dashboard/send-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null);

    if (!res || !res.ok) {
      const data = await res?.json().catch(() => ({}));
      setError(data?.error ?? "Something went wrong. Please try again.");
      setStatus("idle");
      return;
    }

    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="rounded-xl border border-[#22D3A0]/20 bg-[#22D3A0]/5 px-5 py-4 text-center">
        <p className="text-sm font-medium text-[#22D3A0]">Check your inbox</p>
        <p className="mt-1 text-sm text-[#7A8FAD]">
          If {email} has an active key, a login link is on its way. Check spam if it doesn't arrive within 2 minutes.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        className="w-full rounded-md border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white placeholder-[#3D5275] outline-none focus:border-[#4F7BFF]/50 focus:bg-white/[0.08]"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-md bg-[#4F7BFF] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#6B93FF] disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : "Send login link →"}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </form>
  );
}
