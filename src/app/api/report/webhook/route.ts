import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getResend } from "@/lib/resend";
import { getAnthropic } from "@/lib/anthropic";

const REGISTRUM_API = "https://api.registrum.co.uk";

/* ── SIC code lookup ─────────────────────────────────────────────────────── */

const SIC: Record<string, string> = {
  "01110": "Growing of cereals", "01500": "Mixed farming", "10110": "Processing/preserving of meat",
  "13100": "Preparation/spinning of textile fibres", "14110": "Manufacture of leather clothes",
  "16100": "Sawmilling/planing of wood", "17110": "Manufacture of pulp", "17120": "Manufacture of paper",
  "18120": "Printing", "20110": "Manufacture of industrial gases", "22110": "Manufacture of rubber tyres",
  "25110": "Manufacture of metal structures", "26110": "Manufacture of electronic components",
  "27110": "Manufacture of electric motors", "28110": "Manufacture of engines/turbines",
  "33110": "Repair of fabricated metal products", "35110": "Production of electricity",
  "35210": "Manufacture of gas", "36000": "Water collection/treatment/supply",
  "41100": "Development of building projects", "41200": "Construction of residential/non-residential buildings",
  "43110": "Demolition", "43210": "Electrical installation",
  "45111": "Sale of new cars and light motor vehicles", "45190": "Sale of other motor vehicles",
  "46100": "Agents for the sale of agricultural raw materials",
  "47110": "Retail of food/beverages/tobacco in non-specialised stores",
  "47190": "Other retail of wide range in non-specialised stores",
  "47710": "Retail of clothing", "47730": "Dispensing chemist",
  "49100": "Passenger rail transport", "49310": "Urban/suburban passenger land transport",
  "50100": "Sea and coastal passenger water transport",
  "52100": "Warehousing/storage", "52210": "Service activities incidental to land transportation",
  "55100": "Hotels/similar accommodation", "56101": "Licensed restaurants",
  "58110": "Book publishing", "58120": "Publishing of directories/mailing lists",
  "59111": "Motion picture production", "60100": "Radio broadcasting",
  "61100": "Wired telecommunications activities", "61200": "Wireless telecommunications activities",
  "62011": "Ready-made interactive leisure and entertainment software development",
  "62012": "Business and domestic software development",
  "62020": "Information technology consultancy activities",
  "62030": "Computer facilities management activities",
  "62090": "Other information technology service activities",
  "63110": "Data processing, hosting and related activities",
  "63120": "Web portals", "63910": "News agency activities",
  "64110": "Central banking", "64191": "Banks", "64192": "Building societies",
  "64910": "Financial leasing", "64922": "Other credit granting",
  "64999": "Other financial service activities (not investment or insurance)",
  "65110": "Life insurance", "65120": "Non-life insurance",
  "65201": "Life reinsurance", "65300": "Pension funding",
  "66110": "Administration of financial markets", "66120": "Security and commodity contracts dealings",
  "66190": "Other auxiliary activities in financial services",
  "66210": "Risk and damage evaluation", "66220": "Activities of insurance agents/brokers",
  "68100": "Buying and selling of own real estate",
  "68201": "Renting/operating of Housing Association real estate",
  "68209": "Other letting/operating of own or leased real estate",
  "68310": "Real estate agencies", "68320": "Management of real estate",
  "69101": "Barristers at law", "69102": "Solicitors",
  "69201": "Accounting/auditing activities", "69202": "Bookkeeping activities",
  "70100": "Activities of head offices", "70210": "Public relations/communication activities",
  "70221": "Financial management", "70229": "Management consultancy activities",
  "71111": "Architectural activities", "71112": "Urban planning/landscape architectural activities",
  "71121": "Engineering design for industrial process/production",
  "71122": "Engineering related scientific/technical consulting",
  "72110": "Research/experimental development on biotechnology",
  "72190": "Other research/experimental development on natural sciences",
  "72200": "Research/experimental development on social sciences/humanities",
  "73110": "Advertising agencies", "73120": "Media representation services",
  "73200": "Market research/public opinion polling",
  "74100": "Specialised design activities", "74202": "Other specialist photography",
  "74300": "Translation/interpretation activities",
  "74909": "Other professional/scientific/technical activities",
  "75000": "Veterinary activities",
  "77110": "Renting/leasing of cars/light motor vehicles",
  "77400": "Leasing of intellectual property/similar products",
  "78100": "Activities of employment placement agencies",
  "78200": "Temporary employment agency activities",
  "78300": "Human resources provision/management",
  "79110": "Travel agency activities", "79120": "Tour operator activities",
  "80100": "Private security activities", "80200": "Security systems service activities",
  "81100": "Combined facilities support activities",
  "82110": "Combined office administrative service activities",
  "82190": "Photocopying/document preparation/other office support",
  "82200": "Activities of call centres",
  "82990": "Other business support service activities",
  "84110": "General (overall) public service activities",
  "84120": "Regulation of health care/education/cultural/other social services",
  "85100": "Pre-primary education", "85200": "Primary education",
  "85310": "General secondary education", "85320": "Technical/vocational secondary education",
  "85410": "Post-secondary non-tertiary education",
  "85421": "First-degree level higher education",
  "85422": "Post-graduate level higher education",
  "86100": "Hospital activities", "86210": "General medical practice activities",
  "86220": "Specialist medical practice activities", "86230": "Dental practice activities",
  "87100": "Residential nursing care facilities", "87200": "Residential care for mental health/etc",
  "87300": "Residential care for the elderly/disabled",
  "88100": "Social work activities without accommodation for the elderly/disabled",
  "90010": "Performing arts", "90020": "Support activities for performing arts",
  "90030": "Artistic creation", "91011": "Library activities",
  "91020": "Museum activities", "92000": "Gambling/betting activities",
  "93110": "Operation of sports facilities",
  "93120": "Activities of sport clubs",
  "93130": "Fitness facilities", "93199": "Other sports activities",
  "94110": "Activities of business/employers organisations",
  "94120": "Activities of professional membership organisations",
  "94910": "Activities of religious organisations",
  "96010": "Washing/dry-cleaning of textile/fur products",
  "96020": "Hairdressing/other beauty treatment",
  "96090": "Other personal service activities",
  "98000": "Residents in own homes producing for own use",
  "99000": "Activities of extraterritorial organisations/bodies",
};

