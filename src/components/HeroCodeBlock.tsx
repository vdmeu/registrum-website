"use client";

import { useLanguage } from "@/lib/language-context";

const HERO_LANGS = ["curl", "Python", "Node.js"] as const;

const HERO_SNIPPETS: Record<string, { lines: { text: string; color?: string }[] }> = {
  curl: {
    lines: [
      { text: "# Request", color: "#3D5275" },
      { text: `curl -H "X-API-Key: reg_live_..." \\`, color: "#7A8FAD" },
      { text: `  "https://api.registrum.co.uk/v1/company/00445790"`, color: "#E8F0FE" },
    ],
  },
  Python: {
    lines: [
      { text: "# Request", color: "#3D5275" },
      { text: "import requests", color: "#7A8FAD" },
      { text: `r = requests.get(`, color: "#7A8FAD" },
      { text: `    "https://api.registrum.co.uk/v1/company/00445790",`, color: "#E8F0FE" },
      { text: `    headers={"X-API-Key": "reg_live_..."},`, color: "#22D3A0" },
      { text: ")", color: "#7A8FAD" },
    ],
  },
  "Node.js": {
    lines: [
      { text: "// Request", color: "#3D5275" },
      { text: "const res = await fetch(", color: "#7A8FAD" },
      { text: `  "https://api.registrum.co.uk/v1/company/00445790",`, color: "#E8F0FE" },
      { text: `  { headers: { "X-API-Key": "reg_live_..." } }`, color: "#22D3A0" },
      { text: ");", color: "#7A8FAD" },
    ],
  },
};

export default function HeroCodeBlock() {
  const { lang, setLang } = useLanguage();
  const activeLang = HERO_LANGS.includes(lang as (typeof HERO_LANGS)[number]) ? lang : "curl";
  const snippet = HERO_SNIPPETS[activeLang];

  return (
    <div className="min-w-0 rounded-xl border border-white/[0.08] bg-[#0A1628] p-1">
      {/* Window chrome + language tabs */}
      <div className="flex items-center gap-2 px-4 py-3">
        <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
        <div className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
        <div className="h-3 w-3 rounded-full bg-[#28C840]" />
        <div className="ml-2 flex items-center gap-0.5">
          {HERO_LANGS.map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`rounded px-2 py-0.5 text-xs transition-colors ${
                l === activeLang
                  ? "bg-white/[0.08] text-[#E8F0FE]"
                  : "text-[#3D5275] hover:text-[#7A8FAD]"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Request */}
      <div className="overflow-x-auto rounded-lg bg-[#060D1B] px-5 py-5 font-[family-name:var(--font-geist-mono)] text-sm leading-relaxed">
        {snippet.lines.map((line, i) => (
          <p key={i} style={{ color: line.color ?? "#E8F0FE" }}>
            {line.text}
          </p>
        ))}

        {/* Response — always the same */}
        <p className="mt-4 text-[#3D5275]"># Response</p>
        <p className="mt-1 text-[#7A8FAD]">{"{"}</p>
        <p className="pl-4">
          <span className="text-[#4F7BFF]">&quot;company_name&quot;</span>
          <span className="text-[#7A8FAD]">: </span>
          <span className="text-[#22D3A0]">&quot;TESCO PLC&quot;</span>
          <span className="text-[#7A8FAD]">,</span>
        </p>
        <p className="pl-4">
          <span className="text-[#4F7BFF]">&quot;company_age_years&quot;</span>
          <span className="text-[#7A8FAD]">: </span>
          <span className="text-[#F97316]">104</span>
          <span className="text-[#7A8FAD]">,</span>
        </p>
        <p className="pl-4">
          <span className="text-[#4F7BFF]">&quot;turnover&quot;</span>
          <span className="text-[#7A8FAD]">: </span>
          <span className="text-[#F97316]">68190000000</span>
          <span className="text-[#7A8FAD]">,</span>
        </p>
        <p className="pl-4">
          <span className="text-[#4F7BFF]">&quot;accounts_overdue&quot;</span>
          <span className="text-[#7A8FAD]">: </span>
          <span className="text-[#F97316]">false</span>
          <span className="text-[#7A8FAD]">,</span>
        </p>
        <p className="pl-4">
          <span className="text-[#4F7BFF]">&quot;credits_remaining&quot;</span>
          <span className="text-[#7A8FAD]">: </span>
          <span className="text-[#F97316]">49</span>
        </p>
        <p className="text-[#7A8FAD]">{"}"}</p>
      </div>
    </div>
  );
}
