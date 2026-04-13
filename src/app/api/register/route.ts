import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { getSupabase } from "@/lib/supabase";
import { getResend } from "@/lib/resend";

const KEY_PREFIX_LENGTH = 14; // "reg_live_" (9) + 5 hex chars

function generateKey(): { fullKey: string; prefix: string; keyHash: string } {
  const randomPart = crypto.randomBytes(16).toString("hex"); // 32 hex chars
  const fullKey = `reg_live_${randomPart}`;
  const prefix = fullKey.slice(0, KEY_PREFIX_LENGTH);
  const keyHash = bcrypt.hashSync(fullKey, 10);
  return { fullKey, prefix, keyHash };
}

function nextMonthReset(): string {
  const now = new Date();
  const reset =
    now.getMonth() === 11
      ? new Date(now.getFullYear() + 1, 0, 1)
      : new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return reset.toISOString();
}

export async function POST(request: NextRequest) {
  let email: string;
  try {
    const body = await request.json();
    email = (body.email ?? "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Basic email validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email address required." }, { status: 422 });
  }

  // Duplicate prevention: check if this email already has an active key.
  // We store email in the label field for MVP (avoids schema change).
  const { data: existing } = await getSupabase()
    .from("api_keys")
    .select("id, key_prefix, created_at")
    .eq("label", email)
    .eq("is_active", true)
    .limit(1);

  if (existing && existing.length > 0) {
    // Already has a key — resend a reminder email rather than provisioning a new one
    await getResend().emails.send({
      from: "Registrum <api@registrum.co.uk>",
      to: email,
      subject: "Your Registrum API key (already active)",
      html: buildEmailHtml(existing[0].key_prefix + "…", true),
    });
    return NextResponse.json({ ok: true, message: "Key already exists — check your inbox." });
  }

  // Generate and insert new key
  const { fullKey, prefix, keyHash } = generateKey();

  const { error: insertError } = await getSupabase().from("api_keys").insert({
    key_prefix: prefix,
    key_hash: keyHash,
    plan: "free",
    label: email,
    calls_this_month: 0,
    month_reset_at: nextMonthReset(),
    is_active: true,
  });

  if (insertError) {
    console.error("api_keys insert error", insertError);
    return NextResponse.json(
      { error: "Could not provision key. Please try again." },
      { status: 500 }
    );
  }

  // Send key delivery email
  const { error: emailError } = await getResend().emails.send({
    from: "Registrum <api@registrum.co.uk>",
    to: email,
    subject: "Your Registrum API key",
    html: buildEmailHtml(fullKey, false),
  });

  if (emailError) {
    // Key is provisioned — log the failure but don't surface it as an error to the user
    console.error("resend email error", emailError);
  }

  return NextResponse.json({ ok: true });
}

function buildEmailHtml(key: string, isResend: boolean): string {
  const headline = isResend ? "Your API key is already active" : "Your API key is ready";
  const introLine = isResend
    ? `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#7A8FAD">You already have an active Registrum API key. Here&apos;s the prefix as a reminder &mdash; if you&apos;ve lost the full key, reply to this email and we&apos;ll sort it out.</p>`
    : `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#7A8FAD">Here&apos;s your Registrum API key. Keep it safe &mdash; we won&apos;t show it again.</p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${headline}</title>
</head>
<body style="margin:0;padding:0;background:#060D1B;font-family:system-ui,sans-serif;color:#E8F0FE">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#060D1B;padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#0A1628;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;max-width:100%">
        <tr>
          <td style="padding:32px 40px 24px;border-bottom:1px solid rgba(255,255,255,0.06)">
            <span style="font-size:18px;font-weight:600;color:#fff">Registrum</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px">
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#fff">${headline}</h1>
            ${introLine}
            <div style="margin:24px 0;background:#060D1B;border:1px solid rgba(79,123,255,0.3);border-radius:8px;padding:16px 20px;font-family:monospace;font-size:14px;color:#E8F0FE;word-break:break-all">
              ${key}
            </div>
            <h2 style="margin:24px 0 12px;font-size:16px;font-weight:600;color:#fff">Get started in 30 seconds</h2>
            <pre style="margin:0 0 24px;background:#060D1B;border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:16px 20px;font-size:13px;color:#7A8FAD;overflow:auto;white-space:pre-wrap"><code>curl -H "X-API-Key: ${key}" \\
  https://api.registrum.co.uk/v1/company/00445790</code></pre>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:0 12px 0 0">
                  <a href="https://registrum.co.uk/quickstart" style="display:inline-block;background:#4F7BFF;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:500">Quickstart guide</a>
                </td>
                <td style="padding:0 12px 0 0">
                  <a href="https://api.registrum.co.uk/docs" style="display:inline-block;border:1px solid rgba(255,255,255,0.1);color:#E8F0FE;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:14px">API docs</a>
                </td>
                <td>
                  <a href="https://registrum.co.uk/dashboard" style="display:inline-block;border:1px solid rgba(255,255,255,0.1);color:#E8F0FE;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:14px">View usage</a>
                </td>
              </tr>
            </table>
            <table style="margin-top:32px;width:100%;border-top:1px solid rgba(255,255,255,0.06);padding-top:24px" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:0 16px 0 0;border-right:1px solid rgba(255,255,255,0.06)">
                  <div style="font-size:20px;font-weight:600;color:#fff">50</div>
                  <div style="font-size:11px;color:#7A8FAD;margin-top:2px">free calls / month</div>
                </td>
                <td style="padding:0 16px">
                  <div style="font-size:20px;font-weight:600;color:#fff">24h</div>
                  <div style="font-size:11px;color:#7A8FAD;margin-top:2px">company cache</div>
                </td>
                <td style="padding:0 0 0 16px;border-left:1px solid rgba(255,255,255,0.06)">
                  <div style="font-size:20px;font-weight:600;color:#fff">7d</div>
                  <div style="font-size:11px;color:#7A8FAD;margin-top:2px">financials cache</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px 28px;border-top:1px solid rgba(255,255,255,0.06)">
            <p style="margin:0;font-size:12px;color:#3D5275;line-height:1.6">
              Questions? Reply to this email or contact <a href="mailto:support@registrum.co.uk" style="color:#4F7BFF">support@registrum.co.uk</a><br>
              Eugene Merwe-Chartier trading as Registrum &middot; Data sourced under the Open Government Licence v3.0
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
