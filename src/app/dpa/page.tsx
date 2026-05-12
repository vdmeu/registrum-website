import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "Data Processing Agreement · Registrum",
  description: "Data Processing Agreement for the Registrum Companies House API.",
};

const EFFECTIVE_DATE = "1 March 2026";

export default function Dpa() {
  return (
    <div className="min-h-screen bg-[#060D1B] text-[#E8F0FE] font-[family-name:var(--font-geist-sans)]">
      <SiteNav maxWidth="6xl" />

      <main className="mx-auto max-w-2xl px-6 py-20">
        <div className="mb-12">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Data Processing Agreement
          </h1>
          <p className="mt-3 text-sm text-[#3D5275]">Effective {EFFECTIVE_DATE}</p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-[#7A8FAD]">
          <p>
            This Data Processing Agreement (&ldquo;DPA&rdquo;) is between Eugene Merwe-Chartier
            trading as Registrum (&ldquo;Processor&rdquo;) and you, the customer
            (&ldquo;Controller&rdquo;). It supplements our{" "}
            <Link href="/terms" className="text-[#4F7BFF] hover:underline">Terms of Service</Link>{" "}
            and applies where you use the Registrum API to process personal data as defined under
            UK GDPR.
          </p>

          <section>
            <h2 className="mb-3 font-semibold text-white">1. Subject matter and scope</h2>
            <p>
              Registrum provides an API that retrieves UK company data from Companies House and
              returns it in structured JSON format. In the course of providing this service,
              Registrum may process personal data relating to company directors, officers, and
              persons with significant control (PSC) that appears on the public Companies House
              register. This data is sourced under the Open Government Licence v3.0 and is
              already publicly available.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-semibold text-white">2. Nature and purpose of processing</h2>
            <ul className="ml-4 list-disc space-y-1">
              <li>Retrieving and caching company records from the Companies House API</li>
              <li>Parsing iXBRL financial filings to extract structured financial data</li>
              <li>Traversing director appointment records to build network maps</li>
              <li>Returning this data to you via the Registrum API</li>
            </ul>
            <p className="mt-3">
              The purpose is to enable you (the Controller) to integrate UK corporate data into
              your own products and services.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-semibold text-white">3. Types of personal data</h2>
            <p>The data may include:</p>
            <ul className="ml-4 list-disc space-y-1 mt-2">
              <li>Director names and appointment dates</li>
              <li>PSC names, nationality, and country of residence</li>
              <li>Registered addresses (where applicable to individuals)</li>
            </ul>
            <p className="mt-3">
              This data is sourced directly from the public Companies House register. Registrum
              does not enrich, augment, or combine it with data from other sources.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-semibold text-white">4. Processor obligations</h2>
            <p>Registrum agrees to:</p>
            <ul className="ml-4 list-disc space-y-1 mt-2">
              <li>Process personal data only on your documented instructions</li>
              <li>Ensure all personnel with access to the data are bound by confidentiality</li>
              <li>Implement appropriate technical and organisational security measures</li>
              <li>Not engage sub-processors without informing you in advance</li>
              <li>Assist you in responding to data subject rights requests where feasible</li>
              <li>Delete or return personal data upon termination of the service</li>
              <li>Make available information necessary to demonstrate compliance with UK GDPR</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-semibold text-white">5. Sub-processors</h2>
            <p>Registrum uses the following sub-processors:</p>
            <div className="mt-3 overflow-x-auto rounded-lg border border-white/[0.06]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                    <th className="px-4 py-3 font-medium text-white">Sub-processor</th>
                    <th className="px-4 py-3 font-medium text-white">Purpose</th>
                    <th className="px-4 py-3 font-medium text-white">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {[
                    ["Supabase", "Database (API keys, usage logs)", "EU (Ireland)"],
                    ["Railway", "API hosting", "EU (Frankfurt)"],
                    ["Vercel", "Website hosting", "Global CDN"],
                    ["Stripe", "Payment processing", "EU / US"],
                    ["Resend", "Transactional email", "EU"],
                  ].map(([name, purpose, location]) => (
                    <tr key={name}>
                      <td className="px-4 py-3 text-white">{name}</td>
                      <td className="px-4 py-3">{purpose}</td>
                      <td className="px-4 py-3">{location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-semibold text-white">6. Security measures</h2>
            <ul className="ml-4 list-disc space-y-1">
              <li>All API keys stored as bcrypt hashes — never in plaintext</li>
              <li>All data in transit encrypted via TLS 1.2+</li>
              <li>Access to production infrastructure restricted to authorised personnel</li>
              <li>Usage logs retained for 12 months then deleted</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-semibold text-white">7. Data breaches</h2>
            <p>
              In the event of a personal data breach affecting your data, Registrum will notify
              you without undue delay (and within 72 hours where feasible) with sufficient
              information to allow you to comply with your own notification obligations under
              UK GDPR.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-semibold text-white">8. Governing law</h2>
            <p>
              This DPA is governed by the laws of England and Wales and subject to the jurisdiction
              of the courts of England and Wales.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-semibold text-white">Contact</h2>
            <p>
              DPA queries:{" "}
              <a href="mailto:support@registrum.co.uk" className="text-[#4F7BFF] hover:underline">
                support@registrum.co.uk
              </a>
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/[0.06] px-6 py-8">
        <div className="mx-auto max-w-2xl flex items-center justify-between text-xs text-[#3D5275]">
          <span>© {new Date().getFullYear()} Registrum</span>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/dpa" className="hover:text-white">DPA</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
