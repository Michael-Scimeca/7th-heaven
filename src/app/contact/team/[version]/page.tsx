import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TEAM_VERSIONS } from "../../_versions/teamRegistry";
import { TeamLayout } from "../../_versions/team";

export const dynamicParams = false;

export function generateStaticParams() {
  return TEAM_VERSIONS.map((_, i) => ({ version: `version-${i + 1}` }));
}

function parse(v: string) {
  const m = /^version-(\d+)$/.exec(v);
  return m ? Number(m[1]) : NaN;
}

export async function generateMetadata({ params }: { params: Promise<{ version: string }> }): Promise<Metadata> {
  const { version } = await params;
  const n = parse(version);
  const v = TEAM_VERSIONS[n - 1];
  return { title: v ? `Team layout ${n}: ${v.title} — 7th Heaven` : "Team layout", robots: { index: false, follow: false } };
}

export default async function TeamVersionPage({ params }: { params: Promise<{ version: string }> }) {
  const { version } = await params;
  const n = parse(version);
  const cfg = TEAM_VERSIONS[n - 1];
  if (!cfg) notFound();
  const total = TEAM_VERSIONS.length;
  const prev = n > 1 ? n - 1 : total;
  const next = n < total ? n + 1 : 1;
  return (
    <main id="contact-page" className="site-container page-container relative flex min-h-screen flex-col gap-24 pb-40">
      <TeamLayout cfg={cfg} />
      <nav aria-label="Team layout versions" className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 whitespace-nowrap rounded-full bg-black/75 px-5 py-2 text-sm text-white backdrop-blur">
        <Link href={`/contact/team/version-${prev}`} className="transition-colors hover:text-action">← {prev}</Link>
        <Link href="/contact/team" className="transition-colors hover:text-action">{n}/{total} · {cfg.title}</Link>
        <Link href={`/contact/team/version-${next}`} className="transition-colors hover:text-action">{next} →</Link>
      </nav>
    </main>
  );
}
