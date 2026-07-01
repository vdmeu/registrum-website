/**
 * Tests for the internal API client (R1 single-writer path).
 *
 * These tests will FAIL until src/lib/internal-api.ts is created.
 * TDD: red first, then implement, then green.
 */
import { describe, it, expect, vi, afterEach } from "vitest";

// Env must be stubbed before the module is imported
vi.stubEnv("REGISTRUM_API_URL", "https://api-staging.test");
vi.stubEnv("INTERNAL_API_SECRET", "test-secret-abc");

// ── THIS IMPORT FAILS until internal-api.ts is created ──────────────────────
import { createApiKey, updateApiKeyPlan } from "./internal-api";

// ── Global fetch mock ────────────────────────────────────────────────────────

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

afterEach(() => {
  vi.clearAllMocks();
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeApiKeyRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "uuid-1234",
    key_prefix: "reg_live_ab123",
    key_hash: "$2b$12$hash",
    plan: "free",
    is_active: true,
    calls_this_month: 0,
    month_reset_at: "2026-08-01T00:00:00+00:00",
    label: "test@example.com",
    created_at: "2026-07-01T10:00:00+00:00",
    stripe_customer_id: null,
    stripe_subscription_id: null,
    plan_expires_at: null,
    full_key: "reg_live_ab123cdef456789abcdef01234567",
    ...overrides,
  };
}

function okResponse(row: ReturnType<typeof makeApiKeyRow>) {
  return {
    ok: true,
    status: 201,
    json: async () => ({ status: "success", api_key: row }),
  };
}

// ── createApiKey ──────────────────────────────────────────────────────────────

describe("createApiKey", () => {
  it("calls POST /internal/api-keys on REGISTRUM_API_URL", async () => {
    const row = makeApiKeyRow();
    mockFetch.mockResolvedValueOnce(okResponse(row));

    await createApiKey({ plan: "free", label: "test@example.com" });

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, opts] = mockFetch.mock.calls[0] as [string, RequestInit & { headers: Record<string, string> }];
    expect(url).toBe("https://api-staging.test/internal/api-keys");
    expect(opts.method).toBe("POST");
    expect(opts.headers["X-Internal-Secret"]).toBe("test-secret-abc");
    expect(opts.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(opts.body as string)).toMatchObject({ plan: "free", label: "test@example.com" });
  });

  it("returns the api_key row including full_key", async () => {
    const row = makeApiKeyRow({ full_key: "reg_live_fullkeyvalue12345678901234" });
    mockFetch.mockResolvedValueOnce(okResponse(row));

    const result = await createApiKey({ plan: "free", label: "test@example.com" });

    expect(result.full_key).toBe("reg_live_fullkeyvalue12345678901234");
    expect(result.key_prefix).toBe("reg_live_ab123");
    expect(result.plan).toBe("free");
  });

  it("passes optional fields (label, plan_expires_at, is_test)", async () => {
    const row = makeApiKeyRow({ plan: "pro", label: "pro@example.com" });
    mockFetch.mockResolvedValueOnce(okResponse(row));

    await createApiKey({
      plan: "pro",
      label: "pro@example.com",
      plan_expires_at: "2026-12-31T00:00:00Z",
      is_test: true,
    });

    const [, opts] = mockFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(opts.body as string);
    expect(body.plan).toBe("pro");
    expect(body.label).toBe("pro@example.com");
    expect(body.plan_expires_at).toBe("2026-12-31T00:00:00Z");
    expect(body.is_test).toBe(true);
  });

  it("throws when the API responds with a non-OK status", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ detail: "Invalid internal secret." }),
    });

    await expect(createApiKey({ plan: "free", label: "bad@example.com" })).rejects.toThrow(
      /403/
    );
  });

  it("throws when INTERNAL_API_SECRET is unset", async () => {
    vi.stubEnv("INTERNAL_API_SECRET", "");
    await expect(createApiKey({ plan: "free", label: "test@example.com" })).rejects.toThrow(
      /INTERNAL_API_SECRET/
    );
    vi.stubEnv("INTERNAL_API_SECRET", "test-secret-abc");
  });
});

// ── updateApiKeyPlan ─────────────────────────────────────────────────────────

describe("updateApiKeyPlan", () => {
  it("calls PATCH /internal/api-keys/{keyId}", async () => {
    const row = makeApiKeyRow({ plan: "pro" });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ status: "success", api_key: row }),
    });

    await updateApiKeyPlan("uuid-1234", { plan: "pro" });

    const [url, opts] = mockFetch.mock.calls[0] as [string, RequestInit & { headers: Record<string, string> }];
    expect(url).toBe("https://api-staging.test/internal/api-keys/uuid-1234");
    expect(opts.method).toBe("PATCH");
    expect(opts.headers["X-Internal-Secret"]).toBe("test-secret-abc");
    expect(JSON.parse(opts.body as string)).toMatchObject({ plan: "pro" });
  });

  it("returns the updated row", async () => {
    const row = makeApiKeyRow({ plan: "pro" });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ status: "success", api_key: row }),
    });

    const result = await updateApiKeyPlan("uuid-1234", { plan: "pro" });

    expect(result?.plan).toBe("pro");
  });

  it("returns null when the API responds 404", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ detail: "API key 'uuid-x' not found." }),
    });

    const result = await updateApiKeyPlan("uuid-x", { plan: "free" });

    expect(result).toBeNull();
  });

  it("throws on non-404 API errors", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ detail: "Invalid internal secret." }),
    });

    await expect(updateApiKeyPlan("uuid-1234", { plan: "free" })).rejects.toThrow(/403/);
  });
});
