import type { Metadata } from "next";
import { fetchPageContent } from "@/lib/sanity";

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchPageContent("live");
  const title = content?.seo?.metaTitle || (content?.title ? `${content.title} — 7th Heaven` : "Live Stream Hub — 7th Heaven");
  const description = content?.seo?.metaDescription || content?.heroSubheading || "Watch 7th Heaven crew members broadcast live from backstage, rehearsals, and shows. Real-time video feeds powered by LiveKit.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: "https://7thheavenband.com/live",
    },
  };
}

export default function LiveLayout({ children }: { children: React.ReactNode }) {
  return children;
}
