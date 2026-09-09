import type { Metadata } from "next";
import { fetchPageContent } from "@/lib/sanity";
import FaqClient from "./FaqClient";

export const metadata: Metadata = {
  title: "FAQ — 7th Heaven",
  description: "Frequently asked questions about 7th Heaven shows, booking, merchandise, fan perks, and cruise.",
};

export const revalidate = 60;

export default async function FAQPage() {
  const sanityContent = await fetchPageContent("faq");

  return <FaqClient sanityContent={sanityContent} />;
}
