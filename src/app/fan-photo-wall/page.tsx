import type { Metadata } from "next";
import { fetchPageContent } from "@/lib/sanity";
import { getApprovedFanPhotos } from "@/lib/fanPhotos";
import FanPhotoWallClient from "./FanPhotoWallClient";

export async function generateMetadata(): Promise<Metadata> {
  const sanityContent = await fetchPageContent("fan-photo-wall");
  const title =
    sanityContent?.seo?.metaTitle ||
    "Fan Photo & Concert Gallery Wall | 7th Heaven Band";
  const description =
    sanityContent?.seo?.metaDescription ||
    "Explore community concert photos and memories shared by 7th Heaven fans at live shows, festivals, and cruises.";
  const canonicalUrl = "https://7thheavenband.com/fan-photo-wall";

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
          alt: "7th Heaven Fan Photo Wall",
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

export default async function FansPage() {
  const [sanityContent, initialPhotos] = await Promise.all([
    fetchPageContent("fan-photo-wall"),
    getApprovedFanPhotos(),
  ]);

  return (
    <FanPhotoWallClient
      sanityContent={sanityContent}
      initialPhotos={initialPhotos}
    />
  );
}
