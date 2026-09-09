import type { Metadata } from "next";
import { fetchPageContent } from "@/lib/sanity";
import CruiseClient from "./CruiseClient";

export const metadata: Metadata = {
  title: "7th Heaven Cruise 2026 — Official Caribbean Concert Cruise",
  description: "Join 7th Heaven on the annual 7-night Caribbean concert cruise with live shows, beach parties, and VIP fan perks.",
};

export const revalidate = 60;

export default async function CruisePage() {
  const sanityContent = await fetchPageContent("cruise");

  return <CruiseClient sanityContent={sanityContent} />;
}
