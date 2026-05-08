import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://api.registrum.co.uk";

// Pro plan key required — compliance endpoint is pro/enterprise only.
// Set REGISTRUM_DEMO_PRO_KEY in Vercel env vars to use live data.
// Without it the demo renders realistic static data.
const PRO_KEY = process.env.REGISTRUM_DEMO_PRO_KEY;

export const MOCK_COMPLIANCE = {
  status: "success",
  data: {
    company_number: "00445790",
    directors_total: 7,
    directors_verified: 4,
    directors_unverified: 2,
    directors_unknown: 1,
    pscs_total: 0,
    pscs_verified: 0,
    pscs_unverified: 0,
    pscs_unknown: 0,
    verification_rate: 0.667,
    verification_risk: "partial",
    unverified_persons: [
      { name: "MURPHY, Ken", role: "director", kind: "director" },
      { name: "STEWART, Imran", role: "director", kind: "director" },
    ],
    eccta_enforcement_deadline: "2026-11-18",
  },
  cached: false,
  _mock: true,
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const company = searchParams.get("company");

  if (!company) {
    return NextResponse.json(
      { status: "error", detail: "company param required" },
      { status: 400 }
    );
  }

  if (!PRO_KEY) {
    return NextResponse.json(MOCK_COMPLIANCE);
  }

  try {
    const url = `${API_BASE}/v1/company/${encodeURIComponent(company)}/compliance`;
    const res = await fetch(url, {
      headers: { "X-API-Key": PRO_KEY },
      cache: "no-store",
    });
    return NextResponse.json(await res.json(), { status: res.status });
  } catch {
    return NextResponse.json(
      { status: "error", detail: "Demo unavailable" },
      { status: 502 }
    );
  }
}
