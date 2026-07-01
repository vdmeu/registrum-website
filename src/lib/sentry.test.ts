import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockInit = vi.fn();
const mockCapture = vi.fn();

vi.mock("@sentry/node", () => ({
  init: mockInit,
  captureException: mockCapture,
}));

import { captureException, __resetSentryForTests } from "./sentry";

describe("lib/sentry — env-gated", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __resetSentryForTests();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    __resetSentryForTests();
  });

  it("is a no-op when SENTRY_DSN is unset (does not init or capture)", async () => {
    vi.stubEnv("SENTRY_DSN", "");
    await expect(captureException(new Error("boom"))).resolves.toBeUndefined();
    expect(mockInit).not.toHaveBeenCalled();
    expect(mockCapture).not.toHaveBeenCalled();
  });

  it("initialises and reports when SENTRY_DSN is set", async () => {
    vi.stubEnv("SENTRY_DSN", "https://abc@o1.ingest.sentry.io/1");
    const err = new Error("boom");
    await captureException(err, { route: "test" });
    expect(mockInit).toHaveBeenCalledOnce();
    expect(mockInit.mock.calls[0][0]).toMatchObject({
      dsn: "https://abc@o1.ingest.sentry.io/1",
    });
    expect(mockCapture).toHaveBeenCalledWith(err, { extra: { route: "test" } });
  });

  it("initialises Sentry only once across multiple captures", async () => {
    vi.stubEnv("SENTRY_DSN", "https://abc@o1.ingest.sentry.io/1");
    await captureException(new Error("a"));
    await captureException(new Error("b"));
    expect(mockInit).toHaveBeenCalledOnce();
    expect(mockCapture).toHaveBeenCalledTimes(2);
  });
});
