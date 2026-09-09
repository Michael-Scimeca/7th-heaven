import type { Metadata } from "next";
import { fetchPageContent } from "@/lib/sanity";
import MediaClient from "./MediaClient";

export const metadata: Metadata = {
  title: "Media Vault — 7th Heaven",
  description: "40 years of music, live performances, official music videos, and press highlights.",
};

export const revalidate = 0;

export default async function MediaPage() {
  const sanityContent = await fetchPageContent("media");

  return <MediaClient sanityContent={sanityContent} />;
}
