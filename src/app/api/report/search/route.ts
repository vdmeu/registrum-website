import { NextRequest, NextResponse } from "next/server";

const REGISTRUM_API = "https://api.registrum.co.uk";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ items: [] });

  const apiKey = process.env.REGISTRUM_DEMO_API_KEY;
  if (!apiKey) return NextResponse.json({ items: [] });

  try {
    const res = await fetch(
      `${REGISTRUM_API}/v1/search?q=${encodeURIComponent(q)}&limit=6`,
      { headers: { "X-API-Key": apiKey }, signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return NextResponse.json({ items: [] });
    const json = await res.json();
    return NextResponse.json({ items: json.data?.items ?? [] });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
