import type { Metadata } from "next";
import { fetchPageContent, getMediaUrl } from "@/lib/sanity";

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchPageContent("cruise");
  const title = content?.seo?.metaTitle || (content?.title ? `${content.title} — 7th Heaven` : "7th Heaven Caribbean Cruise — Set Sail With The Band");
  const description =
    content?.seo?.metaDescription ||
    content?.heroSubheading ||
    "Join 7th Heaven on an exclusive fan cruise in the Caribbean. Limited spots available — live performances, meet & greets, and an unforgettable at-sea experience.";
  const ogImageUrl = content?.seo?.ogImage
    ? getMediaUrl(content.seo.ogImage, "/images/logos/7thheavenlogo.jpg")
    : "/images/logos/7thheavenlogo.jpg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: "https://7thheavenband.com/cruise",
      siteName: "7th Heaven",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: "7th Heaven Cruise" }],
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
