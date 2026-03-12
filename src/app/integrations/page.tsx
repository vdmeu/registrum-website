import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Integrations — Registrum",
  description:
    "Connect Registrum to your stack. REST API, Python/Node starter kits, MCP server for Claude and Cursor, LangChain tools, and no-code connectors coming soon.",
};

const codeFirst = [
  {
    name: "Python",
    status: "available" as const,
    description: "requests-based example. pip install requests and you're done.",
    githubUrl: "https://github.com/vdmeu/registrum-python",
    docsUrl: "/quickstart",
  },
  {
    name: "Node.js",
    status: "available" as const,
    description: "fetch-based example. Works with Node 18+, Deno, and Bun.",
    githubUrl: "https://github.com/vdmeu/registrum-node",
    docsUrl: "/quickstart",
  },
  {
    name: "cURL",
    status: "available" as const,
    description: "Direct REST API. Any HTTP client works — pass X-API-Key in the header.",
    githubUrl: null,
    docsUrl: "https://api.registrum.co.uk/docs",
  },
  {
    name: "REST API",
    status: "available" as const,
    description: "OpenAPI spec available. Generate a client in any language with openapi-generator.",
    githubUrl: null,
    docsUrl: "https://api.registrum.co.uk/docs",
  },
];

const agentFrameworks = [
  {
    name: "Claude Desktop / Cursor (MCP)",
    status: "available" as const,
    description:
      "Install the Registrum MCP server and query any UK company directly from your AI client. Ask natural-language questions backed by live Companies House data.",
    docsUrl: "/quickstart#mcp",
    npmUrl: "https://www.npmjs.com/package/@registrum/mcp",
  },
  {
    name: "LangChain (Python)",
    status: "coming-soon" as const,
    description:
      "pip install registrum-langchain — pre-built StructuredTool wrappers for every Registrum endpoint. Works with LangChain agents, chains, and CrewAI.",
    docsUrl: null,
    npmUrl: null,
  },
  {
    name: "CrewAI",
    status: "coming-soon" as const,
    description:
      "Native @tool decorators for CrewAI agents. CompanyProfileTool, CompanySearchTool, FinancialsTool, KYBReportTool — each with LLM-optimised descriptions.",
    docsUrl: null,
    npmUrl: null,
  },
];

const noCode = [
  {
    name: "Zapier",
    status: "coming-soon" as const,
    description: "Trigger Zaps on company data. Connect to 6,000+ apps without writing code.",
  },
  {
    name: "Make.com",
    status: "coming-soon" as const,
    description: "Visual automation with Registrum as a data source. Build KYB and enrichment flows.",
  },
  {
    name: "Google Sheets",
    status: "coming-soon" as const,
    description: "=REGISTRUM() formula — look up any UK company number directly in a spreadsheet.",
  },
];

