import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getResend } from "@/lib/resend";
import { getAnthropic } from "@/lib/anthropic";

const REGISTRUM_API = "https://api.registrum.co.uk";

async function fetchKybReport(companyNumber: string): Promise<Record<string, unknown> | null> {
  const apiKey = process.env.REGISTRUM_DEMO_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch(`${REGISTRUM_API}/v1/company/${companyNumber}/kyb-report`, {
      headers: { "X-API-Key": apiKey },
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

async function generateVerdict(report: Record<string, unknown>): Promise<string> {
  const profile = report.profile as Record<string, unknown> | undefined;
  const risk_flags = report.risk_flags as Record<string, boolean> | undefined;
  const summary_md = report.summary_md as string | undefined;

  const activeFlags = Object.entries(risk_flags ?? {})
    .filter(([, v]) => v)
    .map(([k]) => k.replace(/_/g, " "));

  const prompt = `You are a UK company due diligence analyst. Based on the following KYB report data, write a concise plain-English assessment (3-4 short paragraphs). Include: who this company is, what the risk flags mean in plain English, and a clear verdict (LOW / MEDIUM / HIGH risk) with a one-sentence recommendation.

Company: ${profile?.company_name ?? "Unknown"} (${profile?.company_number ?? "?"})
Status: ${profile?.company_status ?? "unknown"}
Incorporated: ${profile?.date_of_creation ?? "unknown"}
Age: ${profile?.company_age_years ?? "?"} years
Active flags: ${activeFlags.length > 0 ? activeFlags.join(", ") : "none"}

Summary data:
${summary_md ?? "(no financial summary available)"}

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

function riskBadgeColour(flags: Record<string, boolean> | undefined): {
  label: string;
  bg: string;
  color: string;
} {
  if (!flags) return { label: "UNKNOWN", bg: "#1e2a3a", color: "#7A8FAD" };
  const count = Object.values(flags).filter(Boolean).length;
  if (count === 0) return { label: "LOW RISK", bg: "#0d2a1a", color: "#34d399" };
  if (count <= 2) return { label: "MEDIUM RISK", bg: "#2a1e0d", color: "#fbbf24" };
  return { label: "HIGH RISK", bg: "#2a0d0d", color: "#f87171" };
}

function buildReportEmail(
  companyNumber: string,
  report: Record<string, unknown>,
  verdict: string
): string {
  const profile = report.profile as Record<string, unknown> | undefined;
  const risk_flags = report.risk_flags as Record<string, boolean> | undefined;
  const directors = report.directors as { current?: unknown[] } | null | undefined;
  const financials = report.financials as Record<string, unknown> | null | undefined;
  const psc_chain = report.psc_chain as { nodes?: unknown[] } | null | undefined;

  const badge = riskBadgeColour(risk_flags);
  const companyName = (profile?.company_name as string) ?? companyNumber;
  const status = (profile?.company_status as string) ?? "unknown";
  const created = (profile?.date_of_creation as string) ?? "unknown";
  const address = (profile?.registered_office_address as Record<string, string>) ?? {};
  const addressStr = [address.address_line_1, address.locality, address.postal_code]
    .filter(Boolean)
    .join(", ");

  const flagRows = Object.entries(risk_flags ?? {})
    .map(([key, val]) => {
      const label = key.replace(/_/g, " ");
      const icon = val ? "&#9888;" : "&#10003;";
      const color = val ? "#f87171" : "#34d399";
      return `<tr>
        <td style="padding:6px 0;font-size:13px;color:#7A8FAD;text-transform:capitalize">${label}</td>
        <td style="padding:6px 0;text-align:right;font-size:13px;color:${color}">${icon} ${val ? "Yes" : "No"}</td>
      </tr>`;
    })
    .join("");

  const directorList = (directors?.current ?? []).slice(0, 8) as Array<Record<string, unknown>>;
  const directorRows = directorList
    .map((d) => {
      const name = (d.name as string) ?? "Unknown";
      const role = (d.officer_role as string) ?? "";
      const appointed = (d.appointed_on as string) ?? "";
      return `<tr>
        <td style="padding:6px 0;font-size:13px;color:#E8F0FE">${name}</td>
        <td style="padding:6px 0;font-size:13px;color:#7A8FAD;text-transform:capitalize">${role}</td>
        <td style="padding:6px 0;font-size:13px;color:#7A8FAD;text-align:right">${appointed}</td>
      </tr>`;
    })
    .join("");

  const pscNodes = (psc_chain?.nodes ?? []) as Array<Record<string, unknown>>;
  const pscRows = pscNodes
    .slice(0, 5)
    .map((n) => {
      const name = (n.name as string) ?? "Unknown";
      const kind = (n.kind as string) ?? "";
      const ownership = n.natures_of_control as string[] | undefined;
      return `<tr>
        <td style="padding:6px 0;font-size:13px;color:#E8F0FE">${name}</td>
        <td style="padding:6px 0;font-size:13px;color:#7A8FAD;text-transform:capitalize">${kind}</td>
        <td style="padding:6px 0;font-size:13px;color:#7A8FAD;text-align:right">${(ownership ?? []).join(", ") || "—"}</td>
      </tr>`;
    })
    .join("");

  const financialsSummary = financials?.summary_md
    ? `<p style="margin:0;font-size:13px;color:#7A8FAD;line-height:1.7;white-space:pre-wrap">${financials.summary_md}</p>`
    : `<p style="margin:0;font-size:13px;color:#7A8FAD">No digital accounts filing available.</p>`;

  const verdictParagraphs = verdict
    .split(/\n\n+/)
    .map((p) => `<p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#CBD5E1">${p.trim()}</p>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Company Report: ${companyName}</title>
</head>
<body style="margin:0;padding:0;background:#060D1B;font-family:system-ui,sans-serif;color:#E8F0FE">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#060D1B;padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#0A1628;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;max-width:100%">

        <!-- Header -->
        <tr>
          <td style="padding:24px 32px;border-bottom:1px solid rgba(255,255,255,0.06)">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td><span style="font-size:16px;font-weight:600;color:#fff">Registrum</span></td>
                <td align="right">
                  <span style="display:inline-block;background:${badge.bg};color:${badge.color};font-size:11px;font-weight:700;padding:4px 10px;border-radius:4px;letter-spacing:0.05em">${badge.label}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Company identity -->
        <tr>
          <td style="padding:28px 32px 20px">
            <h1 style="margin:0 0 4px;font-size:22px;font-weight:700;color:#fff">${companyName}</h1>
            <p style="margin:0 0 2px;font-size:13px;color:#7A8FAD">Company number: ${companyNumber} &middot; Status: <span style="color:${status === "active" ? "#34d399" : "#f87171"}">${status}</span></p>
            <p style="margin:0;font-size:13px;color:#7A8FAD">Incorporated: ${created}${addressStr ? ` &middot; ${addressStr}` : ""}</p>
          </td>
        </tr>

        <!-- AI Verdict -->
        <tr>
          <td style="padding:0 32px 24px">
            <div style="background:#0F1E35;border:1px solid rgba(79,123,255,0.2);border-radius:8px;padding:20px 24px">
              <p style="margin:0 0 12px;font-size:11px;font-weight:600;color:#4F7BFF;letter-spacing:0.08em;text-transform:uppercase">AI Analysis</p>
              ${verdictParagraphs || `<p style="margin:0;font-size:14px;color:#7A8FAD">Analysis unavailable — see the data sections below.</p>`}
            </div>
          </td>
        </tr>

        <!-- Risk Flags -->
        <tr>
          <td style="padding:0 32px 24px">
            <p style="margin:0 0 12px;font-size:12px;font-weight:600;color:#7A8FAD;letter-spacing:0.06em;text-transform:uppercase">Risk Flags</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(255,255,255,0.06)">
              ${flagRows}
            </table>
          </td>
        </tr>

        ${directorRows ? `
        <!-- Directors -->
        <tr>
          <td style="padding:0 32px 24px;border-top:1px solid rgba(255,255,255,0.06)">
            <p style="margin:12px 0;font-size:12px;font-weight:600;color:#7A8FAD;letter-spacing:0.06em;text-transform:uppercase">Current Directors</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${directorRows}
            </table>
          </td>
        </tr>` : ""}

        ${pscRows ? `
        <!-- PSC Chain -->
        <tr>
          <td style="padding:0 32px 24px;border-top:1px solid rgba(255,255,255,0.06)">
            <p style="margin:12px 0;font-size:12px;font-weight:600;color:#7A8FAD;letter-spacing:0.06em;text-transform:uppercase">Beneficial Ownership Chain</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${pscRows}
            </table>
          </td>
        </tr>` : ""}

        <!-- Financials -->
        <tr>
          <td style="padding:0 32px 24px;border-top:1px solid rgba(255,255,255,0.06)">
            <p style="margin:12px 0;font-size:12px;font-weight:600;color:#7A8FAD;letter-spacing:0.06em;text-transform:uppercase">Financial Summary</p>
            ${financialsSummary}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06)">
            <p style="margin:0;font-size:11px;color:#3D5275;line-height:1.6">
              Report generated by Registrum &middot; Data sourced from Companies House under the Open Government Licence v3.0<br>
              This report is informational only and does not constitute legal or financial advice.<br>
              Questions? <a href="mailto:support@registrum.co.uk" style="color:#4F7BFF">support@registrum.co.uk</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_REPORT_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("report webhook signature error", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.metadata?.type !== "company_report") {
    return NextResponse.json({ received: true });
  }

  const companyNumber = session.metadata?.company_number;
  const email = session.customer_details?.email;

  if (!companyNumber || !email) {
    console.error("report webhook missing company_number or email", session.id);
    return NextResponse.json({ received: true });
  }

  // Fetch KYB report
  const report = await fetchKybReport(companyNumber);
  if (!report) {
    console.error("report webhook: KYB fetch failed for", companyNumber);
    // Still return 200 so Stripe doesn't retry — but email won't be sent
    return NextResponse.json({ received: true });
  }

  // Generate Claude verdict
  const verdict = await generateVerdict(report);

  // Build and send email
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
    console.error("report email send error", emailError);
  } else {
    console.log("report sent for", companyNumber, "to", email);
  }

  return NextResponse.json({ received: true });
}
