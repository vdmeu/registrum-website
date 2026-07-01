import { describe, it, expect, vi, beforeEach } from "vitest";
import type Stripe from "stripe";

// Env vars must be set before the module is imported
vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test");
vi.stubEnv("USE_API_INTERNAL_API_KEYS", "false");
vi.stubEnv("REGISTRUM_API_URL", "https://api-staging.test");
vi.stubEnv("INTERNAL_API_SECRET", "test-secret-abc");

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockConstructEvent = vi.fn<() => Stripe.Event>();

vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    webhooks: { constructEvent: mockConstructEvent },
  }),
}));

const mockInsert = vi.fn();
const mockEq = vi.fn();
const mockUpdate = vi.fn();
const mockDeleteEq = vi.fn();
const mockSessionDelete = vi.fn();
const mockSelect = vi.fn();
const mockSelectEq1 = vi.fn();
const mockSelectEq2 = vi.fn();
const mockLimit = vi.fn();
const mockMaybeSingle = vi.fn();

vi.mock("@/lib/supabase", () => ({
  getSupabase: () => ({
    from: (table: string) => {
      if (table === "api_keys") {
        return {
          insert: mockInsert,
          update: mockUpdate,
          select: mockSelect,
        };
      }
      if (table === "web_sessions") {
        return { delete: mockSessionDelete };
      }
      return {};
    },
  }),
}));

const mockEmailSend = vi.fn();
vi.mock("@/lib/resend", () => ({
  getResend: () => ({
    emails: { send: mockEmailSend },
  }),
}));

// Plan economics are the single source of truth from GET /v1/plans (R3) — mock
// so the test is hermetic and asserts prices come from here, not hardcoded.
vi.mock("@/lib/plans", () => ({
  getPlans: async () => ({
    free: { monthly_limit: 50, daily_limit: 5, burst_limit: 10, price_gbp: 0, features: [] },
    web: { monthly_limit: 500, daily_limit: 50, burst_limit: 30, price_gbp: 9, features: [] },
    pro: { monthly_limit: 4000, daily_limit: 400, burst_limit: 100, price_gbp: 49, features: [] },
  }),
}));

const mockCaptureException = vi.fn();
vi.mock("@/lib/sentry", () => ({
  captureException: (...args: unknown[]) => mockCaptureException(...args),
}));

