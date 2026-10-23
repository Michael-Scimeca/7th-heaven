import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ALERT_VERSIONS } from "../_v/registry";

export const dynamicParams = false;
export function generateStaticParams() {
  return ALERT_VERSIONS.map((_, i) => ({ version: `version-${i + 1}` }));
}
const parse = (v: string) => Number(/^version-(\d+)$/.exec(v)?.[1] ?? NaN);

export async function generateMetadata({ params }: { params: Promise<{ version: string }> }): Promise<Metadata> {
  const n = parse((await params).version);
  return { title: `Alerts layout ${n}: ${ALERT_VERSIONS[n - 1]?.title ?? ""} — 7th Heaven`, robots: { index: false, follow: false } };
}

export default async function AlertsVersionPage({ params }: { params: Promise<{ version: string }> }) {
  const n = parse((await params).version);
  const v = ALERT_VERSIONS[n - 1];
  if (!v) notFound();
  const total = ALERT_VERSIONS.length;
  const prev = n > 1 ? n - 1 : total;
  const next = n < total ? n + 1 : 1;
  const { Component } = v;
  return (
    <main className="site-container page-container relative flex min-h-screen flex-col gap-16 pb-40">
      <Component />
      <nav aria-label="Alert layout versions" className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 whitespace-nowrap rounded-full bg-black/75 px-5 py-2 text-sm text-white backdrop-blur">
        <Link href={`/alerts-layouts/version-${prev}`} className="transition-colors hover:text-action">← {prev}</Link>
        <Link href="/alerts-layouts" className="transition-colors hover:text-action">{n}/{total} · {v.title}</Link>
        <Link href={`/alerts-layouts/version-${next}`} className="transition-colors hover:text-action">{next} →</Link>
      </nav>
    </main>
  );
}
