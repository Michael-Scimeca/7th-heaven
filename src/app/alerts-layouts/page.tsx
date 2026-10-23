import type { Metadata } from "next";
import Link from "next/link";
import { ALERT_VERSIONS } from "./_v/registry";

export const metadata: Metadata = { title: "Show alert layouts — 7th Heaven", robots: { index: false, follow: false } };

export default function AlertsLayoutsIndex() {
  return (
    <main className="site-container page-container flex min-h-screen flex-col gap-16 pb-32">
      <header className="flex max-w-3xl flex-col gap-4">
        <p className="text-sm uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]">Proximity & show alert filters</p>
        <h1 className="text-white">20 layouts to pick from</h1>
        <p className="max-w-[60ch] text-[color:var(--color-text-secondary)]">Same fields and choices, different ways to fill them in. Everything is clickable; saving is simulated on these previews.</p>
      </header>
      <ol className="grid gap-x-16 gap-y-10 md:grid-cols-2">
        {ALERT_VERSIONS.map((v, i) => (
          <li key={v.title}>
            <Link href={`/alerts-layouts/version-${i + 1}`} className="group grid grid-cols-[3rem_1fr] gap-4">
              <span className="pt-1 tabular-nums text-[color:var(--color-text-muted)]">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex flex-col gap-1">
                <span className="text-xl font-semibold text-white transition-colors group-hover:text-action">{v.title}</span>
                <span className="text-[color:var(--color-text-muted)]">{v.idea}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
