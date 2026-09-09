import type { Metadata } from "next";
import pastShowsData from "@/data/past-shows.json";
import { fetchPageContent } from "@/lib/sanity";
import PastShowsClient from "@/components/PastShowsClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Past Shows & Concert Archive (1985–Present) | 7th Heaven",
  description: "Explore 7th Heaven's historical performance archive containing over 1,200 past concerts, festivals, casinos, and events played since 1985.",
};

export default async function PastShowsPage() {
  const sanityContent = await fetchPageContent("past-shows");
  return (
    <section className="site-container min-h-screen pt-[100px]">
      <PastShowsClient
        years={pastShowsData.years}
        totalShowsCount={pastShowsData.totalShows}
        sanityContent={sanityContent}
      />
    </section>
  );
}

