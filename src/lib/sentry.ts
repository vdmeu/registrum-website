/**
 * Env-gated Sentry error reporting (R4).
 *
 * Mirrors the API's pattern (src/main.py): completely dormant unless
 * `SENTRY_DSN` is set. When the DSN is absent every export here is a no-op,
 * so this can ship to prod inert and only activates once a DSN is added to
 * the environment later. The SDK is imported lazily so it is never loaded
 * (or its init cost paid) when Sentry is disabled.
 */
import type * as SentryNode from "@sentry/node";

let _sentry: typeof SentryNode | null = null;
let _initTried = false;

/**
 * Lazily initialise Sentry the first time it is needed.
 * Returns null (no-op) when SENTRY_DSN is unset or init fails.
 */
async function getSentry(): Promise<typeof SentryNode | null> {
  if (_initTried) return _sentry;
  _initTried = true;

  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return null;

  try {
    const Sentry = await import("@sentry/node");
    const env = process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development";
    Sentry.init({
      dsn,
      environment: env,
      tracesSampleRate: env === "production" ? 0.1 : 1.0,
    });
    _sentry = Sentry;
  } catch {
    // Never let observability wiring break a request path.
    _sentry = null;
  }
  return _sentry;
}

/**
 * Report an error to Sentry if (and only if) it is configured.
 * Safe to await in any handler — it resolves silently when Sentry is off.
 */
export async function captureException(
  error: unknown,
  context?: Record<string, unknown>,
): Promise<void> {
  const Sentry = await getSentry();
  if (!Sentry) return;
  try {
    Sentry.captureException(error, context ? { extra: context } : undefined);
  } catch {
    // swallow — reporting must never throw
  }
}

/** Test-only hook to reset the memoised init state between cases. */
export function __resetSentryForTests(): void {
  _sentry = null;
  _initTried = false;
}