function StatusBadge({ status }: { status: "available" | "coming-soon" }) {
  if (status === "available") {
    return (
      <span className="rounded-full border border-[#22D3A0]/30 bg-[#22D3A0]/10 px-2.5 py-0.5 text-xs font-medium text-[#22D3A0]">
        Available
      </span>
    );
  }
  return (
    <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 text-xs font-medium text-[#3D5275]">
      Coming soon
    </span>
  );
}

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-[#060D1B] text-[#E8F0FE] font-[family-name:var(--font-geist-sans)]">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#060D1B]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight text-white">
            Registrum
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/quickstart" className="hidden text-sm text-[#7A8FAD] hover:text-white sm:block">
              Quickstart
            </Link>
            <a
              href="https://api.registrum.co.uk/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden text-sm text-[#7A8FAD] hover:text-white sm:block"
            >
              Docs
            </a>
            <a
              href="/#get-key"
              className="rounded-md bg-[#4F7BFF] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6B93FF]"
            >
              Get API Key
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pb-16 pt-20 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#4F7BFF]/30 bg-[#4F7BFF]/10 px-3 py-1.5 text-xs font-medium text-[#4F7BFF]">
            Connect to your stack
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Integrations
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-[#7A8FAD]">
            Registrum is a plain REST API — it works wherever HTTP works. Starter kits for
            common languages, MCP server for AI clients, and LangChain tools for agent frameworks.
          </p>
        </div>
      </section>

      {/* Code-first */}
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-6 text-lg font-semibold text-white">Code-first</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {codeFirst.map((item) => (
              <div
                key={item.name}
                className="flex flex-col rounded-xl border border-white/[0.06] bg-white/[0.03] p-5"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className="font-semibold text-white">{item.name}</span>
                  <StatusBadge status={item.status} />
                </div>
                <p className="flex-1 text-sm leading-relaxed text-[#7A8FAD]">
                  {item.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-3 text-xs">
                  {item.githubUrl && (
                    <a
                      href={item.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[#4F7BFF] hover:underline"
                    >
                      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                      </svg>
                      GitHub
                    </a>
                  )}
                  {item.docsUrl && (
                    item.docsUrl.startsWith("http") ? (
                      <a
                        href={item.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#4F7BFF] hover:underline"
                      >
                        Docs →
                      </a>
                    ) : (
                      <Link href={item.docsUrl} className="text-[#4F7BFF] hover:underline">
                        Quickstart →
                      </Link>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI & Agent frameworks */}
      <section className="border-y border-white/[0.06] bg-white/[0.02] px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white">AI &amp; Agent frameworks</h2>
            <p className="mt-2 text-sm text-[#7A8FAD]">
              Use Registrum inside your LLM agent stack — no manual HTTP calls required.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {agentFrameworks.map((item) => (
              <div
                key={item.name}
                className={`flex flex-col rounded-xl border p-5 ${
                  item.status === "available"
                    ? "border-white/[0.06] bg-white/[0.03]"
                    : "border-white/[0.04] bg-white/[0.02] opacity-75"
                }`}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className="font-semibold text-white">{item.name}</span>
                  <StatusBadge status={item.status} />
                </div>
                <p className="flex-1 text-sm leading-relaxed text-[#7A8FAD]">
                  {item.description}
                </p>
                {(item.docsUrl || item.npmUrl) && (
                  <div className="mt-4 flex flex-wrap gap-3 text-xs">
                    {item.docsUrl && (
                      <Link href={item.docsUrl} className="text-[#4F7BFF] hover:underline">
                        Setup guide →
                      </Link>
                    )}
                    {item.npmUrl && (
                      <a
                        href={item.npmUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#4F7BFF] hover:underline"
                      >
                        npm →
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* LangChain preview */}
          <div className="mt-8 rounded-xl border border-[#4F7BFF]/20 bg-[#4F7BFF]/5 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                LangChain &amp; CrewAI — planned API
              </h3>
              <span className="rounded-full border border-[#4F7BFF]/30 bg-[#4F7BFF]/10 px-2.5 py-0.5 text-xs text-[#4F7BFF]">
                Coming soon
              </span>
            </div>
            <p className="mb-4 text-sm text-[#7A8FAD]">
              Each tool is a pre-built wrapper that handles auth, retries, and LLM-optimised output.
              The description on each tool guides the LLM to pick the right one automatically.
            </p>
            <div className="overflow-hidden rounded-lg bg-[#060D1B]">
              <div className="border-b border-white/[0.06] px-4 py-2 text-xs text-[#3D5275]">
                Python · planned
              </div>
              <pre className="overflow-x-auto px-5 py-4 font-[family-name:var(--font-geist-mono)] text-sm leading-relaxed text-[#7A8FAD]">{`from registrum_langchain import (
    CompanyProfileTool,
    CompanySearchTool,
    CompanyFinancialsTool,
    KYBReportTool,
)

tools = [
    CompanyProfileTool(api_key="reg_live_..."),
    CompanySearchTool(api_key="reg_live_..."),
    CompanyFinancialsTool(api_key="reg_live_..."),
    KYBReportTool(api_key="reg_live_..."),
]

# Or use REGISTRUM_API_KEY env var — no constructor arg needed
tools = [CompanyProfileTool(), CompanySearchTool()]`}</pre>
            </div>
            <p className="mt-3 text-xs text-[#3D5275]">
              Tools return <code className="font-[family-name:var(--font-geist-mono)]">summary_md</code> by
              default — pre-formatted Markdown ready to drop into an LLM prompt.
              Also works with CrewAI <code className="font-[family-name:var(--font-geist-mono)]">@tool</code> decorators.
            </p>
          </div>
        </div>
      </section>

      {/* No-code */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-6 text-lg font-semibold text-white">No-code</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {noCode.map((item) => (
              <div
                key={item.name}
                className="flex flex-col rounded-xl border border-white/[0.04] bg-white/[0.02] p-5 opacity-75"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className="font-semibold text-white">{item.name}</span>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-sm leading-relaxed text-[#3D5275]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-lg border border-white/[0.06] bg-white/[0.02] p-6 text-center">
            <p className="text-sm text-[#7A8FAD]">
              Need an integration that isn&apos;t listed?
            </p>
            <a
              href="mailto:api@registrum.co.uk"
              className="mt-2 inline-block text-sm font-medium text-[#4F7BFF] hover:underline"
            >
              Request an integration →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
