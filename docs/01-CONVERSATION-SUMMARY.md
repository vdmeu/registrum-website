# Conversation Summary

> Updated at the end of each Claude session.
> Purpose: let a new session get up to speed in 2 minutes without re-reading everything.
> Newest entry first.

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
- **Key prefix**: Keep `ch_live_` for now — changing it breaks existing keys. Revisit at v2.
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
