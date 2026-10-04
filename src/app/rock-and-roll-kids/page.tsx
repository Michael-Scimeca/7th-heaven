import type { Metadata } from "next";
import { fetchPageContent } from "@/lib/sanity";
import RockNRollKidsClient from "./RockNRollKidsClient";

export async function generateMetadata(): Promise<Metadata> {
  const sanityContent = await fetchPageContent("rock-and-roll-kids");
  const title =
    sanityContent?.seo?.metaTitle ||
    "Rock 'n' Roll Kids | Animated Series, Comic Books & Music — 7th Heaven";
  const description =
    sanityContent?.seo?.metaDescription ||
    "Discover 7th Heaven's Rock 'n' Roll Kids animated series, comic books, original soundtrack releases, and family-friendly youth music programs.";
  const canonicalUrl = "https://7thheavenband.com/rock-and-roll-kids";

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "7th Heaven",
      type: "website",
      images: [
        {
          url: "https://7thheavenband.com/images/logos/7thheavenlogo.jpg",
          width: 1200,
          height: 630,
          alt: "7th Heaven Rock 'n' Roll Kids",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@7thheavenband",
      title,
      description,
      images: ["https://7thheavenband.com/images/logos/7thheavenlogo.jpg"],
    },
  };
}

export const revalidate = 60;

export default async function RockNRollKidsPage() {
  const sanityContent = await fetchPageContent("rock-and-roll-kids");

  return <RockNRollKidsClient sanityContent={sanityContent} />;
}
