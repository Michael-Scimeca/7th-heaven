import Link from "next/link";

export default function NotFound() {
  return (
    <main className="site-container relative flex min-h-screen items-center justify-center overflow-hidden bg-[rgb(10,10,15)]">
      {/* Background ambient */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-[var(--color-accent)] opacity-[0.04] blur-3xl" />

      <div className="relative z-10 max-w-lg text-center">
        {/* Glitch 404 number */}
        <div className="relative mb-8">
          <h1
            className="er text-6xl text-transparent select-none"
            style={{
              WebkitTextStroke: "2px rgba(255,10,61,0.3)",
            }}
          >
            404
          </h1>
          <h1
            className="er absolute inset-0 animate-pulse text-6xl select-none"
            style={{ opacity: 0.15 }}
          >
            404
          </h1>
        </div>

        <h2 className="mb-3">
          Page Not <span className="text-[var(--color-accent)]">Found</span>
        </h2>

        <p className="mx-auto mb-10 max-w-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3.5 hover:brightness-110"
          >
            Back to Home
          </Link>
          <Link
            href="/#tour"
            className="border border-white/10 px-8 py-3.5 text-white/50 hover:border-white/30 hover:text-white"
          >
            View Tour Dates
          </Link>
        </div>

        <p className="6">7th Heaven — Lost in the mix</p>
      </div>
    </main>
  );
}