// R1 internal API mock (for flag-ON tests)
const mockInternalCreateApiKey = vi.fn();
const mockInternalUpdateApiKeyPlan = vi.fn();
vi.mock("@/lib/internal-api", () => ({
  createApiKey: (...args: unknown[]) => mockInternalCreateApiKey(...args),
  updateApiKeyPlan: (...args: unknown[]) => mockInternalUpdateApiKeyPlan(...args),
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

// ── Import after mocks ────────────────────────────────────────────────────────

import { POST } from "./route";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeReq(body: string, sig = "valid_sig") {
  return {
    text: async () => body,
    headers: { get: (h: string) => (h === "stripe-signature" ? sig : null) },
  } as Parameters<typeof POST>[0];
}

function checkoutEvent(plan: "pro" | "web" = "pro", email = "buyer@example.com") {
  return {
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_test_123",
        customer_details: { email },
        customer: "cus_test_abc",
        subscription: "sub_test_xyz",
        metadata: { plan },
      } as Stripe.Checkout.Session,
    },
  } as Stripe.Event;
}

function subscriptionDeletedEvent(subscriptionId = "sub_test_xyz", customerId = "cus_test_abc") {
  return {
    type: "customer.subscription.deleted",
    data: {
      object: {
        id: subscriptionId,
        customer: customerId,
      } as Stripe.Subscription,
    },
  } as Stripe.Event;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/stripe/webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: all DB ops succeed
    mockInsert.mockResolvedValue({ error: null });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockEq.mockResolvedValue({ error: null });
    mockSessionDelete.mockReturnValue({ eq: mockDeleteEq });
    mockDeleteEq.mockResolvedValue({ error: null });
    mockEmailSend.mockResolvedValue({ data: {}, error: null });
    // Default: no existing key for this email (takes the insert path)
    mockSelect.mockReturnValue({ eq: mockSelectEq1 });
    mockSelectEq1.mockReturnValue({ eq: mockSelectEq2 });
    mockSelectEq2.mockReturnValue({ limit: mockLimit });
    mockLimit.mockReturnValue({ maybeSingle: mockMaybeSingle });
    mockMaybeSingle.mockResolvedValue({ data: null });
  });

  // ── Signature verification ─────────────────────────────────────────────────

  it("returns 400 when Stripe signature is invalid", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("No signatures found matching the expected signature");
    });
    const res = await POST(makeReq("{}", "bad_sig"));
    expect(res.status).toBe(400);
  });

  it("returns 500 when STRIPE_WEBHOOK_SECRET is missing", async () => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "");
    const res = await POST(makeReq("{}"));
    expect(res.status).toBe(500);
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test");
  });

  // ── checkout.session.completed — Pro plan ──────────────────────────────────

  it("checkout.session.completed: inserts a Pro key into api_keys", async () => {
    mockConstructEvent.mockReturnValue(checkoutEvent("pro"));
    const res = await POST(makeReq("{}"));
    expect(res.status).toBe(200);
    expect(mockInsert).toHaveBeenCalledOnce();
    const row = mockInsert.mock.calls[0][0];
    expect(row.plan).toBe("pro");
    expect(row.label).toBe("buyer@example.com");
    expect(row.stripe_customer_id).toBe("cus_test_abc");
    expect(row.stripe_subscription_id).toBe("sub_test_xyz");
    expect(row.is_active).toBe(true);
    expect(row.key_prefix).toMatch(/^reg_live_[0-9a-f]{5}$/);
    expect(row.key_hash).toBeTruthy();
  });

  it("checkout.session.completed Pro: sends Pro key delivery email", async () => {
    mockConstructEvent.mockReturnValue(checkoutEvent("pro"));
    await POST(makeReq("{}"));
    expect(mockEmailSend).toHaveBeenCalledOnce();
    const emailArg = mockEmailSend.mock.calls[0][0];
    expect(emailArg.to).toBe("buyer@example.com");
    expect(emailArg.subject).toContain("Pro");
    expect(emailArg.html).toContain("reg_live_");
  });

  // ── checkout.session.completed — Web plan ─────────────────────────────────

  it("checkout.session.completed: inserts a Web key into api_keys", async () => {
    mockConstructEvent.mockReturnValue(checkoutEvent("web"));
    const res = await POST(makeReq("{}"));
    expect(res.status).toBe(200);
    const row = mockInsert.mock.calls[0][0];
    expect(row.plan).toBe("web");
  });

  it("checkout.session.completed Web: sends Web subscription email (no key in body)", async () => {
    mockConstructEvent.mockReturnValue(checkoutEvent("web", "web@example.com"));
    await POST(makeReq("{}"));
    const emailArg = mockEmailSend.mock.calls[0][0];
    expect(emailArg.to).toBe("web@example.com");
    expect(emailArg.subject).toContain("Web");
    expect(emailArg.html).not.toContain("reg_live_");
  });

  // ── checkout.session.completed — existing key for this email ──────────────

  it("checkout.session.completed: upgrades the existing active key in place instead of inserting a duplicate", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { id: "existing-key-id", key_prefix: "reg_live_abcde" },
    });
    mockConstructEvent.mockReturnValue(checkoutEvent("pro"));
    const res = await POST(makeReq("{}"));
    expect(res.status).toBe(200);
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockUpdate).toHaveBeenCalledWith({
      plan: "pro",
      stripe_customer_id: "cus_test_abc",
      stripe_subscription_id: "sub_test_xyz",
    });
    expect(mockEq).toHaveBeenCalledWith("id", "existing-key-id");
  });

  it("checkout.session.completed: existing key upgrade sends a plan-upgraded email, not a new key", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { id: "existing-key-id", key_prefix: "reg_live_abcde" },
    });
    mockConstructEvent.mockReturnValue(checkoutEvent("pro"));
    await POST(makeReq("{}"));
    expect(mockEmailSend).toHaveBeenCalledOnce();
    const emailArg = mockEmailSend.mock.calls[0][0];
    expect(emailArg.subject).toContain("Pro");
    expect(emailArg.html).toContain("reg_live_abcde");
    expect(emailArg.html).not.toMatch(/reg_live_[0-9a-f]{27}/);
  });

  it("checkout.session.completed: returns 200 even when the existing-key update fails", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { id: "existing-key-id", key_prefix: "reg_live_abcde" },
    });
    mockEq.mockResolvedValue({ error: { message: "DB error" } });
    mockConstructEvent.mockReturnValue(checkoutEvent("pro"));
    const res = await POST(makeReq("{}"));
    expect(res.status).toBe(200);
    expect(mockEmailSend).not.toHaveBeenCalled();
  });

  it("checkout.session.completed: matches an existing key even when Stripe's email casing differs", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { id: "existing-key-id", key_prefix: "reg_live_abcde" },
    });
    mockConstructEvent.mockReturnValue(checkoutEvent("pro", "Buyer@Example.com"));
    await POST(makeReq("{}"));
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockSelectEq1).toHaveBeenCalledWith("label", "buyer@example.com");
    expect(mockUpdate).toHaveBeenCalledWith({
      plan: "pro",
      stripe_customer_id: "cus_test_abc",
      stripe_subscription_id: "sub_test_xyz",
    });
  });

  // ── checkout.session.completed — edge cases ────────────────────────────────

  it("checkout.session.completed: handles missing email without crashing", async () => {
    const event = {
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_no_email",
          customer_details: { email: null },
          customer: null,
          subscription: null,
          metadata: { plan: "pro" },
        } as unknown as Stripe.Checkout.Session,
      },
    } as Stripe.Event;
    mockConstructEvent.mockReturnValue(event);
    const res = await POST(makeReq("{}"));
    expect(res.status).toBe(200);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("checkout.session.completed: returns 200 even when Supabase insert fails", async () => {
    mockConstructEvent.mockReturnValue(checkoutEvent("pro"));
    mockInsert.mockResolvedValue({ error: { message: "DB error" } });
    const res = await POST(makeReq("{}"));
    expect(res.status).toBe(200);
  });

  // ── customer.subscription.deleted ─────────────────────────────────────────

  it("customer.subscription.deleted: downgrades plan to free in api_keys", async () => {
    mockConstructEvent.mockReturnValue(subscriptionDeletedEvent());
    const res = await POST(makeReq("{}"));
    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith({ plan: "free" });
    expect(mockEq).toHaveBeenCalledWith("stripe_subscription_id", "sub_test_xyz");
  });

  it("customer.subscription.deleted: deletes web_sessions for the customer", async () => {
    mockConstructEvent.mockReturnValue(subscriptionDeletedEvent("sub_xyz", "cus_abc"));
    await POST(makeReq("{}"));
    expect(mockSessionDelete).toHaveBeenCalledOnce();
    expect(mockDeleteEq).toHaveBeenCalledWith("stripe_customer_id", "cus_abc");
  });

  it("customer.subscription.deleted: returns 200 when Supabase update fails", async () => {
    mockConstructEvent.mockReturnValue(subscriptionDeletedEvent());
    mockEq.mockResolvedValue({ error: { message: "DB error" } });
    const res = await POST(makeReq("{}"));
    expect(res.status).toBe(200);
  });

  // ── Unknown event type ────────────────────────────────────────────────────

  it("returns 200 and does nothing for unhandled event types", async () => {
    mockConstructEvent.mockReturnValue({
      type: "payment_intent.created",
      data: { object: {} },
    } as unknown as Stripe.Event);
    const res = await POST(makeReq("{}"));
    expect(res.status).toBe(200);
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  // ── R3: Telegram alert price comes from GET /v1/plans, not a hardcoded string ─

  it("Telegram subscriber alert uses the plan price from GET /v1/plans", async () => {
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "bot123");
    vi.stubEnv("TELEGRAM_CHAT_ID", "chat456");
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("{}", { status: 200 }),
    );
    mockConstructEvent.mockReturnValue(checkoutEvent("pro"));
    await POST(makeReq("{}"));
    const telegramCall = fetchSpy.mock.calls.find(([url]) =>
      String(url).includes("api.telegram.org"),
    );
    expect(telegramCall).toBeTruthy();
    const sentBody = JSON.parse((telegramCall![1] as RequestInit).body as string);
    expect(sentBody.text).toContain("£49/month");
    fetchSpy.mockRestore();
    vi.unstubAllEnvs();
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test");
  });

  // ── R4: unexpected handler errors are reported to Sentry ──────────────────────

  it("reports unexpected handler errors to Sentry and returns 500", async () => {
    mockMaybeSingle.mockRejectedValue(new Error("boom"));
    mockConstructEvent.mockReturnValue(checkoutEvent("pro"));
    const res = await POST(makeReq("{}"));
    expect(res.status).toBe(500);
    expect(mockCaptureException).toHaveBeenCalledOnce();
    expect(mockCaptureException.mock.calls[0][1]).toMatchObject({
      route: "stripe/webhook",
    });
  });
});

