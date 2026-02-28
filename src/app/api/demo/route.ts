import { NextRequest, NextResponse } from "next/server";

export const API_BASE = "https://api.registrum.co.uk";
const DEMO_KEY = process.env.DEMO_API_KEY;

// Shown when no DEMO_API_KEY is set in Vercel env vars
export const MOCK_SEARCH = {
  status: "success",
  data: {
    items: [
      { company_number: "00445790", company_name: "TESCO PLC", company_status: "active", date_of_creation: "1947-11-27", registered_office_address: { address_line_1: "Tesco House, Shire Park", locality: "Welwyn Garden City", postal_code: "AL7 1GA" } },
      { company_number: "00102498", company_name: "MARKS AND SPENCER PLC", company_status: "active", date_of_creation: "1903-09-08", registered_office_address: { address_line_1: "Waterside House, 35 North Wharf Road", locality: "London", postal_code: "W2 1NW" } },
      { company_number: "00004366", company_name: "J SAINSBURY PLC", company_status: "active", date_of_creation: "1922-11-13", registered_office_address: { address_line_1: "33 Holborn", locality: "London", postal_code: "EC1N 2HT" } },
    ],
  },
  cached: false,
  _mock: true,
};

export const MOCK_COMPANY = {
  status: "success",
  data: {
    company_number: "00445790",
    company_name: "TESCO PLC",
    company_status: "active",
    company_type: "plc",
    date_of_creation: "1947-11-27",
    company_age_years: 78,
    registered_office_address: { address_line_1: "Tesco House, Shire Park", locality: "Welwyn Garden City", postal_code: "AL7 1GA" },
    accounts: { overdue: false },
    confirmation_statement: { overdue: false },
    sic_codes: ["47110"],
  },
  cached: false,
  _mock: true,
};

export const MOCK_DIRECTORS = {
  status: "success",
  data: {
    current_directors: [
      {
        name: "Ken Murphy",
        role: "Chief Executive",
        appointed_on: "2020-09-01",
        other_appointments: [
          { company_number: "02065605", company_name: "TESCO STORES LTD", role: "Director" },
        ],
      },
      {
        name: "Imran Nawaz",
        role: "Chief Financial Officer",
        appointed_on: "2021-04-01",
        other_appointments: [
          { company_number: "02065605", company_name: "TESCO STORES LTD", role: "Director" },
          { company_number: "00524764", company_name: "TESCO PERSONAL FINANCE PLC", role: "Director" },
        ],
      },
      {
        name: "Alison Platt",
        role: "Non-Executive Director",
        appointed_on: "2019-01-01",
        other_appointments: [
          { company_number: "00524764", company_name: "TESCO PERSONAL FINANCE PLC", role: "Non-Executive" },
          { company_number: "10458239", company_name: "KINGFISHER PLC", role: "Non-Executive" },
        ],
      },
      {
        name: "Vindi Banga",
        role: "Non-Executive Chairman",
        appointed_on: "2023-03-01",
        other_appointments: [
          { company_number: "10458239", company_name: "KINGFISHER PLC", role: "Chairman" },
        ],
      },
      {
        name: "Stewart Tew",
        role: "Non-Executive Director",
        appointed_on: "2021-10-01",
        other_appointments: [],
      },
    ],
    past_directors: [],
  },
  cached: false,
  _mock: true,
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const company = searchParams.get("company");
  const directors = searchParams.get("directors");

  if (!DEMO_KEY) {
    // No key configured — return mock data so the demo still works
    return NextResponse.json(
      directors ? MOCK_DIRECTORS : company ? MOCK_COMPANY : MOCK_SEARCH
    );
  }

  try {
    const headers = { "X-API-Key": DEMO_KEY };

    if (directors) {
      const url = `${API_BASE}/v1/company/${directors}/directors`;
      const res = await fetch(url, { headers, next: { revalidate: 3600 } });
      return NextResponse.json(await res.json(), { status: res.status });
    }

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
