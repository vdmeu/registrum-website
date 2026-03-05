import Link from "next/link";

export const metadata = { title: "Payment cancelled — Registrum" };

export default function CheckoutCancel() {
  return (
    <div className="min-h-screen bg-[#060D1B] text-[#E8F0FE] flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold text-white mb-3">No problem</h1>
        <p className="text-[#7A8FAD] mb-8">
          You&apos;re still on the free plan — 50 calls/month, all endpoints, no expiry.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/#pricing"
            className="rounded-md bg-[#4F7BFF] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#6B93FF] transition-colors"
          >
            View pricing
          </Link>
          <Link
            href="/"
            className="rounded-md border border-white/10 px-6 py-2.5 text-sm font-medium text-[#E8F0FE] hover:border-white/20 hover:bg-white/5 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
