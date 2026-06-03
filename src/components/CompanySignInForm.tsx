"use client";

import { useState } from "react";

interface Props {
  companyName: string;
  companyNumber: string;
}

export default function CompanySignInForm({ companyName, companyNumber }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const res = await fetch("/api/company-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), returnUrl: `/company/${companyNumber}` }),
    }).catch(() => null);

    if (!res || !res.ok) {
      const data = await res?.json().catch(() => ({}));
      setErrorMsg(data?.error ?? "Something went wrong. Please try again.");
      setStatus("error");
      return;
    }

    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="rounded-lg border border-[#22D3A0]/20 bg-[#22D3A0]/5 px-5 py-4">
        <p className="text-sm font-medium text-[#22D3A0]">Check your inbox</p>
        <p className="mt-1 text-sm text-[#7A8FAD]">
          A link to view {companyName}&apos;s live data is on its way to {email}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        className="flex-1 rounded-md border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white placeholder-[#3D5275] outline-none transition-colors focus:border-[#4F7BFF]/50 focus:bg-white/[0.08]"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="shrink-0 rounded-md bg-[#4F7BFF] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6B93FF] disabled:opacity-60"
      >
        {status === "loading" ? "Sending..." : "Get live data →"}
      </button>
      {errorMsg && <p className="mt-1 text-xs text-red-400 sm:col-span-2">{errorMsg}</p>}
    </form>
  );
}
