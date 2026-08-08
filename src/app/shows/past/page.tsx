import type { Metadata } from "next";
import pastShowsData from "@/data/past-shows.json";
import PastShowsClient from "@/components/PastShowsClient";

export const metadata: Metadata = {
  title: "Past Shows & Concert Archive (1985–Present) | 7th Heaven",
  description: "Explore 7th Heaven's historical performance archive containing over 1,200 past concerts, festivals, casinos, and events played since 1985.",
};

export default function PastShowsPage() {
  return (
    <div className="min-h-screen    pt-[100px] pb-16">
      <PastShowsClient
        years={pastShowsData.years}
        totalShowsCount={pastShowsData.totalShows}
      />
    </div>
  );
}
