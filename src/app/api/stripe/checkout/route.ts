import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

const SITE_URL = "https://registrum.co.uk";

export async function POST(req: NextRequest) {
  let plan: "web" | "pro" = "pro";
  try {
    const body = await req.json();
    if (body.plan === "web") plan = "web";
  } catch {
    // default to pro if body missing
  }

  const priceId =
    plan === "web"
      ? process.env.STRIPE_WEB_PRICE_ID
      : process.env.STRIPE_PRO_PRICE_ID;

  if (!priceId) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/checkout/cancel`,
      allow_promotion_codes: true,
      metadata: { plan },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("stripe checkout error", err);
    return NextResponse.json({ error: "Could not create checkout session" }, { status: 500 });
  }
}
