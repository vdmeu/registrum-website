# Registrum Website — Build Plan

> Project: `registrum-website`
> Start: Feb 2026
> Primary builder: Claude (via chat sessions with Eugene)
> Deployment: Vercel + Cloudflare DNS
> Domain: registrum.co.uk

---

## WHAT WE'RE BUILDING

The marketing site and developer portal for Registrum — the dependable Companies House API.

Goals:
1. **Convert visitors** — explain the product, show pricing, drive signups
2. **Self-serve onboarding** — frictionless API key provisioning (email → key in inbox, no credit card)
3. **Live demo** — let visitors search a company and see real enriched data before they sign up
4. **Trust signals** — public status page, clean docs link, professional email
5. **Revenue** — Stripe integration for Starter/Pro/Enterprise upgrades

### What it is NOT
- Not a full SaaS dashboard (Phase 5, later)
- Not a blog or content site
- Not server-rendered data — the API does the data work, this site just presents it

---

## ARCHITECTURE

```
registrum.co.uk  (Vercel)
       │
       ├── / ────────────── Landing page (static-ish, ISR)
       │     ├── Hero
       │     ├── Features
       │     ├── Live Demo ──────────────▶ api.registrum.co.uk (client-side fetch)
       │     ├── Pricing
       │     └── Key Signup form
       │
       ├── /api/register ── Route Handler (server)
       │     └── email → Supabase insert → Resend email → return 200
       │
       ├── /api/stripe/
       │   └── webhook ──── Route Handler (server)
       │         └── Stripe event → Supabase tier upgrade
       │
       └── /dashboard ───── (Phase 5) Usage stats + key management
```

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Key provisioning**: Supabase (shared DB with API project)
- **Transactional email**: Resend
- **Payments**: Stripe
- **Hosting**: Vercel (free tier)
- **DNS**: Cloudflare (registrum.co.uk)

---

## PHASE BACKLOG

> Each phase is independently deployable. Ship phase, verify, then start next.

### Phase 1 — Foundation ✅ IN PROGRESS
| # | Task | Status |
|---|------|--------|
| 1.1 | Register registrum.co.uk on Cloudflare | DONE |
| 1.2 | Add api.registrum.co.uk CNAME → Railway | DONE |
| 1.3 | Scaffold Next.js 15 + Tailwind + TypeScript | DONE |
| 1.4 | Create GitHub repo + CLAUDE.md + build plan | IN PROGRESS |
| 1.5 | Deploy to Vercel + connect registrum.co.uk domain | PENDING |
| 1.6 | Set up Google Workspace email | PENDING |
| 1.7 | Verify SSL live on api.registrum.co.uk | PENDING |

### Phase 2 — Landing Page
| # | Task | Status |
|---|------|--------|
| 2.1 | Hero section — headline, sub-headline, dual CTA (Get key / View docs) | PENDING |
| 2.2 | Features section — caching, financials, director network, search | PENDING |
| 2.3 | Pricing table — Free / Starter £19 / Pro £49 / Enterprise £149 | PENDING |
| 2.4 | Footer — legal (sole trader T/A Registrum), links, email addresses | PENDING |
| 2.5 | Responsive + basic a11y pass | PENDING |

### Phase 3 — Live Demo
| # | Task | Status |
|---|------|--------|
| 3.1 | Company search input (calls GET /v1/search client-side) | PENDING |
| 3.2 | Result card — name, number, status, registered address | PENDING |
| 3.3 | Drill-in: click result → show enriched profile + financials snippet | PENDING |
| 3.4 | Demo uses a shared demo API key (rate-limited free tier) | PENDING |
| 3.5 | CTA overlay after 3 lookups: "Get your free key" | PENDING |

### Phase 4 — API Key Provisioning
| # | Task | Status |
|---|------|--------|
| 4.1 | KeySignup component — email input + submit | PENDING |
| 4.2 | POST /api/register route handler — validate email, call generate_key logic, insert into Supabase api_keys | PENDING |
| 4.3 | Resend integration — send key delivery email with getting-started snippet | PENDING |
| 4.4 | Duplicate prevention — check if email already has an active key | PENDING |
| 4.5 | Rate limit the register endpoint (1 key per email per 24h) | PENDING |

### Phase 5 — Payments (Stripe)
| # | Task | Status |
|---|------|--------|
| 5.1 | Stripe account setup + products (Starter/Pro/Enterprise) | PENDING |
| 5.2 | Pricing table → Stripe Checkout links | PENDING |
| 5.3 | POST /api/stripe/webhook — upgrade Supabase tier on payment | PENDING |
| 5.4 | Confirmation email on upgrade | PENDING |
| 5.5 | Cancellation handling — downgrade to free tier | PENDING |

### Phase 6 — Trust & Credibility
| # | Task | Status |
|---|------|--------|
| 6.1 | Better Stack status page setup — embed badge on site | PENDING |
| 6.2 | Uptime monitor for api.registrum.co.uk/v1/health | PENDING |
| 6.3 | /terms and /privacy pages (basic, covering data processing) | PENDING |
| 6.4 | DPA (Data Processing Agreement) page | PENDING |
| 6.5 | Open Government Licence v3.0 attribution in footer | PENDING |

### Phase 7 — Customer Dashboard
| # | Task | Status |
|---|------|--------|
| 7.1 | /dashboard — show usage (calls this month, limit, reset date) | PENDING |
| 7.2 | Auth via magic link (Supabase Auth) | PENDING |
| 7.3 | Key rotation — request a new key | PENDING |
| 7.4 | Upgrade/downgrade plan from dashboard | PENDING |

---

## COPY & POSITIONING

**Headline**: The dependable Companies House API for UK finance.

**Sub-headline**: Real-time UK corporate data with intelligent caching, structured financials, and director networks — integration in 10 minutes.

**Value props** (features section):
- Structured financials from iXBRL filings — no XML parsing required
- Director network mapping — one call, full connected-company graph
- Intelligent caching — 24h profiles, 7d financials, stale-while-revalidate on CH outages
- Explicit data quality metadata — know exactly what's available and why

**Pricing** (monthly):
| Tier | Price | Calls/mo | Burst |
|------|-------|----------|-------|
| Free | £0 | 50 | 2/min |
| Starter | £19 | 500 | 10/min |
| Pro | £49 | 2,000 | 30/min |
| Enterprise | £149 | 10,000 | 60/min |

**Footer legal line**: [Your name] trading as Registrum. Data sourced under the Open Government Licence v3.0.

---

## RUNNING COSTS (at launch)

| Service | Monthly |
|---------|---------|
| Cloudflare (domain + DNS) | ~£0.33 |
| Google Workspace (1 user) | £5.90 |
| Vercel | £0 (free tier) |
| Supabase | £0 (free tier, shared with API) |
| Resend | £0 (free tier, 3k/mo) |
| Better Stack | £0 (free tier) |
| Stripe | £0 fixed + 1.4%+20p/txn |
| **Total** | **~£6.25/mo** |
