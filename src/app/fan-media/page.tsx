import type { Metadata } from "next";
import { fetchPageContent } from "@/lib/sanity";
import { getApprovedFanPhotos } from "@/lib/fanPhotos";
import FanPhotoWallClient from "@/components/FanPhotoWallClient";

export async function generateMetadata(): Promise<Metadata> {
  const sanityContent = await fetchPageContent("fan-media-wall");
  const title =
    sanityContent?.seo?.metaTitle ||
    "7th Heaven Fan Media Wall | Concert Photos, Videos & Fan Vault";
  const rawDescription =
    sanityContent?.seo?.metaDescription ||
    "Browse fan-submitted concert memories, front-row barrier videos, photo moments, and submit your own 7th Heaven concert captures.";
  const description =
    rawDescription.length > 158
      ? rawDescription.slice(0, 155).replace(/\s+\S*$/, "") + "…"
      : rawDescription;
  const canonicalUrl = "https://7thheavenband.com/fan-media";

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
          alt: "7th Heaven Fan Media Wall",
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

export default async function FanMediaPage() {
  const [sanityContent, initialFanPhotos] = await Promise.all([
    fetchPageContent("fan-media-wall"),
    getApprovedFanPhotos(),
  ]);

  return (
    <FanPhotoWallClient
      sanityContent={sanityContent}
      initialPhotos={initialFanPhotos}
      embedMode={false}
    />
  );
}
