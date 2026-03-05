import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getStripe } from "@/lib/stripe";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  let body: { session_id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { session_id } = body;
  if (!session_id) {
    return NextResponse.json({ error: "session_id required" }, { status: 400 });
  }

  let session;
  try {
    session = await getStripe().checkout.sessions.retrieve(session_id);
  } catch (err) {
    console.error("stripe session retrieve error", err);
    return NextResponse.json({ error: "Could not retrieve session" }, { status: 400 });
  }

  if (
    session.metadata?.plan !== "web" ||
    session.payment_status !== "paid"
  ) {
    return NextResponse.json({ error: "Not a valid paid web session" }, { status: 400 });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await getSupabase().from("web_sessions").insert({
    token,
    stripe_customer_id: session.customer as string,
    expires_at: expiresAt,
  });

  if (error) {
    console.error("web_sessions insert error", error);
    return NextResponse.json({ error: "Could not create session" }, { status: 500 });
  }

  return NextResponse.json({ token });
}
