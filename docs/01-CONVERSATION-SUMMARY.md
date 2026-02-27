# Conversation Summary

> Updated at the end of each Claude session.
> Purpose: let a new session get up to speed in 2 minutes without re-reading everything.
> Newest entry first.

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
- **Email**: Google Workspace, 1 user, £5.90/mo ex-VAT annual plan. Aliases: api@, support@, billing@.
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
