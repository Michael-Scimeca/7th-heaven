import type { Metadata } from "next";
import { fetchPageContent } from "@/lib/sanity";
import { getApprovedFanPhotos } from "@/lib/fanPhotos";
import FanPhotoWallClient from "../fan-photo-wall/FanPhotoWallClient";

export async function generateMetadata(): Promise<Metadata> {
  const sanityContent = await fetchPageContent("fan-media-wall");
  const title =
    sanityContent?.seo?.metaTitle ||
    "Fan Media Wall | Concert Videos & Fan Memories — 7th Heaven";
  const description =
    sanityContent?.seo?.metaDescription ||
    "Watch fan-submitted concert clips, backstage photos, and live performance highlights on the 7th Heaven Fan Media Wall.";
  const canonicalUrl = "https://7thheavenband.com/fan-media-wall";

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
          alt: "7th Heaven Fan Media Wall",
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

export default async function FanMediaWallPage() {
  const [sanityContent, initialPhotos] = await Promise.all([
    fetchPageContent("fan-media-wall"),
    getApprovedFanPhotos(),
  ]);

  return (
    <FanPhotoWallClient
      sanityContent={sanityContent}
      initialPhotos={initialPhotos}
    />
  );
}
