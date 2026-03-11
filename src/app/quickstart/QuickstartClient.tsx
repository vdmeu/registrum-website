"use client";

import { useState, useRef, useEffect } from "react";
import CodeBlock from "@/components/CodeBlock";
import KeySignupForm from "@/components/KeySignupForm";

/* ─── Code snippets per language ─────────────────────────────────────────── */

const FIRST_CALL_SNIPPETS = [
  {
    label: "curl",
    code: `curl -H "X-API-Key: reg_live_YOUR_KEY_HERE" \\
  "https://api.registrum.co.uk/v1/company/00445790"`,
  },
  {
    label: "Python",
    code: `import requests

r = requests.get(
    "https://api.registrum.co.uk/v1/company/00445790",
    headers={"X-API-Key": "reg_live_YOUR_KEY_HERE"},
)
print(r.json())`,
  },
  {
    label: "Node.js",
    code: `const res = await fetch(
  "https://api.registrum.co.uk/v1/company/00445790",
  { headers: { "X-API-Key": "reg_live_YOUR_KEY_HERE" } }
);
const data = await res.json();
console.log(data);`,
  },
];

const FINANCIALS_SNIPPETS = [
  {
    label: "curl",
    code: `curl -H "X-API-Key: reg_live_YOUR_KEY_HERE" \\
  "https://api.registrum.co.uk/v1/company/00445790/financials"`,
  },
  {
    label: "Python",
    code: `r = requests.get(
    "https://api.registrum.co.uk/v1/company/00445790/financials",
    headers={"X-API-Key": "reg_live_YOUR_KEY_HERE"},
)
financials = r.json()["data"]
print(financials["profit_and_loss"]["turnover"])`,
  },
  {
    label: "Node.js",
    code: `const res = await fetch(
  "https://api.registrum.co.uk/v1/company/00445790/financials",
  { headers: { "X-API-Key": "reg_live_YOUR_KEY_HERE" } }
);
const { data } = await res.json();
console.log(data.profit_and_loss.turnover);`,
  },
];

const PRODUCTION_SNIPPETS = [
  {
    label: "curl",
    code: `# Set the env var in your shell:
export REGISTRUM_API_KEY="reg_live_YOUR_KEY_HERE"

# Then use it:
curl -H "X-API-Key: $REGISTRUM_API_KEY" \\
  "https://api.registrum.co.uk/v1/company/00445790"`,
  },
  {
    label: "Python",
    code: `import os
import requests

api_key = os.environ["REGISTRUM_API_KEY"]  # never hardcode

r = requests.get(
    "https://api.registrum.co.uk/v1/company/00445790",
    headers={"X-API-Key": api_key},
)
data = r.json()`,
  },
  {
    label: "Node.js",
    code: `// .env file: REGISTRUM_API_KEY=reg_live_...
// Load with dotenv or native Node 20+ --env-file

const apiKey = process.env.REGISTRUM_API_KEY;

const res = await fetch(
  "https://api.registrum.co.uk/v1/company/00445790",
  { headers: { "X-API-Key": apiKey } }
);`,
  },
];

const NETWORK_SNIPPETS = [
  {
    label: "curl",
    code: `curl -H "X-API-Key: reg_live_YOUR_KEY_HERE" \\
  "https://api.registrum.co.uk/v1/company/00445790/network?depth=1"`,
  },
  {
    label: "Python",
    code: `r = requests.get(
    "https://api.registrum.co.uk/v1/company/00445790/network",
    params={"depth": 1},
    headers={"X-API-Key": "reg_live_YOUR_KEY_HERE"},
)
network = r.json()["data"]
print(f"{len(network['companies'])} connected companies found")`,
  },
  {
    label: "Node.js",
    code: `const res = await fetch(
  "https://api.registrum.co.uk/v1/company/00445790/network?depth=1",
  { headers: { "X-API-Key": "reg_live_YOUR_KEY_HERE" } }
);
const { data } = await res.json();
console.log(\`\${data.companies.length} connected companies\`);`,
  },
];

/* ─── Annotated JSON response ─────────────────────────────────────────────── */

