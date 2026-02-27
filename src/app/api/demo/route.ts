import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://api.registrum.co.uk";
const DEMO_KEY = process.env.DEMO_API_KEY;

// Shown when no DEMO_API_KEY is set in Vercel env vars
const MOCK_SEARCH = {
  status: "success",
  data: {
    items: [
      { company_number: "00445790", title: "TESCO PLC", company_status: "active", date_of_creation: "1947-11-27", address_snippet: "Tesco House, Shire Park, Kestrel Way, Welwyn Garden City, AL7 1GA" },
      { company_number: "00102498", title: "MARKS AND SPENCER PLC", company_status: "active", date_of_creation: "1903-09-08", address_snippet: "Waterside House, 35 North Wharf Road, London, W2 1NW" },
      { company_number: "00004366", title: "J SAINSBURY PLC", company_status: "active", date_of_creation: "1922-11-13", address_snippet: "33 Holborn, London, EC1N 2HT" },
    ],
  },
  cached: false,
  _mock: true,
};

const MOCK_COMPANY = {
  status: "success",
  data: {
    company_number: "00445790",
    company_name: "TESCO PLC",
    company_status: "active",
    company_type: "plc",
    date_of_creation: "1947-11-27",
    company_age_years: 78,
    registered_office_address: { address_line_1: "Tesco House, Shire Park", locality: "Welwyn Garden City", postal_code: "AL7 1GA" },
    accounts_overdue: false,
    confirmation_statement_overdue: false,
    sic_codes: ["47110"],
  },
  cached: false,
  _mock: true,
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const company = searchParams.get("company");

  if (!DEMO_KEY) {
    // No key configured — return mock data so the demo still works
    return NextResponse.json(company ? MOCK_COMPANY : MOCK_SEARCH);
  }

  try {
    const headers = { "X-API-Key": DEMO_KEY };
    const url = company
      ? `${API_BASE}/v1/company/${company}`
      : `${API_BASE}/v1/search?q=${encodeURIComponent(q ?? "")}&items_per_page=5`;

    const res = await fetch(url, { headers, next: { revalidate: 60 } });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ status: "error", detail: "Demo unavailable" }, { status: 502 });
  }
}