// ── R1: USE_API_INTERNAL_API_KEYS=true routes writes through internal API ──────
//
// These tests will FAIL until stripe/webhook/route.ts checks the flag and
// calls createApiKey / updateApiKeyPlan from @/lib/internal-api.

describe("POST /api/stripe/webhook — R1 flag ON", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("USE_API_INTERNAL_API_KEYS", "true");

    // Default Stripe sig succeeds
    mockConstructEvent.mockReturnValue(checkoutEvent("pro"));
    // Default: no existing key
    mockSelect.mockReturnValue({ eq: mockSelectEq1 });
    mockSelectEq1.mockReturnValue({ eq: mockSelectEq2 });
    mockSelectEq2.mockReturnValue({ limit: mockLimit });
    mockLimit.mockReturnValue({ maybeSingle: mockMaybeSingle });
    mockMaybeSingle.mockResolvedValue({ data: null });
    // Session delete succeeds (web_sessions — still direct Supabase, not api_keys)
    mockSessionDelete.mockReturnValue({ eq: mockDeleteEq });
    mockDeleteEq.mockResolvedValue({ error: null });
    // Email send succeeds
    mockEmailSend.mockResolvedValue({ data: {}, error: null });
    // Internal API succeeds
    mockInternalCreateApiKey.mockResolvedValue({
      id: "api-row-uuid",
      key_prefix: "reg_live_ab123",
      plan: "pro",
      is_active: true,
      calls_this_month: 0,
      label: "buyer@example.com",
      full_key: "reg_live_ab123cdef456789abcdef01234567",
    });
    mockInternalUpdateApiKeyPlan.mockResolvedValue({
      id: "existing-key-id",
      key_prefix: "reg_live_abcde",
      plan: "pro",
      is_active: true,
    });
  });

  it("checkout.session.completed (new key): calls createApiKey, NOT Supabase insert", async () => {
    const res = await POST(makeReq("{}"));
    expect(res.status).toBe(200);
    expect(mockInternalCreateApiKey).toHaveBeenCalledOnce();
    expect(mockInternalCreateApiKey).toHaveBeenCalledWith(
      expect.objectContaining({ plan: "pro", label: "buyer@example.com" })
    );
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("checkout.session.completed (new key): forwards stripe IDs through createApiKey", async () => {
    const res = await POST(makeReq("{}"));
    expect(res.status).toBe(200);
    expect(mockInternalCreateApiKey).toHaveBeenCalledWith(
      expect.objectContaining({
        stripe_customer_id: "cus_test_abc",
        stripe_subscription_id: "sub_test_xyz",
      })
    );
  });

  it("checkout.session.completed (existing key upgrade): forwards stripe IDs through updateApiKeyPlan", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { id: "existing-key-id", key_prefix: "reg_live_abcde" },
    });
    const res = await POST(makeReq("{}"));
    expect(res.status).toBe(200);
    expect(mockInternalUpdateApiKeyPlan).toHaveBeenCalledWith(
      "existing-key-id",
      expect.objectContaining({
        plan: "pro",
        stripe_customer_id: "cus_test_abc",
        stripe_subscription_id: "sub_test_xyz",
      })
    );
  });

  it("checkout.session.completed (new key): still sends key delivery email with full_key from API", async () => {
    mockInternalCreateApiKey.mockResolvedValue({
      full_key: "reg_live_fromapi123456789abcdef01234",
      key_prefix: "reg_live_ab123",
      plan: "pro",
    });
    await POST(makeReq("{}"));
    expect(mockEmailSend).toHaveBeenCalledOnce();
    const emailArg = mockEmailSend.mock.calls[0][0];
    expect(emailArg.html).toContain("reg_live_fromapi123456789abcdef01234");
  });

  it("checkout.session.completed (existing key upgrade): calls updateApiKeyPlan, NOT Supabase update", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { id: "existing-key-id", key_prefix: "reg_live_abcde" },
    });
    const res = await POST(makeReq("{}"));
    expect(res.status).toBe(200);
    expect(mockInternalUpdateApiKeyPlan).toHaveBeenCalledOnce();
    expect(mockInternalUpdateApiKeyPlan).toHaveBeenCalledWith(
      "existing-key-id",
      expect.objectContaining({ plan: "pro" })
    );
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("customer.subscription.deleted: calls updateApiKeyPlan for plan downgrade, NOT direct Supabase update", async () => {
    mockConstructEvent.mockReturnValue(subscriptionDeletedEvent("sub_test_xyz", "cus_test_abc"));
    // The handler must look up the key id by stripe_subscription_id, then call updateApiKeyPlan
    mockSelect.mockReturnValue({ eq: mockSelectEq1 });
    mockSelectEq1.mockReturnValue({ eq: mockSelectEq2 });
    mockSelectEq2.mockReturnValue({ limit: mockLimit });
    mockLimit.mockReturnValue({ maybeSingle: mockMaybeSingle });
    mockMaybeSingle.mockResolvedValue({
      data: { id: "downgrade-key-id", key_prefix: "reg_live_x" },
    });

    const res = await POST(makeReq("{}"));
    expect(res.status).toBe(200);
    expect(mockInternalUpdateApiKeyPlan).toHaveBeenCalledOnce();
    expect(mockInternalUpdateApiKeyPlan).toHaveBeenCalledWith(
      "downgrade-key-id",
      expect.objectContaining({ plan: "free" })
    );
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
