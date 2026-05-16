import { NextRequest, NextResponse } from "next/server";
import { createMagicToken } from "@/lib/dashboard-auth";
import { getResend } from "@/lib/resend";
import { getSupabase } from "@/lib/supabase";

const SITE_URL = "https://registrum.co.uk";

export async function POST(request: NextRequest) {
  let email: string;
  try {
    const body = await request.json();
    email = (body.email ?? "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email address required." }, { status: 422 });
  }

  // Check this email has an active API key — no point sending a link otherwise
  const { data: keys } = await getSupabase()
    .from("api_keys")
    .select("id")
    .eq("label", email)
    .eq("is_active", true)
    .limit(1);

  if (!keys || keys.length === 0) {
    // Return the same response to avoid email enumeration
    return NextResponse.json({ ok: true });
  }

  const token = createMagicToken(email);
  const link = `${SITE_URL}/api/dashboard/verify?token=${encodeURIComponent(token)}`;

  const { error: sendError } = await getResend().emails.send({
    from: "Registrum <api@registrum.co.uk>",
    to: email,
    subject: "Your Registrum dashboard link",
    html: buildEmailHtml(link),
  });

  if (sendError) {
    console.error("Resend send-link error:", sendError);
    return NextResponse.json({ error: "Failed to send login link. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

function buildEmailHtml(link: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Dashboard access</title></head>
<body style="margin:0;padding:0;background:#060D1B;font-family:system-ui,sans-serif;color:#E8F0FE">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#060D1B;padding:40px 20px">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#0A1628;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;max-width:100%">
        <tr><td style="padding:28px 36px 20px;border-bottom:1px solid rgba(255,255,255,0.06)">
          <span style="font-size:17px;font-weight:600;color:#fff">Registrum</span>
        </td></tr>
        <tr><td style="padding:28px 36px 32px">
          <h1 style="margin:0 0 12px;font-size:20px;font-weight:600;color:#fff">Access your dashboard</h1>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#7A8FAD">
            Click the button below to open your dashboard. This link expires in 24 hours and can only be used once.
          </p>
          <a href="${link}" style="display:inline-block;background:#4F7BFF;color:#fff;text-decoration:none;padding:11px 24px;border-radius:6px;font-size:14px;font-weight:500">
            Open my dashboard →
          </a>
          <p style="margin:20px 0 0;font-size:12px;color:#3D5275;line-height:1.6">
            If you didn't request this, you can safely ignore it. No changes have been made to your account.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
