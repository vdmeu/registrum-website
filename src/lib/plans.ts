/**
 * Canonical plan economics, fetched from the API instead of hardcoded here.
 * See docs/config-centralization-audit-2026-06-22.md in the ch-proj root -
 * this is what replaced the hand-maintained PLAN_QUOTAS objects that drifted
 * (Pro quota was stale at 2000 in two files while the real value was 4000).
 */

export type PlanDetail = {
  monthly_limit: number | null;
  daily_limit: number | null;
  burst_limit: number;
  price_gbp: number | null;
  features: string[];
};

export type PlansResponse = {
  status: string;
  plans: Record<string, PlanDetail>;
};

const FALLBACK_PLANS: Record<string, PlanDetail> = {
  free: { monthly_limit: 50, daily_limit: 5, burst_limit: 10, price_gbp: 0, features: [] },
  web: { monthly_limit: 500, daily_limit: 50, burst_limit: 30, price_gbp: 9, features: [] },
  pro: { monthly_limit: 4000, daily_limit: 400, burst_limit: 100, price_gbp: 49, features: [] },
  enterprise: { monthly_limit: null, daily_limit: null, burst_limit: 150, price_gbp: null, features: [] },
};

/** Cached for 5 minutes — plan economics change rarely, no need to fetch on every request. */
export async function getPlans(): Promise<Record<string, PlanDetail>> {
  try {
    const res = await fetch("https://api.registrum.co.uk/v1/plans", {
      next: { revalidate: 300 },
    });
    if (!res.ok) return FALLBACK_PLANS;
    const data: PlansResponse = await res.json();
    return data.plans;
  } catch {
    return FALLBACK_PLANS;
  }
}

/** Returns null for enterprise (API has no fixed price - it's "contact us"). */
export function priceLabel(plans: Record<string, PlanDetail>, plan: string): string | null {
  const price = plans[plan]?.price_gbp;
  return price != null ? `£${price}` : null;
}

export function callsLabel(plans: Record<string, PlanDetail>, plan: string): string {
  const detail = plans[plan];
  if (!detail) return "";
  if (detail.monthly_limit === null) return "Unlimited";
  if (plan === "free") return `${detail.daily_limit} lookups / day`;
  return `${detail.monthly_limit.toLocaleString()} calls / month`;
}

export function burstLabel(plans: Record<string, PlanDetail>, plan: string): string {
  return `${plans[plan]?.burst_limit ?? ""} / min`;
}
