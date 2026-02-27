import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Registrum",
  description: "Terms of service for the Registrum Companies House API.",
};

export default function Terms() {
  const updated = "27 February 2026";
  return (
    <div className="bg-[#060D1B] text-[#E8F0FE] font-[family-name:var(--font-geist-sans)] min-h-screen">
      <div className="mx-auto max-w-2xl px-6 py-20">
        <a href="/" className="text-sm text-[#3D5275] hover:text-white">← Back</a>
        <h1 className="mt-8 text-3xl font-semibold tracking-tight text-white">Terms of Service</h1>
        <p className="mt-2 text-sm text-[#3D5275]">Last updated: {updated}</p>

        <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-[#7A8FAD]">
          <section>
            <h2 className="mb-3 font-semibold text-white">1. Service provider</h2>
            <p>Registrum is operated by Eugene Merwe-Chartier trading as Registrum (&quot;we&quot;, &quot;us&quot;). By using the Registrum API or website you agree to these terms.</p>
          </section>

          <section>
            <h2 className="mb-3 font-semibold text-white">2. The service</h2>
            <p>Registrum provides a REST API that enriches data sourced from the UK Companies House public API, made available under the Open Government Licence v3.0. We provide caching, financial data extraction, and director network mapping on top of this public data.</p>
          </section>

          <section>
            <h2 className="mb-3 font-semibold text-white">3. API keys and accounts</h2>
            <p>Your API key is personal to you. Do not share it or embed it in client-side code accessible to others. You are responsible for all usage under your key. We may suspend keys that abuse the service or violate these terms.</p>
          </section>

          <section>
            <h2 className="mb-3 font-semibold text-white">4. Acceptable use</h2>
            <p>You may use the API for any lawful purpose. You may not: attempt to circumvent rate limits; resell raw API responses without transformation; use the service to build a competing API product; or use the data in a way that violates the Open Government Licence v3.0.</p>
          </section>

          <section>
            <h2 className="mb-3 font-semibold text-white">5. Billing and cancellation</h2>
            <p>Paid plans are billed monthly. You may cancel at any time; cancellation takes effect at the end of the current billing period. No refunds are issued for partial months. Free tier usage is not subject to billing.</p>
          </section>

          <section>
            <h2 className="mb-3 font-semibold text-white">6. Uptime and reliability</h2>
            <p>We aim for high availability but do not guarantee any specific uptime SLA on free or Starter plans. Pro and Enterprise plans include an uptime commitment communicated at the time of purchase. We are dependent on the Companies House API as an upstream source and are not liable for disruptions caused by its unavailability.</p>
          </section>

          <section>
            <h2 className="mb-3 font-semibold text-white">7. Data accuracy</h2>
            <p>Data is sourced from Companies House and is provided as-is. We parse and cache it but do not verify its accuracy. Do not rely solely on this data for regulated financial or legal decisions without independent verification.</p>
          </section>

          <section>
            <h2 className="mb-3 font-semibold text-white">8. Limitation of liability</h2>
            <p>To the maximum extent permitted by law, our liability to you is limited to the amount you paid us in the three months preceding any claim. We are not liable for indirect, consequential, or incidental losses.</p>
          </section>

          <section>
            <h2 className="mb-3 font-semibold text-white">9. Changes to these terms</h2>
            <p>We may update these terms. Material changes will be notified to registered users by email at least 14 days before taking effect. Continued use after that date constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="mb-3 font-semibold text-white">10. Governing law</h2>
            <p>These terms are governed by the laws of England and Wales. Any disputes are subject to the exclusive jurisdiction of the courts of England and Wales.</p>
          </section>

          <section>
            <h2 className="mb-3 font-semibold text-white">Contact</h2>
            <p>Questions about these terms: <a href="mailto:support@registrum.co.uk" className="text-[#4F7BFF] hover:underline">support@registrum.co.uk</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
