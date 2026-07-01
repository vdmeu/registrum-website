import { describe, it, expect } from "vitest";
import { generateKey, nextMonthReset, KEY_PREFIX_LENGTH } from "./apiKeys";

describe("generateKey", () => {
  it("produces a reg_live_ key with a 14-char prefix", () => {
    const { fullKey, prefix, keyHash } = generateKey();
    expect(fullKey).toMatch(/^reg_live_[0-9a-f]{32}$/);
    expect(prefix).toHaveLength(KEY_PREFIX_LENGTH);
    expect(prefix).toMatch(/^reg_live_[0-9a-f]{5}$/);
    expect(fullKey.startsWith(prefix)).toBe(true);
    expect(keyHash).toBeTruthy();
    expect(keyHash).not.toEqual(fullKey);
  });

  it("produces a unique key each call", () => {
    expect(generateKey().fullKey).not.toEqual(generateKey().fullKey);
  });
});

describe("nextMonthReset", () => {
  it("returns local midnight on the first day of next month, in the future", () => {
    const d = new Date(nextMonthReset());
    const now = new Date();
    const expectedMonth = (now.getMonth() + 1) % 12;
    expect(d.getDate()).toBe(1); // first of the month (local time)
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
    expect(d.getMonth()).toBe(expectedMonth);
    expect(d.getTime()).toBeGreaterThan(now.getTime());
  });
});
