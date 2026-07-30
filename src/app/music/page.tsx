import type { Metadata } from "next";
import AudioPlayerSection from "@/components/AudioPlayer";

export const metadata: Metadata = {
  title: "Music — 7th Heaven | 700+ Original Songs",
  description:
    "Listen to 7th Heaven's catalog of 700+ original songs spanning 40+ years. Stream albums, view lyrics, and buy CDs.",
};

export default function MusicPage() {
  return (
    <main className="min-h-[calc(100vh-72px)] pt-[72px] px-0 w-full bg-transparent">
      <AudioPlayerSection />
    </main>
  );
}
