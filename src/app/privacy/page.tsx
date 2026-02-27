import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Registrum",
  description: "Privacy policy for the Registrum Companies House API.",
};

export default function Privacy() {
  const updated = "27 February 2026";
  return (
    <div className="bg-[#060D1B] text-[#E8F0FE] font-[family-name:var(--font-geist-sans)] min-h-screen">
      <div className="mx-auto max-w-2xl px-6 py-20">
        <a href="/" className="text-sm text-[#3D5275] hover:text-white">← Back</a>
        <h1 className="mt-8 text-3xl font-semibold tracking-tight text-white">Privacy Policy</h1>
        <p className="mt-2 text-sm text-[#3D5275]">Last updated: {updated}</p>

        <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-[#7A8FAD]">
          <section>
            <h2 className="mb-3 font-semibold text-white">1. Who we are</h2>
            <p>Eugene Merwe-Chartier trading as Registrum (&quot;we&quot;, &quot;us&quot;). We are the data controller for personal data collected through registrum.co.uk and the Registrum API. Contact: <a href="mailto:support@registrum.co.uk" className="text-[#4F7BFF] hover:underline">support@registrum.co.uk</a></p>
          </section>

          <section>
            <h2 className="mb-3 font-semibold text-white">2. Data we collect</h2>
            <ul className="flex flex-col gap-2">
              <li><span className="text-white">Email address</span> — collected when you request an API key. Used to deliver your key and send service notifications.</li>
              <li><span className="text-white">API usage logs</span> — endpoint called, timestamp, response time, company number looked up, whether the result was cached. Used for rate limiting, billing, and service improvement.</li>
              <li><span className="text-white">IP addresses</span> — logged by our infrastructure for security and abuse prevention. Retained for 30 days.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-semibold text-white">3. Data we do NOT collect</h2>
            <p>We do not collect payment card details (handled entirely by Stripe). We do not track visitors with advertising cookies or share data with ad networks. We do not collect any data about the companies you look up — that data flows through from Companies House and is cached temporarily per our stated TTLs.</p>
          </section>

          <section>
            <h2 className="mb-3 font-semibold text-white">4. Legal basis for processing</h2>
            <p>We process your email and usage data under <strong className="text-white">contract</strong> (to provide the API service you requested) and <strong className="text-white">legitimate interests</strong> (to prevent abuse and improve the service).</p>
          </section>

          <section>
            <h2 className="mb-3 font-semibold text-white">5. Data retention</h2>
            <ul className="flex flex-col gap-2">
              <li>Email addresses and API keys: retained while your account is active, deleted within 30 days of account closure on request.</li>
              <li>Usage logs: retained for 12 months, then deleted.</li>
              <li>IP address logs: retained for 30 days.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-semibold text-white">6. Third-party processors</h2>
            <ul className="flex flex-col gap-2">
              <li><span className="text-white">Supabase</span> — database (EU region). Stores API keys and usage logs.</li>
              <li><span className="text-white">Railway</span> — API hosting (EU region). Processes API requests.</li>
              <li><span className="text-white">Vercel</span> — website hosting (global CDN). Processes website requests.</li>
              <li><span className="text-white">Stripe</span> — payment processing. Receives billing details for paid plans.</li>
              <li><span className="text-white">Resend</span> — transactional email. Used to deliver API keys.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-semibold text-white">7. Your rights (UK GDPR)</h2>
            <p>You have the right to access, correct, or delete your personal data; to restrict or object to processing; and to data portability. To exercise any right, email <a href="mailto:support@registrum.co.uk" className="text-[#4F7BFF] hover:underline">support@registrum.co.uk</a>. We will respond within 30 days. You also have the right to lodge a complaint with the ICO at <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-[#4F7BFF] hover:underline">ico.org.uk</a>.</p>
          </section>

          <section>
            <h2 className="mb-3 font-semibold text-white">8. Cookies</h2>
            <p>This website does not use advertising or tracking cookies. We use only essential session cookies required for the website to function.</p>
          </section>

          <section>
            <h2 className="mb-3 font-semibold text-white">9. Changes to this policy</h2>
            <p>Material changes will be notified by email to registered users at least 14 days before taking effect.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
