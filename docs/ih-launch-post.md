# Indie Hackers / Show HN Launch Post

> Ready to paste. Adjust numbers/dates before posting.

---

## Title

**Show IH: I built a clean JSON wrapper for the UK Companies House API — free tier available**

---

## Body

Hey IH,

I built [Registrum](https://registrum.co.uk) — a dependable REST API that wraps the UK Companies House API and gives you:

- **Structured financials** — turnover, net assets, profit/loss, employees, all in actual GBP (not iXBRL hell)
- **Director networks** — one call to traverse 2 degrees of board connections, finding related entities you'd never spot manually
- **Intelligent caching** — 24h company data, 7-day financials, stale-while-revalidate during CH outages
- **Fuzzy company search** — name → enriched profile in one call, no second round-trip

**Why I built it**

I kept needing to do KYB / due diligence work on UK companies for side projects and consulting work. The Companies House API returns ~10 raw fields in an inconsistent format, rate-limits you at 600 req/day, and breaks regularly. Every time I needed financials I was hand-parsing iXBRL or scraping.

After the 3rd time writing the same boilerplate, I built the thing I wanted to exist.

**Where it is now**

- API is live and in production
- Free tier: 50 calls/month, no credit card
- Pro tier: 2,000 calls/month at £49/mo
- **Beta offer**: use code `BETA3` at checkout for 3 months free on Pro — first 20 sign-ups

**Tech stack**

- FastAPI (Python) on Railway
- Next.js website on Vercel
- Companies House API as the upstream data source (open data under OGL v3)

**Who it's for**

PropTech companies doing landlord due diligence, RegTech / KYB compliance teams, and sales intelligence tools enriching CRM leads with UK company data.

**Happy to answer questions** about the data, the API design, or the infrastructure. The response shape is fully documented at [api.registrum.co.uk/docs](https://api.registrum.co.uk/docs).

---

*Feedback welcome — especially from anyone doing KYB or company data enrichment. What fields are you missing?*

---

## Product Hunt tagline options

- "Clean JSON on top of Companies House — financials, networks, caching"
- "The UK company API you wished Companies House had built"
- "KYB and due diligence data for UK companies — structured, cached, reliable"

## Tags

`#api` `#fintech` `#proptech` `#regtech` `#uk` `#b2b` `#saas`
