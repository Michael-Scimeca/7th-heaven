import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VERSIONS } from "../_versions/registry";
import { VersionNav } from "../_versions/shared";

export const dynamicParams = false;

export function generateStaticParams() {
  return VERSIONS.map((_, i) => ({ version: `version-${i + 1}` }));
}

function parse(version: string) {
  const m = /^version-(\d+)$/.exec(version);
  return m ? Number(m[1]) : NaN;
}

export async function generateMetadata({ params }: { params: Promise<{ version: string }> }): Promise<Metadata> {
  const { version } = await params;
  const n = parse(version);
  const v = VERSIONS[n - 1];
  return {
    title: v ? `Contact layout ${n}: ${v.title} — 7th Heaven` : "Contact layout — 7th Heaven",
    robots: { index: false, follow: false },
  };
}

export default async function ContactVersionPage({ params }: { params: Promise<{ version: string }> }) {
  const { version } = await params;
  const n = parse(version);
  const v = VERSIONS[n - 1];
  if (!v) notFound();
  const { Component } = v;
  return (
    <main id="contact-page" className="site-container page-container relative flex min-h-screen flex-col gap-24 pb-40">
      <Component />
      <VersionNav n={n} total={VERSIONS.length} title={v.title} />
    </main>
  );
}
