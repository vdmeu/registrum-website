import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockRpc = vi.fn();
vi.mock("@/lib/supabase", () => ({
  getSupabase: () => ({
    rpc: mockRpc,
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: null }) }),
        }),
      }),
    }),
  }),
}));

vi.mock("@/lib/dashboard-auth", () => ({
  SESSION_COOKIE: "rg_session",
  verifySessionCookie: () => null,
}));

vi.mock("@/lib/plans", () => ({
  getPlans: async () => ({
    free: { monthly_limit: 50, daily_limit: 5, burst_limit: 10, price_gbp: 0, features: [] },
  }),
}));

vi.mock("next/server", () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => ({
      _data: data,
      status: init?.status ?? 200,
      json: async () => data,
    }),
  },
}));

import { GET } from "./route";

const DEMO_KEY = "reg_live_demosecret0000000000000000000000";

function makeReq(query: string, ip = "1.2.3.4") {
  return {
    url: `https://registrum.co.uk/api/lookup?${query}`,
    cookies: { get: () => undefined },
    headers: {
      get: (h: string) => (h === "x-forwarded-for" ? ip : null),
    },
  } as unknown as Parameters<typeof GET>[0];
}

describe("GET /api/lookup — demo-key protection (D3)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("REGISTRUM_DEMO_API_KEY", DEMO_KEY);
    // Default: under the cap
    mockRpc.mockResolvedValue({ data: 1, error: null });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ status: "success", data: { items: [] } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
  });

  it("returns 500 when REGISTRUM_DEMO_API_KEY is not configured", async () => {
    vi.stubEnv("REGISTRUM_DEMO_API_KEY", "");
    const res = await GET(makeReq("q=tesco"));
    expect(res.status).toBe(500);
  });

  it("search under the per-IP cap spends the demo key server-side", async () => {
    const res = await GET(makeReq("q=tesco"));
    expect(res.status).toBe(200);
    const fetchSpy = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
    expect(fetchSpy).toHaveBeenCalledOnce();
    const [, init] = fetchSpy.mock.calls[0];
    expect((init as RequestInit).headers).toMatchObject({ "X-API-Key": DEMO_KEY });
  });

  it("search OVER the per-IP cap returns 429 and does NOT spend the demo key", async () => {
    mockRpc.mockResolvedValue({ data: 9999, error: null });
    const res = await GET(makeReq("q=tesco"));
    expect(res.status).toBe(429);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("counts search usage per IP before calling the upstream API", async () => {
    await GET(makeReq("q=tesco"));
    expect(mockRpc).toHaveBeenCalled();
    const [fn] = mockRpc.mock.calls[0];
    expect(fn).toBe("increment_web_lookup");
  });

  it("never leaks the demo key into the response body", async () => {
    const res = await GET(makeReq("q=tesco"));
    const body = await res.json();
    expect(JSON.stringify(body)).not.toContain(DEMO_KEY);
  });
});
