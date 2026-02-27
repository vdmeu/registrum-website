export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#060D1B] px-6 font-[family-name:var(--font-geist-sans)] text-center">
      <div className="font-[family-name:var(--font-geist-mono)] text-6xl font-bold text-white/[0.06]">404</div>
      <h1 className="mt-4 text-xl font-semibold text-white">Page not found</h1>
      <p className="mt-2 text-sm text-[#7A8FAD]">This page doesn&apos;t exist. The API docs are at a different address.</p>
      <div className="mt-8 flex gap-3">
        <a href="/" className="rounded-md bg-[#4F7BFF] px-4 py-2 text-sm font-medium text-white hover:bg-[#6B93FF]">
          Go home
        </a>
        <a href="https://api.registrum.co.uk/docs" target="_blank" rel="noopener noreferrer"
          className="rounded-md border border-white/10 px-4 py-2 text-sm text-[#E8F0FE] hover:bg-white/5">
          API docs
        </a>
      </div>
    </div>
  );
}
