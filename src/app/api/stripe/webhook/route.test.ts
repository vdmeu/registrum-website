import { describe, it, expect, vi, beforeEach } from "vitest";
import type Stripe from "stripe";

// Env vars must be set before the module is imported
vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test");

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

vi.mock("@/lib/supabase", () => ({
  getSupabase: () => ({
    from: (table: string) => {
      if (table === "api_keys") {
        return {
          insert: mockInsert,
          update: mockUpdate,
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
});
