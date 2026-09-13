import type { Metadata } from "next";
import { fetchPageContent } from "@/lib/sanity";

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchPageContent("fan-media-wall");
  const title = content?.seo?.metaTitle || (content?.title ? `${content.title} — 7th Heaven` : "Fan Media Wall — 7th Heaven");
  const description =
    content?.seo?.metaDescription ||
    content?.heroSubheading ||
    "Browse fan-submitted photos and videos from 7th Heaven concerts, meet-and-greets, and live events on the Fan Media Wall.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: "https://7thheavenband.com/fan-media-wall",
    },
  };
}

export default function FanMediaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