const ANNOTATED_FIELDS = [
  {
    key: '"company_name"',
    value: '"TESCO PLC"',
    color: "#22D3A0",
    tag: "raw",
    note: "From CH API",
  },
  {
    key: '"company_number"',
    value: '"00445790"',
    color: "#22D3A0",
    tag: "raw",
    note: "From CH API",
  },
  {
    key: '"company_status"',
    value: '"active"',
    color: "#22D3A0",
    tag: "raw",
    note: "From CH API",
  },
  {
    key: '"company_age_years"',
    value: "78",
    color: "#4F7BFF",
    tag: "enriched",
    note: "Computed by Registrum",
  },
  {
    key: '"accounts"',
    value: '{ "overdue": false, "next_due": "2024-07-24" }',
    color: "#4F7BFF",
    tag: "enriched",
    note: "overdue boolean computed",
  },
  {
    key: '"sic_codes"',
    value: '["47110"]',
    color: "#22D3A0",
    tag: "raw",
    note: "From CH API",
  },
  {
    key: '"cached"',
    value: "true",
    color: "#7A8FAD",
    tag: "meta",
    note: "Infrastructure metadata",
  },
  {
    key: '"credits_remaining"',
    value: "49",
    color: "#7A8FAD",
    tag: "meta",
    note: "Your quota remaining",
  },
];

/* ─── Steps config ─────────────────────────────────────────────────────────── */

const MCP_SNIPPETS = [
  {
    label: "Claude Desktop",
    code: `// ~/.claude/claude_desktop_config.json
{
  "mcpServers": {
    "registrum": {
      "command": "npx",
      "args": ["-y", "@registrum/mcp"],
      "env": {
        "REGISTRUM_API_KEY": "reg_live_YOUR_KEY_HERE"
      }
    }
  }
}`,
  },
  {
    label: "Cursor",
    code: `// .cursor/mcp.json (project) or ~/.cursor/mcp.json (global)
{
  "mcpServers": {
    "registrum": {
      "command": "npx",
      "args": ["-y", "@registrum/mcp"],
      "env": {
        "REGISTRUM_API_KEY": "reg_live_YOUR_KEY_HERE"
      }
    }
  }
}`,
  },
];

const STEPS = [
  { id: "register", label: "Register" },
  { id: "first-call", label: "First call" },
  { id: "understand", label: "Understand" },
  { id: "financials", label: "Add financials" },
  { id: "production", label: "Go to production" },
  { id: "mcp", label: "Use with AI" },
];

/* ─── Main component ──────────────────────────────────────────────────────── */

