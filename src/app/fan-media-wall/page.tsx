import type { Metadata } from "next";
import { fetchPageContent } from "@/lib/sanity";
import FanPhotoWallClient from "../fan-photo-wall/FanPhotoWallClient";

export const metadata: Metadata = {
  title: "Fan Media Wall — 7th Heaven",
  description: "Share your best memories, stage captures, and live concert moments from 7th Heaven shows on the Fan Media Wall.",
};

export const revalidate = 60;

export default async function FanMediaWallPage() {
  const sanityContent = await fetchPageContent("fan-media-wall");

  return <FanPhotoWallClient sanityContent={sanityContent} />;
}