function describeSic(code: string): string {
  return SIC[code] ?? `SIC ${code}`;
}

/* ── Director SVG generator ───────────────────────────────────────────────── */

interface DirectorForSvg {
  name: string;
  officer_role: string;
  other_appointments?: Array<{ company_number: string; company_name: string }>;
}

function buildDirectorSvg(companyName: string, directors: DirectorForSvg[]): string {
  if (directors.length === 0) return "";

  const CX = 300, CY = 225;
  const INNER_R = 108, OUTER_R = 192;
  const FOCAL_R = 30, DIR_R = 17, CO_R = 13;
  const viewH = 452;

  const trunc = (s: string, n: number) => s.length > n ? s.slice(0, n - 1) + "…" : s;

  const n = directors.length;
  const dirNodes = directors.map((d, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(n, 1);
    const appts = (d.other_appointments ?? [])
      .filter((a, idx, arr) => arr.findIndex(b => b.company_number === a.company_number) === idx)
      .slice(0, 10);
    return { name: d.name, role: d.officer_role, appointments: appts, x: CX + INNER_R * Math.cos(angle), y: CY + INNER_R * Math.sin(angle), angle };
  });

  const companyMap = new Map<string, { name: string; dirNames: string[]; angles: number[] }>();
  for (const dir of dirNodes) {
    for (const appt of dir.appointments) {
      const existing = companyMap.get(appt.company_number);
      if (existing) {
        existing.dirNames.push(dir.name);
        existing.angles.push(dir.angle);
      } else {
        companyMap.set(appt.company_number, { name: appt.company_name, dirNames: [dir.name], angles: [dir.angle] });
      }
    }
  }

  const coList = Array.from(companyMap.entries())
    .sort(([, a], [, b]) => b.dirNames.length - a.dirNames.length)
    .slice(0, 20)
    .sort(([, a], [, b]) => {
      const aA = a.angles.reduce((x, y) => x + y, 0) / a.angles.length;
      const bA = b.angles.reduce((x, y) => x + y, 0) / b.angles.length;
      return aA - bA;
    });

  const coNodes = coList.map(([num, c], i, arr) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(arr.length, 1);
    return { id: num, name: c.name, dirNames: c.dirNames, x: CX + OUTER_R * Math.cos(angle), y: CY + OUTER_R * Math.sin(angle), angle };
  });

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 ${viewH}" style="display:block;width:100%;max-width:600px;background:#060D1B;border-radius:10px">`;

  // Focal → director edges
  for (const dir of dirNodes) {
    svg += `<line x1="${CX}" y1="${CY}" x2="${dir.x.toFixed(1)}" y2="${dir.y.toFixed(1)}" stroke="#4F7BFF" stroke-width="1.5" opacity="0.4"/>`;
  }

  // Director → company edges
  for (const dir of dirNodes) {
    for (const appt of dir.appointments) {
      const co = coNodes.find(c => c.id === appt.company_number);
      if (!co) continue;
      svg += `<line x1="${dir.x.toFixed(1)}" y1="${dir.y.toFixed(1)}" x2="${co.x.toFixed(1)}" y2="${co.y.toFixed(1)}" stroke="#22D3A0" stroke-width="0.8" opacity="0.22"/>`;
    }
  }

  // Company nodes + labels
  for (const co of coNodes) {
    const dx = co.x - CX, dy = co.y - CY;
    const mag = Math.sqrt(dx * dx + dy * dy) || 1;
    const lx = co.x + (dx / mag) * (CO_R + 8);
    const ly = co.y + (dy / mag) * (CO_R + 8);
    const anchor = dx < -12 ? "end" : dx > 12 ? "start" : "middle";
    svg += `<circle cx="${co.x.toFixed(1)}" cy="${co.y.toFixed(1)}" r="${CO_R}" fill="#0D1F35" stroke="#4A7FAD" stroke-width="1.5"/>`;
    svg += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" dominant-baseline="middle" font-size="7" fill="#7A8FAD" font-family="system-ui,sans-serif">${trunc(co.name, 22)}</text>`;
  }

  // Director nodes + labels
  for (const dir of dirNodes) {
    const parts = dir.name.split(/[\s,]+/).filter(Boolean);
    const l1 = trunc(parts[0] || "", 9);
    const l2 = parts.length > 1 ? trunc(parts[parts.length - 1], 9) : null;
    svg += `<circle cx="${dir.x.toFixed(1)}" cy="${dir.y.toFixed(1)}" r="${DIR_R}" fill="#22D3A0"/>`;
    if (l2) {
      svg += `<text text-anchor="middle" font-size="6.5" fill="#0A1628" font-weight="600" font-family="system-ui,sans-serif"><tspan x="${dir.x.toFixed(1)}" y="${(dir.y - 3.5).toFixed(1)}">${l1}</tspan><tspan x="${dir.x.toFixed(1)}" dy="8">${l2}</tspan></text>`;
    } else {
      svg += `<text x="${dir.x.toFixed(1)}" y="${dir.y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="6.5" fill="#0A1628" font-weight="600" font-family="system-ui,sans-serif">${l1}</text>`;
    }
  }

  // Focal node
  const words = companyName.split(" ").filter(Boolean);
  const fl1 = trunc(words[0] || "", 9);
  const fl2 = words.length > 1 ? trunc(words[words.length - 1], 9) : null;
  svg += `<circle cx="${CX}" cy="${CY}" r="${FOCAL_R}" fill="#4F7BFF"/>`;
  if (fl2) {
    svg += `<text text-anchor="middle" font-size="9" font-weight="bold" fill="white" font-family="system-ui,sans-serif"><tspan x="${CX}" y="${CY - 4}">${fl1}</tspan><tspan x="${CX}" dy="13">${fl2}</tspan></text>`;
  } else {
    svg += `<text x="${CX}" y="${CY}" text-anchor="middle" dominant-baseline="middle" font-size="9" font-weight="bold" fill="white" font-family="system-ui,sans-serif">${fl1}</text>`;
  }

  // Legend
  const lY = viewH - 18;
  svg += `<g font-size="9" fill="#7A8FAD" font-family="system-ui,sans-serif">
    <circle cx="18" cy="${lY}" r="5" fill="#4F7BFF"/><text x="27" y="${lY}" dominant-baseline="middle">Focal company</text>
    <circle cx="113" cy="${lY}" r="5" fill="#22D3A0"/><text x="122" y="${lY}" dominant-baseline="middle">Director</text>
    <circle cx="176" cy="${lY}" r="5" fill="#0D1F35" stroke="#4A7FAD" stroke-width="1.5"/><text x="185" y="${lY}" dominant-baseline="middle">Other directorship</text>
  </g>`;

  svg += `</svg>`;
  return svg;
}

