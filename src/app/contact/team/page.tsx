import type { Metadata } from "next";
import Link from "next/link";
import { TEAM_VERSIONS } from "../_versions/teamRegistry";

export const metadata: Metadata = { title: "Team layouts — 7th Heaven", robots: { index: false, follow: false } };

export default function TeamVersionsIndex() {
  return (
    <main className="site-container page-container flex min-h-screen flex-col gap-16 pb-32">
      <header className="flex max-w-3xl flex-col gap-4">
        <p className="text-sm uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]">Contact page · group shot + list</p>
        <h1 className="text-white">20 takes on the group shot</h1>
        <p className="max-w-[60ch] text-[color:var(--color-text-secondary)]">
          Each one changes the group arrangement, where it sits, and how the list reads. Many have spotlight: hover a name and that person steps forward.
        </p>
      </header>
      <ol className="grid gap-x-16 gap-y-10 md:grid-cols-2">
        {TEAM_VERSIONS.map((v, i) => (
          <li key={v.title}>
            <Link href={`/contact/team/version-${i + 1}`} className="group grid grid-cols-[3rem_1fr] gap-4">
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