export default function QuickstartClient() {
  const [activeStep, setActiveStep] = useState("register");
  const [liveResult, setLiveResult] = useState<string | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const stepRefs = useRef<Record<string, HTMLElement | null>>({});

  // Intersection observer: update active step as user scrolls
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveStep(entry.target.id);
          }
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    for (const ref of Object.values(stepRefs.current)) {
      if (ref) observer.observe(ref);
    }
    return () => observer.disconnect();
  }, []);

  async function runLiveExample() {
    setLiveLoading(true);
    setLiveResult(null);
    try {
      const res = await fetch("/api/demo?company=00445790");
      const data = await res.json();
      setLiveResult(JSON.stringify(data.data ?? data, null, 2));
    } catch {
      setLiveResult("Error: could not reach the API. Try again.");
    } finally {
      setLiveLoading(false);
    }
  }

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveStep(id);
  }

  return (
    <div className="flex gap-16 lg:relative">
      {/* Sticky step nav (desktop) */}
      <aside className="hidden lg:block lg:w-44 lg:shrink-0">
        <nav className="sticky top-28 flex flex-col gap-1">
          {STEPS.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => scrollTo(step.id)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                activeStep === step.id
                  ? "bg-white/[0.05] text-white"
                  : "text-[#3D5275] hover:text-[#7A8FAD]"
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  activeStep === step.id
                    ? "bg-[#4F7BFF] text-white"
                    : "border border-white/[0.10] text-[#3D5275]"
                }`}
              >
                {idx + 1}
              </span>
              {step.label}
            </button>
          ))}

          <div className="mt-6 border-t border-white/[0.06] pt-4 text-xs text-[#3D5275]">
            <p className="mb-2 font-medium text-[#7A8FAD]">Reference</p>
            <a
              href="https://api.registrum.co.uk/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:text-white"
            >
              Full API docs →
            </a>
            <a href="/financials-example" className="mt-1 block hover:text-white">
              Financial data example →
            </a>
            <a
              href="https://www.npmjs.com/package/@registrum/mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block hover:text-white"
            >
              MCP server →
            </a>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className="min-w-0 flex-1 space-y-20">

        {/* Step 1: Register */}
        <section
          id="register"
          ref={(el) => { stepRefs.current["register"] = el; }}
          className="scroll-mt-24"
        >
          <StepHeader number={1} title="Register and get your API key" time="2 min" />
          <p className="mt-4 text-[#7A8FAD]">
            Enter your email to get a free API key. No credit card required. Your key arrives in
            your inbox within seconds.
          </p>
          <p className="mt-2 text-sm text-[#3D5275]">
            No Companies House developer account needed — your Registrum key is the only credential
            required. Registrum handles the CH API on your behalf.
          </p>
          <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <p className="text-sm text-[#7A8FAD]">
              Free tier: <strong className="text-[#E8F0FE]">50 calls per month</strong>, all
              endpoints available. No credit card required. Your key looks like:{" "}
              <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">
                reg_live_a1b2c3...
              </code>
            </p>
            <KeySignupForm />
          </div>
          <div className="mt-4 rounded-lg border border-[#22D3A0]/20 bg-[#22D3A0]/5 px-4 py-3 text-sm text-[#7A8FAD]">
            <strong className="text-[#22D3A0]">Tip:</strong> If you just want to explore, the
            Swagger UI at{" "}
            <a
              href="https://api.registrum.co.uk/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4F7BFF] hover:underline"
            >
              api.registrum.co.uk/docs
            </a>{" "}
            lets you test every endpoint in the browser — just click Authorize and enter your key.
          </div>
        </section>

        {/* Step 2: First call */}
        <section
          id="first-call"
          ref={(el) => { stepRefs.current["first-call"] = el; }}
          className="scroll-mt-24"
        >
          <StepHeader number={2} title="Make your first call" time="3 min" />
          <p className="mt-4 text-[#7A8FAD]">
            Fetch an enriched company profile. We&apos;ll use Tesco PLC (
            <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">00445790</code>)
            as the example — a large, well-documented company with full accounts.
          </p>

          <CodeBlock
            code=""
            languages={FIRST_CALL_SNIPPETS}
            className="mt-5"
          />

          {/* Live runner */}
          <div className="mt-4">
            <button
              onClick={runLiveExample}
              disabled={liveLoading}
              className="flex items-center gap-2 rounded-md border border-[#22D3A0]/30 bg-[#22D3A0]/5 px-4 py-2 text-sm text-[#22D3A0] transition-colors hover:bg-[#22D3A0]/10 disabled:opacity-60"
            >
              {liveLoading ? (
                <>
                  <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Running...
                </>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                  </svg>
                  Run this live →
                </>
              )}
            </button>
            <p className="mt-1.5 text-xs text-[#3D5275]">
              Uses the demo key. Results are real data from the Companies House API.
            </p>
          </div>

          {liveResult && (
            <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A1628]">
              <div className="border-b border-white/[0.06] px-4 py-2 text-xs text-[#22D3A0]">
                Live response
              </div>
              <pre className="max-h-64 overflow-auto px-5 py-4 font-[family-name:var(--font-geist-mono)] text-xs leading-relaxed text-[#E8F0FE]">
                {liveResult}
              </pre>
            </div>
          )}
        </section>

        {/* Step 3: Understand the response */}
        <section
          id="understand"
          ref={(el) => { stepRefs.current["understand"] = el; }}
          className="scroll-mt-24"
        >
          <StepHeader number={3} title="Understand the response" time="2 min" />
          <p className="mt-4 text-[#7A8FAD]">
            Every response is wrapped in an{" "}
            <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">APIResponse</code>{" "}
            envelope. Hover over the fields below to see what&apos;s enriched vs raw.
          </p>

          <div className="mt-5 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A1628]">
            <div className="border-b border-white/[0.06] px-4 py-2.5 text-xs text-[#3D5275]">
              JSON response
            </div>
            <div className="px-5 py-4 font-[family-name:var(--font-geist-mono)] text-sm leading-relaxed">
              <p className="text-[#7A8FAD]">{"{"}</p>
              <p className="pl-4">
                <span className="text-[#4F7BFF]">&quot;status&quot;</span>
                <span className="text-[#7A8FAD]">: </span>
                <span className="text-[#22D3A0]">&quot;success&quot;</span>
                <span className="text-[#7A8FAD]">,</span>
              </p>
              <p className="pl-4">
                <span className="text-[#4F7BFF]">&quot;cached&quot;</span>
                <span className="text-[#7A8FAD]">: </span>
                <span className="text-[#F97316]">true</span>
                <span className="text-[#7A8FAD]">, </span>
                <span className="text-[#3D5275]">// served from cache — no CH API call made</span>
              </p>
              <p className="pl-4">
                <span className="text-[#4F7BFF]">&quot;credits_remaining&quot;</span>
                <span className="text-[#7A8FAD]">: </span>
                <span className="text-[#F97316]">49</span>
                <span className="text-[#7A8FAD]">, </span>
                <span className="text-[#3D5275]">// your monthly quota remaining</span>
              </p>
              <p className="pl-4">
                <span className="text-[#4F7BFF]">&quot;data&quot;</span>
                <span className="text-[#7A8FAD]">: {"{"}</span>
              </p>

              {ANNOTATED_FIELDS.map((f) => (
                <div key={f.key} className="group relative pl-8">
                  <p>
                    <span style={{ color: "#4F7BFF" }}>{f.key}</span>
                    <span className="text-[#7A8FAD]">: </span>
                    <span style={{ color: f.color }}>{f.value}</span>
                    <span className="text-[#7A8FAD]">,</span>
                    <span
                      className="ml-3 rounded px-1.5 py-0.5 text-xs"
                      style={{
                        background: f.tag === "enriched" ? "rgba(79,123,255,0.12)" : f.tag === "raw" ? "rgba(34,211,160,0.08)" : "rgba(255,255,255,0.04)",
                        color: f.tag === "enriched" ? "#4F7BFF" : f.tag === "raw" ? "#22D3A0" : "#3D5275",
                      }}
                    >
                      {f.note}
                    </span>
                  </p>
                </div>
              ))}

              <p className="pl-4 text-[#7A8FAD]">{"  }"}</p>
              <p className="text-[#7A8FAD]">{"}"}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { color: "#22D3A0", label: "Raw field", desc: "Passed through from Companies House API" },
              { color: "#4F7BFF", label: "Enriched field", desc: "Computed or derived by Registrum" },
              { color: "#7A8FAD", label: "Metadata", desc: "Infrastructure — caching, quota, request ID" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                <div className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: item.color }} />
                <div>
                  <div className="text-xs font-medium text-[#E8F0FE]">{item.label}</div>
                  <div className="mt-0.5 text-xs text-[#3D5275]">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Step 4: Financials */}
        <section
          id="financials"
          ref={(el) => { stepRefs.current["financials"] = el; }}
          className="scroll-mt-24"
        >
          <StepHeader number={4} title="Add financials" time="2 min" />
          <p className="mt-4 text-[#7A8FAD]">
            The <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">/financials</code>{" "}
            endpoint parses the company&apos;s iXBRL filing and returns structured financial data —
            revenue, profit, net assets, employees — as clean JSON. No XBRL parsing required.
          </p>
          <p className="mt-2 text-sm text-[#3D5275]">
            Financials are cached for 7 days. The response includes a{" "}
            <code className="font-[family-name:var(--font-geist-mono)]">data_quality</code> object
            explaining exactly what was extracted and what wasn&apos;t available.
          </p>

          <CodeBlock
            code=""
            languages={FINANCIALS_SNIPPETS}
            className="mt-5"
          />

          <div className="mt-5 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A1628]">
            <div className="border-b border-white/[0.06] px-4 py-2.5 text-xs text-[#3D5275]">
              Example response (abbreviated)
            </div>
            <div className="px-5 py-4 font-[family-name:var(--font-geist-mono)] text-sm leading-relaxed">
              <p className="text-[#7A8FAD]">{"{"}</p>
              <p className="pl-4">
                <span className="text-[#4F7BFF]">&quot;accounts_type&quot;</span>
                <span className="text-[#7A8FAD]">: </span>
                <span className="text-[#22D3A0]">&quot;full&quot;</span>
                <span className="text-[#7A8FAD]">,</span>
              </p>
              <p className="pl-4">
                <span className="text-[#4F7BFF]">&quot;period_end&quot;</span>
                <span className="text-[#7A8FAD]">: </span>
                <span className="text-[#22D3A0]">&quot;2024-02-24&quot;</span>
                <span className="text-[#7A8FAD]">,</span>
              </p>
              <p className="pl-4">
                <span className="text-[#4F7BFF]">&quot;profit_and_loss&quot;</span>
                <span className="text-[#7A8FAD]">: {"{"}</span>
              </p>
              <p className="pl-8">
                <span className="text-[#4F7BFF]">&quot;turnover&quot;</span>
                <span className="text-[#7A8FAD]">: {"{ "}</span>
                <span className="text-[#4F7BFF]">&quot;current&quot;</span>
                <span className="text-[#7A8FAD]">: </span>
                <span className="text-[#F97316]">68190000000</span>
                <span className="text-[#7A8FAD]">{" },"}</span>
                <span className="ml-3 text-xs text-[#3D5275]">// £68.19 billion</span>
              </p>
              <p className="pl-8">
                <span className="text-[#4F7BFF]">&quot;profit_after_tax&quot;</span>
                <span className="text-[#7A8FAD]">: {"{ "}</span>
                <span className="text-[#4F7BFF]">&quot;current&quot;</span>
                <span className="text-[#7A8FAD]">: </span>
                <span className="text-[#F97316]">1400000000</span>
                <span className="text-[#7A8FAD]">{" }"}</span>
              </p>
              <p className="pl-4 text-[#7A8FAD]">{"  },"}</p>
              <p className="pl-4">
                <span className="text-[#4F7BFF]">&quot;balance_sheet&quot;</span>
                <span className="text-[#7A8FAD]">: {"{ "}</span>
                <span className="text-[#4F7BFF]">&quot;net_assets&quot;</span>
                <span className="text-[#7A8FAD]">: {"{ "}</span>
                <span className="text-[#4F7BFF]">&quot;current&quot;</span>
                <span className="text-[#7A8FAD]">: </span>
                <span className="text-[#F97316]">10700000000</span>
                <span className="text-[#7A8FAD]">{" } },"}</span>
              </p>
              <p className="pl-4">
                <span className="text-[#4F7BFF]">&quot;other&quot;</span>
                <span className="text-[#7A8FAD]">: {"{ "}</span>
                <span className="text-[#4F7BFF]">&quot;employees&quot;</span>
                <span className="text-[#7A8FAD]">: {"{ "}</span>
                <span className="text-[#4F7BFF]">&quot;current&quot;</span>
                <span className="text-[#7A8FAD]">: </span>
                <span className="text-[#F97316]">295622</span>
                <span className="text-[#7A8FAD]">{" } }"}</span>
              </p>
              <p className="text-[#7A8FAD]">{"}"}</p>
            </div>
          </div>

          <p className="mt-3 text-sm text-[#3D5275]">
            Financial data is only available for companies that file digitally.
            Micro-entities and dormant companies return limited balance sheet data only.
            See{" "}
            <a href="/financials-example" className="text-[#4F7BFF] hover:underline">
              the financial data example →
            </a>
          </p>
        </section>

        {/* Step 5: Production */}
        <section
          id="production"
          ref={(el) => { stepRefs.current["production"] = el; }}
          className="scroll-mt-24"
        >
          <StepHeader number={5} title="Deploy to production" time="1 min" />
          <p className="mt-4 text-[#7A8FAD]">
            Store your API key in an environment variable. Never hardcode it in source code or
            commit it to Git.
          </p>

          <CodeBlock
            code=""
            languages={PRODUCTION_SNIPPETS}
            className="mt-5"
          />

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="text-sm font-medium text-white">Rate limits</h4>
              <p className="mt-2 text-xs leading-relaxed text-[#7A8FAD]">
                Every response includes{" "}
                <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">credits_remaining</code>.
                A{" "}
                <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">429</code>{" "}
                response means you&apos;ve hit the monthly limit or burst rate. Upgrade your plan to
                increase both.
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="text-sm font-medium text-white">Error handling</h4>
              <p className="mt-2 text-xs leading-relaxed text-[#7A8FAD]">
                All error responses include{" "}
                <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">status: &quot;error&quot;</code>{" "}
                and a human-readable{" "}
                <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">detail</code>.
                On CH API outages, cached data is served with the{" "}
                <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">X-Data-Stale</code>{" "}
                header — your app stays live.
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="text-sm font-medium text-white">Director network</h4>
              <p className="mt-2 text-xs leading-relaxed text-[#7A8FAD]">
                <code className="font-[family-name:var(--font-geist-mono)] text-[#E8F0FE]">GET /v1/company/{"{number}"}/network?depth=1</code>
                {" "}returns all companies sharing directors. Depth 2 traverses one level further.
                Cached 24h.
              </p>
              <CodeBlock
                code=""
                languages={NETWORK_SNIPPETS}
                className="mt-3"
              />
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="text-sm font-medium text-white">Need more calls?</h4>
              <p className="mt-2 text-xs leading-relaxed text-[#7A8FAD]">
                Free tier: 50 calls/month. Pro (£49/mo): 2,000 calls.
                Enterprise (£149/mo): 10,000 calls. All plans include all endpoints.
              </p>
              <a
                href="/#pricing"
                className="mt-3 inline-block text-xs text-[#4F7BFF] hover:underline"
              >
                View pricing →
              </a>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-[#4F7BFF]/20 bg-[#4F7BFF]/5 p-6 text-center">
            <h3 className="text-base font-medium text-white">Ready to integrate?</h3>
            <p className="mt-2 text-sm text-[#7A8FAD]">Full API reference in Swagger — every endpoint, every parameter, try it live.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <a
                href="https://api.registrum.co.uk/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-[#4F7BFF] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#6B93FF]"
              >
                Open API docs →
              </a>
              <a
                href="/#pricing"
                className="rounded-md border border-white/10 px-5 py-2.5 text-sm font-medium text-[#E8F0FE] transition-colors hover:border-white/20 hover:bg-white/5"
              >
                Upgrade plan
              </a>
            </div>
          </div>
        </section>

        {/* Step 6: MCP */}
        <section
          id="mcp"
          ref={(el) => { stepRefs.current["mcp"] = el; }}
          className="scroll-mt-24"
        >
          <StepHeader number={6} title="Use with AI (MCP)" time="2 min" />
          <p className="mt-4 text-[#7A8FAD]">
            The Registrum MCP server lets you query UK company data directly from{" "}
            <strong className="text-[#E8F0FE]">Claude Desktop</strong>,{" "}
            <strong className="text-[#E8F0FE]">Cursor</strong>, and any other MCP-compatible
            AI client — no code required. Ask questions like{" "}
            <em className="text-[#E8F0FE]">&quot;Who are the directors of Tesco and what other companies are they on?&quot;</em>{" "}
            and get live answers backed by Companies House data.
          </p>

          <p className="mt-3 text-sm text-[#7A8FAD]">
            Add the following to your AI client config and restart it. Your Registrum API key is used
            for authentication — the same key you use for direct API calls.
          </p>

          <CodeBlock
            code=""
            languages={MCP_SNIPPETS}
            className="mt-5"
          />

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              {
                tool: "search_company",
                desc: "Find companies by name — returns number, status, address",
              },
              {
                tool: "get_company",
                desc: "Enriched profile — age, SIC descriptions, overdue flags",
              },
              {
                tool: "get_financials",
                desc: "Structured P&L + balance sheet from iXBRL filings",
              },
              {
                tool: "get_directors",
                desc: "Full director history across all appointments",
              },
              {
                tool: "get_network",
                desc: "Corporate network via shared director connections",
              },
            ].map((item) => (
              <div
                key={item.tool}
                className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
              >
                <code className="mt-0.5 shrink-0 font-[family-name:var(--font-geist-mono)] text-xs text-[#4F7BFF]">
                  {item.tool}
                </code>
                <span className="text-xs text-[#3D5275]">{item.desc}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-lg border border-[#22D3A0]/20 bg-[#22D3A0]/5 px-4 py-3 text-sm text-[#7A8FAD]">
            <strong className="text-[#22D3A0]">Install via npx</strong> — no global install needed.
            The first run downloads the package automatically.
            Find it on npm:{" "}
            <a
              href="https://www.npmjs.com/package/@registrum/mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4F7BFF] hover:underline"
            >
              @registrum/mcp
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}

function StepHeader({ number, title, time }: { number: number; title: string; time: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4F7BFF] text-sm font-bold text-white">
        {number}
      </div>
      <div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="mt-0.5 text-xs text-[#3D5275]">~{time}</p>
      </div>
    </div>
  );
}
