import type { Metadata } from "next";
import pastShowsData from "@/data/past-shows.json";
import { fetchPageContent } from "@/lib/sanity";
import PastShowsClient from "@/components/PastShowsClient";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchPageContent("past-shows");
  const title =
    content?.seo?.metaTitle ||
    (content?.title
      ? `${content.title} | 7th Heaven`
      : "7th Heaven Concert Archive | Past Shows & Live Performances (1985–Present)");
  const description =
    content?.seo?.metaDescription ||
    content?.heroSubheading ||
    "Explore 7th Heaven's historical concert archive containing over 1,200 past shows, festival appearances, and live performances across the US since 1985.";
  const canonicalUrl = "https://7thheavenband.com/shows/past";

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
          alt: "7th Heaven Concert Archive",
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

export default async function PastShowsPage() {
  const sanityContent = await fetchPageContent("past-shows");
  return (
    <main
      className="site-container page-container page-stack min-h-screen"
      id="past-shows-page"
    >
      <PastShowsClient
        years={pastShowsData.years}
        totalShowsCount={pastShowsData.totalShows}
        sanityContent={sanityContent}
      />
    </main>
  );
}
