import type { Metadata } from "next";
import { fetchPageContent } from "@/lib/sanity";
import { getApprovedFanPhotos } from "@/lib/fanPhotos";
import MediaClient from "./MediaClient";

export async function generateMetadata(): Promise<Metadata> {
  const sanityContent = await fetchPageContent("media");
  const title =
    sanityContent?.seo?.metaTitle ||
    "7th Heaven Media Vault & Fan Media Wall | Videos, Music & Live Fan Moments";
  const description =
    sanityContent?.seo?.metaDescription ||
    "Explore 40 years of 7th Heaven media: live concert photos, official music videos, Billboard charting singles, audio jukebox tracks, and fan-submitted concert memories.";
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
          url: "https://7thheavenband.com/opengraph-image",
          width: 1200,
          height: 630,
          alt: "7th Heaven Media Vault & Fan Media Wall",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@7thheavenband",
      title,
      description,
      images: ["https://7thheavenband.com/opengraph-image"],
    },
  };
}

export const revalidate = 60;

export default async function MediaPage() {
  const [sanityContent, fanPageContent, initialFanPhotos] = await Promise.all([
    fetchPageContent("media"),
    fetchPageContent("fan-media-wall"),
    getApprovedFanPhotos(),
  ]);

  return (
    <MediaClient
      sanityContent={sanityContent}
      fanSanityContent={fanPageContent}
      initialFanPhotos={initialFanPhotos}
    />
  );
}
