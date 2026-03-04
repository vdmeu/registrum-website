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
| 3.1 | Company search input (calls GET /v1/search client-side) | DONE |
| 3.2 | Result card — name, number, status, registered address | DONE |
| 3.3 | Drill-in: click result → show enriched profile + financials snippet | DONE |
| 3.4 | Director network graph — even distribution, radial labels, legend | DONE |
| 3.5 | Demo uses a shared demo API key (rate-limited free tier) | DONE |
| 3.6 | **BLOCKED — Plan rethink needed**: Demo key is on the free plan (50 calls/mo). A shared marketing key will exhaust this in minutes under any real traffic. Options: (a) exempt the demo key from quota enforcement in the API, (b) create a special `demo` plan tier with no/high quota, (c) move demo key to Pro plan. Decision needed before going live. | BLOCKED |
| 3.7 | **Surface quota/error states in the demo UI** — currently any API error (quota exceeded, key invalid, 5xx) silently shows "No companies found". Should show a human-readable message e.g. "Demo temporarily unavailable — try again shortly" | PENDING |
| 3.8 | CTA overlay after 3 lookups: "Get your free key" | PENDING |

### Phase 4 — API Key Provisioning
| # | Task | Status |
|---|------|--------|
| 4.1 | KeySignup component — email input + submit | PENDING |
| 4.2 | POST /api/register route handler — validate email, call generate_key logic, insert into Supabase api_keys | PENDING |
| 4.3 | Resend integration — send key delivery email with getting-started snippet | PENDING |
| 4.4 | Duplicate prevention — check if email already has an active key | PENDING |
| 4.5 | Rate limit the register endpoint (1 key per email per 24h) | PENDING |

### Phase 5 — Payments (Stripe) ✅ SHIPPED (3 Mar 2026)
| # | Task | Status |
|---|------|--------|
| 5.1 | Stripe account setup + product (Pro £49/mo) | MANUAL (user action) |
| 5.2 | Pro pricing card → CheckoutButton → Stripe Checkout | DONE |
| 5.3 | POST /api/stripe/webhook — provision Pro key on checkout.session.completed | DONE |
| 5.4 | Pro key delivery email via Resend | DONE |
| 5.5 | customer.subscription.deleted → downgrade plan to free | DONE |
| 5.6 | /checkout/success + /checkout/cancel pages | DONE |

> Note: Starter tier (£19/mo) dropped. Pricing is now Free / Pro (£49) / Enterprise (£149).
> Enterprise stays as "Contact us" mailto — no self-serve checkout.
> Supabase migration required: `ALTER TABLE api_keys ADD COLUMN stripe_customer_id TEXT; ALTER TABLE api_keys ADD COLUMN stripe_subscription_id TEXT;`
> Vercel env vars required: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID`

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

### Phase 8 — Developer Quickstart & Onboarding Guide
> **Status**: PLANNED
> **User journey**: J1 (developer evaluates), J4 (returning developer)
> **Goal**: A comprehensive `/quickstart` page that takes a developer from zero to a working, production-ready integration in numbered, tested steps — covering registration, first call, understanding the response, and deploying with environment variables.

#### Why this is needed
The current "How It Works" section is a 3-step summary — good for marketing, not enough for a developer who actually wants to integrate. Key gaps:
- No code examples beyond curl
- No guidance on Python / Node / other languages
- No step for "where do I put the key in my app"
- No explanation of what the response fields mean
- No guidance on error handling / rate limits in production
- Registration is a form at the bottom of the page, not part of a flow

The goal is to give developers a linear, "follow these steps and you'll be integrated" guide — the kind of thing that reduces support emails and increases activation from free → paid.

#### Design approach

**Layout**: Two-column. Left: sticky numbered step nav (desktop). Right: step content that scrolls. On mobile: vertical, no sticky nav.

**Step structure** (5 steps, estimated 10 min total):

```
Step 1: Register (2 min)
  → Inline email form (same as homepage CTA, inlined here)
  → "Your key will arrive in your inbox. It looks like: reg_live_..."
  → Note: 50 free calls/month on the free plan

Step 2: Make your first call (3 min)
  → Language toggle: [curl] [Python] [Node.js] [PHP]
  → Pre-filled code block with Tesco PLC (00445790) as example company
  → One-click copy button on code block
  → "Run this live" button (uses demo key, shows actual API response in collapsed panel)
  → Expected response snippet with annotations

