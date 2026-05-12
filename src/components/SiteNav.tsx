import { cookies } from "next/headers";
import Link from "next/link";
import { verifySessionCookie, SESSION_COOKIE } from "@/lib/dashboard-auth";

interface Props {
  maxWidth?: "3xl" | "5xl" | "6xl" | "7xl";
}

const widthClass: Record<string, string> = {
  "3xl": "max-w-3xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
};

export default async function SiteNav({ maxWidth = "6xl" }: Props) {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(SESSION_COOKIE)?.value;
  const email = sessionValue ? verifySessionCookie(sessionValue) : null;

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#060D1B]/80 backdrop-blur-md">
      <div className={`mx-auto flex ${widthClass[maxWidth]} items-center justify-between px-6 py-4`}>
        <Link href="/" className="text-lg font-semibold tracking-tight text-white">
          Registrum
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6">
          <Link href="/search" className="hidden text-sm text-[#7A8FAD] transition-colors hover:text-white sm:block">
            Search
          </Link>
          <a href="/#pricing" className="hidden text-sm text-[#7A8FAD] transition-colors hover:text-white sm:block">
            Pricing
          </a>
          <a
            href="https://api.registrum.co.uk/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-sm text-[#7A8FAD] transition-colors hover:text-white sm:block"
          >
            Docs
          </a>
          {email ? (
            <>
              <span className="hidden max-w-[160px] truncate text-xs text-[#3D5275] sm:block" title={email}>
                {email}
              </span>
              <Link
                href="/dashboard"
                className="rounded-md border border-white/10 px-4 py-2 text-sm font-medium text-[#E8F0FE] transition-colors hover:border-white/20 hover:bg-white/5"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="text-sm text-[#7A8FAD] transition-colors hover:text-white">
                Sign in
              </Link>
              <a
                href="/#get-key"
                className="rounded-md bg-[#4F7BFF] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6B93FF]"
              >
                Get started free
              </a>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