/* ── KYB fetch ───────────────────────────────────────────────────────────── */

// Returns null for permanent failures (e.g. company not found).
// Throws for transient failures (network, timeout, 5xx) so the caller can return 500 and let Stripe retry.
async function fetchKybReport(companyNumber: string): Promise<Record<string, unknown> | null> {
  const apiKey = process.env.REGISTRUM_DEMO_API_KEY;
  if (!apiKey) throw new Error("REGISTRUM_DEMO_API_KEY not configured");
  const res = await fetch(`${REGISTRUM_API}/v1/company/${companyNumber}/kyb-report`, {
    headers: { "X-API-Key": apiKey },
    signal: AbortSignal.timeout(30_000),
  });
  if (res.status === 404) return null; // company not found — permanent, no point retrying
  if (!res.ok) throw new Error(`KYB API ${res.status}`); // 5xx / rate-limit — transient, Stripe should retry
  const json = await res.json();
  return json.data ?? null;
}

/* ── Claude verdict ──────────────────────────────────────────────────────── */

async function generateVerdict(report: Record<string, unknown>): Promise<string> {
  const profile = report.profile as Record<string, unknown> | undefined;
  const risk_flags = report.risk_flags as Record<string, boolean> | undefined;
  const summary_md = report.summary_md as string | undefined;
  const activeFlags = Object.entries(risk_flags ?? {}).filter(([, v]) => v).map(([k]) => k.replace(/_/g, " "));

  const prompt = `You are a UK company due diligence analyst. Based on the following KYB report data, write a concise plain-English assessment (3-4 short paragraphs). Include: who this company is, what the risk flags mean in plain English, and a clear verdict (LOW / MEDIUM / HIGH risk) with a one-sentence recommendation.

Company: ${profile?.company_name ?? "Unknown"} (${profile?.company_number ?? "?"})
Status: ${profile?.company_status ?? "unknown"}
Incorporated: ${profile?.date_of_creation ?? "unknown"}
Age: ${profile?.company_age_years ?? "?"} years
Active flags: ${activeFlags.length > 0 ? activeFlags.join(", ") : "none"}

Summary data:
${summary_md ?? "(no summary available)"}

Write directly to the buyer as "you". Do not use markdown headers. Keep each paragraph under 80 words.`;

  try {
    const message = await getAnthropic().messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });
    const block = message.content[0];
    return block.type === "text" ? block.text : "";
  } catch {
    return "";
  }
}

