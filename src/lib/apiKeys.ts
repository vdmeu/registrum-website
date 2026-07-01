/**
 * Shared API-key provisioning helpers.
 *
 * `generateKey` and `nextMonthReset` were duplicated verbatim across
 * /api/register, /api/company-access, /api/stripe/webhook and
 * /api/dashboard/rotate-key. Centralising them here (R6) keeps the key
 * format and the monthly-reset rule in a single place so they can never drift.
 */
import crypto from "crypto";
import bcrypt from "bcryptjs";

/** "reg_live_" (9) + 5 hex chars. */
export const KEY_PREFIX_LENGTH = 14;

export function generateKey(): { fullKey: string; prefix: string; keyHash: string } {
  const randomPart = crypto.randomBytes(16).toString("hex"); // 32 hex chars
  const fullKey = `reg_live_${randomPart}`;
  const prefix = fullKey.slice(0, KEY_PREFIX_LENGTH);
  const keyHash = bcrypt.hashSync(fullKey, 10);
  return { fullKey, prefix, keyHash };
}

/** ISO timestamp for 00:00 on the first day of next month. */
export function nextMonthReset(): string {
  const now = new Date();
  const reset =
    now.getMonth() === 11
      ? new Date(now.getFullYear() + 1, 0, 1)
      : new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return reset.toISOString();
}
