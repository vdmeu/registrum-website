# Conversation Summary

> Updated at the end of each Claude session.
> Purpose: let a new session get up to speed in 2 minutes without re-reading everything.
> Newest entry first.

---

## 2026-03-13 — Session 7: PSC chain endpoint, KYB integration, MCP v1.2, website PSC content

### What was built (cross-repo)

**ch-enrichment-api**
- Fixed `_fetch_psc_raw` cache inconsistency (enriched cache format ≠ raw CH format needed by chain). Now fetches fresh raw data from CH API, bypassing the enriched PSC cache entirely.
- `GET /v1/company/{number}/psc/chain` — BFS chain resolution endpoint. Traverses corporate entity PSCs to find ultimate beneficial owners. Terminal reasons: `natural_person`, `foreign_entity`, `legal_person`, `psc_exempt`, `depth_limit`, `not_found`, `cycle_detected`. 1 credit per company resolved. `max_depth` param (1–10, default 5). Non-fatal: CH API errors produce a `not_found` terminal node.
- `GET /v1/company/{number}/kyb-report` — extended to include `psc_chain` section. Credits are now dynamic: 3 base + chain credits. Chain resolution runs in parallel with financials and directors via `asyncio.gather`. Chain failure is non-fatal.
- `tests/conftest.py` updated: `mock_ch_client.get_company_psc.return_value = None` so chain resolves predictably (1 company, not_found, 1 credit) across all non-PSC tests.
- **408 tests passing** as of last run.

**registrum-mcp**
- Added `get_psc_chain` tool. Bumped to v1.2.0. Published to npm as `@registrum/mcp@1.2.0`.

**registrum-website**
- Landing page: PSC feature card added (links to `/psc-example`).
- `/psc-example` — illustrative 2-level ownership chain (CSS tree), active/ceased PSC tables with decoded natures, chain metadata footer.
- `/beneficial-ownership-api` — SEO explainer page: problem, solution, terminal reasons table, 6 use-case cards, CTA.
- `/quickstart` — PSC section added (Step 5 production card, `PSC_SNIPPETS`, `get_psc`/`get_psc_chain` in MCP tools list).
- `/use-cases` — PropTech and RegTech/KYB cases updated to reference `/psc/chain` and `/psc` endpoints specifically. "Beneficial ownership API →" link added to KYB case.
- Pricing features: Free tier now lists "Beneficial ownership (PSC)"; Pro/Enterprise list "PSC ownership chain resolution".
- Caching page: `/psc` (24h TTL) and `/psc/chain` (fresh per call, not cached) rows added to cache TTL table.

### Key decisions
- **Chain bypasses enriched PSC cache**: Chain classification requires raw CH kind strings (`"individual-person-with-significant-control"` etc.). Enriched cache stores decoded format. Simplest fix: chain always fetches fresh. Appropriate since chain = premium multi-credit call.
- **`closes #N` auto-closes issues**: Session-end lifecycle no longer includes manual `gh issue close`. Removed from global `~/.claude/CLAUDE.md`.
- **Chain not cached**: PSC chain resolution fetches live data at each node — result depends on live PSC state at every company in the chain. Caching would require invalidation across all chain nodes.

### Current state
- All features through PSC chain + KYB integration are live.
- Only open website issue: #17 (LangChain/CrewAI integration package — low priority).
- No open CH-Api or MCP issues.

### What's next (priority order)

1. **Stripe payments (website + API)** — Plan upgrades via Stripe Checkout → webhook → Supabase plan update. Website doesn't yet have a checkout flow for pro/enterprise. CH-Api `WORKING-STATE.md` has the spec. Estimated: ~4h end-to-end.

2. **Customer usage dashboard** — Page showing calls over time, remaining quota, current plan, upgrade button. Requires Supabase Auth (magic link) + `usage_logs` query. `label` column currently stores email (MVP shortcut — needs schema migration before this is possible). Estimated: ~6h.

3. **Better Stack status badge (Phase C)** — Add live "Operational" badge to footer. Better Stack badge URL format: `https://uptime.betterstack.com/status-badges/v1/monitor/{MONITOR_ID}.svg`. Full spec in `ch-enrichment-api/docs/WORKING-STATE.md` under "Phase C". Estimated: ~20 min once `MONITOR_ID` is known.

