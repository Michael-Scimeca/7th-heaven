import type { Metadata } from "next";
import { fetchPageContent } from "@/lib/sanity";
import RockNRollKidsClient from "./RockNRollKidsClient";

export const metadata: Metadata = {
  title: "Rock 'n' Roll Kids — 7th Heaven",
  description: "7th Heaven & the Rock 'n' Roll Kids animated series, comic books, media and original music.",
};

export const revalidate = 60;

export default async function RockNRollKidsPage() {
  const sanityContent = await fetchPageContent("rock-and-roll-kids");

  return <RockNRollKidsClient sanityContent={sanityContent} />;
}
