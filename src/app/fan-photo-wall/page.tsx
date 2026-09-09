import type { Metadata } from "next";
import { fetchPageContent } from "@/lib/sanity";
import FanPhotoWallClient from "./FanPhotoWallClient";

export const metadata: Metadata = {
  title: "Fan Photo & Video Wall — 7th Heaven",
  description: "Share your best memories, stage captures, and live concert moments from 7th Heaven shows.",
};

export const revalidate = 60;

export default async function FansPage() {
  const sanityContent = await fetchPageContent("fan-photo-wall");

  return <FanPhotoWallClient sanityContent={sanityContent} />;
}




