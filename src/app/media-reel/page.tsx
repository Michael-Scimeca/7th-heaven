import type { Metadata } from "next";
import MediaReelClient from "./MediaReelClient";

const title = "Media Reel | 7th Heaven Music Videos, Concerts & TV";
const description =
  "Browse 7th Heaven's music videos, arena concerts, medleys, TV appearances and cruise sets in one curved video reel.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://7thheavenband.com/media-reel" },
  openGraph: { title, description, url: "https://7thheavenband.com/media-reel", siteName: "7th Heaven", type: "website" },
};

export default function MediaReelPage() {
  return <MediaReelClient />;
}
