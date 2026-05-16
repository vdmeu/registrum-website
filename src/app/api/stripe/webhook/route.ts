import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getSupabase } from "@/lib/supabase";
import { getResend } from "@/lib/resend";
import { createMagicToken } from "@/lib/dashboard-auth";

const SITE_URL = "https://registrum.co.uk";

const KEY_PREFIX_LENGTH = 14;

function generateKey(): { fullKey: string; prefix: string; keyHash: string } {
  const randomPart = crypto.randomBytes(16).toString("hex");
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

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("stripe webhook signature error", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.customer_details?.email;
        if (!email) {
          console.error("checkout.session.completed missing email", session.id);
          break;
        }

        const plan = (session.metadata?.plan ?? "pro") as "pro" | "web";
        const { fullKey, prefix, keyHash } = generateKey();

        const { error: insertError } = await getSupabase().from("api_keys").insert({
          key_prefix: prefix,
          key_hash: keyHash,
          plan,
          label: email,
          calls_this_month: 0,
          month_reset_at: nextMonthReset(),
          is_active: true,
          stripe_customer_id: session.customer as string | null,
          stripe_subscription_id: session.subscription as string | null,
        });

        if (insertError) {
          console.error("api_keys insert error", insertError);
          break;
        }

        const verifyUrl = `${SITE_URL}/api/dashboard/verify?token=${encodeURIComponent(createMagicToken(email))}`;
        const emailSubject =
          plan === "web"
            ? "Your Registrum Web subscription is active"
            : "Your Registrum Pro API key";
        const emailHtml =
          plan === "web"
            ? buildWebEmail(email, verifyUrl)
            : buildProKeyEmail(fullKey, verifyUrl);

        const { error: emailError } = await getResend().emails.send({
          from: "Registrum <api@registrum.co.uk>",
          to: email,
          subject: emailSubject,
          html: emailHtml,
        });

        if (emailError) {
          console.error("resend email error", emailError);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        // Downgrade api_keys
        const { error } = await getSupabase()
          .from("api_keys")
          .update({ plan: "free" })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          console.error("subscription downgrade error", error);
        }

        // Also remove web_sessions for this customer
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id;
        if (customerId) {
          const { error: sessionError } = await getSupabase()
            .from("web_sessions")
            .delete()
            .eq("stripe_customer_id", customerId);
          if (sessionError) {
            console.error("web_sessions delete error", sessionError);
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        console.log("invoice.payment_failed", event.id);
        break;
      }
    }
  } catch (err) {
    console.error("webhook handler error", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

function buildWebEmail(email: string, verifyUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Your Registrum Web subscription is active</title>
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
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#fff">Web subscription active</h1>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#7A8FAD">
              You now have unlimited UK company lookups on registrum.co.uk. Your subscription is linked to <strong style="color:#E8F0FE">${email}</strong>.
            </p>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#7A8FAD">
              After your first lookup, a session cookie is set automatically &mdash; no login required. Lookups are unlimited for 35 days per session.
            </p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:0 12px 0 0">
                  <a href="https://registrum.co.uk" style="display:inline-block;background:#4F7BFF;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:500">Start looking up companies</a>
                </td>
                <td>
                  <a href="${verifyUrl}" style="display:inline-block;border:1px solid rgba(255,255,255,0.1);color:#E8F0FE;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:14px">Open your dashboard</a>
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

function buildProKeyEmail(key: string, verifyUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Your Registrum Pro API key</title>
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
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#fff">You&apos;re on Pro</h1>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#7A8FAD">Here&apos;s your Pro API key. Keep it safe &mdash; we won&apos;t show it again.</p>
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
                <td style="padding:0 12px">
                  <a href="https://api.registrum.co.uk/docs" style="display:inline-block;border:1px solid rgba(255,255,255,0.1);color:#E8F0FE;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:14px">API docs</a>
                </td>
                <td>
                  <a href="${verifyUrl}" style="display:inline-block;border:1px solid rgba(255,255,255,0.1);color:#E8F0FE;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:14px">Open your dashboard</a>
                </td>
              </tr>
            </table>
            <table style="margin-top:32px;width:100%;border-top:1px solid rgba(255,255,255,0.06);padding-top:24px" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:0 16px 0 0;border-right:1px solid rgba(255,255,255,0.06)">
                  <div style="font-size:20px;font-weight:600;color:#fff">2,000</div>
                  <div style="font-size:11px;color:#7A8FAD;margin-top:2px">calls / month</div>
                </td>
                <td style="padding:0 16px">
                  <div style="font-size:20px;font-weight:600;color:#fff">30/min</div>
                  <div style="font-size:11px;color:#7A8FAD;margin-top:2px">burst rate</div>
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
