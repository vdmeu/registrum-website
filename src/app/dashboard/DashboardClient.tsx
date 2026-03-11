"use client";

import { useState } from "react";

export default function DashboardClient() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleRotate() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setStatus("loading");
    setConfirming(false);

    const res = await fetch("/api/dashboard/rotate-key", { method: "POST" }).catch(() => null);
    if (!res || !res.ok) {
      setStatus("error");
      return;
    }
    const data = await res.json();
    setNewKey(data.new_key);
    setStatus("done");
  }

  async function copyKey() {
    if (!newKey) return;
    await navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (status === "done" && newKey) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-[#22D3A0]/20 bg-[#22D3A0]/5 px-4 py-3">
          <p className="text-xs font-medium text-[#22D3A0] mb-2">New key generated — copy it now, it won't be shown again.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-[#060D1B] px-3 py-2 font-[family-name:var(--font-geist-mono)] text-xs text-[#E8F0FE] break-all">
              {newKey}
            </code>
            <button
              onClick={copyKey}
              className="shrink-0 rounded bg-[#4F7BFF] px-3 py-2 text-xs font-medium text-white hover:bg-[#6B93FF]"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
        <p className="text-xs text-[#3D5275]">Your old key is now deactivated. Update any integrations that use it.</p>
      </div>
    );
  }

  if (status === "error") {
    return <p className="text-sm text-red-400">Rotation failed. Please try again or contact support.</p>;
  }

  return (
    <div className="space-y-3">
      {confirming ? (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 space-y-3">
          <p className="text-sm text-amber-300">
            This will immediately deactivate your current key. Any integrations using it will stop working until you update them.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleRotate}
              disabled={status === "loading"}
              className="rounded bg-amber-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-amber-400 disabled:opacity-60"
            >
              {status === "loading" ? "Rotating…" : "Yes, rotate key"}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="rounded border border-white/10 px-4 py-1.5 text-sm text-[#7A8FAD] hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleRotate}
          className="rounded-md border border-white/[0.08] px-4 py-2 text-sm text-[#7A8FAD] hover:border-white/20 hover:text-white transition-colors"
        >
          Rotate key
        </button>
      )}
    </div>
  );
}
