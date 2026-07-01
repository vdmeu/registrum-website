import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getSupabase } from "@/lib/supabase";
import { getResend } from "@/lib/resend";
import { createMagicToken } from "@/lib/dashboard-auth";
import { getPlans } from "@/lib/plans";
import { wrapEmail, emailButtonRow, emailStatsRow } from "@/lib/email-template";
import { SITE_URL } from "@/lib/constants";
import { generateKey, nextMonthReset } from "@/lib/apiKeys";
import { captureException } from "@/lib/sentry";
import { createApiKey, updateApiKeyPlan } from "@/lib/internal-api";

/** True when the R1 single-writer flag is explicitly set to "true". */
function useInternalApi(): boolean {
  return process.env.USE_API_INTERNAL_API_KEYS === "true";
}

function firstNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  const segment = local.split(/[._+]/)[0] ?? "";
  const alpha = segment.replace(/[^a-zA-Z]/g, "");
  if (alpha.length < 2 || alpha.length > 15) return "";
  return alpha.charAt(0).toUpperCase() + alpha.slice(1).toLowerCase();
}

async function notifyNewSubscriber(email: string, plan: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  // Price comes from the API's GET /v1/plans (single source of truth) rather
  // than a hardcoded £49/£9 string that silently drifts when pricing changes.
  const plans = await getPlans();
  const price = plans[plan]?.price_gbp;
  const priceLabel = price != null ? `£${price}/month` : "custom pricing";
  const text =
    `💳 *New paying subscriber*\n` +
    `Email: \`${email}\`\n` +
    `Plan: ${plan} (${priceLabel})`;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
    });
  } catch {
    console.error("telegram alert failed");
  }
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
        // Normalize to match the label written by /api/register and
        // /api/company-access — otherwise a casing mismatch (e.g. Stripe
        // reports "John@example.com" but the free key was stored as
        // "john@example.com") defeats the dedup lookup below and the
        // duplicate-row bug resurfaces.
        const email = session.customer_details?.email?.trim().toLowerCase();
        if (!email) {
          console.error("checkout.session.completed missing email", session.id);
          break;
        }

        const plan = (session.metadata?.plan ?? "pro") as "pro" | "web";

        // An email may already have an active key (e.g. signed up free via
        // /api/register before subscribing). Upgrade that row in place rather
        // than inserting a second one — otherwise the account ends up split
        // across two api_keys rows under the same email, with usage history
        // stuck on the old row and the new row showing zero activity.
        const { data: existingKey } = await getSupabase()
          .from("api_keys")
          .select("id, key_prefix")
          .eq("label", email)
          .eq("is_active", true)
          .limit(1)
          .maybeSingle();

        const verifyUrl = `${SITE_URL}/api/dashboard/verify?token=${encodeURIComponent(createMagicToken(email))}`;
        const firstName = firstNameFromEmail(email);

        if (existingKey) {
          // R1 path: plan update goes through the internal API.
          // Note: stripe IDs (customer/subscription) are set separately via
          // Supabase direct write since UpdatePlanRequest only accepts plan +
          // plan_expires_at (matches the internal API contract in routes_internal.py).
          if (useInternalApi()) {
            const updated = await updateApiKeyPlan(existingKey.id, { plan });
            if (!updated) {
              console.error("api_keys updateApiKeyPlan returned null for id:", existingKey.id);
              break;
            }
          } else {
            const { error: updateError } = await getSupabase()
              .from("api_keys")
              .update({
                plan,
                stripe_customer_id: session.customer as string | null,
                stripe_subscription_id: session.subscription as string | null,
              })
              .eq("id", existingKey.id);

            if (updateError) {
              console.error("api_keys update error", updateError);
              break;
            }
          }

          const emailSubject =
            plan === "web"
              ? "Your Registrum Web subscription is active"
              : firstName
              ? `Your Registrum Pro plan is active, ${firstName}`
              : "Your Registrum Pro plan is active";
          const emailHtml =
            plan === "web"
              ? await buildWebEmail(email, verifyUrl, firstName)
              : await buildProUpgradeEmail(existingKey.key_prefix, verifyUrl, firstName);

          const { error: emailError } = await getResend().emails.send({
            from: "Registrum <api@registrum.co.uk>",
            to: email,
            subject: emailSubject,
            html: emailHtml,
          });

          if (emailError) {
            console.error("resend email error", emailError);
          }

          await notifyNewSubscriber(email, plan);
          break;
        }

        // No existing key: create one.
        let fullKey: string;
        let prefix: string;

        if (useInternalApi()) {
          // R1 path: create via internal API.
          const row = await createApiKey({ plan, label: email });
          fullKey = row.full_key;
          prefix = row.key_prefix;
        } else {
          // Legacy path: direct Supabase insert.
          const generated = generateKey();
          fullKey = generated.fullKey;
          prefix = generated.prefix;

          const { error: insertError } = await getSupabase().from("api_keys").insert({
            key_prefix: prefix,
            key_hash: generated.keyHash,
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
        }

        const emailSubject =
          plan === "web"
            ? "Your Registrum Web subscription is active"
            : firstName
            ? `Your Registrum Pro API key, ${firstName}`
            : "Your Registrum Pro API key";
        const emailHtml =
          plan === "web"
            ? await buildWebEmail(email, verifyUrl, firstName)
            : await buildProKeyEmail(fullKey, verifyUrl, firstName);

        const { error: emailError } = await getResend().emails.send({
          from: "Registrum <api@registrum.co.uk>",
          to: email,
          subject: emailSubject,
          html: emailHtml,
        });

        if (emailError) {
          console.error("resend email error", emailError);
        }

        await notifyNewSubscriber(email, plan);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        // Downgrade api_keys — R1: route plan update through the internal API.
        if (useInternalApi()) {
          // Look up the key ID via Supabase (read-only, allowed in R1).
          const { data: keyRow } = await getSupabase()
            .from("api_keys")
            .select("id")
            .eq("stripe_subscription_id", subscription.id)
            .eq("is_active", true)
            .limit(1)
            .maybeSingle();

          if (keyRow) {
            const updated = await updateApiKeyPlan(keyRow.id, { plan: "free" });
            if (!updated) {
              console.error("api_keys updateApiKeyPlan returned null for id:", keyRow.id);
            }
          } else {
            console.error("subscription downgrade: key not found for sub:", subscription.id);
          }
        } else {
          // Legacy path: direct Supabase update by stripe_subscription_id.
          const { error } = await getSupabase()
            .from("api_keys")
            .update({ plan: "free" })
            .eq("stripe_subscription_id", subscription.id);

          if (error) {
            console.error("subscription downgrade error", error);
          }
        }

        // Also remove web_sessions for this customer (not an api_keys write —
        // web_sessions are outside R1 scope, always direct Supabase).
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
    await captureException(err, { route: "stripe/webhook", eventType: event.type });
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function buildWebEmail(email: string, verifyUrl: string, firstName: string): Promise<string> {
  const greeting = firstName ? `Hi ${firstName}, web subscription active` : "Web subscription active";
  const body = `
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#fff">${greeting}</h1>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#7A8FAD">
              You now have unlimited UK company lookups on registrum.co.uk. Your subscription is linked to <strong style="color:#E8F0FE">${email}</strong>.
            </p>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#7A8FAD">
              After your first lookup, a session cookie is set automatically &mdash; no login required. Lookups are unlimited for 35 days per session.
            </p>
            ${emailButtonRow([
              { href: "https://registrum.co.uk", label: "Start looking up companies", primary: true },
              { href: verifyUrl, label: "Open your dashboard" },
            ])}`;
  return wrapEmail("Your Registrum Web subscription is active", body);
}

async function buildProUpgradeEmail(keyPrefix: string, verifyUrl: string, firstName: string): Promise<string> {
  const greeting = firstName ? `Hi ${firstName}, you&apos;re on Pro` : "You&apos;re on Pro";
  const plans = await getPlans();
  const monthly = plans.pro.monthly_limit?.toLocaleString();
  const body = `
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#fff">${greeting}</h1>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#7A8FAD">
              Your existing API key (<code style="color:#E8F0FE">${keyPrefix}&hellip;</code>) has been upgraded to the Pro plan &mdash; no need to change anything in your integration. New limits: ${monthly} calls/month, ${plans.pro.daily_limit} calls/day, director network up to depth=2.
            </p>
            ${emailButtonRow([
              { href: verifyUrl, label: "Open your dashboard", primary: true },
              { href: "https://api.registrum.co.uk/docs", label: "API docs" },
            ])}`;
  return wrapEmail("Your Registrum Pro plan is active", body);
}

async function buildProKeyEmail(key: string, verifyUrl: string, firstName: string): Promise<string> {
  const greeting = firstName ? `Hi ${firstName}, you&apos;re on Pro` : "You&apos;re on Pro";
  const plans = await getPlans();
  const body = `
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#fff">${greeting}</h1>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#7A8FAD">Here&apos;s your Pro API key. Keep it safe &mdash; we won&apos;t show it again.</p>
            <div style="margin:0 0 24px;background:#060D1B;border:1px solid rgba(79,123,255,0.3);border-radius:8px;padding:16px 20px;font-family:monospace;font-size:14px;color:#E8F0FE;word-break:break-all">
              ${key}
            </div>
            <h2 style="margin:0 0 12px;font-size:15px;font-weight:600;color:#fff">Quick start</h2>
            <pre style="margin:0 0 28px;background:#060D1B;border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:16px 20px;font-size:13px;color:#7A8FAD;overflow:auto;white-space:pre-wrap"><code>curl -H "X-API-Key: ${key}" \\
  https://api.registrum.co.uk/v1/company/00445790</code></pre>
            <h2 style="margin:0 0 16px;font-size:15px;font-weight:600;color:#fff">What&apos;s included in Pro</h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
                  <div style="font-size:12px;font-family:monospace;color:#4F7BFF">/v1/company/{number}</div>
                  <div style="font-size:13px;color:#7A8FAD;margin-top:2px">Registered address, status, SIC codes, officers count</div>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
                  <div style="font-size:12px;font-family:monospace;color:#4F7BFF">/v1/directors/{number}/network</div>
                  <div style="font-size:13px;color:#7A8FAD;margin-top:2px">Co-directorship graph up to depth 2 &mdash; who controls what</div>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
                  <div style="font-size:12px;font-family:monospace;color:#4F7BFF">/v1/psc/{number}</div>
                  <div style="font-size:13px;color:#7A8FAD;margin-top:2px">Persons of significant control and beneficial ownership chain</div>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
                  <div style="font-size:12px;font-family:monospace;color:#4F7BFF">/v1/financials/{number}</div>
                  <div style="font-size:13px;color:#7A8FAD;margin-top:2px">Parsed accounts &mdash; revenue, profit, net assets, key ratios</div>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
                  <div style="font-size:12px;font-family:monospace;color:#4F7BFF">/v1/kyb/{number} &nbsp;&middot;&nbsp; /v1/aml/screen</div>
                  <div style="font-size:13px;color:#7A8FAD;margin-top:2px">KYB due diligence summary and AML sanctions/PEP screening</div>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0">
                  <div style="font-size:12px;font-family:monospace;color:#4F7BFF">/v1/webhooks</div>
                  <div style="font-size:13px;color:#7A8FAD;margin-top:2px">Watch companies for changes: status, directors, PSCs, overdue filings</div>
                </td>
              </tr>
            </table>
            ${emailStatsRow([
              { value: plans.pro.monthly_limit?.toLocaleString() ?? "", label: "calls / month" },
              { value: String(plans.pro.daily_limit ?? ""), label: "calls / day" },
              { value: "depth=2", label: "director network" },
            ])}
            ${emailButtonRow([
              { href: verifyUrl, label: "Open your dashboard", primary: true },
              { href: "https://api.registrum.co.uk/docs", label: "API docs" },
              { href: "https://registrum.co.uk/quickstart", label: "Quickstart" },
            ])}`;
  return wrapEmail("Your Registrum Pro API key", body);
}
