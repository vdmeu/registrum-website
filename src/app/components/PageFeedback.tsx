"use client";

import { useState } from "react";

type State = "idle" | "down_expand" | "submitting" | "done";

interface PageFeedbackProps {
  pageUrl: string;
}

export default function PageFeedback({ pageUrl }: PageFeedbackProps) {
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");

  async function submit(sentiment: "up" | "down", msg: string) {
    setState("submitting");
    try {
      await fetch("/api/page-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page_url: pageUrl, sentiment, message: msg }),
      });
    } catch {
      // Swallow silently — never block the page
    }
    setState("done");
  }

  function handleThumbUp() {
    submit("up", "");
  }

  function handleThumbDown() {
    setState("down_expand");
  }

  if (state === "done") {
    return (
      <div className="mt-16 border-t border-white/[0.06] pt-8 text-center text-sm text-[#7A8FAD]">
        Thank you for your feedback.
      </div>
    );
  }

  return (
    <div className="mt-16 border-t border-white/[0.06] pt-8">
      <p className="mb-4 text-center text-sm text-[#7A8FAD]">Was this page helpful?</p>
      <div className="flex justify-center gap-3">
        <button
          onClick={handleThumbUp}
          disabled={state === "submitting"}
          className="flex items-center gap-2 rounded-md border border-white/[0.06] px-4 py-2 text-sm text-[#7A8FAD] transition-colors hover:border-[#22D3A0]/40 hover:text-[#22D3A0] disabled:opacity-50"
        >
          👍 Yes
        </button>
        <button
          onClick={handleThumbDown}
          disabled={state === "submitting"}
          className="flex items-center gap-2 rounded-md border border-white/[0.06] px-4 py-2 text-sm text-[#7A8FAD] transition-colors hover:border-red-500/40 hover:text-red-400 disabled:opacity-50"
        >
          👎 No
        </button>
      </div>

      {state === "down_expand" && (
        <div className="mx-auto mt-4 max-w-md px-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What was missing or unclear? (optional)"
            rows={3}
            className="w-full rounded-md border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm text-[#E8F0FE] placeholder-[#3D5275] focus:border-[#22D3A0]/40 focus:outline-none resize-none"
          />
          <button
            onClick={() => submit("down", message)}
            className="mt-2 w-full rounded-md bg-white/[0.06] px-4 py-2 text-sm font-medium text-[#E8F0FE] transition-colors hover:bg-white/[0.10]"
          >
            Send feedback
          </button>
        </div>
      )}
    </div>
  );
}
