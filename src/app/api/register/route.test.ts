/**
 * Tests for POST /api/register — with and without the R1 internal-API flag.
 *
 * The USE_API_INTERNAL_API_KEYS=true tests will FAIL until:
 *   1. src/lib/internal-api.ts is created
 *   2. register/route.ts checks the flag
 * TDD: red first, implement, then green.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Env ──────────────────────────────────────────────────────────────────────
vi.stubEnv("USE_API_INTERNAL_API_KEYS", "false");
vi.stubEnv("REGISTRUM_API_URL", "https://api-staging.test");
vi.stubEnv("INTERNAL_API_SECRET", "test-secret-abc");

// ── Mocks ────────────────────────────────────────────────────────────────────

// Internal API mock (R1 path).
// vi.hoisted() ensures the fn is available when the factory is hoisted to the top.
const { mockCreateApiKey } = vi.hoisted(() => ({
  mockCreateApiKey: vi.fn(),
}));

vi.mock("@/lib/internal-api", () => ({
  createApiKey: mockCreateApiKey,
}));

// Supabase mock (direct path)
const mockInsert = vi.fn();
const mockSelectChain = {
  select: vi.fn(),
};
const mockSelectEq1 = vi.fn();
const mockSelectEq2 = vi.fn();
const mockSelectLimit = vi.fn();

vi.mock("@/lib/supabase", () => ({
  getSupabase: () => ({
    from: () => ({
      select: mockSelectChain.select,
      insert: mockInsert,
    }),
  }),
}));

const mockEmailSend = vi.fn();
vi.mock("@/lib/resend", () => ({
  getResend: () => ({
    emails: { send: mockEmailSend },
  }),
}));

vi.mock("@/lib/plans", () => ({
  getPlans: async () => ({
    free: { monthly_limit: 50, daily_limit: 10 },
    pro: { monthly_limit: 4000, daily_limit: 500 },
  }),
}));

vi.mock("@/lib/sentry", () => ({
  captureException: vi.fn(),
}));

vi.mock("@/lib/dashboard-auth", () => ({
  createMagicToken: () => "magic-token-123",
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

import { POST } from "./route";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeReq(body: Record<string, unknown>) {
  return {
    json: async () => body,
  } as Parameters<typeof POST>[0];
}

function makeApiKeyRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "api-row-uuid",
    key_prefix: "reg_live_ab123",
    key_hash: "$2b$12$hash",
    plan: "free",
    is_active: true,
    calls_this_month: 0,
    month_reset_at: "2026-08-01T00:00:00Z",
    label: "new@example.com",
    created_at: "2026-07-01T10:00:00Z",
    full_key: "reg_live_ab123cdef456789abcdef01234567",
    ...overrides,
  };
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  // Default: no existing key for this email
  mockSelectChain.select.mockReturnValue({
    eq: mockSelectEq1,
  });
  mockSelectEq1.mockReturnValue({ eq: mockSelectEq2 });
  mockSelectEq2.mockReturnValue({ limit: mockSelectLimit });
  mockSelectLimit.mockResolvedValue({ data: [] });
  // Default Supabase insert succeeds
  mockInsert.mockResolvedValue({ error: null });
  // Default email send succeeds
  mockEmailSend.mockResolvedValue({ data: {}, error: null });
  // Default internal API createApiKey
  mockCreateApiKey.mockResolvedValue(makeApiKeyRow());
});

// ── Flag OFF (direct Supabase path, unchanged behavior) ──────────────────────

describe("POST /api/register — flag OFF (direct Supabase write)", () => {
  beforeEach(() => {
    vi.stubEnv("USE_API_INTERNAL_API_KEYS", "false");
  });

  it("returns 200 for a valid new email", async () => {
    const res = await POST(makeReq({ email: "new@example.com" }));
    expect(res.status).toBe(200);
  });

  it("calls Supabase insert directly (not internal API)", async () => {
    await POST(makeReq({ email: "new@example.com" }));
    expect(mockInsert).toHaveBeenCalledOnce();
    expect(mockCreateApiKey).not.toHaveBeenCalled();
  });

  it("sends key delivery email with the generated full key", async () => {
    await POST(makeReq({ email: "new@example.com" }));
    expect(mockEmailSend).toHaveBeenCalledOnce();
    const emailArg = mockEmailSend.mock.calls[0][0];
    expect(emailArg.to).toBe("new@example.com");
    expect(emailArg.html).toContain("reg_live_");
  });

  it("returns 422 for invalid email", async () => {
    const res = await POST(makeReq({ email: "notanemail" }));
    expect(res.status).toBe(422);
  });
});

// ── Flag ON (R1 internal API path) ────────────────────────────────────────────

describe("POST /api/register — flag ON (R1 internal API write)", () => {
  beforeEach(() => {
    vi.stubEnv("USE_API_INTERNAL_API_KEYS", "true");
  });

  it("returns 200 for a valid new email", async () => {
    const res = await POST(makeReq({ email: "new@example.com" }));
    expect(res.status).toBe(200);
  });

  it("calls createApiKey from internal-api (not Supabase insert)", async () => {
    await POST(makeReq({ email: "new@example.com" }));
    expect(mockCreateApiKey).toHaveBeenCalledOnce();
    expect(mockCreateApiKey).toHaveBeenCalledWith({
      plan: "free",
      label: "new@example.com",
    });
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("sends key delivery email with the full_key from the API response", async () => {
    mockCreateApiKey.mockResolvedValue(
      makeApiKeyRow({ full_key: "reg_live_fromapiclient1234567890abcd" })
    );
    await POST(makeReq({ email: "new@example.com" }));
    expect(mockEmailSend).toHaveBeenCalledOnce();
    const emailArg = mockEmailSend.mock.calls[0][0];
    expect(emailArg.html).toContain("reg_live_fromapiclient1234567890abcd");
  });

  it("returns 500 when createApiKey throws", async () => {
    mockCreateApiKey.mockRejectedValue(new Error("API unavailable"));
    const res = await POST(makeReq({ email: "new@example.com" }));
    expect(res.status).toBe(500);
    expect(mockEmailSend).not.toHaveBeenCalled();
  });

  it("returns 422 for invalid email (flag does not affect validation)", async () => {
    const res = await POST(makeReq({ email: "" }));
    expect(res.status).toBe(422);
  });
});