/* ── Risk badge ─────────────────────────────────────────────────────────── */

function riskBadge(flags: Record<string, boolean> | undefined): { label: string; bg: string; color: string } {
  if (!flags) return { label: "UNKNOWN", bg: "#1e2a3a", color: "#7A8FAD" };
  const count = Object.values(flags).filter(Boolean).length;
  if (count === 0) return { label: "LOW RISK", bg: "#0d2a1a", color: "#34d399" };
  if (count <= 2) return { label: "MEDIUM RISK", bg: "#2a1e0d", color: "#fbbf24" };
  return { label: "HIGH RISK", bg: "#2a0d0d", color: "#f87171" };
}

/* ── Format helpers ──────────────────────────────────────────────────────── */

function fmtGBP(n: number | null | undefined): string {
  if (n == null) return "—";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}£${(abs / 1_000_000_000).toFixed(1)}bn`;
  if (abs >= 1_000_000) return `${sign}£${(abs / 1_000_000).toFixed(1)}m`;
  if (abs >= 1_000) return `${sign}£${(abs / 1_000).toFixed(0)}k`;
  return `${sign}£${abs}`;
}

function fmtNum(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString("en-GB");
}

/* ── Email builder ───────────────────────────────────────────────────────── */

function buildReportEmail(companyNumber: string, report: Record<string, unknown>, verdict: string): string {
  const profile = report.profile as Record<string, unknown> | undefined;
  const risk_flags = report.risk_flags as Record<string, boolean> | undefined;
  const directorsRaw = report.directors as { current_directors?: DirectorForSvg[] } | null | undefined;
  const currentDirs = directorsRaw?.current_directors ?? [];
  const financials = report.financials as Record<string, unknown> | null | undefined;
  const psc_chain = report.psc_chain as { pscs?: Array<Record<string, unknown>> } | null | undefined;

  const badge = riskBadge(risk_flags);
  const companyName = (profile?.company_name as string) ?? companyNumber;
  const status = (profile?.company_status as string) ?? "unknown";
  const created = (profile?.date_of_creation as string) ?? "unknown";
  const age = (profile?.company_age_years as number) ?? null;
  const category = (profile?.company_category as string) ?? "";
  const companyType = (profile?.company_type as string) ?? "";
  const address = (profile?.registered_office_address as Record<string, string>) ?? {};
  const addressStr = [address.address_line_1, address.locality, address.postal_code].filter(Boolean).join(", ");
  const sicCodes = (profile?.sic_codes as string[]) ?? [];

  // Risk flags rows
  const flagRows = Object.entries(risk_flags ?? {}).map(([key, val]) => {
    const label = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    const icon = val ? "&#9888;" : "&#10003;";
    const color = val ? "#f87171" : "#34d399";
    return `<tr>
      <td style="padding:7px 0;font-size:13px;color:#7A8FAD;border-bottom:1px solid rgba(255,255,255,0.04)">${label}</td>
      <td style="padding:7px 0;text-align:right;font-size:13px;color:${color};border-bottom:1px solid rgba(255,255,255,0.04)">${icon} ${val ? "Yes" : "No"}</td>
    </tr>`;
  }).join("");

  // Director SVG
  const dirSvg = buildDirectorSvg(companyName, currentDirs);

  // Director list rows
  const dirRows = currentDirs.slice(0, 10).map(d => {
    const apptCount = (d.other_appointments ?? []).length;
    return `<tr>
      <td style="padding:7px 0;font-size:13px;color:#E8F0FE;border-bottom:1px solid rgba(255,255,255,0.04)">${d.name}</td>
      <td style="padding:7px 0;font-size:12px;color:#7A8FAD;text-transform:capitalize;border-bottom:1px solid rgba(255,255,255,0.04)">${d.officer_role}</td>
      <td style="padding:7px 0;font-size:12px;color:#3D5275;text-align:right;border-bottom:1px solid rgba(255,255,255,0.04)">${apptCount > 0 ? `+${apptCount} co.` : ""}</td>
    </tr>`;
  }).join("");

  // PSC rows
  const pscs = psc_chain?.pscs ?? [];
  const pscRows = pscs.slice(0, 5).map(p => {
    const name = (p.name as string) ?? "Unknown";
    const kind = (p.kind as string) ?? "";
    const decoded = ((p.natures_of_control_decoded ?? p.natures_of_control) as string[] | undefined) ?? [];
    return `<tr>
      <td style="padding:7px 0;font-size:13px;color:#E8F0FE;border-bottom:1px solid rgba(255,255,255,0.04)">${name}</td>
      <td style="padding:7px 0;font-size:12px;color:#7A8FAD;text-transform:capitalize;border-bottom:1px solid rgba(255,255,255,0.04)">${kind.replace(/-/g, " ")}</td>
      <td style="padding:7px 0;font-size:11px;color:#3D5275;text-align:right;border-bottom:1px solid rgba(255,255,255,0.04)">${decoded.slice(0, 2).join(" · ") || "—"}</td>
    </tr>`;
  }).join("");

  // Financials
  const pl = (financials?.profit_and_loss as Record<string, { current?: number | null; prior?: number | null }> | undefined) ?? {};
  const bs = (financials?.balance_sheet as Record<string, { current?: number | null; prior?: number | null }> | undefined) ?? {};
  const other = (financials?.other as Record<string, { current?: number | null }> | undefined) ?? {};
  const periodEnd = (financials?.period_end as string) ?? null;

  const financialsHtml = financials ? `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:0 8px 12px 0;width:33%">
          <div style="font-size:11px;color:#3D5275;margin-bottom:4px">Turnover</div>
          <div style="font-size:18px;font-weight:700;color:#fff">${fmtGBP(pl.turnover?.current)}</div>
        </td>
        <td style="padding:0 8px 12px;width:33%">
          <div style="font-size:11px;color:#3D5275;margin-bottom:4px">Net Assets</div>
          <div style="font-size:18px;font-weight:700;color:#fff">${fmtGBP(bs.net_assets?.current)}</div>
        </td>
        <td style="padding:0 0 12px 8px;width:33%">
          <div style="font-size:11px;color:#3D5275;margin-bottom:4px">Employees</div>
          <div style="font-size:18px;font-weight:700;color:#fff">${fmtNum(other.employees?.current)}</div>
        </td>
      </tr>
      ${pl.gross_profit ? `<tr>
        <td style="padding:0 8px 8px 0">
          <div style="font-size:11px;color:#3D5275;margin-bottom:2px">Gross Profit</div>
          <div style="font-size:15px;font-weight:600;color:#E8F0FE">${fmtGBP(pl.gross_profit?.current)}</div>
        </td>
        <td style="padding:0 8px 8px">
          <div style="font-size:11px;color:#3D5275;margin-bottom:2px">Profit Before Tax</div>
          <div style="font-size:15px;font-weight:600;color:#E8F0FE">${fmtGBP(pl.profit_before_tax?.current)}</div>
        </td>
        <td style="padding:0 0 8px 8px">
          <div style="font-size:11px;color:#3D5275;margin-bottom:2px">Fixed Assets</div>
          <div style="font-size:15px;font-weight:600;color:#E8F0FE">${fmtGBP(bs.fixed_assets?.current)}</div>
        </td>
      </tr>` : ""}
      ${periodEnd ? `<tr><td colspan="3"><span style="font-size:11px;color:#3D5275">Period ending ${periodEnd}</span></td></tr>` : ""}
    </table>` : `<p style="margin:0;font-size:13px;color:#3D5275">Accounts filed as image-based PDF — structured financial data not extractable. Request audited accounts directly from the company.</p>`;

  // SIC section
  const sicHtml = sicCodes.length > 0 ? `
    <div style="padding:20px 32px 20px;border-top:1px solid rgba(255,255,255,0.06)">
      <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#7A8FAD;letter-spacing:0.07em;text-transform:uppercase">Business Activities</p>
      ${sicCodes.map(c => `<p style="margin:0 0 4px;font-size:13px;color:#7A8FAD"><span style="color:#3D5275;font-family:monospace">${c}</span> — ${describeSic(c)}</p>`).join("")}
    </div>` : "";

  // Verdict paragraphs
  const verdictHtml = verdict.split(/\n\n+/).filter(s => s.trim()).map(p =>
    `<p style="margin:0 0 14px;font-size:14px;line-height:1.75;color:#CBD5E1">${p.trim()}</p>`
  ).join("");

  const statusColor = status === "active" ? "#34d399" : "#f87171";
  const now = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Company Report: ${companyName}</title>
</head>
<body style="margin:0;padding:0;background:#060D1B;font-family:system-ui,-apple-system,sans-serif;color:#E8F0FE">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#060D1B;padding:32px 12px">
    <tr><td align="center">
    <table width="620" cellpadding="0" cellspacing="0" style="background:#0A1628;border:1px solid rgba(255,255,255,0.08);border-radius:14px;overflow:hidden;max-width:100%">

      <!-- Header -->
      <tr><td style="padding:22px 32px;border-bottom:1px solid rgba(255,255,255,0.06)">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td><span style="font-size:16px;font-weight:700;color:#fff;letter-spacing:-0.3px">Registrum</span><span style="font-size:11px;color:#3D5275;margin-left:10px">Company Intelligence Report</span></td>
          <td align="right"><span style="display:inline-block;background:${badge.bg};color:${badge.color};font-size:11px;font-weight:700;padding:4px 12px;border-radius:5px;letter-spacing:0.06em">${badge.label}</span></td>
        </tr></table>
      </td></tr>

      <!-- Company identity -->
      <tr><td style="padding:26px 32px 18px">
        <h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.4px">${companyName}</h1>
        <p style="margin:0 0 3px;font-size:13px;color:#7A8FAD">
          ${companyNumber} &nbsp;·&nbsp; Status: <span style="color:${statusColor}">${status}</span> &nbsp;·&nbsp; ${companyType.toUpperCase()}${category ? " &nbsp;·&nbsp; " + category.charAt(0).toUpperCase() + category.slice(1) : ""}
        </p>
        <p style="margin:0 0 3px;font-size:13px;color:#7A8FAD">Incorporated: ${created}${age ? ` (${age} years ago)` : ""}</p>
        ${addressStr ? `<p style="margin:0;font-size:13px;color:#7A8FAD">${addressStr}</p>` : ""}
      </td></tr>

      ${sicHtml}

      <!-- 4 stat chips -->
      <tr><td style="padding:0 32px 20px">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          ${[
            ["Accounts", (risk_flags?.accounts_overdue ? "Overdue" : "Up to date"), (risk_flags?.accounts_overdue ? "#f87171" : "#34d399")],
            ["Conf. Statement", (risk_flags?.confirmation_overdue ? "Overdue" : "Up to date"), (risk_flags?.confirmation_overdue ? "#f87171" : "#34d399")],
            ["Charges", (risk_flags?.has_charges ? "Yes" : "None"), (risk_flags?.has_charges ? "#f87171" : "#34d399")],
            ["Insolvency", (risk_flags?.has_insolvency_history ? "Yes" : "None"), (risk_flags?.has_insolvency_history ? "#f87171" : "#34d399")],
          ].map(([label, val, col]) => `<td style="padding:0 4px 0 0;width:25%">
            <div style="background:#0F1E35;border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:10px 12px">
              <div style="font-size:10px;color:#3D5275;margin-bottom:3px">${label}</div>
              <div style="font-size:13px;font-weight:600;color:${col}">${val}</div>
            </div>
          </td>`).join("")}
        </tr></table>
      </td></tr>

      <!-- AI verdict -->
      <tr><td style="padding:0 32px 22px">
        <div style="background:#0F1E35;border:1px solid rgba(79,123,255,0.2);border-radius:10px;padding:20px 24px">
          <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#4F7BFF;letter-spacing:0.08em;text-transform:uppercase">AI Analysis</p>
          ${verdictHtml || `<p style="margin:0;font-size:14px;color:#7A8FAD">Analysis unavailable — review the data sections below.</p>`}
        </div>
      </td></tr>

      <!-- Risk flags -->
      <tr><td style="padding:0 32px 22px;border-top:1px solid rgba(255,255,255,0.06)">
        <p style="margin:12px 0;font-size:11px;font-weight:700;color:#7A8FAD;letter-spacing:0.07em;text-transform:uppercase">Risk Flags</p>
        <table width="100%" cellpadding="0" cellspacing="0">${flagRows}</table>
      </td></tr>

      <!-- Director network SVG -->
      ${dirSvg ? `<tr><td style="padding:0 32px 22px;border-top:1px solid rgba(255,255,255,0.06)">
        <p style="margin:12px 0;font-size:11px;font-weight:700;color:#7A8FAD;letter-spacing:0.07em;text-transform:uppercase">Director Network</p>
        ${dirSvg}
      </td></tr>` : ""}

      <!-- Director list -->
      ${dirRows ? `<tr><td style="padding:0 32px 22px;border-top:1px solid rgba(255,255,255,0.06)">
        <p style="margin:12px 0;font-size:11px;font-weight:700;color:#7A8FAD;letter-spacing:0.07em;text-transform:uppercase">Current Directors</p>
        <table width="100%" cellpadding="0" cellspacing="0">${dirRows}</table>
      </td></tr>` : ""}

      <!-- PSC chain -->
      ${pscRows ? `<tr><td style="padding:0 32px 22px;border-top:1px solid rgba(255,255,255,0.06)">
        <p style="margin:12px 0;font-size:11px;font-weight:700;color:#7A8FAD;letter-spacing:0.07em;text-transform:uppercase">Beneficial Ownership Chain</p>
        <table width="100%" cellpadding="0" cellspacing="0">${pscRows}</table>
      </td></tr>` : ""}

      <!-- Financials -->
      <tr><td style="padding:0 32px 22px;border-top:1px solid rgba(255,255,255,0.06)">
        <p style="margin:12px 0;font-size:11px;font-weight:700;color:#7A8FAD;letter-spacing:0.07em;text-transform:uppercase">Financial Summary</p>
        ${financialsHtml}
      </td></tr>

      <!-- Footer -->
      <tr><td style="padding:18px 32px;border-top:1px solid rgba(255,255,255,0.06);background:#060D1B">
        <p style="margin:0;font-size:11px;color:#3D5275;line-height:1.65">
          Generated ${now} by Registrum &nbsp;·&nbsp; Data sourced from Companies House under the Open Government Licence v3.0<br>
          Informational only — does not constitute legal or financial advice. &nbsp;·&nbsp;
          <a href="mailto:support@registrum.co.uk" style="color:#4F7BFF;text-decoration:none">support@registrum.co.uk</a>
        </p>
      </td></tr>

    </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* ── Webhook handler ─────────────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_REPORT_WEBHOOK_SECRET;
  if (!webhookSecret) return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });

  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("report webhook signature error", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") return NextResponse.json({ received: true });

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.metadata?.type !== "company_report") return NextResponse.json({ received: true });

  const companyNumber = session.metadata?.company_number;
  const email = session.customer_details?.email;

  if (!companyNumber || !email) {
    console.error("report webhook missing company_number or email", session.id);
    return NextResponse.json({ received: true });
  }

  let report: Record<string, unknown> | null;
  try {
    report = await fetchKybReport(companyNumber);
  } catch (err) {
    // Transient failure — return 500 so Stripe retries (up to ~5x over 24h)
    console.error("report webhook: KYB fetch transient failure for", companyNumber, err);
    return NextResponse.json({ error: "KYB fetch failed" }, { status: 500 });
  }

  if (!report) {
    // Permanent failure (company not found) — notify customer so they're not left waiting
    console.error("report webhook: company not found", companyNumber);
    await getResend().emails.send({
      from: "Registrum Reports <api@registrum.co.uk>",
      to: email,
      replyTo: "support@registrum.co.uk",
      subject: `Your report for ${companyNumber} — we're looking into it`,
      html: `<p style="font-family:sans-serif;font-size:15px;color:#1a2332">Hi,</p>
<p style="font-family:sans-serif;font-size:15px;color:#1a2332">We received your order for company <strong>${companyNumber}</strong> but ran into a problem retrieving the data. Our team has been alerted and will follow up within 24 hours.</p>
<p style="font-family:sans-serif;font-size:15px;color:#1a2332">If you need help sooner, reply to this email or contact <a href="mailto:support@registrum.co.uk">support@registrum.co.uk</a>.</p>
<p style="font-family:sans-serif;font-size:14px;color:#7A8FAD">Registrum</p>`,
    });
    return NextResponse.json({ received: true });
  }

  const verdict = await generateVerdict(report);
  const html = buildReportEmail(companyNumber, report, verdict);
  const profile = report.profile as Record<string, unknown> | undefined;
  const companyName = (profile?.company_name as string) ?? companyNumber;

  const { error: emailError } = await getResend().emails.send({
    from: "Registrum Reports <api@registrum.co.uk>",
    to: email,
    replyTo: "support@registrum.co.uk",
    subject: `Your company report: ${companyName}`,
    html,
  });

  if (emailError) {
    // Return 500 so Stripe retries the webhook — email wasn't sent yet so no duplicate risk
    console.error("report email send error for", companyNumber, emailError);
    return NextResponse.json({ error: "Email send failed" }, { status: 500 });
  }

  console.log("report sent for", companyNumber, "to", email);
  return NextResponse.json({ received: true });
}
