import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { getSupabase } from "@/lib/supabase";
import { getResend } from "@/lib/resend";
import { createMagicToken } from "@/lib/dashboard-auth";
import { getPlans } from "@/lib/plans";
import { wrapEmail, emailButtonRow, emailStatsRow } from "@/lib/email-template";

const SITE_URL = "https://registrum.co.uk";

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
    const verifyUrl = `${SITE_URL}/api/dashboard/verify?token=${encodeURIComponent(createMagicToken(email))}`;
    await getResend().emails.send({
      from: "Registrum <api@registrum.co.uk>",
      to: email,
      subject: "Your Registrum API key (already active)",
      html: await buildEmailHtml(existing[0].key_prefix + "…", true, verifyUrl),
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
  const verifyUrl = `${SITE_URL}/api/dashboard/verify?token=${encodeURIComponent(createMagicToken(email))}`;
  const { error: emailError } = await getResend().emails.send({
    from: "Registrum <api@registrum.co.uk>",
    to: email,
    subject: "Your Registrum API key",
    html: await buildEmailHtml(fullKey, false, verifyUrl),
  });

  if (emailError) {
    // Key is provisioned — log the failure but don't surface it as an error to the user
    console.error("resend email error", emailError);
  }

  return NextResponse.json({ ok: true });
}

async function buildEmailHtml(key: string, isResend: boolean, verifyUrl: string): Promise<string> {
  const headline = isResend ? "Your Registrum account is already active" : "Your Registrum account is ready";
  const introLine = isResend
    ? `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#7A8FAD">You already have an active Registrum account. Here&apos;s your API key prefix as a reminder &mdash; if you&apos;ve lost the full key, you can rotate it from your dashboard or reply to this email.</p>`
    : `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#7A8FAD">Your account is set up. Your email address is your login &mdash; use it at your dashboard to look up companies in your browser or manage your API key. Keep the key below safe; we won&apos;t show it again.</p>`;

  const plans = await getPlans();
  const body = `
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#fff">${headline}</h1>
            ${introLine}
            <div style="margin:24px 0;background:#060D1B;border:1px solid rgba(79,123,255,0.3);border-radius:8px;padding:16px 20px;font-family:monospace;font-size:14px;color:#E8F0FE;word-break:break-all">
              ${key}
            </div>
            <h2 style="margin:24px 0 12px;font-size:16px;font-weight:600;color:#fff">Get started in 30 seconds</h2>
            <pre style="margin:0 0 24px;background:#060D1B;border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:16px 20px;font-size:13px;color:#7A8FAD;overflow:auto;white-space:pre-wrap"><code>curl -H "X-API-Key: ${key}" \\
  https://api.registrum.co.uk/v1/company/00445790</code></pre>
            ${emailButtonRow([
              { href: "https://registrum.co.uk/quickstart", label: "Quickstart guide", primary: true },
              { href: "https://api.registrum.co.uk/docs", label: "API docs" },
              { href: verifyUrl, label: "Open your dashboard" },
            ])}
            <table style="margin-top:32px;width:100%;border-top:1px solid rgba(255,255,255,0.06);padding-top:24px" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:0 16px 0 0;border-right:1px solid rgba(255,255,255,0.06)">
                  <div style="font-size:20px;font-weight:600;color:#fff">${plans.free.monthly_limit}</div>
                  <div style="font-size:11px;color:#7A8FAD;margin-top:2px">free calls / month</div>
                </td>
                <td style="padding:0 16px">
                  <div style="font-size:20px;font-weight:600;color:#fff">30d</div>
                  <div style="font-size:11px;color:#7A8FAD;margin-top:2px">company cache</div>
                </td>
                <td style="padding:0 0 0 16px;border-left:1px solid rgba(255,255,255,0.06)">
                  <div style="font-size:20px;font-weight:600;color:#fff">90d</div>
                  <div style="font-size:11px;color:#7A8FAD;margin-top:2px">financials cache</div>
                </td>
              </tr>
            </table>`;

  return wrapEmail(headline, body);
}
