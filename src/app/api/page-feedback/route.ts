import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

const VALID_SENTIMENTS = new Set(["up", "down"]);

export async function POST(request: NextRequest) {
  let page_url: string, sentiment: string, message: string | undefined;
  try {
    const body = await request.json();
    page_url = (body.page_url ?? "").trim();
    sentiment = (body.sentiment ?? "").trim();
    message =
      typeof body.message === "string" ? body.message.trim().slice(0, 1000) : undefined;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!page_url) {
    return NextResponse.json({ error: "page_url is required." }, { status: 422 });
  }
  if (!VALID_SENTIMENTS.has(sentiment)) {
    return NextResponse.json(
      { error: "sentiment must be 'up' or 'down'." },
      { status: 422 },
    );
  }

  try {
    const { error } = await getSupabase()
      .from("page_feedback")
      .insert({
        page_url,
        sentiment,
        message: message || null,
      });

    if (error) {
      console.error("page_feedback insert error", error);
      return NextResponse.json({ error: "Could not save feedback." }, { status: 500 });
    }
  } catch (err) {
    console.error("page_feedback unexpected error", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
