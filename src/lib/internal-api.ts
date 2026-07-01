/**
 * Internal API client for the api_keys single-writer path (R1).
 *
 * When USE_API_INTERNAL_API_KEYS=true, the website routes all api_keys CREATE
 * and UPDATE writes through the CH enrichment API's /internal/api-keys
 * endpoints instead of writing Supabase directly.
 *
 * Auth: X-Internal-Secret header matched against INTERNAL_API_SECRET env var.
 * These are service-to-service calls; not exposed to end users.
 *
 * Environment variables:
 *   REGISTRUM_API_URL     - base URL of the CH enrichment API
 *                           (default: https://api.registrum.co.uk)
 *   INTERNAL_API_SECRET   - shared secret for the internal endpoints (required
 *                           when the R1 flag is on; fail-closed if unset)
 */

export interface ApiKeyRow {
  id: string;
  key_prefix: string;
  key_hash: string;
  plan: string;
  is_active: boolean;
  calls_this_month: number;
  month_reset_at: string;
  label: string | null;
  created_at: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan_expires_at: string | null;
  /** Returned ONCE on create only - not stored server-side as plaintext. */
  full_key: string;
}

export interface CreateKeyOptions {
  plan: string;
  label?: string | null;
  plan_expires_at?: string | null;
  is_test?: boolean;
  /** Stripe ids, so a paid key can later be located + downgraded by webhooks. */
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
}

export interface UpdatePlanOptions {
  plan?: string | null;
  plan_expires_at?: string | null;
  /** Stripe ids to set on the key (omit to leave unchanged). */
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
}

function getApiUrl(): string {
  return (process.env.REGISTRUM_API_URL ?? "https://api.registrum.co.uk").replace(/\/$/, "");
}

function getSecret(): string {
  const secret = process.env.INTERNAL_API_SECRET ?? "";
  if (!secret) {
    throw new Error("INTERNAL_API_SECRET is not set — cannot call internal API endpoints.");
  }
  return secret;
}

/**
 * Create a new api_keys row via the internal API.
 * Returns the row including full_key (plaintext, returned once only).
 */
export async function createApiKey(opts: CreateKeyOptions): Promise<ApiKeyRow> {
  const secret = getSecret();
  const url = `${getApiUrl()}/internal/api-keys`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Secret": secret,
    },
    body: JSON.stringify({
      plan: opts.plan,
      label: opts.label ?? null,
      plan_expires_at: opts.plan_expires_at ?? null,
      is_test: opts.is_test ?? false,
      stripe_customer_id: opts.stripe_customer_id ?? null,
      stripe_subscription_id: opts.stripe_subscription_id ?? null,
    }),
  });

  if (!res.ok) {
    const detail = await res.json().catch(() => ({})) as { detail?: string };
    throw new Error(
      `Internal API createApiKey failed: ${res.status} ${detail?.detail ?? res.statusText}`
    );
  }

  const data = await res.json() as { status: string; api_key: ApiKeyRow };
  return data.api_key;
}

/**
 * Update plan and/or plan_expires_at on an existing api_keys row.
 * Returns the updated row, or null if the key was not found (404).
 */
export async function updateApiKeyPlan(
  keyId: string,
  opts: UpdatePlanOptions
): Promise<ApiKeyRow | null> {
  const secret = getSecret();
  const url = `${getApiUrl()}/internal/api-keys/${keyId}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Secret": secret,
    },
    body: JSON.stringify(opts),
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    const detail = await res.json().catch(() => ({})) as { detail?: string };
    throw new Error(
      `Internal API updateApiKeyPlan failed: ${res.status} ${detail?.detail ?? res.statusText}`
    );
  }

  const data = await res.json() as { status: string; api_key: ApiKeyRow };
  return data.api_key;
}
