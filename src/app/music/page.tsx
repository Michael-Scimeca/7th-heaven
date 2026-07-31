import type { Metadata } from "next";
import AudioPlayerSection from "@/components/AudioPlayer";

export const metadata: Metadata = {
  title: "Music — 7th Heaven | 700+ Original Songs",
  description:
    "Listen to 7th Heaven's catalog of 700+ original songs spanning 40+ years. Stream albums, view lyrics, and buy CDs.",
};

export default function MusicPage() {
  return (
    <main className="pt-[88px] h-screen w-full bg-[#f5f8ff] overflow-hidden flex flex-col pt-8">
      <AudioPlayerSection />
    </main>
  );
}
