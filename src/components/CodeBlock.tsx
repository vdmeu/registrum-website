"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/language-context";

interface CodeBlockProps {
  code: string;
  language?: string;
  /** If provided, renders a tab row above the block for language switching */
  languages?: { label: string; code: string }[];
  className?: string;
}

export default function CodeBlock({ code, language, languages, className = "" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const { lang, setLang } = useLanguage();

  // When languages are provided, derive active index from global context.
  // Fall back to 0 if context lang doesn't match any tab.
  const contextIdx = languages ? languages.findIndex((l) => l.label === lang) : -1;
  const activeIdx = languages && contextIdx >= 0 ? contextIdx : 0;

  const displayCode = languages ? languages[activeIdx].code : code;
  const displayLabel = languages ? languages[activeIdx].label : language;

  function handleTabClick(idx: number) {
    if (languages) setLang(languages[idx].label);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(displayCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — silent fail
    }
  }

  return (
    <div className={`overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A1628] ${className}`}>
      {/* Header: window chrome + language tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        </div>

        {/* Language tabs */}
        {languages ? (
          <div className="ml-2 flex items-center gap-0.5">
            {languages.map((l, idx) => (
              <button
                key={l.label}
                onClick={() => handleTabClick(idx)}
                className={`rounded px-2 py-0.5 text-xs transition-colors ${
                  idx === activeIdx
                    ? "bg-white/[0.08] text-[#E8F0FE]"
                    : "text-[#3D5275] hover:text-[#7A8FAD]"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        ) : displayLabel ? (
          <span className="ml-2 text-xs text-[#3D5275]">{displayLabel}</span>
        ) : null}

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="ml-auto flex items-center gap-1 rounded px-2 py-0.5 text-xs text-[#3D5275] transition-colors hover:text-[#7A8FAD]"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <svg className="h-3.5 w-3.5 text-[#22D3A0]" viewBox="0 0 16 16" fill="currentColor">
                <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
              </svg>
              <span className="text-[#22D3A0]">Copied</span>
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <pre className="overflow-x-auto px-5 py-4 font-[family-name:var(--font-geist-mono)] text-sm leading-relaxed text-[#E8F0FE]">
        <code>{displayCode}</code>
      </pre>
    </div>
  );
}