4. **Better Stack ↔ internal probes (Phase B)** — Push `health_monitor.py` probe failures to Better Stack so status page reflects internal degradation. Full spec in `ch-enrichment-api/docs/WORKING-STATE.md`. Estimated: ~2h.

5. **Rate limit headers** — Add `X-RateLimit-Remaining`, `X-RateLimit-Reset` to every API response. Low effort, improves developer experience.

6. **Batch endpoint** — `POST /v1/batch` — multiple company numbers in one call. Medium effort. No issue created yet.

7. **LangChain/CrewAI integration** (website #17) — Low priority. `@registrum/langchain-tools` package. No implementation started.

### Open items
- `BETTERSTACK_MONITOR_ID` — needed to complete Phase C badge. Get from Better Stack dashboard → Monitors.
- `label` = email convention in `api_keys` table is a schema shortcut. Must be formalized before building the customer dashboard.
- Old `nul` file in `ch-enrichment-api` repo root — Windows artifact, should be deleted + gitignored (harmless but untidy).

---

## 2026-03-02 — Session 5: Phase 4, demo quota fix, Phase 6, feature links + mobile fixes

### What was built
- **Phase 4 — Key provisioning**: `POST /api/register` route handler live. Generates bcrypt-hashed `reg_live_*` key, inserts into Supabase `api_keys` (email stored in `label` column — no schema change needed for MVP), sends delivery email via Resend. Duplicate check: same email → reminder email, no new key. `KeySignupForm.tsx` wired to real endpoint with proper error states.
- **Env vars added to Vercel via CLI**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`
- **Demo quota fix**: `ch-enrichment-api/src/api/middleware.py` — one-line change: label `registrum-website-demo` now bypasses monthly quota check. Deployed to Railway.
- **Phase 6 legal pages**: `/dpa/page.tsx` (full DPA with sub-processor table), `/status/page.tsx` (stub — links to API health endpoint; Better Stack badge TODO for morning). `/terms` and `/privacy` already existed from Session 4.
- **Director network example** (`/directors-example`): Full-page Tesco PLC director network. Hardcoded data in `src/lib/tescoDirectors.ts` (fetched live 2026-03-02). DirectorGraph component reused. Director table below graph. API call snippet.
- **Caching visual** (`/caching`): Explains the caching architecture with flow diagrams (raw CH vs Registrum), TTL table, outage timeline with circuit breaker story, code snippet showing stale response headers.
- **Feature card links**: Director Networks → `/directors-example`, Intelligent Caching → `/caching`, Fuzzy Search → API docs (external). External link detection added to renderer.
- **Mobile overflow fix**: `overflow-x-hidden` on root div, nav items hidden on mobile (`hidden sm:block`) except CTA button, `overflow-x-auto` on all code/pre blocks, `min-w-0` on hero code panel.
- **Sitemap updated**: 10 routes including new pages.
- **Build**: ✓ clean — 18 static/dynamic routes. Tests: 18/18 passing. Deployed to Vercel prod.

### Key decisions
- Email stored in `label` field for MVP (avoids ALTER TABLE). Dashboard (Phase 7) will need a proper schema migration.
- Supabase + Resend clients lazy-initialized (not at module level) — required for Next.js build-time compatibility.
- Better Stack integration parked for tomorrow morning. `/status` page links to API health endpoint as stub.

### What's next (priority order)
1. **Better Stack** — create account, monitor `https://api.registrum.co.uk/v1/health`, get status page URL. Update `/status/page.tsx` TODO and add badge to footer.
2. **Phase 5** — Stripe payments (account not yet created)
3. **Phase 7** — Customer dashboard (Supabase Auth + magic link)
4. **Tesco financials verification** — verify figures in `src/lib/tescoFinancials.ts` against live API before promoting `/financials-example` publicly

### Open items
- Better Stack URL: TODO — update `src/app/status/page.tsx` STATUS_PAGE_URL const + add badge to footer
- Email deliverability: verify Resend is sending from `api@registrum.co.uk` (check Resend DNS/SPF config)
- `label` = email convention: document this properly before Phase 7 dashboard build

---

## 2026-03-02 — Session 4: Feature planning + builds (Phases 8–11)

### Context
User requested three new planned features, plus additional suggestions, added to the build plan and then immediately built without user input (overnight autonomous session).

### What was planned (added to docs/00-BUILD-PLAN.md)
- **Phase 8**: Developer Quickstart guide (`/quickstart`) — 5-step onboarding, language toggle, live runner, annotated JSON
- **Phase 9**: Financial data visualisation (`/financials-example`) — P&L waterfall SVG, balance sheet split, data quality grid, YoY comparison bars; uses hardcoded Tesco PLC data
- **Phase 10**: Enrichment comparison (`/vs-companies-house`) — JSON diff panel (CH API vs Registrum), field-by-field table, code comparison (16 calls → 1)
- **Phase 11**: Demo fixes — error states (429/5xx/network → human messages), loading skeleton, CTA overlay after 3 lookups
- **Phase 12**: Language toggle (sitewide curl/Python/Node tabs)
- **Phase 13**: Status embed (Better Stack badge)
- **Phase 14**: SEO landing pages (rate limit, financials, iXBRL, director network)

### What was built
- `src/components/CodeBlock.tsx` — reusable code block with copy button + language tabs (window chrome)
- `src/app/quickstart/page.tsx` + `QuickstartClient.tsx` — full 5-step guide with sticky sidebar nav, scroll-aware step tracking, live API runner
- `src/lib/tescoFinancials.ts` — hardcoded Tesco PLC financial data constants + formatters
- `src/app/financials-example/page.tsx` — P&L waterfall (proportional SVG bars), balance sheet split (stacked bars, hover values), data quality grid (✓/⊘ cells), YoY comparison, full raw JSON accordion
- `src/app/vs-companies-house/page.tsx` — JSON diff panel (CH muted / Registrum highlighted), comparison table (17 rows), code comparison (16-call CH script vs 2-line Registrum)
- `src/components/Demo.tsx` — error states surfaced, loading skeleton (animated placeholder cells), CTA overlay after 3rd company detail view
- `src/app/page.tsx` — Quickstart added to nav, `EnrichmentTeaser` section added (between Features and HowItWorks), financials "See Tesco example →" link added to feature card, `Link` from next/link imported
- `src/app/sitemap.ts` — `/quickstart`, `/financials-example`, `/vs-companies-house` added
- `src/components/Demo.test.tsx` — all fetch mocks updated to include `ok: true`

### Build status at end of session
- `npm run build` ✓ clean — 5 new static routes, all 13 pages generated
- `npm test` ✓ — 18/18 passing

### What's next (priority order)
1. **Phase 4** — Key provisioning (wire KeySignupForm → POST /api/register → Supabase + Resend). KeySignupForm is still a stub showing fake success.
2. **Demo quota fix** — Add `demo` plan tier to API (ch-enrichment-api); move demo key to it. Currently on free (50 calls/mo) — will exhaust under any real traffic.
3. **Phase 5** — Stripe payments
4. **Phase 6** — Better Stack status page + /terms, /privacy, DPA
5. **Phase 7** — Customer dashboard (Supabase Auth + magic link)

### Open items / decisions needed
- **Tesco financial figures** in `src/lib/tescoFinancials.ts` are cross-checked against public annual report but approximate. Verify against live API (`GET /v1/company/00445790/financials`) before promoting `/financials-example` publicly.
- **Demo quota** (Phase 11.1): needs API-side fix — add `demo` plan with high/no quota cap. Decision: exempt from quota entirely OR set to e.g. 10,000/mo?
- **Quickstart live runner** (Step 2) calls `/api/demo?company=00445790` — depends on demo key being functional.

---

## 2026-03-01 — Session 3: Rebranding, favicon, graph tooltips, key rotation

### Context
Parallel API session shipped the Registrum rebranding (key prefix `ch_live_*` → `reg_live_*`, production URL locked to `api.registrum.co.uk`). This website session absorbed those changes and also shipped two UX improvements.

### Key decisions made

- **Env var rename**: `DEMO_API_KEY` → `REGISTRUM_DEMO_API_KEY` — matches the document name the API team suggested; clearer at a glance.
- **Demo key rotation**: Old `ch_live_*` key was invalid post-rebranding. Deactivated via Supabase PATCH, generated fresh `reg_live_d40c3` via `create_demo_key.py`, set on Vercel. Parallel-session key conflict (`reg_live_05fb4` was re-activated by the other session) resolved by explicitly pinning Supabase to the key stored in Vercel.
- **Favicon**: SVG-only approach (`src/app/icon.svg`) — Next.js 15 App Router auto-serves it as the browser icon. No binary ICO needed for modern browsers.
- **Tooltip strategy for graph**: Floating HTML div (not SVG `<title>`) tracking cursor via `onMouseMove` on a wrapper div. Shows full untruncated name for all three node types (focal company, director, outer company).
- **`.env.example` unblocked from gitignore**: `.env*` wildcard was catching it; added `!.env.example` negation.

### What was built

- `src/app/icon.svg` — geometric R favicon: dark navy rounded square, white stem + D-bowl + diagonal leg, teal (#22D3A0) circle at leg tip referencing the director network nodes
- `src/components/DirectorGraph.tsx` — hover tooltip: `tooltip` + `mousePos` state, `wrapperRef` div, tooltip fires on all node types
- `src/app/api/demo/route.ts` — `DEMO_API_KEY` → `REGISTRUM_DEMO_API_KEY`
- `.env.example` — created with all vars documented including new key format
- `.gitignore` — `!.env.example` added
- `docs/WORKING-STATE.md` in `ch-enrichment-api` — fully rewritten to reflect Features 10–13, rebranding, Telegram alerts, 213 tests, new prod URL and key format

### Current state
- **registrum.co.uk**: live, deployed, smoke tested ✅
- **Demo**: returning live data (not mock), all three endpoints working ✅
- **Favicon**: serving `image/svg+xml` from `/icon.svg` ✅
- **Demo key**: `reg_live_d40c3` active in Supabase, set in Vercel ✅
- **API project WORKING-STATE.md**: up to date ✅

### What's next
1. **Key self-service** — wire `KeySignupForm` → `POST /api/register` → Supabase insert → Resend email (Phase 4)
2. **Demo key quota fix** — 50 calls/mo will exhaust under real traffic; exempt demo key or add `demo` plan tier
3. **Stripe payments** — tier upgrades (Phase 5)

### Open questions
- Stripe account not yet created — needed for Phase 5
- Resend account not yet created — needed for Phase 4
- Discord + Telegram env vars on Railway — confirm set (`DISCORD_WEBHOOK_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`)

---

## 2026-02-27 — Session 2: Infrastructure completion, landing page, tooling

### Context
Continuation of Session 1. All of Phase 1 completed. Landing page built and live.

### Key decisions made

- **Email**: Google Workspace rejected in favour of **Cloudflare Email Routing + Gmail SMTP** (£0). api@, support@, billing@ all forward to personal Gmail; Gmail "Send as" configured for outbound. App Password required (not regular password, no spaces).
- **Cost philosophy**: Added to global `~/.claude/CLAUDE.md` — always lead with free options, never suggest paid when free covers the need. "Fail cheaply or profit with wide margin."
- **Landing page design**: Dark navy (#060D1B) with Geist typography. Sections: sticky nav, hero with live code block + pulsing status indicator, 4 feature cards, 3-step how-it-works, 4-tier pricing, email CTA, footer with OGL attribution.
- **KeySignupForm**: Extracted as `'use client'` component (Next.js App Router requires this for event handlers). Stub implementation — wired up properly in Phase 4.
- **Pricing validation flagged**: Added open question to `ch-enrichment-api/docs/00-BUILD-PLAN.md` — validate that tiers are sustainable against the shared CH API rate limit (600 req/5 min) and make economic sense before acquiring >5 paid customers.
- **Global template repo**: `https://github.com/vdmeu/eugene-claude-templates` — reusable scaffold with CLAUDE.md, build plan, conversation summary, user journeys, .gitignore, verify-deploy script.

### What was built
- `api.registrum.co.uk` SSL live (Railway cert provisioned after remove/re-add)
- Vercel deployment: `registrum.co.uk` → HTTPS 200, serving from London edge
- Full landing page: `src/app/page.tsx` + `src/components/KeySignupForm.tsx`
- `src/app/layout.tsx` — proper metadata, OG tags, en-GB locale
- `src/app/globals.css` — dark navy base, custom scrollbar
- Cloudflare Email Routing: api@, support@, billing@ → personal Gmail
- Gmail "Send as" configured for all three addresses
- `wrangler` CLI installed globally

### Current state
- **registrum.co.uk**: live, looks good ✅
- **api.registrum.co.uk**: live, SSL ✅
- **api.registrum.co.uk/docs**: live, Swagger UI ✅
- **Email**: all three addresses working, send + receive ✅
- **Phase 1**: COMPLETE ✅

### What's next (Phase 2 options, in priority order)
1. **Better Stack status page** — 10 min, free, immediate credibility for J3 (compliance officer journey)
2. **API key auto-provisioning** — wire KeySignupForm → POST /api/register → Supabase + Resend (Phase 4)
3. **Live search demo** — company search widget hitting the API (Phase 3)

### Open questions
- Stripe account not yet created — needed for Phase 5
- Resend account not yet created — needed for Phase 4
- Pricing tier economics not yet validated — see ch-enrichment-api/docs/00-BUILD-PLAN.md

---

## 2026-02-27 — Session 1: Domain, infrastructure setup, project scaffold

### Context
Starting from zero — the API (`ch-enrichment-api`) is already live on Railway.
This session was planning + foundation, no application code written yet.

### Key decisions made

- **Name**: Registrum — Latin for "register-book". Directly references Companies Register, FI-credible, .co.uk available at $4.94/yr.
- **Domain registrar**: Cloudflare (at-cost pricing, good DNS management, CLI-friendly via wrangler).
- **Custom API domain**: `api.registrum.co.uk` — CNAME added to Cloudflare, domain added to Railway. SSL provisioning in progress.
- **Stack**: Next.js 15 (App Router) + TypeScript + Tailwind CSS — proper foundation for key-provisioning form (server-side Route Handlers) vs plain HTML.
- **Hosting**: Vercel (free tier sufficient at launch).
- **Email**: Initially considered Google Workspace — rejected, too expensive. Chose Cloudflare Email Routing + Gmail SMTP instead (£0).
- **Key provisioning**: Will use existing `ApiKeyService.generate_key()` from `ch-enrichment-api`. New `POST /api/register` Route Handler in this Next.js app → Supabase insert → Resend email. No new infrastructure needed.
- **Key prefix**: ~~Keep `ch_live_` for now~~ — **superseded 2026-03-01**: API rebranded to Registrum, all keys now `reg_live_*`. Old `ch_live_*` keys are invalid. Regenerate via `python scripts/create_demo_key.py` in `ch-enrichment-api`.
- **Running costs at launch**: ~£6.25/mo (domain + email only, everything else free tier).
- **Legal**: Sole trader trading as Registrum. Open Government Licence v3.0 attribution in footer.

### What was built
- `registrum.co.uk` registered on Cloudflare
- `api.registrum.co.uk` CNAME → Railway created
- Next.js 15 scaffold in `website/` directory
- `CLAUDE.md` with full architecture, env vars, file structure, rules
- `docs/00-BUILD-PLAN.md` with 7-phase backlog
- GitHub repo: https://github.com/vdmeu/registrum-website
- Global `~/.claude/CLAUDE.md` written (applies to all future projects)
- Template repo: https://github.com/vdmeu/eugene-claude-templates

### What's next (Phase 1 remaining)
1. Deploy to Vercel + connect `registrum.co.uk` domain (`vercel --prod` then domain config)
2. Set up Google Workspace email
3. Verify SSL live on `api.registrum.co.uk`
4. Then: Phase 2 — landing page (hero, features, pricing, footer)

### Open questions
- Pricing confirmed: Free £0 / Starter £19 / Pro £49 / Enterprise £149 per month
- Stripe account not yet created — needed for Phase 5
- Resend account not yet created — needed for Phase 4
