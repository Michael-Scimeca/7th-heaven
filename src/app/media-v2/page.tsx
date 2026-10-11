import type { Metadata } from "next";
import { fetchPageContent } from "@/lib/sanity";
import MediaV2Client from "./MediaV2Client";

export async function generateMetadata(): Promise<Metadata> {
  const sanityContent = await fetchPageContent("media");
  const title =
    sanityContent?.seo?.metaTitle ||
    "7th Heaven Media Archive — Made By Yellow Layout";
  const description =
    sanityContent?.seo?.metaDescription ||
    "Experience 7th Heaven's official media archive featuring music videos, festival concerts, and live footage in a curated House of Yellow inspired editorial layout.";
  const canonicalUrl = "https://7thheavenband.com/media-v2";

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
          alt: "7th Heaven Media Archive",
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

export default async function MediaV2Page() {
  const sanityContent = await fetchPageContent("media");

  return <MediaV2Client sanityContent={sanityContent} />;
}
