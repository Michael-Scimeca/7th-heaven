import type { Metadata } from "next";
import { fetchPageContent } from "@/lib/sanity";
import MediaClient from "./MediaClient";

export async function generateMetadata(): Promise<Metadata> {
  const sanityContent = await fetchPageContent("media");
  const title =
    sanityContent?.seo?.metaTitle ||
    "7th Heaven Media Vault | Photos, Music Videos & Discography";
  const description =
    sanityContent?.seo?.metaDescription ||
    "Explore 40 years of 7th Heaven media: live concert photos, official music videos, Billboard charting singles, audio jukebox tracks, and press highlights.";
  const canonicalUrl = "https://7thheavenband.com/media";

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
          alt: "7th Heaven Media Vault",
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

export default async function MediaPage() {
  const sanityContent = await fetchPageContent("media");

  return <MediaClient sanityContent={sanityContent} />;
}
