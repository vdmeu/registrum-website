import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { SITE_URL } from "@/lib/constants";

function normaliseCompanyNumber(raw: string): string {
  const trimmed = raw.trim().toUpperCase();
  // If purely numeric, zero-pad to 8 chars
  if (/^\d+$/.test(trimmed)) return trimmed.padStart(8, "0");
  return trimmed;
}

export async function POST(req: NextRequest) {
  let company_number: string;
  let email: string | undefined;
  try {
    const body = await req.json();
    company_number = body.company_number;
    email = body.email;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!company_number || typeof company_number !== "string") {
    return NextResponse.json({ error: "company_number is required" }, { status: 400 });
  }

  const normalised = normaliseCompanyNumber(company_number);
  if (!/^[A-Z0-9]{1,8}$/.test(normalised)) {
    return NextResponse.json({ error: "Invalid company number format" }, { status: 400 });
  }

  const priceId = process.env.STRIPE_REPORT_PRICE_ID;
  if (!priceId) {
    return NextResponse.json({ error: "Report pricing not configured" }, { status: 500 });
  }

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${SITE_URL}/report/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/report`,
      allow_promotion_codes: true,
      metadata: { company_number: normalised, type: "company_report" },
      ...(email ? { customer_email: email } : {}),
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("report checkout error", err);
    return NextResponse.json({ error: "Could not create checkout session" }, { status: 500 });
  }
}
