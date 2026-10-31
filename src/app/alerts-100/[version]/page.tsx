import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VERSIONS } from "../_kit/data";
import AlertLayout from "../_kit/structures";

export const dynamicParams = false;
export function generateStaticParams() {
  return VERSIONS.map((_, i) => ({ version: `version-${i + 1}` }));
}
const parse = (v: string) => Number(/^version-(\d+)$/.exec(v)?.[1] ?? NaN);

export async function generateMetadata({ params }: { params: Promise<{ version: string }> }): Promise<Metadata> {
  const n = parse((await params).version);
  return { title: `Alerts ${n}/100: ${VERSIONS[n - 1]?.title ?? ""} — 7th Heaven`, robots: { index: false, follow: false } };
}

export default async function Alerts100Version({ params }: { params: Promise<{ version: string }> }) {
  const n = parse((await params).version);
  const v = VERSIONS[n - 1];
  if (!v) notFound();
  const total = VERSIONS.length;
  const prev = n > 1 ? n - 1 : total;
  const next = n < total ? n + 1 : 1;
  const row = Math.floor((n - 1) / 10);
  const col = (n - 1) % 10;
  const sameStyleNext = ((row + 1) % 10) * 10 + col + 1;
  return (
    <main className="site-container page-container relative flex min-h-screen flex-col gap-10 pb-40">
      <p className="text-sm uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]" data-no-text-anim>
        {String(n).padStart(3, "0")} · {v.title} — {v.idea}
      </p>
      <AlertLayout key={n} structure={v.structure} style={v.style} />
      <nav
        aria-label="Alert layout versions"
        className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 whitespace-nowrap rounded-full bg-black/75 px-5 py-2 text-sm text-white backdrop-blur"
      >
        <Link href={`/alerts-100/version-${prev}`} className="transition-colors hover:text-action">← {prev}</Link>
        <Link href="/alerts-100" className="transition-colors hover:text-action">{n}/{total}</Link>
        <Link href={`/alerts-100/version-${next}`} className="transition-colors hover:text-action">{next} →</Link>
        <Link href={`/alerts-100/version-${sameStyleNext}`} className="text-white/60 transition-colors hover:text-action" title="Same control style, next structure">
          ↓ {sameStyleNext}
        </Link>
      </nav>
    </main>
  );
}
