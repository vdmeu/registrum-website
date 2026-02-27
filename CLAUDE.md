# CLAUDE.md — Project Context for Claude Code

## Project

Registrum website — marketing site + developer portal for the [Registrum API](https://api.registrum.co.uk).
Built with Next.js 15 (App Router) / TypeScript / Tailwind CSS. Deployed on Vercel.

## Local Environment

- **OS**: Windows 11, **Shell**: Git Bash (paths use `/c/` prefix)
- **Project root**: `/c/users/eugen/claude-ch-proj/website`
- **API project**: `/c/users/eugen/claude-ch-proj/ch-enrichment-api`

## Key Commands

```bash
# Dev server
cd /c/users/eugen/claude-ch-proj/website && npm run dev

# Type check
cd /c/users/eugen/claude-ch-proj/website && npm run build

# Lint
cd /c/users/eugen/claude-ch-proj/website && npm run lint

# Deploy to Vercel (production)
cd /c/users/eugen/claude-ch-proj/website && vercel --prod
```

## Architecture

- **Framework**: Next.js 15 App Router (`src/app/`)
- **Styling**: Tailwind CSS
- **API calls from site**: hit `https://api.registrum.co.uk` directly (no proxy needed for public endpoints)
- **Key provisioning**: `POST /api/register` (Next.js Route Handler) → inserts into Supabase `api_keys` table → sends email via Resend
- **Payments**: Stripe Checkout → webhook → Supabase tier upgrade
- **Hosting**: Vercel (free tier)
- **Domain**: `registrum.co.uk` (Cloudflare DNS → Vercel)

## Project URLs

- **Website (prod)**: https://registrum.co.uk
- **API (prod)**: https://api.registrum.co.uk
- **API docs**: https://api.registrum.co.uk/docs
- **Old API URL** (still works): https://ch-api-production-b552.up.railway.app

## Environment Variables

```bash
# Required for key provisioning
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=   # service role, not anon — needed to insert api_keys
RESEND_API_KEY=

# Required for payments (Phase 4)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

Never commit `.env.local`. All production env vars are set in Vercel dashboard.

## File Structure

```
src/
├── app/
│   ├── layout.tsx          Root layout (font, metadata)
│   ├── page.tsx            Landing page (hero, features, pricing, demo, CTA)
│   ├── api/
│   │   ├── register/
│   │   │   └── route.ts    POST: email → provision free-tier API key → send via Resend
│   │   └── stripe/
│   │       └── webhook/
│   │           └── route.ts Stripe webhook handler (Phase 4)
│   └── dashboard/          (Phase 5) Usage stats + key management
├── components/
│   ├── Hero.tsx
│   ├── Features.tsx
│   ├── Pricing.tsx
│   ├── Demo.tsx            Live company search against the API
│   └── KeySignup.tsx       Email form → calls /api/register
└── lib/
    ├── supabase.ts         Supabase client (server-side, service role)
    └── resend.ts           Resend email client
```

## Design Principles

- **Developer-first, auditor-approved** — clean, technical, no marketing fluff
- **Tailwind only** — no UI component libraries unless absolutely necessary
- **Dark mode**: off for now — keep it simple, light theme only
- **No animations** unless they serve a purpose
- **Accessible**: semantic HTML, proper contrast, keyboard navigable

## Tone & Copy Guidelines

- Lead with reliability and simplicity, not features
- "Dependable Companies House API" — not "the best" or "blazing fast"
- Target: fintech PMs and developers at Series A-B companies
- Avoid superlatives. Let the demo and docs speak.

## Things to Never Do

- Don't add a CMS or i18n — unnecessary complexity
- Don't use `pages/` router — App Router only
- Don't expose `SUPABASE_SERVICE_ROLE_KEY` to the client — server-side only
- Don't rate-limit the demo too aggressively — it's marketing
- Don't add animations or scroll effects without explicit approval
- Don't commit secrets — all secrets in `.env.local` (gitignored) or Vercel dashboard
- Don't push to main without `npm run build` passing locally
