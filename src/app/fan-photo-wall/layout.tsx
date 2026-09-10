import type { Metadata } from "next";
import { fetchPageContent } from "@/lib/sanity";

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchPageContent("fan-photo-wall");
  const title = content?.seo?.metaTitle || (content?.title ? `${content.title} — 7th Heaven` : "Fan Photo Wall — 7th Heaven");
  const description =
    content?.seo?.metaDescription ||
    content?.heroSubheading ||
    "Browse fan-submitted photos from 7th Heaven concerts, meet-and-greets, and live events. Share your own concert moments!";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: "https://7thheavenband.com/fan-photo-wall",
    },
  };
}

export default function FanPhotoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