Step 3: Understand the response (2 min)
  → Annotated JSON: each field highlighted with a tooltip/aside explaining its business meaning
  → Highlight: company_age_years (derived), accounts.overdue (derived), data_quality (metadata)
  → These are the fields you don't get from raw CH API

Step 4: Add financials (2 min)
  → Second endpoint: GET /v1/company/{number}/financials
  → Language toggle synced with Step 2
  → Response snippet showing revenue, net assets, profit, employees
  → Note about 7-day cache and data availability

Step 5: Deploy to production (1 min)
  → How to store the key safely: .env, environment variables
  → Code patterns for each language (same toggle)
  → Note: never commit your key to git
  → Link to /docs for full API reference
  → Link to #pricing if they need to upgrade
```

**Visual language**:
- Step numbers: large, monospaced, `text-white/[0.06]` (matches existing HowItWorks section)
- Active step: highlighted border on left nav, step number turns `text-[#4F7BFF]`
- Code blocks: `bg-[#0A1628]`, Geist Mono, syntax-coloured like hero
- Copy button: appears on hover over code block, top-right corner, SVG clipboard icon
- "Run this live" button: `bg-[#22D3A0]/10 text-[#22D3A0] border-[#22D3A0]/30` — shows actual response in a collapsible panel below the block
- Language tabs: pill-style tabs, selected = `bg-white/[0.08]`
- Annotations on JSON: small `→ enriched by Registrum` labels in `text-[#22D3A0]` next to derived fields

**Navigation addition**: Add "Quickstart" to the main nav between "Docs" and "Pricing".

#### Tasks
| # | Task | Notes |
|---|------|-------|
| 8.1 | New page `src/app/quickstart/page.tsx` | Static except for the inline form |
| 8.2 | `CodeBlock` component — Geist Mono, syntax colour, one-click copy | Reusable across all steps |
| 8.3 | `LanguageToggle` component — curl/Python/Node tabs, state synced across blocks | Store selection in `useState`; no localStorage needed |
| 8.4 | `LiveRunner` component — "Run this live" executes demo API call, shows collapsible response | Calls `/api/demo?company=00445790` |
| 8.5 | `AnnotatedJson` component — JSON with field-level aside annotations | Used in Step 3 |
| 8.6 | Inline key signup form (reuse `KeySignupForm`) in Step 1 | Requires Phase 4 to be live |
| 8.7 | Add "Quickstart" link to `Nav` in `page.tsx` | Points to `/quickstart` |
| 8.8 | Responsive pass — sticky sidebar collapses to inline steps on mobile | |
| 8.9 | SEO metadata — title "Registrum API Quickstart: Companies House API in 10 minutes" | |

#### Research notes
- Stripe's quickstart guide (stripe.com/docs/quickstart) is the gold standard: language toggle persists, inline "run" panels, progressive disclosure. We don't need that complexity — a simpler version is fine.
- Vercel's quickstart uses numbered steps with screenshots. We'll use code instead.
- The language toggle should cover curl, Python (requests / httpx), and Node.js (fetch or axios). PHP is optional. Keep it to 3 to avoid maintenance burden.
- Copy-to-clipboard: `navigator.clipboard.writeText()` — works on HTTPS, which Vercel always serves.

---

### Phase 9 — Financial Data Visualisation
> **Status**: PLANNED
> **User journey**: J1 (developer evaluates — sees the richness of what they get), J3 (compliance officer — understands the data quality)
> **Goal**: A dedicated `/financials-example` page (and a teaser section on the homepage linking to it) that uses Tesco PLC as a live, real-data example to show what the `/v1/company/{number}/financials` endpoint returns — making the complexity of iXBRL parsing immediately tangible and visually striking.

#### The design challenge
The financial endpoint returns ~20+ structured fields across 2 reporting years. The goal is to convey:
1. **Volume** — how many fields come back, how much was extracted from the iXBRL filing
2. **Structure** — the P&L flows from revenue down to net profit; the balance sheet has assets vs liabilities
3. **Reliability** — every field has a `data_quality` metadata block saying what was found and what wasn't

A bar chart of revenue alone doesn't do this justice. The visualisation needs to show the *shape* of the data, not just a headline number.

#### Proposed design: Three complementary panels

**Panel 1 — The P&L Waterfall** (top of page, most striking)

A vertical cascade chart showing how money flows from revenue down to net profit, using Tesco's real figures:

```
Revenue          ████████████████████████████████████ £68.19B
Cost of sales    ████████████████████████████████░░░░ -£62.92B
                 ─────────────────────────────────────────────
Gross profit         ████ £5.27B
Admin expenses       ░░█  -£2.45B
                 ─────────────────────────────────────────────
Operating profit       ██ £2.82B
Finance costs          ░  -£0.41B
Tax                    ░  -£0.52B
                 ─────────────────────────────────────────────
Net profit              █ £1.90B
```

Bars are proportional to the revenue figure. Revenues/profits use `#22D3A0` (green), costs use `#F97316` (orange), subtotals use `#4F7BFF` (blue). Each bar has the label and value to the right. Hovering over a bar shows the field name from the API response (`uk-core:Turnover`, `uk-core:CostSales`, etc.) — the XBRL taxonomy code, as a proof of precision.

This is pure SVG. No charting library. Consistent with `DirectorGraph.tsx`.

**Panel 2 — The Balance Sheet Split** (below P&L)

Two-column layout: Assets (left) and Liabilities + Equity (right).

Each side is a proportional stacked bar showing:
- Fixed assets: £X
- Current assets: £Y
- Total assets: £X+Y
vs.
- Current liabilities: £A
- Long-term liabilities: £B
- Total equity: £C

The bars are horizontal with labels inside (if room) or alongside. Font: Geist Mono for numbers.

**Panel 3 — Data Quality Grid** (below balance sheet)

A grid showing all ~22 fields in the financials response. Each cell is either:
- `#22D3A0` with ✓ — field was extracted from this filing
- `text-[#3D5275]` with ⊘ — field not present in this company's accounts
- `text-[#7A8FAD]` with — — not applicable for accounts type

```
┌─────────────────────┬────────────────────────┬───────────────┐
│ revenue             │ cost_of_sales          │ gross_profit  │
│    ✓ £68.19B        │    ✓ £62.92B           │    ✓ £5.27B   │
├─────────────────────┼────────────────────────┼───────────────┤
│ admin_expenses      │ operating_profit       │ net_profit    │
│    ✓ £2.45B         │    ✓ £2.82B            │    ✓ £1.90B   │
├─────────────────────┼────────────────────────┼───────────────┤
│ fixed_assets        │ current_assets         │ total_equity  │
│    ✓ £XX.XB         │    ✓ £XX.XB            │    ✓ £10.7B   │
├─────────────────────┼────────────────────────┼───────────────┤
│ net_assets          │ average_employees      │ creditors_due_1yr │
│    ✓ £10.7B         │    ✓ 295,622           │    ✓ £XX.XB   │
└─────────────────────┴────────────────────────┴───────────────┘
```

**Below the grid**: "Fields sourced from accounts type: `full` (Tesco PLC, filing date: 2024-04-13)" — shows the data quality metadata from the API.

**Page footer**: Collapsible "View raw JSON response →" — shows the full `data` object from the API, Geist Mono, same dark code block style as hero. This is for the developer who wants to see what they'd actually receive.

**Above the fold**: A minimal header panel:
```
TESCO PLC  ·  Company 00445790
Full accounts  ·  Year ended 24 Feb 2024  ·  Filed 2024-04-13
Completeness: 20/22 fields extracted
```

#### Implementation notes

- **Hardcode Tesco data** — do NOT make a live API call on page load. This keeps the page fast, avoids demo key rate limits, and means the page always works. Use a `tescoFinancials.ts` constant file. Verify figures against an actual API response before shipping.
- The page shows a banner: "Live data fetched from the Registrum API. Tesco PLC · Company 00445790." with a "Try with your company →" link that scrolls to or links to the demo.
- **Actual Tesco figures to verify before build** (approximate, from public accounts):
  - Revenue: £68,190,000,000
  - Cost of sales: ~£62,920,000,000
  - Gross profit: ~£5,270,000,000
  - Admin expenses: ~£2,450,000,000
  - Operating profit: ~£2,820,000,000
  - Net profit for period: ~£1,900,000,000
  - Net assets: ~£10,700,000,000
  - Average employees: ~295,622
  - Accounts type: full
  - Reporting year: 2024-02-24
  - *Run `curl -H "X-API-Key: reg_dev_test" https://api.registrum.co.uk/v1/company/00445790/financials` to get exact figures*
- All SVG charts pure TypeScript/SVG — no chart libraries. Keeps bundle size minimal.
- Two-year comparison optional: if current and prior year both exist, show prior year as a lighter bar behind the current year.

#### Homepage teaser
Add a section between Features and HowItWorks on the homepage:

```
See it in action →
Real financial data, parsed from iXBRL — clean JSON in one call.
[Teaser thumbnail of the waterfall chart, static]   →  View financial example
```

Small static preview image (or inline SVG thumbnail) of the P&L waterfall, with a "View full example →" link to `/financials-example`.

#### Tasks
| # | Task | Notes |
|---|------|-------|
| 9.1 | Fetch actual Tesco financials from API, record as `src/lib/tescoFinancials.ts` constant | One-time, update manually if needed |
| 9.2 | `PnlWaterfall` SVG component — proportional bars, labels, XBRL field name on hover | Pure SVG |
| 9.3 | `BalanceSheetSplit` SVG component — two-column proportional stacked bars | Pure SVG |
| 9.4 | `DataQualityGrid` component — all fields, ✓/⊘/— cells | Tailwind grid |
| 9.5 | `RawJsonCollapse` component — collapsible code block showing full API response | Reuse `CodeBlock` from Phase 8 |
| 9.6 | New page `src/app/financials-example/page.tsx` — assembles all panels | |
| 9.7 | Homepage teaser section — static SVG thumbnail + link | Between Features and HowItWorks |
| 9.8 | Add "Data example" or "Financials" to nav (discretionary — may be too much for nav) | |
| 9.9 | SEO metadata — "Companies House financial data API · Registrum example" | |

#### Design decisions still open
- **Prior year comparison**: Add second year? Makes waterfall messier but shows the "current vs prior year" value prop. Recommend: add as a toggle ("Show prior year comparison").
- **Exact Tesco figures**: Must be pulled from the live API before building — not estimated. The data on page is a live showcase, not marketing copy.
- **Mobile layout**: Waterfall is wide; on mobile, rotate labels or cap bar width. DataQualityGrid: 3 columns → 2 columns → 1 column.

---

### Phase 10 — Enrichment Comparison: What Registrum Adds
> **Status**: PLANNED
> **User journey**: J1 (developer evaluating), J3 (compliance officer validating)
> **Goal**: A visually clear section or page showing the field-by-field delta between a raw Companies House API response and a Registrum response. The "before/after" story, presented so clearly that no explanation is needed.

#### Why this is needed
The current Features section describes what Registrum does in prose. But developers are visual, skeptical, and short on attention. Showing the actual JSON diff is more convincing than any description. This feature answers: "What do I get that I can't just get myself?"

It also targets an SEO keyword cluster: "companies house api alternative", "companies house financial data api", "companies house api rate limit solution".

#### Design approach: Three-part page at `/vs-companies-house`

**Part 1 — The JSON diff** (above the fold, most striking)

A horizontally split code panel:
- Left side: header "Companies House API" — muted, grey palette — shows a realistic raw CH API response for company 00445790. Approximately 12-15 fields, no financial data, no derived/computed fields.
- Right side: header "Registrum API" — shows Registrum response for the same company. Fields that match CH API: same styling as left. New/enriched fields: highlighted in distinct colours.

Field colouring on the right:
- `#22D3A0` (green) — field is newly computed/derived (e.g. `company_age_years`, `accounts.overdue`)
- `#4F7BFF` (blue) — field group added by Registrum (e.g. the whole `financials` block)
- `#E8F0FE` (neutral white) — field also present in CH API

Between the two panels: a vertical divider with a floating badge: `+18 fields`

Scrollable — both panes scroll together (synchronized scroll). The right pane extends further (more data).

**Example content of the left pane** (CH API raw, selective):
```json
{
  "company_name": "TESCO PLC",
  "company_number": "00445790",
  "company_status": "active",
  "type": "plc",
  "date_of_creation": "1947-11-27",
  "registered_office_address": { ... },
  "sic_codes": ["47110"],
  "accounts": {
    "next_accounts": { "due_on": "2024-07-24" },
    "last_accounts": { "made_up_to": "2024-02-24" }
  },
  "confirmation_statement": {
    "next_due": "2025-06-15"
  }
}
```
_(~12 fields, no financials, no computed data, no quality signals)_

**Right pane** (Registrum — additions highlighted):
```json
{
  "company_name": "TESCO PLC",
  "company_number": "00445790",
  "company_status": "active",
  "company_type": "plc",
  "date_of_creation": "1947-11-27",
  "company_age_years": 78,          ← green: computed
  "registered_office_address": { ... },
  "sic_codes": ["47110"],
  "sic_descriptions": ["Retail sale in non-specialised stores…"], ← green: enriched
  "accounts": {
    "overdue": false,               ← green: computed
    "next_accounts_due": "2024-07-24",
    "last_accounts_made_up_to": "2024-02-24"
  },
  "confirmation_statement": {
    "overdue": false                ← green: computed
  },
  "financials": {                   ← blue: new block
    "revenue": 68190000000,
    "net_profit": 1900000000,
    "net_assets": 10700000000,
    "average_employees": 295622,
    "accounts_type": "full",
    "reporting_period_end": "2024-02-24",
    "data_quality": { ... }
  },
  "cached": true,                   ← blue: infrastructure metadata
  "cache_age_seconds": 14423,
  "credits_remaining": 482
}
```

**Part 2 — Comparison table** (scrollable, below the diff)

| Data category | Companies House (direct) | Registrum |
|---------------|--------------------------|-----------|
| Company name / number / status | ✓ Raw | ✓ Same |
| Company age | ✗ Must calculate from `date_of_creation` | ✓ `company_age_years` pre-computed |
| Accounts overdue | ✗ Must compare two date fields | ✓ `accounts.overdue` boolean |
| Confirmation statement overdue | ✗ Must compare two date fields | ✓ `confirmation_statement.overdue` boolean |
| SIC code descriptions | ✗ Codes only | ✓ Human-readable descriptions |
| Financial data (revenue, profit) | ✗ Link to iXBRL filing document | ✓ Parsed, structured JSON |
| Balance sheet (assets, liabilities) | ✗ Not available via API | ✓ Parsed from filing |
| Employees | ✗ Not available via API | ✓ `average_employees` |
| Prior year financials | ✗ Not available via API | ✓ `prior_year` block |
| Director list | ✓ Paginated (multiple calls) | ✓ Deduplicated, single call |
| Director appointments at other companies | ✗ Requires one call per director | ✓ Included in directors response |
| Director network (related companies) | ✗ Many paginated calls, manual dedup | ✓ One network endpoint, auto-traversal |
| Rate limit protection | ✗ 600 req/5min, you absorb errors | ✓ Cached, circuit breaker, stale fallback |
| Resilience on CH outage | ✗ 5xx errors propagate to your app | ✓ Stale cache served with `X-Data-Stale` |
| Request tracing | ✗ None | ✓ `X-Request-Id` on every response |
| Data quality signals | ✗ None | ✓ `data_quality` block per endpoint |

This table is the clearest summary of the value proposition. Styling: striped rows, red `✗` in left column, green `✓` in right column.

**Part 3 — Lines of code comparison** (optional, below the table)

Two code blocks side by side:

Left — "Director network, raw CH API":
```python
# Python: get director network for one company
# Requires: 1 call for officers, then 1 call per director
# for their appointments. For Tesco: ~15 directors × paginated

officers_url = f"/company/{company_number}/officers"
officers = requests.get(officers_url, auth=(api_key, "")).json()
network = {}

for officer in officers["items"]:
    officer_id = officer["links"]["officer"]["appointments"].split("/")[2]
    appts_url = f"/officers/{officer_id}/appointments"
    appts = requests.get(appts_url, auth=(api_key, "")).json()
    for appt in appts.get("items", []):
        cn = appt["appointed_to"]["company_number"]
        network.setdefault(cn, []).append(officer["name"])

# Result: 15+ API calls, manual dedup, no caching
```

Right — "Director network, Registrum":
```python
import requests

r = requests.get(
    "https://api.registrum.co.uk/v1/company/00445790/network",
    headers={"X-API-Key": "reg_live_..."}
)
print(r.json()["data"]["companies"])
# Result: 1 call, cached, rate-limit safe
```

#### Placement strategy
- **Phase 10a**: Add as a new landing page section (between Features and HowItWorks). The diff panel is the hero, the table scrolls below. "See what you get that you don't have today →" is the CTA.
- **Phase 10b**: Simultaneously live as standalone page `/vs-companies-house` for SEO. Richer content on the page (more context, more examples).

#### Tasks
| # | Task | Notes |
|---|------|-------|
| 10.1 | `JsonDiffPanel` component — two-pane synchronized scroll, field colour coding | Static data |
| 10.2 | `ComparisonTable` component — striped rows, `✓`/`✗` cells | Tailwind table |
| 10.3 | `CodeComparison` component — side-by-side code blocks, same `CodeBlock` from Phase 8 | Optional for Phase 10a |
| 10.4 | Add section to `page.tsx` between Features and HowItWorks | Calls `JsonDiffPanel` + `ComparisonTable` |
| 10.5 | New page `src/app/vs-companies-house/page.tsx` — full standalone version | SEO target |
| 10.6 | SEO metadata for `/vs-companies-house` — "Companies House API alternative · Registrum" | |
| 10.7 | Add `/vs-companies-house` to sitemap (`src/app/sitemap.ts`) | |

#### Research notes
- Competitors that use this "before/after diff" pattern effectively: Zod docs (schema before/after), Prisma (raw SQL vs Prisma ORM). The pattern works because it's concrete.
- The JSON diff panel should NOT highlight every single field — only the ones that are meaningfully different. Too many highlights = nothing stands out.
- Key fields to highlight: `company_age_years`, `accounts.overdue`, `sic_descriptions`, the entire `financials` block, `cached`, `credits_remaining`. That's enough.
- The comparison table is likely more useful to J3 (compliance/PM) than to developers. Developers prefer code. Both audiences will see this page.

---

### Phase 11 — Demo & UX Fixes (prerequisite for going live)
> **Status**: PLANNED (must be resolved before the site sees real traffic)

These are the outstanding issues from Phase 3 that block the demo from working under real-world load.

| # | Task | Notes |
|---|------|-------|
| 11.1 | **Demo key quota fix** — add `demo` plan to API, exempt from 50-call monthly cap | In `ch-enrichment-api`: add `demo` to `PLAN_LIMITS` with e.g. 10,000 calls/mo. Update demo key to `plan='demo'`. |
| 11.2 | **Surface error states in demo UI** — all error cases show a human-readable message | Currently silently shows "No companies found" for any failure. Map: 429 → "Demo busy — try again in a moment", 5xx → "Registrum is temporarily unavailable", network error → "Can't reach the API" |
| 11.3 | **CTA overlay after 3 lookups** — "Enjoying the demo? Get a free key" modal | Count lookups in `useState`, show overlay after 3rd company detail load. Dismissible. |
| 11.4 | **Loading skeleton for company detail** — show skeleton cards while fetching | Replace spinner with content-shaped skeleton in the company detail panel |

---

### Phase 12 — Code Snippet Language Toggle (site-wide)
> **Status**: PLANNED
> **Goal**: Replace all hardcoded curl examples on the site with a tabbed language toggle (curl / Python / Node.js). Synced: picking Python in Step 1 keeps Python selected everywhere else.

| # | Task | Notes |
|---|------|-------|
| 12.1 | `LanguageContext` — React context providing `[lang, setLang]` | Wrap in `layout.tsx` or page-level |
| 12.2 | `CodeBlock` with language prop — renders correct snippet per lang | curl, Python (requests), Node.js (fetch) |
| 12.3 | Language tabs UI — pill-style tabs above each code block | |
| 12.4 | Update Hero code block to use `CodeBlock` | Currently hardcoded curl |
| 12.5 | Update HowItWorks code blocks to use `CodeBlock` | Three steps |
| 12.6 | Update Quickstart page (Phase 8) — already built with `CodeBlock`, just wire context | |

**Code examples to support**:
```
curl:   curl -H "X-API-Key: reg_live_..." https://api.registrum.co.uk/v1/company/00445790
Python: import requests; r = requests.get(..., headers={...}); print(r.json())
Node:   const r = await fetch(..., {headers: {...}}); console.log(await r.json());
```

---

### Phase 13 — Status Embed & Trust Signals
> **Status**: PLANNED
> **Goal**: Surface the API's uptime/health directly on the website — critical for J3 (compliance officer).

| # | Task | Notes |
|---|------|-------|
| 13.1 | Better Stack status page setup (free tier) | Monitors `https://api.registrum.co.uk/v1/health` |
| 13.2 | Embed Better Stack status badge in footer | Small "API Status: Operational" badge with live dot |
| 13.3 | Add `/status` page or redirect to Better Stack public status page | `registrum.co.uk/status` → redirect |
| 13.4 | Add "Status" link to footer nav | |

---

### Phase 14 — SEO Landing Pages
> **Status**: PLANNED (low priority, after core features are live)
> **Goal**: Target high-intent search terms that developers use when they have the problem Registrum solves.

Target keyword clusters:
| Page | Target keyword | Monthly searches (est.) |
|------|----------------|------------------------|
| `/companies-house-api-rate-limit` | "companies house api rate limit" | ~200/mo |
| `/companies-house-financial-data` | "companies house financial data api" | ~150/mo |
| `/ixbrl-parser-api` | "ixbrl parser api" / "companies house ixbrl" | ~100/mo |
| `/director-network-api` | "companies house director network" | ~80/mo |
| `/vs-companies-house` | "companies house api alternative" | ~120/mo (covered by Phase 10b) |

Each page: 500–800 words explaining the problem, with a code example showing Registrum solving it, and a key signup CTA at the bottom. No blog infrastructure needed — just static Next.js pages.

| # | Task | Notes |
|---|------|-------|
| 14.1 | `/companies-house-api-rate-limit/page.tsx` | Target: developers hitting 600 req/5min |
| 14.2 | `/companies-house-financial-data/page.tsx` | Target: iXBRL parsing pain |
| 14.3 | `/ixbrl-parser-api/page.tsx` | Target: developers searching for XBRL APIs |
| 14.4 | `/director-network-api/page.tsx` | Target: director traversal use case |
| 14.5 | Add all SEO pages to `sitemap.ts` | |

---

### Phase 15 — MCP Server ✅ SHIPPED (4 Mar 2026)
> **Status**: SHIPPED
> **Goal**: Publish a Node/TypeScript MCP server to npm so developers can query the Registrum API directly from Claude Desktop, Cursor, and other MCP-compatible AI clients.

#### Why this is needed
MCP (Model Context Protocol) lets AI tools call external APIs as structured tools. A Registrum MCP server means a developer can ask Claude "Who are the directors of Tesco PLC and what other companies are they associated with?" and get a real answer backed by live CH data — without writing any code. This is a high-visibility distribution channel (Claude Desktop has 10M+ users).

#### Proposed tools
| Tool | Maps to |
|------|---------|
| `search_company` | `GET /v1/search?q={name}` |
| `get_company` | `GET /v1/company/{number}` |
| `get_financials` | `GET /v1/company/{number}/financials` |
| `get_directors` | `GET /v1/company/{number}/directors` |
| `get_network` | `GET /v1/company/{number}/network` |

#### Distribution
Users add to `~/.claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "registrum": {
      "command": "npx",
      "args": ["-y", "@registrum/mcp"],
      "env": { "REGISTRUM_API_KEY": "reg_live_..." }
    }
  }
}
```

#### Tasks
| # | Task | Notes |
|---|------|-------|
| 15.1 | Scaffold MCP package — TypeScript, `@modelcontextprotocol/sdk`, build with `tsc` | Standalone repo: github.com/vdmeu/registrum-mcp | ✅ DONE |
| 15.2 | Implement 5 tools — each calls Registrum API with `REGISTRUM_API_KEY` env var | | ✅ DONE |
| 15.3 | Add input schema validation (Zod) for each tool | Company number format, search query | ✅ DONE |
| 15.4 | Add test suite (Vitest, 12 tests, InMemoryTransport + Client) | | ✅ DONE |
| 15.5 | Publish `@registrum/mcp@1.0.0` to npm | @registrum org created on npmjs.com | ✅ DONE |
| 15.6 | Add MCP install step to `/quickstart` page | Step 6 "Use with AI (MCP)" | ✅ DONE |
| 15.7 | Update website homepage Features section | | ✅ DONE |
| 15.8 | Submit to MCP registries (Smithery, Glama, awesome-mcp-servers, PulseMCP) | glama.json added to repo | IN PROGRESS |

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
