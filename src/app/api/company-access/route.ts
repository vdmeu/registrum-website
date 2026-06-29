import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getResend } from "@/lib/resend";
import { createMagicToken } from "@/lib/dashboard-auth";
import { SITE_URL } from "@/lib/constants";
import { generateKey, nextMonthReset } from "@/lib/apiKeys";

function isValidReturnUrl(url: unknown): url is string {
  return typeof url === "string" && /^\/company\/\d{7,8}$/.test(url);
}

function buildVerifyUrl(email: string, returnUrl: string): string {
  const token = createMagicToken(email);
  return `${SITE_URL}/api/dashboard/verify?token=${encodeURIComponent(token)}&returnUrl=${encodeURIComponent(returnUrl)}`;
}

export async function POST(request: NextRequest) {
  let email: string;
  let returnUrl: string;

  try {
    const body = await request.json();
    email = (body.email ?? "").trim().toLowerCase();
    returnUrl = body.returnUrl ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email address required." }, { status: 422 });
  }

  if (!isValidReturnUrl(returnUrl)) {
    return NextResponse.json({ error: "Invalid return URL." }, { status: 422 });
  }

  const companyNumber = returnUrl.replace("/company/", "");

  // Check if user already has an active key
  const { data: existing } = await getSupabase()
    .from("api_keys")
    .select("id")
    .eq("label", email)
    .eq("is_active", true)
    .limit(1);

  const verifyUrl = buildVerifyUrl(email, returnUrl);

  if (existing && existing.length > 0) {
    // Existing user: send sign-in link back to company page
    await getResend().emails.send({
      from: "Registrum <api@registrum.co.uk>",
      to: email,
      subject: `Your link to view live company data`,
      html: buildExistingUserEmail(verifyUrl, companyNumber),
    });
    return NextResponse.json({ ok: true });
  }

  // New user: provision a free key then send registration email with company link
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
    return NextResponse.json({ error: "Could not create account. Please try again." }, { status: 500 });
  }

  const { error: emailError } = await getResend().emails.send({
    from: "Registrum <api@registrum.co.uk>",
    to: email,
    subject: "Your Registrum account is ready",
    html: buildNewUserEmail(verifyUrl, companyNumber, fullKey),
  });

  if (emailError) {
    console.error("resend email error", emailError);
  }

  return NextResponse.json({ ok: true });
}

function buildExistingUserEmail(verifyUrl: string, companyNumber: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>View live company data</title></head>
<body style="margin:0;padding:0;background:#060D1B;font-family:system-ui,sans-serif;color:#E8F0FE">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#060D1B;padding:40px 20px">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#0A1628;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;max-width:100%">
        <tr><td style="padding:28px 36px 20px;border-bottom:1px solid rgba(255,255,255,0.06)">
          <span style="font-size:17px;font-weight:600;color:#fff">Registrum</span>
        </td></tr>
        <tr><td style="padding:28px 36px 32px">
          <h1 style="margin:0 0 12px;font-size:20px;font-weight:600;color:#fff">View live company data</h1>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#7A8FAD">
            Click below to view the live financials, directors, and ownership data for company ${companyNumber}.
            This link signs you in automatically and expires in 24 hours.
          </p>
          <a href="${verifyUrl}" style="display:inline-block;background:#4F7BFF;color:#fff;text-decoration:none;padding:11px 24px;border-radius:6px;font-size:14px;font-weight:500">
            View live data →
          </a>
          <p style="margin:20px 0 0;font-size:12px;color:#3D5275;line-height:1.6">
            If you didn't request this, you can safely ignore it.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildNewUserEmail(verifyUrl: string, companyNumber: string, apiKey: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Your Registrum account is ready</title></head>
<body style="margin:0;padding:0;background:#060D1B;font-family:system-ui,sans-serif;color:#E8F0FE">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#060D1B;padding:40px 20px">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#0A1628;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;max-width:100%">
        <tr><td style="padding:28px 36px 20px;border-bottom:1px solid rgba(255,255,255,0.06)">
          <span style="font-size:17px;font-weight:600;color:#fff">Registrum</span>
        </td></tr>
        <tr><td style="padding:28px 36px 32px">
          <h1 style="margin:0 0 12px;font-size:20px;font-weight:600;color:#fff">Your account is ready</h1>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#7A8FAD">
            Click below to view the live financials, directors, and ownership data for company ${companyNumber}.
            This link signs you in automatically. You have 50 free lookups per month.
          </p>
          <a href="${verifyUrl}" style="display:inline-block;background:#4F7BFF;color:#fff;text-decoration:none;padding:11px 24px;border-radius:6px;font-size:14px;font-weight:500">
            View live data →
          </a>
          <p style="margin:24px 0 8px;font-size:12px;font-weight:600;color:#7A8FAD;text-transform:uppercase;letter-spacing:0.05em">Your API key</p>
          <div style="background:#060D1B;border:1px solid rgba(79,123,255,0.3);border-radius:8px;padding:14px 18px;font-family:monospace;font-size:13px;color:#E8F0FE;word-break:break-all;margin-bottom:16px">
            ${apiKey}
          </div>
          <p style="margin:0 0 20px;font-size:12px;line-height:1.6;color:#3D5275">
            Keep this key safe — we won't show it again. Use it for direct API access or manage it at your
            <a href="https://registrum.co.uk/dashboard" style="color:#4F7BFF">dashboard</a>.
          </p>
          <p style="margin:0;font-size:12px;color:#3D5275;line-height:1.6">
            Questions? Reply to this email or contact <a href="mailto:support@registrum.co.uk" style="color:#4F7BFF">support@registrum.co.uk</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
