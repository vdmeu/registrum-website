# User Journeys

> Every feature in the build plan must map to one of these journeys.
> If a feature doesn't serve a journey, question whether it belongs in the MVP.

---

## J1: Developer evaluates the API before committing

**User**: A developer at a fintech startup (seed–Series B). Has hit CH rate limits or spent time parsing iXBRL. Googled for a solution and landed on registrum.co.uk.

**Trigger**: Frustration with raw Companies House API — rate limits, unstructured financial data, or the complexity of director network lookups.

**Goal**: Understand quickly whether Registrum solves their problem and is worth integrating.

**Steps**:
1. Lands on homepage — reads headline and sub-headline
2. Looks at the live demo — types in a company name, sees structured results
3. Checks pricing — confirms Free tier is enough to prototype
4. Clicks "Get API key" — enters email
5. Receives key by email — makes first API call within 10 minutes

**Success**: Developer has a working API call with real data before they've had to think about billing.

**Failure modes**:
- Demo is slow or errors → show graceful loading state, never expose raw errors
- Email doesn't arrive → clear "check spam" message, resend option
- Docs are confusing → link directly to `/docs` with a working example pre-filled

**Features this drives**:
- Phase 2: Hero, live demo section
- Phase 3: Live demo component
- Phase 4: Key provisioning (email form → Resend delivery)

---

## J2: Developer upgrades to a paid plan

**User**: Same developer as J1. Free tier (50 calls/mo) is now limiting their work. They're integrating Registrum into a production feature.

**Trigger**: Hits the 50-call monthly limit, or needs the burst rate for a batch job.

**Goal**: Upgrade to Starter or Pro with minimal friction — ideally without leaving their flow.

**Steps**:
1. Gets a 429 response with a clear message ("Monthly limit reached — upgrade at registrum.co.uk/pricing")
2. Visits pricing page — sees the tiers, understands what they get
3. Clicks "Upgrade" on the Starter tier
4. Stripe Checkout — enters card, confirms payment
5. Receives confirmation email — existing key is automatically upgraded (no new key needed)
6. Makes API call — sees higher limit reflected in `credits_remaining`

**Success**: Upgraded in under 2 minutes, same key works, no support needed.

**Failure modes**:
- Payment fails → Stripe handles with clear error messaging
- Key not upgraded after payment → webhook must be reliable; manual fallback: support email

**Features this drives**:
- Phase 2: Pricing table
- Phase 5: Stripe Checkout + webhook + tier upgrade

---

## J3: Compliance officer or PM vets Registrum as a supplier

**User**: A non-technical stakeholder (compliance officer, product manager) at a regulated fintech. A developer has already decided they want to use Registrum — this person needs to sign off.

**Trigger**: Developer sends them the website URL asking for approval.

**Goal**: Confirm the service is legitimate, dependable, and legally compliant enough to use in a production workflow.

**Steps**:
1. Lands on homepage — reads headline and legal footer (sole trader T/A Registrum, OGL attribution)
2. Clicks through to status page — sees uptime history
3. Looks for a privacy policy or DPA — confirms data handling is documented
4. Emails support@ with questions (if any)

**Success**: Passes internal review. Approves the integration.

**Failure modes**:
- No status page → they assume it's a side project, not production-grade
- No privacy policy → immediate blocker for regulated firms
- Gmail address in footer → immediate red flag

**Features this drives**:
- Phase 2: Footer (legal name, OGL, professional email)
- Phase 6: Better Stack status page, /terms, /privacy, DPA page
- Infrastructure: Google Workspace email (api@, support@, billing@)

---

## J4: Returning developer checks their usage

**User**: An existing paid customer. Mid-month, wants to know how many calls they've used and when the counter resets.

**Trigger**: Building something that depends on their remaining quota.

**Goal**: See current usage without having to email support.

**Steps**:
1. Goes to registrum.co.uk/dashboard
2. Logs in via magic link (Supabase Auth — no password)
3. Sees: calls this month / monthly limit / reset date / current plan
4. Optionally: rotates their API key if they think it's been compromised

**Success**: Got the information in under 30 seconds.

**Features this drives**:
- Phase 7: Customer dashboard, Supabase Auth, key rotation
