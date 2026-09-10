import type { Metadata } from "next";
import { fetchPageContent } from "@/lib/sanity";

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchPageContent("media");
  const title = content?.seo?.metaTitle || (content?.title ? `${content.title} — 7th Heaven` : "Media Gallery — 7th Heaven");
  const description =
    content?.seo?.metaDescription ||
    content?.heroSubheading ||
    "Watch 7th Heaven music videos, live concert footage, behind-the-scenes clips, and exclusive backstage content from 40 years of rocking.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: "https://7thheavenband.com/media",
    },
  };
}

export default function MediaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
